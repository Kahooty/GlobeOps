/**
 * EmergencyAlerts — Cross-source critical events aggregator.
 *
 * Pulls the highest-severity events from ALL data sources:
 *   - M6+ earthquakes
 *   - Critical/important headlines with conflict keywords
 *   - Extreme/severe weather alerts
 *
 * Active alerts get a blinking indicator. Shows newest first.
 */

import { useMemo, useState, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import { formatTimeAgo } from '@/utils/map-events';
import type { PanelStatus } from '@/types';

interface AlertItem {
  id: string;
  source: string;
  title: string;
  severity: 'critical' | 'high';
  category: string;
  time: Date;
}

const CRITICAL_KEYWORDS = /nuclear|missile|invasion|attack\b|war\b|strike|bomb|escalat|weapon|terror|tsunami|catastroph/i;
const HIGH_KEYWORDS = /military|conflict|deploy|troops|sanction|emergency|threat|casualt|kill|shoot|drone|airstr/i;

// Per-source caps to prevent single-feed domination
const MAX_CRITICAL_PER_SOURCE = 5;
const MAX_HIGH_PER_SOURCE = 3;

export function EmergencyAlerts() {
  const { data: quakes = [], isLoading: qLoading } = useEarthquakes(2.5);
  const { feeds, isLoading: fLoading } = useMultipleFeeds(FEED_SOURCES);
  const [blink, setBlink] = useState(true);

  // Blink animation for active critical alerts
  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 800);
    return () => clearInterval(interval);
  }, []);

  const isLoading = qLoading || fLoading;
  const status: PanelStatus = isLoading ? 'loading' : 'live';

  const alerts: AlertItem[] = useMemo(() => {
    const items: AlertItem[] = [];

    // Critical earthquakes (M6+)
    for (const q of quakes) {
      if (q.magnitude >= 6) {
        items.push({
          id: `eq-${q.id}`,
          source: 'USGS',
          title: `M${q.magnitude.toFixed(1)} — ${q.place}`,
          severity: q.magnitude >= 7 ? 'critical' : 'high',
          category: 'SEISMIC',
          time: q.time,
        });
      }
    }

    // Critical news headlines
    for (const item of feeds) {
      const text = `${item.title} ${item.snippet}`;
      if (CRITICAL_KEYWORDS.test(text)) {
        items.push({
          id: `news-${item.id}`,
          source: item.source,
          title: item.title,
          severity: 'critical',
          category: 'INTEL',
          time: item.pubDate,
        });
      } else if (HIGH_KEYWORDS.test(text)) {
        items.push({
          id: `news-${item.id}`,
          source: item.source,
          title: item.title,
          severity: 'high',
          category: 'ALERT',
          time: item.pubDate,
        });
      }
    }

    // Sort by severity first (critical on top), then by recency
    items.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
      return b.time.getTime() - a.time.getTime();
    });

    // Enforce per-source caps to prevent single-feed domination.
    // Critical items get a higher cap; high-severity items get a lower cap.
    const criticalCounts = new Map<string, number>();
    const highCounts = new Map<string, number>();
    const diversified = items.filter((item) => {
      if (item.severity === 'critical') {
        const count = criticalCounts.get(item.source) ?? 0;
        if (count >= MAX_CRITICAL_PER_SOURCE) return false;
        criticalCounts.set(item.source, count + 1);
        return true;
      }
      const count = highCounts.get(item.source) ?? 0;
      if (count >= MAX_HIGH_PER_SOURCE) return false;
      highCounts.set(item.source, count + 1);
      return true;
    });

    return diversified.slice(0, 30);
  }, [quakes, feeds]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <TerminalWindow
      title="EMERGENCY ALERTS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {criticalCount > 0 && (
            <span
              className="text-terminal-red font-bold"
              style={{ opacity: blink ? 1 : 0.3 }}
            >
              ● {criticalCount} CRITICAL
            </span>
          )}
          <span className="text-terminal-primary-dim">{alerts.length} active</span>
        </div>
      }
    >
      <div className="overflow-y-auto" style={{ maxHeight: '100%' }}>
        {alerts.length > 0 ? (
          <div className="space-y-0.5 px-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-1.5 py-0.5 text-[9px] leading-tight"
                style={{
                  borderLeft: alert.severity === 'critical'
                    ? '2px solid var(--color-terminal-red)'
                    : '2px solid var(--color-terminal-amber)',
                  paddingLeft: '6px',
                  opacity: alert.severity === 'critical' ? (blink ? 1 : 0.7) : 0.9,
                }}
              >
                <span
                  className="flex-shrink-0 text-[8px] font-bold tracking-wide w-[38px]"
                  style={{
                    color: alert.severity === 'critical'
                      ? 'var(--color-terminal-red)'
                      : 'var(--color-terminal-amber)',
                  }}
                >
                  {alert.category}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-terminal-primary truncate block">
                    {alert.title}
                  </span>
                  <span className="text-terminal-primary-dim text-[8px]">
                    {alert.source} • {formatTimeAgo(alert.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Scanning all sources...' : (
              <span className="text-terminal-green">✓ No active emergency alerts</span>
            )}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
