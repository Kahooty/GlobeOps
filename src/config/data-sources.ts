/**
 * Data Source Registry — Unified configuration for all data sources.
 *
 * Each source declares its type, URL, refresh interval, target event type,
 * and parser. Consolidates the pattern from feed-sources.ts into a
 * general-purpose registry that covers RSS, APIs, and static datasets.
 */

import type { DataSourceConfig } from '@/types';

// ─── API Refresh Intervals ───

export const API_REFRESH = {
  ACLED: 1_800_000,        // 30 min
  OPENSKY: 30_000,         // 30 sec
  NOAA: 900_000,           // 15 min
  GDELT: 900_000,          // 15 min
  COINGECKO: 60_000,       // 60 sec
  POLYMARKET: 300_000,     // 5 min
  RELIEFWEB: 600_000,       // 10 min
  GDACS: 300_000,           // 5 min
  STATIC: Infinity,         // Never refresh (bundled data)
} as const;

// ─── API Data Sources ───

export const API_DATA_SOURCES: DataSourceConfig[] = [
  // ─── ACLED (Armed Conflict Location & Event Data) ───
  {
    id: 'acled-conflicts',
    name: 'ACLED Conflicts',
    type: 'api-json',
    url: 'https://api.acleddata.com/acled/read',
    refreshInterval: API_REFRESH.ACLED,
    targetEventType: 'armed-conflict',
    category: 'conflict',
    priority: 'high',
    requiresApiKey: true,
    apiKeyEnvVar: 'VITE_ACLED_API_KEY',
  },
  {
    id: 'acled-protests',
    name: 'ACLED Protests',
    type: 'api-json',
    url: 'https://api.acleddata.com/acled/read',
    refreshInterval: API_REFRESH.ACLED,
    targetEventType: 'protest',
    category: 'conflict',
    priority: 'medium',
    requiresApiKey: true,
    apiKeyEnvVar: 'VITE_ACLED_API_KEY',
  },

  // ─── OpenSky Network (Aircraft Tracking) ───
  {
    id: 'opensky-aircraft',
    name: 'OpenSky Aircraft',
    type: 'api-json',
    url: 'https://opensky-network.org/api/states/all',
    refreshInterval: API_REFRESH.OPENSKY,
    targetEventType: 'plane-traffic',
    category: 'transport',
    priority: 'low',
  },

  // ─── NOAA (National Weather Service) ───
  {
    id: 'noaa-alerts',
    name: 'NOAA Weather Alerts',
    type: 'api-geojson',
    url: 'https://api.weather.gov/alerts/active',
    refreshInterval: API_REFRESH.NOAA,
    targetEventType: 'weather',
    category: 'natural',
    priority: 'high',
  },

  // ─── GDELT (Global Events) ───
  {
    id: 'gdelt-events',
    name: 'GDELT Events',
    type: 'api-json',
    url: 'https://api.gdeltproject.org/api/v2/geo/geo',
    refreshInterval: API_REFRESH.GDELT,
    targetEventType: 'intel-hotspot',
    category: 'intel',
    priority: 'medium',
  },

  // ─── CoinGecko (Cryptocurrency) ───
  {
    id: 'coingecko-prices',
    name: 'CoinGecko Prices',
    type: 'api-json',
    url: 'https://api.coingecko.com/api/v3/coins/markets',
    refreshInterval: API_REFRESH.COINGECKO,
    targetEventType: 'trade-activity',
    category: 'economic',
    priority: 'medium',
  },

  // ─── Polymarket (Prediction Markets) ───
  {
    id: 'polymarket-contracts',
    name: 'Polymarket',
    type: 'api-json',
    url: 'https://gamma-api.polymarket.com/markets',
    refreshInterval: API_REFRESH.POLYMARKET,
    targetEventType: 'trade-activity',
    category: 'economic',
    priority: 'low',
  },

  // ─── ReliefWeb (UN OCHA — Humanitarian Crises) ───
  {
    id: 'reliefweb-disasters',
    name: 'ReliefWeb Disasters',
    type: 'api-json',
    url: 'https://api.reliefweb.int/v1/disasters',
    refreshInterval: API_REFRESH.RELIEFWEB,
    targetEventType: 'humanitarian-crisis',
    category: 'humanitarian',
    priority: 'high',
  },

  // ─── GDACS (Global Disaster Alerts) ───
  {
    id: 'gdacs-alerts',
    name: 'GDACS Alerts',
    type: 'api-json',
    url: 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH',
    refreshInterval: API_REFRESH.GDACS,
    targetEventType: 'disaster-alert',
    category: 'natural',
    priority: 'high',
  },
];

// ─── Static Data Sources (bundled TypeScript datasets) ───

export const STATIC_DATA_SOURCES: DataSourceConfig[] = [
  {
    id: 'static-military-bases',
    name: 'Military Installations',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'military-base',
    category: 'infrastructure',
    priority: 'low',
  },
  {
    id: 'static-nuclear-sites',
    name: 'Nuclear Facilities',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'nuclear-site',
    category: 'infrastructure',
    priority: 'low',
  },
  {
    id: 'static-pipelines',
    name: 'Major Pipelines',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'pipeline',
    category: 'infrastructure',
    priority: 'low',
  },
  {
    id: 'static-data-centers',
    name: 'Major Data Centers',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'data-center',
    category: 'infrastructure',
    priority: 'low',
  },
  {
    id: 'static-trade-routes',
    name: 'Maritime Trade Routes',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'trade-route',
    category: 'economic',
    priority: 'low',
  },
  {
    id: 'static-strategic-waterways',
    name: 'Strategic Waterways',
    type: 'static',
    refreshInterval: API_REFRESH.STATIC,
    targetEventType: 'strategic-waterway',
    category: 'strategic',
    priority: 'low',
  },
];

// ─── All Data Sources ───

export const ALL_DATA_SOURCES: DataSourceConfig[] = [
  ...API_DATA_SOURCES,
  ...STATIC_DATA_SOURCES,
];

/** Get data sources by category */
export function getDataSourcesByCategory(category: string): DataSourceConfig[] {
  return ALL_DATA_SOURCES.filter((s) => s.category === category);
}

/** Get data sources by target event type */
export function getDataSourcesByEventType(eventType: string): DataSourceConfig[] {
  return ALL_DATA_SOURCES.filter((s) => s.targetEventType === eventType);
}

/** Check if an API key is configured for a source */
export function isSourceAvailable(source: DataSourceConfig): boolean {
  if (!source.requiresApiKey) return true;
  if (!source.apiKeyEnvVar) return false;
  return !!import.meta.env[source.apiKeyEnvVar];
}
