/**
 * AsciiDangerFlag — Prominent ASCII markers for critical severity events.
 *
 * Three visual variants based on event type:
 *
 * 'box' (earthquake) — Box-drawing bordered box:
 *   ┌─⚠ CRITICAL──────┐
 *   │ M7.2 EARTHQUAKE  │
 *   │ Near Sumatra      │
 *   └──────────────────┘
 *
 * 'banner' (defense/finance) — Horizontal alert line:
 *   ════╡ ⚠ ALERT: Strike on target... ╞════
 *
 * 'wire' (news/tech) — Wire flash:
 *   ▌▌ FLASH: Major headline text... ▌▌
 */

import { BOX, BLOCK } from '@/utils/ascii';
import type { MapEvent, MapEventType } from '@/types';
import type { DangerVariant } from './overlay-classifier';
import { getTypeConfig } from '@/config/event-types';

interface AsciiDangerFlagProps {
  event: MapEvent;
  left: string;
  top: string;
  zoomLevel: number;
  variant: DangerVariant;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

// ─── Box Variant (natural/wx events & critical) ───

const NATURAL_TYPES = new Set<MapEventType>(['earthquake', 'natural-event', 'climate-anomaly', 'weather']);

function buildBoxContent(event: MapEvent, zoomLevel: number): string[] {
  const lines: string[] = [];

  if (event.type === 'earthquake') {
    const mag = event.meta?.magnitude;
    lines.push(mag != null ? `M${mag} EARTHQUAKE` : 'EARTHQUAKE');
    if (event.meta?.place && zoomLevel >= 2) {
      const place = String(event.meta.place);
      lines.push(place.length > 20 ? place.substring(0, 18) + '..' : place);
    }
  } else if (NATURAL_TYPES.has(event.type)) {
    lines.push('⚠ NATURAL / WX');
    const title = event.title.substring(0, 20);
    lines.push(title.length < event.title.length ? title + '..' : title);
  } else {
    lines.push('⚠ CRITICAL');
    const title = event.title.substring(0, 20);
    lines.push(title.length < event.title.length ? title + '..' : title);
  }

  return lines;
}

function buildBox(header: string, lines: string[]): string {
  const allLines = [header, ...lines];
  const maxLen = Math.max(...allLines.map((l) => l.length));
  const innerWidth = maxLen + 2;

  const topBorder = `${BOX.TL}${BOX.H}${header}${BOX.H.repeat(Math.max(0, innerWidth - header.length - 1))}${BOX.TR}`;
  const bottomBorder = `${BOX.BL}${BOX.H.repeat(innerWidth)}${BOX.BR}`;

  const contentLines = lines.map((line) => {
    const padded = line + ' '.repeat(Math.max(0, innerWidth - line.length - 2));
    return `${BOX.V} ${padded} ${BOX.V}`;
  });

  return [topBorder, ...contentLines, bottomBorder].join('\n');
}

function BoxVariant({ event, zoomLevel, colorVar }: { event: MapEvent; zoomLevel: number; colorVar: string }) {
  const contentLines = buildBoxContent(event, zoomLevel);
  const header = '⚠ CRITICAL';
  const boxText = buildBox(header, contentLines);

  return (
    <pre
      className="font-mono leading-tight"
      style={{
        color: `var(${colorVar})`,
        fontSize: '9px',
        textShadow: `0 0 6px var(${colorVar}), 0 0 3px var(${colorVar})`,
        margin: 0,
        padding: 0,
        whiteSpace: 'pre',
        lineHeight: '1.2',
      }}
    >
      {boxText}
    </pre>
  );
}

// ─── Banner Variant (defense/finance) ───

function BannerVariant({ event, colorVar }: { event: MapEvent; colorVar: string }) {
  const title = event.title.substring(0, 24);
  const alertLabel = event.type === 'finance' ? 'MARKET ALERT' : '⚠ ALERT';
  const bannerText = `══╡ ${alertLabel}: ${title}… ╞══`;

  return (
    <div
      className="font-mono leading-none whitespace-nowrap"
      style={{
        color: `var(${colorVar})`,
        fontSize: '9px',
        textShadow: `0 0 6px var(${colorVar}), 0 0 3px var(${colorVar})`,
        letterSpacing: '0.5px',
      }}
    >
      {bannerText}
    </div>
  );
}

// ─── Wire Variant (news/tech) ───

function WireVariant({ event, colorVar }: { event: MapEvent; colorVar: string }) {
  const title = event.title.substring(0, 26);
  const prefix = event.type === 'tech' ? 'ALERT' : 'FLASH';
  const wireText = `${BLOCK.HALF_LEFT}${BLOCK.HALF_LEFT} ${prefix}: ${title}… ${BLOCK.HALF_LEFT}${BLOCK.HALF_LEFT}`;

  return (
    <div
      className="animate-wire-flash font-mono leading-none whitespace-nowrap"
      style={{
        color: `var(${colorVar})`,
        fontSize: '9px',
        textShadow: `0 0 8px var(${colorVar}), 0 0 4px var(${colorVar})`,
        letterSpacing: '0.5px',
      }}
    >
      {wireText}
    </div>
  );
}

// ─── Main Component ───

export function AsciiDangerFlag({
  event,
  left,
  top,
  zoomLevel,
  variant,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiDangerFlagProps) {
  const colorVar = getTypeConfig(event.type).colorVar;

  return (
    <div
      className={`absolute cursor-pointer ${variant === 'box' ? 'animate-danger-blink' : ''}`}
      style={{
        left,
        top,
        transform: 'translate(-50%, -100%)',
        zIndex: 40,
        pointerEvents: 'all',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {variant === 'box' && <BoxVariant event={event} zoomLevel={zoomLevel} colorVar={colorVar} />}
      {variant === 'banner' && <BannerVariant event={event} colorVar={colorVar} />}
      {variant === 'wire' && <WireVariant event={event} colorVar={colorVar} />}
    </div>
  );
}
