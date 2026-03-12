/**
 * MapLayerToggles — Compact map config control for the world map header.
 *
 * Single [CONFIG N/M] button that opens MapConfigPopup
 * for comprehensive control of layers, data sources, and display.
 */

import { useState, useRef, useEffect } from 'react';
import type { MapEventType, MapDataSources, MapDisplayOptions, MapFilterPresetName } from '@/types';
import { ALL_EVENT_TYPES } from '@/config/event-types';
import { MapConfigPopup } from './MapConfigPopup';

interface MapLayerTogglesProps {
  enabledLayers: Set<MapEventType>;
  onToggle: (type: MapEventType) => void;
  onSetAll: (types: MapEventType[]) => void;
  onResetDefaults: () => void;
  // Data sources
  dataSources: MapDataSources;
  onToggleDataSource: (key: keyof MapDataSources) => void;
  // Display options
  displayOptions: MapDisplayOptions;
  onToggleDisplayOption: (key: keyof MapDisplayOptions) => void;
  // Presets
  onApplyPreset: (preset: MapFilterPresetName) => void;
}

export function MapLayerToggles({
  enabledLayers,
  onToggle,
  onSetAll,
  onResetDefaults,
  dataSources,
  onToggleDataSource,
  displayOptions,
  onToggleDisplayOption,
  onApplyPreset,
}: MapLayerTogglesProps) {
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount = enabledLayers.size;
  const totalCount = ALL_EVENT_TYPES.length;

  // Close on outside click
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopup]);

  // Close on Escape
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPopup(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showPopup]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* [CONFIG N/M] button */}
      <button
        className="px-1.5 py-0.5 text-[9px] tracking-wide cursor-pointer transition-colors"
        style={{
          color: showPopup
            ? 'var(--color-terminal-primary)'
            : 'var(--color-terminal-primary-dim)',
          textShadow: showPopup
            ? '0 0 4px color-mix(in srgb, var(--color-terminal-primary) 30%, transparent)'
            : 'none',
        }}
        onClick={() => setShowPopup(!showPopup)}
        title="Configure map layers, data sources, and display"
      >
        [CONFIG {activeCount}/{totalCount}]
      </button>

      {/* Full config popup */}
      {showPopup && (
        <MapConfigPopup
          enabledLayers={enabledLayers}
          onToggle={onToggle}
          onSetAll={onSetAll}
          onResetDefaults={onResetDefaults}
          onClose={() => setShowPopup(false)}
          dataSources={dataSources}
          onToggleDataSource={onToggleDataSource}
          displayOptions={displayOptions}
          onToggleDisplayOption={onToggleDisplayOption}
          onApplyPreset={onApplyPreset}
        />
      )}
    </div>
  );
}
