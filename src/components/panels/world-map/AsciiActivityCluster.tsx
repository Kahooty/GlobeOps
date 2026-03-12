/**
 * AsciiActivityCluster — Inline activity log for 3-5 event clusters at Z:2-3.
 *
 * Instead of a rectangular zone box, shows a compact stacked list of
 * event previews with a count header. This provides visual variety by
 * using a log/feed format rather than a bordered rectangle.
 *
 * Layout:
 *   ┤ 4 ACTIVE ├
 *   ▸ ◆ BBC:headline..
 *   ▸ ▲ DEF:alert text
 *   ▸ ■ MKT:market ne..
 */

import { BOX } from '@/utils/ascii';
import { getTypeConfig, getEventSubLabel } from './overlay-classifier';
import type { MapEvent } from '@/types';

interface AsciiActivityClusterProps {
  events: MapEvent[];
  left: string;
  top: string;
  zoomLevel: number;
  colorVar: string;
  label: string;
  animated: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const MAX_PREVIEW_LINES = 3;

function buildPreviewLine(event: MapEvent, zoomLevel: number): { text: string; colorVar: string } {
  const config = getTypeConfig(event.type);
  const subLabel = getEventSubLabel(event);

  if (zoomLevel >= 4) {
    const source = event.source ? event.source.substring(0, 5) : '';
    const title = event.title.substring(0, 14);
    return {
      text: `▸ ${config.symbol} ${source}:${title}..`,
      colorVar: config.colorVar,
    };
  }

  // Z:2-3: symbol + sublabel + short title
  const title = event.title.substring(0, 12);
  return {
    text: `▸ ${config.symbol} ${subLabel}:${title}..`,
    colorVar: config.colorVar,
  };
}

export function AsciiActivityCluster({
  events,
  left,
  top,
  zoomLevel,
  colorVar,
  label,
  animated,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: AsciiActivityClusterProps) {
  // Sort by severity (critical first), then recency
  const sorted = [...events].sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sevDiff = sevOrder[a.severity] - sevOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.time.getTime() - a.time.getTime();
  });

  const previews = sorted.slice(0, MAX_PREVIEW_LINES).map((e) => buildPreviewLine(e, zoomLevel));
  const headerText = label || `${events.length} ACTIVE`;
  const header = `${BOX.T_LEFT} ${headerText} ${BOX.T_RIGHT}`;

  return (
    <div
      className={`absolute cursor-pointer ${animated ? 'animate-danger-blink' : ''}`}
      style={{
        left,
        top,
        transform: 'translate(-50%, -100%)',
        zIndex: 22,
        pointerEvents: 'all',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Header line */}
      <div
        className="font-mono leading-none whitespace-nowrap"
        style={{
          color: `var(${colorVar})`,
          fontSize: '8px',
          textShadow: `0 0 4px color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
          letterSpacing: '0.5px',
          marginBottom: '1px',
        }}
      >
        {header}
      </div>

      {/* Preview lines */}
      {previews.map((preview, i) => (
        <div
          key={i}
          className="font-mono leading-tight whitespace-nowrap"
          style={{
            color: `var(${preview.colorVar})`,
            fontSize: '8px',
            textShadow: `0 0 3px color-mix(in srgb, var(${preview.colorVar}) 20%, transparent)`,
            letterSpacing: '0.3px',
            opacity: 1 - i * 0.15, // slight fade for lower items
          }}
        >
          {preview.text}
        </div>
      ))}

      {/* Overflow indicator */}
      {events.length > MAX_PREVIEW_LINES && (
        <div
          className="font-mono leading-tight whitespace-nowrap"
          style={{
            color: `var(${colorVar})`,
            fontSize: '7px',
            opacity: 0.5,
            letterSpacing: '0.3px',
          }}
        >
          +{events.length - MAX_PREVIEW_LINES} more
        </div>
      )}
    </div>
  );
}
