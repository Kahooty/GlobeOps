/**
 * Maritime Trade Routes — Static dataset for map overlay.
 *
 * Major shipping lanes and strategic waterways rendered as polylines.
 * Each route is an array of [lon, lat] waypoints approximating the route.
 * Sources: IMO shipping data, UNCTAD Maritime Transport Review (public domain).
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface TradeRoute {
  id: string;
  name: string;
  waypoints: [lon: number, lat: number][];
  region: Region;
  type: 'container' | 'oil-tanker' | 'bulk' | 'lng';
  volume: 'high' | 'medium' | 'low';
  minZoom: number;
}

export const TRADE_ROUTES: TradeRoute[] = [
  // ═══════════════════════════════════════════════════════════
  // ASIA-EUROPE (Suez Route) — Highest volume
  // ═══════════════════════════════════════════════════════════
  {
    id: 'asia-europe-suez',
    name: 'Asia-Europe (Suez)',
    waypoints: [
      [104, 1], [95, 5], [80, 8], [72, 12], [60, 15], [50, 18],
      [43, 14], [33, 30], [32, 31], [28, 35], [15, 38], [5, 36],
      [-5, 36], [-10, 44], [-5, 48], [0, 51],
    ],
    region: 'EAST ASIA', type: 'container', volume: 'high', minZoom: 2,
  },

  // ═══════════════════════════════════════════════════════════
  // TRANS-PACIFIC
  // ═══════════════════════════════════════════════════════════
  {
    id: 'transpacific-north',
    name: 'Trans-Pacific (N. Route)',
    waypoints: [
      [121, 31], [130, 35], [140, 38], [155, 42], [170, 45],
      [-175, 47], [-160, 46], [-145, 44], [-130, 40], [-122, 37],
    ],
    region: 'EAST ASIA', type: 'container', volume: 'high', minZoom: 2,
  },
  {
    id: 'transpacific-south',
    name: 'Trans-Pacific (S. Route)',
    waypoints: [
      [114, 22], [120, 18], [130, 15], [150, 10], [170, 5],
      [-175, 0], [-160, -5], [-140, -10], [-120, -15], [-90, -10],
      [-80, -5], [-80, 9],
    ],
    region: 'EAST ASIA', type: 'container', volume: 'medium', minZoom: 3,
  },

  // ═══════════════════════════════════════════════════════════
  // PERSIAN GULF OIL ROUTES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gulf-asia',
    name: 'Persian Gulf → Asia',
    waypoints: [
      [52, 26], [57, 24], [60, 20], [65, 15], [72, 10],
      [80, 8], [95, 5], [104, 1], [110, 5], [115, 10],
    ],
    region: 'MIDDLE EAST', type: 'oil-tanker', volume: 'high', minZoom: 2,
  },
  {
    id: 'gulf-europe',
    name: 'Persian Gulf → Europe',
    waypoints: [
      [52, 26], [57, 24], [55, 18], [48, 14],
      [43, 12], [35, 15], [33, 30], [15, 38], [0, 50],
    ],
    region: 'MIDDLE EAST', type: 'oil-tanker', volume: 'high', minZoom: 3,
  },

  // ═══════════════════════════════════════════════════════════
  // ATLANTIC ROUTES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'transatlantic-north',
    name: 'Trans-Atlantic (N. Route)',
    waypoints: [
      [-74, 40], [-60, 42], [-45, 46], [-30, 48],
      [-15, 50], [-5, 50], [0, 51],
    ],
    region: 'NORTH AMERICA', type: 'container', volume: 'high', minZoom: 2,
  },
  {
    id: 'us-gulf-europe',
    name: 'US Gulf → Europe (LNG)',
    waypoints: [
      [-90, 29], [-85, 27], [-80, 26], [-70, 30],
      [-50, 38], [-30, 42], [-10, 45], [0, 48],
    ],
    region: 'NORTH AMERICA', type: 'lng', volume: 'medium', minZoom: 3,
  },
  {
    id: 'west-africa-asia',
    name: 'W. Africa → Asia (Oil)',
    waypoints: [
      [3, 4], [10, -5], [20, -15], [30, -25],
      [40, -20], [55, -10], [70, 0], [80, 8], [100, 2],
    ],
    region: 'AFRICA', type: 'oil-tanker', volume: 'medium', minZoom: 3,
  },

  // ═══════════════════════════════════════════════════════════
  // SOUTH AMERICA
  // ═══════════════════════════════════════════════════════════
  {
    id: 'south-america-asia',
    name: 'S. America → Asia (Bulk)',
    waypoints: [
      [-43, -23], [-35, -25], [-20, -30], [0, -35],
      [20, -38], [40, -35], [60, -30], [80, -20],
      [95, -5], [104, 1],
    ],
    region: 'SOUTH AMERICA', type: 'bulk', volume: 'medium', minZoom: 3,
  },
  {
    id: 'panama-route',
    name: 'Panama Canal Route',
    waypoints: [
      [-80, 9], [-85, 15], [-90, 20], [-95, 25], [-90, 29],
    ],
    region: 'NORTH AMERICA', type: 'container', volume: 'high', minZoom: 3,
  },

  // ═══════════════════════════════════════════════════════════
  // ARCTIC & NORTHERN
  // ═══════════════════════════════════════════════════════════
  {
    id: 'northern-sea-route',
    name: 'Northern Sea Route',
    waypoints: [
      [30, 70], [50, 73], [80, 75], [110, 74],
      [140, 72], [160, 68], [170, 65],
    ],
    region: 'EUROPE', type: 'container', volume: 'low', minZoom: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // INTRA-ASIA
  // ═══════════════════════════════════════════════════════════
  {
    id: 'japan-china-korea',
    name: 'Japan-China-Korea Loop',
    waypoints: [
      [140, 35], [130, 33], [124, 30], [121, 31],
      [118, 28], [115, 22], [110, 15], [105, 10],
    ],
    region: 'EAST ASIA', type: 'container', volume: 'high', minZoom: 3,
  },
  {
    id: 'australia-asia',
    name: 'Australia → Asia (LNG/Bulk)',
    waypoints: [
      [115, -20], [110, -10], [105, -5], [104, 1],
      [106, 5], [110, 10],
    ],
    region: 'OCEANIA', type: 'lng', volume: 'medium', minZoom: 4,
  },
];

// ═══════════════════════════════════════════════════════════
// STRATEGIC WATERWAYS (point markers with throughput data)
// ═══════════════════════════════════════════════════════════

export interface StrategicWaterway {
  id: string;
  name: string;
  coordinates: [lon: number, lat: number];
  region: Region;
  throughputDesc: string;
  minZoom: number;
}

export const STRATEGIC_WATERWAYS: StrategicWaterway[] = [
  { id: 'suez',       name: 'Suez Canal',             coordinates: [32.34, 30.46], region: 'MIDDLE EAST',   throughputDesc: '12% global trade',    minZoom: 3 },
  { id: 'panama',     name: 'Panama Canal',            coordinates: [-79.55, 9.08], region: 'NORTH AMERICA', throughputDesc: '5% global trade',     minZoom: 3 },
  { id: 'hormuz',     name: 'Strait of Hormuz',        coordinates: [56.27, 26.59], region: 'MIDDLE EAST',   throughputDesc: '21% global oil',     minZoom: 3 },
  { id: 'malacca',    name: 'Strait of Malacca',       coordinates: [101.50, 2.50], region: 'EAST ASIA',     throughputDesc: '25% global trade',   minZoom: 3 },
  { id: 'bab',        name: 'Bab el-Mandeb',           coordinates: [43.30, 12.58], region: 'MIDDLE EAST',   throughputDesc: '9% global trade',    minZoom: 3 },
  { id: 'gibraltar',  name: 'Strait of Gibraltar',     coordinates: [-5.60, 35.96], region: 'EUROPE',        throughputDesc: 'Med-Atlantic link',  minZoom: 4 },
  { id: 'bosporus',   name: 'Turkish Straits',         coordinates: [29.00, 41.01], region: 'EUROPE',        throughputDesc: 'Black Sea access',   minZoom: 4 },
  { id: 'taiwan',     name: 'Taiwan Strait',           coordinates: [119.50, 24.00], region: 'EAST ASIA',    throughputDesc: '88% of large ships', minZoom: 3 },
  { id: 'danish',     name: 'Danish Straits',          coordinates: [12.50, 55.50], region: 'EUROPE',         throughputDesc: 'Baltic access',     minZoom: 5 },
  { id: 'lombok',     name: 'Lombok Strait',           coordinates: [115.70, -8.30], region: 'EAST ASIA',    throughputDesc: 'Malacca alt. route', minZoom: 5 },
];

// ─── Helpers ───

export function getTradeRoutesAtZoom(zoom: number): TradeRoute[] {
  return TRADE_ROUTES.filter((r) => zoom >= r.minZoom);
}

export function getWaterwaysAtZoom(zoom: number): StrategicWaterway[] {
  return STRATEGIC_WATERWAYS.filter((w) => zoom >= w.minZoom);
}
