/**
 * AsciiTerminatorLayer — Day/Night Terminator overlay.
 *
 * Calculates the solar terminator line (boundary between Earth's
 * sunlit and shadowed hemispheres) from UTC time and renders
 * the night side as a dim overlay.
 *
 * Uses the standard astronomical formula:
 *   1. Solar declination from day-of-year
 *   2. Hour angle from UTC time
 *   3. Subsolar point → terminator circle
 *
 * The overlay renders as a semi-transparent CSS gradient applied to
 * a full-extent div inside the 2:1 aspect ratio map wrapper.
 *
 * Updates every 60 seconds. Toggleable via 'day-night-terminator' MapEventType.
 */

import { useMemo, memo } from 'react';
import { useClock } from '@/hooks/useClock';
import type { ViewportBounds } from './use-map-viewport';

interface AsciiTerminatorLayerProps {
  bounds: ViewportBounds;
  zoomLevel: number;
}

// ─── Solar Position Calculations ───

/** Degrees → radians */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians → degrees */
function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Compute the solar declination (angle of sun above/below equator).
 * Approximate formula using day-of-year.
 */
function solarDeclination(dayOfYear: number): number {
  // Earth's axial tilt
  return -23.44 * Math.cos(deg2rad((360 / 365) * (dayOfYear + 10)));
}

/**
 * Get the day-of-year (1-366) for a Date.
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Compute the subsolar longitude (where the sun is directly overhead).
 * Based on UTC time: the sun is at solar noon at longitude = 180 - (hours * 15).
 */
function subsolarLongitude(date: Date): number {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // At 00:00 UTC, the sun is at 180°E (dateline). It moves west 15°/hour.
  let lon = 180 - hours * 15;
  // Normalize to [-180, 180]
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return lon;
}

/**
 * For a given longitude, compute the terminator latitude.
 * Returns the latitude where the terminator line crosses that longitude,
 * or null if the sun never sets/rises at that longitude (polar day/night).
 *
 * The terminator is a great circle perpendicular to the sun-earth line.
 * For latitude `lat` at the terminator:
 *   tan(lat) = -cos(hourAngle) / tan(declination)
 *
 * where hourAngle = longitude - subsolarLon
 */
function terminatorLatitude(lon: number, subsolarLon: number, declination: number): number {
  const hourAngle = deg2rad(lon - subsolarLon);
  const decRad = deg2rad(declination);

  // tan(lat) = -cos(hourAngle) / tan(declination)
  const tanLat = -Math.cos(hourAngle) / Math.tan(decRad);
  return rad2deg(Math.atan(tanLat));
}

/**
 * Determine if a point is in darkness (night side).
 * A point is in night if the solar elevation angle is negative.
 *
 * sin(elevation) = sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(hourAngle)
 */
function isNightSide(
  lat: number,
  lon: number,
  subsolarLon: number,
  declination: number,
): boolean {
  const latRad = deg2rad(lat);
  const decRad = deg2rad(declination);
  const hourAngle = deg2rad(lon - subsolarLon);

  const sinElevation =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle);

  return sinElevation < 0;
}

// ─── Terminator Grid Computation ───

/** Resolution of the terminator grid (columns) */
const GRID_COLS = 120;
const GRID_ROWS = 60;

interface TerminatorGrid {
  /** 2D array [row][col] — true = night */
  cells: boolean[][];
  /** The terminator line as [lon, lat] points */
  line: [number, number][];
}

function computeTerminatorGrid(
  date: Date,
  bounds: ViewportBounds,
): TerminatorGrid {
  const dayOfYear = getDayOfYear(date);
  const declination = solarDeclination(dayOfYear);
  const subLon = subsolarLongitude(date);

  const lonRange = bounds.lonMax - bounds.lonMin;
  const latRange = bounds.latMax - bounds.latMin;

  // Build night grid
  const cells: boolean[][] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowCells: boolean[] = [];
    const lat = bounds.latMax - (row / GRID_ROWS) * latRange;
    for (let col = 0; col < GRID_COLS; col++) {
      const lon = bounds.lonMin + (col / GRID_COLS) * lonRange;
      rowCells.push(isNightSide(lat, lon, subLon, declination));
    }
    cells.push(rowCells);
  }

  // Build terminator line points
  const line: [number, number][] = [];
  const steps = 72; // every 5 degrees
  for (let i = 0; i <= steps; i++) {
    const lon = bounds.lonMin + (i / steps) * lonRange;
    const tLat = terminatorLatitude(lon, subLon, declination);
    if (tLat >= bounds.latMin && tLat <= bounds.latMax) {
      line.push([lon, tLat]);
    }
  }

  return { cells, line };
}

// ─── Component ───

function AsciiTerminatorLayerInner({
  bounds,
}: AsciiTerminatorLayerProps) {
  // Update every 60 seconds
  const now = useClock(60_000);

  // Compute terminator data
  const { cells, line } = useMemo(
    () => computeTerminatorGrid(now, bounds),
    [now, bounds],
  );

  // Build the night overlay as a grid of semi-transparent cells
  const nightOverlay = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const cellWidthPct = 100 / GRID_COLS;
    const cellHeightPct = 100 / GRID_ROWS;

    for (let row = 0; row < GRID_ROWS; row++) {
      // Scan for contiguous night runs in this row for efficiency
      let col = 0;
      while (col < GRID_COLS) {
        if (!cells[row][col]) {
          col++;
          continue;
        }

        // Start of a night run
        const startCol = col;
        while (col < GRID_COLS && cells[row][col]) {
          col++;
        }
        const runLen = col - startCol;

        elements.push(
          <div
            key={`n-${row}-${startCol}`}
            style={{
              position: 'absolute',
              left: `${startCol * cellWidthPct}%`,
              top: `${row * cellHeightPct}%`,
              width: `${runLen * cellWidthPct}%`,
              height: `${cellHeightPct}%`,
              backgroundColor: 'var(--color-terminal-bg)',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          />,
        );
      }
    }

    return elements;
  }, [cells]);

  // Build terminator line as SVG
  const terminatorLine = useMemo(() => {
    if (line.length < 2) return null;

    const lonRange = bounds.lonMax - bounds.lonMin;
    const latRange = bounds.latMax - bounds.latMin;

    const points = line.map(([lon, lat]) => {
      const x = ((lon - bounds.lonMin) / lonRange) * 100;
      const y = ((bounds.latMax - lat) / latRange) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-terminal-amber)"
          strokeWidth="0.3"
          strokeOpacity={0.5}
          strokeDasharray="1 0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }, [line, bounds]);

  return (
    <div
      className="absolute inset-0"
      style={{ pointerEvents: 'none', zIndex: 1 }}
    >
      {/* Night overlay */}
      {nightOverlay}

      {/* Terminator line */}
      {terminatorLine}
    </div>
  );
}

export const AsciiTerminatorLayer = memo(AsciiTerminatorLayerInner);
