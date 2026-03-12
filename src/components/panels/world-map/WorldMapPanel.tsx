import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { AsciiWorldMap } from './AsciiWorldMap';
import { AsciiEventOverlay } from './AsciiEventOverlay';
import { AsciiStaticOverlay } from './AsciiStaticOverlay';
import { AsciiTerminatorLayer } from './AsciiTerminatorLayer';
import { AsciiPolylineOverlay } from './AsciiPolylineOverlay';
import { AsciiDensityHeatmap } from './AsciiDensityHeatmap';
import { AsciiBoundaryLayer } from './AsciiBoundaryLayer';
import { MapTooltip } from './MapTooltip';
import { EventDetailPanel } from './EventDetailPanel';
import { MapLayerToggles } from './MapLayerToggles';
import { MapStatusBar } from './MapStatusBar';
import { MapZoomControls } from './MapZoomControls';
import { useMapViewport, MIN_ZOOM, MAX_ZOOM } from './use-map-viewport';
import { useEarthquakes } from '@/hooks/useEarthquakes';
import { useNaturalEvents } from '@/hooks/useNaturalEvents';
import { useMultipleFeeds } from '@/hooks/useRssFeed';
import { useReliefWebDisasters } from '@/hooks/useReliefWeb';
import { useGDACSAlerts } from '@/hooks/useGDACS';
import { FEED_SOURCES } from '@/config/feed-sources';
import {
  earthquakesToMapEvents,
  feedItemsToMapEvents,
  normalizeNaturalEvents,
  normalizeReliefWebDisasters,
  normalizeGDACSAlerts,
} from '@/utils/map-events';
import { useAppStore } from '@/store/app-store';
import type { MapEvent, MapEventType, Region } from '@/types';

export function WorldMapPanel() {
  const {
    selectedRegion, setSelectedRegion,
    enabledEventTypes, toggleEventType,
    setEventTypes, resetEventTypesToDefaults,
    feedFocusMode,
    mapDataSources, toggleMapDataSource,
    mapDisplayOptions, toggleMapDisplayOption,
    applyMapPreset,
  } = useAppStore();
  const { data: earthquakes = [], error: eqError } = useEarthquakes(2.5);
  const { data: naturalEvents = [], error: eonetError } = useNaturalEvents();
  const { feeds, errors: feedErrors } = useMultipleFeeds(FEED_SOURCES);
  const { data: reliefWebData, error: rwError } = useReliefWebDisasters();
  const { data: gdacsAlerts, error: gdacsError } = useGDACSAlerts();

  const dataSourceErrors = useMemo(() => {
    const errs: string[] = [];
    if (eqError) errs.push('USGS');
    if (eonetError) errs.push('EONET');
    if (rwError) errs.push('ReliefWeb');
    if (gdacsError) errs.push('GDACS');
    if (feedErrors.length > 0) errs.push('RSS');
    return errs;
  }, [eqError, eonetError, rwError, gdacsError, feedErrors]);

  // ─── Viewport state ───
  const mapViewport = useMapViewport();

  // ─── Derive enabled layers Set from global store (for child component compat) ───
  const enabledLayers = useMemo(
    () => new Set(enabledEventTypes),
    [enabledEventTypes]
  );

  // ─── Local state ───
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [hoveredEvents, setHoveredEvents] = useState<MapEvent | MapEvent[] | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Normalize all events (gated by data source toggles) ───
  const allEvents = useMemo(() => {
    const result: MapEvent[] = [];
    if (mapDataSources.usgsEarthquakes) {
      result.push(...earthquakesToMapEvents(earthquakes));
    }
    if (mapDataSources.nasaEonet) {
      result.push(...normalizeNaturalEvents(naturalEvents));
    }
    if (mapDataSources.rssFeeds) {
      result.push(...feedItemsToMapEvents(feeds, 200, feedFocusMode));
    }
    if (mapDataSources.reliefWeb && reliefWebData) {
      result.push(...normalizeReliefWebDisasters(reliefWebData));
    }
    if (mapDataSources.gdacs && gdacsAlerts) {
      result.push(...normalizeGDACSAlerts(gdacsAlerts));
    }
    return result;
  }, [earthquakes, naturalEvents, feeds, feedFocusMode, mapDataSources, reliefWebData, gdacsAlerts]);

  // ─── Filter by selected region ───
  const displayedEvents = useMemo(() => {
    if (!selectedRegion) return allEvents;
    return allEvents.filter((e) => e.region === selectedRegion);
  }, [allEvents, selectedRegion]);

  // ─── Handlers ───
  const handleEventHover = useCallback(
    (events: MapEvent | MapEvent[] | null, pos: { x: number; y: number }) => {
      setHoveredEvents(events);
      setMousePos(pos);
    },
    []
  );

  const handleEventClick = useCallback(
    (event: MapEvent) => {
      // Set region for cross-panel sync
      if (event.region) {
        setSelectedRegion(event.region);
      }
      // Open detail panel instead of raw URL
      setSelectedEvent(event);
    },
    [setSelectedRegion]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleLayerToggle = useCallback((type: MapEventType) => {
    toggleEventType(type);
  }, [toggleEventType]);

  const handleSetAllLayers = useCallback((types: MapEventType[]) => {
    setEventTypes(types);
  }, [setEventTypes]);

  // ─── Debounced wheel zoom (cursor-centered) ───
  // Accumulates deltaY over an 80ms window so fast multi-tick scrolls
  // produce a single zoom level change instead of overshooting.
  const wheelAccumRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCursorFractionRef = useRef({ x: 0.5, y: 0.5 });

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      lastCursorFractionRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };

      wheelAccumRef.current += e.deltaY;

      // Reset debounce timer
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);

      wheelTimerRef.current = setTimeout(() => {
        const accum = wheelAccumRef.current;
        wheelAccumRef.current = 0;

        // Filter micro-deltas from trackpad inertia
        if (Math.abs(accum) < 10) return;

        // One zoom level per debounced gesture
        const direction = accum < 0 ? 1 : -1;
        mapViewport.zoomAtCursor(
          direction,
          lastCursorFractionRef.current.x,
          lastCursorFractionRef.current.y,
        );
      }, 80);
    },
    [mapViewport.zoomAtCursor]
  );

  // ─── Keyboard navigation ───
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const config = mapViewport.zoomConfig;
      const panFraction = 0.2; // 20% of viewport span per keystroke
      const dLon = config.lonSpan * panFraction;
      const dLat = config.latSpan * panFraction;

      switch (e.key) {
        // Pan — arrow keys & WASD
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          mapViewport.panByDelta(-dLon, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          mapViewport.panByDelta(dLon, 0);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          mapViewport.panByDelta(0, dLat);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          mapViewport.panByDelta(0, -dLat);
          break;

        // Zoom
        case '+':
        case '=':
          e.preventDefault();
          mapViewport.zoomIn();
          break;
        case '-':
          e.preventDefault();
          mapViewport.zoomOut();
          break;

        // Reset / jump to zoom level
        case '0':
        case 'Home':
          e.preventDefault();
          mapViewport.resetView();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          mapViewport.flyTo(
            mapViewport.viewport.centerLon,
            mapViewport.viewport.centerLat,
            parseInt(e.key, 10),
          );
          break;

        // Deselect / close
        case 'Escape':
          e.preventDefault();
          if (selectedEvent) {
            setSelectedEvent(null);
          } else if (selectedRegion) {
            setSelectedRegion(null);
          }
          break;
      }
    },
    [mapViewport, selectedEvent, selectedRegion, setSelectedRegion]
  );

  const containerRect = containerRef.current?.getBoundingClientRect() ?? null;

  // Panel status
  const panelStatus = earthquakes.length > 0 || naturalEvents.length > 0 || feeds.length > 0 ? 'live' : 'loading';

  return (
    <TerminalWindow
      title="WORLD MAP"
      status={panelStatus}
      headerRight={
        <div className="flex items-center gap-2">
          <MapZoomControls
            zoomConfig={mapViewport.zoomConfig}
            onZoomIn={mapViewport.zoomIn}
            onZoomOut={mapViewport.zoomOut}
            onReset={mapViewport.resetView}
            canZoomIn={mapViewport.viewport.zoomLevel < MAX_ZOOM}
            canZoomOut={mapViewport.viewport.zoomLevel > MIN_ZOOM}
          />
          <span className="text-terminal-border">│</span>
          <MapLayerToggles
            enabledLayers={enabledLayers}
            onToggle={handleLayerToggle}
            onSetAll={handleSetAllLayers}
            onResetDefaults={resetEventTypesToDefaults}
            dataSources={mapDataSources}
            onToggleDataSource={toggleMapDataSource}
            displayOptions={mapDisplayOptions}
            onToggleDisplayOption={toggleMapDisplayOption}
            onApplyPreset={applyMapPreset}
          />
          {selectedRegion && (
            <button
              className="text-terminal-primary-dim hover:text-terminal-primary text-[9px] cursor-pointer"
              onClick={() => setSelectedRegion(null)}
            >
              [CLEAR]
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Map container — flex-1 fills available space */}
        <div
          ref={containerRef}
          className="map-container relative flex-1 overflow-hidden flex items-center justify-center"
          tabIndex={0}
          style={{ outline: 'none' }}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          {/* 2:1 aspect ratio wrapper — ensures equirectangular projection alignment
              between ASCII map and event marker overlay (lonLatToPercent).
              height: 100% → aspect-ratio computes width = height×2 → max-width caps it. */}
          <div
            className="relative"
            style={{
              aspectRatio: '2 / 1',
              height: '100%',
              maxWidth: '100%',
            }}
          >
            {/* Geographic layers — all move together during pan */}
            <div
              className="absolute inset-0"
              style={{
                transform: mapViewport.isPanning
                  ? `translate(${mapViewport.panOffset.x}px, ${mapViewport.panOffset.y}px)`
                  : undefined,
                willChange: mapViewport.isPanning ? 'transform' : undefined,
              }}
            >
              {/* ASCII base map */}
              <AsciiWorldMap
                hoveredRegion={hoveredRegion}
                onRegionHover={setHoveredRegion}
                bounds={mapViewport.bounds}
                zoomLevel={mapViewport.viewport.zoomLevel}
                isPanning={mapViewport.isPanning}
                onPanStart={mapViewport.startPan}
                onPanMove={mapViewport.updatePan}
                onPanCommit={mapViewport.commitPan}
                onZoomAtCursor={mapViewport.zoomAtCursor}
                panRef={mapViewport.panRef}
              />

              {/* Geographic boundary lines */}
              {mapDisplayOptions.boundaries && (
                <AsciiBoundaryLayer
                  bounds={mapViewport.bounds}
                  zoomLevel={mapViewport.viewport.zoomLevel}
                  hoveredRegion={hoveredRegion}
                  selectedRegion={selectedRegion}
                />
              )}

              {/* Day/night terminator overlay */}
              {mapDisplayOptions.dayNight && enabledLayers.has('day-night-terminator') && (
                <AsciiTerminatorLayer
                  bounds={mapViewport.bounds}
                  zoomLevel={mapViewport.viewport.zoomLevel}
                />
              )}

              {/* Density heatmap — renders below markers at Z:0-3 */}
              {mapDisplayOptions.heatmap && (
                <AsciiDensityHeatmap
                  events={displayedEvents}
                  enabledLayers={enabledLayers}
                  bounds={mapViewport.bounds}
                  zoomLevel={mapViewport.viewport.zoomLevel}
                />
              )}

              {/* Static infrastructure overlays (bases, pipelines, etc.) */}
              {mapDisplayOptions.staticInfra && (
                <AsciiStaticOverlay
                  bounds={mapViewport.bounds}
                  zoomLevel={mapViewport.viewport.zoomLevel}
                  enabledLayers={enabledLayers}
                />
              )}

              {/* Dynamic polyline routes (displacement flows, conflict corridors) */}
              {mapDisplayOptions.polylines && (
                <AsciiPolylineOverlay
                  events={displayedEvents}
                  enabledLayers={enabledLayers}
                  bounds={mapViewport.bounds}
                  zoomLevel={mapViewport.viewport.zoomLevel}
                />
              )}

              {/* ASCII event overlays */}
              <AsciiEventOverlay
                events={displayedEvents}
                enabledLayers={enabledLayers}
                bounds={mapViewport.bounds}
                zoomLevel={mapViewport.viewport.zoomLevel}
                onEventHover={handleEventHover}
                onEventClick={handleEventClick}
              />
            </div>

            {/* UI layers — stay fixed during pan */}
            <MapTooltip
              events={hoveredEvents}
              mousePos={mousePos}
              containerRect={containerRect}
            />

            {/* Event detail drill-down panel */}
            {selectedEvent && (
              <EventDetailPanel
                event={selectedEvent}
                allEvents={displayedEvents}
                onClose={handleCloseDetail}
              />
            )}

            {/* Scanline sweep animation */}
            <div className="map-scanline absolute inset-0 pointer-events-none" />
          </div>
        </div>

        {/* Bottom status bar */}
        <MapStatusBar
          events={displayedEvents}
          viewport={mapViewport.viewport}
          dataSourceErrors={dataSourceErrors}
        />
      </div>
    </TerminalWindow>
  );
}
