import type { MapEventType, MapFilterPresetName, MapDisplayOptions, MapDataSources } from '@/types';

export interface MapFilterPreset {
  name: MapFilterPresetName;
  label: string;
  description: string;
  enabledTypes: MapEventType[] | null; // null = use all defaults
  dataSources: Partial<MapDataSources>;
  displayOptions: Partial<MapDisplayOptions>;
}

export const MAP_FILTER_PRESETS: Record<MapFilterPresetName, MapFilterPreset> = {
  conflict: {
    name: 'conflict',
    label: 'CONFLICT',
    description: 'Armed conflicts, military, intel, protests',
    enabledTypes: [
      'armed-conflict', 'military-activity', 'protest',
      'intel-hotspot', 'conflict-zone', 'cyber-threat', 'cii-instability',
      'displacement-flow', 'gps-outage', 'internet-outage',
      'news', 'defense',
    ],
    dataSources: { usgsEarthquakes: false, nasaEonet: false, rssFeeds: true },
    displayOptions: { heatmap: true, labels: true, animations: true, dayNight: false, staticInfra: false, polylines: false },
  },
  natural: {
    name: 'natural',
    label: 'NATURAL',
    description: 'Natural events & disasters, weather, climate',
    enabledTypes: [
      'earthquake', 'natural-event', 'climate-anomaly', 'weather',
      'day-night-terminator',
    ],
    dataSources: { usgsEarthquakes: true, nasaEonet: true, rssFeeds: false },
    displayOptions: { heatmap: true, labels: true, animations: true, dayNight: true, staticInfra: false, polylines: false },
  },
  economic: {
    name: 'economic',
    label: 'ECON',
    description: 'Trade, finance, energy, commodities',
    enabledTypes: [
      'trade-activity', 'trade-route', 'economic-center', 'critical-mineral',
      'finance', 'ship-traffic', 'pipeline',
    ],
    dataSources: { usgsEarthquakes: false, nasaEonet: false, rssFeeds: true },
    displayOptions: { heatmap: false, labels: true, animations: true, staticInfra: true, polylines: true, dayNight: false },
  },
  all: {
    name: 'all',
    label: 'ALL',
    description: 'All event types and data sources',
    enabledTypes: null, // null = all defaults
    dataSources: { usgsEarthquakes: true, nasaEonet: true, rssFeeds: true },
    displayOptions: { heatmap: true, labels: true, animations: true, dayNight: false, staticInfra: false, polylines: true },
  },
};

export const MAP_FILTER_PRESET_ORDER: MapFilterPresetName[] = ['conflict', 'natural', 'economic', 'all'];
