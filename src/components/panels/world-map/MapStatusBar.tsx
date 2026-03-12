import type { MapEvent, MapEventType } from '@/types';
import type { Viewport } from './use-map-viewport';
import { ZOOM_CONFIGS } from './use-map-viewport';
import { useMemo } from 'react';

interface MapStatusBarProps {
  events: MapEvent[];
  viewport?: Viewport;
  dataSourceErrors?: string[];
}

const NATURAL_TYPES: MapEventType[] = ['earthquake', 'natural-event', 'climate-anomaly', 'weather'];

const STATUS_CONFIG: { types: MapEventType[]; label: string; colorVar: string }[] = [
  { types: NATURAL_TYPES, label: 'NAT', colorVar: '--color-terminal-amber' },
  { types: ['news'], label: 'NEWS', colorVar: '--color-terminal-cyan' },
  { types: ['defense'], label: 'DEF', colorVar: '--color-terminal-red' },
  { types: ['finance'], label: 'FIN', colorVar: '--color-terminal-green' },
  { types: ['tech'], label: 'TECH', colorVar: '--color-terminal-magenta' },
];

function formatCoord(value: number, posLabel: string, negLabel: string): string {
  const abs = Math.abs(value).toFixed(1);
  return `${abs}°${value >= 0 ? posLabel : negLabel}`;
}

export function MapStatusBar({ events, viewport, dataSourceErrors }: MapStatusBarProps) {
  const counts = useMemo(() => {
    const map = new Map<MapEventType, number>();
    for (const ev of events) {
      map.set(ev.type, (map.get(ev.type) || 0) + 1);
    }
    return map;
  }, [events]);

  const zoomInfo = viewport ? ZOOM_CONFIGS[viewport.zoomLevel] : null;

  return (
    <div className="flex items-center justify-between px-1 py-0.5 border-t border-terminal-border text-[9px] shrink-0">
      {/* Event counts */}
      <div className="flex items-center gap-2">
        {STATUS_CONFIG.map(({ types, label, colorVar }) => {
          const count = types.reduce((sum, t) => sum + (counts.get(t) || 0), 0);
          return (
            <span key={label} className="text-terminal-primary-dim">
              <span style={{ color: `var(${colorVar})` }}>{label}</span>
              <span className="text-terminal-primary">:{count}</span>
            </span>
          );
        })}
      </div>

      {/* Data source errors */}
      {dataSourceErrors && dataSourceErrors.length > 0 && (
        <span className="text-terminal-red-dim" title={dataSourceErrors.join(', ')}>
          [{dataSourceErrors.length} SRC OFFLINE]
        </span>
      )}

      {/* Viewport info + legend */}
      <div className="flex items-center gap-2 text-terminal-primary-dim">
        {viewport && zoomInfo && (
          <>
            <span>
              Z:<span className="text-terminal-primary">{viewport.zoomLevel}</span>
            </span>
            {viewport.zoomLevel > 0 && (
              <span>
                CTR:<span className="text-terminal-primary">
                  {formatCoord(viewport.centerLat, 'N', 'S')}{' '}
                  {formatCoord(viewport.centerLon, 'E', 'W')}
                </span>
              </span>
            )}
            <span className="text-terminal-border">│</span>
          </>
        )}
        <span>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-0.5" style={{ backgroundColor: 'var(--color-terminal-amber)' }} />
          NAT
        </span>
        <span>
          <span className="inline-block w-1.5 h-1.5 mr-0.5" style={{ backgroundColor: 'var(--color-terminal-cyan)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          NEWS
        </span>
        <span>
          <span className="inline-block w-1.5 h-1.5 mr-0.5" style={{ backgroundColor: 'var(--color-terminal-red)', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          DEF
        </span>
        <span>
          <span className="inline-block w-1.5 h-1.5 mr-0.5" style={{ backgroundColor: 'var(--color-terminal-green)', borderRadius: '1px' }} />
          FIN
        </span>
        <span>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-0.5" style={{ backgroundColor: 'var(--color-terminal-magenta)' }} />
          TECH
        </span>
      </div>
    </div>
  );
}
