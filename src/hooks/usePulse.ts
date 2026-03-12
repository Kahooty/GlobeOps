import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global pulse — coordinated data refresh timer.
 *
 * Every PULSE_INTERVAL_MS, invalidates all 'rss' queries in React Query,
 * triggering a synchronized refetch across all panels. This replaces
 * per-source individual intervals with a single coordinated heartbeat.
 *
 * The pulse:
 * - Fires every 15 seconds (configurable)
 * - Invalidates React Query cache for RSS feeds
 * - React Query deduplicates: same query key won't fire twice
 * - Stale queries refetch; fresh ones skip (staleTime still respected)
 */

// ─── Configurable pulse interval (ms) ───
// Start with 15 seconds as requested. Adjust as needed.
const PULSE_INTERVAL_MS = 15_000;

// Track pulse state at module level so multiple hook instances share state
let pulseCount = 0;
let lastPulseTime = 0;

/**
 * Hook that drives the global refresh pulse.
 * Should be mounted ONCE at the app root level.
 * All feed queries share the React Query cache, so invalidating
 * from one place refreshes everything.
 */
export function usePulseDriver() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start the pulse
    intervalRef.current = setInterval(() => {
      pulseCount++;
      lastPulseTime = Date.now();

      // Invalidate all RSS queries — React Query refetches stale ones
      queryClient.invalidateQueries({ queryKey: ['rss'] });
    }, PULSE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [queryClient]);
}

/**
 * Read-only hook to get pulse metadata (for display in SystemStatus etc).
 */
export function usePulseInfo() {
  return {
    intervalMs: PULSE_INTERVAL_MS,
    pulseCount,
    lastPulseTime,
  };
}

/**
 * Hook to manually trigger an immediate pulse (e.g., user clicks "refresh").
 */
export function useManualPulse() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    pulseCount++;
    lastPulseTime = Date.now();
    queryClient.invalidateQueries({ queryKey: ['rss'] });
  }, [queryClient]);
}
