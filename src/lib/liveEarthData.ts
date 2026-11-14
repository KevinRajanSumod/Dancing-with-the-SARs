import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Detection } from '@/data/detections';

export interface LiveRadarScene {
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
}

export interface LiveEarthData {
  fetchedAt: string;
  firms: {
    status: 'available' | 'configuration-required' | 'unavailable';
    message?: string;
    records: Detection[];
    sourceUrl: string;
  };
  nisar: {
    status: 'available' | 'unavailable';
    message?: string;
    scenes: LiveRadarScene[];
    sourceUrl: string;
  };
}

let supabase: SupabaseClient | null | undefined;
let pendingRequest: Promise<LiveEarthData> | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabase !== undefined) return supabase;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publicKey) {
    supabase = null;
    return supabase;
  }
  supabase = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

export async function fetchLiveEarthData(): Promise<LiveEarthData> {
  if (pendingRequest) return pendingRequest;
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured for this app build. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY), then restart or rebuild the app.');
  }

  pendingRequest = (async () => {
    const { data, error } = await client.functions.invoke<LiveEarthData>('live-earth-data', { method: 'GET' });
    if (error) throw new Error(error.message || 'The Supabase live-data function could not be reached.');
    if (!data) throw new Error('The Supabase live-data function returned no data.');
    return data;
  })();
  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}
