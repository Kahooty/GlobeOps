import { useQuery } from '@tanstack/react-query';
import { fetchGDACSAlerts } from '@/services/gdacs-service';
import { REFRESH } from '@/config/constants';

/**
 * Hook for GDACS global disaster alerts (earthquakes, floods, cyclones, etc.).
 * Free API, no authentication required. Refreshes every 5 minutes.
 */
export function useGDACSAlerts() {
  return useQuery({
    queryKey: ['gdacs-alerts'],
    queryFn: fetchGDACSAlerts,
    refetchInterval: REFRESH.GDACS,
    staleTime: 120_000, // 2 min
    retry: 2,
  });
}
