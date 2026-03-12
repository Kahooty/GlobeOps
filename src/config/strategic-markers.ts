/**
 * Strategic geographic markers for the ASCII world map ambient layer.
 *
 * These are hardcoded geographic points that add visual richness to the map
 * at higher zoom levels — waterways, financial centers, tech hubs, and
 * sub-region labels. They create the impression of a rich intelligence layer
 * without requiring real-time data feeds.
 */

export interface StrategicMarker {
  id: string;
  coordinates: [lon: number, lat: number];
  label: string;
  shortLabel: string;
  category: 'waterway' | 'financial' | 'tech';
  minZoom: number;
}

export interface SubRegionLabel {
  coordinates: [lon: number, lat: number];
  label: string;
  shortLabel: string;
  minZoom: number;
}

// ─── Strategic Waterways & Chokepoints ───

export const STRATEGIC_MARKERS: StrategicMarker[] = [
  // Waterways
  { id: 'hormuz',    coordinates: [56.3, 26.6],   label: 'STRAIT OF HORMUZ',    shortLabel: '~HORMUZ~',    category: 'waterway',  minZoom: 3 },
  { id: 'malacca',   coordinates: [101.5, 2.5],    label: 'STRAIT OF MALACCA',   shortLabel: '~MALACCA~',   category: 'waterway',  minZoom: 3 },
  { id: 'suez',      coordinates: [32.3, 30.5],    label: 'SUEZ CANAL',           shortLabel: '~SUEZ~',      category: 'waterway',  minZoom: 3 },
  { id: 'panama',    coordinates: [-79.5, 9.0],    label: 'PANAMA CANAL',         shortLabel: '~PANAMA~',    category: 'waterway',  minZoom: 3 },
  { id: 'bosporus',  coordinates: [29.0, 41.0],    label: 'BOSPORUS STRAIT',      shortLabel: '~BOSPORUS~',  category: 'waterway',  minZoom: 4 },
  { id: 'gibraltar', coordinates: [-5.6, 35.9],    label: 'STRAIT OF GIBRALTAR',  shortLabel: '~GIBRALTAR~', category: 'waterway',  minZoom: 4 },
  { id: 'taiwan',    coordinates: [119.5, 24.0],   label: 'TAIWAN STRAIT',        shortLabel: '~TAIWAN~',    category: 'waterway',  minZoom: 3 },
  { id: 'bab',       coordinates: [43.3, 12.6],    label: 'BAB EL-MANDEB',        shortLabel: '~BAB~',       category: 'waterway',  minZoom: 4 },

  // Financial centers
  { id: 'nyc',       coordinates: [-74.0, 40.7],   label: 'NEW YORK',     shortLabel: '$NYC', category: 'financial', minZoom: 3 },
  { id: 'london',    coordinates: [-0.1, 51.5],    label: 'LONDON',       shortLabel: '$LON', category: 'financial', minZoom: 3 },
  { id: 'tokyo',     coordinates: [139.7, 35.7],   label: 'TOKYO',        shortLabel: '$TYO', category: 'financial', minZoom: 3 },
  { id: 'hkg',       coordinates: [114.2, 22.3],   label: 'HONG KONG',    shortLabel: '$HKG', category: 'financial', minZoom: 4 },
  { id: 'shanghai',  coordinates: [121.5, 31.2],   label: 'SHANGHAI',     shortLabel: '$SHA', category: 'financial', minZoom: 4 },
  { id: 'frankfurt', coordinates: [8.7, 50.1],     label: 'FRANKFURT',    shortLabel: '$FRA', category: 'financial', minZoom: 4 },
  { id: 'singapore', coordinates: [103.8, 1.3],    label: 'SINGAPORE',    shortLabel: '$SIN', category: 'financial', minZoom: 4 },
  { id: 'mumbai',    coordinates: [72.9, 19.1],    label: 'MUMBAI',       shortLabel: '$MUM', category: 'financial', minZoom: 4 },

  // Tech hubs
  { id: 'sv',        coordinates: [-122.0, 37.4],  label: 'SILICON VALLEY', shortLabel: '@SV',  category: 'tech', minZoom: 4 },
  { id: 'shenzhen',  coordinates: [114.1, 22.5],   label: 'SHENZHEN',       shortLabel: '@SZ',  category: 'tech', minZoom: 4 },
  { id: 'bangalore', coordinates: [77.6, 13.0],    label: 'BENGALURU',      shortLabel: '@BNG', category: 'tech', minZoom: 4 },
  { id: 'seoul',     coordinates: [127.0, 37.6],   label: 'SEOUL',          shortLabel: '@SEL', category: 'tech', minZoom: 4 },
  { id: 'tel-aviv',  coordinates: [34.8, 32.1],    label: 'TEL AVIV',       shortLabel: '@TLV', category: 'tech', minZoom: 4 },
  { id: 'berlin',    coordinates: [13.4, 52.5],    label: 'BERLIN',         shortLabel: '@BER', category: 'tech', minZoom: 5 },
];

// ─── Sub-Region Labels (appear at Z:3+) ───

export const SUB_REGION_LABELS: SubRegionLabel[] = [
  { coordinates: [35, 33],     label: 'LEVANT',          shortLabel: 'LEVANT',    minZoom: 3 },
  { coordinates: [50, 25],     label: 'PERSIAN GULF',    shortLabel: 'GULF',      minZoom: 3 },
  { coordinates: [45, 5],      label: 'HORN OF AFRICA',  shortLabel: 'HORN',      minZoom: 3 },
  { coordinates: [25, -5],     label: 'CENTRAL AFRICA',  shortLabel: 'C.AFRICA',  minZoom: 3 },
  { coordinates: [0, 48],      label: 'WESTERN EUROPE',  shortLabel: 'W.EUR',     minZoom: 3 },
  { coordinates: [30, 55],     label: 'EASTERN EUROPE',  shortLabel: 'E.EUR',     minZoom: 3 },
  { coordinates: [70, 30],     label: 'SOUTH ASIA',      shortLabel: 'S.ASIA',    minZoom: 3 },
  { coordinates: [105, 15],    label: 'SOUTHEAST ASIA',  shortLabel: 'SE.ASIA',   minZoom: 3 },
  { coordinates: [120, 40],    label: 'EAST ASIA',       shortLabel: 'E.ASIA',    minZoom: 3 },
  { coordinates: [-95, 38],    label: 'CENTRAL US',      shortLabel: 'C.US',      minZoom: 3 },
  { coordinates: [-60, -15],   label: 'AMAZON BASIN',    shortLabel: 'AMAZON',    minZoom: 3 },
  { coordinates: [15, 62],     label: 'SCANDINAVIA',     shortLabel: 'SCAND',     minZoom: 3 },
  { coordinates: [90, 42],     label: 'CENTRAL ASIA',    shortLabel: 'C.ASIA',    minZoom: 3 },
  { coordinates: [-15, 20],    label: 'SAHEL',           shortLabel: 'SAHEL',     minZoom: 4 },
  { coordinates: [140, -25],   label: 'AUSTRALIA',       shortLabel: 'AUS',       minZoom: 3 },
  { coordinates: [-70, -35],   label: 'SOUTHERN CONE',   shortLabel: 'S.CONE',    minZoom: 4 },
];

// ─── Region labels for Z:0-2 (main regions) ───

export const REGION_LABELS: Array<{
  coordinates: [lon: number, lat: number];
  label: string;
  shortLabel: string;
}> = [
  { coordinates: [-100, 45],  label: 'NORTH AMERICA', shortLabel: 'NAMERICA' },
  { coordinates: [-60, -15],  label: 'SOUTH AMERICA', shortLabel: 'SAMERICA' },
  { coordinates: [15, 50],    label: 'EUROPE',        shortLabel: 'EUR' },
  { coordinates: [45, 28],    label: 'MIDDLE EAST',   shortLabel: 'MIDEAST' },
  { coordinates: [20, 5],     label: 'AFRICA',        shortLabel: 'AFRICA' },
  { coordinates: [80, 22],    label: 'SOUTH ASIA',    shortLabel: 'SASIA' },
  { coordinates: [115, 35],   label: 'EAST ASIA',     shortLabel: 'EASIA' },
  { coordinates: [140, -25],  label: 'OCEANIA',       shortLabel: 'OCEANIA' },
];
