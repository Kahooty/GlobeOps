import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { aggregateFeeds } from '@/services/feed-aggregator';
import { useAppStore } from '@/store/app-store';
import { safeOpenLink } from '@/utils/safe-open';
import { FEED_SOURCES } from '@/config/feed-sources';
import { ALL_REGIONS, REGION_CATEGORIES } from '@/config/regions';
import { BOX, horizontalBar } from '@/utils/ascii';

export function RegionMonitor() {
  const { selectedRegion, setSelectedRegion, feedFocusMode } = useAppStore();
  const { feeds } = useMultipleFeeds(FEED_SOURCES);

  const filteredHeadlines = useMemo(() => {
    if (!selectedRegion) return [];
    const cats = REGION_CATEGORIES[selectedRegion];
    return aggregateFeeds([feeds], { categories: cats, maxItems: 10, focusMode: feedFocusMode });
  }, [feeds, selectedRegion, feedFocusMode]);

  const divider = BOX.H.repeat(38);

  // Count items per region for the activity bar
  const regionActivity = useMemo(() => {
    return ALL_REGIONS.map((region) => {
      const cats = REGION_CATEGORIES[region];
      const count = feeds.filter((f) => cats.includes(f.category)).length;
      return { region, count };
    });
  }, [feeds]);

  const maxCount = Math.max(...regionActivity.map((r) => r.count), 1);

  return (
    <TerminalWindow title="REGION MONITOR" status="live">
      <div className="space-y-2 text-xs">
        {!selectedRegion ? (
          <>
            <div className="text-terminal-primary-dim">SELECT REGION</div>
            <div className="text-terminal-primary-dim">{divider}</div>
            {regionActivity.map(({ region, count }) => (
              <div
                key={region}
                className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-terminal-bg-highlight transition-colors"
                onClick={() => setSelectedRegion(region)}
              >
                <span className="text-terminal-cyan w-[14ch]">{region}</span>
                <span className="text-terminal-primary">{horizontalBar(count, maxCount, 12)}</span>
                <span className="text-terminal-primary-dim">{count}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-terminal-cyan font-bold">REGION: {selectedRegion}</div>
              <button
                className="text-terminal-primary-dim hover:text-terminal-primary text-xs"
                onClick={() => setSelectedRegion(null)}
              >
                [BACK]
              </button>
            </div>
            <div className="text-terminal-primary-dim">{divider}</div>
            <div className="text-terminal-primary-dim">
              HEADLINES ({filteredHeadlines.length})
            </div>
            {filteredHeadlines.map((item) => (
              <div key={item.id} className="py-0.5">
                <span className="text-terminal-primary-dim">{'\u25B8'} </span>
                <span
                  className="hover:text-terminal-primary cursor-pointer"
                  onClick={() => safeOpenLink(item.link)}
                >
                  {item.title.length > 52 ? item.title.slice(0, 51) + '\u2026' : item.title}
                </span>
                <span className="text-terminal-primary-dim ml-2">[{item.source}]</span>
              </div>
            ))}
            {filteredHeadlines.length === 0 && (
              <div className="text-terminal-primary-dim py-1">No headlines for this region</div>
            )}
          </>
        )}
      </div>
    </TerminalWindow>
  );
}
