import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPrices, computeCryptoSummary } from '@/services/coingecko-service';
import { REFRESH } from '@/config/constants';

export function useCryptoPrices(limit = 25) {
  return useQuery({
    queryKey: ['crypto-prices', limit],
    queryFn: () => fetchCryptoPrices(limit),
    refetchInterval: REFRESH.COINGECKO,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useCryptoSummary(limit = 25) {
  const { data: assets = [] } = useCryptoPrices(limit);
  return computeCryptoSummary(assets);
}
