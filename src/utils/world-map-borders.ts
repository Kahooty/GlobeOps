/**
 * World Map Country Borders — Simplified Country Polygons for Border Rendering
 *
 * Each country is defined as a closed polygon of [longitude, latitude] coordinates.
 * These polygons partition the landmasses into individual countries for:
 *   - Border detection at Z:2+ (where adjacent land pixels have different countries)
 *   - Country labels at Z:2-3 (positioned at labelCoordinates)
 *
 * Polygons are intentionally oversized relative to coastlines because they
 * only partition pixels already identified as land by the coastline rasterizer.
 * Internal borders (between countries) need to be accurate; coastal boundaries
 * are handled by the existing landmass polygons.
 *
 * Simplified from Natural Earth 110m (public domain).
 * Coordinates: WGS84 longitude/latitude.
 */

import type { Region } from '@/types';

export interface CountryData {
  code: string;                            // ISO 3166-1 alpha-2
  name: string;
  region: Region;
  labelCoordinates: [lon: number, lat: number];  // Approximate centroid for label
  polygon: [lon: number, lat: number][];
}

// ═══════════════════════════════════════════════════════════════
// NORTH AMERICA
// ═══════════════════════════════════════════════════════════════

const NORTH_AMERICA: CountryData[] = [
  {
    code: 'CA', name: 'Canada', region: 'NORTH AMERICA',
    labelCoordinates: [-100, 60],
    polygon: [
      [-141, 60], [-141, 83], [-60, 83], [-50, 70], [-55, 52],
      [-58, 48], [-64, 46], [-67, 45], [-71, 42], [-75, 45],
      [-79, 44], [-83, 46], [-84, 47], [-88, 48], [-90, 49],
      [-95, 49], [-100, 49], [-105, 49], [-110, 49], [-115, 49],
      [-120, 49], [-123, 49], [-130, 55], [-135, 59], [-141, 60],
    ],
  },
  {
    code: 'US', name: 'United States', region: 'NORTH AMERICA',
    labelCoordinates: [-98, 38],
    polygon: [
      [-125, 49], [-120, 49], [-115, 49], [-110, 49], [-105, 49],
      [-100, 49], [-95, 49], [-90, 49], [-88, 48], [-84, 47],
      [-83, 46], [-79, 44], [-75, 45], [-71, 42], [-67, 44],
      [-67, 25], [-80, 25], [-82, 29], [-85, 30], [-88, 30],
      [-90, 30], [-94, 30], [-97, 26], [-100, 26], [-103, 29],
      [-106, 32], [-112, 32], [-115, 32], [-117, 33], [-120, 34],
      [-122, 37], [-124, 42], [-124, 46], [-125, 49],
    ],
  },
  {
    code: 'MX', name: 'Mexico', region: 'NORTH AMERICA',
    labelCoordinates: [-102, 24],
    polygon: [
      [-117, 33], [-115, 32], [-112, 32], [-106, 32], [-103, 29],
      [-100, 26], [-97, 26], [-97, 18], [-95, 19], [-92, 18],
      [-90, 16], [-88, 16], [-86, 14], [-92, 14], [-95, 16],
      [-100, 19], [-105, 20], [-107, 23], [-110, 25], [-112, 29],
      [-115, 31], [-117, 33],
    ],
  },
  {
    code: 'CU', name: 'Cuba', region: 'NORTH AMERICA',
    labelCoordinates: [-79, 22],
    polygon: [
      [-85, 22], [-84, 23], [-82, 23], [-79, 23], [-76, 20],
      [-78, 20], [-81, 20], [-84, 21], [-85, 22],
    ],
  },
  {
    code: 'GT', name: 'Central America', region: 'NORTH AMERICA',
    labelCoordinates: [-85, 13],
    polygon: [
      [-92, 18], [-90, 16], [-88, 16], [-86, 14], [-84, 11],
      [-82, 9], [-80, 8], [-77, 8], [-77, 10], [-82, 10],
      [-84, 11], [-86, 14], [-88, 14], [-92, 14], [-92, 18],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SOUTH AMERICA
// ═══════════════════════════════════════════════════════════════

const SOUTH_AMERICA: CountryData[] = [
  {
    code: 'BR', name: 'Brazil', region: 'SOUTH AMERICA',
    labelCoordinates: [-52, -12],
    polygon: [
      [-74, 5], [-70, 2], [-67, -1], [-66, -4], [-65, -8],
      [-58, -10], [-57, -13], [-58, -20], [-56, -22], [-54, -24],
      [-53, -27], [-52, -33], [-49, -29], [-46, -24], [-43, -23],
      [-41, -20], [-39, -15], [-37, -13], [-35, -10], [-35, -5],
      [-44, -2], [-49, 0], [-51, 4], [-53, 5], [-57, 6],
      [-60, 5], [-63, 4], [-66, 2], [-69, 2], [-72, 3],
      [-74, 5],
    ],
  },
  {
    code: 'AR', name: 'Argentina', region: 'SOUTH AMERICA',
    labelCoordinates: [-64, -35],
    polygon: [
      [-70, -22], [-67, -22], [-65, -24], [-64, -27], [-61, -30],
      [-58, -34], [-57, -38], [-65, -42], [-67, -47], [-68, -53],
      [-70, -52], [-72, -50], [-74, -44], [-72, -38], [-71, -35],
      [-70, -30], [-70, -25], [-70, -22],
    ],
  },
  {
    code: 'CL', name: 'Chile', region: 'SOUTH AMERICA',
    labelCoordinates: [-71, -33],
    polygon: [
      [-70, -18], [-70, -22], [-70, -25], [-70, -30], [-71, -35],
      [-72, -38], [-74, -44], [-76, -46], [-75, -50], [-73, -52],
      [-69, -55], [-68, -53], [-67, -47], [-65, -42], [-66, -40],
      [-70, -39], [-71, -35], [-71, -30], [-70, -25], [-70, -22],
      [-70, -18],
    ],
  },
  {
    code: 'CO', name: 'Colombia', region: 'SOUTH AMERICA',
    labelCoordinates: [-73, 4],
    polygon: [
      [-77, 8], [-75, 11], [-72, 12], [-68, 12], [-67, 6],
      [-67, 2], [-69, 2], [-72, 3], [-74, 5], [-77, 4],
      [-78, 3], [-79, 2], [-80, 4], [-77, 8],
    ],
  },
  {
    code: 'VE', name: 'Venezuela', region: 'SOUTH AMERICA',
    labelCoordinates: [-66, 8],
    polygon: [
      [-72, 12], [-68, 12], [-63, 11], [-60, 8], [-62, 7],
      [-64, 6], [-66, 2], [-67, 2], [-67, 6], [-68, 12],
      [-72, 12],
    ],
  },
  {
    code: 'PE', name: 'Peru', region: 'SOUTH AMERICA',
    labelCoordinates: [-75, -10],
    polygon: [
      [-81, -4], [-78, -3], [-76, 0], [-74, 0], [-74, 5],
      [-72, 3], [-69, 2], [-66, 2], [-66, -4], [-65, -8],
      [-69, -14], [-69, -17], [-70, -18], [-75, -15], [-76, -12],
      [-78, -8], [-80, -3], [-81, -4],
    ],
  },
  {
    code: 'EC', name: 'Ecuador', region: 'SOUTH AMERICA',
    labelCoordinates: [-78, -1],
    polygon: [
      [-80, 1], [-78, 1], [-76, 0], [-74, 0], [-74, 5],
      [-77, 4], [-78, 3], [-79, 2], [-80, 1],
    ],
  },
  {
    code: 'BO', name: 'Bolivia', region: 'SOUTH AMERICA',
    labelCoordinates: [-65, -17],
    polygon: [
      [-70, -11], [-66, -10], [-65, -12], [-58, -13], [-58, -20],
      [-60, -22], [-63, -22], [-67, -22], [-70, -22], [-70, -18],
      [-69, -17], [-69, -14], [-70, -11],
    ],
  },
  {
    code: 'PY', name: 'Paraguay', region: 'SOUTH AMERICA',
    labelCoordinates: [-58, -23],
    polygon: [
      [-63, -22], [-60, -22], [-58, -20], [-57, -22], [-55, -24],
      [-56, -27], [-58, -27], [-61, -25], [-63, -22],
    ],
  },
  {
    code: 'UY', name: 'Uruguay', region: 'SOUTH AMERICA',
    labelCoordinates: [-56, -33],
    polygon: [
      [-58, -34], [-56, -35], [-53, -34], [-53, -31], [-55, -30],
      [-57, -31], [-58, -34],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// EUROPE
// ═══════════════════════════════════════════════════════════════

const EUROPE: CountryData[] = [
  {
    code: 'GB', name: 'United Kingdom', region: 'EUROPE',
    labelCoordinates: [-2, 54],
    polygon: [
      [-6, 50], [-5, 51], [-3, 53], [-3, 54], [-5, 55],
      [-5, 57], [-2, 58], [0, 56], [2, 53], [1, 51],
      [-1, 50], [-6, 50],
    ],
  },
  {
    code: 'IE', name: 'Ireland', region: 'EUROPE',
    labelCoordinates: [-8, 53],
    polygon: [
      [-10, 52], [-10, 54], [-8, 55], [-6, 55], [-6, 52],
      [-7, 51], [-10, 52],
    ],
  },
  {
    code: 'FR', name: 'France', region: 'EUROPE',
    labelCoordinates: [2, 47],
    polygon: [
      [-5, 48], [-2, 48], [-1, 47], [0, 43], [1, 43],
      [3, 43], [6, 44], [7, 46], [7, 48], [6, 49],
      [3, 50], [2, 51], [1, 50], [-1, 47], [-4, 48],
      [-5, 48],
    ],
  },
  {
    code: 'ES', name: 'Spain', region: 'EUROPE',
    labelCoordinates: [-4, 40],
    polygon: [
      [-9, 37], [-9, 43], [-5, 44], [-2, 43], [0, 43],
      [3, 43], [3, 42], [0, 38], [-1, 37], [-5, 36],
      [-9, 37],
    ],
  },
  {
    code: 'PT', name: 'Portugal', region: 'EUROPE',
    labelCoordinates: [-8, 39],
    polygon: [
      [-10, 37], [-10, 42], [-8, 42], [-7, 40], [-7, 38],
      [-9, 37], [-10, 37],
    ],
  },
  {
    code: 'DE', name: 'Germany', region: 'EUROPE',
    labelCoordinates: [10, 51],
    polygon: [
      [6, 49], [6, 51], [6, 54], [8, 55], [10, 54],
      [12, 55], [14, 54], [15, 51], [15, 49], [13, 48],
      [12, 48], [10, 48], [8, 48], [7, 48], [6, 49],
    ],
  },
  {
    code: 'IT', name: 'Italy', region: 'EUROPE',
    labelCoordinates: [12, 42],
    polygon: [
      [7, 44], [8, 46], [10, 47], [12, 47], [14, 46],
      [14, 44], [13, 43], [16, 41], [18, 40], [17, 39],
      [16, 38], [13, 38], [12, 38], [12, 42], [10, 44],
      [7, 44],
    ],
  },
  {
    code: 'PL', name: 'Poland', region: 'EUROPE',
    labelCoordinates: [20, 52],
    polygon: [
      [14, 54], [14, 52], [15, 51], [15, 49], [17, 49],
      [19, 49], [22, 49], [24, 49], [24, 52], [23, 54],
      [21, 55], [19, 54], [18, 55], [14, 54],
    ],
  },
  {
    code: 'UA', name: 'Ukraine', region: 'EUROPE',
    labelCoordinates: [32, 49],
    polygon: [
      [24, 52], [24, 49], [26, 48], [28, 48], [30, 48],
      [33, 47], [36, 47], [38, 47], [40, 47], [40, 50],
      [37, 51], [34, 52], [31, 52], [28, 52], [24, 52],
    ],
  },
  {
    code: 'RO', name: 'Romania', region: 'EUROPE',
    labelCoordinates: [25, 46],
    polygon: [
      [22, 48], [24, 49], [26, 48], [28, 48], [30, 47],
      [29, 45], [27, 44], [26, 44], [24, 44], [22, 44],
      [21, 46], [22, 48],
    ],
  },
  {
    code: 'HU', name: 'Hungary', region: 'EUROPE',
    labelCoordinates: [19, 47],
    polygon: [
      [16, 48], [17, 49], [19, 49], [22, 49], [22, 48],
      [21, 46], [20, 46], [18, 46], [16, 47], [16, 48],
    ],
  },
  {
    code: 'GR', name: 'Greece', region: 'EUROPE',
    labelCoordinates: [23, 39],
    polygon: [
      [20, 42], [21, 41], [22, 41], [24, 42], [26, 41],
      [26, 39], [24, 38], [23, 37], [22, 37], [21, 38],
      [20, 39], [20, 42],
    ],
  },
  {
    code: 'BG', name: 'Bulgaria', region: 'EUROPE',
    labelCoordinates: [25, 43],
    polygon: [
      [22, 44], [24, 44], [26, 44], [28, 44], [28, 42],
      [26, 42], [24, 42], [22, 42], [22, 44],
    ],
  },
  {
    code: 'RS', name: 'Serbia', region: 'EUROPE',
    labelCoordinates: [21, 44],
    polygon: [
      [19, 46], [20, 46], [21, 46], [22, 44], [22, 43],
      [21, 42], [20, 42], [19, 43], [19, 45], [19, 46],
    ],
  },
  {
    code: 'SE', name: 'Sweden', region: 'EUROPE',
    labelCoordinates: [16, 63],
    polygon: [
      [12, 56], [12, 58], [12, 60], [14, 62], [15, 64],
      [16, 67], [18, 69], [20, 69], [20, 66], [18, 62],
      [18, 58], [18, 56], [16, 56], [14, 56], [12, 56],
    ],
  },
  {
    code: 'NO', name: 'Norway', region: 'EUROPE',
    labelCoordinates: [10, 62],
    polygon: [
      [5, 58], [5, 61], [5, 63], [8, 63], [10, 64],
      [12, 66], [14, 67], [16, 68], [18, 69], [20, 70],
      [24, 71], [30, 70], [28, 68], [20, 69], [18, 69],
      [16, 67], [14, 64], [12, 60], [12, 58], [10, 58],
      [8, 58], [5, 58],
    ],
  },
  {
    code: 'FI', name: 'Finland', region: 'EUROPE',
    labelCoordinates: [26, 63],
    polygon: [
      [20, 60], [21, 62], [23, 64], [24, 66], [26, 68],
      [28, 70], [30, 70], [30, 68], [30, 64], [29, 61],
      [27, 60], [24, 60], [22, 59], [20, 60],
    ],
  },
  {
    code: 'BY', name: 'Belarus', region: 'EUROPE',
    labelCoordinates: [28, 54],
    polygon: [
      [23, 52], [24, 52], [28, 52], [31, 52], [32, 55],
      [28, 56], [24, 55], [23, 54], [23, 52],
    ],
  },
  {
    code: 'CZ', name: 'Czechia', region: 'EUROPE',
    labelCoordinates: [15, 50],
    polygon: [
      [12, 50], [13, 51], [15, 51], [17, 50], [18, 49],
      [17, 49], [15, 49], [13, 49], [12, 49], [12, 50],
    ],
  },
  {
    code: 'AT', name: 'Austria', region: 'EUROPE',
    labelCoordinates: [14, 47],
    polygon: [
      [10, 47], [10, 48], [12, 48], [13, 48], [15, 49],
      [17, 49], [17, 48], [16, 47], [14, 47], [13, 47],
      [10, 47],
    ],
  },
  {
    code: 'CH', name: 'Switzerland', region: 'EUROPE',
    labelCoordinates: [8, 47],
    polygon: [
      [6, 46], [6, 48], [7, 48], [8, 48], [10, 48],
      [10, 47], [10, 46], [8, 46], [6, 46],
    ],
  },
  {
    code: 'NL', name: 'Netherlands', region: 'EUROPE',
    labelCoordinates: [5, 52],
    polygon: [
      [3, 51], [4, 52], [5, 53], [6, 54], [7, 53],
      [7, 52], [6, 51], [5, 51], [3, 51],
    ],
  },
  {
    code: 'BE', name: 'Belgium', region: 'EUROPE',
    labelCoordinates: [4, 51],
    polygon: [
      [3, 50], [3, 51], [5, 51], [6, 51], [6, 50],
      [5, 50], [4, 50], [3, 50],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// AFRICA
// ═══════════════════════════════════════════════════════════════

const AFRICA: CountryData[] = [
  {
    code: 'EG', name: 'Egypt', region: 'AFRICA',
    labelCoordinates: [30, 27],
    polygon: [
      [25, 22], [25, 31], [30, 31], [33, 30], [36, 30],
      [36, 22], [33, 22], [25, 22],
    ],
  },
  {
    code: 'LY', name: 'Libya', region: 'AFRICA',
    labelCoordinates: [18, 28],
    polygon: [
      [10, 20], [10, 30], [11, 33], [15, 32], [20, 33],
      [25, 32], [25, 22], [24, 20], [15, 23], [10, 20],
    ],
  },
  {
    code: 'DZ', name: 'Algeria', region: 'AFRICA',
    labelCoordinates: [3, 28],
    polygon: [
      [-9, 27], [-9, 36], [-5, 36], [0, 37], [3, 37],
      [8, 37], [10, 37], [10, 30], [10, 20], [3, 19],
      [-2, 22], [-9, 27],
    ],
  },
  {
    code: 'MA', name: 'Morocco', region: 'AFRICA',
    labelCoordinates: [-6, 32],
    polygon: [
      [-17, 28], [-13, 36], [-5, 36], [-2, 35], [-2, 30],
      [-9, 27], [-13, 28], [-17, 28],
    ],
  },
  {
    code: 'NG', name: 'Nigeria', region: 'AFRICA',
    labelCoordinates: [8, 9],
    polygon: [
      [3, 6], [3, 10], [3, 13], [7, 14], [10, 13],
      [13, 14], [14, 10], [14, 6], [10, 4], [8, 5],
      [5, 5], [3, 6],
    ],
  },
  {
    code: 'ZA', name: 'South Africa', region: 'AFRICA',
    labelCoordinates: [25, -30],
    polygon: [
      [17, -29], [17, -24], [20, -22], [25, -22], [28, -22],
      [32, -22], [33, -26], [31, -29], [28, -33], [22, -34],
      [18, -34], [17, -32], [17, -29],
    ],
  },
  {
    code: 'ET', name: 'Ethiopia', region: 'AFRICA',
    labelCoordinates: [40, 8],
    polygon: [
      [33, 4], [33, 8], [34, 12], [37, 14], [40, 15],
      [42, 12], [44, 8], [47, 5], [44, 3], [40, 4],
      [37, 4], [33, 4],
    ],
  },
  {
    code: 'KE', name: 'Kenya', region: 'AFRICA',
    labelCoordinates: [37, -1],
    polygon: [
      [34, -4], [34, 4], [37, 4], [40, 4], [42, 0],
      [42, -4], [40, -4], [37, -4], [34, -4],
    ],
  },
  {
    code: 'CD', name: 'DR Congo', region: 'AFRICA',
    labelCoordinates: [24, -3],
    polygon: [
      [12, -12], [12, -5], [17, 0], [18, 4], [22, 5],
      [26, 5], [30, 2], [30, -1], [30, -4], [30, -10],
      [28, -12], [25, -13], [22, -12], [18, -12],
      [15, -10], [12, -12],
    ],
  },
  {
    code: 'SD', name: 'Sudan', region: 'AFRICA',
    labelCoordinates: [30, 15],
    polygon: [
      [24, 10], [24, 20], [25, 22], [33, 22], [36, 22],
      [37, 18], [37, 14], [34, 12], [33, 8], [30, 10],
      [27, 10], [24, 10],
    ],
  },
  {
    code: 'TZ', name: 'Tanzania', region: 'AFRICA',
    labelCoordinates: [35, -7],
    polygon: [
      [30, -1], [30, -4], [30, -10], [32, -11], [36, -11],
      [40, -10], [40, -4], [37, -4], [34, -4], [30, -4],
      [30, -1],
    ],
  },
  {
    code: 'SO', name: 'Somalia', region: 'AFRICA',
    labelCoordinates: [46, 4],
    polygon: [
      [41, 11], [44, 11], [49, 9], [51, 2], [49, 0],
      [46, -3], [42, -2], [42, 0], [42, 5], [42, 8],
      [41, 11],
    ],
  },
  {
    code: 'AO', name: 'Angola', region: 'AFRICA',
    labelCoordinates: [18, -12],
    polygon: [
      [12, -5], [12, -12], [12, -18], [15, -18], [18, -18],
      [22, -18], [24, -18], [24, -12], [22, -12], [18, -12],
      [17, 0], [12, -5],
    ],
  },
  {
    code: 'MZ', name: 'Mozambique', region: 'AFRICA',
    labelCoordinates: [35, -18],
    polygon: [
      [30, -10], [30, -15], [30, -22], [32, -26], [33, -26],
      [36, -25], [37, -20], [40, -15], [40, -10], [36, -11],
      [32, -11], [30, -10],
    ],
  },
  {
    code: 'ML', name: 'Mali', region: 'AFRICA',
    labelCoordinates: [-2, 17],
    polygon: [
      [-12, 11], [-12, 17], [-9, 21], [-5, 25], [-2, 22],
      [3, 19], [3, 17], [3, 13], [-2, 11], [-5, 10],
      [-8, 10], [-12, 11],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// MIDDLE EAST
// ═══════════════════════════════════════════════════════════════

const MIDDLE_EAST: CountryData[] = [
  {
    code: 'SA', name: 'Saudi Arabia', region: 'MIDDLE EAST',
    labelCoordinates: [45, 24],
    polygon: [
      [36, 32], [38, 28], [40, 26], [42, 24], [44, 22],
      [46, 21], [48, 21], [50, 22], [55, 22], [56, 20],
      [56, 17], [53, 14], [48, 13], [45, 13], [43, 15],
      [42, 18], [40, 20], [38, 22], [36, 28], [36, 32],
    ],
  },
  {
    code: 'IR', name: 'Iran', region: 'MIDDLE EAST',
    labelCoordinates: [53, 33],
    polygon: [
      [44, 39], [48, 38], [51, 37], [54, 36], [57, 36],
      [60, 37], [63, 35], [63, 32], [61, 28], [58, 26],
      [54, 26], [51, 26], [48, 27], [46, 29], [44, 31],
      [44, 35], [44, 39],
    ],
  },
  {
    code: 'IQ', name: 'Iraq', region: 'MIDDLE EAST',
    labelCoordinates: [44, 33],
    polygon: [
      [39, 37], [42, 37], [44, 37], [44, 35], [46, 34],
      [48, 31], [48, 30], [46, 29], [44, 29], [42, 30],
      [40, 32], [39, 34], [39, 37],
    ],
  },
  {
    code: 'SY', name: 'Syria', region: 'MIDDLE EAST',
    labelCoordinates: [38, 35],
    polygon: [
      [36, 33], [36, 35], [36, 37], [38, 37], [39, 37],
      [42, 37], [42, 35], [42, 33], [40, 32], [38, 32],
      [36, 33],
    ],
  },
  {
    code: 'YE', name: 'Yemen', region: 'MIDDLE EAST',
    labelCoordinates: [48, 15],
    polygon: [
      [43, 15], [43, 18], [44, 17], [48, 16], [52, 16],
      [53, 14], [50, 13], [48, 13], [45, 13], [43, 15],
    ],
  },
  {
    code: 'OM', name: 'Oman', region: 'MIDDLE EAST',
    labelCoordinates: [57, 21],
    polygon: [
      [52, 16], [55, 17], [56, 20], [57, 22], [59, 24],
      [57, 25], [55, 23], [53, 21], [52, 18], [52, 16],
    ],
  },
  {
    code: 'AE', name: 'UAE', region: 'MIDDLE EAST',
    labelCoordinates: [54, 24],
    polygon: [
      [51, 22], [52, 24], [54, 25], [56, 25], [56, 23],
      [55, 22], [53, 22], [51, 22],
    ],
  },
  {
    code: 'JO', name: 'Jordan', region: 'MIDDLE EAST',
    labelCoordinates: [36, 31],
    polygon: [
      [35, 29], [35, 32], [36, 33], [38, 32], [39, 31],
      [39, 29], [37, 29], [35, 29],
    ],
  },
  {
    code: 'IL', name: 'Israel', region: 'MIDDLE EAST',
    labelCoordinates: [35, 31],
    polygon: [
      [34, 30], [34, 32], [35, 33], [36, 33], [36, 30],
      [35, 29], [34, 30],
    ],
  },
  {
    code: 'TR', name: 'Turkey', region: 'MIDDLE EAST',
    labelCoordinates: [35, 39],
    polygon: [
      [26, 37], [28, 37], [30, 37], [33, 36], [36, 37],
      [38, 37], [40, 38], [42, 38], [44, 39], [44, 41],
      [42, 42], [40, 42], [37, 42], [35, 42], [32, 42],
      [30, 41], [28, 41], [26, 39], [26, 37],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SOUTH & CENTRAL ASIA
// ═══════════════════════════════════════════════════════════════

const SOUTH_ASIA: CountryData[] = [
  {
    code: 'IN', name: 'India', region: 'SOUTH ASIA',
    labelCoordinates: [80, 22],
    polygon: [
      [68, 24], [70, 24], [72, 25], [73, 27], [74, 30],
      [74, 34], [77, 35], [80, 34], [83, 30], [85, 28],
      [88, 27], [88, 22], [85, 18], [80, 8], [78, 10],
      [76, 14], [73, 17], [72, 21], [70, 24], [68, 24],
    ],
  },
  {
    code: 'PK', name: 'Pakistan', region: 'SOUTH ASIA',
    labelCoordinates: [69, 30],
    polygon: [
      [61, 25], [62, 28], [62, 32], [62, 36], [65, 37],
      [68, 36], [70, 35], [72, 34], [74, 34], [74, 30],
      [73, 27], [72, 25], [70, 24], [68, 24], [67, 25],
      [63, 25], [61, 25],
    ],
  },
  {
    code: 'AF', name: 'Afghanistan', region: 'SOUTH ASIA',
    labelCoordinates: [67, 34],
    polygon: [
      [61, 30], [62, 32], [62, 36], [65, 37], [68, 37],
      [70, 37], [72, 37], [74, 37], [74, 34], [72, 34],
      [70, 35], [68, 36], [65, 37], [62, 36], [62, 32],
      [61, 30],
    ],
  },
  {
    code: 'BD', name: 'Bangladesh', region: 'SOUTH ASIA',
    labelCoordinates: [90, 24],
    polygon: [
      [88, 22], [88, 27], [89, 26], [92, 26], [92, 22],
      [91, 21], [90, 22], [88, 22],
    ],
  },
  {
    code: 'LK', name: 'Sri Lanka', region: 'SOUTH ASIA',
    labelCoordinates: [81, 8],
    polygon: [
      [80, 10], [81, 8], [82, 7], [81, 6], [80, 7],
      [79, 8], [80, 10],
    ],
  },
  {
    code: 'MM', name: 'Myanmar', region: 'SOUTH ASIA',
    labelCoordinates: [96, 20],
    polygon: [
      [92, 22], [92, 26], [94, 28], [97, 28], [99, 25],
      [99, 20], [98, 16], [98, 12], [97, 10], [96, 16],
      [95, 18], [93, 20], [92, 22],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// EAST ASIA
// ═══════════════════════════════════════════════════════════════

const EAST_ASIA: CountryData[] = [
  {
    code: 'CN', name: 'China', region: 'EAST ASIA',
    labelCoordinates: [105, 35],
    polygon: [
      [74, 37], [76, 42], [80, 46], [87, 49], [93, 46],
      [97, 45], [100, 42], [108, 42], [110, 45], [115, 48],
      [120, 50], [122, 47], [122, 42], [121, 31], [118, 25],
      [115, 21], [110, 21], [108, 18], [105, 15], [101, 15],
      [99, 20], [99, 25], [97, 28], [94, 28], [92, 26],
      [88, 27], [85, 28], [83, 30], [80, 34], [77, 35],
      [74, 37],
    ],
  },
  {
    code: 'RU', name: 'Russia', region: 'EAST ASIA',
    labelCoordinates: [90, 60],
    polygon: [
      [28, 53], [30, 51], [32, 55], [28, 56], [24, 55],
      [24, 57], [30, 60], [37, 61], [40, 58], [42, 55],
      [42, 42], [48, 44], [55, 45], [60, 45], [65, 42],
      [73, 40], [76, 42], [80, 46], [87, 49], [93, 46],
      [97, 45], [100, 42], [108, 42], [110, 45], [115, 48],
      [120, 50], [125, 57], [135, 65], [140, 67], [150, 70],
      [170, 70], [180, 65], [180, 72], [140, 75], [100, 73],
      [80, 65], [60, 57], [50, 52], [40, 55], [37, 61],
      [30, 60], [28, 53],
    ],
  },
  {
    code: 'JP', name: 'Japan', region: 'EAST ASIA',
    labelCoordinates: [138, 37],
    polygon: [
      [130, 31], [131, 33], [134, 34], [137, 35], [140, 38],
      [141, 41], [143, 44], [145, 45], [145, 43], [141, 39],
      [139, 35], [136, 33], [131, 31], [130, 31],
    ],
  },
  {
    code: 'KR', name: 'South Korea', region: 'EAST ASIA',
    labelCoordinates: [128, 36],
    polygon: [
      [126, 38], [126, 36], [127, 35], [128, 34], [129, 35],
      [130, 37], [129, 38], [127, 38], [126, 38],
    ],
  },
  {
    code: 'KP', name: 'North Korea', region: 'EAST ASIA',
    labelCoordinates: [127, 40],
    polygon: [
      [125, 38], [124, 40], [126, 42], [128, 42], [130, 42],
      [130, 40], [130, 38], [129, 38], [127, 38], [125, 38],
    ],
  },
  {
    code: 'MN', name: 'Mongolia', region: 'EAST ASIA',
    labelCoordinates: [105, 47],
    polygon: [
      [87, 49], [90, 51], [95, 50], [100, 50], [105, 50],
      [110, 50], [115, 50], [118, 50], [120, 50], [118, 48],
      [115, 48], [110, 45], [108, 42], [100, 42], [97, 45],
      [93, 46], [87, 49],
    ],
  },
  {
    code: 'KZ', name: 'Kazakhstan', region: 'EAST ASIA',
    labelCoordinates: [68, 48],
    polygon: [
      [50, 42], [52, 45], [55, 47], [60, 47], [65, 47],
      [70, 47], [75, 47], [80, 47], [84, 49], [87, 49],
      [87, 46], [80, 42], [75, 40], [73, 40], [65, 42],
      [60, 45], [55, 45], [50, 42],
    ],
  },
  {
    code: 'TH', name: 'Thailand', region: 'EAST ASIA',
    labelCoordinates: [101, 15],
    polygon: [
      [98, 20], [99, 18], [101, 18], [103, 18], [105, 18],
      [106, 15], [104, 14], [103, 11], [101, 7], [99, 7],
      [99, 10], [100, 12], [99, 14], [98, 16], [98, 20],
    ],
  },
  {
    code: 'VN', name: 'Vietnam', region: 'EAST ASIA',
    labelCoordinates: [107, 16],
    polygon: [
      [103, 22], [105, 23], [107, 22], [108, 18], [108, 14],
      [108, 11], [107, 9], [106, 11], [106, 14], [105, 18],
      [103, 22],
    ],
  },
  {
    code: 'TW', name: 'Taiwan', region: 'EAST ASIA',
    labelCoordinates: [121, 24],
    polygon: [
      [120, 22], [121, 23], [122, 25], [121, 25], [120, 24],
      [120, 22],
    ],
  },
  {
    code: 'PH', name: 'Philippines', region: 'EAST ASIA',
    labelCoordinates: [122, 13],
    polygon: [
      [118, 18], [120, 16], [121, 14], [123, 12], [125, 10],
      [126, 8], [126, 10], [124, 14], [122, 16], [120, 19],
      [118, 18],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// OCEANIA
// ═══════════════════════════════════════════════════════════════

const OCEANIA: CountryData[] = [
  {
    code: 'AU', name: 'Australia', region: 'OCEANIA',
    labelCoordinates: [134, -25],
    polygon: [
      [115, -14], [119, -15], [125, -14], [131, -12],
      [137, -13], [141, -14], [146, -17], [150, -23],
      [153, -29], [150, -33], [147, -37], [146, -39],
      [141, -38], [137, -36], [130, -32], [122, -34],
      [115, -34], [113, -25], [114, -21], [115, -14],
    ],
  },
  {
    code: 'NZ', name: 'New Zealand', region: 'OCEANIA',
    labelCoordinates: [174, -41],
    polygon: [
      [167, -44], [169, -45], [172, -46], [172, -42],
      [175, -37], [178, -37], [176, -36], [173, -35],
      [170, -41], [167, -44],
    ],
  },
  {
    code: 'PG', name: 'Papua New Guinea', region: 'OCEANIA',
    labelCoordinates: [147, -6],
    polygon: [
      [141, -2], [143, -3], [147, -5], [150, -7],
      [152, -5], [150, -3], [146, -2], [141, -2],
    ],
  },
  {
    code: 'ID', name: 'Indonesia', region: 'OCEANIA',
    labelCoordinates: [115, -2],
    polygon: [
      [95, 6], [100, 3], [105, -2], [106, -6], [108, -8],
      [115, -8], [120, -5], [125, -5], [130, -3], [135, -3],
      [140, -2], [140, -8], [130, -8], [120, -8], [110, -8],
      [105, -6], [100, -3], [96, 2], [95, 6],
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════

/** All country polygons combined */
export const COUNTRY_POLYGONS: CountryData[] = [
  ...NORTH_AMERICA,
  ...SOUTH_AMERICA,
  ...EUROPE,
  ...AFRICA,
  ...MIDDLE_EAST,
  ...SOUTH_ASIA,
  ...EAST_ASIA,
  ...OCEANIA,
];

// Pre-compute bounding boxes for fast rejection during rasterization
interface PreparedCountry {
  code: string;
  name: string;
  region: Region;
  labelCoordinates: [number, number];
  polygon: [number, number][];
  bbox: { lonMin: number; lonMax: number; latMin: number; latMax: number };
}

function computeBBox(polygon: [number, number][]): {
  lonMin: number; lonMax: number; latMin: number; latMax: number;
} {
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

export const PREPARED_COUNTRIES: PreparedCountry[] = COUNTRY_POLYGONS.map((c) => ({
  ...c,
  bbox: computeBBox(c.polygon),
}));

/** Look up country at a given lon/lat coordinate (returns first match) */
export function getCountryAt(lon: number, lat: number): CountryData | null {
  for (const pc of PREPARED_COUNTRIES) {
    // Fast bbox rejection
    if (lon < pc.bbox.lonMin || lon > pc.bbox.lonMax ||
        lat < pc.bbox.latMin || lat > pc.bbox.latMax) {
      continue;
    }
    if (pointInPolygon(lon, lat, pc.polygon)) {
      return pc;
    }
  }
  return null;
}

/** Ray-casting point-in-polygon test */
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

/** Get all countries in a region */
export function getCountriesByRegion(region: Region): CountryData[] {
  return COUNTRY_POLYGONS.filter((c) => c.region === region);
}

/** Total count */
export const COUNTRY_COUNT = COUNTRY_POLYGONS.length;
