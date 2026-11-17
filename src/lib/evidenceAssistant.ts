import { createClient, FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js';

export type EvidenceTopic = 'drivers' | 'applications';

export interface DetectionEvidenceInput {
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  confidence: string;
  frp: number | null;
  district: string;
}

export interface EvidenceSource {
  title: string;
  url: string;
}

export interface EvidenceAnswer {
  answer: string;
  model: string;
  sources?: EvidenceSource[];
}

export interface EvidenceChatTurn {
  role: 'user' | 'assistant';
  text: string;
  sources?: EvidenceSource[];
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

function getSources(value: unknown): EvidenceSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter((source): source is EvidenceSource =>
    typeof source?.title === 'string' && typeof source?.url === 'string' && /^https:\/\//i.test(source.url),
  ).slice(0, 8);
}

export async function askProjectEvidence(topic: EvidenceTopic, question: string, history: EvidenceChatTurn[] = []): Promise<EvidenceAnswer> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured for this app build. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart or rebuild the app.');
  }

  const { data, error } = await client.functions.invoke<EvidenceAnswer>('evidence-assistant', {
    body: { topic, question, history: history.slice(-16) },
  });
  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new Error('The evidence assistant returned no answer. Try rephrasing the question.');
  }
  return {
    answer: data.answer,
    model: typeof data.model === 'string' ? data.model : 'EchoGuide',
    sources: getSources(data.sources),
  };
}

export async function askLiveDataInsight(question: string, evidence: string, sectionGuidance: string, history: EvidenceChatTurn[]): Promise<EvidenceAnswer> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('EchoGuide AI is not configured for this app build.');
  }
  const request = async (body: Record<string, unknown>) => {
    const result = await client.functions.invoke<EvidenceAnswer>('evidence-assistant', { body });
    if (result.error) throw new Error(await getFunctionErrorMessage(result.error));
    if (!result.data || typeof result.data.answer !== 'string' || !result.data.answer.trim()) {
      throw new Error('EchoGuide returned no answer. Try again shortly.');
    }
    return result.data;
  };

  try {
    const data = await request({ topic: 'live-data', question, evidence: evidence.slice(0, 5000), sectionGuidance, history });
    return { answer: data.answer, model: typeof data.model === 'string' ? data.model : 'EchoGuide', sources: getSources(data.sources) };
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : '';
    if (!/supported project topic/i.test(message)) throw reason;

    // Older hosted Edge Functions only accept the established "drivers" topic.
    // Package a compact section context into its supported question field.
    const recentTurns = history.slice(-4).map((turn) => `${turn.role === 'user' ? 'User' : 'EchoGuide'}: ${turn.text.replace(/\s+/g, ' ').slice(0, 110)}`).join('\n').slice(0, 220);
    const userQuestion = question.replace(/\s+/g, ' ').slice(0, 260);
    const fallbackQuestion = [
      `Section: ${sectionGuidance.replace(/\s+/g, ' ').slice(0, 120)}`,
      `Displayed data: ${evidence.replace(/\s+/g, ' ').slice(0, 260)}`,
      recentTurns ? `Conversation so far:\n${recentTurns}` : '',
      `User asks: ${userQuestion}`,
    ].filter(Boolean).join('\n\n');
    const data = await request({ topic: 'drivers', question: fallbackQuestion });
    return { answer: data.answer, model: typeof data.model === 'string' ? data.model : 'EchoGuide', sources: getSources(data.sources) };
  }
}

export async function askDetectionEvidence(detection: DetectionEvidenceInput): Promise<EvidenceAnswer> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('EchoGuide web research is not configured for this app.');
  }
  const { data, error } = await client.functions.invoke<EvidenceAnswer>('evidence-assistant', {
    body: { topic: 'detection', detection },
  });
  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new Error('EchoGuide could not find an answer for this map point. Try again shortly.');
  }
  return {
    answer: data.answer,
    model: typeof data.model === 'string' ? data.model : 'EchoGuide',
    sources: getSources(data.sources),
  };
}
