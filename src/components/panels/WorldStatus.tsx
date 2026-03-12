import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { FEED_SOURCES } from '@/config/feed-sources';
import { safeOpenLink } from '@/utils/safe-open';
import { aggregateFeeds } from '@/services/feed-aggregator';
import { formatMagnitude, formatRelative } from '@/utils/formatters';
import { useAppStore } from '@/store/app-store';
import { BOX } from '@/utils/ascii';

export function WorldStatus() {
  const { data: quakes } = useEarthquakes(4);
  const { feeds } = useMultipleFeeds(FEED_SOURCES);
  const feedFocusMode = useAppStore((s) => s.feedFocusMode);

  const topHeadlines = useMemo(
    () => aggregateFeeds([feeds], { maxItems: 5, focusMode: feedFocusMode }),
    [feeds, feedFocusMode]
  );

  const significantQuakes = useMemo(
    () => (quakes || []).filter((q) => q.magnitude >= 5).slice(0, 4),
    [quakes]
  );

  const divider = BOX.H.repeat(38);

  return (
    <TerminalWindow title="WORLD STATUS" status="live">
      <div className="space-y-2 text-xs">
        {/* Top Headlines */}
        <div>
          <div className="text-terminal-primary-dim">TOP STORIES</div>
          <div className="text-terminal-primary-dim">{divider}</div>
          {topHeadlines.length > 0 ? (
            topHeadlines.map((item) => (
              <div key={item.id} className="py-0.5">
                <span className="text-terminal-primary-dim">{'\u25B8'} </span>
                <span
                  className="hover:text-terminal-primary cursor-pointer"
                  onClick={() => safeOpenLink(item.link)}
                >
                  {item.title.length > 55 ? item.title.slice(0, 54) + '\u2026' : item.title}
                </span>
              </div>
            ))
          ) : (
            <div className="text-terminal-primary-dim py-1">Loading feeds...</div>
          )}
        </div>

        {/* Seismic Activity */}
        <div>
          <div className="text-terminal-primary-dim">SEISMIC ACTIVITY (M5.0+)</div>
          <div className="text-terminal-primary-dim">{divider}</div>
          {significantQuakes.length > 0 ? (
            significantQuakes.map((q) => (
              <div key={q.id} className="flex gap-2 py-0.5">
                <span className={q.magnitude >= 6 ? 'text-terminal-red text-glow-red' : 'text-terminal-amber'}>
                  {formatMagnitude(q.magnitude)}
                </span>
                <span className="flex-1 truncate">{q.place}</span>
                <span className="text-terminal-primary-dim">{formatRelative(q.time)}</span>
              </div>
            ))
          ) : (
            <div className="text-terminal-primary-dim py-1">No significant events</div>
          )}
        </div>

        {/* Quick Stats */}
        <div>
          <div className="text-terminal-primary-dim">FEED STATS</div>
          <div className="text-terminal-primary-dim">{divider}</div>
          <div className="flex gap-4 py-0.5">
            <span>Sources: <span className="text-terminal-primary">{FEED_SOURCES.length}</span></span>
            <span>Headlines: <span className="text-terminal-primary">{feeds.length}</span></span>
            <span>Quakes: <span className="text-terminal-primary">{quakes?.length ?? 0}</span></span>
          </div>
        </div>
      </div>
    </TerminalWindow>
  );
}
