/**
 * SupplyChain — Global supply chain & strategic waterway monitor.
 *
 * Tracks disruptions across key chokepoints (Suez, Panama, Hormuz,
 * Malacca, Bosphorus) and supply chain headlines from news feeds.
 * Waterway status derived from keyword analysis of recent headlines.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

const SUPPLY_CATEGORIES: FeedCategory[] = [
  'world-news', 'finance', 'energy', 'commodities', 'defense',
];

const SUPPLY_FEEDS = FEED_SOURCES.filter((f) => SUPPLY_CATEGORIES.includes(f.category));

// Supply chain specific keywords for filtering
const SUPPLY_CHAIN_FILTER = /supply.*chain|shipping|freight|port|cargo|container|logistics|chokepoint|canal|strait|waterway|blockade|embargo|tariff|trade.*war|export.*ban|import.*restrict|semiconductor|chip.*shortage|rare.*earth/i;

const CRITICAL_SUPPLY = /blockade|canal.*block|port.*clos|embargo|supply.*crisis|shipping.*halt|trade.*halt|strait.*clos/i;
const IMPORTANT_SUPPLY = /supply.*disrupt|shipping.*delay|port.*congest|freight.*surge|container.*short|chip.*short|tariff.*hike|trade.*restrict/i;

interface WaterwayStatus {
  name: string;
  code: string;
  status: 'OPEN' | 'DISRUPTED' | 'BLOCKED';
  pattern: RegExp;
}

const WATERWAYS: WaterwayStatus[] = [
  { name: 'Suez Canal', code: 'SUEZ', status: 'OPEN', pattern: /suez/i },
  { name: 'Panama Canal', code: 'PANA', status: 'OPEN', pattern: /panama.*canal/i },
  { name: 'Strait of Hormuz', code: 'HRMZ', status: 'OPEN', pattern: /hormuz/i },
  { name: 'Malacca Strait', code: 'MLCA', status: 'OPEN', pattern: /malacca/i },
  { name: 'Bosphorus', code: 'BSPH', status: 'OPEN', pattern: /bosphorus|dardanelles|turkish.*strait/i },
  { name: 'Red Sea', code: 'RSEA', status: 'OPEN', pattern: /red.*sea|bab.*mandeb/i },
];

function classifySeverity(item: FeedItem): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_SUPPLY.test(text)) return 'critical';
  if (IMPORTANT_SUPPLY.test(text)) return 'important';
  return 'normal';
}

export function SupplyChain() {
  const { feeds, isLoading, errors } = useMultipleFeeds(SUPPLY_FEEDS);
  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  // Filter to supply-chain relevant items
  const supplyFeeds = useMemo(
    () => feeds.filter((f) => SUPPLY_CHAIN_FILTER.test(`${f.title} ${f.snippet}`)),
    [feeds],
  );

  // Determine waterway statuses from headlines
  const waterwayStatuses = useMemo(() => {
    return WATERWAYS.map((w) => {
      const mentions = supplyFeeds.filter((f) => w.pattern.test(`${f.title} ${f.snippet}`));
      let derivedStatus: 'OPEN' | 'DISRUPTED' | 'BLOCKED' = 'OPEN';
      for (const m of mentions) {
        const text = `${m.title} ${m.snippet}`;
        if (/block|clos|halt|shut/i.test(text)) {
          derivedStatus = 'BLOCKED';
          break;
        }
        if (/disrupt|delay|attack|threat|congest|divert/i.test(text)) {
          derivedStatus = 'DISRUPTED';
        }
      }
      return { ...w, status: derivedStatus, mentions: mentions.length };
    });
  }, [supplyFeeds]);

  const entries: FeedEntry[] = useMemo(() => {
    return supplyFeeds
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 40)
      .map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: classifySeverity(item),
      }));
  }, [supplyFeeds]);

  const disruptedCount = waterwayStatuses.filter((w) => w.status !== 'OPEN').length;

  return (
    <TerminalWindow
      title="SUPPLY CHAIN"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {disruptedCount > 0 && (
            <span className="text-terminal-red">{disruptedCount} DISRUPTED</span>
          )}
          <span className="text-terminal-primary-dim">{entries.length} items</span>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Waterway status grid */}
        <div className="px-1">
          <div className="text-[8px] text-terminal-primary-dim mb-1">STRATEGIC WATERWAYS</div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[9px]">
            {waterwayStatuses.map((w) => (
              <div key={w.code} className="flex items-center gap-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      w.status === 'OPEN' ? 'var(--color-terminal-green)'
                      : w.status === 'DISRUPTED' ? 'var(--color-terminal-amber)'
                      : 'var(--color-terminal-red)',
                    boxShadow:
                      w.status !== 'OPEN'
                        ? `0 0 4px ${w.status === 'BLOCKED' ? 'var(--color-terminal-red)' : 'var(--color-terminal-amber)'}`
                        : 'none',
                  }}
                />
                <span className="text-terminal-primary-dim">{w.code}</span>
                <span
                  className="text-[8px] font-bold"
                  style={{
                    color:
                      w.status === 'OPEN' ? 'var(--color-terminal-green)'
                      : w.status === 'DISRUPTED' ? 'var(--color-terminal-amber)'
                      : 'var(--color-terminal-red)',
                  }}
                >
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[8px] text-terminal-primary-dim px-1">
          <span><span className="text-terminal-green">●</span> OPEN</span>
          <span><span className="text-terminal-amber">●</span> DISRUPTED</span>
          <span><span className="text-terminal-red">●</span> BLOCKED</span>
        </div>

        {/* Supply chain feed */}
        {entries.length > 0 ? (
          <div className="border-t border-terminal-border pt-1">
            <ScrollingFeed items={entries} maxVisible={40} showTimestamps />
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Scanning supply chain data...' : 'No supply chain alerts'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
