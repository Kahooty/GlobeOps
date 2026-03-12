import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { StatusIndicator } from '@/components/terminal/StatusIndicator';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { FEED_SOURCES } from '@/config/feed-sources';
import { formatRelative } from '@/utils/formatters';
import type { PanelStatus } from '@/types';

export function SystemStatus() {
  const { sourceStatuses } = useMultipleFeeds(FEED_SOURCES);
  const earthquakes = useEarthquakes();

  const allSources = [
    ...sourceStatuses.map((s) => ({
      name: s.source.name,
      status: (s.isLoading ? 'loading' : s.isError ? 'error' : s.isStale ? 'stale' : 'live') as PanelStatus,
      lastUpdate: s.dataUpdatedAt ? new Date(s.dataUpdatedAt) : null,
      items: s.itemCount,
    })),
    {
      name: 'USGS Quakes',
      status: (earthquakes.isLoading ? 'loading' : earthquakes.isError ? 'error' : earthquakes.isStale ? 'stale' : 'live') as PanelStatus,
      lastUpdate: earthquakes.dataUpdatedAt ? new Date(earthquakes.dataUpdatedAt) : null,
      items: earthquakes.data?.length ?? 0,
    },
  ];

  const liveCount = allSources.filter((s) => s.status === 'live').length;
  const staleCount = allSources.filter((s) => s.status === 'stale').length;
  const errorCount = allSources.filter((s) => s.status === 'error').length;
  const degradedSources = allSources.filter((s) => s.status === 'error' || s.status === 'stale');

  const overallStatus: PanelStatus =
    errorCount > allSources.length / 2 ? 'error' : errorCount > 0 ? 'stale' : 'live';

  return (
    <TerminalWindow title="SYSTEM STATUS" status={overallStatus}>
      <div className="space-y-2">
        <div className="text-xs text-terminal-primary-dim">DATA SOURCE HEALTH</div>

        <div className="space-y-0.5">
          {allSources.map((source) => (
            <div key={source.name} className="flex items-center gap-2 text-xs">
              <StatusIndicator status={source.status} showLabel={false} />
              <span className="w-[12ch] truncate">{source.name}</span>
              <span className="text-terminal-primary-dim flex-1 text-right">
                {source.lastUpdate ? formatRelative(source.lastUpdate) : '---'}
              </span>
              <span className="text-terminal-primary-dim w-[5ch] text-right">
                {source.items > 0 ? `${source.items}` : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Degraded Sources — highlight feeds needing attention */}
        {degradedSources.length > 0 && (
          <div className="border-t border-terminal-border pt-2">
            <div className="text-[10px] text-terminal-red tracking-widest mb-1">
              ⚠ DEGRADED SOURCES ({degradedSources.length})
            </div>
            <div className="space-y-0.5">
              {degradedSources.slice(0, 8).map((source) => (
                <div key={source.name} className="flex items-center gap-2 text-[10px]">
                  <span style={{ color: source.status === 'error' ? 'var(--color-terminal-red)' : 'var(--color-terminal-amber)' }}>
                    {source.status === 'error' ? '✖' : '⏳'}
                  </span>
                  <span className="truncate flex-1" style={{
                    color: source.status === 'error' ? 'var(--color-terminal-red)' : 'var(--color-terminal-amber)',
                  }}>
                    {source.name}
                  </span>
                  <span className="text-terminal-primary-dim text-[9px]">
                    {source.lastUpdate ? formatRelative(source.lastUpdate) : 'no data'}
                  </span>
                </div>
              ))}
              {degradedSources.length > 8 && (
                <div className="text-[9px] text-terminal-primary-dim">
                  +{degradedSources.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-terminal-border pt-2 text-xs flex gap-4">
          <span>
            FEEDS: <span className="text-terminal-primary">{liveCount}/{allSources.length}</span> active
          </span>
          {staleCount > 0 && (
            <span>
              STALE: <span className="text-terminal-amber">{staleCount}</span>
            </span>
          )}
          {errorCount > 0 && (
            <span>
              ERRORS: <span className="text-terminal-red">{errorCount}</span>
            </span>
          )}
        </div>
      </div>
    </TerminalWindow>
  );
}
