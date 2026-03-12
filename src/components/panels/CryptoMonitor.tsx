/**
 * CryptoMonitor — Cryptocurrency market dashboard.
 *
 * Displays top crypto assets from CoinGecko with price, 24h change,
 * volume, 7-day sparklines, and market summary statistics.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { useCryptoPrices, useCryptoSummary } from '@/hooks/useCrypto';
import type { CryptoAsset } from '@/services/coingecko-service';
import type { PanelStatus } from '@/types';

function formatPrice(price: number): string {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
  return `$${(vol / 1e3).toFixed(0)}K`;
}

function formatPctChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`;
  return `$${(mc / 1e6).toFixed(0)}M`;
}

const columns = [
  {
    key: 'symbol' as keyof CryptoAsset,
    header: 'COIN',
    width: 5,
    render: (v: CryptoAsset[keyof CryptoAsset]) => String(v),
  },
  {
    key: 'currentPrice' as keyof CryptoAsset,
    header: 'PRICE',
    width: 8,
    align: 'right' as const,
    render: (v: CryptoAsset[keyof CryptoAsset]) => formatPrice(Number(v)),
  },
  {
    key: 'priceChangePercent24h' as keyof CryptoAsset,
    header: '24H',
    width: 7,
    align: 'right' as const,
    render: (v: CryptoAsset[keyof CryptoAsset]) => formatPctChange(Number(v)),
  },
  {
    key: 'totalVolume' as keyof CryptoAsset,
    header: 'VOL',
    width: 7,
    align: 'right' as const,
    render: (v: CryptoAsset[keyof CryptoAsset]) => formatVolume(Number(v)),
  },
];

export function CryptoMonitor() {
  const { data: assets = [], isLoading, isError } = useCryptoPrices(20);
  const summary = useCryptoSummary(20);
  const status: PanelStatus = isLoading ? 'loading' : isError ? 'error' : 'live';

  // Top gainer/loser sparklines
  const btcSparkline = useMemo(() => {
    const btc = assets.find((a) => a.symbol === 'BTC');
    return btc?.sparkline7d ?? [];
  }, [assets]);

  const ethSparkline = useMemo(() => {
    const eth = assets.find((a) => a.symbol === 'ETH');
    return eth?.sparkline7d ?? [];
  }, [assets]);

  return (
    <TerminalWindow
      title="CRYPTO MONITOR"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {summary.avgChange24h !== 0 && (
            <span
              className="font-bold"
              style={{
                color: summary.avgChange24h >= 0
                  ? 'var(--color-terminal-green)'
                  : 'var(--color-terminal-red)',
              }}
            >
              MKT {formatPctChange(summary.avgChange24h)}
            </span>
          )}
          <span className="text-terminal-primary-dim">{assets.length} coins</span>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Market summary */}
        {assets.length > 0 && (
          <div className="px-1 text-[9px]">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-terminal-primary-dim">
              <span>
                MCAP: <span className="text-terminal-cyan">{formatMarketCap(summary.totalMarketCap)}</span>
              </span>
              <span>
                VOL: <span className="text-terminal-cyan">{formatVolume(summary.totalVolume24h)}</span>
              </span>
              <span>
                BTC.D: <span className="text-terminal-amber">{summary.btcDominance.toFixed(1)}%</span>
              </span>
            </div>

            {/* Top movers */}
            <div className="flex gap-3 mt-1">
              {summary.topGainer && (
                <span className="text-terminal-green text-[8px]">
                  ▲ {summary.topGainer.symbol} {formatPctChange(summary.topGainer.priceChangePercent24h)}
                </span>
              )}
              {summary.topLoser && (
                <span className="text-terminal-red text-[8px]">
                  ▼ {summary.topLoser.symbol} {formatPctChange(summary.topLoser.priceChangePercent24h)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* BTC/ETH sparklines */}
        {(btcSparkline.length > 0 || ethSparkline.length > 0) && (
          <div className="px-1 border-t border-terminal-border pt-1 space-y-0.5">
            {btcSparkline.length > 0 && (
              <AsciiChart data={btcSparkline} type="sparkline" label="BTC 7D" variant="amber" />
            )}
            {ethSparkline.length > 0 && (
              <AsciiChart data={ethSparkline} type="sparkline" label="ETH 7D" variant="cyan" />
            )}
          </div>
        )}

        {/* Price table */}
        {assets.length > 0 ? (
          <div className="border-t border-terminal-border pt-1">
            <AsciiTable
              columns={columns}
              data={assets}
              maxRows={15}
              highlightRow={(row: CryptoAsset) =>
                Math.abs(row.priceChangePercent24h) > 5
              }
            />
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Loading crypto data...' : 'No crypto data available'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
