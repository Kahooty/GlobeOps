import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutPresetName, ThemeColor, Region, MapEventType, MapLayerCategory, MapEvent, FeedFocusMode, MapDataSources, MapDisplayOptions, MapFilterPresetName, AiProvider } from '@/types';
import { CORE_PANEL_IDS } from '@/config/constants';
import { getDefaultEnabledTypes, getDefaultEnabledCategories, ALL_EVENT_TYPES } from '@/config/event-types';
import { MAP_FILTER_PRESETS } from '@/config/map-presets';
import { LAYOUT_PRESETS } from '@/config/layout-presets';

interface AppState {
  // Theme
  colorScheme: ThemeColor;
  setColorScheme: (scheme: ThemeColor) => void;
  crtEnabled: boolean;
  toggleCrt: () => void;

  // Layout
  activeLayout: LayoutPresetName;
  setActiveLayout: (layout: LayoutPresetName) => void;

  // Module toggles
  enabledPanels: string[];
  togglePanel: (panelId: string) => void;

  // Filters
  activeCategories: string[];
  toggleCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Region
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;

  // Panel focus
  focusedPanel: string | null;
  setFocusedPanel: (panel: string | null) => void;

  // ─── Map Layer System (global, replaces WorldMapPanel local state) ───

  // Top-level category toggles
  enabledLayerCategories: MapLayerCategory[];
  toggleLayerCategory: (category: MapLayerCategory) => void;
  setLayerCategories: (categories: MapLayerCategory[]) => void;

  // Fine-grained event type toggles
  enabledEventTypes: MapEventType[];
  toggleEventType: (type: MapEventType) => void;
  setEventTypes: (types: MapEventType[]) => void;
  resetEventTypesToDefaults: () => void;

  // ─── Map Data Sources & Display Options ───

  mapDataSources: MapDataSources;
  toggleMapDataSource: (key: keyof MapDataSources) => void;

  mapDisplayOptions: MapDisplayOptions;
  toggleMapDisplayOption: (key: keyof MapDisplayOptions) => void;

  applyMapPreset: (preset: MapFilterPresetName) => void;

  // ─── Map Interaction State (non-persisted) ───

  // Selected event for detail drill-down
  mapSelectedEvent: MapEvent | null;
  setMapSelectedEvent: (event: MapEvent | null) => void;

  // Detail panel target (event ID)
  detailPanelTarget: string | null;
  setDetailPanelTarget: (target: string | null) => void;

  // ─── Feed Focus Mode (master content filter) ───
  feedFocusMode: FeedFocusMode;
  setFeedFocusMode: (mode: FeedFocusMode) => void;

  // ─── AI Provider ───
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;

  // ─── Welcome Modal ───
  welcomeDismissed: boolean;
  dismissWelcome: () => void;
}

// Default values computed from registry
const defaultEnabledTypes = Array.from(getDefaultEnabledTypes());
const defaultEnabledCategories = Array.from(getDefaultEnabledCategories());

const DEFAULT_MAP_DATA_SOURCES: MapDataSources = {
  usgsEarthquakes: true,
  nasaEonet: true,
  rssFeeds: true,
  reliefWeb: true,
  gdacs: true,
};

const DEFAULT_MAP_DISPLAY_OPTIONS: MapDisplayOptions = {
  heatmap: true,
  labels: true,
  animations: true,
  dayNight: false,
  staticInfra: false,
  polylines: true,
  boundaries: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      colorScheme: 'white',
      setColorScheme: (colorScheme) => set({ colorScheme }),
      crtEnabled: true,
      toggleCrt: () => set((s) => ({ crtEnabled: !s.crtEnabled })),

      activeLayout: 'ops-center',
      setActiveLayout: (layoutKey) => {
        const preset = LAYOUT_PRESETS[layoutKey];
        const presetPanelIds = preset.layout.map((item) => item.i);
        set({ activeLayout: layoutKey, enabledPanels: presetPanelIds });
      },

      enabledPanels: [...CORE_PANEL_IDS],
      togglePanel: (panelId) =>
        set((s) => ({
          enabledPanels: s.enabledPanels.includes(panelId)
            ? s.enabledPanels.filter((id) => id !== panelId)
            : [...s.enabledPanels, panelId],
        })),

      activeCategories: [],
      toggleCategory: (cat) =>
        set((s) => ({
          activeCategories: s.activeCategories.includes(cat)
            ? s.activeCategories.filter((c) => c !== cat)
            : [...s.activeCategories, cat],
        })),
      searchTerm: '',
      setSearchTerm: (searchTerm) => set({ searchTerm }),

      selectedRegion: null,
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),

      focusedPanel: null,
      setFocusedPanel: (focusedPanel) => set({ focusedPanel }),

      // ─── Map Layer System ───

      enabledLayerCategories: defaultEnabledCategories,
      toggleLayerCategory: (category) =>
        set((s) => ({
          enabledLayerCategories: s.enabledLayerCategories.includes(category)
            ? s.enabledLayerCategories.filter((c) => c !== category)
            : [...s.enabledLayerCategories, category],
        })),
      setLayerCategories: (categories) =>
        set({ enabledLayerCategories: categories }),

      enabledEventTypes: defaultEnabledTypes,
      toggleEventType: (type) =>
        set((s) => ({
          enabledEventTypes: s.enabledEventTypes.includes(type)
            ? s.enabledEventTypes.filter((t) => t !== type)
            : [...s.enabledEventTypes, type],
        })),
      setEventTypes: (types) =>
        set({ enabledEventTypes: types }),
      resetEventTypesToDefaults: () =>
        set({ enabledEventTypes: defaultEnabledTypes }),

      // ─── Map Data Sources & Display Options ───

      mapDataSources: { ...DEFAULT_MAP_DATA_SOURCES },
      toggleMapDataSource: (key) =>
        set((s) => ({
          mapDataSources: { ...s.mapDataSources, [key]: !s.mapDataSources[key] },
        })),

      mapDisplayOptions: { ...DEFAULT_MAP_DISPLAY_OPTIONS },
      toggleMapDisplayOption: (key) =>
        set((s) => ({
          mapDisplayOptions: { ...s.mapDisplayOptions, [key]: !s.mapDisplayOptions[key] },
        })),

      applyMapPreset: (presetName) =>
        set(() => {
          const preset = MAP_FILTER_PRESETS[presetName];
          const newTypes = preset.enabledTypes
            ? preset.enabledTypes
            : [...ALL_EVENT_TYPES];
          return {
            enabledEventTypes: newTypes,
            mapDataSources: {
              ...DEFAULT_MAP_DATA_SOURCES,
              ...preset.dataSources,
            },
            mapDisplayOptions: {
              ...DEFAULT_MAP_DISPLAY_OPTIONS,
              ...preset.displayOptions,
            },
          };
        }),

      // ─── Map Interaction State ───

      mapSelectedEvent: null,
      setMapSelectedEvent: (mapSelectedEvent) => set({ mapSelectedEvent }),

      detailPanelTarget: null,
      setDetailPanelTarget: (detailPanelTarget) => set({ detailPanelTarget }),

      // ─── Feed Focus Mode ───
      feedFocusMode: 'all',
      setFeedFocusMode: (feedFocusMode) => set({ feedFocusMode }),

      // ─── AI Provider ───
      aiProvider: 'google',
      setAiProvider: (aiProvider) => set({ aiProvider }),

      // ─── Welcome Modal ───
      welcomeDismissed: false,
      dismissWelcome: () => set({ welcomeDismissed: true }),
    }),
    {
      name: 'globeops-settings',
      version: 8,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0) {
          delete state.activeCategories;
          delete state.enabledEventTypes;
          delete state.enabledLayerCategories;
        }
        if (version < 2) {
          state.mapDataSources = DEFAULT_MAP_DATA_SOURCES;
          state.mapDisplayOptions = DEFAULT_MAP_DISPLAY_OPTIONS;
        }
        if (version < 3) {
          // Reset enabledPanels so preset sync takes effect cleanly
          state.enabledPanels = [...CORE_PANEL_IDS];
        }
        if (version < 4) {
          // Remove defunct 'weather' layer category (merged into 'natural')
          if (Array.isArray(state.enabledLayerCategories)) {
            state.enabledLayerCategories = (state.enabledLayerCategories as string[]).filter(c => c !== 'weather');
          }
        }
        if (version < 5) {
          // Add boundaries display option
          const opts = state.mapDisplayOptions as Record<string, boolean> | undefined;
          if (opts && opts.boundaries === undefined) {
            opts.boundaries = true;
          }
        }
        if (version < 6) {
          // Add AI provider preference (default: Google Gemini)
          state.aiProvider = 'google';
        }
        if (version < 7) {
          // Add ReliefWeb + GDACS data source toggles
          const sources = state.mapDataSources as Record<string, boolean> | undefined;
          if (sources) {
            if (sources.reliefWeb === undefined) sources.reliefWeb = true;
            if (sources.gdacs === undefined) sources.gdacs = true;
          }
        }
        if (version < 8) {
          state.welcomeDismissed = state.welcomeDismissed ?? false;
        }
        return state as Partial<AppState>;
      },
      // Only persist UI preferences — filter state starts fully unlocked on every load
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        crtEnabled: state.crtEnabled,
        activeLayout: state.activeLayout,
        enabledPanels: state.enabledPanels,
        searchTerm: state.searchTerm,
        selectedRegion: state.selectedRegion,
        feedFocusMode: state.feedFocusMode,
        mapDataSources: state.mapDataSources,
        mapDisplayOptions: state.mapDisplayOptions,
        aiProvider: state.aiProvider,
        welcomeDismissed: state.welcomeDismissed,
      }),
    }
  )
);
