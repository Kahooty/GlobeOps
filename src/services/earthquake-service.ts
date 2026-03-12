import type { Earthquake } from '@/types';

// ─── USGS GeoJSON Feature Type ───

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string | null;
    time: number;
    url: string;
    tsunami: number;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export async function fetchEarthquakes(minMagnitude = 4): Promise<Earthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time',
    limit: '50',
    minmagnitude: String(minMagnitude),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`USGS fetch failed: ${response.status}`);
    }

    const data = await response.json();

    return data.features.map((f: USGSFeature) => ({
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place || 'Unknown',
      time: new Date(f.properties.time),
      depth: f.geometry.coordinates[2],
      coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as [number, number],
      url: f.properties.url,
      tsunami: f.properties.tsunami === 1,
      severity: magnitudeToSeverity(f.properties.mag),
    }));
  } finally {
    clearTimeout(timeout);
  }
}

function magnitudeToSeverity(mag: number): Earthquake['severity'] {
  if (mag >= 7) return 'great';
  if (mag >= 6) return 'major';
  if (mag >= 5) return 'moderate';
  return 'minor';
}
