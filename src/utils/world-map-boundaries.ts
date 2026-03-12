/**
 * World Map Boundary Lines — Derived from existing geodata for SVG overlay rendering.
 *
 * Three levels of geographic structure:
 *   - Continental outlines (Z:0+)  — from LANDMASS_POLYGONS coastlines
 *   - Sub-regional dividers (Z:2+) — manually defined region separators
 *   - Country borders (Z:3+)       — from PREPARED_COUNTRIES polygons
 *
 * All coordinates in WGS84 lon/lat.
 */

import type { Region } from '@/types';
import { LANDMASS_POLYGONS } from './world-map-geodata';
import { PREPARED_COUNTRIES } from './world-map-borders';

// ─── Types ───

export type BoundaryLevel = 'continent' | 'sub-region' | 'country';

export interface BoundaryLine {
  id: string;
  level: BoundaryLevel;
  label?: string;
  minZoom: number;
  polyline: [number, number][];
  region?: Region;
  bbox: { lonMin: number; lonMax: number; latMin: number; latMax: number };
}

// ─── BBox helper ───

function computeBBox(coords: [number, number][]): BoundaryLine['bbox'] {
  let lonMin = Infinity, lonMax = -Infinity;
  let latMin = Infinity, latMax = -Infinity;
  for (const [lon, lat] of coords) {
    if (lon < lonMin) lonMin = lon;
    if (lon > lonMax) lonMax = lon;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
  }
  return { lonMin, lonMax, latMin, latMax };
}

// ─── Continental Outlines (derived from LANDMASS_POLYGONS) ───

const CONTINENTAL_BOUNDARIES: BoundaryLine[] = LANDMASS_POLYGONS.map((lm) => ({
  id: `continent-${lm.landmass}`,
  level: 'continent' as BoundaryLevel,
  label: lm.landmass,
  minZoom: 0,
  polyline: lm.polygon,
  region: lm.region,
  bbox: computeBBox(lm.polygon),
}));

// ─── Sub-Regional Dividing Lines (manual) ───
// These are approximate polylines separating major geographic sub-regions.

const SUB_REGIONAL_BOUNDARIES: BoundaryLine[] = [
  {
    id: 'sub-europe-mideast',
    level: 'sub-region',
    label: 'Europe / Middle East',
    minZoom: 2,
    polyline: [[26, 42], [29, 41], [32, 37], [35, 35], [36, 32], [40, 30]],
    bbox: computeBBox([[26, 42], [29, 41], [32, 37], [35, 35], [36, 32], [40, 30]]),
  },
  {
    id: 'sub-mideast-southasia',
    level: 'sub-region',
    label: 'Middle East / South Asia',
    minZoom: 2,
    polyline: [[60, 38], [62, 35], [64, 28], [66, 24], [68, 22]],
    bbox: computeBBox([[60, 38], [62, 35], [64, 28], [66, 24], [68, 22]]),
  },
  {
    id: 'sub-southasia-eastasia',
    level: 'sub-region',
    label: 'South Asia / East Asia',
    minZoom: 2,
    polyline: [[92, 28], [95, 24], [98, 18], [100, 14], [102, 10]],
    bbox: computeBBox([[92, 28], [95, 24], [98, 18], [100, 14], [102, 10]]),
  },
  {
    id: 'sub-europe-africa',
    level: 'sub-region',
    label: 'Europe / Africa',
    minZoom: 2,
    polyline: [[-6, 36], [0, 36], [10, 37], [15, 35], [25, 32], [30, 31]],
    bbox: computeBBox([[-6, 36], [0, 36], [10, 37], [15, 35], [25, 32], [30, 31]]),
  },
  {
    id: 'sub-na-sa',
    level: 'sub-region',
    label: 'N. America / S. America',
    minZoom: 2,
    polyline: [[-82, 9], [-80, 8], [-77, 8], [-75, 7], [-72, 7]],
    bbox: computeBBox([[-82, 9], [-80, 8], [-77, 8], [-75, 7], [-72, 7]]),
  },
  {
    id: 'sub-eastasia-oceania',
    level: 'sub-region',
    label: 'East Asia / Oceania',
    minZoom: 2,
    polyline: [[100, 0], [110, -5], [120, -8], [130, -10], [140, -10]],
    bbox: computeBBox([[100, 0], [110, -5], [120, -8], [130, -10], [140, -10]]),
  },
  {
    id: 'sub-russia-border',
    level: 'sub-region',
    label: 'Russia Southern Border',
    minZoom: 2,
    polyline: [[28, 46], [35, 47], [45, 42], [55, 42], [65, 45], [75, 50], [85, 50], [95, 50], [105, 50], [115, 48], [125, 45], [130, 43], [135, 45]],
    bbox: computeBBox([[28, 46], [35, 47], [45, 42], [55, 42], [65, 45], [75, 50], [85, 50], [95, 50], [105, 50], [115, 48], [125, 45], [130, 43], [135, 45]]),
  },
  {
    id: 'sub-sahara-line',
    level: 'sub-region',
    label: 'North Africa / Sub-Saharan',
    minZoom: 2,
    polyline: [[-17, 16], [-10, 16], [0, 16], [10, 14], [20, 12], [30, 10], [35, 12], [40, 10], [45, 10]],
    bbox: computeBBox([[-17, 16], [-10, 16], [0, 16], [10, 14], [20, 12], [30, 10], [35, 12], [40, 10], [45, 10]]),
  },
  {
    id: 'sub-us-canada',
    level: 'sub-region',
    label: 'US / Canada Border',
    minZoom: 2,
    polyline: [[-125, 49], [-120, 49], [-110, 49], [-100, 49], [-95, 49], [-90, 49], [-85, 46], [-83, 46], [-79, 44], [-75, 45], [-71, 42], [-67, 45]],
    bbox: computeBBox([[-125, 49], [-120, 49], [-110, 49], [-100, 49], [-95, 49], [-90, 49], [-85, 46], [-83, 46], [-79, 44], [-75, 45], [-71, 42], [-67, 45]]),
  },
  {
    id: 'sub-us-mexico',
    level: 'sub-region',
    label: 'US / Mexico Border',
    minZoom: 2,
    polyline: [[-117, 33], [-115, 32], [-112, 32], [-109, 32], [-106, 32], [-103, 29], [-100, 28], [-97, 26]],
    bbox: computeBBox([[-117, 33], [-115, 32], [-112, 32], [-109, 32], [-106, 32], [-103, 29], [-100, 28], [-97, 26]]),
  },
  {
    id: 'sub-china-india',
    level: 'sub-region',
    label: 'China / India Border',
    minZoom: 2,
    polyline: [[75, 36], [78, 35], [80, 32], [85, 28], [88, 28], [92, 28], [96, 28]],
    bbox: computeBBox([[75, 36], [78, 35], [80, 32], [85, 28], [88, 28], [92, 28], [96, 28]]),
  },
  {
    id: 'sub-horn-africa',
    level: 'sub-region',
    label: 'Horn of Africa',
    minZoom: 2,
    polyline: [[30, 10], [33, 8], [36, 5], [40, 3], [43, 2], [46, 2], [48, 5], [50, 10], [51, 12]],
    bbox: computeBBox([[30, 10], [33, 8], [36, 5], [40, 3], [43, 2], [46, 2], [48, 5], [50, 10], [51, 12]]),
  },
];

// ─── Country Borders (derived from PREPARED_COUNTRIES) ───

const COUNTRY_BOUNDARIES: BoundaryLine[] = PREPARED_COUNTRIES.map((c) => ({
  id: `country-${c.code}`,
  level: 'country' as BoundaryLevel,
  label: c.name,
  minZoom: 3,
  polyline: c.polygon,
  region: c.region,
  bbox: c.bbox,
}));

// ─── All Boundaries (combined, pre-sorted by level for rendering order) ───

export const ALL_BOUNDARIES: BoundaryLine[] = [
  ...CONTINENTAL_BOUNDARIES,
  ...SUB_REGIONAL_BOUNDARIES,
  ...COUNTRY_BOUNDARIES,
];

// ─── Viewport Filtering ───

/**
 * Get boundaries visible within given viewport bounds and zoom level.
 * Uses bbox pre-filtering for performance.
 */
export function getVisibleBoundaries(
  lonMin: number,
  lonMax: number,
  latMin: number,
  latMax: number,
  zoomLevel: number,
): BoundaryLine[] {
  return ALL_BOUNDARIES.filter((b) => {
    // Zoom filter
    if (b.minZoom > zoomLevel) return false;

    // At Z:3+, hide continental outlines (country borders take over)
    if (b.level === 'continent' && zoomLevel >= 4) return false;

    // BBox overlap test
    if (b.bbox.lonMax < lonMin || b.bbox.lonMin > lonMax) return false;
    if (b.bbox.latMax < latMin || b.bbox.latMin > latMax) return false;

    return true;
  });
}
