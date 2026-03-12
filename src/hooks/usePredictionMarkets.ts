import { useQuery } from '@tanstack/react-query';
import { fetchPredictionMarkets, computeMarketSummary } from '@/services/polymarket-service';
import { REFRESH } from '@/config/constants';

export function usePredictionMarkets() {
  return useQuery({
    queryKey: ['prediction-markets'],
    queryFn: fetchPredictionMarkets,
    refetchInterval: REFRESH.POLYMARKET,
    staleTime: 120_000,
    retry: 2,
  });
}

export function usePredictionMarketSummary() {
  const { data: markets = [] } = usePredictionMarkets();
  return computeMarketSummary(markets);
}
