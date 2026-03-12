/**
 * Polymarket Service — Fetches prediction market data for geopolitical contracts.
 *
 * Free API, no key required. Returns active geopolitical markets
 * with probability, volume, and outcome data.
 */

export interface PredictionMarket {
  id: string;
  question: string;
  slug: string;
  category: string;
  probability: number;    // 0-100
  volume24h: number;
  totalVolume: number;
  liquidityUsd: number;
  endDate: string;
  active: boolean;
  outcomes: Array<{
    name: string;
    probability: number;
  }>;
  url: string;
}

// ─── Geopolitical Keywords Filter ───

const GEO_KEYWORDS = [
  'war', 'conflict', 'military', 'nuclear', 'nato', 'china', 'russia',
  'ukraine', 'iran', 'taiwan', 'israel', 'gaza', 'north korea', 'dprk',
  'election', 'president', 'sanctions', 'tariff', 'trade', 'oil',
  'invasion', 'ceasefire', 'peace', 'treaty', 'missile', 'attack',
  'coup', 'revolution', 'crisis', 'emergency', 'terror',
  'crypto', 'bitcoin', 'fed', 'interest rate', 'recession',
  'climate', 'pandemic', 'who', 'un', 'security council',
  'ai', 'regulation', 'ban', 'embargo', 'drone', 'cyber',
];

function isGeopolitical(question: string): boolean {
  const lower = question.toLowerCase();
  return GEO_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── Fetch Markets ───

export async function fetchPredictionMarkets(): Promise<PredictionMarket[]> {
  const params = new URLSearchParams({
    limit: '100',
    active: 'true',
    closed: 'false',
    order: 'volume24hr',
    ascending: 'false',
  });

  const targetUrl = `https://gamma-api.polymarket.com/markets?${params}`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Polymarket fetch failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .filter((market: Record<string, unknown>) => {
      const question = String(market.question || '');
      return isGeopolitical(question);
    })
    .slice(0, 40)
    .map((market: Record<string, unknown>) => {
      const outcomes: Array<{ name: string; probability: number }> = [];

      // Parse outcomes from clobTokenIds or outcomePrices
      const outcomePrices = market.outcomePrices as string | undefined;
      const outcomeNames = ['Yes', 'No'];

      if (outcomePrices) {
        try {
          const prices = JSON.parse(outcomePrices) as number[];
          prices.forEach((price, i) => {
            outcomes.push({
              name: outcomeNames[i] || `Outcome ${i + 1}`,
              probability: Math.round(price * 100),
            });
          });
        } catch {
          // Fallback
          outcomes.push({ name: 'Yes', probability: 50 });
          outcomes.push({ name: 'No', probability: 50 });
        }
      }

      const yesProbability = outcomes.find((o) => o.name === 'Yes')?.probability || 50;

      return {
        id: String(market.id || market.conditionId || ''),
        question: String(market.question || ''),
        slug: String(market.slug || ''),
        category: String(market.groupItemTitle || market.category || 'General'),
        probability: yesProbability,
        volume24h: Number(market.volume24hr || 0),
        totalVolume: Number(market.volumeNum || market.volume || 0),
        liquidityUsd: Number(market.liquidityNum || market.liquidity || 0),
        endDate: String(market.endDate || market.end_date_iso || ''),
        active: Boolean(market.active),
        outcomes,
        url: `https://polymarket.com/event/${market.slug || market.id}`,
      };
    });
}

// ─── Summary Stats ───

export interface PredictionMarketSummary {
  totalMarkets: number;
  totalVolume24h: number;
  highConfidence: PredictionMarket[];  // > 80% or < 20%
  trending: PredictionMarket[];        // Highest 24h volume
}

export function computeMarketSummary(markets: PredictionMarket[]): PredictionMarketSummary {
  const totalVolume24h = markets.reduce((sum, m) => sum + m.volume24h, 0);

  const highConfidence = markets.filter(
    (m) => m.probability > 80 || m.probability < 20,
  ).slice(0, 10);

  const trending = [...markets]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 10);

  return {
    totalMarkets: markets.length,
    totalVolume24h,
    highConfidence,
    trending,
  };
}
