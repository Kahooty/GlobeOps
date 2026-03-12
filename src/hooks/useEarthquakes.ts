import { useQuery } from '@tanstack/react-query';
import { fetchEarthquakes } from '@/services/earthquake-service';
import { REFRESH } from '@/config/constants';

export function useEarthquakes(minMagnitude = 4) {
  return useQuery({
    queryKey: ['earthquakes', minMagnitude],
    queryFn: () => fetchEarthquakes(minMagnitude),
    refetchInterval: REFRESH.EARTHQUAKES,
    staleTime: 60_000,
    retry: 2,
  });
}
