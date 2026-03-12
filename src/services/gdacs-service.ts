/**
 * GDACS API Service — fetches global disaster alerts.
 *
 * GDACS (Global Disaster Alert and Coordination System) provides
 * real-time alerts for earthquakes, floods, cyclones, volcanoes,
 * droughts, and tsunamis with GeoJSON spatial data.
 *
 * Free API, no authentication required.
 * Docs: https://www.gdacs.org/gdacsapi/swagger/index.html
 */

import type { GDACSAlert } from '@/types';

// ─── API Response Types ───

interface GDACSFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    eventid?: number;
    episodeid?: number;
    eventtype?: string;
    eventname?: string;
    name?: string;
    description?: string;
    htmldescription?: string;
    alertlevel?: string;
    alertscore?: number;
    country?: string;
    fromdate?: string;
    todate?: string;
    datemodified?: string;
    url?: { report?: string; details?: string };
    population?: { value?: number };
    severity?: { value?: number; unit?: string };
    cap?: string;
  };
}

interface GDACSResponse {
  type: string;
  features: GDACSFeature[];
}

// ─── Alert Level → Severity Mapping ───

function mapAlertLevelToSeverity(alertLevel: string): GDACSAlert['severity'] {
  switch (alertLevel.toLowerCase()) {
    case 'red': return 'critical';
    case 'orange': return 'high';
    case 'green': return 'medium';
    default: return 'low';
  }
}

function normalizeAlertLevel(alertLevel: string): GDACSAlert['alertLevel'] {
  const lower = alertLevel.toLowerCase();
  if (lower === 'red') return 'Red';
  if (lower === 'orange') return 'Orange';
  return 'Green';
}

// ─── GDACS Event Type Labels ───

const EVENT_TYPE_LABELS: Record<string, string> = {
  EQ: 'Earthquake',
  FL: 'Flood',
  TC: 'Cyclone',
  VO: 'Volcano',
  DR: 'Drought',
  TS: 'Tsunami',
  WF: 'Wildfire',
};

// ─── Fetch & Parse ───

export async function fetchGDACSAlerts(): Promise<GDACSAlert[]> {
  // Fetch alerts from the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  const toDate = now.toISOString().split('T')[0];

  const apiUrl = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=&fromDate=${fromDate}&toDate=${toDate}&alertlevel=Green;Orange;Red`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`GDACS fetch failed: ${response.status}`);
  }

  const data: GDACSResponse = await response.json();

  if (!data.features || !Array.isArray(data.features)) {
    return [];
  }

  const alerts: GDACSAlert[] = [];

  for (const feature of data.features) {
    const props = feature.properties;
    if (!props) continue;

    // Extract coordinates
    const geo = feature.geometry;
    if (!geo || geo.type !== 'Point' || !Array.isArray(geo.coordinates)) continue;

    const lon = geo.coordinates[0];
    const lat = geo.coordinates[1];
    if (!isFinite(lon) || !isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) continue;

    const alertLevel = normalizeAlertLevel(props.alertlevel || 'Green');
    const eventType = props.eventtype || 'UN';
    const eventLabel = EVENT_TYPE_LABELS[eventType] || eventType;
    const title = props.eventname || props.name || `${eventLabel} Alert`;
    const dateStr = props.fromdate || props.datemodified;

    alerts.push({
      id: `${eventType}-${props.eventid || feature.geometry.coordinates.join('-')}`,
      title,
      alertLevel,
      eventType,
      country: props.country || 'Unknown',
      coordinates: [lon, lat],
      date: dateStr ? new Date(dateStr) : new Date(),
      severity: mapAlertLevelToSeverity(props.alertlevel || 'Green'),
      population: props.population?.value,
      url: props.url?.report || props.url?.details || `https://www.gdacs.org/report.aspx?eventtype=${eventType}&eventid=${props.eventid}`,
    });
  }

  // Sort by severity (critical first) then date (newest first)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.date.getTime() - a.date.getTime();
  });

  return alerts;
}

export { EVENT_TYPE_LABELS as GDACS_EVENT_TYPE_LABELS };
