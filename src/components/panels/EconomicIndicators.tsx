/**
 * EconomicIndicators — Finance & economic monitoring panel.
 *
 * Aggregates finance feeds with economic keyword extraction.
 * Shows: market sentiment gauge, sector breakdown (rates, trade,
 * employment, inflation), and filtered feed.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

const ECON_CATEGORIES: FeedCategory[] = ['finance', 'commodities'];

const ECON_FEEDS = FEED_SOURCES.filter((f) => ECON_CATEGORIES.includes(f.category));

// Sentiment classifiers
const BEARISH_KEYWORDS = /crash|recession|downturn|decline|plunge|bear|sell-off|inflation.*ris|unemployment.*ris|default|debt.*crisis|downgrade|bankruptcy|collapse/i;
const BULLISH_KEYWORDS = /rally|surge|boom|bull|growth|recovery|all.time.high|record.*high|ipo.*surge|rate.*cut|stimulus/i;
const CRITICAL_ECON = /crash|collapse|default|recession|bank.*fail|systemic.*risk|contagion|emergency.*rate/i;
const IMPORTANT_ECON = /fed\b|ecb|rate.*hike|rate.*cut|gdp|cpi|inflation|employment|jobs.*report|trade.*war|tariff|sanction|imf|world.*bank/i;

interface SentimentGauge {
  bullish: number;
  bearish: number;
  neutral: number;
  label: string;
}

function classifySeverity(item: FeedItem): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_ECON.test(text)) return 'critical';
  if (IMPORTANT_ECON.test(text)) return 'important';
  return 'normal';
}

export function EconomicIndicators() {
  const { feeds, isLoading, errors } = useMultipleFeeds(ECON_FEEDS);
  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  // Sentiment analysis
  const sentiment: SentimentGauge = useMemo(() => {
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    for (const item of feeds) {
      const text = `${item.title} ${item.snippet}`;
      if (BULLISH_KEYWORDS.test(text)) bullish++;
      else if (BEARISH_KEYWORDS.test(text)) bearish++;
      else neutral++;
    }
    const total = Math.max(bullish + bearish + neutral, 1);
    const ratio = (bullish - bearish) / total;
    const label = ratio > 0.15 ? 'BULLISH' : ratio < -0.15 ? 'BEARISH' : 'MIXED';
    return { bullish, bearish, neutral, label };
  }, [feeds]);

  // Sector topic counts
  const topics = useMemo(() => {
    const defs = [
      { name: 'RATES', pattern: /interest.*rate|fed\b|ecb|rate.*hike|rate.*cut|monetary/i },
      { name: 'TRADE', pattern: /trade|tariff|export|import|supply.*chain|wto|nafta/i },
      { name: 'JOBS', pattern: /employ|jobs|labor|workforce|wages|hiring|layoff|unemploy/i },
      { name: 'INFLATE', pattern: /inflation|cpi|ppi|deflat|price.*index|cost.*living/i },
      { name: 'FISCAL', pattern: /budget|deficit|debt|spending|stimulus|tax/i },
      { name: 'CMDTY', pattern: /oil|gold|silver|copper|wheat|commodity|metal|mineral/i },
    ];
    return defs.map((d) => ({
      name: d.name,
      count: feeds.filter((f) => d.pattern.test(`${f.title} ${f.snippet}`)).length,
    }));
  }, [feeds]);

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

  const criticalCount = entries.filter((e) => e.severity === 'critical').length;

  // Build sentiment bar
  const sentimentBar = useMemo(() => {
    const total = Math.max(sentiment.bullish + sentiment.bearish + sentiment.neutral, 1);
    const bullPct = Math.round((sentiment.bullish / total) * 20);
    const bearPct = Math.round((sentiment.bearish / total) * 20);
    const neutPct = 20 - bullPct - bearPct;
    return '█'.repeat(bullPct) + '▓'.repeat(neutPct) + '░'.repeat(bearPct);
  }, [sentiment]);

  return (
    <TerminalWindow
      title="ECON INDICATORS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          <span
            className="font-bold"
            style={{
              color: sentiment.label === 'BULLISH'
                ? 'var(--color-terminal-green)'
                : sentiment.label === 'BEARISH'
                ? 'var(--color-terminal-red)'
                : 'var(--color-terminal-amber)',
            }}
          >
            {sentiment.label}
          </span>
          {criticalCount > 0 && (
            <span className="text-terminal-red">{criticalCount} CRIT</span>
          )}
        </div>
      }
    >
      <div className="space-y-2">
        {/* Sentiment gauge */}
        <div className="px-1 text-[9px]">
          <div className="text-terminal-primary-dim mb-0.5">MARKET SENTIMENT</div>
          <div className="flex items-center gap-2">
            <span className="text-terminal-green text-[8px]">BULL</span>
            <span className="font-mono tracking-tighter" style={{
              background: 'linear-gradient(90deg, var(--color-terminal-green) 0%, var(--color-terminal-amber) 50%, var(--color-terminal-red) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {sentimentBar}
            </span>
            <span className="text-terminal-red text-[8px]">BEAR</span>
          </div>
          <div className="text-[8px] text-terminal-primary-dim mt-0.5">
            ▲{sentiment.bullish} ▼{sentiment.bearish} ─{sentiment.neutral}
          </div>
        </div>

        {/* Topic breakdown */}
        {topics.some((t) => t.count > 0) && (
          <div className="px-1 text-[9px] border-t border-terminal-border pt-1">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {topics.filter((t) => t.count > 0).map((t) => (
                <span key={t.name} className="text-terminal-primary-dim">
                  <span className="text-terminal-cyan">{t.name}</span>:{t.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feed items */}
        {entries.length > 0 ? (
          <div className="border-t border-terminal-border pt-1">
            <ScrollingFeed items={entries} maxVisible={60} showTimestamps />
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Loading economic data...' : 'No economic data available'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
