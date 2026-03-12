/**
 * NASA EONET v3 Service — fetches active natural events worldwide.
 *
 * EONET (Earth Observatory Natural Event Tracker) provides real-time
 * GeoJSON data for wildfires, volcanoes, severe storms, floods,
 * sea/lake ice, drought, and other natural hazards.
 *
 * Free API, no authentication required. Returns real coordinates.
 */

import type { NaturalEvent, MapEventType } from '@/types';

// ─── EONET Category → MapEventType mapping ───

const EONET_TYPE_MAP: Record<string, MapEventType> = {
  wildfires: 'natural-event',
  volcanoes: 'natural-event',
  severeStorms: 'weather',
  floods: 'natural-event',
  earthquakes: 'earthquake', // supplement USGS
  landslides: 'natural-event',
  seaLakeIce: 'climate-anomaly',
  drought: 'climate-anomaly',
  dustHaze: 'weather',
  tempExtremes: 'climate-anomaly',
  waterColor: 'climate-anomaly',
  snow: 'weather',
};

// ─── Severity inference from EONET categories ───

function inferSeverity(categoryId: string, title: string): NaturalEvent['severity'] {
  const lower = title.toLowerCase();

  // Critical keywords
  if (lower.includes('major') || lower.includes('catastrophic') || lower.includes('extreme'))
    return 'critical';

  // High-severity event types
  if (categoryId === 'volcanoes') return 'high';
  if (categoryId === 'floods' && (lower.includes('severe') || lower.includes('flash')))
    return 'high';
  if (categoryId === 'severeStorms' && (lower.includes('hurricane') || lower.includes('typhoon') || lower.includes('cyclone')))
    return 'critical';

  // Medium for active wildfires and storms
  if (categoryId === 'wildfires') return 'medium';
  if (categoryId === 'severeStorms') return 'medium';
  if (categoryId === 'earthquakes') return 'medium';
  if (categoryId === 'landslides') return 'medium';

  return 'low';
}

// ─── EONET API Response Types ───

interface EonetGeometry {
  date: string;
  type: string;
  coordinates: number[];
}

interface EonetSource {
  id: string;
  url: string;
}

interface EonetCategory {
  id: string;
  title: string;
}

interface EonetEvent {
  id: string;
  title: string;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
}

interface EonetResponse {
  events: EonetEvent[];
}

// ─── Fetch & Parse ───

export async function fetchNaturalEvents(): Promise<NaturalEvent[]> {
  const apiUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=80';
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`EONET fetch failed: ${response.status}`);
  }

  const data: EonetResponse = await response.json();

  const events: NaturalEvent[] = [];

  for (const event of data.events) {
    // Use the most recent geometry entry
    const latestGeo = event.geometry[event.geometry.length - 1];
    if (!latestGeo) continue;

    // EONET returns [lon, lat] for Point type
    let lon: number;
    let lat: number;

    if (latestGeo.type === 'Point') {
      lon = latestGeo.coordinates[0];
      lat = latestGeo.coordinates[1];
    } else if (latestGeo.type === 'Polygon') {
      // For polygons, use centroid of first ring
      const ring = latestGeo.coordinates as unknown as number[][];
      const sumLon = ring.reduce((s, c) => s + c[0], 0);
      const sumLat = ring.reduce((s, c) => s + c[1], 0);
      lon = sumLon / ring.length;
      lat = sumLat / ring.length;
    } else {
      continue; // Skip unsupported geometry types
    }

    // Validate coordinates
    if (isNaN(lon) || isNaN(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) continue;

    const categoryId = event.categories[0]?.id || 'other';
    const sourceUrl = event.sources[0]?.url || '';

    events.push({
      id: event.id,
      title: event.title,
      category: categoryId,
      coordinates: [lon, lat],
      time: new Date(latestGeo.date),
      source: 'NASA EONET',
      url: sourceUrl,
      severity: inferSeverity(categoryId, event.title),
    });
  }

  return events;
}

// ─── EONET → MapEventType helper ───

export function eonetCategoryToMapType(eonetCategory: string): MapEventType {
  return EONET_TYPE_MAP[eonetCategory] || 'natural-event';
}
