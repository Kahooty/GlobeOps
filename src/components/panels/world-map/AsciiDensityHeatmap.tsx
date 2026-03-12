/**
 * AsciiDensityHeatmap — Heatmap overlay for high-volume geographic data.
 *
 * Renders event density as a grid of ASCII block characters at varying
 * opacity levels: ░ → ▒ → ▓ → █
 *
 * Behavior by zoom level:
 *   Z:0-1: Coarse heatmap grid (fewer cells, broader coverage)
 *   Z:2:   Medium density grid
 *   Z:3+:  Fine grid — at Z:4+ individual markers take over in AsciiEventOverlay,
 *          so the heatmap fades to only show very dense clusters
 *
 * The heatmap uses event coordinates binned into a geographic grid.
 * Each cell's intensity is derived from count / maxCount.
 * Color reflects the dominant event type in that cell.
 */

import { useMemo, memo } from 'react';
import { lonLatToViewportPercent, type ViewportBounds } from './use-map-viewport';
import type { MapEvent, MapEventType } from '@/types';
import { EVENT_TYPE_REGISTRY } from '@/config/event-types';

interface AsciiDensityHeatmapProps {
  events: MapEvent[];
  enabledLayers: Set<MapEventType>;
  bounds: ViewportBounds;
  zoomLevel: number;
}

// ─── Grid resolution by zoom level ───

const GRID_SIZE: Record<number, number> = {
  0: 12,   // 12×6 cells at global view
  1: 16,   // 16×8
  2: 24,   // 24×12
  3: 32,   // 32×16
  4: 40,   // 40×20
  5: 48,   // 48×24
};

// Minimum events in a cell to render
const MIN_COUNT_THRESHOLD: Record<number, number> = {
  0: 2,
  1: 2,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

// Block characters by intensity tier
const BLOCK_CHARS = ['░', '▒', '▓', '█'];

// Font size by zoom — scales character to fill cell proportionally
const HEATMAP_FONT_SIZE: Record<number, string> = {
  0: '22px',
  1: '18px',
  2: '14px',
  3: '10px',
  4: '8px',
  5: '7px',
};

interface HeatmapCell {
  col: number;
  row: number;
  centerLon: number;
  centerLat: number;
  count: number;
  intensity: number; // 0-3
  dominantType: MapEventType;
  colorVar: string;
}

function computeHeatmap(
  events: MapEvent[],
  bounds: ViewportBounds,
  zoomLevel: number,
): HeatmapCell[] {
  const cols = GRID_SIZE[zoomLevel] ?? 24;
  const rows = Math.ceil(cols / 2); // 2:1 aspect ratio
  const minCount = MIN_COUNT_THRESHOLD[zoomLevel] ?? 2;

  const lonRange = bounds.lonMax - bounds.lonMin;
  const latRange = bounds.latMax - bounds.latMin;

  // Bin events into grid cells
  const grid = new Map<string, { count: number; types: Map<MapEventType, number> }>();

  // Allow a small margin matching the event overlay's 2% buffer so
  // heatmap cells appear for events visible near viewport edges
  const lonMargin = lonRange * 0.02;
  const latMargin = latRange * 0.02;

  for (const event of events) {
    const [lon, lat] = event.coordinates;

    if (lon < bounds.lonMin - lonMargin || lon > bounds.lonMax + lonMargin) continue;
    if (lat < bounds.latMin - latMargin || lat > bounds.latMax + latMargin) continue;

    const col = Math.floor(((lon - bounds.lonMin) / lonRange) * cols);
    const row = Math.floor(((bounds.latMax - lat) / latRange) * rows);
    if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
    const key = `${col},${row}`;

    if (!grid.has(key)) {
      grid.set(key, { count: 0, types: new Map() });
    }
    const cell = grid.get(key)!;
    cell.count++;
    cell.types.set(event.type, (cell.types.get(event.type) ?? 0) + 1);
  }

  // Find max count for normalization
  let maxCount = 0;
  for (const cell of grid.values()) {
    if (cell.count > maxCount) maxCount = cell.count;
  }

  if (maxCount === 0) return [];

  // Build cell array
  const cells: HeatmapCell[] = [];
  for (const [key, cell] of grid) {
    if (cell.count < minCount) continue;

    const [colStr, rowStr] = key.split(',');
    const col = parseInt(colStr, 10);
    const row = parseInt(rowStr, 10);

    // Intensity tier (0-3)
    const ratio = cell.count / maxCount;
    const intensity = ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.25 ? 1 : 0;

    // Dominant type
    let dominantType: MapEventType = 'news';
    let maxTypeCount = 0;
    for (const [type, count] of cell.types) {
      if (count > maxTypeCount) {
        maxTypeCount = count;
        dominantType = type;
      }
    }

    const config = EVENT_TYPE_REGISTRY[dominantType];
    const colorVar = config?.colorVar ?? '--color-terminal-primary-dim';

    // Compute geographic center of this grid cell for precise positioning
    const centerLon = bounds.lonMin + ((col + 0.5) / cols) * lonRange;
    const centerLat = bounds.latMax - ((row + 0.5) / rows) * latRange;

    cells.push({ col, row, centerLon, centerLat, count: cell.count, intensity, dominantType, colorVar });
  }

  return cells;
}

// ─── Component ───

function AsciiDensityHeatmapInner({
  events,
  enabledLayers,
  bounds,
  zoomLevel,
}: AsciiDensityHeatmapProps) {
  // Filter events to enabled layers only
  const filteredEvents = useMemo(
    () => events.filter((e) => enabledLayers.has(e.type)),
    [events, enabledLayers],
  );

  // Compute heatmap grid
  const cells = useMemo(
    () => computeHeatmap(filteredEvents, bounds, zoomLevel),
    [filteredEvents, bounds, zoomLevel],
  );

  // Render cells — position each cell using lonLatToViewportPercent() so heatmap
  // cells align exactly with event markers from AsciiEventOverlay
  const cellElements = useMemo(() => {
    const cols = GRID_SIZE[zoomLevel] ?? 24;
    const rows = Math.ceil(cols / 2);
    const cellWidthPct = 100 / cols;
    const cellHeightPct = 100 / rows;

    // At higher zoom levels, reduce heatmap opacity since individual markers take over
    const baseOpacity = zoomLevel >= 4 ? 0.08 : zoomLevel >= 3 ? 0.12 : 0.18;

    return cells.map((cell) => {
      // Use the same projection function as event markers for consistent positioning
      const pos = lonLatToViewportPercent(cell.centerLon, cell.centerLat, bounds);
      if (!pos) return null;

      const opacity = baseOpacity + cell.intensity * 0.04;

      // Background fill opacity scales with intensity (8-20%)
      const bgOpacity = 2 + cell.intensity * 2;

      return (
        <div
          key={`hm-${cell.col}-${cell.row}`}
          className="absolute font-mono text-center select-none"
          style={{
            left: pos.left,
            top: pos.top,
            width: `${cellWidthPct}%`,
            height: `${cellHeightPct}%`,
            transform: 'translate(-50%, -50%)',
            color: `var(${cell.colorVar})`,
            opacity,
            fontSize: HEATMAP_FONT_SIZE[zoomLevel] ?? '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            backgroundColor: `color-mix(in srgb, var(${cell.colorVar}) ${bgOpacity}%, transparent)`,
            borderRadius: '1px',
            textShadow: `0 0 4px color-mix(in srgb, var(${cell.colorVar}) 12%, transparent)`,
          }}
        >
          {BLOCK_CHARS[cell.intensity]}
        </div>
      );
    }).filter(Boolean);
  }, [cells, zoomLevel, bounds]);

  if (cellElements.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      style={{ pointerEvents: 'none', zIndex: 2 }}
    >
      {cellElements}
    </div>
  );
}

export const AsciiDensityHeatmap = memo(AsciiDensityHeatmapInner);
