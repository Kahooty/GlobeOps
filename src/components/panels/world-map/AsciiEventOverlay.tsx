/**
 * AsciiEventOverlay — Orchestrates ASCII event markers on the map.
 *
 * Uses the overlay-classifier to determine visual treatment for each event
 * or cluster, routing to the appropriate component:
 *   - AsciiPulseMarker: dots with pulse rings (Z:0-1 singles)
 *   - AsciiDensityGlyph: compact count badges (Z:0-1 clusters)
 *   - AsciiEventFlag: text labels with sub-type labels (Z:2+ singles)
 *   - AsciiDangerFlag: box/banner/wire variants (Z:2+ critical)
 *   - AsciiActivityCluster: inline log (3-5 event clusters at Z:2-3)
 *   - AsciiEventZone: bordered zones (6+ event clusters)
 *   - AsciiAmbientLayer: region labels, grid refs, strategic markers
 *
 * Also renders edge indicators for off-screen events at Z:1+.
 */

import { useMemo, useCallback } from 'react';
import { AsciiPulseMarker } from './AsciiPulseMarker';
import { AsciiDensityGlyph } from './AsciiDensityGlyph';
import { AsciiEventFlag } from './AsciiEventFlag';
import { AsciiDangerFlag } from './AsciiDangerFlag';
import { AsciiActivityCluster } from './AsciiActivityCluster';
import { AsciiEventZone } from './AsciiEventZone';
import { AsciiAmbientLayer } from './AsciiAmbientLayer';
import { lonLatToViewportPercent } from './use-map-viewport';
import {
  classifySingleEvent,
  classifyCluster,
  getDominantType,
} from './overlay-classifier';
import type { ViewportBounds } from './use-map-viewport';
import type { MapEvent, MapEventType } from '@/types';

interface AsciiEventOverlayProps {
  events: MapEvent[];
  enabledLayers: Set<MapEventType>;
  bounds: ViewportBounds;
  zoomLevel: number;
  onEventHover: (event: MapEvent | MapEvent[] | null, mousePos: { x: number; y: number }) => void;
  onEventClick: (event: MapEvent) => void;
}

interface Cluster {
  events: MapEvent[];
  lon: number;
  lat: number;
}

// ─── Performance limits ───

const MAX_OVERLAY_ELEMENTS: Record<number, number> = {
  0: 50,
  1: 60,
  2: 80,
  3: 120,
  4: 200,
  5: 300,
};

// ─── Clustering ───

const CLUSTER_CELL_SIZE: Record<number, number> = {
  0: 20,
  1: 12,
  2: 6,
  3: 4,
  4: 2.5,
  5: 2,
};

function clusterEvents(events: MapEvent[], zoomLevel: number): Cluster[] {
  const cellSize = CLUSTER_CELL_SIZE[zoomLevel] ?? 4;

  const grid = new Map<string, MapEvent[]>();

  for (const ev of events) {
    const [lon, lat] = ev.coordinates;
    const cx = Math.floor(((lon + 180) / 360) * (100 / cellSize));
    const cy = Math.floor(((90 - lat) / 180) * (100 / cellSize));
    const key = `${cx},${cy}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(ev);
  }

  return Array.from(grid.values()).map((clusterEvents) => {
    const avgLon = clusterEvents.reduce((s, e) => s + e.coordinates[0], 0) / clusterEvents.length;
    const avgLat = clusterEvents.reduce((s, e) => s + e.coordinates[1], 0) / clusterEvents.length;
    return { events: clusterEvents, lon: avgLon, lat: avgLat };
  });
}

// ─── Edge indicator ───

interface EdgeCounts {
  north: number;
  south: number;
  east: number;
  west: number;
}

function computeEdgeCounts(events: MapEvent[], bounds: ViewportBounds): EdgeCounts {
  const counts: EdgeCounts = { north: 0, south: 0, east: 0, west: 0 };

  for (const e of events) {
    const [lon, lat] = e.coordinates;
    const inLon = lon >= bounds.lonMin && lon <= bounds.lonMax;
    const inLat = lat >= bounds.latMin && lat <= bounds.latMax;

    if (inLon && inLat) continue;

    if (lat > bounds.latMax) counts.north++;
    if (lat < bounds.latMin) counts.south++;
    if (lon < bounds.lonMin) counts.west++;
    if (lon > bounds.lonMax) counts.east++;
  }

  return counts;
}

function EdgeIndicator({ position, count }: { position: 'north' | 'south' | 'east' | 'west'; count: number }) {
  if (count === 0) return null;

  const arrows: Record<string, string> = { north: '▲', south: '▼', east: '►', west: '◄' };
  const label = `${arrows[position]} ${count}`;

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 50,
    fontFamily: 'monospace',
    fontSize: '8px',
    lineHeight: '1',
    letterSpacing: '0.5px',
    color: 'var(--color-terminal-primary-dim)',
    textShadow: '0 0 4px color-mix(in srgb, var(--color-terminal-primary) 20%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--color-terminal-bg-panel) 80%, transparent)',
    padding: '1px 4px',
    borderRadius: '1px',
  };

  if (position === 'north') {
    Object.assign(posStyle, { top: '2px', left: '50%', transform: 'translateX(-50%)' });
  } else if (position === 'south') {
    Object.assign(posStyle, { bottom: '2px', left: '50%', transform: 'translateX(-50%)' });
  } else if (position === 'west') {
    Object.assign(posStyle, { left: '2px', top: '50%', transform: 'translateY(-50%)' });
  } else {
    Object.assign(posStyle, { right: '2px', top: '50%', transform: 'translateY(-50%)' });
  }

  return <div style={posStyle}>{label}</div>;
}

// ─── Main component ───

export function AsciiEventOverlay({
  events,
  enabledLayers,
  bounds,
  zoomLevel,
  onEventHover,
  onEventClick,
}: AsciiEventOverlayProps) {
  // Filter by enabled layers
  const filtered = useMemo(
    () => events.filter((e) => enabledLayers.has(e.type)),
    [events, enabledLayers],
  );

  // Split into viewport-visible and off-screen events
  const { visible, edgeCounts } = useMemo(() => {
    const lonRange = bounds.lonMax - bounds.lonMin;
    const latRange = bounds.latMax - bounds.latMin;
    const margin = 0.05;

    const vis = filtered.filter((e) => {
      const [lon, lat] = e.coordinates;
      if (lon < bounds.lonMin - lonRange * margin || lon > bounds.lonMax + lonRange * margin) return false;
      if (lat < bounds.latMin - latRange * margin || lat > bounds.latMax + latRange * margin) return false;
      return true;
    });

    const edges = zoomLevel >= 1 ? computeEdgeCounts(filtered, bounds) : { north: 0, south: 0, east: 0, west: 0 };

    return { visible: vis, edgeCounts: edges };
  }, [filtered, bounds, zoomLevel]);

  // Cluster visible events
  const clusters = useMemo(() => clusterEvents(visible, zoomLevel), [visible, zoomLevel]);

  // Performance cap
  const maxElements = MAX_OVERLAY_ELEMENTS[zoomLevel] ?? 100;

  // ─── Hover helpers ───
  const makeHoverHandler = useCallback(
    (eventsInCluster: MapEvent[]) => (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).closest('.map-container')?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0);
      const y = e.clientY - (rect?.top ?? 0);
      if (eventsInCluster.length === 1) {
        onEventHover(eventsInCluster[0], { x, y });
      } else {
        onEventHover(eventsInCluster, { x, y });
      }
    },
    [onEventHover],
  );

  const handleMouseLeave = useCallback(() => {
    onEventHover(null, { x: 0, y: 0 });
  }, [onEventHover]);

  // ─── Render clusters via classifier ───

  let elementCount = 0;

  const overlayElements = clusters.flatMap((cluster, idx) => {
    if (elementCount >= maxElements) return [];

    const pos = lonLatToViewportPercent(cluster.lon, cluster.lat, bounds);
    if (!pos) return [];

    const { left, top } = pos;
    const hoverHandler = makeHoverHandler(cluster.events);

    // ─── Single event ───
    if (cluster.events.length === 1) {
      elementCount++;
      const event = cluster.events[0];
      const treatment = classifySingleEvent(event, zoomLevel);

      switch (treatment.kind) {
        case 'pulse-marker':
          return (
            <AsciiPulseMarker
              key={event.id}
              event={event}
              left={left}
              top={top}
              zoomLevel={zoomLevel}
              colorVar={treatment.colorVar}
              intensity={treatment.intensity}
              animated={treatment.animated}
              onMouseEnter={hoverHandler}
              onMouseLeave={handleMouseLeave}
              onClick={() => onEventClick(event)}
            />
          );

        case 'danger-box':
        case 'danger-banner':
        case 'danger-wire':
          return (
            <AsciiDangerFlag
              key={event.id}
              event={event}
              left={left}
              top={top}
              zoomLevel={zoomLevel}
              variant={treatment.dangerVariant ?? 'box'}
              onMouseEnter={hoverHandler}
              onMouseLeave={handleMouseLeave}
              onClick={() => onEventClick(event)}
            />
          );

        default:
          return (
            <AsciiEventFlag
              key={event.id}
              event={event}
              left={left}
              top={top}
              zoomLevel={zoomLevel}
              onMouseEnter={hoverHandler}
              onMouseLeave={handleMouseLeave}
              onClick={() => onEventClick(event)}
            />
          );
      }
    }

    // ─── Multi-event cluster ───
    const treatment = classifyCluster(cluster.events, zoomLevel);

    switch (treatment.kind) {
      // Break into individual flags
      case 'individual-flags': {
        const elements: React.ReactNode[] = [];
        for (const event of cluster.events) {
          if (elementCount >= maxElements) break;
          elementCount++;

          const ePos = lonLatToViewportPercent(event.coordinates[0], event.coordinates[1], bounds);
          if (!ePos) continue;

          const singleTreatment = classifySingleEvent(event, zoomLevel);

          if (singleTreatment.kind === 'pulse-marker') {
            elements.push(
              <AsciiPulseMarker
                key={event.id}
                event={event}
                left={ePos.left}
                top={ePos.top}
                zoomLevel={zoomLevel}
                colorVar={singleTreatment.colorVar}
                intensity={singleTreatment.intensity}
                animated={singleTreatment.animated}
                onMouseEnter={makeHoverHandler([event])}
                onMouseLeave={handleMouseLeave}
                onClick={() => onEventClick(event)}
              />,
            );
          } else if (singleTreatment.kind.startsWith('danger-')) {
            elements.push(
              <AsciiDangerFlag
                key={event.id}
                event={event}
                left={ePos.left}
                top={ePos.top}
                zoomLevel={zoomLevel}
                variant={singleTreatment.dangerVariant ?? 'box'}
                onMouseEnter={makeHoverHandler([event])}
                onMouseLeave={handleMouseLeave}
                onClick={() => onEventClick(event)}
              />,
            );
          } else {
            elements.push(
              <AsciiEventFlag
                key={event.id}
                event={event}
                left={ePos.left}
                top={ePos.top}
                zoomLevel={zoomLevel}
                onMouseEnter={makeHoverHandler([event])}
                onMouseLeave={handleMouseLeave}
                onClick={() => onEventClick(event)}
              />,
            );
          }
        }
        return elements;
      }

      // Density glyph (Z:0-1 clusters)
      case 'density-glyph': {
        elementCount++;
        const dominantType = getDominantType(cluster.events);
        return (
          <AsciiDensityGlyph
            key={`density-${idx}`}
            events={cluster.events}
            dominantType={dominantType}
            left={left}
            top={top}
            colorVar={treatment.colorVar}
            animated={treatment.animated}
            onMouseEnter={hoverHandler}
            onMouseLeave={handleMouseLeave}
            onClick={() => onEventClick(cluster.events[0])}
          />
        );
      }

      // Activity cluster (3-5 events at Z:2-3)
      case 'activity-cluster': {
        elementCount++;
        return (
          <AsciiActivityCluster
            key={`activity-${idx}`}
            events={cluster.events}
            left={left}
            top={top}
            zoomLevel={zoomLevel}
            colorVar={treatment.colorVar}
            label={treatment.label}
            animated={treatment.animated}
            onMouseEnter={hoverHandler}
            onMouseLeave={handleMouseLeave}
            onClick={() => onEventClick(cluster.events[0])}
          />
        );
      }

      // Event zone (6+ events)
      case 'event-zone': {
        elementCount++;
        const dominantType = getDominantType(cluster.events);

        // Compute zone bounding box in viewport percent
        const lons = cluster.events.map((e) => e.coordinates[0]);
        const lats = cluster.events.map((e) => e.coordinates[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const topLeft = lonLatToViewportPercent(minLon, maxLat, bounds);
        const bottomRight = lonLatToViewportPercent(maxLon, minLat, bounds);

        if (topLeft && bottomRight) {
          const leftPct = parseFloat(topLeft.left);
          const topPct = parseFloat(topLeft.top);
          const rightPct = parseFloat(bottomRight.left);
          const bottomPct = parseFloat(bottomRight.top);
          // Zoom-adaptive minimum zone sizes — larger at global view, tighter when zoomed
          const minWidth = zoomLevel <= 1 ? 6 : zoomLevel <= 3 ? 4 : 3;
          const minHeight = zoomLevel <= 1 ? 8 : zoomLevel <= 3 ? 5 : 4;

          const rawWidth = rightPct - leftPct;
          const rawHeight = bottomPct - topPct;
          const widthPct = Math.max(rawWidth, minWidth);
          const heightPct = Math.max(rawHeight, minHeight);

          // Symmetric padding around the zone
          const padH = 1;   // 1% horizontal padding per side
          const padV = 1.5; // 1.5% vertical padding per side

          // When minimum size is enforced, center on cluster centroid
          // instead of anchoring at the bounding box top-left
          let zoneCenterLeft: number;
          let zoneCenterTop: number;

          if (rawWidth < minWidth || rawHeight < minHeight) {
            // Use cluster centroid for tight clusters
            const centroidPos = lonLatToViewportPercent(cluster.lon, cluster.lat, bounds);
            if (!centroidPos) return [];
            zoneCenterLeft = parseFloat(centroidPos.left);
            zoneCenterTop = parseFloat(centroidPos.top);
          } else {
            // Use bounding box center for spread-out clusters
            zoneCenterLeft = (leftPct + rightPct) / 2;
            zoneCenterTop = (topPct + bottomPct) / 2;
          }

          // Position zone centered on the computed center point
          const totalWidth = widthPct + padH * 2;
          const totalHeight = heightPct + padV * 2;
          const finalLeft = zoneCenterLeft - totalWidth / 2;
          const finalTop = zoneCenterTop - totalHeight / 2;

          return (
            <AsciiEventZone
              key={`zone-${idx}`}
              events={cluster.events}
              dominantType={dominantType}
              left={`${finalLeft}%`}
              top={`${finalTop}%`}
              width={`${totalWidth}%`}
              height={`${totalHeight}%`}
              variant={treatment.zoneVariant ?? 'single-type'}
              zoneLabel={treatment.zoneLabel ?? treatment.label}
              onMouseEnter={hoverHandler}
              onMouseLeave={handleMouseLeave}
              onClick={() => onEventClick(cluster.events[0])}
            />
          );
        }

        return [];
      }

      default:
        return [];
    }
  });

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {/* Ambient layer (region labels, grid refs, strategic markers) */}
      <AsciiAmbientLayer bounds={bounds} zoomLevel={zoomLevel} />

      {/* Event overlays */}
      {overlayElements}

      {/* Off-screen edge indicators (only when zoomed in) */}
      {zoomLevel >= 1 && (
        <>
          <EdgeIndicator position="north" count={edgeCounts.north} />
          <EdgeIndicator position="south" count={edgeCounts.south} />
          <EdgeIndicator position="east" count={edgeCounts.east} />
          <EdgeIndicator position="west" count={edgeCounts.west} />
        </>
      )}
    </div>
  );
}
