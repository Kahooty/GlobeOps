/**
 * AsciiEventZone — Box-drawing bordered region around clustered events.
 *
 * Three border style variants:
 *
 * 'single-type' — Solid border (all events same type):
 *   ┌──SEISMIC ZONE──────┐
 *   │                     │
 *   └──────── 8 EVENTS ──┘
 *
 * 'mixed' — Dashed border with per-type count badges:
 *   ┌╌╌MIXED ACTIVITY╌╌╌┐
 *   ╎  ●3 ◆5 ▲2          ╎
 *   └╌╌╌╌╌╌╌ 10 EVENTS ╌┘
 *
 * 'critical' — Heavy/double border with warning markers:
 *   ╔══⚠ CONFLICT ZONE ⚠══╗
 *   ║                       ║
 *   ╚═════════ 12 EVENTS ══╝
 *
 * Zone labels are dynamically computed from cluster composition.
 */

import { BOX } from '@/utils/ascii';
import { getTypeComposition } from './overlay-classifier';
import type { MapEvent, MapEventType } from '@/types';
import type { ZoneVariant } from './overlay-classifier';
import { getTypeConfig } from '@/config/event-types';

interface AsciiEventZoneProps {
  events: MapEvent[];
  dominantType: MapEventType;
  left: string;
  top: string;
  width: string;
  height: string;
  variant: ZoneVariant;
  zoneLabel: string;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

// ─── Border characters by variant ───

const BORDER_CHARS: Record<ZoneVariant, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> = {
  'single-type': { tl: BOX.TL, tr: BOX.TR, bl: BOX.BL, br: BOX.BR, h: BOX.H, v: BOX.V },
  'mixed':       { tl: BOX.TL, tr: BOX.TR, bl: BOX.BL, br: BOX.BR, h: '╌', v: '╎' },
  'critical':    { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
};

export function AsciiEventZone({
  events,
  dominantType,
  left,
  top,
  width,
  height,
  variant,
  zoneLabel,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiEventZoneProps) {
  const colorVar = getTypeConfig(dominantType).colorVar;
  const chars = BORDER_CHARS[variant];
  const isCritical = variant === 'critical';
  const isMixed = variant === 'mixed';

  // Get type composition for mixed zones
  const composition = isMixed ? getTypeComposition(events) : [];

  // Border style
  const borderStyle = isCritical
    ? `2px solid var(${colorVar})`
    : isMixed
    ? `1px dashed var(${colorVar})`
    : `1px solid var(${colorVar})`;

  const glowIntensity = isCritical ? '30%' : '20%';

  return (
    <div
      className={`absolute cursor-pointer ${isCritical ? 'animate-danger-blink' : ''}`}
      style={{
        left,
        top,
        width,
        height,
        zIndex: isCritical ? 10 : 5,
        pointerEvents: 'all',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div
        className="w-full h-full relative"
        style={{
          border: borderStyle,
          borderRadius: 0,
          boxShadow: `0 0 8px color-mix(in srgb, var(${colorVar}) ${glowIntensity}, transparent), inset 0 0 8px color-mix(in srgb, var(${colorVar}) 5%, transparent)`,
        }}
      >
        {/* Zone label */}
        <div
          className="absolute font-mono whitespace-nowrap"
          style={{
            top: '-7px',
            left: '4px',
            fontSize: '8px',
            lineHeight: '1',
            color: `var(${colorVar})`,
            backgroundColor: 'var(--color-terminal-bg-panel)',
            padding: '0 3px',
            textShadow: `0 0 4px var(${colorVar})`,
            letterSpacing: '0.5px',
          }}
        >
          {isCritical ? `⚠ ${zoneLabel} ⚠` : `${chars.h}${chars.h}${zoneLabel}${chars.h}${chars.h}`}
        </div>

        {/* Corner decorations */}
        <span
          className="absolute font-mono"
          style={{ top: '-1px', left: '-1px', color: `var(${colorVar})`, fontSize: '9px', lineHeight: '1' }}
        >
          {chars.tl}
        </span>
        <span
          className="absolute font-mono"
          style={{ top: '-1px', right: '-1px', color: `var(${colorVar})`, fontSize: '9px', lineHeight: '1' }}
        >
          {chars.tr}
        </span>
        <span
          className="absolute font-mono"
          style={{ bottom: '-1px', left: '-1px', color: `var(${colorVar})`, fontSize: '9px', lineHeight: '1' }}
        >
          {chars.bl}
        </span>
        <span
          className="absolute font-mono"
          style={{ bottom: '-1px', right: '-1px', color: `var(${colorVar})`, fontSize: '9px', lineHeight: '1' }}
        >
          {chars.br}
        </span>

        {/* Mixed-type composition badge (for mixed variant) */}
        {isMixed && composition.length > 1 && (
          <div
            className="absolute font-mono whitespace-nowrap"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '8px',
              lineHeight: '1',
              letterSpacing: '1px',
              opacity: 0.7,
            }}
          >
            {composition.slice(0, 4).map((c, i) => (
              <span key={c.type} style={{ color: `var(${c.colorVar})` }}>
                {i > 0 ? ' ' : ''}{c.symbol}{c.count}
              </span>
            ))}
          </div>
        )}

        {/* Color segment bar (proportional type distribution for mixed zones) */}
        {isMixed && composition.length > 1 && (
          <div
            className="absolute flex"
            style={{
              bottom: '2px',
              left: '4px',
              right: '4px',
              height: '2px',
              opacity: 0.6,
              gap: '1px',
            }}
          >
            {composition.map((c) => (
              <div
                key={c.type}
                style={{
                  flex: c.count,
                  backgroundColor: `var(${c.colorVar})`,
                  boxShadow: `0 0 3px var(${c.colorVar})`,
                }}
              />
            ))}
          </div>
        )}

        {/* Event count badge */}
        <div
          className="absolute font-mono"
          style={{
            bottom: '-7px',
            right: '4px',
            fontSize: '8px',
            lineHeight: '1',
            color: `var(${colorVar})`,
            backgroundColor: 'var(--color-terminal-bg-panel)',
            padding: '0 3px',
          }}
        >
          {events.length} EVENTS
        </div>
      </div>
    </div>
  );
}
