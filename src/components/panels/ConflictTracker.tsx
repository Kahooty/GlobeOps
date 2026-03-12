/**
 * ConflictTracker — Monitors active conflict zones from news feeds.
 *
 * Displays a table of active conflict regions with event counts,
 * dominant type, severity trend, and latest headline.
 * Built from defense + world news feeds with conflict keyword filtering.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { FeedFilterPopup, type FilterOption } from '@/components/terminal/FeedFilterPopup';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useReliefWebDisasters } from '@/hooks/useReliefWeb';
import { useACLEDEvents } from '@/hooks/useACLED';
import { useAppStore } from '@/store/app-store';
import { FEED_SOURCES } from '@/config/feed-sources';
import { inferRegionFromText, ALL_REGIONS } from '@/config/regions';
import { regionFromCountry } from '@/services/event-normalizer';
import type { FeedItem, PanelStatus, Region } from '@/types';

// Conflict-related keywords
const CONFLICT_KEYWORDS = /war\b|conflict|military|attack|strike|bomb|missile|troops|deploy|invasion|battle|fighting|casualt|kill|shell|drone|airstr|offensive|ceasefire|escalat|weapon|arms|nato|front.?line/i;

interface ConflictZone {
  region: Region;
  eventCount: number;
  criticalCount: number;
  latestHeadline: string;
  latestSource: string;
  latestTime: Date;
}

// Use shared region inference from @/config/regions
function inferRegion(item: FeedItem): Region {
  return inferRegionFromText(`${item.title} ${item.snippet}`);
}

const CONFLICT_FEEDS = FEED_SOURCES.filter((f) =>
  ['defense', 'world-news', 'government', 'think-tanks', 'regional-mideast', 'regional-africa', 'regional-asia', 'regional-latam', 'regional-europe'].includes(f.category)
);

const CRITICAL_WORDS = /kill|casualt|bomb|missile|invasion|escalat|nuclear/i;

const REGION_FILTER_OPTIONS: FilterOption[] = ALL_REGIONS.map((r) => ({
  id: r,
  label: r,
  colorVar: r === 'MIDDLE EAST' ? '--color-terminal-red'
    : r === 'EUROPE' ? '--color-terminal-cyan'
    : r === 'EAST ASIA' ? '--color-terminal-amber'
    : r === 'AFRICA' ? '--color-terminal-magenta'
    : '--color-terminal-primary',
}));

// ReliefWeb conflict-type keywords
const RELIEFWEB_CONFLICT_TYPES = /complex emergency|conflict|civil unrest/i;

export function ConflictTracker() {
  const { selectedRegion, setSelectedRegion } = useAppStore();
  const [showFilter, setShowFilter] = useState(false);
  const [enabledRegions, setEnabledRegions] = useState<Set<string>>(new Set(ALL_REGIONS));

  const { feeds, isLoading, errors } = useMultipleFeeds(CONFLICT_FEEDS);
  const { data: reliefWebData, isLoading: rwLoading } = useReliefWebDisasters();
  const { data: acledData, isLoading: acledLoading } = useACLEDEvents();

  // Sync with global selectedRegion: when set externally, isolate that region
  useEffect(() => {
    if (selectedRegion && ALL_REGIONS.includes(selectedRegion)) {
      setEnabledRegions(new Set([selectedRegion]));
    } else if (!selectedRegion) {
      setEnabledRegions(new Set(ALL_REGIONS));
    }
  }, [selectedRegion]);

  const handleToggle = useCallback((id: string) => {
    setEnabledRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSetAll = useCallback((ids: string[]) => {
    setEnabledRegions(new Set(ids));
  }, []);

  const anyLoading = isLoading || rwLoading || acledLoading;
  const hasErrors = errors.some((e) => e !== null);
  const status: PanelStatus = anyLoading ? 'loading' : hasErrors ? 'error' : 'live';

  const zones: ConflictZone[] = useMemo(() => {
    const conflictItems = feeds.filter((item) =>
      CONFLICT_KEYWORDS.test(`${item.title} ${item.snippet}`)
    );

    // Build region → items map from RSS feeds
    const regionMap = new Map<Region, { titles: string[]; sources: string[]; times: Date[]; criticals: number }>();

    const addToRegion = (region: Region, title: string, source: string, time: Date, isCritical: boolean) => {
      if (!regionMap.has(region)) regionMap.set(region, { titles: [], sources: [], times: [], criticals: 0 });
      const entry = regionMap.get(region)!;
      entry.titles.push(title);
      entry.sources.push(source);
      entry.times.push(time);
      if (isCritical) entry.criticals++;
    };

    for (const item of conflictItems) {
      const region = inferRegion(item);
      const isCritical = CRITICAL_WORDS.test(`${item.title} ${item.snippet}`);
      addToRegion(region, item.title, item.source, item.pubDate, isCritical);
    }

    // Merge ReliefWeb conflict-type disasters
    if (reliefWebData) {
      for (const d of reliefWebData) {
        if (RELIEFWEB_CONFLICT_TYPES.test(d.type)) {
          const region = regionFromCountry(d.country);
          addToRegion(region, d.name, 'ReliefWeb', d.date, true);
        }
      }
    }

    // Merge ACLED armed conflict events (when API key is available)
    if (acledData) {
      for (const ev of acledData) {
        const region = regionFromCountry(ev.country);
        const isCritical = ev.fatalities > 10;
        addToRegion(region, `${ev.eventType}: ${ev.location}`, 'ACLED', ev.date, isCritical);
      }
    }

    return Array.from(regionMap.entries())
      .filter(([region]) => enabledRegions.has(region))
      .map(([region, data]) => {
        // Sort by time descending to get latest
        const indices = data.times.map((_, i) => i).sort((a, b) => data.times[b].getTime() - data.times[a].getTime());
        const latestIdx = indices[0];
        return {
          region,
          eventCount: data.titles.length,
          criticalCount: data.criticals,
          latestHeadline: data.titles[latestIdx],
          latestSource: data.sources[latestIdx],
          latestTime: data.times[latestIdx],
        };
      })
      .sort((a, b) => b.eventCount - a.eventCount);
  }, [feeds, reliefWebData, acledData, enabledRegions]);

  const totalEvents = zones.reduce((sum, z) => sum + z.eventCount, 0);

  return (
    <TerminalWindow
      title="CONFLICT TRACKER"
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
          <span className="text-terminal-primary-dim">
            {totalEvents} reports • {zones.length} regions
          </span>
          <button
            className="text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => setShowFilter(!showFilter)}
          >
            [FILTER]
          </button>
          {showFilter && (
            <FeedFilterPopup
              title="REGION FILTER"
              options={REGION_FILTER_OPTIONS}
              enabledIds={enabledRegions}
              onToggle={handleToggle}
              onSetAll={handleSetAll}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>
      }
    >
      <div className="space-y-2">
        {zones.length > 0 ? (
          <AsciiTable<ConflictZone>
            onRowClick={(zone) => setSelectedRegion(zone.region)}
            columns={[
              {
                key: 'region',
                header: 'REGION',
                width: 14,
                render: (v) => String(v),
              },
              {
                key: 'eventCount',
                header: 'RPT',
                width: 4,
                align: 'right',
                render: (v) => String(v),
              },
              {
                key: 'criticalCount',
                header: '!!',
                width: 3,
                align: 'right',
                render: (v) => {
                  const n = v as number;
                  return n > 0 ? `${n}` : '·';
                },
              },
              {
                key: 'latestHeadline',
                header: 'LATEST',
                width: 32,
                render: (v) => {
                  const s = String(v);
                  return s.length > 32 ? s.slice(0, 31) + '\u2026' : s;
                },
              },
            ]}
            data={zones.slice(0, 10)}
            maxRows={10}
            highlightRow={(row) => row.criticalCount > 0}
          />
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {anyLoading ? 'Scanning conflict data...' : 'No active conflicts detected'}
          </div>
        )}

        {/* Source status */}
        <div className="text-[8px] text-terminal-primary-dim px-1 pt-1 border-t border-terminal-border flex gap-2">
          <span>SRC: RSS</span>
          {reliefWebData && reliefWebData.length > 0 && <span>+ ReliefWeb({reliefWebData.length})</span>}
          {acledData && acledData.length > 0 && <span>+ ACLED({acledData.length})</span>}
        </div>
      </div>
    </TerminalWindow>
  );
}
