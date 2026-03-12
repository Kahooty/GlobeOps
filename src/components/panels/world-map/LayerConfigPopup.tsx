/**
 * LayerConfigPopup — ASCII-styled modal for configuring all map layers.
 *
 * Categories as collapsible groups, each event type has a checkbox + symbol
 * + color indicator. Bulk controls: ALL ON, ALL OFF, DEFAULTS.
 * Rendered as a positioned overlay anchored to the [LAYERS] button.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { MapEventType, MapLayerCategory } from '@/types';
import {
  EVENT_TYPE_REGISTRY,
  LAYER_CATEGORIES,
  ALL_LAYER_CATEGORIES,
  getEventTypesByCategory,
} from '@/config/event-types';

interface LayerConfigPopupProps {
  enabledLayers: Set<MapEventType>;
  onToggle: (type: MapEventType) => void;
  onSetAll: (types: MapEventType[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

// ─── Category Group ───

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
    <div className="mb-1">
      {/* Category header */}
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1 text-left cursor-pointer hover:bg-terminal-primary/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-terminal-primary-dim text-[10px] w-3">
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
          className="text-[10px] tracking-wide font-mono flex-1"
          style={{
            color: enabledCount > 0
              ? `var(${catConfig.colorVar})`
              : 'var(--color-terminal-primary-dim)',
          }}
        >
          {catConfig.label}
        </span>
        <span className="text-[9px] text-terminal-primary-dim font-mono">
          {enabledCount}/{totalCount}
        </span>
      </button>

      {/* Expanded type list */}
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
                  className="text-[10px] font-mono w-3 text-center"
                  style={{
                    color: active ? `var(${reg.colorVar})` : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 1 : 0.3,
                  }}
                >
                  {active ? '☑' : '☐'}
                </span>
                <span
                  className="text-[10px] font-mono w-3 text-center"
                  style={{
                    color: active ? `var(${reg.colorVar})` : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 0.8 : 0.2,
                  }}
                >
                  {reg.symbol}
                </span>
                <span
                  className="text-[9px] font-mono flex-1 tracking-wide"
                  style={{
                    color: active ? 'var(--color-terminal-primary)' : 'var(--color-terminal-primary-dim)',
                    opacity: active ? 0.9 : 0.4,
                  }}
                >
                  {reg.label}
                </span>
                <span
                  className="text-[8px] font-mono text-terminal-primary-dim"
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

// ─── Main Popup ───

export function LayerConfigPopup({
  enabledLayers,
  onToggle,
  onSetAll,
  onResetDefaults,
  onClose,
}: LayerConfigPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAllOn = useCallback(() => {
    const allTypes = Object.keys(EVENT_TYPE_REGISTRY) as MapEventType[];
    onSetAll(allTypes);
  }, [onSetAll]);

  const handleAllOff = useCallback(() => {
    onSetAll([]);
  }, [onSetAll]);

  const totalEnabled = enabledLayers.size;
  const totalTypes = Object.keys(EVENT_TYPE_REGISTRY).length;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-1 z-50 font-mono"
      style={{
        width: '240px',
        maxHeight: '420px',
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
          [ LAYER CONFIG ]
        </span>
        <span className="text-terminal-primary-dim text-[9px]">
          {totalEnabled}/{totalTypes}
        </span>
      </div>

      {/* Bulk controls */}
      <div
        className="flex items-center gap-2 px-2 py-1"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
      >
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={handleAllOn}
        >
          [ALL ON]
        </button>
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={handleAllOff}
        >
          [ALL OFF]
        </button>
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={onResetDefaults}
        >
          [DEFAULTS]
        </button>
        <div className="flex-1" />
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={onClose}
        >
          [×]
        </button>
      </div>

      {/* Category groups — scrollable */}
      <div
        className="overflow-y-auto py-1"
        style={{ maxHeight: '340px' }}
      >
        {ALL_LAYER_CATEGORIES.map((category, i) => (
          <CategoryGroup
            key={category}
            category={category}
            enabledLayers={enabledLayers}
            onToggle={onToggle}
            defaultExpanded={i < 4} // First 4 categories expanded by default
          />
        ))}
      </div>
    </div>
  );
}
