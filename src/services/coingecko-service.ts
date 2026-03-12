/**
 * CoinGecko Service — Fetches cryptocurrency market data.
 *
 * Free tier, no API key required. Returns top coins by market cap
 * with price, 24h change, volume, and sparkline data.
 */

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  ath: number;
  athDate: string;
  sparkline7d: number[];
}

// ─── Fetch Crypto Prices ───

export async function fetchCryptoPrices(limit = 25): Promise<CryptoAsset[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(limit),
    page: '1',
    sparkline: 'true',
    price_change_percentage: '24h',
  });

  const targetUrl = `https://api.coingecko.com/api/v3/coins/markets?${params}`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`CoinGecko fetch failed: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) return [];

  return data.map((coin: Record<string, unknown>) => ({
    id: String(coin.id),
    symbol: String(coin.symbol || '').toUpperCase(),
    name: String(coin.name),
    image: String(coin.image || ''),
    currentPrice: Number(coin.current_price || 0),
    marketCap: Number(coin.market_cap || 0),
    marketCapRank: Number(coin.market_cap_rank || 0),
    priceChange24h: Number(coin.price_change_24h || 0),
    priceChangePercent24h: Number(coin.price_change_percentage_24h || 0),
    totalVolume: Number(coin.total_volume || 0),
    high24h: Number(coin.high_24h || 0),
    low24h: Number(coin.low_24h || 0),
    ath: Number(coin.ath || 0),
    athDate: String(coin.ath_date || ''),
    sparkline7d: Array.isArray((coin.sparkline_in_7d as Record<string, unknown>)?.price)
      ? ((coin.sparkline_in_7d as Record<string, unknown>).price as number[]).slice(-24) // Last 24 data points
      : [],
  }));
}

// ─── Summary Stats ───

export interface CryptoMarketSummary {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  topGainer: CryptoAsset | null;
  topLoser: CryptoAsset | null;
  avgChange24h: number;
}

export function computeCryptoSummary(assets: CryptoAsset[]): CryptoMarketSummary {
  if (assets.length === 0) {
    return {
      totalMarketCap: 0,
      totalVolume24h: 0,
      btcDominance: 0,
      topGainer: null,
      topLoser: null,
      avgChange24h: 0,
    };
  }

  const totalMarketCap = assets.reduce((sum, a) => sum + a.marketCap, 0);
  const totalVolume24h = assets.reduce((sum, a) => sum + a.totalVolume, 0);
  const btc = assets.find((a) => a.symbol === 'BTC');
  const btcDominance = btc ? (btc.marketCap / totalMarketCap) * 100 : 0;

  const sorted = [...assets].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h);
  const topGainer = sorted[0] || null;
  const topLoser = sorted[sorted.length - 1] || null;

  const avgChange24h = assets.reduce((sum, a) => sum + a.priceChangePercent24h, 0) / assets.length;

  return { totalMarketCap, totalVolume24h, btcDominance, topGainer, topLoser, avgChange24h };
}
