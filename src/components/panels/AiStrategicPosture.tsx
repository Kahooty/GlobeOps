/**
 * AiStrategicPosture — Deep geopolitical analysis panel.
 *
 * Extends the AI Analytics briefing with:
 *   - Region-by-region strategic assessment matrix
 *   - Scenario risk indicators (escalation, de-escalation, status quo)
 *   - Active crisis spotlight with timeline
 *   - Strategic recommendations / watchlist
 *
 * Shares the global AI provider selection from the Zustand store.
 * Supports multiple AI providers (Google Gemini, Anthropic Claude, OpenAI GPT)
 * with computed keyword analysis as fallback when no API keys are configured.
 */

import { useMemo, useState, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useAiBriefing } from '@/hooks/useAiBriefing';
import { FEED_SOURCES } from '@/config/feed-sources';
import type { IntelligenceBriefing, RegionAssessment } from '@/services/ai-service';
import type { PanelStatus, Region } from '@/types';
import { formatTimeAgo } from '@/utils/map-events';

// ─── Scenario Assessment ───

interface ScenarioRisk {
  label: string;
  probability: 'HIGH' | 'MED' | 'LOW';
  impact: 'CRITICAL' | 'HIGH' | 'MED' | 'LOW';
}

interface StrategicRegionAnalysis {
  region: Region;
  threatLevel: number;
  trend: 'rising' | 'stable' | 'declining';
  topConcern: string;
  scenarios: ScenarioRisk[];
  watchItems: string[];
}

// ─── Scenario Generation ───

function generateScenarios(assessment: RegionAssessment): ScenarioRisk[] {
  const scenarios: ScenarioRisk[] = [];

  if (assessment.threatLevel >= 60) {
    scenarios.push({
      label: 'ESCALATION',
      probability: assessment.trend === 'rising' ? 'HIGH' : 'MED',
      impact: 'CRITICAL',
    });
    scenarios.push({
      label: 'DE-ESCALATION',
      probability: assessment.trend === 'declining' ? 'MED' : 'LOW',
      impact: 'MED',
    });
  } else if (assessment.threatLevel >= 30) {
    scenarios.push({
      label: 'ESCALATION',
      probability: assessment.trend === 'rising' ? 'MED' : 'LOW',
      impact: 'HIGH',
    });
    scenarios.push({
      label: 'STATUS QUO',
      probability: 'HIGH',
      impact: 'MED',
    });
  } else {
    scenarios.push({
      label: 'STATUS QUO',
      probability: 'HIGH',
      impact: 'LOW',
    });
  }

  return scenarios;
}

function generateWatchItems(assessment: RegionAssessment, briefing: IntelligenceBriefing): string[] {
  const items: string[] = [];
  const regionDevs = briefing.keyDevelopments.filter((d) => d.region === assessment.region);

  if (regionDevs.length > 0) {
    items.push(regionDevs[0].title.slice(0, 60));
  }
  if (assessment.trend === 'rising') {
    items.push('Escalation indicators detected');
  }
  if (assessment.threatLevel >= 70) {
    items.push('Critical threshold exceeded');
  }

  return items.slice(0, 3);
}

// ─── Probability / Impact Colors ───

const PROB_COLORS: Record<string, string> = {
  HIGH: 'var(--color-terminal-red)',
  MED: 'var(--color-terminal-amber)',
  LOW: 'var(--color-terminal-green)',
};

const IMPACT_COLORS: Record<string, string> = {
  CRITICAL: 'var(--color-terminal-red)',
  HIGH: 'var(--color-terminal-amber)',
  MED: 'var(--color-terminal-cyan)',
  LOW: 'var(--color-terminal-green)',
};

// ─── Region Strategic Card ───

function RegionCard({ analysis }: { analysis: StrategicRegionAnalysis }) {
  const barWidth = Math.max(1, Math.round(analysis.threatLevel / 5));
  const barColor =
    analysis.threatLevel >= 60 ? 'var(--color-terminal-red)'
    : analysis.threatLevel >= 30 ? 'var(--color-terminal-amber)'
    : 'var(--color-terminal-green)';
  const trendIcon =
    analysis.trend === 'rising' ? '^^'
    : analysis.trend === 'declining' ? 'vv'
    : '--';

  return (
    <div
      className="px-1 py-1 mb-1"
      style={{
        borderLeft: `2px solid ${barColor}`,
        borderBottom: '1px solid var(--color-terminal-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-[9px]">
        <span className="font-bold tracking-wide" style={{ color: barColor }}>
          {analysis.region}
        </span>
        <span className="text-terminal-primary-dim text-[8px]">
          TL:{analysis.threatLevel} {trendIcon}
        </span>
      </div>

      {/* Threat Bar */}
      <div className="text-[8px] font-mono" style={{ color: barColor }}>
        {'█'.repeat(barWidth)}{'░'.repeat(20 - barWidth)} {analysis.threatLevel}/100
      </div>

      {/* Top Concern */}
      <div className="text-[8px] text-terminal-primary truncate mt-0.5">
        {analysis.topConcern}
      </div>

      {/* Scenarios */}
      <div className="flex gap-2 mt-0.5">
        {analysis.scenarios.map((s, i) => (
          <div key={i} className="text-[7px]">
            <span className="text-terminal-primary-dim">{s.label}: </span>
            <span style={{ color: PROB_COLORS[s.probability] }}>{s.probability}</span>
            <span className="text-terminal-primary-dim"> / </span>
            <span style={{ color: IMPACT_COLORS[s.impact] }}>{s.impact}</span>
          </div>
        ))}
      </div>

      {/* Watch Items */}
      {analysis.watchItems.length > 0 && (
        <div className="mt-0.5">
          {analysis.watchItems.map((item, i) => (
            <div key={i} className="text-[7px] text-terminal-primary-dim truncate">
              {'\u25B8'} {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Global Posture Summary ───

function PostureSummary({ briefing }: { briefing: IntelligenceBriefing }) {
  const criticalRegions = briefing.regionAssessments.filter((r) => r.threatLevel >= 60);
  const elevatedRegions = briefing.regionAssessments.filter((r) => r.threatLevel >= 30 && r.threatLevel < 60);
  const risingCount = briefing.regionAssessments.filter((r) => r.trend === 'rising').length;

  return (
    <div
      className="px-1 py-1 text-[9px] leading-tight"
      style={{
        borderTop: '1px solid var(--color-terminal-border)',
        borderBottom: '1px solid var(--color-terminal-border)',
      }}
    >
      <div className="text-terminal-primary">
        GLOBAL POSTURE: {briefing.threatLevel}
      </div>
      <div className="text-terminal-primary-dim text-[8px] mt-0.5">
        {criticalRegions.length} critical region(s) {'\u00B7'}{' '}
        {elevatedRegions.length} elevated {'\u00B7'}{' '}
        {risingCount} rising trend(s) {'\u00B7'}{' '}
        {briefing.keyDevelopments.filter((d) => d.severity === 'critical').length} critical events
      </div>
    </div>
  );
}

// ─── Main Component ───

export function AiStrategicPosture() {
  const { data: quakes = [], isLoading: qLoading } = useEarthquakes(2.5);
  const { feeds, isLoading: fLoading } = useMultipleFeeds(FEED_SOURCES);
  const [blink, setBlink] = useState(true);

  const { briefing, isLoading: aiLoading, sourceLabel } = useAiBriefing(feeds, quakes);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 1200);
    return () => clearInterval(interval);
  }, []);

  const isLoading = qLoading || fLoading || aiLoading;
  const status: PanelStatus = isLoading ? 'loading' : 'live';

  // Build strategic analysis per region
  const analyses: StrategicRegionAnalysis[] = useMemo(() => {
    if (!briefing) return [];
    return briefing.regionAssessments
      .filter((r) => r.threatLevel > 0)
      .map((assessment) => ({
        region: assessment.region,
        threatLevel: assessment.threatLevel,
        trend: assessment.trend,
        topConcern: assessment.topConcern,
        scenarios: generateScenarios(assessment),
        watchItems: generateWatchItems(assessment, briefing),
      }));
  }, [briefing]);

  const isSevere = briefing?.threatLevel === 'SEVERE' || briefing?.threatLevel === 'HIGH';

  return (
    <TerminalWindow
      title="AI STRATEGIC POSTURE"
      status={status}
      headerRight={
        briefing ? (
          <span
            className="text-[9px] font-bold tracking-wide"
            style={{
              color: isSevere ? 'var(--color-terminal-red)' : 'var(--color-terminal-amber)',
              opacity: isSevere ? (blink ? 1 : 0.5) : 1,
            }}
          >
            {briefing.threatLevel}
          </span>
        ) : null
      }
    >
      <div className="overflow-y-auto" style={{ maxHeight: '100%' }}>
        {briefing ? (
          <div className="py-0.5">
            {/* Global Posture Summary */}
            <PostureSummary briefing={briefing} />

            {/* Section Header */}
            <div className="text-[9px] text-terminal-primary-dim tracking-widest px-1 mt-1 mb-0.5">
              ── REGION-BY-REGION ASSESSMENT ──
            </div>

            {/* Region Cards */}
            <div className="px-0.5">
              {analyses.map((a) => (
                <RegionCard key={a.region} analysis={a} />
              ))}
            </div>

            {/* Strategic Watchlist */}
            {briefing.keyDevelopments.filter((d) => d.severity === 'critical').length > 0 && (
              <div className="px-1 mt-1">
                <div className="text-[9px] text-terminal-primary-dim tracking-widest mb-0.5">
                  ── CRITICAL WATCHLIST ──
                </div>
                {briefing.keyDevelopments
                  .filter((d) => d.severity === 'critical')
                  .slice(0, 5)
                  .map((dev, i) => (
                    <div
                      key={i}
                      className="text-[8px] py-0.5 truncate"
                      style={{
                        color: 'var(--color-terminal-red)',
                        borderLeft: '2px solid var(--color-terminal-red)',
                        paddingLeft: '6px',
                      }}
                    >
                      {dev.title}
                      <span className="text-terminal-primary-dim ml-1">{dev.region}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-[8px] text-terminal-primary-dim text-right px-1 pt-1">
              {sourceLabel} · Strategic assessment {formatTimeAgo(briefing.timestamp)}
            </div>
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Generating strategic posture...' : 'Insufficient data for strategic analysis'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
