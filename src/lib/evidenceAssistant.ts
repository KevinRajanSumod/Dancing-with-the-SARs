import { createClient, FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js';

export type EvidenceTopic = 'drivers' | 'applications';

export interface EvidenceCitation {
  title: string;
  url: string;
}

export interface EvidenceAnswer {
  answer: string;
  citations: EvidenceCitation[];
  model: string;
}

let supabase: SupabaseClient | null | undefined;

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

async function getFunctionErrorMessage(error: Error): Promise<string> {
  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    try {
      const payload = await error.context.clone().json() as { error?: unknown };
      if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
    } catch {
      // Fall back to the Supabase Functions error if its response is not JSON.
    }
  }
  return error.message || 'The evidence assistant could not be reached.';
}

export async function askProjectEvidence(topic: EvidenceTopic, question: string): Promise<EvidenceAnswer> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured for this app build. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart or rebuild the app.');
  }

  const { data, error } = await client.functions.invoke<EvidenceAnswer>('evidence-assistant', {
    body: { topic, question },
  });
  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new Error('The evidence assistant returned no answer. Try rephrasing the question.');
  }
  return {
    answer: data.answer,
    citations: Array.isArray(data.citations)
      ? data.citations.filter((citation) => citation && typeof citation.title === 'string' && typeof citation.url === 'string' && citation.url.startsWith('https://'))
      : [],
    model: typeof data.model === 'string' ? data.model : 'Gemini',
  };
}
