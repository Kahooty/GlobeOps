/**
 * FeedFilterPopup — Reusable CLI-themed filter popup for feed panels.
 *
 * Follows the visual pattern of LayerConfigPopup:
 * - Header with active count
 * - Bulk controls: [ALL] [NONE] [×]
 * - Checkbox list with colored indicators
 * - Escape key and click-outside to dismiss
 */

import { useRef, useEffect, useCallback } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  colorVar?: string;
}

interface FeedFilterPopupProps {
  title?: string;
  options: FilterOption[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onSetAll: (ids: string[]) => void;
  onClose: () => void;
}

export function FeedFilterPopup({
  title = 'FEED FILTER',
  options,
  enabledIds,
  onToggle,
  onSetAll,
  onClose,
}: FeedFilterPopupProps) {
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
    onSetAll(options.map((o) => o.id));
  }, [onSetAll, options]);

  const handleAllOff = useCallback(() => {
    onSetAll([]);
  }, [onSetAll]);

  const activeCount = enabledIds.size;
  const totalCount = options.length;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-1 z-50 font-mono"
      style={{
        width: '220px',
        maxHeight: '360px',
        backgroundColor: 'var(--color-terminal-bg)',
        border: '1px solid var(--color-terminal-border)',
        boxShadow:
          '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 8px color-mix(in srgb, var(--color-terminal-primary) 10%, transparent)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
      >
        <span className="text-terminal-primary text-[10px] tracking-widest">
          [ {title} ]
        </span>
        <span className="text-terminal-primary-dim text-[9px]">
          {activeCount}/{totalCount}
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
          [ALL]
        </button>
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={handleAllOff}
        >
          [NONE]
        </button>
        <div className="flex-1" />
        <button
          className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
          onClick={onClose}
        >
          [×]
        </button>
      </div>

      {/* Options list — scrollable */}
      <div className="overflow-y-auto py-1" style={{ maxHeight: '280px' }}>
        {options.map((option) => {
          const active = enabledIds.has(option.id);
          const colorVar = option.colorVar ?? '--color-terminal-primary';

          return (
            <button
              key={option.id}
              className="w-full flex items-center gap-1.5 px-2 py-0.5 text-left cursor-pointer hover:bg-terminal-primary/5 transition-opacity"
              onClick={() => onToggle(option.id)}
            >
              <span
                className="text-[10px] font-mono w-3 text-center"
                style={{
                  color: active
                    ? `var(${colorVar})`
                    : 'var(--color-terminal-primary-dim)',
                  opacity: active ? 1 : 0.3,
                }}
              >
                {active ? '☑' : '☐'}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: active
                    ? `var(${colorVar})`
                    : 'var(--color-terminal-primary-dim)',
                  boxShadow: active ? `0 0 3px var(${colorVar})` : 'none',
                  opacity: active ? 1 : 0.2,
                }}
              />
              <span
                className="text-[9px] font-mono flex-1 tracking-wide"
                style={{
                  color: active
                    ? 'var(--color-terminal-primary)'
                    : 'var(--color-terminal-primary-dim)',
                  opacity: active ? 0.9 : 0.4,
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
