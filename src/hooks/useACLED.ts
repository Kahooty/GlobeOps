import { useQuery } from '@tanstack/react-query';
import { fetchACLEDEvents } from '@/services/acled-service';
import { REFRESH } from '@/config/constants';

/**
 * Hook for ACLED armed conflict and protest events.
 * Requires VITE_ACLED_API_KEY and VITE_ACLED_EMAIL env vars.
 * Returns empty data when credentials are not configured.
 */
export function useACLEDEvents() {
  return useQuery({
    queryKey: ['acled-events'],
    queryFn: fetchACLEDEvents,
    refetchInterval: REFRESH.RELIEFWEB, // 10 min (conservative for optional source)
    staleTime: 600_000, // 10 min
    retry: 1,
    enabled: !!import.meta.env.VITE_ACLED_API_KEY,
  });
}
