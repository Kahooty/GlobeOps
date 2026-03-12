/**
 * AsciiBoundaryLayer — SVG overlay rendering geographic boundary lines.
 *
 * Progressive detail by zoom level:
 *   Z:0   Continental outlines (very faint)
 *   Z:1   Continental outlines (slightly brighter)
 *   Z:2   Continental + sub-regional dividers
 *   Z:3   Sub-regional + country borders
 *   Z:4-5 Country borders (prominent)
 *
 * Lines use `var(--color-terminal-primary)` for theme responsiveness.
 * Region hover/select interaction brightens matching boundaries.
 */

import { useMemo, memo } from 'react';
import type { ViewportBounds } from './use-map-viewport';
import type { Region } from '@/types';
import { getVisibleBoundaries, type BoundaryLine, type BoundaryLevel } from '@/utils/world-map-boundaries';

interface AsciiBoundaryLayerProps {
  bounds: ViewportBounds;
  zoomLevel: number;
  hoveredRegion: Region | null;
  selectedRegion: Region | null;
}

// ─── Visual config by level and zoom ───

interface LevelStyle {
  opacity: number;
  strokeWidth: number;
  dashed: boolean;
}

function getLevelStyle(level: BoundaryLevel, zoom: number, isHighlighted: boolean): LevelStyle {
  const highlight = isHighlighted ? 0.25 : 0;

  if (level === 'continent') {
    if (zoom <= 0) return { opacity: 0.08 + highlight, strokeWidth: 0.2, dashed: false };
    if (zoom <= 1) return { opacity: 0.12 + highlight, strokeWidth: 0.25, dashed: false };
    if (zoom <= 2) return { opacity: 0.15 + highlight, strokeWidth: 0.3, dashed: false };
    return { opacity: 0.12 + highlight, strokeWidth: 0.25, dashed: false };
  }

  if (level === 'sub-region') {
    if (zoom <= 2) return { opacity: 0.10 + highlight, strokeWidth: 0.2, dashed: true };
    return { opacity: 0.12 + highlight, strokeWidth: 0.2, dashed: true };
  }

  // country
  if (zoom <= 3) return { opacity: 0.12 + highlight, strokeWidth: 0.25, dashed: false };
  if (zoom <= 4) return { opacity: 0.18 + highlight, strokeWidth: 0.3, dashed: false };
  return { opacity: 0.22 + highlight, strokeWidth: 0.35, dashed: false };
}

// ─── Component ───

export const AsciiBoundaryLayer = memo(function AsciiBoundaryLayer({
  bounds,
  zoomLevel,
  hoveredRegion,
  selectedRegion,
}: AsciiBoundaryLayerProps) {
  const { lonMin, lonMax, latMin, latMax } = bounds;
  const lonRange = lonMax - lonMin;
  const latRange = latMax - latMin;

  // Get visible boundaries for current viewport
  const visibleBoundaries = useMemo(
    () => getVisibleBoundaries(lonMin, lonMax, latMin, latMax, zoomLevel),
    [lonMin, lonMax, latMin, latMax, zoomLevel],
  );

  // Build SVG paths
  const paths = useMemo(() => {
    return visibleBoundaries.map((boundary) => {
      const points: { x: number; y: number }[] = [];

      for (const [lon, lat] of boundary.polyline) {
        const x = ((lon - lonMin) / lonRange) * 100;
        const y = ((latMax - lat) / latRange) * 100;
        points.push({ x, y });
      }

      // Skip boundaries where all points are far outside viewport
      const hasVisiblePoint = points.some(
        (p) => p.x > -50 && p.x < 150 && p.y > -50 && p.y < 150,
      );
      if (!hasVisiblePoint || points.length < 2) return null;

      // Build SVG path data
      const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');

      // Close continental outlines
      const closePath = boundary.level === 'continent' || boundary.level === 'country';

      return {
        boundary,
        pathData: closePath ? pathData + ' Z' : pathData,
      };
    }).filter(Boolean) as Array<{ boundary: BoundaryLine; pathData: string }>;
  }, [visibleBoundaries, lonMin, lonMax, latMin, latMax, lonRange, latRange]);

  if (paths.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* SVG filter for subtle glow */}
      <defs>
        <filter id="boundary-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
        </filter>
      </defs>

      {paths.map(({ boundary, pathData }) => {
        const isHighlighted =
          (hoveredRegion && boundary.region === hoveredRegion) ||
          (selectedRegion && boundary.region === selectedRegion) ||
          false;

        const style = getLevelStyle(boundary.level, zoomLevel, isHighlighted);

        return (
          <path
            key={boundary.id}
            d={pathData}
            fill="none"
            stroke="var(--color-terminal-primary)"
            strokeWidth={style.strokeWidth}
            strokeOpacity={style.opacity}
            strokeDasharray={style.dashed ? '1.5 1' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={isHighlighted ? 'url(#boundary-glow)' : undefined}
          />
        );
      })}
    </svg>
  );
});
