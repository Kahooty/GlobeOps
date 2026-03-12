/**
 * ReliefWeb API Service — fetches active humanitarian disasters from UN OCHA.
 *
 * ReliefWeb is the leading humanitarian information source on global crises
 * and disasters. Free API, no authentication required.
 *
 * Endpoint: https://api.reliefweb.int/v1/disasters
 * Docs: https://apidoc.reliefweb.int/
 */

import type { ReliefWebDisaster } from '@/types';

// ─── API Response Types ───

interface RWDisasterFields {
  name?: string;
  status?: string;
  glide?: string;
  type?: Array<{ name: string }>;
  country?: Array<{ name: string; iso3?: string }>;
  date?: { created?: string };
  url?: string;
  'description-html'?: string;
}

interface RWDisasterItem {
  id: string;
  fields: RWDisasterFields;
}

interface RWResponse {
  data: RWDisasterItem[];
}

// ─── Fetch & Parse ───

export async function fetchReliefWebDisasters(): Promise<ReliefWebDisaster[]> {
  const fields = [
    'name', 'status', 'glide', 'type', 'country', 'date', 'url',
  ].map((f) => `fields[include][]=${f}`).join('&');

  const apiUrl = `https://api.reliefweb.int/v1/disasters?appname=globeops&preset=latest&limit=50&${fields}`;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`ReliefWeb fetch failed: ${response.status}`);
  }

  const data: RWResponse = await response.json();

  if (!Array.isArray(data?.data)) {
    return [];
  }

  const disasters: ReliefWebDisaster[] = [];

  for (const item of data.data) {
    const f = item.fields;
    const status = f.status || 'past';

    // Only include active disasters
    if (status !== 'alert' && status !== 'ongoing' && status !== 'current') continue;

    const typeName = f.type?.[0]?.name || 'Unknown';
    const countryName = f.country?.[0]?.name || 'Unknown';
    const dateStr = f.date?.created;

    disasters.push({
      id: item.id,
      name: f.name || 'Unknown Disaster',
      status,
      glide: f.glide || '',
      type: typeName,
      country: countryName,
      date: dateStr ? new Date(dateStr) : new Date(),
      url: f.url || `https://reliefweb.int/disaster/${item.id}`,
    });
  }

  return disasters;
}
