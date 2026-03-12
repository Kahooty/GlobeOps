/**
 * PredictionMarkets — Geopolitical prediction market contracts.
 *
 * Displays Polymarket geopolitical contracts with probability,
 * volume, and outcome tracking. Uses the Polymarket service hook.
 * Falls back to a simulated display if API is unavailable.
 */

import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { usePredictionMarkets, usePredictionMarketSummary } from '@/hooks/usePredictionMarkets';
import type { PredictionMarket } from '@/services/polymarket-service';
import type { PanelStatus } from '@/types';

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatProb(prob: number): string {
  return `${Math.round(prob)}%`;
}

export function PredictionMarkets() {
  const { data: markets = [], isLoading, isError, isStale } = usePredictionMarkets();
  const summary = usePredictionMarketSummary();

  const status: PanelStatus = isLoading ? 'loading' : isError ? 'error' : isStale ? 'stale' : 'live';

  return (
    <TerminalWindow
      title="PREDICTION MARKETS"
      status={status}
      headerRight={
        <span className="text-terminal-primary-dim text-[9px]">
          {markets.length} contracts
        </span>
      }
    >
      <div className="space-y-2">
        {/* Summary stats */}
        {summary && (
          <div className="flex items-center gap-3 text-[9px] px-1">
            <span className="text-terminal-primary-dim">
              HIGH CONFIDENCE: <span className="text-terminal-green">{summary.highConfidence.length}</span>
            </span>
            <span className="text-terminal-primary-dim">
              TRENDING: <span className="text-terminal-cyan">{summary.trending.length}</span>
            </span>
          </div>
        )}

        {/* Markets table */}
        {markets.length > 0 ? (
          <AsciiTable<PredictionMarket>
            columns={[
              {
                key: 'question',
                header: 'CONTRACT',
                width: 30,
                render: (v) => {
                  const s = String(v);
                  return s.length > 30 ? s.slice(0, 29) + '\u2026' : s;
                },
              },
              {
                key: 'probability',
                header: 'YES%',
                width: 5,
                align: 'right',
                render: (v) => formatProb(v as number),
              },
              {
                key: 'volume24h',
                header: 'VOL',
                width: 7,
                align: 'right',
                render: (v) => formatVolume(v as number),
              },
            ]}
            data={markets.slice(0, 12)}
            maxRows={12}
            highlightRow={(row) => row.probability > 80 || row.probability < 20}
          />
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Loading prediction markets...' : 'No geopolitical contracts available'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
