/**
 * AsciiPulseMarker — Single event marker for Z:0-1 with pulsing ring animation.
 *
 * Replaces text-based AsciiEventFlag at low zoom levels where text labels
 * would be too dense. Shows just a colored symbol with an expanding ring
 * that pulses to indicate activity.
 *
 * Visual:
 *   Z:0  ●         (just the dot, 8px)
 *   Z:1  (●)       (dot with pulse parens, 10px)
 *
 * Symbol by type, color by type, pulse speed by severity.
 */

import type { MapEvent, MapEventType } from '@/types';
import { getTypeConfig } from '@/config/event-types';

interface AsciiPulseMarkerProps {
  event: MapEvent;
  left: string;
  top: string;
  zoomLevel: number;
  colorVar: string;
  intensity: number;
  animated: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const PULSE_SYMBOLS: Partial<Record<MapEventType, string>> = {
  earthquake: '●',
  news:       '◆',
  defense:    '▲',
  finance:    '■',
  tech:       '◈',
};

export function AsciiPulseMarker({
  event,
  left,
  top,
  zoomLevel,
  colorVar,
  intensity,
  animated,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiPulseMarkerProps) {
  const symbol = PULSE_SYMBOLS[event.type] ?? getTypeConfig(event.type).symbol;
  const fontSize = zoomLevel === 0 ? '8px' : '10px';
  const isCritical = event.severity === 'critical';

  // Z-index by severity
  const zIndex =
    event.severity === 'critical' ? 30 :
    event.severity === 'high' ? 25 :
    event.severity === 'medium' ? 20 : 15;

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left,
        top,
        transform: 'translate(-50%, -50%)',
        zIndex,
        pointerEvents: 'all',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Pulse ring — animated expanding circle behind the symbol */}
      {animated && (
        <span
          className={isCritical ? 'animate-ring-pulse-fast' : 'animate-ring-pulse'}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: zoomLevel === 0 ? '12px' : '16px',
            height: zoomLevel === 0 ? '12px' : '16px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `1px solid var(${colorVar})`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Symbol */}
      <span
        className={`font-mono leading-none ${!animated && intensity < 0.5 ? 'animate-slow-pulse' : ''}`}
        style={{
          color: `var(${colorVar})`,
          fontSize,
          textShadow: intensity > 0.5
            ? `0 0 6px var(${colorVar}), 0 0 3px var(${colorVar})`
            : `0 0 4px color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
          position: 'relative',
        }}
      >
        {symbol}
      </span>
    </div>
  );
}
