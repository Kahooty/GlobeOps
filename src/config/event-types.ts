/**
 * Event Type Registry — Single source of truth for all map event type
 * visual configuration (symbol, color, label, category, zoom behavior).
 *
 * Replaces inline TYPE_CONFIG in overlay-classifier.ts and
 * LAYER_CONFIG in MapLayerToggles.tsx.
 */

import type { MapEventType, MapEventTypeConfig, MapLayerCategory } from '@/types';

// ─── Complete Event Type Registry ───

export const EVENT_TYPE_REGISTRY: Record<MapEventType, MapEventTypeConfig> = {
  // ─── Natural Events & Disasters ───
  earthquake: {
    type: 'earthquake',
    symbol: '●',
    colorVar: '--color-terminal-amber',
    label: 'EQ',
    category: 'natural',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  'natural-event': {
    type: 'natural-event',
    symbol: '◎',
    colorVar: '--color-terminal-amber',
    label: 'NAT',
    category: 'natural',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  'climate-anomaly': {
    type: 'climate-anomaly',
    symbol: '◇',
    colorVar: '--color-terminal-amber',
    label: 'CLIM',
    category: 'natural',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  weather: {
    type: 'weather',
    symbol: '≋',
    colorVar: '--color-terminal-amber',
    label: 'WX',
    category: 'natural',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },

  // ─── Conflict ───
  'armed-conflict': {
    type: 'armed-conflict',
    symbol: '✦',
    colorVar: '--color-terminal-red',
    label: 'WAR',
    category: 'conflict',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  'military-activity': {
    type: 'military-activity',
    symbol: '▲',
    colorVar: '--color-terminal-red',
    label: 'MIL',
    category: 'conflict',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  protest: {
    type: 'protest',
    symbol: '⚑',
    colorVar: '--color-terminal-amber',
    label: 'PROT',
    category: 'conflict',
    minZoom: 2,
    isStatic: false,
    defaultEnabled: true,
  },

  // ─── Intelligence ───
  'intel-hotspot': {
    type: 'intel-hotspot',
    symbol: '◉',
    colorVar: '--color-terminal-coral',
    label: 'INTEL',
    category: 'intel',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  'conflict-zone': {
    type: 'conflict-zone',
    symbol: '⊗',
    colorVar: '--color-terminal-coral',
    label: 'CZ',
    category: 'intel',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  'cyber-threat': {
    type: 'cyber-threat',
    symbol: '⟁',
    colorVar: '--color-terminal-coral',
    label: 'CYBER',
    category: 'intel',
    minZoom: 2,
    isStatic: false,
    defaultEnabled: true,
  },
  'cii-instability': {
    type: 'cii-instability',
    symbol: '⊘',
    colorVar: '--color-terminal-coral',
    label: 'CII',
    category: 'intel',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },

  // ─── Infrastructure (Static) ───
  'military-base': {
    type: 'military-base',
    symbol: '▣',
    colorVar: '--color-terminal-steel',
    label: 'BASE',
    category: 'infrastructure',
    minZoom: 3,
    isStatic: true,
    defaultEnabled: false,
  },
  'nuclear-site': {
    type: 'nuclear-site',
    symbol: '⊛',
    colorVar: '--color-terminal-steel',
    label: 'NUC',
    category: 'infrastructure',
    minZoom: 3,
    isStatic: true,
    defaultEnabled: false,
  },
  pipeline: {
    type: 'pipeline',
    symbol: '═',
    colorVar: '--color-terminal-green',
    label: 'PIPE',
    category: 'infrastructure',
    minZoom: 3,
    isStatic: true,
    defaultEnabled: false,
  },
  'data-center': {
    type: 'data-center',
    symbol: '◈',
    colorVar: '--color-terminal-steel',
    label: 'DC',
    category: 'infrastructure',
    minZoom: 4,
    isStatic: true,
    defaultEnabled: false,
  },

  // ─── Transport ───
  'ship-traffic': {
    type: 'ship-traffic',
    symbol: '⊞',
    colorVar: '--color-terminal-cyan',
    label: 'SHIP',
    category: 'transport',
    minZoom: 2,
    isStatic: false,
    defaultEnabled: false,
  },
  'plane-traffic': {
    type: 'plane-traffic',
    symbol: '✈',
    colorVar: '--color-terminal-cyan',
    label: 'AIR',
    category: 'transport',
    minZoom: 2,
    isStatic: false,
    defaultEnabled: false,
  },
  'aviation-activity': {
    type: 'aviation-activity',
    symbol: '▷',
    colorVar: '--color-terminal-cyan',
    label: 'AVI',
    category: 'transport',
    minZoom: 3,
    isStatic: false,
    defaultEnabled: false,
  },

  // ─── Economic ───
  'trade-activity': {
    type: 'trade-activity',
    symbol: '◆',
    colorVar: '--color-terminal-green',
    label: 'TRADE',
    category: 'economic',
    minZoom: 2,
    isStatic: false,
    defaultEnabled: true,
  },
  'trade-route': {
    type: 'trade-route',
    symbol: '─',
    colorVar: '--color-terminal-green',
    label: 'ROUTE',
    category: 'economic',
    minZoom: 2,
    isStatic: true,
    defaultEnabled: false,
  },
  'economic-center': {
    type: 'economic-center',
    symbol: '◇',
    colorVar: '--color-terminal-green',
    label: 'ECON',
    category: 'economic',
    minZoom: 3,
    isStatic: true,
    defaultEnabled: false,
  },
  'critical-mineral': {
    type: 'critical-mineral',
    symbol: '⬡',
    colorVar: '--color-terminal-green',
    label: 'MNRL',
    category: 'economic',
    minZoom: 3,
    isStatic: true,
    defaultEnabled: false,
  },

  // ─── News & Analysis (existing) ───
  news: {
    type: 'news',
    symbol: '◆',
    colorVar: '--color-terminal-teal',
    label: 'NEWS',
    category: 'news',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  defense: {
    type: 'defense',
    symbol: '▲',
    colorVar: '--color-terminal-red',
    label: 'DEF',
    category: 'news',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  finance: {
    type: 'finance',
    symbol: '■',
    colorVar: '--color-terminal-green',
    label: 'FIN',
    category: 'news',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  tech: {
    type: 'tech',
    symbol: '◈',
    colorVar: '--color-terminal-magenta',
    label: 'TECH',
    category: 'news',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },

  // ─── Humanitarian ───
  'displacement-flow': {
    type: 'displacement-flow',
    symbol: '⤳',
    colorVar: '--color-terminal-gold',
    label: 'DISP',
    category: 'humanitarian',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  'humanitarian-crisis': {
    type: 'humanitarian-crisis',
    symbol: '⊕',
    colorVar: '--color-terminal-red',
    label: 'CRISIS',
    category: 'humanitarian',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },
  'disaster-alert': {
    type: 'disaster-alert',
    symbol: '⚠',
    colorVar: '--color-terminal-amber',
    label: 'ALERT',
    category: 'natural',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: true,
  },

  // ─── Strategic ───
  'strategic-waterway': {
    type: 'strategic-waterway',
    symbol: '≈',
    colorVar: '--color-terminal-purple',
    label: 'STRAIT',
    category: 'strategic',
    minZoom: 2,
    isStatic: true,
    defaultEnabled: false,
  },
  'gps-outage': {
    type: 'gps-outage',
    symbol: '⊘',
    colorVar: '--color-terminal-red',
    label: 'GPS',
    category: 'strategic',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  'internet-outage': {
    type: 'internet-outage',
    symbol: '⊗',
    colorVar: '--color-terminal-red',
    label: 'NET',
    category: 'strategic',
    minZoom: 1,
    isStatic: false,
    defaultEnabled: true,
  },
  'orbital-surveillance': {
    type: 'orbital-surveillance',
    symbol: '⊕',
    colorVar: '--color-terminal-purple',
    label: 'SAT',
    category: 'strategic',
    minZoom: 3,
    isStatic: false,
    defaultEnabled: false,
  },
  'day-night-terminator': {
    type: 'day-night-terminator',
    symbol: '░',
    colorVar: '--color-terminal-primary-dim',
    label: 'D/N',
    category: 'strategic',
    minZoom: 0,
    isStatic: false,
    defaultEnabled: false,
  },
};

// ─── Layer Category Configuration ───

export interface LayerCategoryConfig {
  category: MapLayerCategory;
  label: string;
  colorVar: string;
  description: string;
  defaultEnabled: boolean;
}

export const LAYER_CATEGORIES: Record<MapLayerCategory, LayerCategoryConfig> = {
  natural: {
    category: 'natural',
    label: 'NATURAL / WX',
    colorVar: '--color-terminal-amber',
    description: 'Earthquakes, volcanoes, wildfires, storms, floods, weather alerts, climate anomalies',
    defaultEnabled: true,
  },
  conflict: {
    category: 'conflict',
    label: 'CONFLICT',
    colorVar: '--color-terminal-red',
    description: 'Armed conflicts, military activity, protests',
    defaultEnabled: true,
  },
  intel: {
    category: 'intel',
    label: 'INTEL',
    colorVar: '--color-terminal-coral',
    description: 'Intelligence hotspots, conflict zones, cyber threats',
    defaultEnabled: true,
  },
  infrastructure: {
    category: 'infrastructure',
    label: 'INFRA',
    colorVar: '--color-terminal-steel',
    description: 'Military bases, nuclear sites, pipelines, data centers',
    defaultEnabled: false,
  },
  transport: {
    category: 'transport',
    label: 'TRANSPORT',
    colorVar: '--color-terminal-cyan',
    description: 'Ship traffic, aircraft, aviation activity',
    defaultEnabled: false,
  },
  economic: {
    category: 'economic',
    label: 'ECONOMIC',
    colorVar: '--color-terminal-green',
    description: 'Trade activity, routes, economic centers, minerals',
    defaultEnabled: true,
  },
  news: {
    category: 'news',
    label: 'NEWS',
    colorVar: '--color-terminal-teal',
    description: 'News, defense reporting, finance, tech',
    defaultEnabled: true,
  },
  tech: {
    category: 'tech',
    label: 'TECH',
    colorVar: '--color-terminal-magenta',
    description: 'Technology sector events',
    defaultEnabled: true,
  },
  humanitarian: {
    category: 'humanitarian',
    label: 'HUMAN',
    colorVar: '--color-terminal-gold',
    description: 'Displacement flows, refugee movements',
    defaultEnabled: true,
  },
  strategic: {
    category: 'strategic',
    label: 'STRATEGIC',
    colorVar: '--color-terminal-purple',
    description: 'Waterways, outages, satellites, day/night',
    defaultEnabled: false,
  },
};

// ─── Derived Helpers ───

/** All event types as an array */
export const ALL_EVENT_TYPES = Object.keys(EVENT_TYPE_REGISTRY) as MapEventType[];

/** All layer categories as an array */
export const ALL_LAYER_CATEGORIES = Object.keys(LAYER_CATEGORIES) as MapLayerCategory[];

/** Get event types belonging to a specific category */
export function getEventTypesByCategory(category: MapLayerCategory): MapEventTypeConfig[] {
  return ALL_EVENT_TYPES
    .map((t) => EVENT_TYPE_REGISTRY[t])
    .filter((c) => c.category === category);
}

/** Get default-enabled event types — returns ALL types (start fully unlocked) */
export function getDefaultEnabledTypes(): Set<MapEventType> {
  return new Set(ALL_EVENT_TYPES);
}

/** Get default-enabled layer categories — returns ALL categories (start fully unlocked) */
export function getDefaultEnabledCategories(): Set<MapLayerCategory> {
  return new Set(ALL_LAYER_CATEGORIES);
}

/** Get event types visible at a given zoom level */
export function getVisibleTypesAtZoom(zoomLevel: number): MapEventTypeConfig[] {
  return ALL_EVENT_TYPES
    .map((t) => EVENT_TYPE_REGISTRY[t])
    .filter((c) => c.minZoom <= zoomLevel);
}

/** Get type config (symbol, color, label) — backward-compat with overlay-classifier */
export function getTypeConfig(type: MapEventType) {
  const config = EVENT_TYPE_REGISTRY[type];
  return {
    symbol: config.symbol,
    colorVar: config.colorVar,
    defaultLabel: config.label,
  };
}
