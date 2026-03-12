import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { aggregateFeeds } from '@/services/feed-aggregator';
import { FEED_SOURCES } from '@/config/feed-sources';
import { safeOpenLink } from '@/utils/safe-open';
import { BOX } from '@/utils/ascii';

export function MarketTerminal() {
  const financeSources = useMemo(
    () => FEED_SOURCES.filter((s) => s.category === 'finance'),
    []
  );
  const { feeds, isLoading } = useMultipleFeeds(financeSources);

  const headlines = useMemo(
    () => aggregateFeeds([feeds], { maxItems: 15 }),
    [feeds]
  );

  const divider = BOX.H.repeat(38);

  return (
    <TerminalWindow
      title="MARKET TERMINAL"
      status={isLoading ? 'loading' : 'live'}
    >
      <div className="space-y-2 text-xs">
        <div>
          <div className="text-terminal-cyan">MARKET HEADLINES</div>
          <div className="text-terminal-primary-dim">{divider}</div>
          {headlines.length > 0 ? (
            headlines.map((item) => (
              <div key={item.id} className="py-0.5 flex gap-2">
                <span className="text-terminal-primary-dim shrink-0">
                  [{item.source.slice(0, 6).padEnd(6)}]
                </span>
                <span
                  className="text-terminal-cyan hover:text-terminal-primary cursor-pointer truncate"
                  onClick={() => safeOpenLink(item.link)}
                >
                  {item.title}
                </span>
              </div>
            ))
          ) : (
            <div className="text-terminal-primary-dim py-1">
              {isLoading ? 'Loading market data...' : 'No market headlines'}
            </div>
          )}
        </div>

        <div className="border-t border-terminal-border pt-2">
          <div className="text-terminal-primary-dim">
            {'\u25B8'} Add FINNHUB_API_KEY to .env for live quotes
          </div>
        </div>
      </div>
    </TerminalWindow>
  );
}
