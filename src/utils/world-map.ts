import type { Earthquake, Region } from '@/types';

// ─── ASCII World Map Data ───
// Equirectangular projection, ~80 cols × 30 rows
// Characters: ' ' = ocean, '.' = coast/shallow, letters/symbols = land
// Rows map from 90°N (top) to -60°S (bottom) — polar regions trimmed

const MAP_ROWS: string[] = [
  //  Lon: -180                                                                  +180
  '                                                                                ',
  '                 ......                                                         ',
  '              ..........::::..                     .....                         ',
  '             ...........::::::::..               .........                       ',
  '            ............::::::::::.      ...    ............                      ',
  '           ............:::::::::::.    ......  .............                      ',
  '            ...........:::::::::::..  .........:::::::::....                     ',
  '             ..........:::::::::::.. ..........:::::::::......                   ',
  '              .........:::::::::::.............::::::::::......                  ',
  '               ........::::::::::..............:::::::::::.....                  ',
  '                .......:::::::::::..   .......::::::::::::......                 ',
  '                 ......:::::::::::..    .....::::::::::::::......                ',
  '                  .....:::::::::::..     ...::::::::::::::::......   ......       ',
  '       ..          ....:::::::::::..      .::::::::::::::::::...... ........     ',
  '      ....          ...::::::::::::.     ..:::::::::::::::::::.............:..    ',
  '     ......          ..::::::::::::..   ...::::::::::::::::::::..........:::.    ',
  '      ......          .:::::::::::::.  ....::::::::::::::::::::::........::::    ',
  '       .....           :::::::::::::.  ...::::::::::::::::::::::::.....:::::.    ',
  '        ....           .::::::::::::.  ...:::::::::::::::::::::::::..::::::.     ',
  '         ...            ::::::::::::.  ..::::::::::::::::::::::::::::::::::      ',
  '          ..            .:::::::::::.  .:::::::::::::::::::::::::::::::..        ',
  '           .             ::::::::::..  ..::::::::::::::::::::::::::..            ',
  '                         .:::::::::..   .:::::::::::::::::::::..                 ',
  '                          .::::::::..    .:::::::::::::::::::                    ',
  '                           :::::::..      .::::::::::::::::                      ',
  '                           .::::::         ::::::::::::.                         ',
  '                            .::::           .::::::::.                           ',
  '                             .::             .:::::                              ',
  '                              ..              .::              ...               ',
  '                                               .             ......             ',
];

export const MAP_COLS = MAP_ROWS[0].length;
export const MAP_ROW_COUNT = MAP_ROWS.length;

// Character type classification
export function charType(ch: string): 'ocean' | 'coast' | 'land' {
  if (ch === ' ') return 'ocean';
  if (ch === '.') return 'coast';
  return 'land';
}

// ─── Coordinate Projection ───

/** Convert lon/lat to grid col/row (equirectangular) */
export function lonLatToGrid(
  lon: number,
  lat: number,
  cols: number = MAP_COLS,
  rows: number = MAP_ROW_COUNT
): [col: number, row: number] {
  // lon: -180..+180 → col: 0..cols-1
  const col = Math.round(((lon + 180) / 360) * (cols - 1));
  // lat: +90..-60 → row: 0..rows-1  (top = north)
  const latMin = -60;
  const latMax = 90;
  const row = Math.round(((latMax - lat) / (latMax - latMin)) * (rows - 1));
  return [
    Math.max(0, Math.min(cols - 1, col)),
    Math.max(0, Math.min(rows - 1, row)),
  ];
}

// ─── Region Bounding Boxes ───

interface Bounds {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

export const REGION_BOUNDS: Record<Region, Bounds> = {
  'NORTH AMERICA': { lonMin: -170, lonMax: -50, latMin: 10, latMax: 85 },
  'SOUTH AMERICA': { lonMin: -85, lonMax: -30, latMin: -60, latMax: 15 },
  'EUROPE': { lonMin: -15, lonMax: 45, latMin: 35, latMax: 75 },
  'MIDDLE EAST': { lonMin: 25, lonMax: 65, latMin: 10, latMax: 42 },
  'AFRICA': { lonMin: -20, lonMax: 55, latMin: -40, latMax: 38 },
  'SOUTH ASIA': { lonMin: 60, lonMax: 100, latMin: 5, latMax: 40 },
  'EAST ASIA': { lonMin: 95, lonMax: 150, latMin: 10, latMax: 55 },
  'OCEANIA': { lonMin: 110, lonMax: 180, latMin: -50, latMax: 0 },
};

/** Check if a grid position falls within a region */
export function isInRegion(
  col: number,
  row: number,
  region: Region
): boolean {
  const b = REGION_BOUNDS[region];
  // Reverse-project grid to lon/lat
  const lon = (col / (MAP_COLS - 1)) * 360 - 180;
  const lat = 90 - (row / (MAP_ROW_COUNT - 1)) * 150;
  return lon >= b.lonMin && lon <= b.lonMax && lat >= b.latMin && lat <= b.latMax;
}

// ─── Map Cell Rendering ───

export interface MapCell {
  char: string;
  type: 'ocean' | 'coast' | 'land' | 'quake-minor' | 'quake-moderate' | 'quake-major' | 'quake-great' | 'region-highlight';
}

/** Earthquake marker characters by severity */
const QUAKE_CHARS: Record<string, string[]> = {
  minor:    ['·', '•'],
  moderate: ['*', '✦'],
  major:    ['✶', '✸'],
  great:    ['◉', '⊛'],
};

/**
 * Build a 2D grid of MapCells with earthquake overlays and region highlighting.
 * `tick` drives blinking animation for quake markers.
 */
export function buildMapGrid(
  earthquakes: Earthquake[],
  selectedRegion: Region | null,
  tick: number
): MapCell[][] {
  const grid: MapCell[][] = [];

  // Base map
  for (let r = 0; r < MAP_ROW_COUNT; r++) {
    const row: MapCell[] = [];
    const line = MAP_ROWS[r] || '';
    for (let c = 0; c < MAP_COLS; c++) {
      const ch = c < line.length ? line[c] : ' ';
      const ct = charType(ch);
      let type: MapCell['type'] = ct;

      // Region highlighting
      if (selectedRegion && ct !== 'ocean' && isInRegion(c, r, selectedRegion)) {
        type = 'region-highlight';
      }

      row.push({ char: ch, type });
    }
    grid.push(row);
  }

  // Plot earthquakes
  for (const eq of earthquakes) {
    const [lon, lat] = eq.coordinates;
    const [col, row] = lonLatToGrid(lon, lat);
    if (row >= 0 && row < MAP_ROW_COUNT && col >= 0 && col < MAP_COLS) {
      const chars = QUAKE_CHARS[eq.severity] || QUAKE_CHARS.minor;
      const blinkIdx = tick % 2;

      // Recent quakes (< 1 hour) blink
      const isRecent = Date.now() - eq.time.getTime() < 3600_000;
      const showMarker = !isRecent || blinkIdx === 0;

      if (showMarker) {
        grid[row][col] = {
          char: chars[blinkIdx % chars.length],
          type: `quake-${eq.severity}` as MapCell['type'],
        };
      }
    }
  }

  // Scan line effect — a dim horizontal line that sweeps down the map
  const scanRow = tick % MAP_ROW_COUNT;
  for (let c = 0; c < MAP_COLS; c++) {
    const cell = grid[scanRow][c];
    if (cell.type === 'ocean') {
      grid[scanRow][c] = { char: '─', type: 'ocean' };
    }
  }

  return grid;
}

/** Get CSS class for a MapCell type */
export function cellClass(type: MapCell['type']): string {
  switch (type) {
    case 'ocean':
      return 'text-terminal-primary/10';
    case 'coast':
      return 'text-terminal-primary/30';
    case 'land':
      return 'text-terminal-primary-dim';
    case 'region-highlight':
      return 'text-terminal-primary text-glow';
    case 'quake-minor':
      return 'text-terminal-amber';
    case 'quake-moderate':
      return 'text-terminal-amber text-glow';
    case 'quake-major':
      return 'text-terminal-red text-glow';
    case 'quake-great':
      return 'text-terminal-red text-glow animate-pulse';
    default:
      return 'text-terminal-primary-dim';
  }
}
