/**
 * MapTooltip — Hover tooltip for map events and clusters.
 *
 * Displays contextual detail on hover with smart edge-aware positioning.
 * Uses the full EVENT_TYPE_REGISTRY for type icons/labels/colors.
 * Shows type-specific metadata (earthquake mag/depth, news snippet, etc.)
 * and a "Click for details" hint to indicate the drill-down panel.
 */

import { useRef, useLayoutEffect, useState } from 'react';
import { formatTimeAgo } from '@/utils/map-events';
import type { MapEvent, MapEventType } from '@/types';
import { getTypeConfig } from '@/config/event-types';

interface MapTooltipProps {
  events: MapEvent | MapEvent[] | null;
  mousePos: { x: number; y: number };
  containerRect: DOMRect | null;
}

// ─── Resolve type visual config from registry ───

function resolveTypeLabel(type: MapEventType): { symbol: string; label: string; colorVar: string } {
  const reg = getTypeConfig(type);
  return { symbol: reg.symbol, label: reg.defaultLabel, colorVar: reg.colorVar };
}

// ─── Severity color mapping ───

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--color-terminal-red)',
  high: 'var(--color-terminal-amber)',
  medium: 'var(--color-terminal-yellow)',
  low: 'var(--color-terminal-primary-dim)',
};

// ─── Detail Components ───

function EarthquakeDetail({ event }: { event: MapEvent }) {
  const meta = event.meta || {};
  return (
    <div className="space-y-0.5">
      <div className="text-terminal-primary text-[10px] font-bold leading-tight">
        {event.title}
      </div>
      <div className="flex items-center gap-2 text-terminal-primary-dim text-[9px]">
        <span>{event.source}</span>
        <span>•</span>
        <span>{formatTimeAgo(event.time)}</span>
        <span>•</span>
        <span>{event.region}</span>
      </div>
      <div className="border-t border-terminal-border my-1" />
      <div className="grid grid-cols-2 gap-x-3 text-[9px]">
        {meta.magnitude != null && (
          <div>
            <span className="text-terminal-primary-dim">MAG: </span>
            <span className="text-terminal-amber font-bold">{String(meta.magnitude)}</span>
          </div>
        )}
        {meta.depth != null && (
          <div>
            <span className="text-terminal-primary-dim">DEPTH: </span>
            <span className="text-terminal-primary">{String(meta.depth)}km</span>
          </div>
        )}
        {meta.place != null && (
          <div className="col-span-2">
            <span className="text-terminal-primary-dim">LOC: </span>
            <span className="text-terminal-primary">{String(meta.place)}</span>
          </div>
        )}
        {Boolean(meta.tsunami) && (
          <div className="col-span-2 text-terminal-red font-bold">
            ⚠ TSUNAMI WARNING
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherDetail({ event }: { event: MapEvent }) {
  const meta = event.meta || {};
  return (
    <div className="space-y-0.5">
      <div className="text-terminal-primary text-[10px] font-bold leading-tight line-clamp-2">
        {event.title}
      </div>
      <div className="flex items-center gap-2 text-terminal-primary-dim text-[9px]">
        <span>{event.source}</span>
        <span>•</span>
        <span>{formatTimeAgo(event.time)}</span>
      </div>
      {meta.event != null && (
        <>
          <div className="border-t border-terminal-border my-1" />
          <div className="text-[9px]">
            <span className="text-terminal-primary-dim">ALERT: </span>
            <span className="text-terminal-primary">{String(meta.event)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function GenericDetail({ event }: { event: MapEvent }) {
  const meta = event.meta || {};
  return (
    <div className="space-y-0.5">
      <div className="text-terminal-primary text-[10px] font-bold leading-tight line-clamp-2">
        {event.title}
      </div>
      <div className="flex items-center gap-2 text-terminal-primary-dim text-[9px]">
        <span>{event.source}</span>
        <span>•</span>
        <span>{formatTimeAgo(event.time)}</span>
        <span>•</span>
        <span>{event.region}</span>
      </div>
      {meta.snippet != null && (
        <>
          <div className="border-t border-terminal-border my-1" />
          <div className="text-terminal-primary-dim text-[9px] leading-tight line-clamp-2">
            {String(meta.snippet)}
          </div>
        </>
      )}
    </div>
  );
}

function ClusterDetail({ events }: { events: MapEvent[] }) {
  const typeCounts = new Map<MapEventType, number>();
  for (const ev of events) {
    typeCounts.set(ev.type, (typeCounts.get(ev.type) || 0) + 1);
  }

  return (
    <div className="space-y-1">
      <div className="text-terminal-primary text-[10px] font-bold">
        {events.length} EVENTS IN AREA
      </div>
      <div className="border-t border-terminal-border" />
      {Array.from(typeCounts.entries()).map(([type, count]) => {
        const config = resolveTypeLabel(type);
        return (
          <div key={type} className="flex items-center gap-2 text-[9px]">
            <span style={{ color: `var(${config.colorVar})` }}>{config.symbol}</span>
            <span className="text-terminal-primary-dim">{config.label}:</span>
            <span className="text-terminal-primary">{count}</span>
          </div>
        );
      })}
      <div className="border-t border-terminal-border" />
      <div className="text-terminal-primary-dim text-[9px]">
        {events.slice(0, 3).map((ev) => (
          <div key={ev.id} className="truncate leading-tight">
            <span style={{ color: `var(${resolveTypeLabel(ev.type).colorVar})` }}>
              {resolveTypeLabel(ev.type).symbol}
            </span>{' '}
            {ev.title}
          </div>
        ))}
        {events.length > 3 && (
          <div className="text-terminal-primary-dim">
            +{events.length - 3} more...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Tooltip ───

export function MapTooltip({ events, mousePos, containerRect }: MapTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 12, y: -8 });

  // Smart positioning: flip tooltip when near container edges
  useLayoutEffect(() => {
    if (!tooltipRef.current || !containerRect) return;

    const tooltip = tooltipRef.current;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;

    let ox = 12;
    let oy = -8;

    // Flip horizontally if tooltip would overflow right edge
    if (mousePos.x + ox + tw > containerRect.width - 8) {
      ox = -(tw + 12);
    }

    // Flip vertically if tooltip would overflow bottom
    if (mousePos.y + oy + th > containerRect.height - 8) {
      oy = -(th + 8);
    }

    // Don't let tooltip go above top
    if (mousePos.y + oy < 8) {
      oy = 8;
    }

    setOffset({ x: ox, y: oy });
  }, [mousePos, containerRect]);

  if (!events) return null;

  const isArray = Array.isArray(events);
  const eventArray = isArray ? events : [events];
  const isSingle = eventArray.length === 1;
  const event = eventArray[0];
  const typeConfig = resolveTypeLabel(event.type);
  const sevColor = SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.low;

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 pointer-events-none"
      style={{
        left: mousePos.x + offset.x,
        top: mousePos.y + offset.y,
        maxWidth: 260,
        minWidth: 180,
      }}
    >
      <div
        className="terminal-border p-2 text-[10px] shadow-lg"
        style={{
          boxShadow: `0 0 12px color-mix(in srgb, var(${typeConfig.colorVar}) 20%, transparent)`,
        }}
      >
        {/* Type indicator header */}
        <div
          className="flex items-center gap-1.5 mb-1 text-[9px] font-bold tracking-wider"
          style={{ color: `var(${typeConfig.colorVar})` }}
        >
          <span>{typeConfig.symbol}</span>
          <span>{isSingle ? typeConfig.label : 'CLUSTER'}</span>
          <span
            className="font-normal ml-auto uppercase text-[8px]"
            style={{ color: sevColor }}
          >
            {event.severity}
          </span>
        </div>

        {/* Content — type-specific detail renderer */}
        {!isSingle ? (
          <ClusterDetail events={eventArray} />
        ) : event.type === 'earthquake' ? (
          <EarthquakeDetail event={event} />
        ) : event.type === 'weather' ? (
          <WeatherDetail event={event} />
        ) : (
          <GenericDetail event={event} />
        )}

        {/* Click hint */}
        <div
          className="mt-1.5 pt-1 text-[8px] text-terminal-primary-dim text-center"
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--color-terminal-border) 50%, transparent)',
            opacity: 0.6,
          }}
        >
          Click for details
        </div>
      </div>
    </div>
  );
}
