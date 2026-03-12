/**
 * Major Military Installations — Static dataset for map overlay.
 *
 * ~100 significant military bases worldwide, selected for strategic importance.
 * Sources: public domain data (SIPRI, IISS Military Balance, open government records).
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface MilitaryBase {
  name: string;
  coordinates: [lon: number, lat: number];
  country: string;
  region: Region;
  type: 'air' | 'naval' | 'army' | 'joint' | 'missile' | 'space';
  operator: string;    // Country operating the base
  minZoom: number;     // Minimum zoom level to display (3-5)
}

export const MILITARY_BASES: MilitaryBase[] = [
  // ═══════════════════════════════════════════════════════════
  // UNITED STATES — Global presence
  // ═══════════════════════════════════════════════════════════
  { name: 'Pentagon',          coordinates: [-77.05, 38.87],  country: 'US', region: 'NORTH AMERICA', type: 'joint',   operator: 'US', minZoom: 3 },
  { name: 'Norfolk Naval',     coordinates: [-76.30, 36.95],  country: 'US', region: 'NORTH AMERICA', type: 'naval',   operator: 'US', minZoom: 4 },
  { name: 'Camp Lejeune',      coordinates: [-77.38, 34.62],  country: 'US', region: 'NORTH AMERICA', type: 'army',    operator: 'US', minZoom: 5 },
  { name: 'Fort Liberty',      coordinates: [-79.00, 35.14],  country: 'US', region: 'NORTH AMERICA', type: 'army',    operator: 'US', minZoom: 5 },
  { name: 'Edwards AFB',       coordinates: [-117.88, 34.90], country: 'US', region: 'NORTH AMERICA', type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'Nellis AFB',        coordinates: [-115.03, 36.24], country: 'US', region: 'NORTH AMERICA', type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'San Diego Naval',   coordinates: [-117.17, 32.68], country: 'US', region: 'NORTH AMERICA', type: 'naval',   operator: 'US', minZoom: 4 },
  { name: 'Pearl Harbor',      coordinates: [-157.95, 21.35], country: 'US', region: 'NORTH AMERICA', type: 'naval',   operator: 'US', minZoom: 3 },
  { name: 'JBPHH',             coordinates: [-157.93, 21.33], country: 'US', region: 'NORTH AMERICA', type: 'joint',   operator: 'US', minZoom: 5 },
  { name: 'Vandenberg SFB',    coordinates: [-120.57, 34.73], country: 'US', region: 'NORTH AMERICA', type: 'space',   operator: 'US', minZoom: 4 },
  { name: 'Cape Canaveral',    coordinates: [-80.60, 28.49],  country: 'US', region: 'NORTH AMERICA', type: 'space',   operator: 'US', minZoom: 4 },
  { name: 'Whiteman AFB',      coordinates: [-93.55, 38.73],  country: 'US', region: 'NORTH AMERICA', type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'Minot AFB',         coordinates: [-101.35, 48.42], country: 'US', region: 'NORTH AMERICA', type: 'missile', operator: 'US', minZoom: 5 },
  { name: 'Cheyenne Mountain', coordinates: [-104.86, 38.74], country: 'US', region: 'NORTH AMERICA', type: 'joint',   operator: 'US', minZoom: 4 },

  // ─── US Overseas ───
  { name: 'Ramstein AB',       coordinates: [7.60, 49.44],    country: 'DE', region: 'EUROPE',        type: 'air',     operator: 'US', minZoom: 4 },
  { name: 'Aviano AB',         coordinates: [12.60, 46.03],   country: 'IT', region: 'EUROPE',        type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'Incirlik AB',       coordinates: [35.43, 37.00],   country: 'TR', region: 'MIDDLE EAST',   type: 'air',     operator: 'US', minZoom: 4 },
  { name: 'Al Udeid AB',       coordinates: [51.31, 25.12],   country: 'QA', region: 'MIDDLE EAST',   type: 'air',     operator: 'US', minZoom: 3 },
  { name: 'Al Dhafra AB',      coordinates: [54.55, 24.25],   country: 'AE', region: 'MIDDLE EAST',   type: 'air',     operator: 'US', minZoom: 4 },
  { name: 'Camp Humphreys',    coordinates: [127.03, 36.96],  country: 'KR', region: 'EAST ASIA',     type: 'army',    operator: 'US', minZoom: 4 },
  { name: 'Kadena AB',         coordinates: [127.77, 26.35],  country: 'JP', region: 'EAST ASIA',     type: 'air',     operator: 'US', minZoom: 4 },
  { name: 'Yokosuka Naval',    coordinates: [139.67, 35.28],  country: 'JP', region: 'EAST ASIA',     type: 'naval',   operator: 'US', minZoom: 4 },
  { name: 'Guam Anderson AFB', coordinates: [144.92, 13.58],  country: 'GU', region: 'OCEANIA',       type: 'air',     operator: 'US', minZoom: 3 },
  { name: 'Diego Garcia',      coordinates: [72.41, -7.32],   country: 'IO', region: 'SOUTH ASIA',    type: 'naval',   operator: 'US', minZoom: 3 },
  { name: 'Djibouti (Lemonnier)', coordinates: [43.15, 11.55], country: 'DJ', region: 'AFRICA',      type: 'joint',   operator: 'US', minZoom: 4 },
  { name: 'Rota Naval',        coordinates: [-6.35, 36.62],   country: 'ES', region: 'EUROPE',        type: 'naval',   operator: 'US', minZoom: 5 },
  { name: 'Thule AB',          coordinates: [-68.70, 76.53],  country: 'GL', region: 'NORTH AMERICA', type: 'space',   operator: 'US', minZoom: 4 },

  // ═══════════════════════════════════════════════════════════
  // RUSSIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Kremlin (MOD)',      coordinates: [37.62, 55.75],  country: 'RU', region: 'EUROPE',        type: 'joint',   operator: 'RU', minZoom: 3 },
  { name: 'Severomorsk',        coordinates: [33.42, 69.07],  country: 'RU', region: 'EUROPE',        type: 'naval',   operator: 'RU', minZoom: 4 },
  { name: 'Kaliningrad',        coordinates: [20.50, 54.70],  country: 'RU', region: 'EUROPE',        type: 'missile', operator: 'RU', minZoom: 4 },
  { name: 'Vladivostok',        coordinates: [131.90, 43.12], country: 'RU', region: 'EAST ASIA',     type: 'naval',   operator: 'RU', minZoom: 4 },
  { name: 'Tartus Naval',       coordinates: [35.89, 34.89],  country: 'SY', region: 'MIDDLE EAST',   type: 'naval',   operator: 'RU', minZoom: 4 },
  { name: 'Hmeimim AB',         coordinates: [35.95, 35.40],  country: 'SY', region: 'MIDDLE EAST',   type: 'air',     operator: 'RU', minZoom: 4 },
  { name: 'Kamchatka Submarine', coordinates: [158.65, 53.02], country: 'RU', region: 'EAST ASIA',    type: 'naval',   operator: 'RU', minZoom: 4 },
  { name: 'Engels AB',          coordinates: [46.20, 51.48],  country: 'RU', region: 'EUROPE',        type: 'air',     operator: 'RU', minZoom: 5 },
  { name: 'Plesetsk Cosmodrome', coordinates: [40.68, 62.93], country: 'RU', region: 'EUROPE',        type: 'space',   operator: 'RU', minZoom: 4 },

  // ═══════════════════════════════════════════════════════════
  // CHINA (PLA)
  // ═══════════════════════════════════════════════════════════
  { name: 'Beijing (PLA HQ)',   coordinates: [116.40, 39.90], country: 'CN', region: 'EAST ASIA',     type: 'joint',   operator: 'CN', minZoom: 3 },
  { name: 'Hainan Naval',       coordinates: [109.50, 18.23], country: 'CN', region: 'EAST ASIA',     type: 'naval',   operator: 'CN', minZoom: 4 },
  { name: 'Fiery Cross Reef',   coordinates: [112.89, 9.55],  country: 'CN', region: 'EAST ASIA',     type: 'air',     operator: 'CN', minZoom: 4 },
  { name: 'Mischief Reef',      coordinates: [115.53, 9.90],  country: 'CN', region: 'EAST ASIA',     type: 'naval',   operator: 'CN', minZoom: 5 },
  { name: 'Jiuquan',            coordinates: [98.94, 40.96],  country: 'CN', region: 'EAST ASIA',     type: 'space',   operator: 'CN', minZoom: 4 },
  { name: 'Xichang',            coordinates: [102.03, 28.25], country: 'CN', region: 'EAST ASIA',     type: 'space',   operator: 'CN', minZoom: 5 },
  { name: 'Djibouti (PLA)',     coordinates: [43.09, 11.59],  country: 'DJ', region: 'AFRICA',        type: 'naval',   operator: 'CN', minZoom: 4 },
  { name: 'Ream Naval (Cambodia)', coordinates: [104.32, 10.51], country: 'KH', region: 'EAST ASIA',  type: 'naval',   operator: 'CN', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // NATO / EUROPEAN
  // ═══════════════════════════════════════════════════════════
  { name: 'SHAPE (NATO HQ)',    coordinates: [4.31, 50.50],   country: 'BE', region: 'EUROPE',        type: 'joint',   operator: 'NATO', minZoom: 3 },
  { name: 'RAF Lakenheath',     coordinates: [0.56, 52.41],   country: 'GB', region: 'EUROPE',        type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'HMNB Clyde',         coordinates: [-4.82, 56.07],  country: 'GB', region: 'EUROPE',        type: 'naval',   operator: 'GB', minZoom: 5 },
  { name: 'Toulon Naval',       coordinates: [5.93, 43.12],   country: 'FR', region: 'EUROPE',        type: 'naval',   operator: 'FR', minZoom: 5 },
  { name: 'Istres AB',          coordinates: [4.92, 43.52],   country: 'FR', region: 'EUROPE',        type: 'air',     operator: 'FR', minZoom: 5 },
  { name: 'Deveselu (Aegis)',   coordinates: [24.28, 44.05],  country: 'RO', region: 'EUROPE',        type: 'missile', operator: 'US', minZoom: 5 },
  { name: 'Redzikowo (Aegis)',  coordinates: [16.74, 54.47],  country: 'PL', region: 'EUROPE',        type: 'missile', operator: 'US', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE EAST & SOUTH ASIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Nevatim AB',         coordinates: [34.87, 31.21],  country: 'IL', region: 'MIDDLE EAST',   type: 'air',     operator: 'IL', minZoom: 5 },
  { name: 'Palmachim AB',       coordinates: [34.69, 31.88],  country: 'IL', region: 'MIDDLE EAST',   type: 'missile', operator: 'IL', minZoom: 5 },
  { name: 'King Abdulaziz Naval', coordinates: [38.50, 21.63], country: 'SA', region: 'MIDDLE EAST',  type: 'naval',   operator: 'SA', minZoom: 5 },
  { name: 'Prince Sultan AB',   coordinates: [47.58, 24.06],  country: 'SA', region: 'MIDDLE EAST',   type: 'air',     operator: 'SA', minZoom: 5 },
  { name: 'Isa AB (Bahrain)',   coordinates: [50.59, 25.92],  country: 'BH', region: 'MIDDLE EAST',   type: 'naval',   operator: 'US', minZoom: 5 },
  { name: 'INS Kadamba',        coordinates: [74.05, 14.82],  country: 'IN', region: 'SOUTH ASIA',    type: 'naval',   operator: 'IN', minZoom: 5 },
  { name: 'Agra (Missile)',     coordinates: [78.05, 27.18],  country: 'IN', region: 'SOUTH ASIA',    type: 'missile', operator: 'IN', minZoom: 5 },
  { name: 'Sargodha AB',        coordinates: [72.67, 32.05],  country: 'PK', region: 'SOUTH ASIA',    type: 'air',     operator: 'PK', minZoom: 5 },
  { name: 'Rawalpindi GHQ',     coordinates: [73.05, 33.60],  country: 'PK', region: 'SOUTH ASIA',    type: 'army',    operator: 'PK', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // EAST ASIA & PACIFIC
  // ═══════════════════════════════════════════════════════════
  { name: 'Pyongyang (KPA)',    coordinates: [125.75, 39.02], country: 'KP', region: 'EAST ASIA',     type: 'joint',   operator: 'KP', minZoom: 4 },
  { name: 'Yongbyon',           coordinates: [125.75, 39.80], country: 'KP', region: 'EAST ASIA',     type: 'missile', operator: 'KP', minZoom: 5 },
  { name: 'Changi Naval',       coordinates: [104.00, 1.33],  country: 'SG', region: 'EAST ASIA',     type: 'naval',   operator: 'SG', minZoom: 5 },
  { name: 'Cam Ranh Bay',       coordinates: [109.17, 11.95], country: 'VN', region: 'EAST ASIA',     type: 'naval',   operator: 'VN', minZoom: 5 },
  { name: 'Subic Bay',          coordinates: [120.28, 14.80], country: 'PH', region: 'EAST ASIA',     type: 'naval',   operator: 'PH', minZoom: 5 },
  { name: 'Pine Gap',           coordinates: [133.74, -23.80], country: 'AU', region: 'OCEANIA',      type: 'joint',   operator: 'AU', minZoom: 4 },
  { name: 'HMAS Stirling',      coordinates: [115.68, -32.33], country: 'AU', region: 'OCEANIA',      type: 'naval',   operator: 'AU', minZoom: 5 },

  // ═══════════════════════════════════════════════════════════
  // AFRICA & SOUTH AMERICA
  // ═══════════════════════════════════════════════════════════
  { name: 'Agadez Drone Base',   coordinates: [8.00, 16.97],   country: 'NE', region: 'AFRICA',       type: 'air',     operator: 'US', minZoom: 5 },
  { name: 'Entebbe (UPDF)',      coordinates: [32.44, 0.04],    country: 'UG', region: 'AFRICA',       type: 'air',     operator: 'UG', minZoom: 5 },
  { name: 'Simon\'s Town Naval', coordinates: [18.43, -34.19],  country: 'ZA', region: 'AFRICA',       type: 'naval',   operator: 'ZA', minZoom: 5 },
  { name: 'Natal Naval',         coordinates: [-35.19, -5.78],  country: 'BR', region: 'SOUTH AMERICA', type: 'naval',  operator: 'BR', minZoom: 5 },
  { name: 'Alcantara Launch',    coordinates: [-44.37, -2.37],  country: 'BR', region: 'SOUTH AMERICA', type: 'space',  operator: 'BR', minZoom: 5 },
];

// ─── Helpers ───

export function getBasesByRegion(region: Region): MilitaryBase[] {
  return MILITARY_BASES.filter((b) => b.region === region);
}

export function getBasesByOperator(operator: string): MilitaryBase[] {
  return MILITARY_BASES.filter((b) => b.operator === operator);
}

export function getBasesAtZoom(zoom: number): MilitaryBase[] {
  return MILITARY_BASES.filter((b) => zoom >= b.minZoom);
}
