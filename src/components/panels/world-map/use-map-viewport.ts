/**
 * useMapViewport — Manages geographic viewport state for the interactive ASCII map.
 *
 * Handles:
 *  - Zoom levels (0=global → 5=local) with geographic bounds computation
 *  - Pan state tracking (start position, CSS transform offset)
 *  - Coordinate transforms: lonLat ↔ viewport percent, lonLat ↔ cell
 *  - Edge clamping to prevent viewport exceeding world bounds
 *  - Cursor-centered zoom (geographic point under cursor stays fixed)
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { Region } from '@/types';

// ─── Types ───

export interface Viewport {
  centerLon: number; // -180..+180
  centerLat: number; // -90..+90
  zoomLevel: number; // 0..5
}

export interface ViewportBounds {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

export interface ZoomConfig {
  level: number;
  label: string;
  lonSpan: number;
  latSpan: number;
}

export interface PanState {
  startX: number;
  startY: number;
  startCenterLon: number;
  startCenterLat: number;
  startTime: number;
  hasMoved: boolean;
  /** Recent positions for velocity sampling (last ~100ms) */
  lastPositions: Array<{ x: number; y: number; t: number }>;
}

// ─── Zoom Level Configs ───
// Each level halves the geographic span. Grid stays 80×36 — the font auto-scales.
// Sub-pixel resolution (160×144) gives increasing detail at narrower geographic windows.

export const ZOOM_CONFIGS: ZoomConfig[] = [
  { level: 0, label: 'GLOBAL',      lonSpan: 360,   latSpan: 180   },
  { level: 1, label: 'HEMISPHERE',  lonSpan: 180,   latSpan: 90    },
  { level: 2, label: 'CONTINENTAL', lonSpan: 90,    latSpan: 45    },
  { level: 3, label: 'REGIONAL',    lonSpan: 45,    latSpan: 22.5  },
  { level: 4, label: 'NATIONAL',    lonSpan: 22.5,  latSpan: 11.25 },
  { level: 5, label: 'LOCAL',       lonSpan: 11.25, latSpan: 5.625 },
];

export const MIN_ZOOM = 0;
export const MAX_ZOOM = 5;

// Pan discrimination thresholds (exported for use in AsciiWorldMap)
export const PAN_MOVE_THRESHOLD = 8;   // px — movement beyond this = drag, not click
export const CLICK_TIME_THRESHOLD = 400; // ms — clicks longer than this = drag

// ─── Helpers ───

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp viewport center so edges don't exceed world bounds */
function clampCenter(
  centerLon: number,
  centerLat: number,
  config: ZoomConfig
): { lon: number; lat: number } {
  const halfLon = config.lonSpan / 2;
  const halfLat = config.latSpan / 2;

  // At global zoom (360° span), center must be 0,0
  if (config.lonSpan >= 360) {
    return { lon: 0, lat: 0 };
  }

  return {
    lon: clamp(centerLon, -180 + halfLon, 180 - halfLon),
    lat: clamp(centerLat, -90 + halfLat, 90 - halfLat),
  };
}

// ─── Coordinate Transforms ───

export function computeBounds(viewport: Viewport): ViewportBounds {
  const config = ZOOM_CONFIGS[viewport.zoomLevel];
  const halfLon = config.lonSpan / 2;
  const halfLat = config.latSpan / 2;

  return {
    lonMin: viewport.centerLon - halfLon,
    lonMax: viewport.centerLon + halfLon,
    latMin: viewport.centerLat - halfLat,
    latMax: viewport.centerLat + halfLat,
  };
}

/**
 * Convert lon/lat to viewport-relative percentage position.
 * Returns null if the point is outside the current viewport.
 */
export function lonLatToViewportPercent(
  lon: number,
  lat: number,
  bounds: ViewportBounds
): { left: string; top: string } | null {
  // Allow a margin outside bounds so markers near edges still show
  const margin = 0.02; // 2% buffer
  const lonRange = bounds.lonMax - bounds.lonMin;
  const latRange = bounds.latMax - bounds.latMin;

  const leftPct = ((lon - bounds.lonMin) / lonRange) * 100;
  const topPct = ((bounds.latMax - lat) / latRange) * 100;

  if (leftPct < -margin * 100 || leftPct > (1 + margin) * 100) return null;
  if (topPct < -margin * 100 || topPct > (1 + margin) * 100) return null;

  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
  };
}

/**
 * Convert cell position to lon/lat (center of the cell).
 */
export function cellToLonLat(
  col: number,
  row: number,
  gridCols: number,
  gridRows: number,
  bounds: ViewportBounds
): { lon: number; lat: number } {
  const lon = bounds.lonMin + ((col + 0.5) / gridCols) * (bounds.lonMax - bounds.lonMin);
  const lat = bounds.latMax - ((row + 0.5) / gridRows) * (bounds.latMax - bounds.latMin);
  return { lon, lat };
}

/**
 * Convert lon/lat to cell position. Returns null if outside grid bounds.
 */
export function lonLatToCell(
  lon: number,
  lat: number,
  gridCols: number,
  gridRows: number,
  bounds: ViewportBounds
): { col: number; row: number } | null {
  if (lon < bounds.lonMin || lon > bounds.lonMax || lat < bounds.latMin || lat > bounds.latMax) {
    return null;
  }
  const col = Math.floor(((lon - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * gridCols);
  const row = Math.floor(((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * gridRows);
  return {
    col: clamp(col, 0, gridCols - 1),
    row: clamp(row, 0, gridRows - 1),
  };
}

// ─── Region Bounds (for flyTo) ───

const REGION_CENTERS: Record<Region, { lon: number; lat: number; zoom: number }> = {
  'NORTH AMERICA': { lon: -100, lat: 45, zoom: 2 },
  'SOUTH AMERICA': { lon: -60, lat: -15, zoom: 2 },
  'EUROPE':        { lon: 15, lat: 50, zoom: 2 },
  'MIDDLE EAST':   { lon: 45, lat: 28, zoom: 2 },
  'AFRICA':        { lon: 20, lat: 5, zoom: 2 },
  'SOUTH ASIA':    { lon: 80, lat: 22, zoom: 2 },
  'EAST ASIA':     { lon: 115, lat: 35, zoom: 2 },
  'OCEANIA':       { lon: 140, lat: -25, zoom: 2 },
};

// ─── Hook ───

export function useMapViewport() {
  const [viewport, setViewport] = useState<Viewport>({
    centerLon: 0,
    centerLat: 0,
    zoomLevel: 0,
  });

  // Pan tracking (ref to avoid re-renders during drag)
  const panRef = useRef<PanState | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Current zoom config
  const zoomConfig = ZOOM_CONFIGS[viewport.zoomLevel];

  // Current viewport bounds
  const bounds = useMemo(() => computeBounds(viewport), [viewport]);

  // Momentum animation ref (declared early so zoom/pan functions can reference it)
  const momentumRef = useRef<number | null>(null);

  const cancelMomentum = useCallback(() => {
    if (momentumRef.current !== null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  // ─── Zoom ───

  const zoomIn = useCallback(() => {
    setViewport((v) => {
      const newZoom = Math.min(v.zoomLevel + 1, MAX_ZOOM);
      const config = ZOOM_CONFIGS[newZoom];
      const clamped = clampCenter(v.centerLon, v.centerLat, config);
      return { centerLon: clamped.lon, centerLat: clamped.lat, zoomLevel: newZoom };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((v) => {
      const newZoom = Math.max(v.zoomLevel - 1, MIN_ZOOM);
      const config = ZOOM_CONFIGS[newZoom];
      const clamped = clampCenter(v.centerLon, v.centerLat, config);
      return { centerLon: clamped.lon, centerLat: clamped.lat, zoomLevel: newZoom };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewport({ centerLon: 0, centerLat: 0, zoomLevel: 0 });
    setPanOffset({ x: 0, y: 0 });
  }, []);

  /**
   * Zoom centered on a specific screen position (for cursor-centered wheel zoom).
   * @param direction +1 = zoom in, -1 = zoom out
   * @param cursorFractionX cursor X as fraction of container width (0..1)
   * @param cursorFractionY cursor Y as fraction of container height (0..1)
   */
  const zoomAtCursor = useCallback(
    (direction: number, cursorFractionX: number, cursorFractionY: number) => {
      cancelMomentum();
      setViewport((v) => {
        const newZoom = clamp(v.zoomLevel + direction, MIN_ZOOM, MAX_ZOOM);
        if (newZoom === v.zoomLevel) return v;

        const newConfig = ZOOM_CONFIGS[newZoom];

        // Geographic point under cursor in old viewport
        const oldBounds = computeBounds(v);
        const cursorLon = oldBounds.lonMin + cursorFractionX * (oldBounds.lonMax - oldBounds.lonMin);
        const cursorLat = oldBounds.latMax - cursorFractionY * (oldBounds.latMax - oldBounds.latMin);

        // New center: keep cursor point at same screen fraction
        const newCenterLon = cursorLon - (cursorFractionX - 0.5) * newConfig.lonSpan;
        const newCenterLat = cursorLat + (cursorFractionY - 0.5) * newConfig.latSpan;

        const clamped = clampCenter(newCenterLon, newCenterLat, newConfig);
        return { centerLon: clamped.lon, centerLat: clamped.lat, zoomLevel: newZoom };
      });
    },
    [cancelMomentum]
  );

  // ─── Pan ───

  const startPan = useCallback(
    (clientX: number, clientY: number) => {
      cancelMomentum();
      const now = Date.now();
      panRef.current = {
        startX: clientX,
        startY: clientY,
        startCenterLon: viewport.centerLon,
        startCenterLat: viewport.centerLat,
        startTime: now,
        hasMoved: false,
        lastPositions: [{ x: clientX, y: clientY, t: now }],
      };
    },
    [viewport.centerLon, viewport.centerLat, cancelMomentum]
  );

  /**
   * Update pan position during drag. Sets CSS transform offset for 60fps feedback.
   */
  const updatePan = useCallback(
    (clientX: number, clientY: number, _containerWidth: number, _containerHeight: number) => {
      const pan = panRef.current;
      if (!pan) return;

      const dx = clientX - pan.startX;
      const dy = clientY - pan.startY;

      if (Math.abs(dx) > PAN_MOVE_THRESHOLD || Math.abs(dy) > PAN_MOVE_THRESHOLD) {
        pan.hasMoved = true;
      }

      if (!pan.hasMoved) return;

      setIsPanning(true);

      // Record position for velocity sampling (keep last ~100ms)
      const now = Date.now();
      pan.lastPositions.push({ x: clientX, y: clientY, t: now });
      const cutoff = now - 100;
      while (pan.lastPositions.length > 2 && pan.lastPositions[0].t < cutoff) {
        pan.lastPositions.shift();
      }

      // At global zoom (Z:0), viewport can't pan — skip visual offset
      // to prevent misleading "wobble then snap-back" behavior
      if (viewport.zoomLevel === 0) return;

      // Apply visual offset immediately
      setPanOffset({ x: dx, y: dy });
    },
    [viewport.zoomLevel]
  );

  /**
   * Commit pan: finalize the viewport position from accumulated pixel offset.
   */
  const commitPan = useCallback(
    (pixelDx: number, pixelDy: number, containerWidth: number, containerHeight: number) => {
      const pan = panRef.current;
      const startLon = pan?.startCenterLon ?? viewport.centerLon;
      const startLat = pan?.startCenterLat ?? viewport.centerLat;

      const config = ZOOM_CONFIGS[viewport.zoomLevel];
      const lonPerPixel = config.lonSpan / containerWidth;
      const latPerPixel = config.latSpan / containerHeight;

      const newCenterLon = startLon - pixelDx * lonPerPixel;
      const newCenterLat = startLat + pixelDy * latPerPixel;

      const clamped = clampCenter(newCenterLon, newCenterLat, config);

      // ── Velocity sampling for momentum ──
      let vxPxPerMs = 0;
      let vyPxPerMs = 0;
      if (pan && pan.lastPositions.length >= 2) {
        const first = pan.lastPositions[0];
        const last = pan.lastPositions[pan.lastPositions.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          vxPxPerMs = (last.x - first.x) / dt;
          vyPxPerMs = (last.y - first.y) / dt;
        }
      }

      panRef.current = null;
      setIsPanning(false);
      setPanOffset({ x: 0, y: 0 });

      setViewport({
        centerLon: clamped.lon,
        centerLat: clamped.lat,
        zoomLevel: viewport.zoomLevel,
      });

      // ── Start momentum animation if release velocity is significant ──
      const speed = Math.sqrt(vxPxPerMs * vxPxPerMs + vyPxPerMs * vyPxPerMs);
      const MIN_MOMENTUM_SPEED = 0.3; // px/ms
      const DECAY = 0.94;
      const MIN_VELOCITY = 0.05; // px/ms — stop threshold

      if (speed > MIN_MOMENTUM_SPEED && viewport.zoomLevel > 0) {
        let mvx = vxPxPerMs;
        let mvy = vyPxPerMs;

        const animate = () => {
          mvx *= DECAY;
          mvy *= DECAY;

          if (Math.abs(mvx) < MIN_VELOCITY && Math.abs(mvy) < MIN_VELOCITY) {
            momentumRef.current = null;
            return;
          }

          // Convert px/ms velocity → geographic delta (16ms frame assumed)
          const frameDLon = -mvx * 16 * lonPerPixel;
          const frameDLat = mvy * 16 * latPerPixel;

          setViewport((v) => {
            const cfg = ZOOM_CONFIGS[v.zoomLevel];
            const cl = clampCenter(v.centerLon + frameDLon, v.centerLat + frameDLat, cfg);
            return { centerLon: cl.lon, centerLat: cl.lat, zoomLevel: v.zoomLevel };
          });

          momentumRef.current = requestAnimationFrame(animate);
        };

        momentumRef.current = requestAnimationFrame(animate);
      }
    },
    [viewport.centerLon, viewport.centerLat, viewport.zoomLevel, cancelMomentum]
  );

  // ─── FlyTo (for region select) ───

  const flyToRegion = useCallback((region: Region) => {
    const target = REGION_CENTERS[region];
    if (!target) return;
    const config = ZOOM_CONFIGS[target.zoom];
    const clamped = clampCenter(target.lon, target.lat, config);
    setViewport({
      centerLon: clamped.lon,
      centerLat: clamped.lat,
      zoomLevel: target.zoom,
    });
  }, []);

  /**
   * Pan by a geographic delta (for keyboard navigation).
   * @param dLon longitude offset (positive = east)
   * @param dLat latitude offset (positive = north)
   */
  const panByDelta = useCallback(
    (dLon: number, dLat: number) => {
      setViewport((v) => {
        const config = ZOOM_CONFIGS[v.zoomLevel];
        const clamped = clampCenter(v.centerLon + dLon, v.centerLat + dLat, config);
        return { centerLon: clamped.lon, centerLat: clamped.lat, zoomLevel: v.zoomLevel };
      });
    },
    []
  );

  const flyTo = useCallback((lon: number, lat: number, zoom: number) => {
    const config = ZOOM_CONFIGS[clamp(zoom, MIN_ZOOM, MAX_ZOOM)];
    const clamped = clampCenter(lon, lat, config);
    setViewport({
      centerLon: clamped.lon,
      centerLat: clamped.lat,
      zoomLevel: clamp(zoom, MIN_ZOOM, MAX_ZOOM),
    });
  }, []);

  return {
    viewport,
    bounds,
    zoomConfig,
    isPanning,
    panOffset,
    panRef,

    // Zoom controls
    zoomIn,
    zoomOut,
    resetView,
    zoomAtCursor,

    // Pan controls
    startPan,
    updatePan,
    commitPan,
    panByDelta,
    cancelMomentum,

    // Navigation
    flyToRegion,
    flyTo,

    // Direct setter (for edge cases)
    setViewport,
    setPanOffset,
    setIsPanning,
  };
}
