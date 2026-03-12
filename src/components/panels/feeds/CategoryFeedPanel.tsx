/**
 * CategoryFeedPanel — Reusable filtered feed panel.
 *
 * Accepts a set of FeedCategory filters and renders a ScrollingFeed
 * with keyword-based severity classification. Thin wrappers use this
 * for category-specific panels (Defense, Finance, Energy, etc.).
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES, CATEGORY_LABELS } from '@/config/feed-sources';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

// Severity classification keywords
const CRITICAL_KEYWORDS = /nuclear|missile|invasion|attack\b|war\b|strike|bomb|escalat|weapon|terror|tsunami|catastroph/i;
const IMPORTANT_KEYWORDS = /military|sanction|conflict|deploy|troops|intel|defense|security|cyber|hack|breach|nato|urgent|crisis|emergency|threat/i;

interface CategoryFeedPanelProps {
  title: string;
  categories: FeedCategory[];
  maxItems?: number;
  /** Optional extra keyword patterns for severity boosting */
  criticalPatterns?: RegExp;
  importantPatterns?: RegExp;
}

function classifySeverity(
  item: FeedItem,
  extraCritical?: RegExp,
  extraImportant?: RegExp,
): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_KEYWORDS.test(text)) return 'critical';
  if (extraCritical?.test(text)) return 'critical';
  if (IMPORTANT_KEYWORDS.test(text)) return 'important';
  if (extraImportant?.test(text)) return 'important';
  return 'normal';
}

export function CategoryFeedPanel({
  title,
  categories,
  maxItems = 80,
  criticalPatterns,
  importantPatterns,
}: CategoryFeedPanelProps) {
  const filteredSources = useMemo(
    () => FEED_SOURCES.filter((f) => categories.includes(f.category)),
    [categories],
  );

  const { feeds, isLoading, errors } = useMultipleFeeds(filteredSources);
  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  const entries: FeedEntry[] = useMemo(() => {
    return feeds
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, maxItems)
      .map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: classifySeverity(item, criticalPatterns, importantPatterns),
      }));
  }, [feeds, maxItems, criticalPatterns, importantPatterns]);

  const criticalCount = entries.filter((e) => e.severity === 'critical').length;

  // Category summary
  const categoryLabels = categories
    .map((c) => CATEGORY_LABELS[c] || c.toUpperCase())
    .join(' · ');

  return (
    <TerminalWindow
      title={title}
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {criticalCount > 0 && (
            <span className="text-terminal-red">{criticalCount} CRIT</span>
          )}
          <span className="text-terminal-primary-dim">{entries.length} items</span>
        </div>
      }
    >
      {entries.length > 0 ? (
        <>
          <div className="text-[8px] text-terminal-primary-dim px-1 pb-1 border-b border-terminal-border mb-1">
            {categoryLabels}
          </div>
          <ScrollingFeed items={entries} maxVisible={maxItems} showTimestamps />
        </>
      ) : (
        <div className="text-terminal-primary-dim text-xs p-2">
          {isLoading ? 'Loading feeds...' : 'No data available'}
        </div>
      )}
    </TerminalWindow>
  );
}
