/**
 * GDELT Service — Fetches geo-coded global events from GDELT Project API.
 *
 * Free, no API key required. Uses the GEO API v2 for geographic event data.
 * Returns event clusters with coordinates and themes.
 */

import type { MapEvent } from '@/types';
import { regionFromCoordinates } from './event-normalizer';

// ─── GDELT Event Types ───

export interface GDELTEvent {
  id: string;
  title: string;
  url: string;
  coordinates: [number, number];
  time: Date;
  tone: number;           // Average tone (-100 to 100)
  goldstein: number;      // Goldstein scale (-10 to 10)
  numArticles: number;    // Article count
  domain: string;         // Source domain
  imageUrl?: string;
}

// ─── Severity from Goldstein Scale ───

function goldsteinToSeverity(goldstein: number): MapEvent['severity'] {
  const abs = Math.abs(goldstein);
  if (abs >= 8) return 'critical';
  if (abs >= 5) return 'high';
  if (abs >= 2) return 'medium';
  return 'low';
}

// ─── Fetch GDELT Events ───

export async function fetchGDELTEvents(): Promise<GDELTEvent[]> {
  // GDELT GEO API — returns JSON with geo-coded event summaries
  const params = new URLSearchParams({
    query: 'conflict OR protest OR military OR crisis OR attack',
    mode: 'pointdata',
    format: 'json',
    maxpoints: '50',
    last24hrs: 'yes',
  });

  const targetUrl = `https://api.gdeltproject.org/api/v2/geo/geo?${params}`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`GDELT fetch failed: ${response.status}`);
  }

  const data = await response.json();

  // GDELT GEO API returns { type: "FeatureCollection", features: [...] }
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    return data.features.slice(0, 50).map((feature: Record<string, unknown>, i: number) => {
      const props = feature.properties as Record<string, unknown> || {};
      const geometry = feature.geometry as Record<string, unknown> || {};
      const coords = geometry.coordinates as number[] || [0, 0];

      return {
        id: String(props.urlpubtimeseq || `gdelt-${i}`),
        title: String(props.name || props.html || 'GDELT Event'),
        url: String(props.url || ''),
        coordinates: [coords[0], coords[1]] as [number, number],
        time: new Date(String(props.pubdate || props.dateadded || Date.now())),
        tone: Number(props.tone || 0),
        goldstein: Number(props.goldstein || 0),
        numArticles: Number(props.numarticles || 1),
        domain: String(props.domain || ''),
      };
    });
  }

  // Fallback: GDELT sometimes returns a flat array
  if (Array.isArray(data)) {
    return data.slice(0, 50).map((item: Record<string, unknown>, i: number) => ({
      id: String(item.urlpubtimeseq || `gdelt-${i}`),
      title: String(item.name || item.title || 'GDELT Event'),
      url: String(item.url || ''),
      coordinates: [Number(item.lon || item.actiongeo_long || 0), Number(item.lat || item.actiongeo_lat || 0)] as [number, number],
      time: new Date(String(item.dateadded || Date.now())),
      tone: Number(item.avgtone || 0),
      goldstein: Number(item.goldsteinscale || 0),
      numArticles: Number(item.numarticles || 1),
      domain: String(item.sourceurl || ''),
    }));
  }

  return [];
}

// ─── Normalize to MapEvents ───

export function gdeltEventsToMapEvents(events: GDELTEvent[]): MapEvent[] {
  return events
    .filter((e) => e.coordinates[0] !== 0 || e.coordinates[1] !== 0)
    .map((event) => ({
      id: `gdelt-${event.id}`,
      type: 'intel-hotspot' as const,
      title: event.title,
      coordinates: event.coordinates,
      time: event.time,
      severity: goldsteinToSeverity(event.goldstein),
      region: regionFromCoordinates(event.coordinates[0], event.coordinates[1]),
      source: 'GDELT',
      url: event.url,
      meta: {
        tone: event.tone,
        goldstein: event.goldstein,
        numArticles: event.numArticles,
        domain: event.domain,
      },
    }));
}
