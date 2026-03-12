/**
 * useAiProviders — Checks which AI providers have API keys configured.
 *
 * Calls GET /api/ai/status to determine availability without exposing keys.
 * Used by the provider selector UI to gray out unavailable options.
 */

import { useQuery } from '@tanstack/react-query';
import { checkAiProviders } from '@/services/ai-service';
import type { AiProvider } from '@/types';

interface UseAiProvidersResult {
  providers: Record<AiProvider, boolean>;
  isLoading: boolean;
}

const DEFAULT_PROVIDERS: Record<AiProvider, boolean> = {
  google: false,
  anthropic: false,
  openai: false,
  computed: true,
};

export function useAiProviders(): UseAiProvidersResult {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: checkAiProviders,
    staleTime: 60_000,      // Re-check every minute
    gcTime: 300_000,
    refetchOnWindowFocus: true,
  });

  return {
    providers: data || DEFAULT_PROVIDERS,
    isLoading,
  };
}
