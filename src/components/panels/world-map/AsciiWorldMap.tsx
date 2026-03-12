import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { buildAsciiMapData, ASCII_COLS, ASCII_ROWS } from '@/utils/ascii-world-map';
import type { Region } from '@/types';
import { PAN_MOVE_THRESHOLD, CLICK_TIME_THRESHOLD } from './use-map-viewport';
import type { ViewportBounds, PanState } from './use-map-viewport';

// ─── Aspect Ratio Constants ───
// For equirectangular projection (2:1), the rendered map must satisfy:
//   (charWidth × ASCII_COLS) / (lineHeight × ASCII_ROWS) = 2
//
// With charWidth ≈ 0.6 × fontSize:
//   lineHeight = (ASCII_COLS × 0.6) / (ASCII_ROWS × 2) × fontSize
//             = (80 × 0.6) / (36 × 2) × fontSize
//             = 0.6667 × fontSize
const CHAR_RATIO = 0.6;
const LINE_RATIO = (ASCII_COLS * CHAR_RATIO) / (ASCII_ROWS * 2); // ≈ 0.6667

interface AsciiWorldMapProps {
  hoveredRegion: Region | null;
  onRegionHover: (region: Region | null) => void;
  bounds: ViewportBounds;
  zoomLevel: number;
  isPanning: boolean;
  onPanStart: (clientX: number, clientY: number) => void;
  onPanMove: (clientX: number, clientY: number, containerWidth: number, containerHeight: number) => void;
  onPanCommit: (pixelDx: number, pixelDy: number, containerWidth: number, containerHeight: number) => void;
  onZoomAtCursor: (direction: number, fractionX: number, fractionY: number) => void;
  panRef: React.MutableRefObject<PanState | null>;
}

export function AsciiWorldMap({
  hoveredRegion,
  onRegionHover,
  bounds,
  zoomLevel,
  isPanning,
  onPanStart,
  onPanMove,
  onPanCommit,
  onZoomAtCursor,
  panRef,
}: AsciiWorldMapProps) {
  const selectedRegion = useAppStore((s) => s.selectedRegion);
  const setSelectedRegion = useAppStore((s) => s.setSelectedRegion);
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(10);

  // ─── Smooth zoom transition (brief fade on zoom level change) ───
  const prevZoomRef = useRef(zoomLevel);
  const [zoomTransition, setZoomTransition] = useState(false);

  useEffect(() => {
    if (zoomLevel !== prevZoomRef.current) {
      prevZoomRef.current = zoomLevel;
      setZoomTransition(true);
      const timer = setTimeout(() => setZoomTransition(false), 150);
      return () => clearTimeout(timer);
    }
  }, [zoomLevel]);

  // Build map data for current viewport bounds (zoom level enables progressive detail)
  const cells = useMemo(
    () => buildAsciiMapData(
      ASCII_COLS, ASCII_ROWS,
      bounds.lonMin, bounds.lonMax,
      bounds.latMin, bounds.latMax,
      zoomLevel,
    ),
    [bounds.lonMin, bounds.lonMax, bounds.latMin, bounds.latMax, zoomLevel]
  );

  // ─── Auto-scale font to fill container ───
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;

        // Calculate font size to fill container while maintaining 2:1 map aspect ratio
        const fsByWidth = width / (ASCII_COLS * CHAR_RATIO);
        const fsByHeight = height / (ASCII_ROWS * LINE_RATIO);
        const newFs = Math.floor(Math.min(fsByWidth, fsByHeight) * 10) / 10;

        setFontSize(Math.max(4, Math.min(newFs, 24)));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Derived dimensions
  const lineHeight = fontSize * LINE_RATIO;
  const charWidth = fontSize * CHAR_RATIO;

  // ─── Mouse → cell coordinate mapping ───
  const getCellFromMouse = useCallback(
    (e: React.MouseEvent): { row: number; col: number } | null => {
      const pre = preRef.current;
      if (!pre) return null;

      const rect = pre.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / charWidth);
      const row = Math.floor(y / lineHeight);

      if (row < 0 || row >= ASCII_ROWS || col < 0 || col >= ASCII_COLS) return null;
      return { row, col };
    },
    [charWidth, lineHeight]
  );

  // ─── Pan handlers ───
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left click only
      e.preventDefault();
      onPanStart(e.clientX, e.clientY);
    },
    [onPanStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pan = panRef.current;
      if (pan) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          onPanMove(e.clientX, e.clientY, rect.width, rect.height);
        }
        return; // Don't update hover during pan
      }

      // Normal hover behavior
      const cell = getCellFromMouse(e);
      if (!cell) {
        onRegionHover(null);
        return;
      }
      const mapCell = cells[cell.row]?.[cell.col];
      onRegionHover(mapCell?.region ?? null);
    },
    [getCellFromMouse, cells, onRegionHover, panRef, onPanMove]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const pan = panRef.current;
      if (!pan) return;

      const dx = e.clientX - pan.startX;
      const dy = e.clientY - pan.startY;
      const elapsed = Date.now() - pan.startTime;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Click vs drag discrimination: within thresholds = click
      if (dist < PAN_MOVE_THRESHOLD && elapsed < CLICK_TIME_THRESHOLD) {
        // This was a click, not a drag — handle as region click
        panRef.current = null;
        const cell = getCellFromMouse(e);
        if (cell) {
          const mapCell = cells[cell.row]?.[cell.col];
          const region = mapCell?.region ?? null;
          if (region) {
            setSelectedRegion(selectedRegion === region ? null : region);
          }
        }
        return;
      }

      // Was a drag — commit the pan
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        onPanCommit(dx, dy, rect.width, rect.height);
      }
    },
    [panRef, getCellFromMouse, cells, selectedRegion, setSelectedRegion, onPanCommit]
  );

  // ─── Double-click to zoom in at cursor ───
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const fractionX = (e.clientX - rect.left) / rect.width;
      const fractionY = (e.clientY - rect.top) / rect.height;
      onZoomAtCursor(1, fractionX, fractionY);
    },
    [onZoomAtCursor]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      // If panning, commit whatever offset we have
      const pan = panRef.current;
      if (pan && pan.hasMoved) {
        const dx = e.clientX - pan.startX;
        const dy = e.clientY - pan.startY;
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          onPanCommit(dx, dy, rect.width, rect.height);
        }
      } else if (pan) {
        // Cancel pan without committing
        panRef.current = null;
      }
      onRegionHover(null);
    },
    [onRegionHover, panRef, onPanCommit]
  );

  // ─── Character style: force fixed width for all characters ───
  const charStyle: React.CSSProperties = useMemo(() => ({
    display: 'inline-block',
    width: `${charWidth}px`,
    textAlign: 'center' as const,
    overflow: 'hidden',
  }), [charWidth]);

  // ─── Cursor state ───
  const cursorClass = isPanning ? 'cursor-grabbing' : 'cursor-crosshair';

  // ─── Render rows ───
  const renderedRows = useMemo(() => {
    return cells.map((row, rowIdx) => {
      const spans = row.map((cell, colIdx) => {
        if (cell.char === ' ') {
          return <span key={colIdx} style={charStyle}> </span>;
        }

        let opacity: number;
        let glow = false;

        if (cell.region && cell.region === selectedRegion) {
          // Selected region — bright
          opacity = 0.85;
          glow = true;
        } else if (cell.region && cell.region === hoveredRegion) {
          // Hovered region — medium bright
          opacity = 0.6;
        } else if (cell.isBorder) {
          // Country border — distinct dim line
          opacity = 0.45;
        } else if (cell.isLand) {
          // Normal land — dim
          // Braille coastline chars are slightly brighter than binary interior
          const isBraille = cell.char.charCodeAt(0) >= 0x2800 && cell.char.charCodeAt(0) <= 0x28FF;
          opacity = isBraille ? 0.35 : 0.2;
        } else {
          opacity = 0.08;
        }

        return (
          <span
            key={colIdx}
            style={{
              ...charStyle,
              color: `var(--color-terminal-primary)`,
              opacity,
              textShadow: glow
                ? '0 0 4px var(--color-terminal-primary-glow)'
                : 'none',
              transition: 'opacity 0.15s ease',
            }}
          >
            {cell.char}
          </span>
        );
      });

      return (
        <div key={rowIdx} style={{ lineHeight: `${lineHeight}px`, height: `${lineHeight}px` }}>
          {spans}
        </div>
      );
    });
  }, [cells, hoveredRegion, selectedRegion, lineHeight, charStyle]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden flex items-center justify-center"
    >
      <pre
        ref={preRef}
        className={`select-none ${cursorClass}`}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: 'var(--font-mono)',
          lineHeight: `${lineHeight}px`,
          letterSpacing: '0px',
          margin: 0,
          padding: 0,
          whiteSpace: 'pre',
          // Smooth zoom transition — brief fade to soften content swap
          opacity: zoomTransition ? 0.85 : 1,
          transition: zoomTransition ? 'opacity 0.15s ease-out' : 'opacity 0.15s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        {renderedRows}
      </pre>
    </div>
  );
}
