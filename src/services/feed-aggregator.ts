import type { FeedItem, FeedCategory, FeedFocusMode } from '@/types';
import { FEED_MAX_ITEMS, FEED_MAX_AGE_HOURS } from '@/config/constants';
import { getFocusModeWeight } from '@/config/feed-modes';
import { SOURCE_DIVERSITY_CONFIG, getSourceByName } from '@/config/feed-sources';

interface AggregateOptions {
  maxItems?: number;
  categories?: string[];
  searchTerm?: string;
  focusMode?: FeedFocusMode;
  sourceDiversityEnabled?: boolean;
}

// ─── Source diversity balancing ───

export function applySourceDiversity(items: FeedItem[]): FeedItem[] {
  const config = SOURCE_DIVERSITY_CONFIG;
  if (!config.enabled) return items;

  const now = Date.now();
  const windowCutoff = now - config.diversityWindowMinutes * 60 * 1000;

  // Group items by source name
  const sourceGroups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const group = sourceGroups.get(item.source) || [];
    group.push(item);
    sourceGroups.set(item.source, group);
  }

  // Sort each group by recency (newest first)
  for (const group of sourceGroups.values()) {
    group.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }

  const result: FeedItem[] = [];

  for (const [sourceName, group] of sourceGroups) {
    // Compute effective cap based on source priority
    const sourceConfig = getSourceByName(sourceName);
    const priorityKey = sourceConfig?.priority ?? 'medium';
    const boost = config.priorityBoost[priorityKey];
    const effectiveCap = Math.max(
      config.minSourceRepresentation,
      Math.round(config.maxItemsPerSource * boost)
    );

    // Split into items within the diversity window vs. older
    const withinWindow = group.filter(i => i.pubDate.getTime() >= windowCutoff);
    const olderItems = group.filter(i => i.pubDate.getTime() < windowCutoff);

    // Take up to effectiveCap from within the window
    const taken = withinWindow.slice(0, effectiveCap);

    // Backfill from older items to guarantee minimum representation
    if (taken.length < config.minSourceRepresentation && olderItems.length > 0) {
      const backfillCount = config.minSourceRepresentation - taken.length;
      taken.push(...olderItems.slice(0, backfillCount));
    }

    result.push(...taken);
  }

  return result;
}

// ─── Main aggregation pipeline ───

export function aggregateFeeds(
  feedResults: FeedItem[][],
  options?: AggregateOptions
): FeedItem[] {
  const cutoff = Date.now() - FEED_MAX_AGE_HOURS * 60 * 60 * 1000;
  let items = feedResults.flat().filter((item) => item.pubDate.getTime() > cutoff);

  // Deduplicate by source + title similarity
  // Include source in key so same headline from different outlets both appear,
  // while true duplicates from the same source are still caught.
  const seen = new Set<string>();
  items = items.filter((item) => {
    const title = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    const key = `${item.source}:${title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter by category
  if (options?.categories?.length) {
    items = items.filter((item) => options.categories!.includes(item.category));
  }

  // Filter by search
  if (options?.searchTerm) {
    const term = options.searchTerm.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.source.toLowerCase().includes(term) ||
        item.snippet.toLowerCase().includes(term)
    );
  }

  // ─── Source diversity balancing ───
  const diversityEnabled = options?.sourceDiversityEnabled ?? true;
  if (diversityEnabled) {
    items = applySourceDiversity(items);
  }

  const maxItems = options?.maxItems ?? FEED_MAX_ITEMS;
  const focusMode = options?.focusMode ?? 'all';

  // ─── Focus mode: category-balanced sampling ───
  if (focusMode !== 'all') {
    // Group by category
    const groups = new Map<FeedCategory, FeedItem[]>();
    for (const item of items) {
      const list = groups.get(item.category) || [];
      list.push(item);
      groups.set(item.category, list);
    }

    // Sort each group by recency
    for (const list of groups.values()) {
      list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }

    // Compute weighted budget
    let totalWeight = 0;
    for (const [cat, list] of groups) {
      const w = getFocusModeWeight(focusMode, cat);
      totalWeight += w * list.length;
    }

    // Allocate slots
    const sampled: FeedItem[] = [];
    for (const [cat, list] of groups) {
      const w = getFocusModeWeight(focusMode, cat);
      const share = (w * list.length) / totalWeight;
      const slots = Math.max(1, Math.round(share * maxItems));
      sampled.push(...list.slice(0, Math.min(slots, list.length)));
    }

    // Final sort and limit
    sampled.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    return sampled.slice(0, maxItems);
  }

  // ─── Default (all mode): pure recency ───
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return items.slice(0, maxItems);
}
