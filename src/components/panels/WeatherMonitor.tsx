/**
 * WeatherMonitor — Weather alerts (NOAA) + Natural events (NASA EONET) + Analytics.
 *
 * Three tabbed views:
 * - ALERTS: Severe weather alerts from NOAA NWS API
 * - EVENTS: Active natural events from NASA EONET (wildfires, volcanoes, storms, floods)
 * - STATS: Distribution analytics across both data sources
 */

import { useState, useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiTable } from '@/components/terminal/AsciiTable';
import { AsciiChart } from '@/components/terminal/AsciiChart';
import { useWeatherAlerts } from '@/hooks/useWeather';
import { useNaturalEvents } from '@/hooks/useNaturalEvents';
import { formatRelative } from '@/utils/formatters';
import type { NOAAAlert } from '@/services/noaa-service';
import type { NaturalEvent, PanelStatus } from '@/types';

type ViewMode = 'alerts' | 'events' | 'stats';

// ─── EONET Category Display ───

const CATEGORY_LABELS: Record<string, string> = {
  wildfires: 'FIRE',
  volcanoes: 'VOLC',
  severeStorms: 'STRM',
  floods: 'FLOOD',
  earthquakes: 'EQ',
  landslides: 'LNDS',
  seaLakeIce: 'ICE',
  drought: 'DRGT',
  dustHaze: 'DUST',
  tempExtremes: 'TEMP',
  waterColor: 'H2O',
  snow: 'SNOW',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'CRIT',
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
};

// ─── Helpers ───

function formatTimeRange(onset: string | null, expires: string | null): string {
  if (!onset && !expires) return '\u2014';
  const now = Date.now();
  if (onset) {
    const onsetTime = new Date(onset).getTime();
    if (onsetTime > now) {
      const hrs = Math.round((onsetTime - now) / 3_600_000);
      return hrs > 0 ? `in ${hrs}h` : 'imm.';
    }
  }
  if (expires) {
    const expTime = new Date(expires).getTime();
    const hrs = Math.round((expTime - now) / 3_600_000);
    return hrs > 0 ? `${hrs}h left` : 'expiring';
  }
  return 'active';
}

// ─── Component ───

export function WeatherMonitor() {
  const [view, setView] = useState<ViewMode>('alerts');

  const { data: alerts = [], isLoading: wxLoading, isError: wxError } = useWeatherAlerts();
  const { data: natEvents = [], isLoading: natLoading, isError: natError } = useNaturalEvents();

  const anyLoading = wxLoading || natLoading;
  const anyError = wxError || natError;
  const status: PanelStatus = anyLoading ? 'loading' : anyError ? 'error' : 'live';

  // Sort alerts by severity
  const severityOrder: Record<string, number> = {
    Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4,
  };
  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)),
    [alerts]
  );

  // Sort natural events by severity then time
  const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedNatEvents = useMemo(
    () => [...natEvents].sort((a, b) => {
      const sd = (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
      if (sd !== 0) return sd;
      return b.time.getTime() - a.time.getTime();
    }),
    [natEvents]
  );

  // Stats
  const stats = useMemo(() => {
    // By EONET category
    const byCat: Record<string, number> = {};
    for (const ev of natEvents) {
      const label = CATEGORY_LABELS[ev.category] || ev.category.toUpperCase();
      byCat[label] = (byCat[label] || 0) + 1;
    }

    // By severity (combined NOAA + EONET)
    const bySev: Record<string, number> = { CRIT: 0, HIGH: 0, MED: 0, LOW: 0 };
    for (const alert of alerts) {
      if (alert.severity === 'Extreme') bySev.CRIT++;
      else if (alert.severity === 'Severe') bySev.HIGH++;
      else if (alert.severity === 'Moderate') bySev.MED++;
      else bySev.LOW++;
    }
    for (const ev of natEvents) {
      if (ev.severity === 'critical') bySev.CRIT++;
      else if (ev.severity === 'high') bySev.HIGH++;
      else if (ev.severity === 'medium') bySev.MED++;
      else bySev.LOW++;
    }

    return { byCat, bySev };
  }, [alerts, natEvents]);

  const extremeCount = alerts.filter((a) => a.severity === 'Extreme').length;
  const severeCount = alerts.filter((a) => a.severity === 'Severe').length;
  const totalCount = alerts.length + natEvents.length;

  return (
    <TerminalWindow
      title="WX / NATURAL EVENTS"
      status={status}
      headerRight={
        <div className="flex items-center gap-2 text-[9px]">
          {extremeCount > 0 && (
            <span className="text-terminal-red">{extremeCount} EXT</span>
          )}
          {severeCount > 0 && (
            <span className="text-terminal-amber">{severeCount} SEV</span>
          )}
          <span className="text-terminal-primary-dim">{totalCount} total</span>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Tab bar */}
        <div className="flex gap-1 text-[9px]">
          {(['alerts', 'events', 'stats'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`px-2 py-0.5 border transition-colors ${
                view === mode
                  ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/10'
                  : 'border-terminal-border text-terminal-primary-dim hover:text-terminal-primary hover:border-terminal-primary/50'
              }`}
            >
              {mode === 'alerts' ? `ALERTS (${alerts.length})` :
               mode === 'events' ? `EVENTS (${natEvents.length})` :
               'STATS'}
            </button>
          ))}
        </div>

        {/* Alerts view */}
        {view === 'alerts' && (
          sortedAlerts.length > 0 ? (
            <AsciiTable<NOAAAlert>
              columns={[
                {
                  key: 'severity',
                  header: 'SEV',
                  width: 4,
                  render: (v) => String(v).slice(0, 3).toUpperCase(),
                },
                {
                  key: 'event',
                  header: 'EVENT',
                  width: 20,
                  render: (v) => {
                    const s = String(v);
                    return s.length > 20 ? s.slice(0, 19) + '\u2026' : s;
                  },
                },
                {
                  key: 'areaDesc',
                  header: 'AREA',
                  width: 18,
                  render: (v) => {
                    const s = String(v);
                    return s.length > 18 ? s.slice(0, 17) + '\u2026' : s;
                  },
                },
                {
                  key: 'onset',
                  header: 'TIME',
                  width: 8,
                  align: 'right',
                  render: (_v, row) => {
                    const r = row as unknown as NOAAAlert;
                    return formatTimeRange(r.onset, r.expires);
                  },
                },
              ]}
              data={sortedAlerts.slice(0, 15)}
              maxRows={15}
              highlightRow={(row) => row.severity === 'Extreme' || row.severity === 'Severe'}
            />
          ) : (
            <div className="text-terminal-primary-dim text-xs p-2">
              {wxLoading ? 'Loading weather alerts...' : 'No active severe weather alerts (US)'}
            </div>
          )
        )}

        {/* Events view */}
        {view === 'events' && (
          sortedNatEvents.length > 0 ? (
            <AsciiTable<NaturalEvent>
              columns={[
                {
                  key: 'category',
                  header: 'TYPE',
                  width: 5,
                  render: (v) => CATEGORY_LABELS[String(v)] || String(v).slice(0, 5).toUpperCase(),
                },
                {
                  key: 'severity',
                  header: 'SEV',
                  width: 4,
                  render: (v) => {
                    const s = String(v);
                    return SEVERITY_LABEL[s] || s.slice(0, 4).toUpperCase();
                  },
                },
                {
                  key: 'title',
                  header: 'EVENT',
                  width: 28,
                  render: (v) => {
                    const s = String(v);
                    return s.length > 28 ? s.slice(0, 27) + '\u2026' : s;
                  },
                },
                {
                  key: 'time',
                  header: 'WHEN',
                  width: 10,
                  align: 'right',
                  render: (v) => formatRelative(v as Date),
                },
              ]}
              data={sortedNatEvents.slice(0, 15)}
              maxRows={15}
              highlightRow={(row) => row.severity === 'critical' || row.severity === 'high'}
            />
          ) : (
            <div className="text-terminal-primary-dim text-xs p-2">
              {natLoading ? 'Loading natural events...' : 'No active natural events'}
            </div>
          )
        )}

        {/* Stats view */}
        {view === 'stats' && (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-terminal-primary-dim mb-1">BY SEVERITY (ALL SOURCES)</div>
              <AsciiChart
                data={[stats.bySev.CRIT, stats.bySev.HIGH, stats.bySev.MED, stats.bySev.LOW]}
                labels={['CRIT', 'HIGH', 'MED', 'LOW']}
                type="horizontal-bar"
                width={16}
              />
            </div>
            {Object.keys(stats.byCat).length > 0 && (
              <div>
                <div className="text-xs text-terminal-primary-dim mb-1">BY TYPE (EONET EVENTS)</div>
                <AsciiChart
                  data={Object.values(stats.byCat)}
                  labels={Object.keys(stats.byCat)}
                  type="horizontal-bar"
                  width={16}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
