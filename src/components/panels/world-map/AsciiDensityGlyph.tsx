/**
 * AsciiDensityGlyph — Compact cluster badge using block characters for Z:0-1.
 *
 * Replaces the rectangular AsciiEventZone at low zoom with a tiny glyph
 * that encodes cluster size visually through Unicode block density characters.
 *
 * Visual by cluster size:
 *   3-5 events:    ⟨3⟩
 *   6-10 events:   ▒8▒
 *   11-20 events:  █14█
 *   20+ events:    ▓▓28▓▓  (with throb animation)
 */

import type { MapEvent, MapEventType } from '@/types';
import { BLOCK } from '@/utils/ascii';
import { getTypeConfig } from '@/config/event-types';

interface AsciiDensityGlyphProps {
  events: MapEvent[];
  dominantType: MapEventType;
  left: string;
  top: string;
  colorVar: string;
  animated: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function buildGlyph(count: number): string {
  if (count <= 5) return `⟨${count}⟩`;
  if (count <= 10) return `${BLOCK.MEDIUM}${count}${BLOCK.MEDIUM}`;
  if (count <= 20) return `${BLOCK.FULL}${count}${BLOCK.FULL}`;
  return `${BLOCK.DARK}${BLOCK.DARK}${count}${BLOCK.DARK}${BLOCK.DARK}`;
}

export function AsciiDensityGlyph({
  events,
  dominantType,
  left,
  top,
  colorVar,
  animated,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiDensityGlyphProps) {
  const resolvedColor = colorVar || getTypeConfig(dominantType).colorVar;
  const glyph = buildGlyph(events.length);
  const shouldThrob = animated || events.length >= 20;

  // Higher z-index for larger clusters
  const zIndex = events.length >= 20 ? 25 : events.length >= 10 ? 20 : 15;

  return (
    <div
      className={`absolute cursor-pointer ${shouldThrob ? 'animate-density-throb' : ''}`}
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
      <span
        className="font-mono leading-none whitespace-nowrap"
        style={{
          color: `var(${resolvedColor})`,
          fontSize: '9px',
          textShadow: `0 0 6px var(${resolvedColor}), 0 0 3px color-mix(in srgb, var(${resolvedColor}) 40%, transparent)`,
          letterSpacing: '0.5px',
        }}
      >
        {glyph}
      </span>
    </div>
  );
}
