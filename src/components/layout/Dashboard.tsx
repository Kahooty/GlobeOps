import { useCallback } from 'react';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout';
import { useAppStore } from '@/store/app-store';
import { LAYOUT_PRESETS } from '@/config/layout-presets';
import { GRID, PANEL_IDS } from '@/config/constants';
import { LiveFeed } from '@/components/panels/LiveFeed';
import { WorldStatus } from '@/components/panels/WorldStatus';
import { RegionMonitor } from '@/components/panels/RegionMonitor';
import { MarketTerminal } from '@/components/panels/MarketTerminal';
import { ThreatBoard } from '@/components/panels/ThreatBoard';
import { SystemStatus } from '@/components/panels/SystemStatus';
import { WorldMap } from '@/components/panels/WorldMap';
import { AiAnalytics } from '@/components/panels/AiAnalytics';
import { IntelFeed } from '@/components/panels/IntelFeed';
import { ConflictTracker } from '@/components/panels/ConflictTracker';
import { CiiIndex } from '@/components/panels/CiiIndex';
import { PredictionMarkets } from '@/components/panels/PredictionMarkets';
import { WeatherMonitor } from '@/components/panels/WeatherMonitor';
import { EmergencyAlerts } from '@/components/panels/EmergencyAlerts';
import { EnergyAnalytics } from '@/components/panels/EnergyAnalytics';
import { EconomicIndicators } from '@/components/panels/EconomicIndicators';
import { SupplyChain } from '@/components/panels/SupplyChain';
import { CryptoMonitor } from '@/components/panels/CryptoMonitor';
import { WorldClock } from '@/components/panels/WorldClock';
import { DisplacementTracker } from '@/components/panels/DisplacementTracker';
import { AiStrategicPosture } from '@/components/panels/AiStrategicPosture';
import { TelegramFeed } from '@/components/panels/TelegramFeed';
import { LiveNews } from '@/components/panels/LiveNews';
import { TransportationIntel } from '@/components/panels/TransportationIntel';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

/** Build the final layout: preset positions for panels in the preset, auto-generated
 *  positions for any extra panels the user has enabled via CFG. */
function buildLayout(
  presetLayout: LayoutItem[],
  enabledPanels: string[],
  panelComponentIds: Set<string>,
): LayoutItem[] {
  const presetIds = new Set(presetLayout.map((item) => item.i));
  const fromPreset = presetLayout.filter((item) => enabledPanels.includes(item.i));
  const extras = enabledPanels.filter((id) => !presetIds.has(id) && panelComponentIds.has(id));

  if (!extras.length) return fromPreset;

  // Find bottom edge of existing layout
  let maxBottom = 0;
  for (const item of fromPreset) {
    maxBottom = Math.max(maxBottom, item.y + item.h);
  }

  // Auto-place extra panels in rows of 3 (w=4 each in 12-col grid)
  const autoItems: LayoutItem[] = extras.map((id, i) => ({
    i: id,
    x: (i % 3) * 4,
    y: maxBottom + Math.floor(i / 3) * 8,
    w: 4,
    h: 8,
    minW: 3,
    minH: 6,
  }));

  return [...fromPreset, ...autoItems];
}

const PANEL_COMPONENTS: Record<string, React.FC> = {
  // Core panels
  [PANEL_IDS.LIVE_FEED]: LiveFeed,
  [PANEL_IDS.WORLD_STATUS]: WorldStatus,
  [PANEL_IDS.REGION_MONITOR]: RegionMonitor,
  [PANEL_IDS.MARKET_TERMINAL]: MarketTerminal,
  [PANEL_IDS.THREAT_BOARD]: ThreatBoard,
  [PANEL_IDS.SYSTEM_STATUS]: SystemStatus,
  [PANEL_IDS.WORLD_MAP]: WorldMap,

  // Phase 5 — First wave analytics panels
  [PANEL_IDS.AI_ANALYTICS]: AiAnalytics,
  [PANEL_IDS.INTEL_FEED]: IntelFeed,
  [PANEL_IDS.CONFLICT_TRACKER]: ConflictTracker,
  [PANEL_IDS.CII_INDEX]: CiiIndex,
  [PANEL_IDS.PREDICTION_MARKETS]: PredictionMarkets,
  [PANEL_IDS.WEATHER_MONITOR]: WeatherMonitor,
  [PANEL_IDS.EMERGENCY_ALERTS]: EmergencyAlerts,

  // Phase 6 — Second wave panels
  [PANEL_IDS.ENERGY_ANALYTICS]: EnergyAnalytics,
  [PANEL_IDS.ECONOMIC_INDICATORS]: EconomicIndicators,
  [PANEL_IDS.SUPPLY_CHAIN]: SupplyChain,
  [PANEL_IDS.CRYPTO_MONITOR]: CryptoMonitor,
  [PANEL_IDS.WORLD_CLOCK]: WorldClock,
  [PANEL_IDS.DISPLACEMENT_TRACKER]: DisplacementTracker,

  // Phase 8 — Final wave panels
  [PANEL_IDS.AI_STRATEGIC_POSTURE]: AiStrategicPosture,
  [PANEL_IDS.TELEGRAM_FEED]: TelegramFeed,
  [PANEL_IDS.LIVE_NEWS]: LiveNews,
  [PANEL_IDS.TRANSPORTATION_INTEL]: TransportationIntel,
};

const PANEL_COMPONENT_IDS = new Set(Object.keys(PANEL_COMPONENTS));

export function Dashboard() {
  const activeLayout = useAppStore((s) => s.activeLayout);
  const enabledPanels = useAppStore((s) => s.enabledPanels);
  const preset = LAYOUT_PRESETS[activeLayout];

  // useContainerWidth returns containerRef (undeclared in types) + width
  const { width, containerRef } = useContainerWidth() as ReturnType<typeof useContainerWidth> & {
    containerRef: React.RefObject<HTMLDivElement>;
  };

  // Build layout: preset positions + auto-generated positions for extra enabled panels
  const filteredLayout = buildLayout(preset.layout, enabledPanels, PANEL_COMPONENT_IDS);

  const layouts: ResponsiveLayouts = {
    lg: filteredLayout,
    md: filteredLayout.map((l) => ({ ...l, w: Math.min(l.w, 8) })),
    sm: filteredLayout.map((l) => ({ ...l, w: 4, x: 0 })),
    xs: filteredLayout.map((l) => ({ ...l, w: 2, x: 0 })),
  };

  const handleLayoutChange = useCallback(
    (_layout: Layout, _allLayouts: ResponsiveLayouts) => {
      // Could persist user customizations here
    },
    []
  );

  return (
    <div ref={containerRef} className="flex-1 overflow-auto">
      {width > 0 && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 900, sm: 600, xs: 0 }}
          cols={GRID.COLS}
          rowHeight={GRID.ROW_HEIGHT}
          margin={GRID.MARGIN}
          containerPadding={GRID.PADDING}
          onLayoutChange={handleLayoutChange}
          dragConfig={{ enabled: true, handle: '.drag-handle' }}
          resizeConfig={{ enabled: true }}
          compactor={verticalCompactor}
        >
          {filteredLayout.map((item) => {
            const PanelComponent = PANEL_COMPONENTS[item.i];
            if (!PanelComponent) return null;
            return (
              <div key={item.i} className="overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Invisible drag handle over the title bar area */}
                  <div className="drag-handle absolute inset-x-0 top-0 h-7 cursor-move z-[5]" />
                  <PanelComponent />
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
