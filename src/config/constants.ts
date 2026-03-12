// ─── Refresh Intervals (ms) ───
export const REFRESH = {
  RSS_HIGH: 120_000,    // 2 min
  RSS_MEDIUM: 300_000,  // 5 min
  RSS_LOW: 600_000,     // 10 min
  EARTHQUAKES: 120_000, // 2 min
  MARKETS: 30_000,      // 30 sec
  CLOCK: 1_000,         // 1 sec
  // Phase 3C — API sources
  NOAA_ALERTS: 900_000,     // 15 min
  GDELT_EVENTS: 900_000,    // 15 min
  COINGECKO: 60_000,        // 60 sec
  POLYMARKET: 300_000,      // 5 min
  // Humanitarian / Crisis APIs
  RELIEFWEB: 600_000,       // 10 min
  GDACS: 300_000,           // 5 min
} as const;

// ─── Feed Limits ───
export const FEED_MAX_ITEMS = 200;
export const FEED_MAX_AGE_HOURS = 48;

// ─── Panel IDs ───
export const PANEL_IDS = {
  // Original panels
  LIVE_FEED: 'live-feed',
  WORLD_STATUS: 'world-status',
  REGION_MONITOR: 'region-monitor',
  MARKET_TERMINAL: 'market-terminal',
  THREAT_BOARD: 'threat-board',
  SYSTEM_STATUS: 'system-status',
  WORLD_MAP: 'world-map',

  // Phase 5 — First wave panels
  AI_ANALYTICS: 'ai-analytics',
  INTEL_FEED: 'intel-feed',
  CONFLICT_TRACKER: 'conflict-tracker',
  CII_INDEX: 'cii-index',
  PREDICTION_MARKETS: 'prediction-markets',
  WEATHER_MONITOR: 'weather-monitor',
  EMERGENCY_ALERTS: 'emergency-alerts',

  // Phase 6 — Second wave panels
  ENERGY_ANALYTICS: 'energy-analytics',
  ECONOMIC_INDICATORS: 'economic-indicators',
  SUPPLY_CHAIN: 'supply-chain',
  CRYPTO_MONITOR: 'crypto-monitor',
  WORLD_CLOCK: 'world-clock',
  DISPLACEMENT_TRACKER: 'displacement-tracker',

  // Phase 8 — Final wave panels
  AI_STRATEGIC_POSTURE: 'ai-strategic-posture',
  TELEGRAM_FEED: 'telegram-feed',
  LIVE_NEWS: 'live-news',
  TRANSPORTATION_INTEL: 'transportation-intel',
} as const;

export const PANEL_LABELS: Record<string, string> = {
  [PANEL_IDS.LIVE_FEED]: 'LIVE FEED',
  [PANEL_IDS.WORLD_STATUS]: 'WORLD STATUS',
  [PANEL_IDS.REGION_MONITOR]: 'REGION MONITOR',
  [PANEL_IDS.MARKET_TERMINAL]: 'MARKET TERMINAL',
  [PANEL_IDS.THREAT_BOARD]: 'THREAT BOARD',
  [PANEL_IDS.SYSTEM_STATUS]: 'SYSTEM STATUS',
  [PANEL_IDS.WORLD_MAP]: 'WORLD MAP',

  [PANEL_IDS.AI_ANALYTICS]: 'AI ANALYTICS',
  [PANEL_IDS.INTEL_FEED]: 'INTEL FEED',
  [PANEL_IDS.CONFLICT_TRACKER]: 'CONFLICT TRACKER',
  [PANEL_IDS.CII_INDEX]: 'CII INDEX',
  [PANEL_IDS.PREDICTION_MARKETS]: 'PREDICTION MARKETS',
  [PANEL_IDS.WEATHER_MONITOR]: 'WX / NATURAL EVENTS',
  [PANEL_IDS.EMERGENCY_ALERTS]: 'EMERGENCY ALERTS',

  [PANEL_IDS.ENERGY_ANALYTICS]: 'ENERGY ANALYTICS',
  [PANEL_IDS.ECONOMIC_INDICATORS]: 'ECONOMIC INDICATORS',
  [PANEL_IDS.SUPPLY_CHAIN]: 'SUPPLY CHAIN',
  [PANEL_IDS.CRYPTO_MONITOR]: 'CRYPTO MONITOR',
  [PANEL_IDS.WORLD_CLOCK]: 'WORLD CLOCK',
  [PANEL_IDS.DISPLACEMENT_TRACKER]: 'DISPLACEMENT TRACKER',

  [PANEL_IDS.AI_STRATEGIC_POSTURE]: 'AI STRATEGIC POSTURE',
  [PANEL_IDS.TELEGRAM_FEED]: 'TELEGRAM FEED',
  [PANEL_IDS.LIVE_NEWS]: 'LIVE NEWS',
  [PANEL_IDS.TRANSPORTATION_INTEL]: 'TRANSPORT INTEL',
};

/** All registered panel IDs */
export const ALL_PANEL_IDS = Object.values(PANEL_IDS);

/** Original panel IDs (Phase 0 — currently implemented) */
export const CORE_PANEL_IDS = [
  PANEL_IDS.LIVE_FEED,
  PANEL_IDS.WORLD_STATUS,
  PANEL_IDS.REGION_MONITOR,
  PANEL_IDS.MARKET_TERMINAL,
  PANEL_IDS.THREAT_BOARD,
  PANEL_IDS.SYSTEM_STATUS,
  PANEL_IDS.WORLD_MAP,
] as const;

// ─── Grid ───
export const GRID = {
  COLS: { lg: 12, md: 8, sm: 4, xs: 2 },
  ROW_HEIGHT: 28,
  MARGIN: [4, 4] as [number, number],
  PADDING: [6, 6] as [number, number],
} as const;
