/**
 * NOAA Weather Alerts Service — Fetches active weather alerts from NWS API.
 *
 * Free, no API key required. Returns GeoJSON FeatureCollection.
 * Parses severity, headline, coordinates, and affected areas.
 */

import type { MapEvent, Region } from '@/types';
import { regionFromCoordinates } from './event-normalizer';

// ─── NOAA Alert Types ───

export interface NOAAAlert {
  id: string;
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  certainty: string;
  urgency: string;
  event: string;
  description: string;
  areaDesc: string;
  onset: string;
  expires: string;
  coordinates: [number, number] | null;
  url: string;
}

// ─── Severity Mapping ───

function mapNOAASeverity(severity: string): MapEvent['severity'] {
  switch (severity) {
    case 'Extreme': return 'critical';
    case 'Severe': return 'high';
    case 'Moderate': return 'medium';
    default: return 'low';
  }
}

// ─── Extract representative point from geometry or affected area ───

function extractCoordinates(feature: Record<string, unknown>): [number, number] | null {
  const geometry = feature.geometry as Record<string, unknown> | null;
  if (!geometry) return null;

  const type = geometry.type as string;
  const coords = geometry.coordinates as number[] | number[][] | number[][][] | null;
  if (!coords) return null;

  if (type === 'Point') {
    const c = coords as number[];
    return [c[0], c[1]];
  }

  if (type === 'Polygon' && Array.isArray(coords[0])) {
    // Centroid of first ring
    const ring = coords[0] as number[][];
    let sumLon = 0, sumLat = 0;
    for (const pt of ring) {
      sumLon += (pt as number[])[0];
      sumLat += (pt as number[])[1];
    }
    return [sumLon / ring.length, sumLat / ring.length];
  }

  return null;
}

// ─── US state centroids (fallback when no geometry) ───

const STATE_CENTROIDS: Record<string, [number, number]> = {
  'AL': [-86.9, 32.8], 'AK': [-153.5, 64.3], 'AZ': [-111.1, 34.0],
  'AR': [-92.2, 34.8], 'CA': [-119.7, 36.8], 'CO': [-105.8, 39.1],
  'CT': [-72.8, 41.6], 'DE': [-75.5, 39.0], 'FL': [-81.5, 27.7],
  'GA': [-83.5, 32.2], 'HI': [-155.5, 19.9], 'ID': [-114.7, 44.1],
  'IL': [-89.4, 40.6], 'IN': [-86.1, 39.8], 'IA': [-93.1, 42.0],
  'KS': [-98.5, 38.5], 'KY': [-84.3, 37.7], 'LA': [-91.2, 30.5],
  'ME': [-69.4, 45.3], 'MD': [-76.6, 39.0], 'MA': [-71.5, 42.4],
  'MI': [-84.5, 44.3], 'MN': [-94.7, 46.7], 'MS': [-89.7, 32.3],
  'MO': [-91.8, 38.6], 'MT': [-109.5, 46.8], 'NE': [-99.9, 41.5],
  'NV': [-116.4, 38.8], 'NH': [-71.5, 44.0], 'NJ': [-74.4, 40.1],
  'NM': [-105.9, 34.5], 'NY': [-74.9, 43.0], 'NC': [-79.0, 35.5],
  'ND': [-101.0, 47.5], 'OH': [-82.8, 40.4], 'OK': [-97.1, 35.0],
  'OR': [-120.6, 43.8], 'PA': [-77.2, 41.2], 'RI': [-71.5, 41.7],
  'SC': [-81.2, 34.0], 'SD': [-99.4, 43.9], 'TN': [-86.6, 35.5],
  'TX': [-99.9, 31.2], 'UT': [-111.9, 39.3], 'VT': [-72.6, 44.6],
  'VA': [-78.2, 37.8], 'WA': [-120.7, 47.7], 'WV': [-80.6, 38.6],
  'WI': [-89.6, 44.3], 'WY': [-107.3, 43.1],
  'PR': [-66.6, 18.2], 'GU': [144.8, 13.4], 'VI': [-64.9, 18.3],
};

function fallbackCoordFromArea(areaDesc: string): [number, number] | null {
  // Try to match a US state abbreviation in area description
  for (const [code, coords] of Object.entries(STATE_CENTROIDS)) {
    if (areaDesc.includes(code)) return coords;
  }
  // Default to continental US center
  return [-98.6, 39.8];
}

// ─── Fetch NOAA Alerts ───

export async function fetchNOAAAlerts(): Promise<NOAAAlert[]> {
  const proxyUrl = `/api/proxy?url=${encodeURIComponent('https://api.weather.gov/alerts/active?status=actual&limit=50')}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`NOAA fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const features = data.features || [];

  return features.slice(0, 50).map((feature: Record<string, unknown>) => {
    const props = feature.properties as Record<string, unknown>;
    const coords = extractCoordinates(feature)
      || fallbackCoordFromArea(String(props.areaDesc || ''));

    return {
      id: String(props.id || `noaa-${Math.random().toString(36).slice(2)}`),
      headline: String(props.headline || props.event || 'Weather Alert'),
      severity: String(props.severity || 'Unknown'),
      certainty: String(props.certainty || ''),
      urgency: String(props.urgency || ''),
      event: String(props.event || ''),
      description: String(props.description || '').slice(0, 300),
      areaDesc: String(props.areaDesc || ''),
      onset: String(props.onset || ''),
      expires: String(props.expires || ''),
      coordinates: coords,
      url: String((props.references as unknown[])?.length
        ? `https://alerts.weather.gov`
        : props['@id'] || 'https://weather.gov'),
    } as NOAAAlert;
  });
}

// ─── Normalize to MapEvents ───

export function noaaAlertsToMapEvents(alerts: NOAAAlert[]): MapEvent[] {
  return alerts
    .filter((a) => a.coordinates !== null)
    .map((alert) => ({
      id: `noaa-${alert.id}`,
      type: 'weather' as const,
      title: alert.headline,
      coordinates: alert.coordinates!,
      time: new Date(alert.onset || Date.now()),
      severity: mapNOAASeverity(alert.severity),
      region: alert.coordinates
        ? regionFromCoordinates(alert.coordinates[0], alert.coordinates[1])
        : 'NORTH AMERICA' as Region,
      source: 'NOAA/NWS',
      url: alert.url,
      meta: {
        event: alert.event,
        certainty: alert.certainty,
        urgency: alert.urgency,
        areaDesc: alert.areaDesc,
        expires: alert.expires,
      },
    }));
}
