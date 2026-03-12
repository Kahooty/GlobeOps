/**
 * AsciiAmbientLayer — Non-interactive decorative overlays for the ASCII map.
 *
 * Renders ambient elements at progressive zoom levels:
 *   - Region labels: dim text at geographic centers (Z:0-2)
 *   - Country labels: country names at centroids (Z:2-3)
 *   - Sub-region labels: finer geographic names (Z:3+)
 *   - City labels: major cities by geopolitical significance (Z:2+)
 *   - Grid references: lon/lat markers along viewport edges (Z:2+)
 *   - Strategic markers: waterways, financial centers, tech hubs (Z:3+)
 *
 * All elements use very dim colors and pointer-events: none.
 */

import { useMemo } from 'react';
import { lonLatToViewportPercent } from './use-map-viewport';
import type { ViewportBounds } from './use-map-viewport';
import {
  STRATEGIC_MARKERS,
  SUB_REGION_LABELS,
  REGION_LABELS,
} from '@/config/strategic-markers';
import { COUNTRY_POLYGONS } from '@/utils/world-map-borders';
import { getCitiesAtZoom } from '@/config/city-data';

interface AsciiAmbientLayerProps {
  bounds: ViewportBounds;
  zoomLevel: number;
}

// ─── Strategic marker color by category ───

const MARKER_COLORS: Record<string, string> = {
  waterway:  '--color-terminal-cyan',
  financial: '--color-terminal-green',
  tech:      '--color-terminal-magenta',
};

// ─── Grid reference spacing by zoom level ───

const GRID_SPACING: Record<number, number> = {
  2: 30,    // every 30 degrees
  3: 15,    // every 15 degrees
  4: 10,    // every 10 degrees
  5: 5,     // every 5 degrees
};

function generateGridLines(bounds: ViewportBounds, zoomLevel: number): Array<{
  type: 'lon' | 'lat';
  value: number;
  label: string;
}> {
  const spacing = GRID_SPACING[zoomLevel];
  if (!spacing) return [];

  const lines: Array<{ type: 'lon' | 'lat'; value: number; label: string }> = [];

  // Longitude lines (vertical)
  const lonStart = Math.ceil(bounds.lonMin / spacing) * spacing;
  for (let lon = lonStart; lon <= bounds.lonMax; lon += spacing) {
    const absLon = Math.abs(lon);
    const dir = lon > 0 ? 'E' : lon < 0 ? 'W' : '';
    lines.push({ type: 'lon', value: lon, label: `${absLon}°${dir}` });
  }

  // Latitude lines (horizontal)
  const latStart = Math.ceil(bounds.latMin / spacing) * spacing;
  for (let lat = latStart; lat <= bounds.latMax; lat += spacing) {
    const absLat = Math.abs(lat);
    const dir = lat > 0 ? 'N' : lat < 0 ? 'S' : '';
    lines.push({ type: 'lat', value: lat, label: `${absLat}°${dir}` });
  }

  return lines;
}

export function AsciiAmbientLayer({ bounds, zoomLevel }: AsciiAmbientLayerProps) {
  // ─── Region labels (Z:0-2) ───
  const regionElements = useMemo(() => {
    if (zoomLevel > 2) return [];

    return REGION_LABELS.map((region) => {
      const pos = lonLatToViewportPercent(
        region.coordinates[0],
        region.coordinates[1],
        bounds,
      );
      if (!pos) return null;

      const label = zoomLevel <= 1 ? region.shortLabel : region.label;

      return (
        <div
          key={`region-${region.label}`}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
            color: 'var(--color-terminal-primary-dim)',
            fontSize: zoomLevel === 0 ? '7px' : '8px',
            opacity: 0.25,
            letterSpacing: '1px',
            textShadow: '0 0 4px color-mix(in srgb, var(--color-terminal-primary) 10%, transparent)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {label}
        </div>
      );
    }).filter(Boolean);
  }, [bounds, zoomLevel]);

  // ─── Sub-region labels (Z:3+) ───
  const subRegionElements = useMemo(() => {
    if (zoomLevel < 3) return [];

    return SUB_REGION_LABELS.filter((sr) => zoomLevel >= sr.minZoom).map((sr) => {
      const pos = lonLatToViewportPercent(
        sr.coordinates[0],
        sr.coordinates[1],
        bounds,
      );
      if (!pos) return null;

      const label = zoomLevel >= 4 ? sr.label : sr.shortLabel;

      return (
        <div
          key={`subregion-${sr.label}`}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
            color: 'var(--color-terminal-primary-dim)',
            fontSize: '7px',
            opacity: 0.2,
            letterSpacing: '0.8px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {label}
        </div>
      );
    }).filter(Boolean);
  }, [bounds, zoomLevel]);

  // ─── Country labels (Z:2-3) ───
  const countryElements = useMemo(() => {
    if (zoomLevel < 2 || zoomLevel > 3) return [];

    return COUNTRY_POLYGONS.map((country) => {
      const pos = lonLatToViewportPercent(
        country.labelCoordinates[0],
        country.labelCoordinates[1],
        bounds,
      );
      if (!pos) return null;

      return (
        <div
          key={`country-${country.code}`}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
            color: 'var(--color-terminal-primary-dim)',
            fontSize: zoomLevel === 2 ? '6px' : '7px',
            opacity: 0.2,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {zoomLevel === 2 ? country.code : country.name}
        </div>
      );
    }).filter(Boolean);
  }, [bounds, zoomLevel]);

  // ─── City labels (Z:2+) ───
  const cityElements = useMemo(() => {
    if (zoomLevel < 2) return [];

    const cities = getCitiesAtZoom(zoomLevel);

    return cities.map((city) => {
      const pos = lonLatToViewportPercent(
        city.coordinates[0],
        city.coordinates[1],
        bounds,
      );
      if (!pos) return null;

      const isCapital = city.isCapital;

      return (
        <div
          key={`city-${city.name}-${city.country}`}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
            color: isCapital
              ? 'var(--color-terminal-yellow)'
              : 'var(--color-terminal-primary-dim)',
            fontSize: zoomLevel <= 3 ? '6px' : '7px',
            opacity: isCapital ? 0.35 : 0.25,
            letterSpacing: '0.4px',
            textShadow: isCapital
              ? '0 0 3px color-mix(in srgb, var(--color-terminal-yellow) 15%, transparent)'
              : 'none',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {isCapital ? '★' : '·'}{' '}{city.name}
        </div>
      );
    }).filter(Boolean);
  }, [bounds, zoomLevel]);

  // ─── Strategic markers (Z:3+) ───
  const strategicElements = useMemo(() => {
    if (zoomLevel < 3) return [];

    return STRATEGIC_MARKERS.filter((m) => zoomLevel >= m.minZoom).map((marker) => {
      const pos = lonLatToViewportPercent(
        marker.coordinates[0],
        marker.coordinates[1],
        bounds,
      );
      if (!pos) return null;

      const colorVar = MARKER_COLORS[marker.category] || '--color-terminal-primary-dim';
      const label = zoomLevel >= 4 ? marker.label : marker.shortLabel;

      return (
        <div
          key={`strategic-${marker.id}`}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -50%)',
            color: `var(${colorVar})`,
            fontSize: '7px',
            opacity: 0.3,
            letterSpacing: '0.5px',
            textShadow: `0 0 4px color-mix(in srgb, var(${colorVar}) 15%, transparent)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {label}
        </div>
      );
    }).filter(Boolean);
  }, [bounds, zoomLevel]);

  // ─── Grid references (Z:2+) ───
  const gridElements = useMemo(() => {
    if (zoomLevel < 2) return [];

    const gridLines = generateGridLines(bounds, zoomLevel);
    const elements: React.ReactNode[] = [];

    for (const line of gridLines) {
      if (line.type === 'lon') {
        // Longitude → position along top edge
        const leftPct = ((line.value - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * 100;
        if (leftPct < 2 || leftPct > 98) continue;

        elements.push(
          <div
            key={`grid-lon-${line.value}`}
            className="absolute font-mono"
            style={{
              left: `${leftPct}%`,
              top: '2px',
              transform: 'translateX(-50%)',
              color: 'var(--color-terminal-primary-dim)',
              fontSize: '7px',
              opacity: 0.18,
              letterSpacing: '0.3px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {line.label}
          </div>,
        );
      } else {
        // Latitude → position along left edge
        const topPct = ((bounds.latMax - line.value) / (bounds.latMax - bounds.latMin)) * 100;
        if (topPct < 5 || topPct > 95) continue;

        elements.push(
          <div
            key={`grid-lat-${line.value}`}
            className="absolute font-mono"
            style={{
              left: '2px',
              top: `${topPct}%`,
              transform: 'translateY(-50%)',
              color: 'var(--color-terminal-primary-dim)',
              fontSize: '7px',
              opacity: 0.18,
              letterSpacing: '0.3px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {line.label}
          </div>,
        );
      }
    }

    return elements;
  }, [bounds, zoomLevel]);

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 1 }}>
      {regionElements}
      {countryElements}
      {subRegionElements}
      {cityElements}
      {strategicElements}
      {gridElements}
    </div>
  );
}
