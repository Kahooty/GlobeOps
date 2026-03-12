/**
 * Event Normalizer Service — General-purpose normalizer that converts
 * any raw data source + parser config into MapEvent[].
 *
 * Handles geocoding heuristics for feeds without coordinates,
 * type mapping, severity inference, and region assignment.
 * Static datasets (bases, pipelines) use this same pipeline.
 */

import type {
  MapEvent,
  MapEventType,
  Region,
  FeedCategory,
  FeedItem,
  Earthquake,
  NaturalEvent,
  FeedFocusMode,
  ReliefWebDisaster,
  GDACSAlert,
  ACLEDEvent,
} from '@/types';
import { REGION_BOUNDS } from '@/utils/world-map';
import { getFocusModeWeight } from '@/config/feed-modes';
import { inferRegionFromText } from '@/config/regions';

// ─── Category → MapEventType mapping (expanded) ───

const CATEGORY_EVENT_TYPE: Record<FeedCategory, MapEventType> = {
  'world-news': 'news',
  'us-news': 'news',
  defense: 'defense',
  government: 'news',
  'think-tanks': 'news',
  finance: 'finance',
  tech: 'tech',
  'regional-asia': 'news',
  'regional-europe': 'news',
  'regional-mideast': 'news',
  'regional-africa': 'news',
  'regional-latam': 'news',
  science: 'tech',
  energy: 'trade-activity',
  humanitarian: 'displacement-flow',
  cybersecurity: 'cyber-threat',
  climate: 'climate-anomaly',
  commodities: 'trade-activity',
};

// ─── Category → Region mapping (expanded) ───

const CATEGORY_REGIONS: Record<FeedCategory, Region[]> = {
  'us-news': ['NORTH AMERICA'],
  government: ['NORTH AMERICA'],
  'regional-latam': ['SOUTH AMERICA'],
  'regional-europe': ['EUROPE'],
  'regional-mideast': ['MIDDLE EAST'],
  'regional-africa': ['AFRICA'],
  'regional-asia': ['SOUTH ASIA', 'EAST ASIA'],
  defense: ['MIDDLE EAST', 'EUROPE'],
  finance: ['NORTH AMERICA', 'EUROPE', 'EAST ASIA'],
  'world-news': ['NORTH AMERICA', 'EUROPE', 'MIDDLE EAST', 'EAST ASIA', 'AFRICA'],
  'think-tanks': ['NORTH AMERICA', 'EUROPE'],
  tech: ['NORTH AMERICA', 'EAST ASIA'],
  science: ['NORTH AMERICA', 'EUROPE'],
  energy: ['MIDDLE EAST', 'EUROPE', 'NORTH AMERICA'],
  humanitarian: ['AFRICA', 'MIDDLE EAST', 'SOUTH ASIA'],
  cybersecurity: ['NORTH AMERICA', 'EUROPE', 'EAST ASIA'],
  climate: ['OCEANIA', 'AFRICA', 'SOUTH ASIA', 'SOUTH AMERICA'],
  commodities: ['EAST ASIA', 'AFRICA', 'SOUTH AMERICA'],
};

// ─── Representative city coordinates per region ───

const REGION_CITIES: Record<Region, Array<[lon: number, lat: number]>> = {
  'NORTH AMERICA': [[-77.04, 38.91], [-74.01, 40.71], [-87.63, 41.88], [-118.24, 34.05], [-95.37, 29.76]],
  'SOUTH AMERICA': [[-43.17, -22.91], [-58.38, -34.60], [-77.03, -12.05], [-46.63, -23.55]],
  'EUROPE': [[-0.12, 51.51], [2.35, 48.86], [13.40, 52.52], [30.52, 50.45], [12.50, 41.90]],
  'MIDDLE EAST': [[44.37, 33.31], [35.22, 31.77], [51.39, 35.69], [46.72, 24.71], [55.27, 25.20]],
  'AFRICA': [[3.39, 6.52], [36.82, -1.29], [31.23, 30.04], [28.05, -26.20]],
  'SOUTH ASIA': [[77.21, 28.61], [72.88, 19.08], [90.41, 23.81], [79.86, 6.93]],
  'EAST ASIA': [[116.40, 39.90], [139.69, 35.69], [126.98, 37.57], [121.47, 31.23], [100.52, 13.76]],
  'OCEANIA': [[151.21, -33.87], [174.78, -41.29], [149.13, -35.28]],
};

// ─── Severity Keywords (for text-based inference) ───

const CRITICAL_KEYWORDS = ['breaking', 'urgent', 'emergency', 'critical', 'crisis', 'attack', 'explosion', 'war', 'killed'];
const HIGH_KEYWORDS = ['conflict', 'threat', 'missile', 'military', 'strike', 'sanctions', 'escalation', 'crash'];

// ─── Deterministic Coordinate Jitter ───
// Produces a stable float in [0,1] from a string + seed so the same
// item always renders at the same position across re-renders.

function hashToFloat(str: string, seed: number): number {
  let h = seed | 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    h = (h >>> 0); // keep unsigned
  }
  return (h >>> 0) / 4294967295; // normalize to [0,1]
}

/**
 * Scatter a reference city coordinate within its region bounds using
 * triangular distribution (sum of two uniforms → natural clustering
 * near the reference city with organic spread outward).
 *
 * @param city      Reference city [lon, lat]
 * @param region    Region key for bounds lookup
 * @param itemId    Deterministic seed string (e.g. feed item id)
 * @returns         Jittered [lon, lat] clamped within region bounds
 */
function jitterCoordinates(
  city: [number, number],
  region: Region,
  itemId: string,
): [number, number] {
  const bounds = REGION_BOUNDS[region];
  if (!bounds) return city;

  const lonSpan = bounds.lonMax - bounds.lonMin;
  const latSpan = bounds.latMax - bounds.latMin;

  // Triangular distribution: average of two uniform samples → peaks at center
  const lonJitter = (hashToFloat(itemId, 1) + hashToFloat(itemId, 2)) / 2; // [0,1] centered at 0.5
  const latJitter = (hashToFloat(itemId, 3) + hashToFloat(itemId, 4)) / 2;

  // ±40% of region span from the reference city
  const jitterRange = 0.4;
  const lon = city[0] + (lonJitter - 0.5) * 2 * jitterRange * lonSpan;
  const lat = city[1] + (latJitter - 0.5) * 2 * jitterRange * latSpan;

  // Clamp to region bounds
  const clampedLon = Math.max(bounds.lonMin, Math.min(bounds.lonMax, lon));
  const clampedLat = Math.max(bounds.latMin, Math.min(bounds.latMax, lat));

  return [clampedLon, clampedLat];
}

// ─── Coordinate-Based Region Detection ───

export function regionFromCoordinates(lon: number, lat: number): Region {
  for (const [region, bounds] of Object.entries(REGION_BOUNDS)) {
    if (
      lon >= bounds.lonMin && lon <= bounds.lonMax &&
      lat >= bounds.latMin && lat <= bounds.latMax
    ) {
      return region as Region;
    }
  }
  return 'OCEANIA'; // fallback for mid-ocean events
}

// ─── Feed Item → MapEvent ───

export function normalizeFeedItem(item: FeedItem, index: number): MapEvent {
  const categoryRegions = CATEGORY_REGIONS[item.category] || ['NORTH AMERICA'];

  // Try to infer region from title content first (e.g., "Ukraine" → EUROPE)
  // so RSS events land in the geographically correct region instead of cycling
  // blindly through all category-associated regions.
  const textRegion = inferRegionFromText(`${item.title} ${item.snippet ?? ''}`);
  // inferRegionFromText returns EUROPE as a generic fallback — only trust the
  // result when it appears in this category's valid regions (prevents false positives
  // from the fallback polluting non-European categories).
  const region = categoryRegions.includes(textRegion)
    ? textRegion
    : categoryRegions[index % categoryRegions.length];

  const cities = REGION_CITIES[region];
  const city = cities[index % cities.length];
  const eventType = CATEGORY_EVENT_TYPE[item.category];
  const severity = inferSeverityFromText(item.title, item.category);

  // Deterministic jitter: scatter around reference city within region bounds
  // Same item ID always produces the same position (stable across re-renders)
  const coordinates = jitterCoordinates(city, region, item.id);

  return {
    id: `feed-${item.id}`,
    type: eventType,
    title: item.title,
    coordinates,
    time: item.pubDate,
    severity,
    region,
    source: item.source,
    url: item.link,
    meta: {
      snippet: item.snippet,
      category: item.category,
      sourceId: item.sourceId,
    },
  };
}

// ─── Earthquake → MapEvent ───

export function normalizeEarthquake(eq: Earthquake): MapEvent {
  const severityMap: Record<Earthquake['severity'], MapEvent['severity']> = {
    minor: 'low',
    moderate: 'medium',
    major: 'high',
    great: 'critical',
  };

  return {
    id: `eq-${eq.id}`,
    type: 'earthquake',
    title: `M${eq.magnitude.toFixed(1)} — ${eq.place}`,
    coordinates: eq.coordinates,
    time: eq.time,
    severity: severityMap[eq.severity],
    region: regionFromCoordinates(eq.coordinates[0], eq.coordinates[1]),
    source: 'USGS',
    url: eq.url,
    meta: {
      magnitude: eq.magnitude,
      depth: eq.depth,
      tsunami: eq.tsunami,
      place: eq.place,
    },
  };
}

// ─── Static Data → MapEvent ───

export interface StaticDataPoint {
  id: string;
  name: string;
  coordinates: [lon: number, lat: number];
  type: MapEventType;
  source: string;
  meta?: Record<string, unknown>;
}

export function normalizeStaticData(points: StaticDataPoint[]): MapEvent[] {
  return points.map((point) => ({
    id: `static-${point.type}-${point.id}`,
    type: point.type,
    title: point.name,
    coordinates: point.coordinates,
    time: new Date(), // Static data has no temporal component
    severity: 'low' as const,
    region: regionFromCoordinates(point.coordinates[0], point.coordinates[1]),
    source: point.source,
    meta: point.meta,
  }));
}

// ─── Generic API Response → MapEvent ───

export interface RawApiEvent {
  id: string;
  title?: string;
  name?: string;
  lat?: number;
  lon?: number;
  longitude?: number;
  latitude?: number;
  coordinates?: [number, number];
  time?: string | number | Date;
  timestamp?: string | number;
  severity?: string;
  source?: string;
  url?: string;
  [key: string]: unknown;
}

export function normalizeApiEvent(
  raw: RawApiEvent,
  targetType: MapEventType,
  sourceName: string,
): MapEvent | null {
  // Extract coordinates
  const lon = raw.lon ?? raw.longitude ?? raw.coordinates?.[0];
  const lat = raw.lat ?? raw.latitude ?? raw.coordinates?.[1];
  if (lon == null || lat == null) return null;

  // Extract title
  const title = raw.title ?? raw.name ?? 'Unknown Event';

  // Extract time
  let time: Date;
  const rawTime = raw.time ?? raw.timestamp;
  if (rawTime instanceof Date) {
    time = rawTime;
  } else if (typeof rawTime === 'number') {
    time = new Date(rawTime > 1e12 ? rawTime : rawTime * 1000);
  } else if (typeof rawTime === 'string') {
    time = new Date(rawTime);
  } else {
    time = new Date();
  }

  // Map severity
  const severity = mapSeverityString(raw.severity);

  return {
    id: `api-${targetType}-${raw.id}`,
    type: targetType,
    title: String(title),
    coordinates: [lon, lat],
    time,
    severity,
    region: regionFromCoordinates(lon, lat),
    source: raw.source ?? sourceName,
    url: raw.url ? String(raw.url) : undefined,
    meta: raw,
  };
}

// ─── Batch Normalizers ───

export function normalizeEarthquakes(earthquakes: Earthquake[]): MapEvent[] {
  return earthquakes.map(normalizeEarthquake);
}

// ─── Natural Event → MapEvent (NASA EONET) ───

const EONET_TYPE_MAP: Record<string, MapEventType> = {
  wildfires: 'natural-event',
  volcanoes: 'natural-event',
  severeStorms: 'weather',
  floods: 'natural-event',
  earthquakes: 'earthquake',
  landslides: 'natural-event',
  seaLakeIce: 'climate-anomaly',
  drought: 'climate-anomaly',
  dustHaze: 'weather',
  tempExtremes: 'climate-anomaly',
  waterColor: 'climate-anomaly',
  snow: 'weather',
};

export function normalizeNaturalEvent(event: NaturalEvent): MapEvent {
  return {
    id: `eonet-${event.id}`,
    type: EONET_TYPE_MAP[event.category] || 'natural-event',
    title: event.title,
    coordinates: event.coordinates,
    time: event.time,
    severity: event.severity,
    region: regionFromCoordinates(event.coordinates[0], event.coordinates[1]),
    source: event.source,
    url: event.url,
    meta: {
      eonetCategory: event.category,
    },
  };
}

export function normalizeNaturalEvents(events: NaturalEvent[]): MapEvent[] {
  return events.map(normalizeNaturalEvent);
}

/**
 * Category-balanced feed normalization.
 *
 * Instead of pure-recency slicing (which lets high-volume tech/science
 * feeds crowd out news/defense/conflict), we:
 * 1. Group items by FeedCategory
 * 2. Apply priority weights (news/defense highest, tech lowest)
 * 3. Allocate the maxItems budget proportionally by weight × item count
 * 4. Within each allocation, take the most recent items
 * 5. Merge, sort by time, return
 */
const CATEGORY_WEIGHTS: Partial<Record<FeedCategory, number>> = {
  'world-news': 3,
  'us-news': 3,
  defense: 3,
  government: 2.5,
  humanitarian: 3,
  'regional-europe': 3,
  'regional-mideast': 3,
  'regional-africa': 3,
  'regional-asia': 3,
  'regional-latam': 3,
  cybersecurity: 2.5,
  'think-tanks': 2,
  climate: 2,
  energy: 2,
  commodities: 1.5,
  finance: 1.5,
  science: 1,
  tech: 1,
};

export function normalizeFeedItems(
  items: FeedItem[],
  maxItems = 200,
  focusMode: FeedFocusMode = 'all',
): MapEvent[] {
  if (items.length === 0) return [];

  // Group by category
  const groups = new Map<FeedCategory, FeedItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) || [];
    list.push(item);
    groups.set(item.category, list);
  }

  // Sort each group by recency
  for (const list of groups.values()) {
    list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }

  // Compute effective weight: base category weight × focus mode multiplier
  const effectiveWeight = (cat: FeedCategory) =>
    (CATEGORY_WEIGHTS[cat] ?? 1) * getFocusModeWeight(focusMode, cat);

  // Compute weighted budget per category
  let totalWeight = 0;
  for (const [cat, list] of groups) {
    totalWeight += effectiveWeight(cat) * Math.min(list.length, maxItems);
  }

  // Allocate slots proportionally, minimum 1 per category with items
  const allocations = new Map<FeedCategory, number>();
  let allocated = 0;
  for (const [cat, list] of groups) {
    const share = (effectiveWeight(cat) * Math.min(list.length, maxItems)) / totalWeight;
    const slots = Math.max(1, Math.round(share * maxItems));
    allocations.set(cat, Math.min(slots, list.length));
    allocated += Math.min(slots, list.length);
  }

  // If we over-allocated, trim from lowest-weight categories first
  if (allocated > maxItems) {
    const sortedCats = [...allocations.entries()]
      .sort((a, b) => (CATEGORY_WEIGHTS[a[0]] ?? 1) - (CATEGORY_WEIGHTS[b[0]] ?? 1));
    let excess = allocated - maxItems;
    for (const [cat, slots] of sortedCats) {
      if (excess <= 0) break;
      const trim = Math.min(excess, slots - 1); // keep at least 1
      if (trim > 0) {
        allocations.set(cat, slots - trim);
        excess -= trim;
      }
    }
  }

  // Sample items per category
  const sampled: FeedItem[] = [];
  for (const [cat, list] of groups) {
    const limit = allocations.get(cat) ?? 1;
    sampled.push(...list.slice(0, limit));
  }

  // Final sort by time and normalize
  sampled.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return sampled.map((item, i) => normalizeFeedItem(item, i));
}

// ─── Country → Region Mapping (for ReliefWeb disasters without coordinates) ───

const COUNTRY_REGION_MAP: Record<string, Region> = {
  // Middle East
  Syria: 'MIDDLE EAST', Yemen: 'MIDDLE EAST', Iraq: 'MIDDLE EAST',
  Lebanon: 'MIDDLE EAST', Palestine: 'MIDDLE EAST', Iran: 'MIDDLE EAST',
  'Saudi Arabia': 'MIDDLE EAST', Jordan: 'MIDDLE EAST', Israel: 'MIDDLE EAST',
  Turkey: 'MIDDLE EAST', Libya: 'MIDDLE EAST',
  // Africa
  Sudan: 'AFRICA', 'South Sudan': 'AFRICA', Ethiopia: 'AFRICA',
  Somalia: 'AFRICA', 'Democratic Republic of the Congo': 'AFRICA',
  Nigeria: 'AFRICA', Mali: 'AFRICA', 'Burkina Faso': 'AFRICA',
  Niger: 'AFRICA', Chad: 'AFRICA', Cameroon: 'AFRICA',
  Mozambique: 'AFRICA', 'South Africa': 'AFRICA', Kenya: 'AFRICA',
  Uganda: 'AFRICA', Tanzania: 'AFRICA', Madagascar: 'AFRICA',
  // South Asia
  Afghanistan: 'SOUTH ASIA', Pakistan: 'SOUTH ASIA', India: 'SOUTH ASIA',
  Bangladesh: 'SOUTH ASIA', 'Sri Lanka': 'SOUTH ASIA', Nepal: 'SOUTH ASIA',
  Myanmar: 'SOUTH ASIA',
  // East Asia
  China: 'EAST ASIA', Japan: 'EAST ASIA', Philippines: 'EAST ASIA',
  Indonesia: 'EAST ASIA', Vietnam: 'EAST ASIA', Thailand: 'EAST ASIA',
  'South Korea': 'EAST ASIA', 'North Korea': 'EAST ASIA',
  // Europe
  Ukraine: 'EUROPE', Russia: 'EUROPE', France: 'EUROPE',
  Germany: 'EUROPE', 'United Kingdom': 'EUROPE', Italy: 'EUROPE',
  Spain: 'EUROPE', Poland: 'EUROPE', Greece: 'EUROPE',
  // Americas
  Haiti: 'SOUTH AMERICA', Colombia: 'SOUTH AMERICA', Venezuela: 'SOUTH AMERICA',
  Brazil: 'SOUTH AMERICA', Mexico: 'NORTH AMERICA', Guatemala: 'SOUTH AMERICA',
  Honduras: 'SOUTH AMERICA', 'United States': 'NORTH AMERICA', Canada: 'NORTH AMERICA',
  // Oceania
  Australia: 'OCEANIA', 'New Zealand': 'OCEANIA', Fiji: 'OCEANIA',
  'Papua New Guinea': 'OCEANIA',
};

export function regionFromCountry(country: string): Region {
  if (COUNTRY_REGION_MAP[country]) return COUNTRY_REGION_MAP[country];
  // Fuzzy match: check if country name is contained in any key
  for (const [key, region] of Object.entries(COUNTRY_REGION_MAP)) {
    if (country.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(country.toLowerCase())) {
      return region;
    }
  }
  return 'AFRICA'; // fallback for unrecognized countries (most humanitarian crises)
}

// ─── ReliefWeb Disaster → MapEvent ───

function reliefWebSeverity(type: string): MapEvent['severity'] {
  const lower = type.toLowerCase();
  if (lower.includes('complex emergency') || lower.includes('conflict')) return 'critical';
  if (lower.includes('epidemic') || lower.includes('famine')) return 'critical';
  if (lower.includes('earthquake') || lower.includes('cyclone') || lower.includes('flood')) return 'high';
  if (lower.includes('drought') || lower.includes('volcano')) return 'high';
  return 'medium';
}

export function normalizeReliefWebDisaster(disaster: ReliefWebDisaster): MapEvent {
  const region = regionFromCountry(disaster.country);
  const cities = REGION_CITIES[region];
  const city = cities[hashToFloat(disaster.id, 99) * cities.length | 0];
  const coordinates = jitterCoordinates(city, region, disaster.id);

  return {
    id: `rw-${disaster.id}`,
    type: 'humanitarian-crisis',
    title: disaster.name,
    coordinates,
    time: disaster.date,
    severity: reliefWebSeverity(disaster.type),
    region,
    source: 'ReliefWeb',
    url: disaster.url,
    meta: {
      disasterType: disaster.type,
      country: disaster.country,
      status: disaster.status,
      glide: disaster.glide,
    },
  };
}

export function normalizeReliefWebDisasters(disasters: ReliefWebDisaster[]): MapEvent[] {
  return disasters.map(normalizeReliefWebDisaster);
}

// ─── GDACS Alert → MapEvent ───

export function normalizeGDACSAlert(alert: GDACSAlert): MapEvent {
  return {
    id: `gdacs-${alert.id}`,
    type: 'disaster-alert',
    title: alert.title,
    coordinates: alert.coordinates,
    time: alert.date,
    severity: alert.severity,
    region: regionFromCoordinates(alert.coordinates[0], alert.coordinates[1]),
    source: 'GDACS',
    url: alert.url,
    meta: {
      alertLevel: alert.alertLevel,
      eventType: alert.eventType,
      country: alert.country,
      population: alert.population,
    },
  };
}

export function normalizeGDACSAlerts(alerts: GDACSAlert[]): MapEvent[] {
  return alerts.map(normalizeGDACSAlert);
}

// ─── ACLED Event → MapEvent ───

function acledSeverity(fatalities: number): MapEvent['severity'] {
  if (fatalities >= 50) return 'critical';
  if (fatalities >= 10) return 'high';
  if (fatalities >= 1) return 'medium';
  return 'low';
}

function acledEventTypeToMapType(eventType: string): MapEventType {
  const lower = eventType.toLowerCase();
  if (lower.includes('protest') || lower.includes('riot')) return 'protest';
  return 'armed-conflict';
}

export function normalizeACLEDEvent(event: ACLEDEvent): MapEvent {
  return {
    id: `acled-${event.id}`,
    type: acledEventTypeToMapType(event.eventType),
    title: `${event.eventType} — ${event.location}, ${event.country}`,
    coordinates: event.coordinates,
    time: event.date,
    severity: acledSeverity(event.fatalities),
    region: regionFromCoordinates(event.coordinates[0], event.coordinates[1]),
    source: 'ACLED',
    meta: {
      eventType: event.eventType,
      fatalities: event.fatalities,
      country: event.country,
      location: event.location,
    },
  };
}

export function normalizeACLEDEvents(events: ACLEDEvent[]): MapEvent[] {
  return events.map(normalizeACLEDEvent);
}

// ─── Severity Inference Helpers ───

function inferSeverityFromText(text: string, category: FeedCategory): MapEvent['severity'] {
  const lower = text.toLowerCase();

  if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) return 'critical';
  if (HIGH_KEYWORDS.some((k) => lower.includes(k))) return 'high';
  if (category === 'defense') return 'high';
  if (category === 'humanitarian') return 'high';
  return 'medium';
}

function mapSeverityString(severity?: string): MapEvent['severity'] {
  if (!severity) return 'medium';
  const lower = severity.toLowerCase();
  if (lower === 'critical' || lower === 'extreme' || lower === 'severe') return 'critical';
  if (lower === 'high' || lower === 'major' || lower === 'significant') return 'high';
  if (lower === 'medium' || lower === 'moderate' || lower === 'warning') return 'medium';
  return 'low';
}
