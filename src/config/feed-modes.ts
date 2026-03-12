/**
 * Feed Focus Modes — master category weighting presets.
 *
 * Two modes above layouts that drive which content dominates:
 * - OPS: news, defense, conflict, humanitarian, regional, cyber, climate
 * - MKT: finance, tech, science, energy, commodities
 * - ALL: balanced (no weighting override)
 *
 * When active, de-prioritized categories still appear but get reduced
 * budget in the aggregator (max ~10% vs. equal share).
 */

import type { FeedCategory, FeedFocusMode } from '@/types';

export interface FeedModeConfig {
  mode: FeedFocusMode;
  label: string;
  description: string;
  /** Categories that get full weight (3x) */
  prioritized: FeedCategory[];
  /** Categories that get reduced weight (0.3x) */
  deprioritized: FeedCategory[];
}

export const FEED_MODES: Record<FeedFocusMode, FeedModeConfig> = {
  ops: {
    mode: 'ops',
    label: 'OPS',
    description: 'News, defense, conflict, humanitarian, regional focus',
    prioritized: [
      'world-news', 'us-news', 'defense', 'government',
      'humanitarian', 'cybersecurity', 'climate',
      'regional-europe', 'regional-mideast', 'regional-africa',
      'regional-asia', 'regional-latam',
      'think-tanks',
    ],
    deprioritized: [
      'tech', 'science', 'finance', 'commodities',
    ],
  },
  markets: {
    mode: 'markets',
    label: 'MKT',
    description: 'Finance, tech, science, energy, commodities focus',
    prioritized: [
      'finance', 'tech', 'science', 'energy', 'commodities',
    ],
    deprioritized: [
      'defense', 'humanitarian', 'government', 'think-tanks',
      'regional-europe', 'regional-mideast', 'regional-africa',
      'regional-asia', 'regional-latam',
    ],
  },
  all: {
    mode: 'all',
    label: 'ALL',
    description: 'Balanced view across all categories',
    prioritized: [],
    deprioritized: [],
  },
};

/**
 * Get category weight multiplier for a given focus mode.
 * Returns 3.0 for prioritized, 0.3 for deprioritized, 1.0 for neutral/all mode.
 */
export function getFocusModeWeight(mode: FeedFocusMode, category: FeedCategory): number {
  if (mode === 'all') return 1.0;
  const config = FEED_MODES[mode];
  if (config.prioritized.includes(category)) return 3.0;
  if (config.deprioritized.includes(category)) return 0.3;
  return 1.0;
}
