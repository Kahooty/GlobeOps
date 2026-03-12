/**
 * ASCII World Map — Braille dot-matrix + binary digit rendering.
 *
 * Rasterizes accurate lon/lat coastline polygons (from world-map-geodata.ts)
 * into a character grid using equirectangular projection.
 *
 * Land interiors use binary digits (0/1) for a cyberpunk terminal aesthetic.
 * Coastline edges use Unicode braille characters (U+2800–U+28FF) for
 * sub-cell resolution.
 *
 * Each braille character encodes a 2×4 dot grid (256 patterns), giving
 * an effective pixel resolution of (cols×2) × (rows×4) from cols×rows cells.
 *
 * Projection: equirectangular (Plate Carrée)
 *   lon: lonMin..lonMax  →  subCol: 0..(cols×2-1)
 *   lat: latMax..latMin  →  subRow: 0..(rows×4-1)
 *
 * Viewport support: accepts arbitrary geographic bounds for pan/zoom rendering.
 * LRU cache avoids redundant rasterization during rapid viewport changes.
 */

import { LANDMASS_POLYGONS } from './world-map-geodata';
import { PREPARED_COUNTRIES } from './world-map-borders';
import type { Region } from '@/types';

// ─── Default Grid Dimensions ───
export const ASCII_COLS = 80;
export const ASCII_ROWS = 36;

export interface AsciiMapCell {
  char: string;
  isLand: boolean;
  region: Region | null;
  /** Country ISO code (set at Z:2+ only) */
  country?: string;
  /** True if this cell sits on a country border (set at Z:2+ only) */
  isBorder?: boolean;
}

// ─── Bounding Box for fast rejection ───

interface BBox {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

interface PreparedPolygon {
  region: Region;
  polygon: [number, number][];
  bbox: BBox;
}

/** Compute bounding box for a polygon */
function computeBBox(polygon: [number, number][]): BBox {
  let lonMin = Infinity, lonMax = -Infinity;
  let latMin = Infinity, latMax = -Infinity;
  for (const [lon, lat] of polygon) {
    if (lon < lonMin) lonMin = lon;
    if (lon > lonMax) lonMax = lon;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
  }
  return { lonMin, lonMax, latMin, latMax };
}

// Prepare polygons once (bounding boxes for fast rejection)
const PREPARED_POLYGONS: PreparedPolygon[] = LANDMASS_POLYGONS.map((lm) => ({
  region: lm.region,
  polygon: lm.polygon,
  bbox: computeBBox(lm.polygon),
}));

// ─── Point-in-Polygon (ray casting) ───

/** Ray-casting point-in-polygon test using lon/lat coordinates */
function pointInPolygon(lon: number, lat: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ─── Coordinate Conversion ───

/** Convert sub-pixel coordinate to lon/lat within a viewport */
function subPixelToLonLat(
  subCol: number, subRow: number,
  subW: number, subH: number,
  lonMin: number, lonMax: number,
  latMin: number, latMax: number,
): { lon: number; lat: number } {
  const lon = lonMin + ((subCol + 0.5) / subW) * (lonMax - lonMin);
  const lat = latMax - ((subRow + 0.5) / subH) * (latMax - latMin);
  return { lon, lat };
}

/** Deterministic pseudo-random 0 or 1 from cell position */
function binaryChar(row: number, col: number): string {
  const h = ((row * 127 + col * 311 + row * col * 17) ^ 0x5f3759df) >>> 0;
  return (h % 3 === 0) ? '0' : '1';
}

// Braille dot offsets: each char cell is 2 cols × 4 rows of dots
// Dot positions map to unicode braille bits:
//  col0  col1
//  0x01  0x08   row0
//  0x02  0x10   row1
//  0x04  0x20   row2
//  0x40  0x80   row3
const BRAILLE_DOTS: number[][] = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

// ─── LRU Cache ───

interface CacheEntry {
  key: string;
  data: AsciiMapCell[][];
  lastUsed: number;
}

const LRU_MAX = 8;
const lruCache: CacheEntry[] = [];

function getCacheKey(
  cols: number, rows: number,
  lonMin: number, lonMax: number,
  latMin: number, latMax: number,
): string {
  // Snap to 2 decimal places for cache key stability during pan
  const snap = (v: number) => Math.round(v * 100) / 100;
  return `${cols}x${rows}:${snap(lonMin)},${snap(lonMax)},${snap(latMin)},${snap(latMax)}`;
}

function lruGet(key: string): AsciiMapCell[][] | null {
  const idx = lruCache.findIndex((e) => e.key === key);
  if (idx === -1) return null;
  lruCache[idx].lastUsed = Date.now();
  return lruCache[idx].data;
}

function lruPut(key: string, data: AsciiMapCell[][]): void {
  // Evict oldest if at capacity
  if (lruCache.length >= LRU_MAX) {
    let oldestIdx = 0;
    for (let i = 1; i < lruCache.length; i++) {
      if (lruCache[i].lastUsed < lruCache[oldestIdx].lastUsed) {
        oldestIdx = i;
      }
    }
    lruCache.splice(oldestIdx, 1);
  }
  lruCache.push({ key, data, lastUsed: Date.now() });
}

// ─── Rasterization ───

/**
 * Build ASCII map data for a given viewport.
 *
 * Rasterizes lon/lat coastline polygons into:
 *  - A sub-pixel boolean grid for land detection
 *  - A character grid using braille for edges, 0/1 for interiors
 *
 * @param cols    Grid width in characters (default: 80)
 * @param rows    Grid height in characters (default: 36)
 * @param lonMin  Left edge longitude (default: -180)
 * @param lonMax  Right edge longitude (default: +180)
 * @param latMin  Bottom edge latitude (default: -90)
 * @param latMax  Top edge latitude (default: +90)
 * @param zoomLevel  Current zoom level for progressive detail (default: 0)
 */
export function buildAsciiMapData(
  cols: number = ASCII_COLS,
  rows: number = ASCII_ROWS,
  lonMin: number = -180,
  lonMax: number = 180,
  latMin: number = -90,
  latMax: number = 90,
  zoomLevel: number = 0,
): AsciiMapCell[][] {
  // Check LRU cache (include zoomLevel for Z:2+ border rendering)
  const cacheKey = getCacheKey(cols, rows, lonMin, lonMax, latMin, latMax) + `:z${zoomLevel}`;
  const cached = lruGet(cacheKey);
  if (cached) return cached;

  // Sub-pixel resolution (each char cell = 2 cols × 4 rows of braille dots)
  const subW = cols * 2;
  const subH = rows * 4;

  // Pre-filter polygons: skip any whose bbox doesn't overlap the viewport
  const viewportPolygons = PREPARED_POLYGONS.filter((pp) =>
    pp.bbox.lonMax >= lonMin && pp.bbox.lonMin <= lonMax &&
    pp.bbox.latMax >= latMin && pp.bbox.latMin <= latMax
  );

  // Step 1: Rasterize at sub-pixel level — which dots are land, and what region
  const landGrid: boolean[][] = [];
  const regionGrid: (Region | null)[][] = [];

  for (let sy = 0; sy < subH; sy++) {
    landGrid[sy] = [];
    regionGrid[sy] = [];
    for (let sx = 0; sx < subW; sx++) {
      const { lon, lat } = subPixelToLonLat(sx, sy, subW, subH, lonMin, lonMax, latMin, latMax);
      let isLand = false;
      let cellRegion: Region | null = null;

      for (const pp of viewportPolygons) {
        // Fast bbox rejection
        if (lon < pp.bbox.lonMin || lon > pp.bbox.lonMax ||
            lat < pp.bbox.latMin || lat > pp.bbox.latMax) {
          continue;
        }
        if (pointInPolygon(lon, lat, pp.polygon)) {
          isLand = true;
          cellRegion = pp.region;
          break;
        }
      }

      landGrid[sy][sx] = isLand;
      regionGrid[sy][sx] = cellRegion;
    }
  }

  // Step 2: Build character grid from sub-pixel data
  const cells: AsciiMapCell[][] = [];

  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      const syBase = row * 4;
      const sxBase = col * 2;

      // Count land sub-pixels in this 2×4 cell, collect regions
      let landCount = 0;
      const totalPixels = 8; // 2×4
      let brailleCode = 0;
      let cellRegion: Region | null = null;
      const regionCounts = new Map<Region, number>();

      for (let dr = 0; dr < 4; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const sy = syBase + dr;
          const sx = sxBase + dc;
          if (sy < subH && sx < subW && landGrid[sy][sx]) {
            landCount++;
            brailleCode |= BRAILLE_DOTS[dr][dc];
            const r = regionGrid[sy][sx];
            if (r) {
              regionCounts.set(r, (regionCounts.get(r) || 0) + 1);
            }
          }
        }
      }

      // Determine dominant region for this cell
      if (regionCounts.size > 0) {
        let maxCount = 0;
        for (const [r, count] of regionCounts) {
          if (count > maxCount) {
            maxCount = count;
            cellRegion = r;
          }
        }
      }

      const isLand = landCount > 0;

      let char: string;
      if (landCount === 0) {
        // Ocean — empty
        char = ' ';
      } else if (landCount === totalPixels) {
        // Fully interior land — binary digit
        char = binaryChar(row, col);
      } else {
        // Partial cell (coastline/edge) — braille character for sub-cell detail
        char = String.fromCharCode(0x2800 + brailleCode);
      }

      cells[row][col] = { char, isLand, region: cellRegion };
    }
  }

  // Step 3: Country assignment and border detection (Z:2+ only)
  if (zoomLevel >= 2) {
    // Pre-filter countries by viewport
    const viewportCountries = PREPARED_COUNTRIES.filter((pc) =>
      pc.bbox.lonMax >= lonMin && pc.bbox.lonMin <= lonMax &&
      pc.bbox.latMax >= latMin && pc.bbox.latMin <= latMax
    );

    // Phase A: Assign country code to each land cell (center-point sampling)
    const countryCells: (string | null)[][] = [];
    for (let row = 0; row < rows; row++) {
      countryCells[row] = [];
      for (let col = 0; col < cols; col++) {
        const cell = cells[row][col];
        if (!cell.isLand) {
          countryCells[row][col] = null;
          continue;
        }
        // Sample center of character cell
        const lon = lonMin + ((col + 0.5) / cols) * (lonMax - lonMin);
        const lat = latMax - ((row + 0.5) / rows) * (latMax - latMin);
        let code: string | null = null;
        for (const pc of viewportCountries) {
          if (lon < pc.bbox.lonMin || lon > pc.bbox.lonMax ||
              lat < pc.bbox.latMin || lat > pc.bbox.latMax) {
            continue;
          }
          if (pointInPolygon(lon, lat, pc.polygon)) {
            code = pc.code;
            break;
          }
        }
        countryCells[row][col] = code;
        if (code) {
          cell.country = code;
        }
      }
    }

    // Phase B: Border detection — mark cells where adjacent land has different country
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = cells[row][col];
        if (!cell.isLand) continue;
        const myCountry = countryCells[row][col];
        // Check 4-connected neighbors
        const neighbors: [number, number][] = [
          [row - 1, col], [row + 1, col],
          [row, col - 1], [row, col + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (!cells[nr][nc].isLand) continue;
          const neighborCountry = countryCells[nr][nc];
          if (neighborCountry !== myCountry && neighborCountry !== null && myCountry !== null) {
            cell.isBorder = true;
            // Use dim dot for border cells (only override fully-interior cells)
            const isBraille = cell.char.charCodeAt(0) >= 0x2800 && cell.char.charCodeAt(0) <= 0x28FF;
            if (!isBraille) {
              cell.char = '·';
            }
            break;
          }
        }
      }
    }
  }

  // Store in LRU cache
  lruPut(cacheKey, cells);

  return cells;
}

// ─── Backward-compatible global map singleton ───
let _cachedGlobalMap: AsciiMapCell[][] | null = null;

export function getAsciiMapData(): AsciiMapCell[][] {
  if (!_cachedGlobalMap) {
    _cachedGlobalMap = buildAsciiMapData(ASCII_COLS, ASCII_ROWS, -180, 180, -90, 90);
  }
  return _cachedGlobalMap;
}
