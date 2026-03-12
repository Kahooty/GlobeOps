/**
 * AsciiStaticOverlay — Renders static infrastructure data on the ASCII map.
 *
 * Renders non-real-time datasets as positioned markers:
 *   - Military bases: ▣ markers (Z:3+, labels at Z:4+)
 *   - Nuclear sites: ⊛ markers (Z:3+)
 *   - Pipelines: connected ═ chars along polylines (Z:3+)
 *   - Data centers: ◈ markers (Z:4+)
 *   - Trade routes: dashed lines (Z:2+)
 *   - Strategic waterways: ◊ markers (Z:3+)
 *
 * Respects the layer toggle system — only renders enabled types.
 * All elements are non-interactive (pointer-events: none) to avoid
 * conflicting with the event overlay's click/hover handlers.
 */

import { useMemo, memo } from 'react';
import { lonLatToViewportPercent } from './use-map-viewport';
import type { ViewportBounds } from './use-map-viewport';
import type { MapEventType } from '@/types';
import { EVENT_TYPE_REGISTRY } from '@/config/event-types';
import { getBasesAtZoom } from '@/data/military-bases';
import { getSitesAtZoom } from '@/data/nuclear-sites';
import { getPipelinesAtZoom } from '@/data/pipelines';
import { getDataCentersAtZoom } from '@/data/data-centers';
import { getTradeRoutesAtZoom, getWaterwaysAtZoom } from '@/data/trade-routes';

interface AsciiStaticOverlayProps {
  bounds: ViewportBounds;
  zoomLevel: number;
  enabledLayers: Set<MapEventType>;
}

// ─── Point Marker Component ───

function StaticMarker({
  lon, lat, bounds, symbol, colorVar, label, showLabel, opacity = 0.5,
}: {
  lon: number;
  lat: number;
  bounds: ViewportBounds;
  symbol: string;
  colorVar: string;
  label?: string;
  showLabel: boolean;
  opacity?: number;
}) {
  const pos = lonLatToViewportPercent(lon, lat, bounds);
  if (!pos) return null;

  return (
    <div
      className="absolute font-mono whitespace-nowrap"
      style={{
        left: pos.left,
        top: pos.top,
        transform: 'translate(-50%, -50%)',
        color: `var(${colorVar})`,
        fontSize: '8px',
        opacity,
        pointerEvents: 'none',
        zIndex: 3,
        textShadow: `0 0 4px color-mix(in srgb, var(${colorVar}) 20%, transparent)`,
      }}
    >
      {symbol}{showLabel && label ? ` ${label}` : ''}
    </div>
  );
}

// ─── Polyline Component (pipelines, trade routes) ───

function StaticPolyline({
  waypoints, bounds, colorVar, dashed = false, opacity = 0.3,
}: {
  waypoints: [number, number][];
  bounds: ViewportBounds;
  colorVar: string;
  dashed?: boolean;
  opacity?: number;
}) {
  // Convert waypoints to viewport percentages, connect visible segments
  const segments: Array<{ x1: string; y1: string; x2: string; y2: string }> = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = lonLatToViewportPercent(waypoints[i][0], waypoints[i][1], bounds);
    const p2 = lonLatToViewportPercent(waypoints[i + 1][0], waypoints[i + 1][1], bounds);
    if (p1 && p2) {
      segments.push({ x1: p1.left, y1: p1.top, x2: p2.left, y2: p2.top });
    }
  }

  if (segments.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
    >
      {segments.map((seg, i) => (
        <line
          key={i}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke={`var(${colorVar})`}
          strokeWidth="1"
          strokeOpacity={opacity}
          strokeDasharray={dashed ? '4 3' : undefined}
        />
      ))}
    </svg>
  );
}

// ─── Main Component ───

function AsciiStaticOverlayInner({
  bounds,
  zoomLevel,
  enabledLayers,
}: AsciiStaticOverlayProps) {
  // ─── Military Bases ───
  const baseElements = useMemo(() => {
    if (!enabledLayers.has('military-base')) return [];
    const config = EVENT_TYPE_REGISTRY['military-base'];
    if (zoomLevel < config.minZoom) return [];

    const bases = getBasesAtZoom(zoomLevel);
    const showLabels = zoomLevel >= 4;

    return bases.map((base) => (
      <StaticMarker
        key={`base-${base.name}`}
        lon={base.coordinates[0]}
        lat={base.coordinates[1]}
        bounds={bounds}
        symbol={config.symbol}
        colorVar={config.colorVar}
        label={base.name}
        showLabel={showLabels}
        opacity={0.45}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // ─── Nuclear Sites ───
  const nuclearElements = useMemo(() => {
    if (!enabledLayers.has('nuclear-site')) return [];
    const config = EVENT_TYPE_REGISTRY['nuclear-site'];
    if (zoomLevel < config.minZoom) return [];

    const sites = getSitesAtZoom(zoomLevel);
    const showLabels = zoomLevel >= 4;

    return sites.map((site) => (
      <StaticMarker
        key={`nuc-${site.name}`}
        lon={site.coordinates[0]}
        lat={site.coordinates[1]}
        bounds={bounds}
        symbol={config.symbol}
        colorVar={
          site.type === 'weapons' ? '--color-terminal-red'
          : site.type === 'enrichment' ? '--color-terminal-amber'
          : config.colorVar
        }
        label={site.name}
        showLabel={showLabels}
        opacity={site.type === 'weapons' ? 0.55 : 0.4}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // ─── Pipelines ───
  const pipelineElements = useMemo(() => {
    if (!enabledLayers.has('pipeline')) return [];
    const config = EVENT_TYPE_REGISTRY['pipeline'];
    if (zoomLevel < config.minZoom) return [];

    const pipelines = getPipelinesAtZoom(zoomLevel);

    return pipelines.map((pipe) => (
      <StaticPolyline
        key={`pipe-${pipe.name}`}
        waypoints={pipe.waypoints}
        bounds={bounds}
        colorVar={
          pipe.type === 'oil' ? '--color-terminal-amber'
          : pipe.type === 'gas' ? '--color-terminal-cyan'
          : config.colorVar
        }
        dashed={pipe.status !== 'active'}
        opacity={pipe.status === 'disrupted' ? 0.5 : 0.3}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // ─── Data Centers ───
  const dcElements = useMemo(() => {
    if (!enabledLayers.has('data-center')) return [];
    const config = EVENT_TYPE_REGISTRY['data-center'];
    if (zoomLevel < config.minZoom) return [];

    const centers = getDataCentersAtZoom(zoomLevel);
    const showLabels = zoomLevel >= 5;

    return centers.map((dc) => (
      <StaticMarker
        key={`dc-${dc.name}`}
        lon={dc.coordinates[0]}
        lat={dc.coordinates[1]}
        bounds={bounds}
        symbol={config.symbol}
        colorVar={config.colorVar}
        label={dc.name}
        showLabel={showLabels}
        opacity={dc.type === 'hyperscaler' ? 0.45 : 0.35}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // ─── Trade Routes ───
  const tradeRouteElements = useMemo(() => {
    if (!enabledLayers.has('trade-route')) return [];
    const config = EVENT_TYPE_REGISTRY['trade-route'];
    if (zoomLevel < config.minZoom) return [];

    const routes = getTradeRoutesAtZoom(zoomLevel);

    return routes.map((route) => (
      <StaticPolyline
        key={`route-${route.id}`}
        waypoints={route.waypoints}
        bounds={bounds}
        colorVar={
          route.type === 'oil-tanker' ? '--color-terminal-amber'
          : route.type === 'lng' ? '--color-terminal-cyan'
          : '--color-terminal-blue'
        }
        dashed
        opacity={route.volume === 'high' ? 0.35 : 0.2}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // ─── Strategic Waterways ───
  const waterwayElements = useMemo(() => {
    if (!enabledLayers.has('strategic-waterway')) return [];
    const config = EVENT_TYPE_REGISTRY['strategic-waterway'];
    if (zoomLevel < config.minZoom) return [];

    const waterways = getWaterwaysAtZoom(zoomLevel);
    const showLabels = zoomLevel >= 4;

    return waterways.map((ww) => (
      <StaticMarker
        key={`ww-${ww.id}`}
        lon={ww.coordinates[0]}
        lat={ww.coordinates[1]}
        bounds={bounds}
        symbol="◊"
        colorVar={config.colorVar}
        label={showLabels ? ww.name : undefined}
        showLabel={showLabels}
        opacity={0.5}
      />
    ));
  }, [bounds, zoomLevel, enabledLayers]);

  // If nothing enabled, skip rendering
  const hasContent = baseElements.length > 0 || nuclearElements.length > 0 ||
    pipelineElements.length > 0 || dcElements.length > 0 ||
    tradeRouteElements.length > 0 || waterwayElements.length > 0;

  if (!hasContent) return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 2 }}>
      {tradeRouteElements}
      {pipelineElements}
      {waterwayElements}
      {baseElements}
      {nuclearElements}
      {dcElements}
    </div>
  );
}

export const AsciiStaticOverlay = memo(AsciiStaticOverlayInner);
