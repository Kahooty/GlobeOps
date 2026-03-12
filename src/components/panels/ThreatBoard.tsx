/**
 * ThreatBoard — Aggregated multi-source threat overview.
 *
 * Pulls from earthquakes (USGS), natural events (NASA EONET),
 * weather alerts (NOAA), and GDELT global events to display
 * a unified threat table sorted by severity and recency.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useNaturalEvents } from '@/hooks/useNaturalEvents';
import { useWeatherAlerts } from '@/hooks/useWeather';
import { useGdeltEvents } from '@/hooks/useGdelt';
import { useGDACSAlerts } from '@/hooks/useGDACS';
import { formatRelative } from '@/utils/formatters';
import { severityIndicator } from '@/utils/ascii';
import type { Earthquake, NaturalEvent, GDACSAlert, PanelStatus } from '@/types';
import type { NOAAAlert } from '@/services/noaa-service';
import type { GDELTEvent } from '@/services/gdelt-service';

// ─── Unified Threat Item ───

type ThreatCategory = 'EQ' | 'NAT' | 'WX' | 'CONFL' | 'INTEL' | 'EMRG';

interface ThreatItem {
  id: string;
  category: ThreatCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  time: Date;
}

const SEVERITY_ORDER: Record<ThreatItem['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_LEVEL: Record<ThreatItem['severity'], number> = {
  critical: 3,
  high: 3,
  medium: 2,
  low: 1,
};

const CATEGORY_LABELS: Record<ThreatCategory, string> = {
  EQ: 'EQ',
  NAT: 'NAT',
  WX: 'WX',
  CONFL: 'CONFL',
  INTEL: 'INTEL',
  EMRG: 'EMRG',
};

// ─── Mappers ───

function mapEarthquake(eq: Earthquake): ThreatItem {
  const sev: ThreatItem['severity'] =
    eq.severity === 'great' ? 'critical' :
    eq.severity === 'major' ? 'high' :
    eq.severity === 'moderate' ? 'medium' : 'low';
  return {
    id: `eq-${eq.id}`,
    category: 'EQ',
    severity: sev,
    title: `M${eq.magnitude.toFixed(1)} ${eq.place}`,
    time: eq.time,
  };
}

function mapNaturalEvent(ev: NaturalEvent): ThreatItem {
  return {
    id: `nat-${ev.id}`,
    category: 'NAT',
    severity: ev.severity,
    title: ev.title,
    time: ev.time,
  };
}

function mapWeatherAlert(alert: NOAAAlert): ThreatItem {
  const sev: ThreatItem['severity'] =
    alert.severity === 'Extreme' ? 'critical' :
    alert.severity === 'Severe' ? 'high' :
    alert.severity === 'Moderate' ? 'medium' : 'low';
  return {
    id: `wx-${alert.id}`,
    category: 'WX',
    severity: sev,
    title: alert.event,
    time: alert.onset ? new Date(alert.onset) : new Date(),
  };
}

function mapGdeltEvent(ev: GDELTEvent): ThreatItem {
  const abs = Math.abs(ev.goldstein);
  const sev: ThreatItem['severity'] =
    abs >= 8 ? 'critical' :
    abs >= 5 ? 'high' :
    abs >= 2 ? 'medium' : 'low';
  // Negative goldstein = conflict/instability, positive = cooperation
  const category: ThreatCategory = ev.goldstein < -3 ? 'CONFL' : 'INTEL';
  return {
    id: `gdelt-${ev.id}`,
    category,
    severity: sev,
    title: ev.title,
    time: ev.time,
  };
}

function mapGDACSAlert(alert: GDACSAlert): ThreatItem {
  return {
    id: `gdacs-${alert.id}`,
    category: 'EMRG',
    severity: alert.severity,
    title: alert.title,
    time: alert.date,
  };
}

// ─── Component ───

const MAX_ROWS = 12;

export function ThreatBoard() {
  const { data: quakes, isLoading: eqLoading, isError: eqError, isStale: eqStale } = useEarthquakes(4);
  const { data: natEvents, isLoading: natLoading, isError: natError } = useNaturalEvents();
  const { data: wxAlerts, isLoading: wxLoading, isError: wxError } = useWeatherAlerts();
  const { data: gdeltEvents, isLoading: gdeltLoading, isError: gdeltError } = useGdeltEvents();
  const { data: gdacsAlerts, isLoading: gdacsLoading, isError: gdacsError } = useGDACSAlerts();

  const anyLoading = eqLoading || natLoading || wxLoading || gdeltLoading || gdacsLoading;
  const anyError = eqError || natError || wxError || gdeltError || gdacsError;

  const status: PanelStatus = anyLoading ? 'loading' : anyError ? 'error' : eqStale ? 'stale' : 'live';

  // Aggregate all threats
  const threats = useMemo(() => {
    const items: ThreatItem[] = [];

    // Earthquakes
    if (quakes) {
      for (const eq of quakes) {
        items.push(mapEarthquake(eq));
      }
    }

    // Natural events (EONET)
    if (natEvents) {
      for (const ev of natEvents) {
        items.push(mapNaturalEvent(ev));
      }
    }

    // Weather alerts (NOAA) — only Severe+ to avoid flooding
    if (wxAlerts) {
      for (const alert of wxAlerts) {
        if (alert.severity === 'Extreme' || alert.severity === 'Severe') {
          items.push(mapWeatherAlert(alert));
        }
      }
    }

    // GDELT events — only conflict/instability (negative goldstein)
    if (gdeltEvents) {
      for (const ev of gdeltEvents) {
        if (ev.goldstein < -2) {
          items.push(mapGdeltEvent(ev));
        }
      }
    }

    // GDACS disaster alerts — Orange and Red only
    if (gdacsAlerts) {
      for (const alert of gdacsAlerts) {
        if (alert.alertLevel === 'Red' || alert.alertLevel === 'Orange') {
          items.push(mapGDACSAlert(alert));
        }
      }
    }

    // Sort: severity desc, then time desc
    items.sort((a, b) => {
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.time.getTime() - a.time.getTime();
    });

    return items;
  }, [quakes, natEvents, wxAlerts, gdeltEvents, gdacsAlerts]);

  // Distribution counts by category
  const distribution = useMemo(() => {
    const counts: Record<ThreatCategory, number> = { EQ: 0, NAT: 0, WX: 0, CONFL: 0, INTEL: 0, EMRG: 0 };
    for (const t of threats) counts[t.category]++;
    return counts;
  }, [threats]);

  const criticalCount = threats.filter((t) => t.severity === 'critical' || t.severity === 'high').length;

  // Build distribution chart data — only categories with items
  const distLabels: string[] = [];
  const distValues: number[] = [];
  for (const cat of Object.keys(distribution) as ThreatCategory[]) {
    if (distribution[cat] > 0) {
      distLabels.push(CATEGORY_LABELS[cat]);
      distValues.push(distribution[cat]);
    }
  }

  return (
    <TerminalWindow
      title="THREAT BOARD"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {criticalCount > 0 && (
            <span className="text-terminal-red">{criticalCount} HIGH+</span>
          )}
          <span className="text-terminal-primary-dim">{threats.length} active</span>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs text-terminal-primary-dim mb-1">
            ACTIVE THREATS ({threats.length})
          </div>
          {threats.length > 0 ? (
            <AsciiTable<ThreatItem & { sevIcon: string }>
              columns={[
                {
                  key: 'category' as keyof ThreatItem,
                  header: 'TYPE',
                  width: 5,
                  render: (v) => {
                    const cat = String(v);
                    return cat;
                  },
                },
                {
                  key: 'sevIcon' as keyof (ThreatItem & { sevIcon: string }),
                  header: '',
                  width: 5,
                  render: (_, row) => severityIndicator(SEVERITY_LEVEL[row.severity]),
                },
                {
                  key: 'title' as keyof ThreatItem,
                  header: 'DESCRIPTION',
                  width: 28,
                  render: (v) => {
                    const s = String(v);
                    return s.length > 28 ? s.slice(0, 27) + '\u2026' : s;
                  },
                },
                {
                  key: 'time' as keyof ThreatItem,
                  header: 'WHEN',
                  width: 10,
                  align: 'right',
                  render: (v) => formatRelative(v as Date),
                },
              ]}
              data={threats.slice(0, MAX_ROWS).map((t) => ({ ...t, sevIcon: '' }))}
              maxRows={MAX_ROWS}
              highlightRow={(row) => row.severity === 'critical' || row.severity === 'high'}
            />
          ) : (
            <div className="text-terminal-primary-dim text-xs">
              {anyLoading ? 'Aggregating threat data...' : 'No active threats'}
            </div>
          )}
        </div>

        {distLabels.length > 0 && (
          <div>
            <div className="text-xs text-terminal-primary-dim mb-1">THREAT DISTRIBUTION</div>
            <AsciiChart
              data={distValues}
              labels={distLabels}
              type="horizontal-bar"
              width={16}
            />
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
