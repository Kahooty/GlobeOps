/**
 * useAiBriefing — React hook for AI-powered intelligence briefings.
 *
 * Reads the selected AI provider from Zustand store, then:
 * - 'computed': returns local keyword analysis (no API call)
 * - 'google'/'anthropic'/'openai': calls /api/ai server endpoint
 *
 * Auto-falls back to computed briefing on API errors.
 * Rate-limited via TanStack Query staleTime (5 min).
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  generateComputedBriefing,
  generateAiBriefing,
  SOURCE_LABELS,
} from '@/services/ai-service';
import type { IntelligenceBriefing } from '@/services/ai-service';
import type { FeedItem, Earthquake } from '@/types';

interface UseAiBriefingResult {
  briefing: IntelligenceBriefing | null;
  isLoading: boolean;
  isAiActive: boolean;
  sourceLabel: string;
  error: Error | null;
}

export function useAiBriefing(
  feeds: FeedItem[],
  quakes: Earthquake[],
): UseAiBriefingResult {
  const aiProvider = useAppStore((s) => s.aiProvider);
  const isAiProvider = aiProvider !== 'computed';

  // Computed briefing (always available as fallback)
  const computedBriefing = useMemo(() => {
    if (feeds.length === 0 && quakes.length === 0) return null;
    return generateComputedBriefing(feeds, quakes);
  }, [feeds, quakes]);

  // AI briefing (only fetches when an AI provider is selected)
  const {
    data: aiBriefing,
    isLoading: aiLoading,
    error: aiError,
  } = useQuery<IntelligenceBriefing>({
    queryKey: ['ai-briefing', aiProvider, feeds.length, quakes.length],
    queryFn: () => generateAiBriefing(
      aiProvider as Exclude<typeof aiProvider, 'computed'>,
      feeds,
      quakes,
    ),
    enabled: isAiProvider && (feeds.length > 0 || quakes.length > 0),
    staleTime: 300_000, // 5 minutes — rate limits AI calls
    gcTime: 600_000,    // Keep cached for 10 min
    retry: 1,           // Single retry before falling back
    refetchOnWindowFocus: false,
  });

  // Use AI briefing if available, otherwise fall back to computed
  const briefing = isAiProvider
    ? (aiBriefing || computedBriefing)
    : computedBriefing;

  const sourceLabel = briefing
    ? SOURCE_LABELS[briefing.source] || 'COMPUTED'
    : 'COMPUTED';

  return {
    briefing,
    isLoading: isAiProvider ? aiLoading : false,
    isAiActive: isAiProvider && !!aiBriefing,
    sourceLabel,
    error: aiError as Error | null,
  };
}
