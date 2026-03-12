/**
 * overlay-classifier — Visual classification logic for ASCII map overlays.
 *
 * Determines which visual treatment each event or cluster gets based on
 * zoom level, cluster size, event type, severity, recency, and category
 * composition. Uses EVENT_TYPE_REGISTRY as single source of truth for
 * type configuration.
 */

import type { MapEvent, MapEventType, FeedCategory } from '@/types';
import { getTypeConfig } from '@/config/event-types';

// ─── Visual Treatment Types ───

export type OverlayKind =
  | 'pulse-marker'       // AsciiPulseMarker — dot + ring at Z:0-1
  | 'event-flag'         // AsciiEventFlag — text label at Z:2+
  | 'danger-box'         // AsciiDangerFlag box variant (natural/wx critical)
  | 'danger-banner'      // AsciiDangerFlag banner variant (defense/finance critical)
  | 'danger-wire'        // AsciiDangerFlag wire flash variant (news/tech critical)
  | 'activity-cluster'   // AsciiActivityCluster — inline log for 3-5 events
  | 'density-glyph'      // AsciiDensityGlyph — compact count badge at Z:0-1
  | 'event-zone'         // AsciiEventZone — bordered zone for 6+ events
  | 'individual-flags';  // Break cluster into individual flags

export type DangerVariant = 'box' | 'banner' | 'wire';
export type ZoneVariant = 'single-type' | 'mixed' | 'critical';

export interface VisualTreatment {
  kind: OverlayKind;
  colorVar: string;
  label: string;
  subLabel?: string;
  intensity: number;       // 0-1, affects glow strength / animation speed
  animated: boolean;
  dangerVariant?: DangerVariant;
  zoneVariant?: ZoneVariant;
  zoneLabel?: string;
  typeComposition?: Array<{ type: MapEventType; count: number; symbol: string; colorVar: string }>;
}

// ─── Category → Sub-Label Map ───

const CATEGORY_SUBLABEL: Partial<Record<FeedCategory, string>> = {
  'world-news':       'WORLD',
  'us-news':          'US',
  defense:            'MIL',
  government:         'GOV',
  'think-tanks':      'INTEL',
  finance:            'MKT',
  tech:               'TECH',
  'regional-asia':    'ASIA',
  'regional-europe':  'EUR',
  'regional-mideast': 'MIDEAST',
  'regional-africa':  'AFRICA',
  'regional-latam':   'LATAM',
  science:            'SCI',
  energy:             'ENRG',
  humanitarian:       'HUMAN',
  cybersecurity:      'CYBER',
  climate:            'CLIM',
  commodities:        'CMDTY',
};

// ─── Danger Variant Resolution (which types get which variant) ───

const DANGER_BOX_TYPES: Set<MapEventType> = new Set([
  'earthquake', 'natural-event', 'climate-anomaly', 'weather', 'armed-conflict',
]);
const DANGER_BANNER_TYPES: Set<MapEventType> = new Set([
  'defense', 'finance', 'military-activity', 'conflict-zone',
  'intel-hotspot', 'cii-instability',
]);

function resolveDangerVariant(type: MapEventType): DangerVariant {
  if (DANGER_BOX_TYPES.has(type)) return 'box';
  if (DANGER_BANNER_TYPES.has(type)) return 'banner';
  return 'wire';
}

// ─── Single Event Classification ───

export function classifySingleEvent(event: MapEvent, zoomLevel: number): VisualTreatment {
  const config = getTypeConfig(event.type);
  const isRecent = Date.now() - event.time.getTime() < 3_600_000;
  const intensity = event.severity === 'critical' ? 1 : event.severity === 'high' ? 0.7 : event.severity === 'medium' ? 0.4 : 0.2;

  // Compute sub-label from category metadata
  const category = event.meta?.category as FeedCategory | undefined;
  const subLabel = category ? CATEGORY_SUBLABEL[category] : undefined;
  const label = subLabel ?? config.defaultLabel;

  // Determine color — natural events use red for high/critical severity
  const isNaturalDisaster = event.type === 'earthquake' || event.type === 'natural-event' || event.type === 'climate-anomaly' || event.type === 'weather';
  const colorVar =
    isNaturalDisaster && (event.severity === 'high' || event.severity === 'critical')
      ? '--color-terminal-red'
      : config.colorVar;

  // Z:0-1 → pulse marker (no text)
  if (zoomLevel <= 1) {
    return {
      kind: 'pulse-marker',
      colorVar,
      label,
      intensity,
      animated: isRecent || event.severity === 'critical',
    };
  }

  // Z:2+ critical → danger flag variants
  if (event.severity === 'critical') {
    const dangerVariant = resolveDangerVariant(event.type);

    const dangerKind: OverlayKind =
      dangerVariant === 'box' ? 'danger-box' :
      dangerVariant === 'banner' ? 'danger-banner' : 'danger-wire';

    return {
      kind: dangerKind,
      colorVar,
      label,
      intensity: 1,
      animated: true,
      dangerVariant,
    };
  }

  // Z:2+ non-critical → event flag with sub-type label
  return {
    kind: 'event-flag',
    colorVar,
    label,
    subLabel: label !== config.defaultLabel ? label : undefined,
    intensity,
    animated: isRecent,
  };
}

// ─── Cluster Classification ───

export function classifyCluster(
  events: MapEvent[],
  zoomLevel: number,
): VisualTreatment {
  const dominantType = getDominantType(events);
  const config = getTypeConfig(dominantType);
  const hasCritical = events.some((e) => e.severity === 'critical');
  const hasHighOrCritical = events.some((e) => e.severity === 'high' || e.severity === 'critical');
  const intensity = hasCritical ? 1 : hasHighOrCritical ? 0.7 : 0.4;
  const size = events.length;

  // Determine composition
  const typeSet = new Set(events.map((e) => e.type));
  const isMixed = typeSet.size > 1;
  const composition = isMixed ? getTypeComposition(events) : undefined;
  const mixedColor = isMixed ? '--color-terminal-cluster' : config.colorVar;

  const zoneLabel = computeZoneLabel(events);

  // ─── Size 2: always individual flags ───
  if (size <= 2) {
    return {
      kind: 'individual-flags',
      colorVar: config.colorVar,
      label: config.defaultLabel,
      intensity,
      animated: false,
    };
  }

  // ─── Size 3-5 ───
  if (size <= 5) {
    if (zoomLevel <= 1) {
      return {
        kind: 'density-glyph',
        colorVar: isMixed ? mixedColor : config.colorVar,
        label: `${size}`,
        intensity,
        animated: hasCritical,
        typeComposition: composition,
      };
    }
    if (zoomLevel <= 3) {
      return {
        kind: 'activity-cluster',
        colorVar: isMixed ? mixedColor : config.colorVar,
        label: zoneLabel,
        intensity,
        animated: hasCritical,
        typeComposition: composition,
      };
    }
    // Z:4+ break apart
    return {
      kind: 'individual-flags',
      colorVar: config.colorVar,
      label: config.defaultLabel,
      intensity,
      animated: false,
    };
  }

  // ─── Size 6-15 ───
  if (size <= 15) {
    if (zoomLevel <= 1) {
      return {
        kind: 'density-glyph',
        colorVar: isMixed ? mixedColor : config.colorVar,
        label: `${size}`,
        intensity,
        animated: size > 10,
        typeComposition: composition,
      };
    }
    if (zoomLevel <= 3) {
      const zoneVariant: ZoneVariant = hasCritical ? 'critical' : isMixed ? 'mixed' : 'single-type';
      return {
        kind: 'event-zone',
        colorVar: isMixed && !hasCritical ? mixedColor : config.colorVar,
        label: zoneLabel,
        intensity,
        animated: hasCritical,
        zoneVariant,
        zoneLabel,
        typeComposition: composition,
      };
    }
    // Z:4+ → activity cluster (won't break apart this many)
    return {
      kind: 'activity-cluster',
      colorVar: isMixed ? mixedColor : config.colorVar,
      label: zoneLabel,
      intensity,
      animated: hasCritical,
      typeComposition: composition,
    };
  }

  // ─── Size 16+ ───
  if (zoomLevel <= 1) {
    return {
      kind: 'density-glyph',
      colorVar: isMixed ? mixedColor : config.colorVar,
      label: `${size}`,
      intensity,
      animated: true,
      typeComposition: composition,
    };
  }

  // Z:2+ large clusters → always event zone
  const zoneVariant: ZoneVariant = hasCritical ? 'critical' : isMixed ? 'mixed' : 'single-type';
  return {
    kind: 'event-zone',
    colorVar: isMixed && !hasCritical ? mixedColor : config.colorVar,
    label: zoneLabel,
    intensity,
    animated: hasCritical,
    zoneVariant,
    zoneLabel,
    typeComposition: composition,
  };
}

// ─── Helpers ───

/** Find dominant event type in a cluster */
export function getDominantType(events: MapEvent[]): MapEventType {
  const counts = new Map<MapEventType, number>();
  for (const ev of events) {
    counts.set(ev.type, (counts.get(ev.type) || 0) + 1);
  }
  let dominant: MapEventType = 'news';
  let max = 0;
  for (const [type, count] of counts) {
    if (count > max) {
      max = count;
      dominant = type;
    }
  }
  return dominant;
}

/** Compute a descriptive zone label from cluster composition */
export function computeZoneLabel(events: MapEvent[]): string {
  const types = new Set<MapEventType>();
  let hasCritical = false;

  for (const e of events) {
    types.add(e.type);
    if (e.severity === 'critical') hasCritical = true;
  }

  const hasNatural = types.has('earthquake') || types.has('natural-event') || types.has('climate-anomaly') || types.has('weather');
  const hasDefense = types.has('defense');
  const hasFinance = types.has('finance');
  const hasTech = types.has('tech');
  const hasConflict = types.has('armed-conflict') || types.has('military-activity');
  const hasIntel = types.has('intel-hotspot') || types.has('conflict-zone');
  const hasCyber = types.has('cyber-threat');

  if (hasNatural && hasCritical) return 'NATURAL DISASTER';
  if (hasNatural) return 'NATURAL / WX EVENT';
  if (hasConflict && hasCritical) return 'CONFLICT ZONE';
  if (hasConflict) return 'ACTIVE CONFLICT';
  if (hasIntel && hasCritical) return 'INTEL HOTSPOT';
  if (hasDefense && hasCritical) return 'CONFLICT ZONE';
  if (hasDefense && hasTech) return 'THREAT NEXUS';
  if (hasDefense) return 'SECURITY WATCH';
  if (hasCyber) return 'CYBER THREAT';
  if (hasFinance && hasCritical) return 'MARKET CRISIS';
  if (hasFinance) return 'ECONOMIC CENTER';
  if (hasTech) return 'TECH NODE';

  // Fallback based on dominant type
  const dominantType = getDominantType(events);
  const config = getTypeConfig(dominantType);
  return `${config.defaultLabel} CLUSTER`;
}

/** Get type composition counts for a cluster (used by mixed zone rendering) */
export function getTypeComposition(events: MapEvent[]): Array<{ type: MapEventType; count: number; symbol: string; colorVar: string }> {
  const counts = new Map<MapEventType, number>();
  for (const ev of events) {
    counts.set(ev.type, (counts.get(ev.type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => {
      const config = getTypeConfig(type);
      return {
        type,
        count,
        symbol: config.symbol,
        colorVar: config.colorVar,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** Get sub-label for an event based on its category metadata */
export function getEventSubLabel(event: MapEvent): string {
  const category = event.meta?.category as FeedCategory | undefined;
  if (category && CATEGORY_SUBLABEL[category]) {
    return CATEGORY_SUBLABEL[category]!;
  }
  const config = getTypeConfig(event.type);
  return config.defaultLabel;
}

// Re-export getTypeConfig for convenience
export { getTypeConfig } from '@/config/event-types';
