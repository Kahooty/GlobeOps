/**
 * ACLED API Service — fetches armed conflict and protest events.
 *
 * ACLED (Armed Conflict Location & Event Data) provides real-time
 * data on political violence, protests, and key political events.
 *
 * Requires API key (VITE_ACLED_API_KEY) and registered email
 * (VITE_ACLED_EMAIL). Returns empty array when credentials are missing.
 *
 * Free tier: limited to aggregated/dashboard data.
 * Full access: requires approved research/partner access.
 */

import type { ACLEDEvent } from '@/types';

// ─── API Response Types ───

interface ACLEDRecord {
  data_id?: number;
  event_type?: string;
  country?: string;
  admin1?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  event_date?: string;
  fatalities?: number | string;
  source?: string;
  notes?: string;
}

interface ACLEDResponse {
  success: boolean;
  data: ACLEDRecord[];
  count?: number;
}

// ─── Fetch & Parse ───

export async function fetchACLEDEvents(): Promise<ACLEDEvent[]> {
  const apiKey = import.meta.env.VITE_ACLED_API_KEY;
  const email = import.meta.env.VITE_ACLED_EMAIL;

  // Graceful degradation: return empty when no credentials
  if (!apiKey || !email) {
    return [];
  }

  // Fetch events from the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

  const params = new URLSearchParams({
    key: apiKey,
    email: email,
    event_date: fromDate,
    event_date_where: '>=',
    limit: '200',
  });

  const apiUrl = `https://api.acleddata.com/acled/read?${params.toString()}`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    // Don't throw on auth errors — just return empty
    if (response.status === 401 || response.status === 403) {
      console.warn('[ACLED] Authentication failed — check API key and email');
      return [];
    }
    throw new Error(`ACLED fetch failed: ${response.status}`);
  }

  const data: ACLEDResponse = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    return [];
  }

  const events: ACLEDEvent[] = [];

  for (const record of data.data) {
    const lat = parseFloat(record.latitude || '');
    const lon = parseFloat(record.longitude || '');
    if (isNaN(lat) || isNaN(lon)) continue;

    events.push({
      id: String(record.data_id || `${lon}-${lat}-${record.event_date}`),
      eventType: record.event_type || 'Unknown',
      country: record.country || 'Unknown',
      location: record.location || record.admin1 || 'Unknown',
      coordinates: [lon, lat],
      date: record.event_date ? new Date(record.event_date) : new Date(),
      fatalities: typeof record.fatalities === 'string'
        ? parseInt(record.fatalities, 10) || 0
        : record.fatalities || 0,
      source: record.source || 'ACLED',
      notes: record.notes,
    });
  }

  return events;
}
