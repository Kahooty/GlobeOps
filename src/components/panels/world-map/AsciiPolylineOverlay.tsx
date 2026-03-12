/**
 * AsciiPolylineOverlay — Animated polyline overlay for dynamic routes.
 *
 * Renders connected ASCII line-drawing characters for:
 *   - Displacement flows (humanitarian corridors, refugee routes)
 *   - Active conflict zone boundaries
 *   - Dynamic trade disruption paths
 *
 * Unlike the static pipelines/trade routes in AsciiStaticOverlay, these
 * polylines are derived from live event data and can be animated with
 * directional flow indicators (dashes/arrows).
 *
 * At Z:0-1: simplified dashed lines
 * At Z:2+: arrows and labels
 * At Z:3+: animated flow direction
 */

import { useMemo, memo } from 'react';
import { lonLatToViewportPercent } from './use-map-viewport';
import type { ViewportBounds } from './use-map-viewport';
import type { MapEvent, MapEventType } from '@/types';
import { EVENT_TYPE_REGISTRY } from '@/config/event-types';

interface AsciiPolylineOverlayProps {
  events: MapEvent[];
  enabledLayers: Set<MapEventType>;
  bounds: ViewportBounds;
  zoomLevel: number;
}

interface RouteSegment {
  id: string;
  waypoints: [number, number][];
  type: MapEventType;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// ─── Route extraction from displacement/conflict events ───

/**
 * Group displacement events into approximate flow routes.
 * Events with similar regions and close timestamps suggest corridors.
 */
function extractRoutes(events: MapEvent[]): RouteSegment[] {
  // Filter to displacement and conflict events that have coordinate pairs
  const flowEvents = events.filter(
    (e) => e.type === 'displacement-flow' || e.type === 'armed-conflict',
  );

  if (flowEvents.length < 2) return [];

  // Group by region and sort by time
  const regionGroups = new Map<string, MapEvent[]>();
  for (const e of flowEvents) {
    const region = e.region ?? 'UNKNOWN';
    if (!regionGroups.has(region)) regionGroups.set(region, []);
    regionGroups.get(region)!.push(e);
  }

  const routes: RouteSegment[] = [];

  for (const [region, group] of regionGroups) {
    if (group.length < 2) continue;

    // Sort by timestamp, take up to 8 points for a route
    const sorted = group
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(0, 8);

    const waypoints: [number, number][] = sorted.map((e) => e.coordinates);
    const dominantSeverity = sorted.some((e) => e.severity === 'critical')
      ? 'critical'
      : sorted.some((e) => e.severity === 'high')
        ? 'high'
        : 'medium';

    routes.push({
      id: `route-${region}-${sorted[0].id}`,
      waypoints,
      type: sorted[0].type,
      label: region.slice(0, 12),
      severity: dominantSeverity,
    });
  }

  return routes;
}

// ─── SVG Polyline with animated dash ───

function AnimatedPolyline({
  waypoints,
  bounds,
  colorVar,
  dashed,
  animated,
  opacity = 0.4,
  label,
  showLabel,
}: {
  waypoints: [number, number][];
  bounds: ViewportBounds;
  colorVar: string;
  dashed: boolean;
  animated: boolean;
  opacity?: number;
  label?: string;
  showLabel: boolean;
}) {
  const lonRange = bounds.lonMax - bounds.lonMin;
  const latRange = bounds.latMax - bounds.latMin;

  // Convert waypoints to SVG percentage coordinates
  const points: { x: number; y: number }[] = [];
  for (const [lon, lat] of waypoints) {
    const pos = lonLatToViewportPercent(lon, lat, bounds);
    if (pos) {
      points.push({
        x: ((lon - bounds.lonMin) / lonRange) * 100,
        y: ((bounds.latMax - lat) / latRange) * 100,
      });
    }
  }

  if (points.length < 2) return null;

  // Build SVG path
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Arrow at last segment
  const lastPt = points[points.length - 1];
  const prevPt = points[points.length - 2];
  const angle = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x) * (180 / Math.PI);

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', zIndex: 3, overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Main path */}
        <path
          d={pathData}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth="0.4"
          strokeOpacity={opacity}
          strokeDasharray={dashed ? '2 1.5' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={animated ? {
            animation: 'polyline-flow 3s linear infinite',
          } : undefined}
        />

        {/* Direction arrow at endpoint */}
        <g transform={`translate(${lastPt.x}, ${lastPt.y}) rotate(${angle})`}>
          <polygon
            points="0,-0.4 1,0 0,0.4"
            fill={`var(${colorVar})`}
            fillOpacity={opacity + 0.1}
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
        </g>
      </svg>

      {/* Label at midpoint */}
      {showLabel && label && points.length >= 2 && (
        <div
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: `${points[Math.floor(points.length / 2)].x}%`,
            top: `${points[Math.floor(points.length / 2)].y}%`,
            transform: 'translate(-50%, -120%)',
            color: `var(${colorVar})`,
            fontSize: '7px',
            opacity: opacity + 0.1,
            pointerEvents: 'none',
            zIndex: 3,
            textShadow: `0 0 4px color-mix(in srgb, var(${colorVar}) 30%, transparent)`,
          }}
        >
          → {label}
        </div>
      )}
    </>
  );
}

// ─── Main Component ───

function AsciiPolylineOverlayInner({
  events,
  enabledLayers,
  bounds,
  zoomLevel,
}: AsciiPolylineOverlayProps) {
  // Extract route segments from displacement/conflict events
  const routes = useMemo(() => {
    const displacementEnabled = enabledLayers.has('displacement-flow');
    const conflictEnabled = enabledLayers.has('armed-conflict');

    if (!displacementEnabled && !conflictEnabled) return [];

    const filteredEvents = events.filter((e) => {
      if (e.type === 'displacement-flow' && displacementEnabled) return true;
      if (e.type === 'armed-conflict' && conflictEnabled) return true;
      return false;
    });

    return extractRoutes(filteredEvents);
  }, [events, enabledLayers]);

  // Render route polylines
  const routeElements = useMemo(() => {
    return routes.map((route) => {
      const config = EVENT_TYPE_REGISTRY[route.type];
      const colorVar = route.severity === 'critical'
        ? '--color-terminal-red'
        : route.severity === 'high'
          ? '--color-terminal-amber'
          : config?.colorVar ?? '--color-terminal-primary-dim';

      return (
        <AnimatedPolyline
          key={route.id}
          waypoints={route.waypoints}
          bounds={bounds}
          colorVar={colorVar}
          dashed={zoomLevel < 2}
          animated={zoomLevel >= 3}
          opacity={route.severity === 'critical' ? 0.5 : 0.35}
          label={route.label}
          showLabel={zoomLevel >= 2}
        />
      );
    });
  }, [routes, bounds, zoomLevel]);

  if (routeElements.length === 0) return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 3 }}>
      {routeElements}
    </div>
  );
}

export const AsciiPolylineOverlay = memo(AsciiPolylineOverlayInner);
