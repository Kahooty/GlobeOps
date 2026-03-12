/**
 * CiiIndex — Country Instability Index panel.
 *
 * Composite instability score 0–100 per region derived from:
 *   - Conflict keyword frequency in feeds (40%)
 *   - Seismic activity M4+ count (20%)
 *   - Critical headline density (20%)
 *   - Source diversity (20%)
 *
 * Color-coded: green < 30, amber 30-60, red > 60.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { PanelStatus, Region } from '@/types';

const ALL_REGIONS: Region[] = [
  'NORTH AMERICA', 'SOUTH AMERICA', 'EUROPE',
  'MIDDLE EAST', 'AFRICA', 'SOUTH ASIA', 'EAST ASIA', 'OCEANIA',
];

// Region keyword matchers
const REGION_MATCHERS: Record<Region, RegExp> = {
  'NORTH AMERICA': /us\b|america|canada|pentagon|washington|congress|fbi|cia/i,
  'SOUTH AMERICA': /brazil|venezuela|colombia|mexico|argentina|latin|cartel/i,
  'EUROPE': /europe|ukraine|russia|nato|eu\b|france|germany|uk\b|britain|poland|sweden|finland/i,
  'MIDDLE EAST': /iran|iraq|syria|israel|gaza|yemen|saudi|lebanon|houthi|palestine|turkey|egypt/i,
  'AFRICA': /africa|sahel|sudan|ethiopia|congo|somalia|nigeria|libya|kenya|mali/i,
  'SOUTH ASIA': /india|pakistan|afghan|bangladesh|sri lanka|kashmir|nepal/i,
  'EAST ASIA': /china|japan|korea|taiwan|pacific|philippines|asean|vietnam|myanmar/i,
  'OCEANIA': /australia|new zealand|fiji|pacific islands|solomon/i,
};

const CONFLICT_KEYWORDS = /war\b|conflict|military|attack|strike|bomb|missile|troops|casualt|kill|escalat|terror|weapon|invasion/i;
const CRITICAL_KEYWORDS = /nuclear|invasion|escalat|war\b|attack|bomb|missile|kill/i;

interface RegionScore {
  region: Region;
  score: number;
  conflictDensity: number;
  seismicCount: number;
  criticalDensity: number;
}

export function CiiIndex() {
  const { feeds, isLoading: feedsLoading } = useMultipleFeeds(FEED_SOURCES);
  const { data: quakes = [], isLoading: quakesLoading } = useEarthquakes(4);

  const isLoading = feedsLoading || quakesLoading;
  const status: PanelStatus = isLoading ? 'loading' : 'live';

  const scores: RegionScore[] = useMemo(() => {
    return ALL_REGIONS.map((region) => {
      const matcher = REGION_MATCHERS[region];

      // Feeds matching this region
      const regionFeeds = feeds.filter((f) => matcher.test(`${f.title} ${f.snippet}`));
      const totalFeeds = Math.max(regionFeeds.length, 1);

      // Conflict keyword density (0-1)
      const conflictCount = regionFeeds.filter((f) => CONFLICT_KEYWORDS.test(`${f.title} ${f.snippet}`)).length;
      const conflictDensity = Math.min(conflictCount / totalFeeds, 1);

      // Critical headline density (0-1)
      const criticalCount = regionFeeds.filter((f) => CRITICAL_KEYWORDS.test(`${f.title} ${f.snippet}`)).length;
      const criticalDensity = Math.min(criticalCount / Math.max(totalFeeds, 1), 1);

      // Seismic count in rough region (simplified via place string matching)
      const seismicCount = quakes.filter((q) => matcher.test(q.place)).length;
      const seismicScore = Math.min(seismicCount / 5, 1); // 5+ quakes = max

      // Source diversity (more unique sources = more confirmed activity)
      const uniqueSources = new Set(regionFeeds.map((f) => f.sourceId));
      const diversityScore = Math.min(uniqueSources.size / 10, 1); // 10+ = max

      // Composite score
      const score = Math.round(
        (conflictDensity * 40 + seismicScore * 20 + criticalDensity * 20 + diversityScore * 20)
      );

      return { region, score, conflictDensity, seismicCount, criticalDensity };
    }).sort((a, b) => b.score - a.score);
  }, [feeds, quakes]);

  // Global instability average
  const avgScore = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length);

  return (
    <TerminalWindow
      title="CII INDEX"
      status={status}
      headerRight={
        <span
          className="text-[9px] font-bold"
          style={{
            color: avgScore > 60 ? 'var(--color-terminal-red)'
              : avgScore > 30 ? 'var(--color-terminal-amber)'
              : 'var(--color-terminal-green)',
          }}
        >
          GLOBAL: {avgScore}/100
        </span>
      }
    >
      <div className="space-y-2">
        {/* Score bars */}
        <AsciiChart
          data={scores.map((s) => s.score)}
          labels={scores.map((s) => s.region.slice(0, 8))}
          type="horizontal-bar"
          width={20}
        />

        {/* Legend */}
        <div className="flex items-center gap-3 text-[8px] text-terminal-primary-dim mt-1 px-1">
          <span>
            <span className="text-terminal-green">■</span> LOW (&lt;30)
          </span>
          <span>
            <span className="text-terminal-amber">■</span> MED (30-60)
          </span>
          <span>
            <span className="text-terminal-red">■</span> HIGH (&gt;60)
          </span>
        </div>

        {/* Top instability detail */}
        {scores.length > 0 && scores[0].score > 30 && (
          <div className="text-[9px] text-terminal-primary-dim px-1 pt-1 border-t border-terminal-border">
            <span className="text-terminal-amber">HOTSPOT: </span>
            <span className="text-terminal-primary">{scores[0].region}</span>
            <span> — CII {scores[0].score}</span>
            {scores[0].seismicCount > 0 && (
              <span> • {scores[0].seismicCount} seismic</span>
            )}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
