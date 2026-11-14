const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const FIRMS_SOURCE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area';
const FIRMS_WMS_URL = 'https://firms.modaps.eosdis.nasa.gov/mapserver/wms/burned_area';
const ASF_SEARCH_URL = 'https://api.daac.asf.alaska.edu/services/search/param';
const ASF_SOURCE_URL = 'https://search.asf.alaska.edu/';

// Project footprint corners from the supplied QGIS/KML source notes (lon, lat).
const FOOTPRINT: Array<[number, number]> = [
  [76.58633064906468, 21.290446503925544],
  [79.8633274914315, 21.22767185713987],
  [79.97111494969664, 24.234507714377845],
  [76.62164546849948, 24.307224375480946],
];

type Detection = {
  lat: number;
  lon: number;
  date: string;
  time: string;
  conf: string;
  frp: number | null;
};

type RadarScene = {
  sceneName: string;
  acquiredAt: string;
  polarization: string;
  frequency: string;
  track: string;
  direction: string;
  frame: string;
  browseUrl: string;
  sourceUrl: string;
  collection: string;
  processingVersion: string;
  comparisonKey: string;
};

function jsonResponse(body: unknown, status = 200, cacheSeconds = 600): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheSeconds}`,
    },
  });
}

async function getModisBurnedArea(month: string): Promise<Response> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return jsonResponse({ error: 'Choose a month in YYYY-MM format.' }, 400, 0);
  }

  const mapKey = Deno.env.get('FIRMS_MAP_KEY');
  if (!mapKey) {
    return jsonResponse({
      error: 'The NASA burned-area image is not configured. Add the FIRMS map key as a Supabase Edge Function secret.',
    }, 503, 0);
  }

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    SRS: 'EPSG:4326',
    BBOX: '76.586,21.228,79.971,24.307',
    WIDTH: '880',
    HEIGHT: '800',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
  });
  const url = `${FIRMS_WMS_URL}/${encodeURIComponent(mapKey)}/modis_burned_area/${month}/128+0+0,128+0+0/?${params.toString()}`;

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.toLowerCase().includes('image/')) {
      return jsonResponse({
        error: `NASA FIRMS could not provide a burned-area image for ${month}. The month may not be published yet, or the WMS key may need checking.`,
      }, 502, 0);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=21600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return jsonResponse({ error: 'NASA FIRMS could not be reached. Try again later.' }, 502, 0);
  }
}

function pointInPolygon(lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = FOOTPRINT.length - 1; i < FOOTPRINT.length; j = i++) {
    const [xi, yi] = FOOTPRINT[i];
    const [xj, yj] = FOOTPRINT[j];
    const crosses = (yi > lat) !== (yj > lat)
      && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function parseCsv(text: string): Detection[] | null {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  const col = (name: string) => headers.indexOf(name);
  const latColumn = col('latitude');
  const lonColumn = col('longitude');
  const dateColumn = col('acq_date');
  const timeColumn = col('acq_time');
  const confidenceColumn = col('confidence');
  const frpColumn = col('frp');
  if ([latColumn, lonColumn, dateColumn].some((column) => column < 0)) return null;
  if (lines.length < 2) return [];

  const records: Detection[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(',');
    const lat = Number(cells[latColumn]);
    const lon = Number(cells[lonColumn]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !pointInPolygon(lon, lat)) continue;
    const rawTime = timeColumn < 0 ? '' : (cells[timeColumn] ?? '').trim();
    const unpaddedTime = rawTime.replace(/\D/g, '');
    const timeDigits = unpaddedTime ? unpaddedTime.padStart(4, '0').slice(-4) : '';
    const rawFrp = frpColumn < 0 ? '' : (cells[frpColumn] ?? '').trim();
    const frp = rawFrp ? Number(rawFrp) : Number.NaN;
    records.push({
      lat,
      lon,
      date: (cells[dateColumn] ?? '').trim(),
      time: timeDigits,
      conf: confidenceColumn < 0 ? '' : (cells[confidenceColumn] ?? '').trim(),
      frp: Number.isFinite(frp) ? frp : null,
    });
  }
  return records;
}

async function getLiveFirms() {
  const sourceUrl = 'https://firms.modaps.eosdis.nasa.gov/api/area';
  const mapKey = Deno.env.get('FIRMS_MAP_KEY');
  if (!mapKey) {
    return {
      status: 'configuration-required' as const,
      message: 'Add FIRMS_MAP_KEY to Supabase Edge Function Secrets to enable live thermal detections.',
      records: [] as Detection[],
      sourceUrl,
    };
  }

  const bbox = '76.55,21.18,80.02,24.36';
  const url = `${FIRMS_SOURCE_URL}/csv/${encodeURIComponent(mapKey)}/VIIRS_NOAA21_NRT/${bbox}/5`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      return {
        status: 'unavailable' as const,
        message: `NASA FIRMS responded with HTTP ${response.status}. Check the key and try again later.`,
        records: [] as Detection[],
        sourceUrl,
      };
    }
    const records = parseCsv(await response.text());
    if (records === null) {
      return {
        status: 'unavailable' as const,
        message: 'NASA FIRMS returned an unexpected response. Verify FIRMS_MAP_KEY in Supabase Edge Function Secrets.',
        records: [] as Detection[],
        sourceUrl,
      };
    }
    return { status: 'available' as const, records, sourceUrl };
  } catch {
    return {
      status: 'unavailable' as const,
      message: 'NASA FIRMS could not be reached right now.',
      records: [] as Detection[],
      sourceUrl,
    };
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function readBrowse(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = readBrowse(entry);
      if (url) return url;
    }
  }
  const record = asRecord(value);
  return firstText(record.url, record.href, record.URL, record.browseURL, record.browseUrl);
}

function parseRadarScene(value: unknown): RadarScene | null {
  const item = asRecord(value);
  const properties = asRecord(item.properties);
  const sceneCandidate = firstText(
    properties.sceneName,
    properties.fileName,
    properties.granuleName,
    properties.scene_name,
    item.sceneName,
    item.fileName,
    item.id,
  );
  const sceneName = sceneCandidate.split('/').pop()?.replace(/\.(h5|png|zip)$/i, '') ?? '';
  const parts = sceneName.split('_');
  // NISAR L2 GCOV names encode track, orbit direction, frame, polarization,
  // frequency and acquisition time in fixed positions.
  if (parts.length < 13 || !sceneName.startsWith('NISAR_L2_PR_GCOV_')) return null;
  const track = parts[5];
  const direction = parts[6];
  const frame = parts[7];
  const polarization = parts[9];
  const frequency = parts[10];
  const acquisitionToken = parts[11];
  if (!/^\d{3}$/.test(track) || !/^\d{3}$/.test(frame) || !/^[AD]$/.test(direction)) return null;
  const sceneDate = acquisitionToken.match(/^(\d{4})(\d{2})(\d{2})T/);
  const acquiredAt = sceneDate
    ? `${sceneDate[1]}-${sceneDate[2]}-${sceneDate[3]}`
    : firstText(properties.startTime, properties.acquisitionDate, item.startTime);
  const browseUrl = readBrowse(properties.browse ?? properties.browseURL ?? properties.browseUrl ?? item.browse);
  const sourceUrl = firstText(properties.url, properties.productUrl, item.url) || ASF_SOURCE_URL;
  const collection = firstText(properties.collectionName, properties.shortName, properties.collection, item.collection);
  const processingVersion = parts[13] ?? 'Not encoded';
  const comparisonKey = [track, direction, frame, polarization, frequency, collection].join(':');
  return {
    sceneName,
    acquiredAt: acquiredAt.slice(0, 10),
    polarization,
    frequency,
    track,
    direction,
    frame,
    browseUrl: /^https:\/\//i.test(browseUrl) ? browseUrl : '',
    sourceUrl,
    collection,
    processingVersion,
    comparisonKey,
  };
}

function findResults(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (Array.isArray(root.features)) return root.features;
  if (Array.isArray(root.results)) return root.results;
  if (Array.isArray(root.Results)) return root.Results;
  if (Array.isArray(root.data)) return root.data;
  return [];
}

async function getLiveNisar() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 180);
  const params = new URLSearchParams({
    platform: 'NISAR',
    processingLevel: 'GCOV',
    intersectsWith: 'POLYGON((76.58633064906468 21.290446503925544,79.8633274914315 21.22767185713987,79.97111494969664 24.234507714377845,76.62164546849948 24.307224375480946,76.58633064906468 21.290446503925544))',
    start: startDate.toISOString().slice(0, 10),
    end: 'today',
    output: 'json',
    maxResults: '500',
  });
  const sourceUrl = ASF_SOURCE_URL;
  try {
    const response = await fetch(`${ASF_SEARCH_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      return {
        status: 'unavailable' as const,
        message: `ASF Search responded with HTTP ${response.status}.`,
        scenes: [] as RadarScene[],
        sourceUrl,
      };
    }
    const payload: unknown = await response.json();
    const apiResults = findResults(payload);
    const responseObject = asRecord(payload);
    if (apiResults.length === 0 && (responseObject.error || responseObject.message)) {
      return {
        status: 'unavailable' as const,
        message: firstText(responseObject.error, responseObject.message) || 'ASF Search returned an unexpected response.',
        scenes: [] as RadarScene[],
        sourceUrl,
      };
    }
    const candidates = apiResults
      .map(parseRadarScene)
      .filter((scene): scene is RadarScene => scene !== null && Boolean(scene.acquiredAt))
      .sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt));

    // Remove repeat processing versions for the same acquisition. Prefer the
    // first (newest) catalog result, then keep the most recent scene dates.
    const seen = new Set<string>();
    const scenes = candidates.filter((scene) => {
      const key = `${scene.comparisonKey}:${scene.acquiredAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 100);

    return { status: 'available' as const, scenes, sourceUrl };
  } catch {
    return {
      status: 'unavailable' as const,
      message: 'ASF Search could not be reached right now.',
      scenes: [] as RadarScene[],
      sourceUrl,
    };
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed.' }, 405, 0);

  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get('resource') === 'modis-burned-area') {
    return getModisBurnedArea(requestUrl.searchParams.get('month') ?? '');
  }

  const [firms, nisar] = await Promise.all([getLiveFirms(), getLiveNisar()]);
  return jsonResponse({ fetchedAt: new Date().toISOString(), firms, nisar });
});
