/**
 * Map event conversion utilities.
 *
 * Delegates to event-normalizer.ts for the actual conversion logic.
 * This file is maintained for backward compatibility with existing
 * component imports.
 */

import type { Earthquake, FeedItem, MapEvent, FeedFocusMode } from '@/types';
import {
  normalizeEarthquake,
  normalizeEarthquakes,
  normalizeFeedItem,
  normalizeFeedItems,
  normalizeNaturalEvents,
  normalizeReliefWebDisasters,
  normalizeGDACSAlerts,
  normalizeACLEDEvents,
  regionFromCoordinates,
} from '@/services/event-normalizer';

// ─── Re-exports for backward compatibility ───

export {
  regionFromCoordinates,
  normalizeNaturalEvents,
  normalizeReliefWebDisasters,
  normalizeGDACSAlerts,
  normalizeACLEDEvents,
};

// ─── Earthquake → MapEvent ───

export function earthquakeToMapEvent(eq: Earthquake): MapEvent {
  return normalizeEarthquake(eq);
}

// ─── FeedItem → MapEvent ───

export function feedItemToMapEvent(item: FeedItem, index: number): MapEvent {
  return normalizeFeedItem(item, index);
}

// ─── Batch converters ───

export function earthquakesToMapEvents(earthquakes: Earthquake[]): MapEvent[] {
  return normalizeEarthquakes(earthquakes);
}

export function feedItemsToMapEvents(
  items: FeedItem[],
  maxItems = 200,
  focusMode: FeedFocusMode = 'all',
): MapEvent[] {
  return normalizeFeedItems(items, maxItems, focusMode);
}

// ─── Helpers ───

/** Format relative time for display */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
