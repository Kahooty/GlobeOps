/**
 * AiAnalytics — AI-powered intelligence briefing panel.
 *
 * Generates threat assessments from all active data sources:
 *   - Overall threat level gauge (LOW → SEVERE)
 *   - Key developments list with severity and region tags
 *   - Regional threat assessments with bar indicators
 *   - Auto-refreshes every 5 minutes
 *
 * Supports multiple AI providers (Google Gemini, Anthropic Claude, OpenAI GPT)
 * with computed keyword analysis as fallback when no API keys are configured.
 */

import { useState, useEffect, useRef } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useAiBriefing } from '@/hooks/useAiBriefing';
import { useAiProviders } from '@/hooks/useAiProviders';
import { useAppStore } from '@/store/app-store';
import { FEED_SOURCES } from '@/config/feed-sources';
import { PROVIDER_LABELS } from '@/services/ai-service';
import type { IntelligenceBriefing, KeyDevelopment, RegionAssessment } from '@/services/ai-service';
import type { PanelStatus, AiProvider } from '@/types';
import { formatTimeAgo } from '@/utils/map-events';

// ─── Threat Level Gauge ───

const THREAT_COLORS: Record<IntelligenceBriefing['threatLevel'], string> = {
  LOW: 'var(--color-terminal-green)',
  GUARDED: 'var(--color-terminal-cyan)',
  ELEVATED: 'var(--color-terminal-amber)',
  HIGH: 'var(--color-terminal-red)',
  SEVERE: 'var(--color-terminal-red)',
};

const THREAT_GAUGE: Record<IntelligenceBriefing['threatLevel'], string> = {
  LOW: '░░░░░░░░░░',
  GUARDED: '▓▓░░░░░░░░',
  ELEVATED: '▓▓▓▓▓░░░░░',
  HIGH: '▓▓▓▓▓▓▓░░░',
  SEVERE: '█████████▓',
};

// ─── Severity Colors ───

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--color-terminal-red)',
  high: 'var(--color-terminal-amber)',
  medium: 'var(--color-terminal-cyan)',
  low: 'var(--color-terminal-primary-dim)',
};

// ─── Provider Selector ───

const PROVIDER_ORDER: AiProvider[] = ['google', 'anthropic', 'openai', 'computed'];

function ProviderSelector({ onClose }: { onClose: () => void }) {
  const aiProvider = useAppStore((s) => s.aiProvider);
  const setAiProvider = useAppStore((s) => s.setAiProvider);
  const { providers } = useAiProviders();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 border border-terminal-border bg-terminal-bg text-[9px] font-mono shadow-lg"
      style={{ minWidth: '140px' }}
    >
      <div className="px-2 py-1 text-terminal-primary-dim border-b border-terminal-border tracking-widest">
        AI PROVIDER
      </div>
      {PROVIDER_ORDER.map((p) => {
        const available = providers[p];
        const active = aiProvider === p;
        const label = PROVIDER_LABELS[p];
        const recommended = p === 'google';

        return (
          <button
            key={p}
            className="w-full text-left px-2 py-1 flex items-center gap-1.5 hover:bg-terminal-border/30 transition-colors"
            style={{
              color: active
                ? 'var(--color-terminal-primary)'
                : available
                  ? 'var(--color-terminal-primary-dim)'
                  : 'var(--color-terminal-primary-dim)',
              opacity: available ? 1 : 0.4,
            }}
            onClick={() => {
              if (available) {
                setAiProvider(p);
                onClose();
              }
            }}
            disabled={!available}
          >
            <span style={{ color: active ? 'var(--color-terminal-green)' : 'transparent' }}>▸</span>
            <span>{label}</span>
            {recommended && (
              <span className="text-[7px] text-terminal-primary-dim ml-auto">REC</span>
            )}
            {!available && p !== 'computed' && (
              <span className="text-[7px] ml-auto" style={{ color: 'var(--color-terminal-red)' }}>NO KEY</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Development Item ───

function DevelopmentItem({ dev }: { dev: KeyDevelopment }) {
  return (
    <div
      className="flex items-start gap-1.5 py-0.5 text-[9px] leading-tight"
      style={{
        borderLeft: `2px solid ${SEVERITY_COLORS[dev.severity] || 'var(--color-terminal-primary-dim)'}`,
        paddingLeft: '6px',
      }}
    >
      <span
        className="flex-shrink-0 text-[8px] font-bold tracking-wide w-[32px]"
        style={{ color: SEVERITY_COLORS[dev.severity] }}
      >
        {dev.category.slice(0, 5)}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-terminal-primary truncate block">{dev.title}</span>
        <span className="text-terminal-primary-dim text-[8px]">
          {dev.region}
        </span>
      </div>
    </div>
  );
}

// ─── Region Bar ───

function RegionBar({ assessment }: { assessment: RegionAssessment }) {
  const barWidth = Math.max(1, Math.round(assessment.threatLevel / 5));
  const barColor =
    assessment.threatLevel >= 60 ? 'var(--color-terminal-red)'
    : assessment.threatLevel >= 30 ? 'var(--color-terminal-amber)'
    : 'var(--color-terminal-green)';
  const trendArrow =
    assessment.trend === 'rising' ? '↑'
    : assessment.trend === 'declining' ? '↓'
    : '→';

  return (
    <div className="flex items-center gap-1 text-[9px] font-mono py-0.5">
      <span className="w-[62px] text-terminal-primary-dim truncate text-[8px]">
        {assessment.region}
      </span>
      <span
        className="flex-shrink-0"
        style={{ color: barColor }}
      >
        {'█'.repeat(barWidth)}{'░'.repeat(20 - barWidth)}
      </span>
      <span
        className="w-[20px] text-right text-[8px]"
        style={{ color: barColor }}
      >
        {assessment.threatLevel}
      </span>
      <span
        className="text-[8px]"
        style={{
          color: assessment.trend === 'rising' ? 'var(--color-terminal-red)'
            : assessment.trend === 'declining' ? 'var(--color-terminal-green)'
            : 'var(--color-terminal-primary-dim)',
        }}
      >
        {trendArrow}
      </span>
    </div>
  );
}

// ─── Main Component ───

export function AiAnalytics() {
  const { data: quakes = [], isLoading: qLoading } = useEarthquakes(2.5);
  const { feeds, isLoading: fLoading } = useMultipleFeeds(FEED_SOURCES);
  const [blink, setBlink] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  const { briefing, isLoading: aiLoading, sourceLabel } = useAiBriefing(feeds, quakes);

  // Blink for severe/high threat levels
  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 1000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = qLoading || fLoading || aiLoading;
  const status: PanelStatus = isLoading ? 'loading' : 'live';

  const isSevere = briefing?.threatLevel === 'SEVERE' || briefing?.threatLevel === 'HIGH';

  return (
    <TerminalWindow
      title="AI ANALYTICS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px] relative">
          {/* Provider Selector Button */}
          <button
            className="text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => setShowSelector((s) => !s)}
            title="Select AI provider"
          >
            {sourceLabel} ▾
          </button>
          {showSelector && (
            <ProviderSelector onClose={() => setShowSelector(false)} />
          )}

          {/* Threat Level Badge */}
          {briefing && (
            <span
              className="font-bold tracking-wide"
              style={{
                color: THREAT_COLORS[briefing.threatLevel],
                opacity: isSevere ? (blink ? 1 : 0.5) : 1,
              }}
            >
              {briefing.threatLevel}
            </span>
          )}
        </div>
      }
    >
      <div className="overflow-y-auto" style={{ maxHeight: '100%' }}>
        {briefing ? (
          <div className="px-1 py-0.5 space-y-1.5">
            {/* ─── Threat Gauge ─── */}
            <div className="text-center py-1">
              <div
                className="text-[10px] font-mono tracking-widest"
                style={{
                  color: THREAT_COLORS[briefing.threatLevel],
                  textShadow: `0 0 6px ${THREAT_COLORS[briefing.threatLevel]}`,
                  opacity: isSevere ? (blink ? 1 : 0.6) : 1,
                }}
              >
                [ {THREAT_GAUGE[briefing.threatLevel]} ]
              </div>
              <div className="text-[8px] text-terminal-primary-dim mt-0.5">
                THREAT ASSESSMENT: {briefing.threatLevel}
              </div>
            </div>

            {/* ─── Summary ─── */}
            <div
              className="text-[9px] text-terminal-primary leading-tight px-1 py-1"
              style={{
                borderTop: '1px solid var(--color-terminal-border)',
                borderBottom: '1px solid var(--color-terminal-border)',
              }}
            >
              {briefing.summary}
            </div>

            {/* ─── Key Developments ─── */}
            {briefing.keyDevelopments.length > 0 && (
              <div>
                <div className="text-[9px] text-terminal-primary-dim tracking-widest px-1 mb-0.5">
                  ── KEY DEVELOPMENTS ──
                </div>
                <div className="space-y-0.5 px-1">
                  {briefing.keyDevelopments.slice(0, 8).map((dev, i) => (
                    <DevelopmentItem key={`${dev.category}-${dev.region}-${i}`} dev={dev} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Regional Assessment ─── */}
            {briefing.regionAssessments.filter((r) => r.threatLevel > 0).length > 0 && (
              <div>
                <div className="text-[9px] text-terminal-primary-dim tracking-widest px-1 mb-0.5">
                  ── REGIONAL ASSESSMENT ──
                </div>
                <div className="px-1">
                  {briefing.regionAssessments
                    .filter((r) => r.threatLevel > 0)
                    .slice(0, 6)
                    .map((assessment) => (
                      <RegionBar key={assessment.region} assessment={assessment} />
                    ))}
                </div>
              </div>
            )}

            {/* ─── Timestamp ─── */}
            <div className="text-[8px] text-terminal-primary-dim text-right px-1 pt-0.5">
              Updated {formatTimeAgo(briefing.timestamp)}
            </div>
          </div>
        ) : (
          <div className="text-terminal-primary-dim text-xs p-2">
            {isLoading ? 'Generating intelligence briefing...' : 'Insufficient data for analysis'}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
