import type { Region, FeedCategory } from '@/types';

/**
 * Shared region ↔ feed category mapping.
 * Used by RegionMonitor, LiveFeed, IntelFeed, ConflictTracker, and the map
 * to create bidirectional focus: clicking a region filters feeds,
 * clicking a regional feed item highlights the region on the map.
 */
export const REGION_CATEGORIES: Record<Region, FeedCategory[]> = {
  'NORTH AMERICA': ['us-news', 'government'],
  'SOUTH AMERICA': ['regional-latam', 'world-news'],
  'EUROPE': ['regional-europe', 'world-news'],
  'MIDDLE EAST': ['regional-mideast', 'defense', 'world-news'],
  'AFRICA': ['regional-africa', 'world-news'],
  'SOUTH ASIA': ['regional-asia', 'world-news'],
  'EAST ASIA': ['regional-asia', 'tech', 'world-news'],
  'OCEANIA': ['world-news'],
};

/** Reverse lookup: given a feed category, which regions does it map to? */
export const CATEGORY_TO_REGIONS: Record<string, Region[]> = {};

// Build reverse mapping
for (const [region, categories] of Object.entries(REGION_CATEGORIES)) {
  for (const cat of categories) {
    if (!CATEGORY_TO_REGIONS[cat]) CATEGORY_TO_REGIONS[cat] = [];
    if (!CATEGORY_TO_REGIONS[cat].includes(region as Region)) {
      CATEGORY_TO_REGIONS[cat].push(region as Region);
    }
  }
}

/** All regions in display order */
export const ALL_REGIONS: Region[] = [
  'NORTH AMERICA', 'SOUTH AMERICA', 'EUROPE', 'MIDDLE EAST',
  'AFRICA', 'SOUTH ASIA', 'EAST ASIA', 'OCEANIA',
];

/**
 * Infer region from feed item text content.
 * Used by ConflictTracker and map event placement.
 */
export function inferRegionFromText(text: string): Region {
  const t = text.toLowerCase();
  if (/ukraine|russia|europe|nato|eu\b|france|germany|uk\b|britain|poland|kyiv|moscow/i.test(t)) return 'EUROPE';
  if (/china|japan|korea|taiwan|pacific|indo-pacific|philippines|asean|beijing|tokyo/i.test(t)) return 'EAST ASIA';
  if (/iran|iraq|syria|israel|gaza|yemen|saudi|lebanon|palestine|houthi|tehran/i.test(t)) return 'MIDDLE EAST';
  if (/india|pakistan|afghan|bangladesh|sri lanka|nepal|delhi|mumbai/i.test(t)) return 'SOUTH ASIA';
  if (/africa|sahel|sudan|ethiopia|congo|somalia|nigeria|libya|kenya|egypt/i.test(t)) return 'AFRICA';
  if (/latin|brazil|venezuela|colombia|mexico|cartel|argentina|chile|peru/i.test(t)) return 'SOUTH AMERICA';
  if (/australia|new zealand|fiji|samoa|tonga|papua/i.test(t)) return 'OCEANIA';
  if (/us\b|america|pentagon|washington|congress|white house|biden|trump/i.test(t)) return 'NORTH AMERICA';
  return 'EUROPE'; // fallback
}

/**
 * Given a feed category, infer the primary region.
 * Used for region focus when clicking a feed item.
 */
export function categoryToRegion(category: FeedCategory): Region | null {
  switch (category) {
    case 'us-news':
    case 'government':
      return 'NORTH AMERICA';
    case 'regional-europe':
      return 'EUROPE';
    case 'regional-mideast':
      return 'MIDDLE EAST';
    case 'regional-asia':
      return 'EAST ASIA';
    case 'regional-africa':
      return 'AFRICA';
    case 'regional-latam':
      return 'SOUTH AMERICA';
    default:
      return null; // global categories don't map to a single region
  }
}
