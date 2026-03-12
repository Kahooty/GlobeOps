import { useQuery } from '@tanstack/react-query';
import { fetchNOAAAlerts, noaaAlertsToMapEvents } from '@/services/noaa-service';
import { REFRESH } from '@/config/constants';

export function useWeatherAlerts() {
  return useQuery({
    queryKey: ['noaa-alerts'],
    queryFn: fetchNOAAAlerts,
    refetchInterval: REFRESH.NOAA_ALERTS,
    staleTime: 300_000,
    retry: 2,
  });
}

export function useWeatherMapEvents() {
  const { data: alerts = [] } = useWeatherAlerts();
  return noaaAlertsToMapEvents(alerts);
}
