/**
 * TransportationIntel — Aviation and maritime traffic intelligence panel.
 *
 * Displays notable transportation movements and anomalies derived from
 * feed data (aviation incidents, maritime disruptions, GPS outages).
 *
 * Data sources: defense feeds, energy feeds (tanker traffic),
 * and general news feeds classified for transport keywords.
 */

import { useMemo, useState, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { PanelStatus } from '@/types';
import { safeOpenLink } from '@/utils/safe-open';

// Keywords for transport/aviation/maritime events
const TRANSPORT_KEYWORDS = [
  'aircraft', 'aviation', 'airline', 'flight', 'airport',
  'ship', 'vessel', 'maritime', 'tanker', 'port', 'shipping',
  'naval', 'navy', 'carrier', 'submarine', 'destroyer',
  'drone', 'uav', 'airspace', 'no-fly', 'gps', 'ais',
  'strait', 'canal', 'suez', 'panama', 'hormuz', 'bosphorus',
  'cargo', 'freight', 'container', 'oil tanker', 'lng',
  'transit', 'blockade', 'piracy', 'hijack',
  'train', 'rail', 'derailment', 'pipeline',
];

const SEVERITY_KEYWORDS = {
  critical: ['crash', 'shoot down', 'shot down', 'sunk', 'hijack', 'collision', 'explosion', 'blockade'],
  high: ['intercept', 'grounding', 'seizure', 'detained', 'stranded', 'diverted', 'closure', 'disruption'],
  medium: ['exercise', 'deployment', 'passage', 'transit', 'patrol', 'surveillance'],
};

interface TransportEvent {
  id: string;
  title: string;
  source: string;
  time: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'aviation' | 'maritime' | 'land' | 'general';
  link?: string;
}

// Relevant source categories
const TRANSPORT_SOURCE_CATEGORIES = ['world-news', 'defense', 'energy', 'regional-mideast', 'regional-asia'];
const TRANSPORT_SOURCES = FEED_SOURCES.filter((f) => TRANSPORT_SOURCE_CATEGORIES.includes(f.category));

export function TransportationIntel() {
  const { feeds, isLoading } = useMultipleFeeds(TRANSPORT_SOURCES);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 1500);
    return () => clearInterval(interval);
  }, []);

  // Extract transport-related events from feeds
  const events: TransportEvent[] = useMemo(() => {
    const results: TransportEvent[] = [];

    for (const item of feeds) {
      const titleLower = item.title.toLowerCase();

      // Check if title matches transport keywords
      const isTransport = TRANSPORT_KEYWORDS.some((kw) => titleLower.includes(kw));
      if (!isTransport) continue;

      // Determine severity
      let severity: TransportEvent['severity'] = 'low';
      if (SEVERITY_KEYWORDS.critical.some((kw) => titleLower.includes(kw))) {
        severity = 'critical';
      } else if (SEVERITY_KEYWORDS.high.some((kw) => titleLower.includes(kw))) {
        severity = 'high';
      } else if (SEVERITY_KEYWORDS.medium.some((kw) => titleLower.includes(kw))) {
        severity = 'medium';
      }

      // Categorize
      let category: TransportEvent['category'] = 'general';
      if (['aircraft', 'aviation', 'airline', 'flight', 'airport', 'drone', 'uav', 'airspace', 'no-fly'].some((kw) => titleLower.includes(kw))) {
        category = 'aviation';
      } else if (['ship', 'vessel', 'maritime', 'tanker', 'port', 'naval', 'navy', 'carrier', 'submarine', 'strait', 'canal', 'piracy'].some((kw) => titleLower.includes(kw))) {
        category = 'maritime';
      } else if (['train', 'rail', 'derailment', 'pipeline'].some((kw) => titleLower.includes(kw))) {
        category = 'land';
      }

      results.push({
        id: item.id,
        title: item.title,
        source: item.source,
        time: item.pubDate,
        severity,
        category,
        link: item.link,
      });
    }

    return results
      .sort((a, b) => {
        // Sort by severity first, then time
        const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const sevDiff = sevOrder[a.severity] - sevOrder[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return b.time.getTime() - a.time.getTime();
      })
      .slice(0, 50);
  }, [feeds]);

  const status: PanelStatus = isLoading ? 'loading' : 'live';
  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const hasCritical = criticalCount > 0;

  const categoryIcons: Record<string, string> = {
    aviation: '\u2708',  // ✈
    maritime: '\u2693',  // ⚓
    land: '\u2602',      // ☂ (placeholder)
    general: '\u25C6',   // ◆
  };

  const severityColors: Record<string, string> = {
    critical: 'var(--color-terminal-red)',
    high: 'var(--color-terminal-amber)',
    medium: 'var(--color-terminal-cyan)',
    low: 'var(--color-terminal-primary-dim)',
  };

  return (
    <TerminalWindow
      title="TRANSPORT INTEL"
      status={status}
      headerRight={
        hasCritical ? (
          <span
            className="text-[9px] font-bold"
            style={{
              color: 'var(--color-terminal-red)',
              opacity: blink ? 1 : 0.5,
            }}
          >
            {criticalCount} ALERT{criticalCount > 1 ? 'S' : ''}
          </span>
        ) : (
          <span className="text-[9px] text-terminal-primary-dim">
            {events.length} events
          </span>
        )
      }
    >
      <div className="overflow-y-auto" style={{ maxHeight: '100%' }}>
        {events.length === 0 ? (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Scanning transport channels...' : 'No transport events detected'}
          </div>
        ) : (
          <div className="py-0.5">
            {/* Category summary */}
            <div className="px-1 py-0.5 text-[8px] text-terminal-primary-dim border-b border-terminal-border flex gap-3">
              {(['aviation', 'maritime', 'land', 'general'] as const).map((cat) => {
                const count = events.filter((e) => e.category === cat).length;
                if (count === 0) return null;
                return (
                  <span key={cat}>
                    {categoryIcons[cat]} {cat.toUpperCase()}: {count}
                  </span>
                );
              })}
            </div>

            {/* Event list */}
            {events.map((event) => (
              <div
                key={event.id}
                className="px-1 py-0.5 text-[9px] leading-tight cursor-pointer hover:bg-terminal-bg-highlight"
                style={{
                  borderLeft: `2px solid ${severityColors[event.severity]}`,
                }}
                onClick={() => {
                  if (event.link) safeOpenLink(event.link);
                }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ color: severityColors[event.severity] }}>
                    {categoryIcons[event.category]}
                  </span>
                  <span className="text-terminal-primary truncate flex-1">
                    {event.title}
                  </span>
                </div>
                <div className="text-[7px] text-terminal-primary-dim flex gap-2 mt-0.5">
                  <span>{event.source}</span>
                  <span>{'\u00B7'}</span>
                  <span style={{ color: severityColors[event.severity] }}>
                    {event.severity.toUpperCase()}
                  </span>
                  <span>{'\u00B7'}</span>
                  <span>
                    {event.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
