/**
 * MapConfigPopup — Comprehensive ASCII-styled map configuration modal.
 *
 * Sections:
 *   1. Quick presets (CONFLICT, NATURAL, ECON, ALL)
 *   2. Layer toggles (existing category/type system)
 *   3. Data source toggles (USGS, EONET, RSS)
 *   4. Display option toggles (heatmap, labels, animations, etc.)
 */

import { useState, useCallback } from 'react';
import type { MapEventType, MapLayerCategory, MapDataSources, MapDisplayOptions, MapFilterPresetName } from '@/types';
import {
  EVENT_TYPE_REGISTRY,
  LAYER_CATEGORIES,
  ALL_LAYER_CATEGORIES,
  getEventTypesByCategory,
} from '@/config/event-types';
import { MAP_FILTER_PRESETS, MAP_FILTER_PRESET_ORDER } from '@/config/map-presets';
import { useDropdown } from '@/hooks/useDropdown';

interface MapConfigPopupProps {
  enabledLayers: Set<MapEventType>;
  onToggle: (type: MapEventType) => void;
  onSetAll: (types: MapEventType[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
  // Data sources
  dataSources: MapDataSources;
  onToggleDataSource: (key: keyof MapDataSources) => void;
  // Display options
  displayOptions: MapDisplayOptions;
  onToggleDisplayOption: (key: keyof MapDisplayOptions) => void;
  // Presets
  onApplyPreset: (preset: MapFilterPresetName) => void;
}

// ─── Collapsible Section ───

function CollapsibleSection({
  title,
  count,
  defaultExpanded = true,
  children,
}: {
  title: string;
  count?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left cursor-pointer hover:bg-terminal-primary/5 transition-colors"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-terminal-primary-dim text-[10px] w-3">
          {expanded ? '▼' : '▸'}
        </span>
        <span className="text-terminal-primary text-[10px] tracking-widest flex-1">
          {title}
        </span>
        {count && (
          <span className="text-terminal-primary-dim text-[9px]">
            {count}
          </span>
        )}
      </button>
      {expanded && <div className="py-1">{children}</div>}
    </div>
  );
}

// ─── Category Group (reused from LayerConfigPopup) ───

function CategoryGroup({
  category,
  enabledLayers,
  onToggle,
  defaultExpanded,
}: {
  category: MapLayerCategory;
  enabledLayers: Set<MapEventType>;
  onToggle: (type: MapEventType) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const catConfig = LAYER_CATEGORIES[category];
  const types = getEventTypesByCategory(category);

  const enabledCount = types.filter((t) => enabledLayers.has(t.type)).length;
  const totalCount = types.length;

  return (
    <div className="mb-0.5">
      <button
        className="w-full flex items-center gap-1.5 px-2 py-0.5 text-left cursor-pointer hover:bg-terminal-primary/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-terminal-primary-dim text-[9px] w-3">
          {expanded ? '▼' : '▸'}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: enabledCount > 0
              ? `var(${catConfig.colorVar})`
              : 'var(--color-terminal-primary-dim)',
            boxShadow: enabledCount > 0
              ? `0 0 4px var(${catConfig.colorVar})`
              : 'none',
            opacity: enabledCount > 0 ? 1 : 0.3,
          }}
        />
        <span
          className="text-[9px] tracking-wide font-mono flex-1"
          style={{
            color: enabledCount > 0
              ? `var(${catConfig.colorVar})`
              : 'var(--color-terminal-primary-dim)',
          }}
        >
          {catConfig.label}
        </span>
        <span className="text-[8px] text-terminal-primary-dim font-mono">
          {enabledCount}/{totalCount}
        </span>
      </button>

      {expanded && (
        <div className="ml-4 border-l border-terminal-border/20 pl-2">
          {types.map((typeConfig) => {
            const active = enabledLayers.has(typeConfig.type);
            const reg = EVENT_TYPE_REGISTRY[typeConfig.type];

            return (
              <button
                key={typeConfig.type}
                className="w-full flex items-center gap-1.5 px-1.5 py-0.5 text-left cursor-pointer hover:bg-terminal-primary/5 transition-opacity"
                onClick={() => onToggle(typeConfig.type)}
              >
                <span
                  className="text-[9px] font-mono w-3 text-center"
                  style={{
                    color: active ? `var(${reg.colorVar})` : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 1 : 0.3,
                  }}
                >
                  {active ? '☑' : '☐'}
                </span>
                <span
                  className="text-[9px] font-mono w-3 text-center"
                  style={{
                    color: active ? `var(${reg.colorVar})` : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 0.8 : 0.2,
                  }}
                >
                  {reg.symbol}
                </span>
                <span
                  className="text-[8px] font-mono flex-1 tracking-wide"
                  style={{
                    color: active ? 'var(--color-terminal-primary)' : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 0.9 : 0.4,
                  }}
                >
                  {reg.label}
                </span>
                <span
                  className="text-[7px] font-mono text-terminal-primary-dim"
                  style={{ opacity: 0.4 }}
                >
                  Z:{reg.minZoom}+
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Row ───

function ToggleRow({
  label,
  active,
  onToggle,
  colorVar,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  colorVar?: string;
}) {
  return (
    <button
      className="w-full flex items-center gap-1.5 px-3 py-0.5 text-left cursor-pointer hover:bg-terminal-primary/5 transition-colors"
      onClick={onToggle}
    >
      <span
        className="text-[9px] font-mono w-3 text-center"
        style={{
          color: active
            ? (colorVar ? `var(${colorVar})` : 'var(--color-terminal-primary)')
            : 'var(--color-terminal-primary-dim)',
          opacity: active ? 1 : 0.3,
        }}
      >
        {active ? '☑' : '☐'}
      </span>
      <span
        className="text-[9px] font-mono tracking-wide"
        style={{
          color: active ? 'var(--color-terminal-primary)' : 'var(--color-terminal-primary-dim)',
          opacity: active ? 0.9 : 0.4,
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Main Popup ───

export function MapConfigPopup({
  enabledLayers,
  onToggle,
  onSetAll,
  onResetDefaults,
  onClose,
  dataSources,
  onToggleDataSource,
  displayOptions,
  onToggleDisplayOption,
  onApplyPreset,
}: MapConfigPopupProps) {
  const dropdown = useDropdown();

  // Sync open state — the parent controls visibility, but we use the hook for dismiss logic
  // We override by using the ref for click-outside detection
  const popupRef = dropdown.ref;

  // Close handlers
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // We need manual outside-click + escape since parent controls visibility
  // Using a simple ref-based approach
  const handleAllOn = useCallback(() => {
    const allTypes = Object.keys(EVENT_TYPE_REGISTRY) as MapEventType[];
    onSetAll(allTypes);
  }, [onSetAll]);

  const handleAllOff = useCallback(() => {
    onSetAll([]);
  }, [onSetAll]);

  const totalEnabled = enabledLayers.size;
  const totalTypes = Object.keys(EVENT_TYPE_REGISTRY).length;

  const dataSourceEntries: { key: keyof MapDataSources; label: string; colorVar: string }[] = [
    { key: 'usgsEarthquakes', label: 'USGS EARTHQUAKES', colorVar: '--color-terminal-amber' },
    { key: 'nasaEonet', label: 'NASA EONET', colorVar: '--color-terminal-cyan' },
    { key: 'rssFeeds', label: 'RSS NEWS FEEDS', colorVar: '--color-terminal-green' },
    { key: 'reliefWeb', label: 'RELIEFWEB (UN OCHA)', colorVar: '--color-terminal-red' },
    { key: 'gdacs', label: 'GDACS ALERTS', colorVar: '--color-terminal-amber' },
  ];

  const displayEntries: { key: keyof MapDisplayOptions; label: string }[] = [
    { key: 'heatmap', label: 'HEATMAP' },
    { key: 'labels', label: 'LABELS' },
    { key: 'animations', label: 'ANIMATIONS' },
    { key: 'dayNight', label: 'DAY/NIGHT' },
    { key: 'staticInfra', label: 'INFRASTRUCTURE' },
    { key: 'polylines', label: 'POLYLINES' },
    { key: 'boundaries', label: 'BOUNDARIES' },
  ];

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-1 z-50 font-mono"
      style={{
        width: '280px',
        maxHeight: '520px',
        backgroundColor: 'var(--color-terminal-bg)',
        border: '1px solid var(--color-terminal-border)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 8px color-mix(in srgb, var(--color-terminal-primary) 10%, transparent)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
      >
        <span className="text-terminal-primary text-[10px] tracking-widest">
          [ MAP CONFIG ]
        </span>
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary-dim text-[9px]">
            {totalEnabled}/{totalTypes}
          </span>
          <button
            className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={handleClose}
          >
            [×]
          </button>
        </div>
      </div>

      {/* Preset bar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
      >
        <span className="text-[8px] text-terminal-primary-dim tracking-widest mr-1">PRESET:</span>
        {MAP_FILTER_PRESET_ORDER.map((presetName) => {
          const preset = MAP_FILTER_PRESETS[presetName];
          return (
            <button
              key={presetName}
              className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors px-1 py-0.5"
              onClick={() => onApplyPreset(presetName)}
              title={preset.description}
            >
              [{preset.label}]
            </button>
          );
        })}
      </div>

      {/* Scrollable sections */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '420px' }}
      >
        {/* Section: Layer Toggles */}
        <CollapsibleSection
          title="LAYER TOGGLES"
          count={`${totalEnabled}/${totalTypes}`}
          defaultExpanded={true}
        >
          {/* Bulk controls */}
          <div
            className="flex items-center gap-2 px-2 py-1 mb-1"
            style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
          >
            <button
              className="text-[8px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={handleAllOn}
            >
              [ALL ON]
            </button>
            <button
              className="text-[8px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={handleAllOff}
            >
              [ALL OFF]
            </button>
            <button
              className="text-[8px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
              onClick={onResetDefaults}
            >
              [DEFAULTS]
            </button>
          </div>

          {ALL_LAYER_CATEGORIES.map((category, i) => (
            <CategoryGroup
              key={category}
              category={category}
              enabledLayers={enabledLayers}
              onToggle={onToggle}
              defaultExpanded={i < 3}
            />
          ))}
        </CollapsibleSection>

        {/* Section: Data Sources */}
        <CollapsibleSection
          title="DATA SOURCES"
          defaultExpanded={true}
        >
          {dataSourceEntries.map(({ key, label, colorVar }) => (
            <ToggleRow
              key={key}
              label={label}
              active={dataSources[key]}
              onToggle={() => onToggleDataSource(key)}
              colorVar={colorVar}
            />
          ))}
        </CollapsibleSection>

        {/* Section: Display Options */}
        <CollapsibleSection
          title="DISPLAY"
          defaultExpanded={true}
        >
          {displayEntries.map(({ key, label }) => (
            <ToggleRow
              key={key}
              label={label}
              active={displayOptions[key]}
              onToggle={() => onToggleDisplayOption(key)}
            />
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
}
