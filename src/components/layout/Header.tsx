import { useState, useRef, useEffect, useMemo } from 'react';
import { useClock } from '@/hooks/useClock';
import { useDropdown } from '@/hooks/useDropdown';
import { useAppStore } from '@/store/app-store';
import { format } from 'date-fns';
import { LAYOUT_PRESETS } from '@/config/layout-presets';
import { FEED_MODES } from '@/config/feed-modes';
import { ALL_PANEL_IDS, PANEL_LABELS, PANEL_IDS } from '@/config/constants';
import type { LayoutPresetName, ThemeColor, FeedFocusMode } from '@/types';

const FOCUS_MODE_ORDER: FeedFocusMode[] = ['ops', 'markets', 'all'];

const THEME_ORDER: ThemeColor[] = ['green', 'amber', 'cyan', 'red', 'white'];
const THEME_LABELS: Record<ThemeColor, string> = {
  green: 'GRN',
  amber: 'AMB',
  cyan: 'CYN',
  red: 'RED',
  white: 'WHT',
};

// ─── Panel Category Groups for organized dropdown ───

interface PanelGroup {
  label: string;
  ids: string[];
}

const PANEL_GROUPS: PanelGroup[] = [
  {
    label: 'CORE',
    ids: [
      PANEL_IDS.WORLD_MAP, PANEL_IDS.LIVE_FEED, PANEL_IDS.WORLD_STATUS,
      PANEL_IDS.REGION_MONITOR, PANEL_IDS.THREAT_BOARD, PANEL_IDS.SYSTEM_STATUS,
      PANEL_IDS.MARKET_TERMINAL,
    ],
  },
  {
    label: 'INTELLIGENCE',
    ids: [
      PANEL_IDS.AI_ANALYTICS, PANEL_IDS.AI_STRATEGIC_POSTURE, PANEL_IDS.INTEL_FEED,
      PANEL_IDS.CONFLICT_TRACKER, PANEL_IDS.CII_INDEX, PANEL_IDS.PREDICTION_MARKETS,
    ],
  },
  {
    label: 'SITUATIONAL',
    ids: [
      PANEL_IDS.EMERGENCY_ALERTS, PANEL_IDS.WEATHER_MONITOR,
      PANEL_IDS.LIVE_NEWS, PANEL_IDS.TRANSPORTATION_INTEL,
    ],
  },
  {
    label: 'OSINT & FEEDS',
    ids: [
      PANEL_IDS.TELEGRAM_FEED, PANEL_IDS.DISPLACEMENT_TRACKER,
    ],
  },
  {
    label: 'MARKETS & ECON',
    ids: [
      PANEL_IDS.CRYPTO_MONITOR, PANEL_IDS.ENERGY_ANALYTICS,
      PANEL_IDS.ECONOMIC_INDICATORS, PANEL_IDS.SUPPLY_CHAIN,
    ],
  },
  {
    label: 'UTILITY',
    ids: [PANEL_IDS.WORLD_CLOCK],
  },
];

export function Header() {
  const now = useClock();
  const {
    activeLayout, setActiveLayout,
    colorScheme, setColorScheme,
    crtEnabled, toggleCrt,
    enabledPanels, togglePanel,
    feedFocusMode, setFeedFocusMode,
  } = useAppStore();

  // ─── Layout dropdown ───
  const layoutDropdown = useDropdown();

  // ─── CFG dropdown ───
  const cfgDropdown = useDropdown();
  const [cfgSearch, setCfgSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const utcTime = format(now, 'dd MMM yyyy  HH:mm:ss');

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(colorScheme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setColorScheme(next);
  };

  // Auto-focus search when CFG dropdown opens
  useEffect(() => {
    if (cfgDropdown.isOpen && searchRef.current) {
      searchRef.current.focus();
    }
    if (!cfgDropdown.isOpen) {
      setCfgSearch('');
    }
  }, [cfgDropdown.isOpen]);

  // Filtered panel groups based on search
  const filteredGroups = useMemo(() => {
    if (!cfgSearch) return PANEL_GROUPS;

    const term = cfgSearch.toLowerCase();
    return PANEL_GROUPS.map((group) => ({
      ...group,
      ids: group.ids.filter((id) => {
        const label = PANEL_LABELS[id] || id;
        return label.toLowerCase().includes(term) || group.label.toLowerCase().includes(term);
      }),
    })).filter((group) => group.ids.length > 0);
  }, [cfgSearch]);

  // Bulk toggle helpers
  const enableAll = () => {
    const allIds = ALL_PANEL_IDS.filter((id) => !enabledPanels.includes(id));
    allIds.forEach((id) => togglePanel(id));
  };
  const disableNonCore = () => {
    const coreIds = PANEL_GROUPS[0].ids;
    enabledPanels
      .filter((id) => !coreIds.includes(id))
      .forEach((id) => togglePanel(id));
  };

  return (
    <header className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border bg-terminal-bg-header shrink-0">
      {/* Left: Title */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-[0.2em] text-glow">GLOBEOPS</span>
        <span className="text-terminal-primary-dim text-xs">v1.0.0</span>
      </div>

      {/* Center: Clock */}
      <div className="text-xs tracking-wider text-terminal-primary-dim">
        <span className="text-terminal-primary text-glow">{utcTime}</span>
        <span className="ml-1">UTC</span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 text-xs">
        {/* Feed Focus Mode toggle */}
        <div className="flex items-center gap-1">
          <span className="text-terminal-primary-dim">FOCUS:</span>
          {FOCUS_MODE_ORDER.map((mode) => (
            <button
              key={mode}
              onClick={() => setFeedFocusMode(mode)}
              className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
                feedFocusMode === mode
                  ? 'text-terminal-primary text-glow border border-terminal-border'
                  : 'text-terminal-primary-dim hover:text-terminal-primary'
              }`}
              title={FEED_MODES[mode].description}
            >
              {FEED_MODES[mode].label}
            </button>
          ))}
        </div>

        <span className="text-terminal-border">│</span>

        {/* Layout selector — compact dropdown */}
        <div className="relative" ref={layoutDropdown.ref}>
          <button
            onClick={layoutDropdown.toggle}
            className="px-1 cursor-pointer transition-colors text-terminal-primary-dim hover:text-terminal-primary"
          >
            [<span className="text-terminal-primary-dim">LAYOUT: </span>
            <span className="text-terminal-primary text-glow">
              {LAYOUT_PRESETS[activeLayout].label}
            </span> ▾]
          </button>

          {layoutDropdown.isOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 font-mono"
              style={{
                width: '260px',
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
                  [ LAYOUT SELECT ]
                </span>
                <button
                  className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
                  onClick={layoutDropdown.close}
                >
                  [×]
                </button>
              </div>

              {/* Options */}
              <div className="py-1">
                {(Object.keys(LAYOUT_PRESETS) as LayoutPresetName[]).map((key) => {
                  const preset = LAYOUT_PRESETS[key];
                  const isActive = activeLayout === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setActiveLayout(key); layoutDropdown.close(); }}
                      className="w-full flex flex-col px-2 py-1.5 text-left cursor-pointer hover:bg-terminal-bg-highlight transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono w-3 text-center"
                          style={{
                            color: isActive ? 'var(--color-terminal-primary)' : 'var(--color-terminal-primary-dim)',
                            opacity: isActive ? 1 : 0.3,
                          }}
                        >
                          {isActive ? '▸' : ' '}
                        </span>
                        <span
                          className={`text-[10px] tracking-wide ${isActive ? 'text-terminal-primary text-glow' : 'text-terminal-primary-dim'}`}
                        >
                          {preset.label}
                        </span>
                      </div>
                      <span
                        className="text-[8px] text-terminal-primary-dim ml-5"
                        style={{ opacity: 0.5 }}
                      >
                        {preset.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme cycle */}
        <button
          onClick={cycleTheme}
          className="text-terminal-primary-dim hover:text-terminal-primary px-1"
        >
          [{THEME_LABELS[colorScheme]}]
        </button>

        {/* Module config — category-grouped dropdown with search */}
        <div className="relative" ref={cfgDropdown.ref}>
          <button
            onClick={cfgDropdown.toggle}
            className="text-terminal-primary-dim hover:text-terminal-primary px-1"
          >
            [CFG]
            <span className="ml-1 text-terminal-primary">
              {enabledPanels.length}/{ALL_PANEL_IDS.length}
            </span>
          </button>
          {cfgDropdown.isOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 terminal-border p-2 min-w-[220px] max-h-[70vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--color-terminal-bg)' }}
            >
              {/* Search box with inline bulk controls */}
              <div className="flex items-center gap-1 mb-1 pb-1 border-b border-terminal-border">
                <span className="text-terminal-primary-dim text-[9px]">{'\u25B8'}</span>
                <input
                  ref={searchRef}
                  type="text"
                  value={cfgSearch}
                  onChange={(e) => setCfgSearch(e.target.value)}
                  placeholder="search modules..."
                  className="flex-1 bg-transparent text-terminal-primary text-[10px] outline-none placeholder:text-terminal-primary-dim/40 caret-terminal-primary"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  onClick={enableAll}
                  className="text-[8px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
                >
                  [ALL]
                </button>
                <button
                  onClick={disableNonCore}
                  className="text-[8px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
                >
                  [CORE]
                </button>
              </div>

              {/* Category-grouped panels */}
              {filteredGroups.map((group) => {
                const activeInGroup = group.ids.filter((id) => enabledPanels.includes(id)).length;
                return (
                  <div key={group.label} className="mb-1">
                    <div className="flex items-center justify-between text-[8px] text-terminal-primary-dim tracking-widest py-0.5 border-b border-terminal-border/50">
                      <span>{group.label}</span>
                      <span>{activeInGroup}/{group.ids.length}</span>
                    </div>
                    {group.ids.map((id) => {
                      const active = enabledPanels.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => togglePanel(id)}
                          className="flex items-center gap-1.5 w-full py-0.5 hover:bg-terminal-bg-highlight text-left text-[10px] cursor-pointer"
                        >
                          <span
                            className="text-[10px] font-mono w-3 text-center"
                            style={{
                              color: active
                                ? 'var(--color-terminal-primary)'
                                : 'var(--color-terminal-primary-dim)',
                              opacity: active ? 1 : 0.3,
                            }}
                          >
                            {active ? '☑' : '☐'}
                          </span>
                          <span className={active ? 'text-terminal-primary' : 'text-terminal-primary-dim'} style={{ opacity: active ? 0.9 : 0.4 }}>
                            {PANEL_LABELS[id] || id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CRT toggle */}
        <button
          onClick={toggleCrt}
          className="text-terminal-primary-dim hover:text-terminal-primary px-1"
        >
          CRT:{crtEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  );
}
