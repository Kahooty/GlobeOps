/**
 * AsciiEventFlag — A monospace text label positioned at an event's lon/lat.
 *
 * Content scales with zoom level:
 *   Z0-1: Symbol only (handled by AsciiPulseMarker now, flag used at Z:2+)
 *   Z2-3: Symbol + sub-type label (◆ CYBER, ▲ MIL, ■ MKT)
 *   Z4-5: Symbol + source + truncated title + severity bar
 *
 * Sub-type labels derived from event.meta.category for richer differentiation.
 * Recent events (<1h) show a blinking cursor indicator.
 * Styled with type-specific color vars + optional glow.
 * Anchored at bottom-center so the flag sits above the geographic point.
 */

import type { MapEvent, MapEventType } from '@/types';
import { getEventSubLabel } from './overlay-classifier';
import { getTypeConfig } from '@/config/event-types';

interface AsciiEventFlagProps {
  event: MapEvent;
  left: string;
  top: string;
  zoomLevel: number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

/** Build severity indicator bar: [!!!] for critical, [!! ] for high, [!  ] for medium */
function buildSeverityBar(severity: MapEvent['severity']): string {
  switch (severity) {
    case 'critical': return '[!!!]';
    case 'high':     return '[!! ]';
    case 'medium':   return '[!  ]';
    default:         return '';
  }
}

function resolveFlagConfig(type: MapEventType): { symbol: string; colorVar: string } {
  const reg = getTypeConfig(type);
  return { symbol: reg.symbol, colorVar: reg.colorVar };
}

function buildLabel(event: MapEvent, zoomLevel: number): string {
  const config = resolveFlagConfig(event.type);
  const subLabel = getEventSubLabel(event);

  // Z0-1: Symbol only (though PulseMarker handles these now)
  if (zoomLevel <= 1) {
    return config.symbol;
  }

  // Z2-3: Symbol + sub-type label
  if (zoomLevel <= 3) {
    return `${config.symbol} ${subLabel}`;
  }

  // Z4-5: Symbol + source + truncated title + severity bar
  const source = event.source ? event.source.substring(0, 6) : '';
  const title = event.title.substring(0, 16);
  const sevBar = buildSeverityBar(event.severity);
  const titlePart = `${source}:${title}…`;
  return sevBar ? `${config.symbol} ${titlePart} ${sevBar}` : `${config.symbol} ${titlePart}`;
}

export function AsciiEventFlag({
  event,
  left,
  top,
  zoomLevel,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiEventFlagProps) {
  const config = resolveFlagConfig(event.type);
  const label = buildLabel(event, zoomLevel);
  const isRecent = Date.now() - event.time.getTime() < 3_600_000;

  // For natural/wx events, use red for high/critical severity
  const isNatural = event.type === 'earthquake' || event.type === 'natural-event' || event.type === 'climate-anomaly' || event.type === 'weather';
  const colorVar =
    isNatural && (event.severity === 'high' || event.severity === 'critical')
      ? '--color-terminal-red'
      : config.colorVar;

  // Z-index by severity
  const zIndex =
    event.severity === 'critical' ? 30 :
    event.severity === 'high' ? 25 :
    event.severity === 'medium' ? 20 : 15;

  return (
    <div
      className="absolute cursor-pointer whitespace-nowrap"
      style={{
        left,
        top,
        transform: 'translate(-50%, -100%)',
        zIndex,
        pointerEvents: 'all',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Recency cursor indicator */}
      {isRecent && zoomLevel >= 2 && (
        <span
          className="animate-recency-cursor font-mono"
          style={{
            color: `var(${colorVar})`,
            fontSize: '10px',
            marginRight: '1px',
          }}
        >
          ›
        </span>
      )}

      <span
        className="font-mono leading-none"
        style={{
          color: `var(${colorVar})`,
          fontSize: '10px',
          textShadow: isRecent
            ? `0 0 6px var(${colorVar}), 0 0 2px var(${colorVar})`
            : `0 0 4px color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
    </div>
  );
}
