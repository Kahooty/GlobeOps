/**
 * EnergyAnalytics — Energy sector monitoring panel.
 *
 * Aggregates energy RSS feeds (EIA, OilPrice, Rigzone, etc.) with
 * keyword-based classification for supply disruptions, OPEC decisions,
 * price movements, and pipeline/infrastructure events.
 *
 * Shows: feed items, sector breakdown, critical supply alerts.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

const ENERGY_CATEGORIES: FeedCategory[] = ['energy', 'commodities'];

const ENERGY_FEEDS = FEED_SOURCES.filter((f) => ENERGY_CATEGORIES.includes(f.category));

// Energy-specific severity patterns
const CRITICAL_ENERGY = /embargo|shutdown|explosion|pipeline.*(attack|sabotage|leak)|refinery.*(fire|explosion)|opec.*cut|sanctions.*oil|energy.*(crisis|emergency)|blackout|grid.*(failure|collapse)/i;
const IMPORTANT_ENERGY = /opec|crude|brent|wti|natural gas|lng|pipeline|refinery|drill|solar|wind|nuclear|coal|renewable|tariff|supply.*disrupt|price.*surge|production.*cut/i;

interface EnergySector {
  name: string;
  pattern: RegExp;
  count: number;
}

function classifySeverity(item: FeedItem): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_ENERGY.test(text)) return 'critical';
  if (IMPORTANT_ENERGY.test(text)) return 'important';
  return 'normal';
}

export function EnergyAnalytics() {
  const { feeds, isLoading, errors } = useMultipleFeeds(ENERGY_FEEDS);
  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  const entries: FeedEntry[] = useMemo(() => {
    return feeds
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 60)
      .map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: classifySeverity(item),
      }));
  }, [feeds]);

  // Sector breakdown
  const sectors: EnergySector[] = useMemo(() => {
    const sectorDefs = [
      { name: 'OIL/GAS', pattern: /oil|crude|brent|wti|natural gas|lng|petroleum|gasoline|diesel/i },
      { name: 'NUCLEAR', pattern: /nuclear|uranium|reactor|fission|fusion/i },
      { name: 'RENEW', pattern: /solar|wind|renewable|hydro|geothermal|green energy|clean energy/i },
      { name: 'COAL', pattern: /coal|thermal|mining/i },
      { name: 'GRID', pattern: /grid|power|electric|transmission|blackout|utility/i },
      { name: 'PIPE', pattern: /pipeline|transport|tanker|shipping|lng terminal/i },
    ];

    return sectorDefs.map((s) => ({
      ...s,
      count: feeds.filter((f) => s.pattern.test(`${f.title} ${f.snippet}`)).length,
    }));
  }, [feeds]);

  const criticalCount = entries.filter((e) => e.severity === 'critical').length;
  const importantCount = entries.filter((e) => e.severity === 'important').length;

  return (
    <TerminalWindow
      title="ENERGY ANALYTICS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {criticalCount > 0 && (
            <span className="text-terminal-red">{criticalCount} CRIT</span>
          )}
          {importantCount > 0 && (
            <span className="text-terminal-amber">{importantCount} PRI</span>
          )}
          <span className="text-terminal-primary-dim">{entries.length}</span>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Sector breakdown bar chart */}
        {sectors.some((s) => s.count > 0) && (
          <div className="px-1">
            <div className="text-[8px] text-terminal-primary-dim mb-1">SECTOR ACTIVITY</div>
            <AsciiChart
              data={sectors.map((s) => s.count)}
              labels={sectors.map((s) => s.name)}
              type="horizontal-bar"
              width={14}
              variant="amber"
            />
          </div>
        )}

        {/* Feed items */}
        {entries.length > 0 ? (
          <div className="border-t border-terminal-border pt-1">
            <ScrollingFeed items={entries} maxVisible={60} showTimestamps />
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Loading energy feeds...' : 'No energy data available'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
