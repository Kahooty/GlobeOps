import { useMemo, useCallback, useState } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { CommandLine } from '@/components/terminal/CommandLine';
import { FeedFilterPopup, type FilterOption } from '@/components/terminal/FeedFilterPopup';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { aggregateFeeds } from '@/services/feed-aggregator';
import { useAppStore } from '@/store/app-store';
import { FEED_SOURCES, CATEGORY_LABELS } from '@/config/feed-sources';
import { REGION_CATEGORIES, inferRegionFromText, categoryToRegion } from '@/config/regions';
import type { FeedCategory, PanelStatus } from '@/types';
import { safeOpenLink } from '@/utils/safe-open';

const ALL_FEED_CATEGORIES: FeedCategory[] = [
  'world-news', 'us-news', 'defense', 'government', 'think-tanks',
  'finance', 'tech', 'science', 'energy', 'humanitarian',
  'cybersecurity', 'climate', 'commodities',
  'regional-asia', 'regional-europe', 'regional-mideast', 'regional-africa', 'regional-latam',
];

const FILTER_OPTIONS: FilterOption[] = ALL_FEED_CATEGORIES.map((cat) => ({
  id: cat,
  label: CATEGORY_LABELS[cat] ?? cat.toUpperCase(),
}));

export function LiveFeed() {
  const { activeCategories, searchTerm, setSearchTerm, selectedRegion, setSelectedRegion, feedFocusMode } = useAppStore();
  const { feeds, isLoading, sourceStatuses } = useMultipleFeeds(FEED_SOURCES);
  const [showFilter, setShowFilter] = useState(false);

  // Build enabled set from store (empty = all enabled)
  const enabledCategories = useMemo(() => {
    if (activeCategories.length === 0) return new Set(ALL_FEED_CATEGORIES as string[]);
    return new Set(activeCategories);
  }, [activeCategories]);

  const toggleCategory = useAppStore((s) => s.toggleCategory);

  const handleToggle = useCallback((id: string) => {
    toggleCategory(id);
  }, [toggleCategory]);

  const handleSetAll = useCallback((ids: string[]) => {
    // If setting all → clear store (empty = all); otherwise set only those
    if (ids.length === ALL_FEED_CATEGORIES.length || ids.length === 0) {
      // Reset to empty (all enabled)
      for (const cat of activeCategories) {
        toggleCategory(cat);
      }
    } else {
      // Remove current, add new
      for (const cat of activeCategories) {
        if (!ids.includes(cat)) toggleCategory(cat);
      }
      for (const id of ids) {
        if (!activeCategories.includes(id)) toggleCategory(id);
      }
    }
  }, [activeCategories, toggleCategory]);

  const aggregated = useMemo(() => {
    let items = aggregateFeeds([feeds], {
      categories: activeCategories.length > 0 ? activeCategories : undefined,
      searchTerm: searchTerm || undefined,
      focusMode: feedFocusMode,
    });

    // Region focus: when a region is selected, further filter to items matching that region
    if (selectedRegion) {
      const regionCats = new Set(REGION_CATEGORIES[selectedRegion]);
      items = items.filter((item) =>
        regionCats.has(item.category) ||
        inferRegionFromText(`${item.title} ${item.snippet}`) === selectedRegion
      );
    }

    return items;
  }, [feeds, activeCategories, searchTerm, selectedRegion, feedFocusMode]);

  const feedEntries: FeedEntry[] = useMemo(
    () =>
      aggregated.map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: 'normal' as const,
      })),
    [aggregated]
  );

  const status: PanelStatus = isLoading
    ? 'loading'
    : sourceStatuses.some((s) => !s.isError && !s.isStale)
      ? 'live'
      : sourceStatuses.every((s) => s.isError)
        ? 'error'
        : 'stale';

  const handleCommand = useCallback(
    (cmd: string) => {
      const parts = cmd.split(':');
      if (parts.length === 2 && parts[0] === 'search') {
        setSearchTerm(parts[1].trim());
      } else if (cmd === 'clear') {
        setSearchTerm('');
      } else {
        setSearchTerm(cmd);
      }
    },
    [setSearchTerm]
  );

  const handleItemClick = useCallback((id: string) => {
    const item = aggregated.find((i) => i.id === id);
    if (!item) return;

    // Set region focus from the clicked item's category or content
    const region = categoryToRegion(item.category) ??
      inferRegionFromText(`${item.title} ${item.snippet}`);
    if (region) setSelectedRegion(region);

    if (item.link) safeOpenLink(item.link);
  }, [aggregated, setSelectedRegion]);

  return (
    <TerminalWindow
      title="LIVE FEED"
      status={status}
      headerRight={
        <div className="relative flex items-center gap-2">
          {selectedRegion && (
            <button
              className="text-[9px] text-terminal-cyan hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={() => setSelectedRegion(null)}
            >
              {selectedRegion} [×]
            </button>
          )}
          <span className="text-terminal-primary-dim text-[9px]">
            {aggregated.length} items
          </span>
          <button
            className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => setShowFilter(!showFilter)}
          >
            [FILTER]
          </button>
          {showFilter && (
            <FeedFilterPopup
              title="FEED FILTER"
              options={FILTER_OPTIONS}
              enabledIds={enabledCategories}
              onToggle={handleToggle}
              onSetAll={handleSetAll}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <ScrollingFeed
          items={feedEntries}
          showTimestamps
          onItemClick={handleItemClick}
        />
        <CommandLine
          prompt="filter> "
          placeholder="search term or 'clear'"
          onCommand={handleCommand}
        />
      </div>
    </TerminalWindow>
  );
}
