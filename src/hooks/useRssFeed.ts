import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchFeed } from '@/services/rss-service';
import type { FeedSource, FeedItem } from '@/types';

/**
 * Stagger initial feed loading so queries don't all fire at once.
 *
 * Strategy: High-priority feeds fire immediately,
 * medium after 2s, low after 5s. Spreads initial burst
 * across ~7 seconds instead of a single tick.
 */
function getInitialDelay(priority: FeedSource['priority'], index: number): number {
  const jitter = (index % 10) * 200; // 0–1800ms spread within tier
  switch (priority) {
    case 'high':
      return jitter;
    case 'medium':
      return 2000 + jitter;
    case 'low':
      return 5000 + jitter;
    default:
      return 3000 + jitter;
  }
}

// Track which feeds have completed their initial stagger delay
const initialFetchDone = new Set<string>();

/** Create a staggered fetch function that delays the first request only */
function createStaggeredFetch(source: FeedSource, index: number) {
  return async () => {
    if (!initialFetchDone.has(source.id)) {
      initialFetchDone.add(source.id);
      const delay = getInitialDelay(source.priority, index);
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return fetchFeed(source.url, source.id, source.name, source.category);
  };
}

export function useRssFeed(source: FeedSource) {
  return useQuery({
    queryKey: ['rss', source.id],
    queryFn: () => fetchFeed(source.url, source.id, source.name, source.category),
    // No refetchInterval — the global pulse (usePulseDriver) handles all refreshes
    // via queryClient.invalidateQueries({ queryKey: ['rss'] }) every 15 seconds.
    staleTime: 10_000, // Mark stale after 10s so pulse triggers refetch
    retry: 1,
    retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 60000),
  });
}

export function useMultipleFeeds(sources: FeedSource[]) {
  const results = useQueries({
    queries: sources.map((source, index) => ({
      queryKey: ['rss', source.id],
      queryFn: createStaggeredFetch(source, index),
      // No refetchInterval — global pulse handles all refreshes
      staleTime: 10_000,
      retry: 1,
      retryDelay: (attempt: number) => Math.min(2000 * 2 ** attempt, 60000),
    })),
  });

  return {
    feeds: results
      .filter((r) => r.data)
      .flatMap((r) => r.data as FeedItem[]),
    isLoading: results.some((r) => r.isLoading),
    errors: results.filter((r) => r.error).map((r) => r.error),
    sourceStatuses: sources.map((source, i) => ({
      source,
      isLoading: results[i].isLoading,
      isError: results[i].isError,
      isStale: results[i].isStale,
      dataUpdatedAt: results[i].dataUpdatedAt,
      itemCount: (results[i].data as FeedItem[] | undefined)?.length ?? 0,
    })),
  };
}
