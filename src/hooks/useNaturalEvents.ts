import { useQuery } from '@tanstack/react-query';
import { fetchNaturalEvents } from '@/services/eonet-service';
import { REFRESH } from '@/config/constants';

/**
 * Hook for NASA EONET natural events (wildfires, volcanoes, storms, floods).
 * Pattern mirrors useEarthquakes.ts.
 */
export function useNaturalEvents() {
  return useQuery({
    queryKey: ['natural-events'],
    queryFn: fetchNaturalEvents,
    refetchInterval: REFRESH.NOAA_ALERTS, // 15 min
    staleTime: 300_000, // 5 min
    retry: 2,
  });
}
