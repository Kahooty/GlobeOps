import { useQuery } from '@tanstack/react-query';
import { fetchGDELTEvents, gdeltEventsToMapEvents } from '@/services/gdelt-service';
import { REFRESH } from '@/config/constants';

export function useGdeltEvents() {
  return useQuery({
    queryKey: ['gdelt-events'],
    queryFn: fetchGDELTEvents,
    refetchInterval: REFRESH.GDELT_EVENTS,
    staleTime: 300_000,
    retry: 2,
  });
}

export function useGdeltMapEvents() {
  const { data: events = [] } = useGdeltEvents();
  return gdeltEventsToMapEvents(events);
}
