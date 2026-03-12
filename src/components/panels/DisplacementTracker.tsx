/**
 * DisplacementTracker — Global displacement & humanitarian crisis monitor.
 *
 * Aggregates humanitarian feeds (UNHCR, ReliefWeb, ICRC, MSF) and
 * cross-references with conflict data to track displacement crises.
 * Shows: crisis regions, severity indicators, humanitarian feed.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { ScrollingFeed, type FeedEntry } from '@/components/terminal/ScrollingFeed';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useReliefWebDisasters } from '@/hooks/useReliefWeb';
import { useGDACSAlerts } from '@/hooks/useGDACS';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { FeedItem, FeedCategory, PanelStatus } from '@/types';

const HUMANITARIAN_CATEGORIES: FeedCategory[] = ['humanitarian'];

// Also pull from conflict/world news for displacement mentions
const SUPPLEMENTARY_CATEGORIES: FeedCategory[] = [
  'world-news', 'defense', 'regional-mideast', 'regional-africa',
];

const HUMANITARIAN_FEEDS = FEED_SOURCES.filter(
  (f) => HUMANITARIAN_CATEGORIES.includes(f.category),
);

const SUPPLEMENTARY_FEEDS = FEED_SOURCES.filter(
  (f) => SUPPLEMENTARY_CATEGORIES.includes(f.category),
);

// Displacement-specific keywords
const DISPLACEMENT_FILTER = /refugee|displac|asylum|migra|humanitarian|crisis|famine|drought|flood|aid|relief|shelter|camp|idp|internally.displaced|food.insecur|malnutrition|epidemic|cholera/i;
const CRITICAL_HUMANITARIAN = /famine|genocide|mass.*casualt|ethnic.*cleans|humanitarian.*catastroph|mass.*displace|cholera.*outbreak|epidemic|pandemic/i;
const IMPORTANT_HUMANITARIAN = /refugee.*crisis|displacement|humanitarian.*emergency|food.*crisis|aid.*block|shelter|idp.*camp|relief.*effort|evacuat/i;

interface CrisisRegion {
  name: string;
  pattern: RegExp;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

function classifySeverity(item: FeedItem): 'normal' | 'important' | 'critical' {
  const text = `${item.title} ${item.snippet}`;
  if (CRITICAL_HUMANITARIAN.test(text)) return 'critical';
  if (IMPORTANT_HUMANITARIAN.test(text)) return 'important';
  return 'normal';
}

// Active crisis item for the API-sourced crisis table
interface ActiveCrisis {
  id: string;
  name: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  date: Date;
}

export function DisplacementTracker() {
  const { feeds: humanFeeds, isLoading: hLoading, errors: hErrors } = useMultipleFeeds(HUMANITARIAN_FEEDS);
  const { feeds: suppFeeds, isLoading: sLoading } = useMultipleFeeds(SUPPLEMENTARY_FEEDS);
  const { data: reliefWebData, isLoading: rwLoading } = useReliefWebDisasters();
  const { data: gdacsAlerts, isLoading: gdacsLoading } = useGDACSAlerts();

  const isLoading = hLoading || sLoading || rwLoading || gdacsLoading;
  const hasErrors = hErrors.some((e) => e !== null);
  const status: PanelStatus = isLoading ? 'loading' : hasErrors ? 'error' : 'live';

  // Combine humanitarian + displacement-filtered supplementary feeds
  const allFeeds = useMemo(() => {
    const supplementary = suppFeeds.filter(
      (f) => DISPLACEMENT_FILTER.test(`${f.title} ${f.snippet}`),
    );
    return [...humanFeeds, ...supplementary];
  }, [humanFeeds, suppFeeds]);

  // Active crises from ReliefWeb + GDACS APIs
  const activeCrises: ActiveCrisis[] = useMemo(() => {
    const items: ActiveCrisis[] = [];

    if (reliefWebData) {
      for (const d of reliefWebData) {
        items.push({
          id: `rw-${d.id}`,
          name: d.name.length > 36 ? d.name.slice(0, 35) + '\u2026' : d.name,
          type: d.type,
          severity: d.status === 'alert' ? 'high' : 'medium',
          source: 'RW',
          date: d.date,
        });
      }
    }

    if (gdacsAlerts) {
      for (const a of gdacsAlerts) {
        if (a.alertLevel === 'Red' || a.alertLevel === 'Orange') {
          items.push({
            id: `gdacs-${a.id}`,
            name: a.title.length > 36 ? a.title.slice(0, 35) + '\u2026' : a.title,
            type: a.eventType,
            severity: a.severity,
            source: 'GDACS',
            date: a.date,
          });
        }
      }
    }

    return items.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const diff = sevOrder[a.severity] - sevOrder[b.severity];
      return diff !== 0 ? diff : b.date.getTime() - a.date.getTime();
    }).slice(0, 8);
  }, [reliefWebData, gdacsAlerts]);

  // Crisis region breakdown
  const crisisRegions: CrisisRegion[] = useMemo(() => {
    const regions = [
      { name: 'SAHEL', pattern: /sahel|mali|burkina|niger|chad/i },
      { name: 'HORN AFR', pattern: /ethiopia|somalia|sudan|eritrea|south.sudan/i },
      { name: 'MIDEAST', pattern: /syria|yemen|iraq|gaza|palestine|lebanon/i },
      { name: 'UKRAINE', pattern: /ukraine|ukrain/i },
      { name: 'MYANMAR', pattern: /myanmar|rohingya|burma/i },
      { name: 'DRC', pattern: /congo|drc|kinshasa/i },
      { name: 'AFGHANSTN', pattern: /afghan/i },
      { name: 'LATAM', pattern: /venezuela|haiti|colombia|central.america/i },
    ];

    return regions.map((r) => {
      let count = allFeeds.filter(
        (f) => r.pattern.test(`${f.title} ${f.snippet}`),
      ).length;

      // Boost with GDACS Red/Orange alerts matching this region
      if (gdacsAlerts) {
        count += gdacsAlerts.filter(
          (a) => (a.alertLevel === 'Red' || a.alertLevel === 'Orange') &&
            r.pattern.test(`${a.title} ${a.country}`),
        ).length;
      }

      // Boost with ReliefWeb disasters matching this region
      if (reliefWebData) {
        count += reliefWebData.filter(
          (d) => r.pattern.test(`${d.name} ${d.country}`),
        ).length;
      }

      const hasCritical = allFeeds.some(
        (f) =>
          r.pattern.test(`${f.title} ${f.snippet}`) &&
          CRITICAL_HUMANITARIAN.test(`${f.title} ${f.snippet}`),
      ) || (gdacsAlerts?.some(
        (a) => a.alertLevel === 'Red' && r.pattern.test(`${a.title} ${a.country}`),
      ) ?? false);

      const hasImportant = allFeeds.some(
        (f) =>
          r.pattern.test(`${f.title} ${f.snippet}`) &&
          IMPORTANT_HUMANITARIAN.test(`${f.title} ${f.snippet}`),
      );

      const severity: 'low' | 'medium' | 'high' | 'critical' = hasCritical
        ? 'critical'
        : hasImportant
        ? 'high'
        : count > 3
        ? 'medium'
        : 'low';

      return { ...r, count, severity };
    }).sort((a, b) => b.count - a.count);
  }, [allFeeds, gdacsAlerts, reliefWebData]);

  const entries: FeedEntry[] = useMemo(() => {
    return allFeeds
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 50)
      .map((item) => ({
        id: item.id,
        timestamp: item.pubDate,
        text: item.title,
        source: item.source,
        category: item.category,
        severity: classifySeverity(item),
      }));
  }, [allFeeds]);

  const criticalRegions = crisisRegions.filter((r) => r.severity === 'critical' || r.severity === 'high');

  return (
    <TerminalWindow
      title="DISPLACEMENT TRACKER"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {criticalRegions.length > 0 && (
            <span className="text-terminal-red">{criticalRegions.length} CRISIS</span>
          )}
          <span className="text-terminal-primary-dim">{allFeeds.length} reports</span>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Crisis region bar chart */}
        {crisisRegions.some((r) => r.count > 0) && (
          <div className="px-1">
            <div className="text-[8px] text-terminal-primary-dim mb-1">ACTIVE CRISIS ZONES</div>
            <AsciiChart
              data={crisisRegions.filter((r) => r.count > 0).map((r) => r.count)}
              labels={crisisRegions.filter((r) => r.count > 0).map((r) => r.name)}
              type="horizontal-bar"
              width={14}
              variant="amber"
            />
          </div>
        )}

        {/* Top crisis detail */}
        {crisisRegions.length > 0 && crisisRegions[0].count > 0 && (
          <div className="px-1 text-[9px] border-t border-terminal-border pt-1">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {crisisRegions.filter((r) => r.count > 0).slice(0, 4).map((r) => (
                <span key={r.name}>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        r.severity === 'critical' ? 'var(--color-terminal-red)'
                        : r.severity === 'high' ? 'var(--color-terminal-amber)'
                        : 'var(--color-terminal-primary)',
                    }}
                  >
                    {r.name}
                  </span>
                  <span className="text-terminal-primary-dim">:{r.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active crises from APIs */}
        {activeCrises.length > 0 && (
          <div className="px-1 border-t border-terminal-border pt-1">
            <div className="text-[8px] text-terminal-primary-dim mb-1">ACTIVE CRISES (API)</div>
            <AsciiTable<ActiveCrisis>
              columns={[
                {
                  key: 'source',
                  header: 'SRC',
                  width: 5,
                  render: (v) => String(v),
                },
                {
                  key: 'type',
                  header: 'TYPE',
                  width: 8,
                  render: (v) => {
                    const s = String(v);
                    return s.length > 8 ? s.slice(0, 7) + '\u2026' : s;
                  },
                },
                {
                  key: 'name',
                  header: 'DESCRIPTION',
                  width: 30,
                  render: (v) => String(v),
                },
              ]}
              data={activeCrises}
              maxRows={6}
              highlightRow={(row) => row.severity === 'critical' || row.severity === 'high'}
            />
          </div>
        )}

        {/* Feed items */}
        {entries.length > 0 ? (
          <div className="border-t border-terminal-border pt-1">
            <ScrollingFeed items={entries} maxVisible={50} showTimestamps />
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Loading humanitarian data...' : 'No displacement reports'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
