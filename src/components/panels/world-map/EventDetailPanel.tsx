/**
 * EventDetailPanel — Overlay panel for event drill-down detail view.
 *
 * Slides in from the right edge of the map on event click.
 * Shows full event detail: type, title, source, time, severity,
 * coordinates, related events, and action buttons.
 *
 * Replaces the raw window.open(url) behavior with a richer
 * in-map detail panel that still offers [OPEN SOURCE] link.
 */

import { useMemo, useEffect } from 'react';
import { formatTimeAgo } from '@/utils/map-events';
import type { MapEvent } from '@/types';
import { getTypeConfig } from '@/config/event-types';

interface EventDetailPanelProps {
  event: MapEvent;
  allEvents: MapEvent[];
  onClose: () => void;
  onZoomTo?: (lon: number, lat: number) => void;
}

// ─── Severity badge ───

const SEVERITY_STYLES: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--color-terminal-red)', bg: 'color-mix(in srgb, var(--color-terminal-red) 15%, transparent)' },
  high:     { color: 'var(--color-terminal-amber)', bg: 'color-mix(in srgb, var(--color-terminal-amber) 15%, transparent)' },
  medium:   { color: 'var(--color-terminal-yellow)', bg: 'color-mix(in srgb, var(--color-terminal-yellow) 10%, transparent)' },
  low:      { color: 'var(--color-terminal-primary-dim)', bg: 'color-mix(in srgb, var(--color-terminal-primary) 8%, transparent)' },
};

// ─── Metadata Renderers ───

function EarthquakeMeta({ meta }: { meta: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
      {meta.magnitude != null && (
        <div>
          <span className="text-terminal-primary-dim">MAG </span>
          <span className="text-terminal-amber font-bold">{String(meta.magnitude)}</span>
        </div>
      )}
      {meta.depth != null && (
        <div>
          <span className="text-terminal-primary-dim">DEPTH </span>
          <span className="text-terminal-primary">{String(meta.depth)}km</span>
        </div>
      )}
      {meta.place != null && (
        <div className="col-span-2">
          <span className="text-terminal-primary-dim">PLACE </span>
          <span className="text-terminal-primary">{String(meta.place)}</span>
        </div>
      )}
      {Boolean(meta.tsunami) && (
        <div className="col-span-2 text-terminal-red font-bold mt-0.5">
          ⚠ TSUNAMI WARNING ISSUED
        </div>
      )}
    </div>
  );
}

function WeatherMeta({ meta }: { meta: Record<string, unknown> }) {
  return (
    <div className="space-y-0.5">
      {meta.event != null && (
        <div>
          <span className="text-terminal-primary-dim">EVENT </span>
          <span className="text-terminal-primary">{String(meta.event)}</span>
        </div>
      )}
      {meta.headline != null && (
        <div className="text-terminal-primary-dim leading-tight">
          {String(meta.headline)}
        </div>
      )}
    </div>
  );
}

function NewsMeta({ meta }: { meta: Record<string, unknown> }) {
  return (
    <>
      {meta.snippet != null && (
        <div className="text-terminal-primary-dim leading-tight">
          {String(meta.snippet)}
        </div>
      )}
    </>
  );
}

// ─── Main Component ───

export function EventDetailPanel({
  event,
  allEvents,
  onClose,
  onZoomTo,
}: EventDetailPanelProps) {
  const typeConfig = getTypeConfig(event.type);

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Find related events: same region, within 500km, or same type nearby
  const relatedEvents = useMemo(() => {
    return allEvents
      .filter((e) => {
        if (e.id === event.id) return false;
        // Same region
        if (e.region === event.region) return true;
        // Same type within rough proximity (~5 degrees)
        if (e.type === event.type) {
          const dLon = Math.abs(e.coordinates[0] - event.coordinates[0]);
          const dLat = Math.abs(e.coordinates[1] - event.coordinates[1]);
          return dLon < 5 && dLat < 5;
        }
        return false;
      })
      .sort((a, b) => {
        // Prioritize higher severity, then more recent
        const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const sevDiff = sevOrder[a.severity] - sevOrder[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return b.time.getTime() - a.time.getTime();
      })
      .slice(0, 5);
  }, [event, allEvents]);

  const sevStyle = SEVERITY_STYLES[event.severity] || SEVERITY_STYLES.low;

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-40 font-mono overflow-y-auto"
      style={{
        width: '280px',
        backgroundColor: 'color-mix(in srgb, var(--color-terminal-bg) 95%, transparent)',
        borderLeft: '1px solid var(--color-terminal-border)',
        boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.5), 0 0 8px color-mix(in srgb, var(--color-terminal-primary) 5%, transparent)',
      }}
    >
      {/* ─── Header ─── */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-[11px]"
            style={{ color: `var(${typeConfig.colorVar})` }}
          >
            {typeConfig.symbol}
          </span>
          <span
            className="text-[9px] tracking-widest font-bold"
            style={{ color: `var(${typeConfig.colorVar})` }}
          >
            {typeConfig.defaultLabel}
          </span>
        </div>
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={onClose}
        >
          [CLOSE]
        </button>
      </div>

      {/* ─── Severity Badge ─── */}
      <div className="px-3 py-1.5">
        <span
          className="text-[8px] tracking-widest font-bold px-1.5 py-0.5 uppercase"
          style={{
            color: sevStyle.color,
            backgroundColor: sevStyle.bg,
            border: `1px solid ${sevStyle.color}`,
          }}
        >
          {event.severity}
        </span>
      </div>

      {/* ─── Title ─── */}
      <div className="px-3 py-1">
        <div
          className="text-[11px] font-bold leading-tight"
          style={{ color: 'var(--color-terminal-primary)' }}
        >
          {event.title}
        </div>
      </div>

      {/* ─── Metadata Row ─── */}
      <div
        className="px-3 py-1.5 text-[9px] space-y-0.5"
        style={{ borderTop: '1px solid var(--color-terminal-border)' }}
      >
        <div className="flex items-center gap-2 text-terminal-primary-dim">
          <span>SRC: {event.source}</span>
        </div>
        <div className="flex items-center gap-2 text-terminal-primary-dim">
          <span>TIME: {formatTimeAgo(event.time)}</span>
          <span>•</span>
          <span>{event.time.toISOString().slice(0, 16).replace('T', ' ')}Z</span>
        </div>
        <div className="flex items-center gap-2 text-terminal-primary-dim">
          <span>REGION: {event.region}</span>
        </div>
        <div className="flex items-center gap-2 text-terminal-primary-dim">
          <span>
            COORDS: {event.coordinates[1].toFixed(2)}°{event.coordinates[1] >= 0 ? 'N' : 'S'},{' '}
            {event.coordinates[0].toFixed(2)}°{event.coordinates[0] >= 0 ? 'E' : 'W'}
          </span>
        </div>
      </div>

      {/* ─── Type-specific metadata ─── */}
      {event.meta && Object.keys(event.meta).length > 0 && (
        <div
          className="px-3 py-1.5 text-[9px]"
          style={{ borderTop: '1px solid var(--color-terminal-border)' }}
        >
          {event.type === 'earthquake' && <EarthquakeMeta meta={event.meta} />}
          {event.type === 'weather' && <WeatherMeta meta={event.meta} />}
          {['news', 'defense', 'finance', 'tech'].includes(event.type) && (
            <NewsMeta meta={event.meta} />
          )}
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid var(--color-terminal-border)' }}
      >
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-wide cursor-pointer transition-colors"
            style={{
              color: 'var(--color-terminal-cyan)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-terminal-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-terminal-cyan)';
            }}
          >
            [OPEN SOURCE]
          </a>
        )}
        {onZoomTo && (
          <button
            className="text-[9px] tracking-wide text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={() => onZoomTo(event.coordinates[0], event.coordinates[1])}
          >
            [ZOOM TO]
          </button>
        )}
      </div>

      {/* ─── Related Events ─── */}
      {relatedEvents.length > 0 && (
        <div
          className="px-3 py-2"
          style={{ borderTop: '1px solid var(--color-terminal-border)' }}
        >
          <div className="text-[9px] tracking-widest text-terminal-primary-dim mb-1.5">
            RELATED ({relatedEvents.length})
          </div>
          <div className="space-y-1">
            {relatedEvents.map((rel) => {
              const relConfig = getTypeConfig(rel.type);
              return (
                <div
                  key={rel.id}
                  className="flex items-start gap-1.5 text-[9px] leading-tight"
                >
                  <span
                    className="flex-shrink-0 mt-px"
                    style={{ color: `var(${relConfig.colorVar})` }}
                  >
                    {relConfig.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-terminal-primary truncate">
                      {rel.title}
                    </div>
                    <div className="text-terminal-primary-dim text-[8px]">
                      {rel.source} • {formatTimeAgo(rel.time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <div
        className="px-3 py-1.5 text-[8px] text-terminal-primary-dim"
        style={{
          borderTop: '1px solid var(--color-terminal-border)',
          opacity: 0.5,
        }}
      >
        ID: {event.id.slice(0, 24)}
      </div>
    </div>
  );
}
