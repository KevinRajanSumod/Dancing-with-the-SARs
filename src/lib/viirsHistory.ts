export interface ViirsHistoryRecord {
  lat: number;
  lon: number;
  date: string;
  time: string;
  conf: string;
  frp: number | null;
  satellite?: string;
  daynight?: string;
  source?: string;
}

export interface ViirsHistoryResponse {
  status: 'available' | 'partial' | 'unavailable' | 'configuration-required';
  message: string;
  records: ViirsHistoryRecord[];
  sources: string[];
  sourceUrl: string;
}

const responseCache = new Map<string, ViirsHistoryResponse>();

export async function fetchViirsHistory(date: string, signal?: AbortSignal): Promise<ViirsHistoryResponse> {
  const cached = responseCache.get(date);
  if (cached) return cached;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error('The historical VIIRS service is not configured in this build.');
  }

  const endpoint = new URL('/functions/v1/live-earth-data', supabaseUrl);
  endpoint.searchParams.set('resource', 'viirs-history');
  endpoint.searchParams.set('date', date);
  const response = await fetch(endpoint, {
    headers: { apikey: publishableKey },
    signal,
  });

  let payload: ViirsHistoryResponse;
  try {
    payload = await response.json() as ViirsHistoryResponse;
  } catch {
    throw new Error('NASA FIRMS returned an unreadable historical response.');
  }
  if (!payload || !Array.isArray(payload.records) || typeof payload.status !== 'string') {
    throw new Error('The historical VIIRS endpoint is not deployed yet.');
  }
  if (!response.ok && payload.status !== 'unavailable') {
    throw new Error(payload.message || `The historical VIIRS service returned HTTP ${response.status}.`);
  }
  if (payload.status === 'available' || payload.status === 'partial') responseCache.set(date, payload);
  return payload;
}
