import { useQuery } from '@tanstack/react-query';
import { fetchReliefWebDisasters } from '@/services/reliefweb-service';
import { REFRESH } from '@/config/constants';

/**
 * Hook for ReliefWeb humanitarian disasters (UN OCHA).
 * Free API, no authentication required. Refreshes every 10 minutes.
 */
export function useReliefWebDisasters() {
  return useQuery({
    queryKey: ['reliefweb-disasters'],
    queryFn: fetchReliefWebDisasters,
    refetchInterval: REFRESH.RELIEFWEB,
    staleTime: 300_000, // 5 min
    retry: 2,
  });
}
