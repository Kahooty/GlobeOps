/**
 * TelegramFeed — OSINT feed from public Telegram channels.
 *
 * Polls curated public Telegram channels via rsshub.app RSS bridges.
 * Displays messages from conflict monitoring, defense intelligence,
 * and breaking news channels in a scrolling terminal feed.
 *
 * Channel categories: conflict, intel, defense, breaking, analysis.
 * Updates every 5 minutes via RSS proxy.
 */

import { useMemo, useCallback, useState } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { CommandLine } from '@/components/terminal/CommandLine';
import { FeedFilterPopup, type FilterOption } from '@/components/terminal/FeedFilterPopup';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import type { FeedSource, PanelStatus } from '@/types';
import { REFRESH } from '@/config/constants';
import {
  TELEGRAM_CHANNELS,
  getTelegramRssUrl,
  TELEGRAM_CATEGORY_LABELS,
} from '@/services/telegram-service';
import { safeOpenLink } from '@/utils/safe-open';

// Telegram channel category filter options
const TG_CATEGORIES = ['conflict', 'intel', 'defense', 'breaking', 'analysis'] as const;
const TG_FILTER_OPTIONS: FilterOption[] = TG_CATEGORIES.map((cat) => ({
  id: cat,
  label: TELEGRAM_CATEGORY_LABELS[cat] ?? cat.toUpperCase(),
  colorVar: cat === 'conflict' ? '--color-terminal-red'
    : cat === 'intel' ? '--color-terminal-cyan'
    : cat === 'breaking' ? '--color-terminal-amber'
    : '--color-terminal-primary',
}));

export function TelegramFeed() {
  const [filter, setFilter] = useState<string>('');
  const [showCatFilter, setShowCatFilter] = useState(false);
  const [enabledCats, setEnabledCats] = useState<Set<string>>(new Set(TG_CATEGORIES));

  // Build feed sources from enabled categories
  const telegramFeedSources: FeedSource[] = useMemo(
    () =>
      TELEGRAM_CHANNELS
        .filter((ch) => enabledCats.has(ch.category))
        .map((ch) => ({
          id: ch.id,
          name: ch.name,
          url: getTelegramRssUrl(ch.handle),
          category: 'defense' as const,
          refreshInterval: REFRESH.RSS_MEDIUM,
          priority: ch.priority,
        })),
    [enabledCats],
  );

  const { feeds, isLoading, sourceStatuses } = useMultipleFeeds(telegramFeedSources);

  const handleToggleCat = useCallback((id: string) => {
    setEnabledCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSetAllCats = useCallback((ids: string[]) => {
    setEnabledCats(new Set(ids));
  }, []);

  // Aggregate and filter
  const feedEntries: FeedEntry[] = useMemo(() => {
    const items = feeds
      .filter((item) => {
        if (!filter) return true;
        return item.title.toLowerCase().includes(filter.toLowerCase()) ||
               item.source.toLowerCase().includes(filter.toLowerCase());
      })
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 100);

    return items.map((item) => {
      // Find channel config for category badge
      const channel = TELEGRAM_CHANNELS.find((ch) => ch.name === item.source);
      const categoryLabel = channel
        ? TELEGRAM_CATEGORY_LABELS[channel.category] ?? channel.category.toUpperCase()
        : 'TG';

      return {
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: categoryLabel as never,
        severity: channel?.priority === 'high' ? 'critical' as const : 'normal' as const,
      };
    });
  }, [feeds, filter]);

  const status: PanelStatus = isLoading
    ? 'loading'
    : sourceStatuses.some((s) => !s.isError && !s.isStale)
      ? 'live'
      : sourceStatuses.every((s) => s.isError)
        ? 'error'
        : 'stale';

  // Count active channels
  const activeChannels = sourceStatuses.filter((s) => !s.isError).length;

  const handleCommand = useCallback((cmd: string) => {
    if (cmd === 'clear' || cmd === 'reset') {
      setFilter('');
    } else {
      setFilter(cmd);
    }
  }, []);

  const handleItemClick = useCallback((id: string) => {
    const item = feeds.find((i) => i.id === id);
    if (item?.link) safeOpenLink(item.link);
  }, [feeds]);

  const filteredChannels = TELEGRAM_CHANNELS.filter((ch) => enabledCats.has(ch.category));

  return (
    <TerminalWindow
      title="TELEGRAM OSINT"
      status={status}
      headerRight={
        <div className="relative flex items-center gap-2">
          <span className="text-terminal-primary-dim text-[9px]">
            {activeChannels}/{filteredChannels.length} CH
          </span>
          <button
            className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => setShowCatFilter(!showCatFilter)}
          >
            [FILTER]
          </button>
          {showCatFilter && (
            <FeedFilterPopup
              title="TG FILTER"
              options={TG_FILTER_OPTIONS}
              enabledIds={enabledCats}
              onToggle={handleToggleCat}
              onSetAll={handleSetAllCats}
              onClose={() => setShowCatFilter(false)}
            />
          )}
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Channel status bar */}
        <div className="px-1 py-0.5 text-[8px] text-terminal-primary-dim border-b border-terminal-border flex gap-2 flex-wrap">
          {filteredChannels.slice(0, 6).map((ch) => {
            const st = sourceStatuses.find(
              (s) => s.source.id === ch.id
            );
            const color = st?.isError
              ? 'var(--color-terminal-red)'
              : st?.isStale
                ? 'var(--color-terminal-amber)'
                : 'var(--color-terminal-green)';
            return (
              <span key={ch.id} style={{ color }}>
                {'\u25CF'} {ch.name}
              </span>
            );
          })}
          {filteredChannels.length > 6 && (
            <span className="text-terminal-primary-dim">
              +{filteredChannels.length - 6} more
            </span>
          )}
        </div>

        <ScrollingFeed
          items={feedEntries}
          showTimestamps
          onItemClick={handleItemClick}
        />
        <CommandLine
          prompt="tg> "
          placeholder="filter or 'clear'"
          onCommand={handleCommand}
        />
      </div>
    </TerminalWindow>
  );
}
