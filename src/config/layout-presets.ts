import type { LayoutItem } from 'react-grid-layout';
import type { LayoutPresetName } from '@/types';
import { PANEL_IDS } from './constants';

export interface LayoutPreset {
  name: LayoutPresetName;
  label: string;
  description: string;
  layout: LayoutItem[];
}

export const LAYOUT_PRESETS: Record<LayoutPresetName, LayoutPreset> = {
  'ops-center': {
    name: 'ops-center',
    label: 'OPS CENTER',
    description: 'Map + feeds + threats + markets',
    layout: [
      // Top row: Map dominates left, sidebar right
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.WORLD_STATUS, x: 7, y: 0, w: 5, h: 6, minW: 3, minH: 6 },
      { i: PANEL_IDS.REGION_MONITOR, x: 7, y: 6, w: 5, h: 6, minW: 3, minH: 6 },
      // Mid row: Live Feed + Threat Board (equal prominence)
      { i: PANEL_IDS.LIVE_FEED, x: 0, y: 12, w: 6, h: 12, minW: 4, minH: 6 },
      { i: PANEL_IDS.THREAT_BOARD, x: 6, y: 12, w: 6, h: 12, minW: 3, minH: 6 },
      // Bottom row: Market + System Status (full width)
      { i: PANEL_IDS.MARKET_TERMINAL, x: 0, y: 24, w: 6, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.SYSTEM_STATUS, x: 6, y: 24, w: 6, h: 8, minW: 3, minH: 6 },
    ],
  },
  focused: {
    name: 'focused',
    label: 'FOCUSED',
    description: 'Dominant feed, sidebar context',
    layout: [
      // Primary: Live Feed takes 2/3 width, full height
      { i: PANEL_IDS.LIVE_FEED, x: 0, y: 0, w: 8, h: 18, minW: 5, minH: 8 },
      // Sidebar: stacked context panels (all h:6 minimum)
      { i: PANEL_IDS.WORLD_MAP, x: 8, y: 0, w: 4, h: 9, minW: 3, minH: 6 },
      { i: PANEL_IDS.WORLD_STATUS, x: 8, y: 9, w: 4, h: 9, minW: 3, minH: 6 },
      // Bottom row: secondary panels
      { i: PANEL_IDS.THREAT_BOARD, x: 0, y: 18, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.MARKET_TERMINAL, x: 4, y: 18, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.REGION_MONITOR, x: 8, y: 18, w: 4, h: 8, minW: 3, minH: 6 },
      // Footer
      { i: PANEL_IDS.SYSTEM_STATUS, x: 0, y: 26, w: 12, h: 6, minW: 6, minH: 6 },
    ],
  },
  compact: {
    name: 'compact',
    label: 'COMPACT',
    description: 'Quick glance — full map + essentials',
    layout: [
      // Top: Full-width map (hero)
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 12, h: 12, minW: 6, minH: 8 },
      // Mid: Feed + Threats side-by-side
      { i: PANEL_IDS.LIVE_FEED, x: 0, y: 12, w: 6, h: 10, minW: 4, minH: 6 },
      { i: PANEL_IDS.THREAT_BOARD, x: 6, y: 12, w: 6, h: 10, minW: 3, minH: 6 },
      // Bottom: Emergency + System Status
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 0, y: 22, w: 6, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.SYSTEM_STATUS, x: 6, y: 22, w: 6, h: 8, minW: 3, minH: 6 },
    ],
  },
  intelligence: {
    name: 'intelligence',
    label: 'INTELLIGENCE',
    description: 'Intel, conflict, CII analysis',
    layout: [
      // Top row: Map + AI Analytics + Emergency
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.AI_ANALYTICS, x: 7, y: 0, w: 5, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 7, y: 8, w: 5, h: 4, minW: 3, minH: 4 },
      // Mid row: Intel + Conflict + CII
      { i: PANEL_IDS.INTEL_FEED, x: 0, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.CONFLICT_TRACKER, x: 4, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.CII_INDEX, x: 8, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      // Bottom row: Threat Board + Prediction Markets + Telegram
      { i: PANEL_IDS.THREAT_BOARD, x: 0, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.PREDICTION_MARKETS, x: 4, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.TELEGRAM_FEED, x: 8, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
    ],
  },
  situational: {
    name: 'situational',
    label: 'SITUATIONAL',
    description: 'Emergency, weather, transport',
    layout: [
      // Top: Prominent map with emergency alerts sidebar
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 8, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 6 },
      // Mid row: Live news + Weather + Transport
      { i: PANEL_IDS.LIVE_NEWS, x: 0, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.WEATHER_MONITOR, x: 4, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.TRANSPORTATION_INTEL, x: 8, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      // Bottom row: Threat Board + Live Feed + Region Monitor
      { i: PANEL_IDS.THREAT_BOARD, x: 0, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.LIVE_FEED, x: 4, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.REGION_MONITOR, x: 8, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
    ],
  },
  markets: {
    name: 'markets',
    label: 'MARKETS',
    description: 'Crypto, energy, economics',
    layout: [
      // Top row: Map + Market Terminal sidebar
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 8, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.MARKET_TERMINAL, x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 6 },
      // Mid row: Crypto + Economic Indicators + Prediction Markets
      { i: PANEL_IDS.CRYPTO_MONITOR, x: 0, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.ECONOMIC_INDICATORS, x: 4, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.PREDICTION_MARKETS, x: 8, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      // Bottom row: Energy + Supply Chain + World Clock
      { i: PANEL_IDS.ENERGY_ANALYTICS, x: 0, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.SUPPLY_CHAIN, x: 4, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.WORLD_CLOCK, x: 8, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
    ],
  },
  analyst: {
    name: 'analyst',
    label: 'ANALYST',
    description: 'AI posture, deep intel, OSINT',
    layout: [
      // Top row: Map + AI Strategic Posture
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.AI_STRATEGIC_POSTURE, x: 7, y: 0, w: 5, h: 12, minW: 3, minH: 6 },
      // Mid row: 3 text-heavy panels at w:4 (readable width)
      { i: PANEL_IDS.INTEL_FEED, x: 0, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.CONFLICT_TRACKER, x: 4, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      { i: PANEL_IDS.CII_INDEX, x: 8, y: 12, w: 4, h: 10, minW: 3, minH: 6 },
      // Bottom row: Telegram + Emergency + Displacement
      { i: PANEL_IDS.TELEGRAM_FEED, x: 0, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 4, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.DISPLACEMENT_TRACKER, x: 8, y: 22, w: 4, h: 8, minW: 3, minH: 6 },
      // Footer: AI Analytics full-width strip
      { i: PANEL_IDS.AI_ANALYTICS, x: 0, y: 30, w: 12, h: 6, minW: 6, minH: 6 },
    ],
  },
  'full-spectrum': {
    name: 'full-spectrum',
    label: 'FULL SPECTRUM',
    description: 'All key domains — security, natural, market, humanitarian',
    layout: [
      // Top row: Map (hero) + AI Strategic Posture + Emergency/Threat stack
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 6, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.AI_STRATEGIC_POSTURE, x: 6, y: 0, w: 3, h: 12, minW: 3, minH: 6 },
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 9, y: 0, w: 3, h: 6, minW: 3, minH: 6 },
      { i: PANEL_IDS.THREAT_BOARD, x: 9, y: 6, w: 3, h: 6, minW: 3, minH: 6 },
      // Second row: Intelligence core
      { i: PANEL_IDS.INTEL_FEED, x: 0, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.CONFLICT_TRACKER, x: 4, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.TELEGRAM_FEED, x: 8, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      // Third row: Markets + Live feeds
      { i: PANEL_IDS.MARKET_TERMINAL, x: 0, y: 20, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.LIVE_FEED, x: 4, y: 20, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.LIVE_NEWS, x: 8, y: 20, w: 4, h: 8, minW: 3, minH: 6 },
      // Fourth row: Analytics + Monitoring + Humanitarian
      { i: PANEL_IDS.ENERGY_ANALYTICS, x: 0, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.WEATHER_MONITOR, x: 4, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.DISPLACEMENT_TRACKER, x: 8, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
    ],
  },
  'full-module': {
    name: 'full-module',
    label: 'FULL MODULE',
    description: 'All modules enabled — complete overview',
    layout: [
      // Row 1: Map (hero) + AI Strategic Posture
      { i: PANEL_IDS.WORLD_MAP, x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
      { i: PANEL_IDS.AI_STRATEGIC_POSTURE, x: 7, y: 0, w: 5, h: 12, minW: 3, minH: 6 },
      // Row 2: Feeds
      { i: PANEL_IDS.LIVE_FEED, x: 0, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.INTEL_FEED, x: 4, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.TELEGRAM_FEED, x: 8, y: 12, w: 4, h: 8, minW: 3, minH: 6 },
      // Row 3: Status + Monitoring
      { i: PANEL_IDS.WORLD_STATUS, x: 0, y: 20, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.REGION_MONITOR, x: 3, y: 20, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.CONFLICT_TRACKER, x: 6, y: 20, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.CII_INDEX, x: 9, y: 20, w: 3, h: 8, minW: 3, minH: 6 },
      // Row 4: Threats + Alerts + News
      { i: PANEL_IDS.THREAT_BOARD, x: 0, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.EMERGENCY_ALERTS, x: 4, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.LIVE_NEWS, x: 8, y: 28, w: 4, h: 8, minW: 3, minH: 6 },
      // Row 5: Markets
      { i: PANEL_IDS.MARKET_TERMINAL, x: 0, y: 36, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.CRYPTO_MONITOR, x: 3, y: 36, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.ENERGY_ANALYTICS, x: 6, y: 36, w: 3, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.ECONOMIC_INDICATORS, x: 9, y: 36, w: 3, h: 8, minW: 3, minH: 6 },
      // Row 6: Analytics + Humanitarian
      { i: PANEL_IDS.PREDICTION_MARKETS, x: 0, y: 44, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.SUPPLY_CHAIN, x: 4, y: 44, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.DISPLACEMENT_TRACKER, x: 8, y: 44, w: 4, h: 8, minW: 3, minH: 6 },
      // Row 7: Situational
      { i: PANEL_IDS.AI_ANALYTICS, x: 0, y: 52, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.WEATHER_MONITOR, x: 4, y: 52, w: 4, h: 8, minW: 3, minH: 6 },
      { i: PANEL_IDS.TRANSPORTATION_INTEL, x: 8, y: 52, w: 4, h: 8, minW: 3, minH: 6 },
      // Row 8: Utility
      { i: PANEL_IDS.WORLD_CLOCK, x: 0, y: 60, w: 4, h: 6, minW: 3, minH: 6 },
      { i: PANEL_IDS.SYSTEM_STATUS, x: 4, y: 60, w: 8, h: 6, minW: 3, minH: 6 },
    ],
  },
};
