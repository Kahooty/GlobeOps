/**
 * AI Intelligence Service — Multi-provider intelligence briefing generation.
 *
 * Supports three AI providers (Google Gemini, Anthropic Claude, OpenAI GPT)
 * plus a local computed fallback using keyword analysis.
 *
 * AI API keys are stored server-side only (never in the browser bundle).
 * The client POSTs summarized data to /api/ai; the server proxies to the
 * selected provider with the appropriate API key.
 *
 * Computed briefings require no API key and work entirely client-side.
 */

import type { FeedItem, Earthquake, Region, AiProvider, AiBriefingSource } from '@/types';

// ─── Output Types ───

export interface IntelligenceBriefing {
  summary: string;
  threatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  keyDevelopments: KeyDevelopment[];
  regionAssessments: RegionAssessment[];
  timestamp: Date;
  source: AiBriefingSource;
}

export interface KeyDevelopment {
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: Region | 'GLOBAL';
}

export interface RegionAssessment {
  region: Region;
  threatLevel: number; // 0-100
  trend: 'rising' | 'stable' | 'declining';
  topConcern: string;
}

// ─── Provider Labels ───

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  google: 'GEMINI',
  anthropic: 'CLAUDE',
  openai: 'GPT',
  computed: 'COMPUTED',
};

export const SOURCE_LABELS: Record<AiBriefingSource, string> = {
  'google-api': 'GEMINI',
  'anthropic-api': 'CLAUDE',
  'openai-api': 'GPT',
  'computed': 'COMPUTED',
};

// ─── AI Provider Status ───

export async function checkAiProviders(): Promise<Record<AiProvider, boolean>> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.providers;
  } catch {
    return { google: false, anthropic: false, openai: false, computed: true };
  }
}

// ─── AI Briefing Generator (calls server-side proxy) ───

export async function generateAiBriefing(
  provider: Exclude<AiProvider, 'computed'>,
  feeds: FeedItem[],
  quakes: Earthquake[],
): Promise<IntelligenceBriefing> {
  // Summarize data for the AI prompt (keep payload small)
  const feedSummary = feeds
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 40)
    .map((f) => ({
      title: f.title.slice(0, 100),
      source: f.source.slice(0, 20),
      category: f.category,
    }));

  const quakeSummary = quakes
    .filter((q) => q.magnitude >= 4.5)
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 10)
    .map((q) => ({
      magnitude: q.magnitude,
      place: q.place.slice(0, 60),
    }));

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      feeds: feedSummary,
      quakes: quakeSummary,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `AI request failed (${response.status})`);
  }

  const data = await response.json();

  // Normalize the response into our IntelligenceBriefing format
  return {
    summary: data.summary || 'Analysis complete.',
    threatLevel: data.threatLevel || 'LOW',
    keyDevelopments: (data.keyDevelopments || []).map((d: KeyDevelopment) => ({
      title: d.title || '',
      category: d.category || 'SECURITY',
      severity: d.severity || 'medium',
      region: d.region || 'GLOBAL',
    })),
    regionAssessments: (data.regionAssessments || []).map((r: RegionAssessment) => ({
      region: r.region || 'GLOBAL',
      threatLevel: typeof r.threatLevel === 'number' ? r.threatLevel : 0,
      trend: r.trend || 'stable',
      topConcern: r.topConcern || 'No significant concerns',
    })),
    timestamp: new Date(data.timestamp || Date.now()),
    source: (data.source as AiBriefingSource) || `${provider}-api` as AiBriefingSource,
  };
}


// ═══════════════════════════════════════════════════════════════
// ─── Computed Briefing (local keyword analysis — no API needed) ───
// ═══════════════════════════════════════════════════════════════

const CRITICAL_KEYWORDS = /nuclear|missile|invasion|attack\b|war\b|strike|bomb|escalat|weapon|terror|tsunami|catastroph/i;
const HIGH_KEYWORDS = /military|conflict|deploy|troops|sanction|emergency|threat|casualt|kill|shoot|drone|airstr/i;
const ECONOMIC_KEYWORDS = /recession|crash|default|inflation|tariff|trade\s?war|currency|market\s?crash|bank\s?fail/i;
const CYBER_KEYWORDS = /cyber.?attack|ransomware|breach|hack|exploit|zero.?day|infrastructure\s?attack/i;

const REGION_MATCHERS: Record<Region, RegExp> = {
  'NORTH AMERICA': /united states|us\b|canada|mexico|washington|pentagon|white house|congress/i,
  'SOUTH AMERICA': /brazil|argentina|chile|colombia|venezuela|peru|bolivia/i,
  'EUROPE': /europe|eu\b|nato|ukraine|russia|germany|france|uk\b|britain|london|paris|berlin|brussels/i,
  'MIDDLE EAST': /iran|iraq|syria|israel|gaza|palestine|saudi|yemen|lebanon|jordan|turkey|egypt/i,
  'AFRICA': /africa|nigeria|ethiopia|kenya|congo|sudan|somalia|sahel|libya/i,
  'SOUTH ASIA': /india|pakistan|afghanistan|bangladesh|sri lanka|nepal/i,
  'EAST ASIA': /china|japan|korea|taiwan|beijing|tokyo|pyongyang|philippines|indonesia|asean/i,
  'OCEANIA': /australia|new zealand|pacific|oceania|fiji/i,
};

function inferRegion(text: string): Region | 'GLOBAL' {
  for (const [region, pattern] of Object.entries(REGION_MATCHERS)) {
    if (pattern.test(text)) return region as Region;
  }
  return 'GLOBAL';
}

function computeThreatLevel(
  criticalCount: number,
  highCount: number,
  majorQuakes: number,
): IntelligenceBriefing['threatLevel'] {
  const score = criticalCount * 10 + highCount * 3 + majorQuakes * 5;
  if (score >= 40) return 'SEVERE';
  if (score >= 25) return 'HIGH';
  if (score >= 12) return 'ELEVATED';
  if (score >= 5) return 'GUARDED';
  return 'LOW';
}

export function generateComputedBriefing(
  feeds: FeedItem[],
  quakes: Earthquake[],
): IntelligenceBriefing {
  const now = new Date();
  const recentFeeds = feeds
    .filter((f) => now.getTime() - f.pubDate.getTime() < 6 * 60 * 60 * 1000)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  // Classify items
  const criticalItems: KeyDevelopment[] = [];
  const highItems: KeyDevelopment[] = [];
  const economicItems: KeyDevelopment[] = [];
  const cyberItems: KeyDevelopment[] = [];

  for (const item of recentFeeds) {
    const text = `${item.title} ${item.snippet}`;
    const region = inferRegion(text);

    if (CRITICAL_KEYWORDS.test(text)) {
      criticalItems.push({
        title: item.title,
        category: 'SECURITY',
        severity: 'critical',
        region,
      });
    } else if (HIGH_KEYWORDS.test(text)) {
      highItems.push({
        title: item.title,
        category: 'DEFENSE',
        severity: 'high',
        region,
      });
    }

    if (ECONOMIC_KEYWORDS.test(text)) {
      economicItems.push({
        title: item.title,
        category: 'ECONOMIC',
        severity: 'high',
        region,
      });
    }

    if (CYBER_KEYWORDS.test(text)) {
      cyberItems.push({
        title: item.title,
        category: 'CYBER',
        severity: 'high',
        region,
      });
    }
  }

  // Major earthquakes
  const majorQuakes = quakes.filter((q) => q.magnitude >= 6);

  // Key developments — top items by severity
  const keyDevelopments: KeyDevelopment[] = [
    ...criticalItems.slice(0, 5),
    ...highItems.slice(0, 3),
    ...economicItems.slice(0, 2),
    ...cyberItems.slice(0, 2),
    ...majorQuakes.map((q) => ({
      title: `M${q.magnitude.toFixed(1)} earthquake — ${q.place}`,
      category: 'SEISMIC',
      severity: 'critical' as const,
      region: inferRegion(q.place),
    })),
  ].slice(0, 12);

  // Region assessments
  const regionCounts: Record<string, { critical: number; high: number; total: number }> = {};
  for (const region of Object.keys(REGION_MATCHERS)) {
    regionCounts[region] = { critical: 0, high: 0, total: 0 };
  }
  for (const dev of [...criticalItems, ...highItems]) {
    if (dev.region !== 'GLOBAL' && regionCounts[dev.region]) {
      regionCounts[dev.region].total++;
      if (dev.severity === 'critical') regionCounts[dev.region].critical++;
      else regionCounts[dev.region].high++;
    }
  }

  const regionAssessments: RegionAssessment[] = Object.entries(regionCounts)
    .map(([region, counts]) => ({
      region: region as Region,
      threatLevel: Math.min(100, counts.critical * 20 + counts.high * 8 + counts.total * 2),
      trend: counts.critical > 0 ? 'rising' as const : counts.high > 1 ? 'stable' as const : 'declining' as const,
      topConcern: criticalItems.find((d) => d.region === region)?.title
        || highItems.find((d) => d.region === region)?.title
        || 'No significant concerns',
    }))
    .sort((a, b) => b.threatLevel - a.threatLevel);

  // Threat level
  const threatLevel = computeThreatLevel(criticalItems.length, highItems.length, majorQuakes.length);

  // Summary
  const totalAlerts = criticalItems.length + highItems.length;
  const topRegion = regionAssessments[0];
  const summaryParts = [
    `${totalAlerts} security alerts detected in last 6h.`,
  ];
  if (criticalItems.length > 0) {
    summaryParts.push(`${criticalItems.length} critical-level events require attention.`);
  }
  if (topRegion && topRegion.threatLevel > 30) {
    summaryParts.push(`${topRegion.region} region shows elevated activity.`);
  }
  if (majorQuakes.length > 0) {
    summaryParts.push(`${majorQuakes.length} significant seismic event(s).`);
  }
  if (economicItems.length > 0) {
    summaryParts.push(`${economicItems.length} economic risk indicator(s).`);
  }

  return {
    summary: summaryParts.join(' '),
    threatLevel,
    keyDevelopments,
    regionAssessments,
    timestamp: now,
    source: 'computed',
  };
}
