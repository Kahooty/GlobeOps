/**
 * IntelFeed — Filtered intelligence feed panel.
 *
 * Aggregates defense, think-tank, government, and cybersecurity RSS feeds
 * into a ScrollingFeed with keyword highlighting and severity tagging.
 */

import { useMemo, useState, useCallback } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { FeedFilterPopup, type FilterOption } from '@/components/terminal/FeedFilterPopup';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { applySourceDiversity } from '@/services/feed-aggregator';
import { useAppStore } from '@/store/app-store';
import { FEED_SOURCES, CATEGORY_LABELS } from '@/config/feed-sources';
import { REGION_CATEGORIES, inferRegionFromText, categoryToRegion } from '@/config/regions';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

// Intel-relevant categories — expanded to capture cross-domain intelligence
const INTEL_CATEGORIES: FeedCategory[] = [
  'defense',
  'think-tanks',
  'government',
  'cybersecurity',
  'world-news',
  'humanitarian',
  'regional-europe',
  'regional-mideast',
  'regional-asia',
];

const CATEGORY_COLORS: Record<string, string> = {
  defense: '--color-terminal-red',
  cybersecurity: '--color-terminal-magenta',
  government: '--color-terminal-cyan',
  'think-tanks': '--color-terminal-amber',
  'world-news': '--color-terminal-primary',
  humanitarian: '--color-terminal-green',
  'regional-europe': '--color-terminal-cyan',
  'regional-mideast': '--color-terminal-red',
  'regional-asia': '--color-terminal-amber',
};

const FILTER_OPTIONS: FilterOption[] = INTEL_CATEGORIES.map((cat) => ({
  id: cat,
  label: CATEGORY_LABELS[cat] ?? cat.toUpperCase(),
  colorVar: CATEGORY_COLORS[cat] ?? '--color-terminal-primary',
}));

// Cross-category keyword injection — items matching these from ANY category
// are included even if their category isn't in enabledCats.
// This catches "NATO cyber operations" from world-news, "Russia sanctions" from finance, etc.
const INTEL_INJECTION_KEYWORDS = /military|defense|security|cyber|intel|sanctions?|espionage|surveillance|nato|nuclear|missile|weapon|arms.control|diplomat|embassy|treaty|ceasefire|blockade|covert|classified|intercept/i;

// Keywords that elevate severity
const CRITICAL_KEYWORDS = /nuclear|missile|invasion|attack|war\b|strike|escalat|weapon|bomb|threat|terror/i;
const IMPORTANT_KEYWORDS = /military|sanction|conflict|deploy|troops|intel|defense|security|cyber|hack|breach|nato|urgent/i;

function classifySeverity(item: FeedItem): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_KEYWORDS.test(text)) return 'critical';
  if (IMPORTANT_KEYWORDS.test(text)) return 'important';
  return 'normal';
}

export function IntelFeed() {
  const { selectedRegion, setSelectedRegion } = useAppStore();
  const [showFilter, setShowFilter] = useState(false);
  const [enabledCats, setEnabledCats] = useState<Set<string>>(new Set(INTEL_CATEGORIES));

  // Subscribe to ALL feeds — useMultipleFeeds deduplicates across panels.
  // Cross-category keyword injection picks up intel-relevant items from any source.
  const { feeds: allFeeds, isLoading, errors } = useMultipleFeeds(FEED_SOURCES);

  // Filter: include if category is enabled OR text matches intel keywords
  const feeds = useMemo(() => {
    let items = allFeeds.filter((item) => {
      if (enabledCats.has(item.category)) return true;
      const text = `${item.title} ${item.snippet}`;
      return INTEL_INJECTION_KEYWORDS.test(text);
    });

    // Region focus: further filter when a region is selected
    if (selectedRegion) {
      const regionCats = new Set(REGION_CATEGORIES[selectedRegion]);
      items = items.filter((item) =>
        regionCats.has(item.category) ||
        inferRegionFromText(`${item.title} ${item.snippet}`) === selectedRegion
      );
    }

    // Apply source diversity to prevent any single feed from dominating
    return applySourceDiversity(items);
  }, [allFeeds, enabledCats, selectedRegion]);

  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  const handleToggle = useCallback((id: string) => {
    setEnabledCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSetAll = useCallback((ids: string[]) => {
    setEnabledCats(new Set(ids));
  }, []);

  const entries: FeedEntry[] = useMemo(() => {
    return feeds
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 100)
      .map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: classifySeverity(item),
      }));
  }, [feeds]);

  const criticalCount = entries.filter((e) => e.severity === 'critical').length;
  const importantCount = entries.filter((e) => e.severity === 'important').length;

  return (
    <TerminalWindow
      title="INTEL FEED"
      status={status}
      headerRight={
        <div className="relative flex items-center gap-2 text-[9px]">
          {selectedRegion && (
            <button
              className="text-terminal-cyan hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={() => setSelectedRegion(null)}
            >
              {selectedRegion} [×]
            </button>
          )}
          {criticalCount > 0 && (
            <span className="text-terminal-red">{criticalCount} CRITICAL</span>
          )}
          {importantCount > 0 && (
            <span className="text-terminal-amber">{importantCount} PRIORITY</span>
          )}
          <span className="text-terminal-primary-dim">{entries.length}</span>
          <button
            className="text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => setShowFilter(!showFilter)}
          >
            [FILTER]
          </button>
          {showFilter && (
            <FeedFilterPopup
              title="INTEL FILTER"
              options={FILTER_OPTIONS}
              enabledIds={enabledCats}
              onToggle={handleToggle}
              onSetAll={handleSetAll}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>
      }
    >
      {entries.length > 0 ? (
        <ScrollingFeed
          items={entries}
          maxVisible={100}
          showTimestamps
          onItemClick={(id) => {
            const item = allFeeds.find((f) => f.id === id);
            if (!item) return;
            const region = categoryToRegion(item.category) ??
              inferRegionFromText(`${item.title} ${item.snippet}`);
            if (region) setSelectedRegion(region);
          }}
        />
      ) : (
        <div className="text-terminal-primary-dim text-xs p-2">
          {isLoading ? 'Loading intelligence feeds...' : 'No intel reports available'}
        </div>
      )}
    </TerminalWindow>
  );
}
