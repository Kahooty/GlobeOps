/**
 * Nuclear Facilities — Static dataset for map overlay.
 *
 * Major nuclear installations worldwide: power plants, weapons facilities,
 * enrichment/reprocessing centers, research reactors.
 * Sources: IAEA PRIS (public), NTI Nuclear Security Index (public domain).
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface NuclearSite {
  name: string;
  coordinates: [lon: number, lat: number];
  country: string;
  region: Region;
  type: 'power' | 'weapons' | 'enrichment' | 'reprocessing' | 'research' | 'waste';
  status: 'active' | 'decommissioning' | 'planned';
  minZoom: number;
}

export const NUCLEAR_SITES: NuclearSite[] = [
  // ═══════════════════════════════════════════════════════════
  // WEAPONS FACILITIES — Highest priority
  // ═══════════════════════════════════════════════════════════
  { name: 'Los Alamos',            coordinates: [-106.30, 35.88], country: 'US', region: 'NORTH AMERICA', type: 'weapons',      status: 'active', minZoom: 4 },
  { name: 'Livermore (LLNL)',      coordinates: [-121.72, 37.69], country: 'US', region: 'NORTH AMERICA', type: 'weapons',      status: 'active', minZoom: 4 },
  { name: 'Pantex',                coordinates: [-101.96, 35.32], country: 'US', region: 'NORTH AMERICA', type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'Y-12 Oak Ridge',       coordinates: [-84.25, 36.01],  country: 'US', region: 'NORTH AMERICA', type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'Savannah River',       coordinates: [-81.64, 33.34],  country: 'US', region: 'NORTH AMERICA', type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'Sarov (Arzamas-16)',    coordinates: [43.58, 54.93],   country: 'RU', region: 'EUROPE',        type: 'weapons',      status: 'active', minZoom: 4 },
  { name: 'Snezhinsk (Chelyabinsk-70)', coordinates: [60.73, 56.08], country: 'RU', region: 'EUROPE',    type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'AWE Aldermaston',      coordinates: [-1.16, 51.37],   country: 'GB', region: 'EUROPE',        type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'CEA Valduc',           coordinates: [4.89, 47.47],    country: 'FR', region: 'EUROPE',        type: 'weapons',      status: 'active', minZoom: 5 },
  { name: 'Dimona',               coordinates: [35.14, 31.00],   country: 'IL', region: 'MIDDLE EAST',   type: 'weapons',      status: 'active', minZoom: 3 },
  { name: 'Kahuta',               coordinates: [73.38, 33.60],   country: 'PK', region: 'SOUTH ASIA',    type: 'weapons',      status: 'active', minZoom: 4 },
  { name: 'BARC Mumbai',          coordinates: [72.92, 19.03],   country: 'IN', region: 'SOUTH ASIA',    type: 'weapons',      status: 'active', minZoom: 4 },
  { name: 'Yongbyon',             coordinates: [125.75, 39.80],  country: 'KP', region: 'EAST ASIA',     type: 'weapons',      status: 'active', minZoom: 3 },
  { name: 'Mianyang (CAEP)',      coordinates: [104.73, 31.47],  country: 'CN', region: 'EAST ASIA',     type: 'weapons',      status: 'active', minZoom: 4 },

  // ═══════════════════════════════════════════════════════════
  // ENRICHMENT & REPROCESSING
  // ═══════════════════════════════════════════════════════════
  { name: 'Natanz',               coordinates: [51.73, 33.72],   country: 'IR', region: 'MIDDLE EAST',   type: 'enrichment',   status: 'active', minZoom: 3 },
  { name: 'Fordow',               coordinates: [51.59, 34.88],   country: 'IR', region: 'MIDDLE EAST',   type: 'enrichment',   status: 'active', minZoom: 4 },
  { name: 'Isfahan (UCF)',        coordinates: [51.68, 32.65],   country: 'IR', region: 'MIDDLE EAST',   type: 'enrichment',   status: 'active', minZoom: 5 },
  { name: 'Urenco Gronau',        coordinates: [7.03, 52.09],    country: 'DE', region: 'EUROPE',        type: 'enrichment',   status: 'active', minZoom: 5 },
  { name: 'La Hague',             coordinates: [-1.88, 49.68],   country: 'FR', region: 'EUROPE',        type: 'reprocessing', status: 'active', minZoom: 4 },
  { name: 'Sellafield',           coordinates: [-3.50, 54.42],   country: 'GB', region: 'EUROPE',        type: 'reprocessing', status: 'decommissioning', minZoom: 4 },
  { name: 'Rokkasho',             coordinates: [141.33, 40.97],  country: 'JP', region: 'EAST ASIA',     type: 'reprocessing', status: 'active', minZoom: 5 },
  { name: 'Lanzhou (CNEIC)',      coordinates: [103.84, 36.06],  country: 'CN', region: 'EAST ASIA',     type: 'enrichment',   status: 'active', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // MAJOR POWER PLANTS (largest/most notable only)
  // ═══════════════════════════════════════════════════════════
  { name: 'Zaporizhzhia NPP',     coordinates: [34.59, 47.51],   country: 'UA', region: 'EUROPE',        type: 'power',    status: 'active', minZoom: 3 },
  { name: 'Fukushima Daiichi',     coordinates: [141.03, 37.42],  country: 'JP', region: 'EAST ASIA',     type: 'power',    status: 'decommissioning', minZoom: 4 },
  { name: 'Chernobyl',            coordinates: [30.10, 51.39],   country: 'UA', region: 'EUROPE',        type: 'power',    status: 'decommissioning', minZoom: 4 },
  { name: 'Bruce NPP',            coordinates: [-81.60, 44.33],  country: 'CA', region: 'NORTH AMERICA', type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Gravelines',           coordinates: [2.10, 51.01],    country: 'FR', region: 'EUROPE',        type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Kashiwazaki-Kariwa',   coordinates: [138.60, 37.43],  country: 'JP', region: 'EAST ASIA',     type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Kori NPP',             coordinates: [129.38, 35.32],  country: 'KR', region: 'EAST ASIA',     type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Barakah NPP',          coordinates: [52.26, 23.96],   country: 'AE', region: 'MIDDLE EAST',   type: 'power',    status: 'active', minZoom: 4 },
  { name: 'Kudankulam NPP',       coordinates: [77.71, 8.17],    country: 'IN', region: 'SOUTH ASIA',    type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Palo Verde NPP',       coordinates: [-112.86, 33.39], country: 'US', region: 'NORTH AMERICA', type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Cattenom',             coordinates: [6.22, 49.41],    country: 'FR', region: 'EUROPE',        type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Ringhals',             coordinates: [12.11, 57.26],   country: 'SE', region: 'EUROPE',        type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Daya Bay',             coordinates: [114.55, 22.60],  country: 'CN', region: 'EAST ASIA',     type: 'power',    status: 'active', minZoom: 5 },
  { name: 'Hinkley Point C',      coordinates: [-3.13, 51.21],   country: 'GB', region: 'EUROPE',        type: 'power',    status: 'planned', minZoom: 5 },
  { name: 'Bushehr NPP',          coordinates: [50.89, 28.83],   country: 'IR', region: 'MIDDLE EAST',   type: 'power',    status: 'active', minZoom: 4 },
  { name: 'Akkuyu NPP',           coordinates: [33.53, 36.14],   country: 'TR', region: 'MIDDLE EAST',   type: 'power',    status: 'planned', minZoom: 5 },
  { name: 'Koeberg NPP',          coordinates: [18.43, -33.68],  country: 'ZA', region: 'AFRICA',        type: 'power',    status: 'active', minZoom: 4 },
  { name: 'Angra NPP',            coordinates: [-44.46, -23.01], country: 'BR', region: 'SOUTH AMERICA', type: 'power',    status: 'active', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // RESEARCH REACTORS
  // ═══════════════════════════════════════════════════════════
  { name: 'CERN',                  coordinates: [6.05, 46.23],    country: 'CH', region: 'EUROPE',        type: 'research', status: 'active', minZoom: 5 },
  { name: 'ITER',                  coordinates: [5.75, 43.71],    country: 'FR', region: 'EUROPE',        type: 'research', status: 'planned', minZoom: 4 },
  { name: 'JET (Culham)',          coordinates: [-1.23, 51.66],   country: 'GB', region: 'EUROPE',        type: 'research', status: 'decommissioning', minZoom: 5 },
];

// ─── Helpers ───

export function getSitesByType(type: NuclearSite['type']): NuclearSite[] {
  return NUCLEAR_SITES.filter((s) => s.type === type);
}

export function getSitesAtZoom(zoom: number): NuclearSite[] {
  return NUCLEAR_SITES.filter((s) => zoom >= s.minZoom);
}
