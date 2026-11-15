const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CMR = 'https://cmr.earthdata.nasa.gov/search/granules.json';
const FOOTPRINT = '76.5863,21.2904,79.8633,21.2277,79.9711,24.2345,76.6216,24.3072,76.5863,21.2904';
const PRODUCTS = [
  { id: 'C2565786756-LPCLOUD', name: 'MODIS MCD64A1 burned area', resolution: '500 m · monthly' },
  { id: 'C2746980408-LPCLOUD', name: 'OPERA DIST-ALERT-HLS', resolution: '30 m · optical disturbance alerts' },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' } });
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function recentPeriod() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 35);
  const exclusiveEnd = new Date(end);
  exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  return {
    start: isoDate(start),
    end: isoDate(end),
    temporal: `${isoDate(start)}T00:00:00Z,${isoDate(exclusiveEnd)}T00:00:00Z`,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const token = Deno.env.get('EARTHDATA_TOKEN');
  if (!token) return json({ error: 'EARTHDATA_TOKEN is not configured in Supabase Edge Function Secrets.' }, 503);

  try {
    const period = recentPeriod();
    const products = await Promise.all(PRODUCTS.map(async (product) => {
      const url = new URL(CMR);
      url.searchParams.set('collection_concept_id', product.id);
      url.searchParams.set('polygon', FOOTPRINT);
      url.searchParams.set('temporal', period.temporal);
      url.searchParams.set('page_size', '50');
      url.searchParams.set('sort_key[]', '-start_date');
      const response = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`${product.name}: NASA CMR returned HTTP ${response.status}.`);
      const payload = record(await response.json());
      const feed = record(payload.feed);
      const entries = Array.isArray(feed.entry) ? feed.entry : [];
      const granules = entries.map((item) => {
        const entry = record(item);
        const links = Array.isArray(entry.links) ? entry.links : [];
        const link = links.map(record).find((candidate) => candidate.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#' && typeof candidate.href === 'string')
          ?? links.map(record).find((candidate) => typeof candidate.href === 'string' && String(candidate.href).startsWith('https://'));
        return {
          title: typeof entry.title === 'string' ? entry.title : 'NASA product granule',
          date: typeof entry.time_start === 'string' ? entry.time_start.slice(0, 10) : 'Date unavailable',
          url: typeof link?.href === 'string' ? link.href : `https://search.earthdata.nasa.gov/search?q=${encodeURIComponent(product.name)}`,
        };
      });
      const hitCount = typeof feed.hits === 'number' ? feed.hits : Number(feed.hits);
      return { ...product, count: Number.isFinite(hitCount) ? hitCount : granules.length, granules };
    }));
    return json({ period: `${period.start} through ${period.end}`, products });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'NASA Earthdata catalog request failed.' }, 502);
  }
});
