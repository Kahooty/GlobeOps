/**
 * Major Data Centers & Cloud Regions — Static dataset for map overlay.
 *
 * ~80 significant data center clusters worldwide. Includes hyperscalers
 * (AWS, Azure, GCP), major colocation hubs, and strategically notable facilities.
 * Sources: public cloud region maps, colocation directories (public domain).
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface DataCenter {
  name: string;
  coordinates: [lon: number, lat: number];
  country: string;
  region: Region;
  operator: string;
  type: 'hyperscaler' | 'colocation' | 'government' | 'submarine-landing' | 'ix';
  minZoom: number;
}

export const DATA_CENTERS: DataCenter[] = [
  // ═══════════════════════════════════════════════════════════
  // NORTH AMERICA — US Cloud Epicenters
  // ═══════════════════════════════════════════════════════════
  { name: 'N. Virginia (Ashburn)',  coordinates: [-77.49, 39.04], country: 'US', region: 'NORTH AMERICA', operator: 'AWS/Azure/GCP', type: 'hyperscaler', minZoom: 3 },
  { name: 'Dallas-Fort Worth',     coordinates: [-96.94, 32.90], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',         type: 'colocation',  minZoom: 4 },
  { name: 'Silicon Valley',        coordinates: [-121.95, 37.35], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',        type: 'hyperscaler', minZoom: 4 },
  { name: 'Phoenix',               coordinates: [-112.07, 33.45], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',        type: 'hyperscaler', minZoom: 4 },
  { name: 'Chicago',               coordinates: [-87.63, 41.88], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',         type: 'colocation',  minZoom: 4 },
  { name: 'Oregon (The Dalles)',   coordinates: [-121.18, 45.60], country: 'US', region: 'NORTH AMERICA', operator: 'Google',        type: 'hyperscaler', minZoom: 5 },
  { name: 'Los Angeles',           coordinates: [-118.24, 34.05], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',         type: 'colocation',  minZoom: 5 },
  { name: 'New York (NYC)',        coordinates: [-74.01, 40.71], country: 'US', region: 'NORTH AMERICA', operator: 'Multi',          type: 'ix',          minZoom: 5 },
  { name: 'Salt Lake City',        coordinates: [-111.89, 40.76], country: 'US', region: 'NORTH AMERICA', operator: 'NSA/Multi',     type: 'government',  minZoom: 5 },
  { name: 'Montreal',              coordinates: [-73.57, 45.50], country: 'CA', region: 'NORTH AMERICA', operator: 'AWS/GCP',        type: 'hyperscaler', minZoom: 5 },
  { name: 'Toronto',               coordinates: [-79.38, 43.65], country: 'CA', region: 'NORTH AMERICA', operator: 'AWS/Azure',      type: 'hyperscaler', minZoom: 5 },
  { name: 'Querétaro',             coordinates: [-100.39, 20.59], country: 'MX', region: 'NORTH AMERICA', operator: 'AWS/Azure',     type: 'hyperscaler', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════
  { name: 'Frankfurt (DE-CIX)',    coordinates: [8.68, 50.11],   country: 'DE', region: 'EUROPE',        operator: 'Multi',          type: 'ix',          minZoom: 3 },
  { name: 'Amsterdam (AMS-IX)',    coordinates: [4.90, 52.37],   country: 'NL', region: 'EUROPE',        operator: 'Multi',          type: 'ix',          minZoom: 4 },
  { name: 'London (Docklands)',    coordinates: [-0.03, 51.51],  country: 'GB', region: 'EUROPE',        operator: 'Multi',          type: 'ix',          minZoom: 4 },
  { name: 'Paris',                 coordinates: [2.35, 48.86],   country: 'FR', region: 'EUROPE',        operator: 'Multi',          type: 'colocation',  minZoom: 4 },
  { name: 'Dublin',                coordinates: [-6.26, 53.35],  country: 'IE', region: 'EUROPE',        operator: 'AWS/Azure/GCP',  type: 'hyperscaler', minZoom: 4 },
  { name: 'Stockholm',             coordinates: [18.07, 59.33],  country: 'SE', region: 'EUROPE',        operator: 'Multi',          type: 'colocation',  minZoom: 5 },
  { name: 'Zurich',                coordinates: [8.54, 47.38],   country: 'CH', region: 'EUROPE',        operator: 'GCP/Azure',      type: 'hyperscaler', minZoom: 5 },
  { name: 'Milan',                 coordinates: [9.19, 45.46],   country: 'IT', region: 'EUROPE',        operator: 'AWS',            type: 'hyperscaler', minZoom: 5 },
  { name: 'Warsaw',                coordinates: [21.01, 52.23],  country: 'PL', region: 'EUROPE',        operator: 'AWS/GCP',        type: 'hyperscaler', minZoom: 5 },
  { name: 'Helsinki',              coordinates: [24.94, 60.17],  country: 'FI', region: 'EUROPE',        operator: 'Multi',          type: 'colocation',  minZoom: 5 },
  { name: 'Madrid',                coordinates: [-3.70, 40.42],  country: 'ES', region: 'EUROPE',        operator: 'AWS/Azure',      type: 'hyperscaler', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // EAST ASIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Tokyo',                 coordinates: [139.69, 35.69], country: 'JP', region: 'EAST ASIA',     operator: 'AWS/Azure/GCP',  type: 'hyperscaler', minZoom: 3 },
  { name: 'Singapore',             coordinates: [103.85, 1.29],  country: 'SG', region: 'EAST ASIA',     operator: 'Multi',          type: 'hyperscaler', minZoom: 3 },
  { name: 'Hong Kong',             coordinates: [114.17, 22.32], country: 'HK', region: 'EAST ASIA',     operator: 'Multi',          type: 'ix',          minZoom: 4 },
  { name: 'Seoul (Gasan)',         coordinates: [126.89, 37.48], country: 'KR', region: 'EAST ASIA',     operator: 'AWS/Azure',      type: 'hyperscaler', minZoom: 4 },
  { name: 'Beijing',               coordinates: [116.41, 39.90], country: 'CN', region: 'EAST ASIA',     operator: 'Alibaba/Tencent',type: 'hyperscaler', minZoom: 4 },
  { name: 'Shanghai',              coordinates: [121.47, 31.23], country: 'CN', region: 'EAST ASIA',     operator: 'Multi',          type: 'hyperscaler', minZoom: 4 },
  { name: 'Guiyang (Big Data)',    coordinates: [106.71, 26.65], country: 'CN', region: 'EAST ASIA',     operator: 'Alibaba/Huawei', type: 'hyperscaler', minZoom: 5 },
  { name: 'Osaka',                 coordinates: [135.50, 34.69], country: 'JP', region: 'EAST ASIA',     operator: 'AWS/GCP',        type: 'hyperscaler', minZoom: 5 },
  { name: 'Taipei',                coordinates: [121.57, 25.03], country: 'TW', region: 'EAST ASIA',     operator: 'Multi',          type: 'colocation',  minZoom: 5 },
  { name: 'Jakarta',               coordinates: [106.85, -6.21], country: 'ID', region: 'EAST ASIA',     operator: 'AWS/Azure',      type: 'hyperscaler', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE EAST & SOUTH ASIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Bahrain',               coordinates: [50.59, 26.23],  country: 'BH', region: 'MIDDLE EAST',   operator: 'AWS',            type: 'hyperscaler', minZoom: 4 },
  { name: 'UAE (Dubai)',           coordinates: [55.27, 25.20],  country: 'AE', region: 'MIDDLE EAST',   operator: 'Azure/Oracle',   type: 'hyperscaler', minZoom: 4 },
  { name: 'Tel Aviv',              coordinates: [34.78, 32.08],  country: 'IL', region: 'MIDDLE EAST',   operator: 'AWS/GCP',        type: 'hyperscaler', minZoom: 5 },
  { name: 'Mumbai',                coordinates: [72.88, 19.08],  country: 'IN', region: 'SOUTH ASIA',    operator: 'AWS/Azure/GCP',  type: 'hyperscaler', minZoom: 4 },
  { name: 'Hyderabad',             coordinates: [78.47, 17.39],  country: 'IN', region: 'SOUTH ASIA',    operator: 'AWS/Azure',      type: 'hyperscaler', minZoom: 5 },
  { name: 'Chennai',               coordinates: [80.27, 13.08],  country: 'IN', region: 'SOUTH ASIA',    operator: 'Multi',          type: 'submarine-landing', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // OCEANIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Sydney',                coordinates: [151.21, -33.87], country: 'AU', region: 'OCEANIA',      operator: 'AWS/Azure/GCP',  type: 'hyperscaler', minZoom: 4 },
  { name: 'Melbourne',             coordinates: [144.96, -37.81], country: 'AU', region: 'OCEANIA',      operator: 'Azure',          type: 'hyperscaler', minZoom: 5 },
  { name: 'Auckland',              coordinates: [174.76, -36.85], country: 'NZ', region: 'OCEANIA',      operator: 'AWS',            type: 'hyperscaler', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // SOUTH AMERICA & AFRICA
  // ═══════════════════════════════════════════════════════════
  { name: 'São Paulo',             coordinates: [-46.63, -23.55], country: 'BR', region: 'SOUTH AMERICA', operator: 'AWS/Azure/GCP', type: 'hyperscaler', minZoom: 4 },
  { name: 'Santiago',              coordinates: [-70.67, -33.45], country: 'CL', region: 'SOUTH AMERICA', operator: 'GCP',           type: 'hyperscaler', minZoom: 5 },
  { name: 'Bogotá',                coordinates: [-74.07, 4.71],   country: 'CO', region: 'SOUTH AMERICA', operator: 'Azure',         type: 'hyperscaler', minZoom: 5 },
  { name: 'Cape Town',             coordinates: [18.42, -33.93], country: 'ZA', region: 'AFRICA',         operator: 'AWS/Azure',     type: 'hyperscaler', minZoom: 4 },
  { name: 'Johannesburg',          coordinates: [28.05, -26.20], country: 'ZA', region: 'AFRICA',         operator: 'Azure',         type: 'hyperscaler', minZoom: 5 },
  { name: 'Lagos',                 coordinates: [3.39, 6.45],    country: 'NG', region: 'AFRICA',         operator: 'Multi',         type: 'colocation',  minZoom: 5 },
  { name: 'Nairobi',               coordinates: [36.82, -1.29],  country: 'KE', region: 'AFRICA',         operator: 'Google/AWS',    type: 'hyperscaler', minZoom: 5 },
];

// ─── Helpers ───

export function getDataCentersAtZoom(zoom: number): DataCenter[] {
  return DATA_CENTERS.filter((dc) => zoom >= dc.minZoom);
}

export function getDataCentersByType(type: DataCenter['type']): DataCenter[] {
  return DATA_CENTERS.filter((dc) => dc.type === type);
}
