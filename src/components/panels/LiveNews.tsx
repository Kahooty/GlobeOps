/**
 * LiveNews — 30-minute breaking news aggregation panel.
 *
 * Aggregates high-priority feeds and displays the most recent
 * breaking news items with auto-scroll. Focuses on the last 30
 * minutes of news from top-tier sources.
 *
 * Unlike LiveFeed (which shows all categories), LiveNews filters
 * to high-priority world news, defense, and government sources only.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { aggregateFeeds } from '@/services/feed-aggregator';
import { useAppStore } from '@/store/app-store';
import { FEED_SOURCES } from '@/config/feed-sources';
import { REGION_CATEGORIES, inferRegionFromText, categoryToRegion } from '@/config/regions';
import type { PanelStatus } from '@/types';
import { safeOpenLink } from '@/utils/safe-open';

// Breaking news categories — expanded to capture regional + humanitarian sources
const BREAKING_CATEGORIES = [
  'world-news', 'us-news', 'defense', 'government',
  'regional-europe', 'regional-mideast',
  'regional-asia', 'regional-africa', 'regional-latam',
  'humanitarian',
];

// Filter to high and medium priority sources in breaking categories
const BREAKING_SOURCES = FEED_SOURCES.filter(
  (f) => BREAKING_CATEGORIES.includes(f.category) && (f.priority === 'high' || f.priority === 'medium')
);

export function LiveNews() {
  const { selectedRegion, setSelectedRegion, feedFocusMode } = useAppStore();
  const { feeds, isLoading, sourceStatuses } = useMultipleFeeds(BREAKING_SOURCES);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 800);
    return () => clearInterval(interval);
  }, []);

  // Region filter helper
  const regionFilter = useMemo(() => {
    if (!selectedRegion) return null;
    const regionCats = new Set(REGION_CATEGORIES[selectedRegion]);
    return (item: { category: string; title: string; snippet: string }) =>
      regionCats.has(item.category as import('@/types').FeedCategory) ||
      inferRegionFromText(`${item.title} ${item.snippet}`) === selectedRegion;
  }, [selectedRegion]);

  // Get items from last 30 minutes, sorted newest first
  const breakingItems = useMemo(() => {
    const aggregated = aggregateFeeds([feeds], { focusMode: feedFocusMode });
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    let items = aggregated.filter((item) => item.pubDate >= thirtyMinAgo);
    if (regionFilter) items = items.filter(regionFilter);

    return items
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 50);
  }, [feeds, regionFilter, feedFocusMode]);

  // Also get recent items (last 2 hours) as fallback
  const recentItems = useMemo(() => {
    const aggregated = aggregateFeeds([feeds], { focusMode: feedFocusMode });
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    let items = aggregated.filter((item) => item.pubDate >= twoHoursAgo);
    if (regionFilter) items = items.filter(regionFilter);

    return items
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 50);
  }, [feeds, regionFilter, feedFocusMode]);

  const displayItems = breakingItems.length >= 3 ? breakingItems : recentItems;

  const feedEntries: FeedEntry[] = useMemo(
    () =>
      displayItems.map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: breakingItems.includes(item) ? 'critical' as const : 'normal' as const,
      })),
    [displayItems, breakingItems]
  );

  const status: PanelStatus = isLoading
    ? 'loading'
    : sourceStatuses.some((s) => !s.isError && !s.isStale)
      ? 'live'
      : 'stale';

  const isBreaking = breakingItems.length >= 3;

  const handleItemClick = useCallback((id: string) => {
    const item = displayItems.find((i) => i.id === id);
    if (!item) return;

    // Set region focus from clicked item
    const region = categoryToRegion(item.category) ??
      inferRegionFromText(`${item.title} ${item.snippet}`);
    if (region) setSelectedRegion(region);

    if (item.link) safeOpenLink(item.link);
  }, [displayItems, setSelectedRegion]);

  return (
    <TerminalWindow
      title="LIVE NEWS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2">
          {selectedRegion && (
            <button
              className="text-[9px] text-terminal-cyan hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={() => setSelectedRegion(null)}
            >
              {selectedRegion} [×]
            </button>
          )}
          <span
            className="text-[9px] font-bold tracking-wide"
            style={{
              color: isBreaking ? 'var(--color-terminal-red)' : 'var(--color-terminal-amber)',
              opacity: isBreaking ? (blink ? 1 : 0.5) : 1,
            }}
          >
            {isBreaking ? 'BREAKING' : 'RECENT'}
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Time window indicator */}
        <div className="px-1 py-0.5 text-[8px] text-terminal-primary-dim border-b border-terminal-border">
          {isBreaking ? (
            <span style={{ color: 'var(--color-terminal-red)' }}>
              {'\u25CF'} BREAKING — {breakingItems.length} items in last 30 min
            </span>
          ) : (
            <span>
              {'\u25CB'} {recentItems.length} items in last 2 hours
            </span>
          )}
          <span className="ml-2">
            {BREAKING_SOURCES.length} sources active
          </span>
        </div>

        <ScrollingFeed
          items={feedEntries}
          showTimestamps
          onItemClick={handleItemClick}
        />
      </div>
    </TerminalWindow>
  );
}
