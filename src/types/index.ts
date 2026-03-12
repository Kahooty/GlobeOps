// ─── Feed Types ───

export type FeedCategory =
  | 'world-news'
  | 'us-news'
  | 'defense'
  | 'government'
  | 'think-tanks'
  | 'finance'
  | 'tech'
  | 'regional-asia'
  | 'regional-europe'
  | 'regional-mideast'
  | 'regional-africa'
  | 'regional-latam'
  | 'science'
  | 'energy'
  | 'humanitarian'
  | 'cybersecurity'
  | 'climate'
  | 'commodities';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: FeedCategory;
  refreshInterval: number;
  priority: 'high' | 'medium' | 'low';
}

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  sourceId: string;
  category: FeedCategory;
  snippet: string;
}

// ─── Earthquake Types ───

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
  coordinates: [number, number];
  url: string;
  tsunami: boolean;
  severity: 'minor' | 'moderate' | 'major' | 'great';
}

// ─── Market Types ───

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

// ─── Layout Types ───

export type LayoutPresetName = 'ops-center' | 'focused' | 'compact' | 'intelligence' | 'situational' | 'markets' | 'analyst' | 'full-spectrum' | 'full-module';

export type ThemeColor = 'green' | 'amber' | 'cyan' | 'red' | 'white';

export type PanelStatus = 'live' | 'stale' | 'error' | 'offline' | 'loading';

// ─── Region Types ───

export type Region =
  | 'NORTH AMERICA'
  | 'SOUTH AMERICA'
  | 'EUROPE'
  | 'MIDDLE EAST'
  | 'AFRICA'
  | 'SOUTH ASIA'
  | 'EAST ASIA'
  | 'OCEANIA';

// ─── Map Layer Categories (top-level toggle groups) ───

export type MapLayerCategory =
  | 'natural'
  | 'conflict'
  | 'intel'
  | 'infrastructure'
  | 'transport'
  | 'economic'
  | 'news'
  | 'tech'
  | 'humanitarian'
  | 'strategic';

// ─── Map Event Types (fine-grained classification) ───

export type MapEventType =
  // Natural Events & Disasters
  | 'earthquake'
  | 'natural-event'
  | 'climate-anomaly'
  | 'weather'
  // Conflict
  | 'armed-conflict'
  | 'military-activity'
  | 'protest'
  // Intelligence
  | 'intel-hotspot'
  | 'conflict-zone'
  | 'cyber-threat'
  | 'cii-instability'
  // Infrastructure (static)
  | 'military-base'
  | 'nuclear-site'
  | 'pipeline'
  | 'data-center'
  // Transport
  | 'ship-traffic'
  | 'plane-traffic'
  | 'aviation-activity'
  // Economic
  | 'trade-activity'
  | 'trade-route'
  | 'economic-center'
  | 'critical-mineral'
  // News & Analysis (existing)
  | 'news'
  | 'defense'
  | 'finance'
  | 'tech'
  // Humanitarian
  | 'displacement-flow'
  | 'humanitarian-crisis'
  | 'disaster-alert'
  // Strategic
  | 'strategic-waterway'
  | 'gps-outage'
  | 'internet-outage'
  | 'orbital-surveillance'
  | 'day-night-terminator';

// ─── Map Event Type Configuration ───

export interface MapEventTypeConfig {
  type: MapEventType;
  symbol: string;
  colorVar: string;
  label: string;
  category: MapLayerCategory;
  minZoom: number;
  isStatic: boolean;
  defaultEnabled: boolean;
}

// ─── Map Event ───

export interface MapEvent {
  id: string;
  type: MapEventType;
  title: string;
  coordinates: [lon: number, lat: number];
  time: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: Region;
  source: string;
  url?: string;
  meta?: Record<string, unknown>;
}

// ─── Data Source Types ───

export type DataSourceType = 'rss' | 'api-json' | 'api-geojson' | 'static';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  url?: string;
  refreshInterval: number;
  targetEventType: MapEventType;
  category: MapLayerCategory;
  priority: 'high' | 'medium' | 'low';
  requiresApiKey?: boolean;
  apiKeyEnvVar?: string;
}

// ─── Natural Event Types (NASA EONET) ───

export interface NaturalEvent {
  id: string;
  title: string;
  category: string;
  coordinates: [lon: number, lat: number];
  time: Date;
  source: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Feed Focus Mode ───

export type FeedFocusMode = 'ops' | 'markets' | 'all';

// ─── Map Data Sources & Display Options ───

export interface MapDataSources {
  usgsEarthquakes: boolean;
  nasaEonet: boolean;
  rssFeeds: boolean;
  reliefWeb: boolean;
  gdacs: boolean;
}

// ─── ReliefWeb Disaster Types ───

export interface ReliefWebDisaster {
  id: string;
  name: string;
  status: string;
  glide: string;
  type: string;
  country: string;
  date: Date;
  url: string;
}

// ─── GDACS Alert Types ───

export interface GDACSAlert {
  id: string;
  title: string;
  alertLevel: 'Green' | 'Orange' | 'Red';
  eventType: string;
  country: string;
  coordinates: [lon: number, lat: number];
  date: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  population?: number;
  url: string;
}

// ─── ACLED Event Types ───

export interface ACLEDEvent {
  id: string;
  eventType: string;
  country: string;
  location: string;
  coordinates: [lon: number, lat: number];
  date: Date;
  fatalities: number;
  source: string;
  notes?: string;
}

export interface MapDisplayOptions {
  heatmap: boolean;
  labels: boolean;
  animations: boolean;
  dayNight: boolean;
  staticInfra: boolean;
  polylines: boolean;
  boundaries: boolean;
}

export type MapFilterPresetName = 'conflict' | 'natural' | 'economic' | 'all';

// ─── AI Provider Types ───

export type AiProvider = 'google' | 'anthropic' | 'openai' | 'computed';

export type AiBriefingSource = 'google-api' | 'anthropic-api' | 'openai-api' | 'computed';
