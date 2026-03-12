/**
 * GlobalCommandLine — Application-wide command interface.
 *
 * Provides a terminal-style command line at the bottom of the app
 * for power-user control of the entire platform.
 *
 * Commands:
 *   zoom <region>     — Zoom the map to a named region
 *   filter <category> — Toggle feed category filter
 *   layers show|hide <type> — Toggle map layer visibility
 *   layout <name>     — Switch layout preset
 *   theme <color>     — Change color theme
 *   panels            — List all panel IDs
 *   enable <panel>    — Enable a panel
 *   disable <panel>   — Disable a panel
 *   brief             — Force AI briefing refresh (logs to console)
 *   help              — Show available commands
 *   clear             — Clear search/filter state
 */

import { useCallback, useState } from 'react';
import { CommandLine } from './CommandLine';
import { useAppStore } from '@/store/app-store';
import { LAYOUT_PRESETS } from '@/config/layout-presets';
import { ALL_PANEL_IDS, PANEL_LABELS } from '@/config/constants';
import { EVENT_TYPE_REGISTRY } from '@/config/event-types';
import type { LayoutPresetName, ThemeColor, Region, MapEventType } from '@/types';

// Region aliases for zoom command
const REGION_ALIASES: Record<string, Region> = {
  na: 'NORTH AMERICA',
  'north america': 'NORTH AMERICA',
  usa: 'NORTH AMERICA',
  sa: 'SOUTH AMERICA',
  'south america': 'SOUTH AMERICA',
  latam: 'SOUTH AMERICA',
  eu: 'EUROPE',
  europe: 'EUROPE',
  me: 'MIDDLE EAST',
  'middle east': 'MIDDLE EAST',
  mideast: 'MIDDLE EAST',
  af: 'AFRICA',
  africa: 'AFRICA',
  sea: 'SOUTH ASIA',
  'south asia': 'SOUTH ASIA',
  india: 'SOUTH ASIA',
  ea: 'EAST ASIA',
  'east asia': 'EAST ASIA',
  china: 'EAST ASIA',
  asia: 'EAST ASIA',
  oc: 'OCEANIA',
  oceania: 'OCEANIA',
  pacific: 'OCEANIA',
  global: null as unknown as Region,
};

const THEME_NAMES: ThemeColor[] = ['green', 'amber', 'cyan', 'red', 'white'];

export function GlobalCommandLine() {
  const {
    setSelectedRegion,
    toggleCategory,
    setSearchTerm,
    setActiveLayout,
    setColorScheme,
    toggleEventType,
    enabledEventTypes,
    togglePanel,
    enabledPanels,
  } = useAppStore();

  const [output, setOutput] = useState<string | null>(null);

  const showOutput = (msg: string) => {
    setOutput(msg);
    setTimeout(() => setOutput(null), 4000);
  };

  const handleCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const parts = cmd.split(/\s+/);
    const verb = parts[0];
    const args = parts.slice(1).join(' ');

    switch (verb) {
      // ─── zoom <region> ───
      case 'zoom': {
        if (!args || args === 'global' || args === 'world') {
          setSelectedRegion(null);
          showOutput('MAP: Reset to global view');
          return;
        }
        const region = REGION_ALIASES[args];
        if (region) {
          setSelectedRegion(region);
          showOutput(`MAP: Zoomed to ${region}`);
        } else {
          showOutput(`Unknown region: "${args}". Try: na, eu, me, af, sea, ea, oc, sa`);
        }
        return;
      }

      // ─── filter <category> ───
      case 'filter': {
        if (!args) {
          showOutput('Usage: filter <category> — e.g., filter defense');
          return;
        }
        toggleCategory(args);
        showOutput(`FILTER: Toggled "${args}"`);
        return;
      }

      // ─── layers show|hide <type> ───
      case 'layers':
      case 'layer': {
        const layerParts = args.split(/\s+/);
        const action = layerParts[0]; // show or hide
        const layerType = layerParts.slice(1).join('-') as MapEventType;

        if (action === 'list') {
          const enabled = enabledEventTypes.slice(0, 10).join(', ');
          showOutput(`LAYERS: ${enabledEventTypes.length} enabled — ${enabled}...`);
          return;
        }

        if (!action || !layerType) {
          showOutput('Usage: layers show|hide <type> — e.g., layers show military-base');
          return;
        }

        const config = EVENT_TYPE_REGISTRY[layerType];
        if (!config) {
          showOutput(`Unknown layer type: "${layerType}"`);
          return;
        }

        const isEnabled = enabledEventTypes.includes(layerType);
        if ((action === 'show' && !isEnabled) || (action === 'hide' && isEnabled)) {
          toggleEventType(layerType);
          showOutput(`LAYERS: ${action === 'show' ? 'Enabled' : 'Disabled'} ${config.label}`);
        } else {
          showOutput(`LAYERS: ${config.label} already ${isEnabled ? 'enabled' : 'disabled'}`);
        }
        return;
      }

      // ─── layout <name> ───
      case 'layout': {
        if (!args) {
          const names = Object.keys(LAYOUT_PRESETS).join(', ');
          showOutput(`LAYOUTS: ${names}`);
          return;
        }
        if (args in LAYOUT_PRESETS) {
          setActiveLayout(args as LayoutPresetName);
          showOutput(`LAYOUT: Switched to ${LAYOUT_PRESETS[args as LayoutPresetName].label}`);
        } else {
          showOutput(`Unknown layout: "${args}"`);
        }
        return;
      }

      // ─── theme <color> ───
      case 'theme': {
        if (!args) {
          showOutput(`THEMES: ${THEME_NAMES.join(', ')}`);
          return;
        }
        if (THEME_NAMES.includes(args as ThemeColor)) {
          setColorScheme(args as ThemeColor);
          showOutput(`THEME: Switched to ${args.toUpperCase()}`);
        } else {
          showOutput(`Unknown theme: "${args}". Try: ${THEME_NAMES.join(', ')}`);
        }
        return;
      }

      // ─── panels / enable / disable ───
      case 'panels': {
        const enabled = enabledPanels.length;
        showOutput(`PANELS: ${enabled}/${ALL_PANEL_IDS.length} enabled`);
        return;
      }
      case 'enable': {
        const match = ALL_PANEL_IDS.find((id) => id === args || (PANEL_LABELS[id] || '').toLowerCase() === args);
        if (match) {
          if (!enabledPanels.includes(match)) togglePanel(match);
          showOutput(`PANEL: Enabled ${PANEL_LABELS[match] || match}`);
        } else {
          showOutput(`Unknown panel: "${args}"`);
        }
        return;
      }
      case 'disable': {
        const match = ALL_PANEL_IDS.find((id) => id === args || (PANEL_LABELS[id] || '').toLowerCase() === args);
        if (match) {
          if (enabledPanels.includes(match)) togglePanel(match);
          showOutput(`PANEL: Disabled ${PANEL_LABELS[match] || match}`);
        } else {
          showOutput(`Unknown panel: "${args}"`);
        }
        return;
      }

      // ─── brief ───
      case 'brief': {
        showOutput('BRIEF: AI briefing will refresh on next cycle (every 15 min)');
        return;
      }

      // ─── search ───
      case 'search': {
        if (args) {
          setSearchTerm(args);
          showOutput(`SEARCH: "${args}"`);
        } else {
          showOutput('Usage: search <term>');
        }
        return;
      }

      // ─── clear ───
      case 'clear':
      case 'reset': {
        setSearchTerm('');
        setSelectedRegion(null);
        showOutput('STATE: Cleared search and region filter');
        return;
      }

      // ─── help ───
      case 'help':
      case '?': {
        showOutput('CMD: zoom, filter, layers, layout, theme, panels, enable, disable, search, brief, clear, help');
        return;
      }

      default: {
        // Treat as search term
        setSearchTerm(raw.trim());
        showOutput(`SEARCH: "${raw.trim()}"`);
      }
    }
  }, [
    setSelectedRegion, toggleCategory, setSearchTerm, setActiveLayout,
    setColorScheme, toggleEventType, enabledEventTypes, togglePanel, enabledPanels,
  ]);

  return (
    <div className="shrink-0">
      {/* Output line */}
      {output && (
        <div className="px-2 py-0.5 text-[9px] text-terminal-primary-dim border-t border-terminal-border/50">
          {output}
        </div>
      )}
      <CommandLine
        prompt="globeops> "
        placeholder="type 'help' for commands"
        onCommand={handleCommand}
      />
    </div>
  );
}
