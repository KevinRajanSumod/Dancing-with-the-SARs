const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = 'gemini-3.8-flash';

const projectContext = `
Project: Dancing with the SARs, an educational story about a Central India footprint.
The archive contains two NASA-ISRO NISAR L-band GCOV browse previews from 30 September and 5 November 2026. Their product polarization configurations and processing versions differ. Both display an HV layer, but that does not make them a calibrated change-detection pair. The previews have not been quantified, and this project has not established forest loss, burned area, or a cause for their visual contrast.
The project also displays a separate NASA FIRMS VIIRS NOAA-21 near-real-time snapshot: 2,050 detection records in 38 daily files from 30 September through 5 November 2026 (435 low, 1,604 nominal, 11 high confidence). A record is a satellite thermal detection, not necessarily a unique or confirmed fire. FIRMS detections do not measure burned area or establish that fire caused radar contrast.
The archive browse images were georeferenced in QGIS and shown as grayscale overlays. No calibrated radar change analysis, NDVI calculation, tree count, slope analysis, water-resource map, or field validation has been performed for this project.
`;

const systemInstruction = `You are the Dancing with the SARs evidence guide. Help users understand synthetic aperture radar, NISAR products, NASA FIRMS detections, and defensible follow-up methods.

Use the supplied project context exactly. Never invent project measurements, locations, validation, or results. The two browse previews differ in product configuration and processing version; their visible contrast is only a prompt for further analysis, not a measured forest-loss or burn result. Do not attribute radar contrast to fire. Explain that FIRMS detections show satellite heat detections, not confirmed fires or burned area.

For general scientific and mission questions, use Google Search grounding and prioritize NASA, NASA Earthdata, NISAR, Alaska Satellite Facility, and other primary agency sources. Cite factual claims with the provided source citations. If current authoritative sources do not support an answer, say so. Distinguish the project record from general remote-sensing methods. Keep answers concise and practical. Do not provide investment, legal, or emergency-response instructions.`;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Use POST for an assistant question.' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse({
      code: 'configuration-required',
      error: 'Add GEMINI_API_KEY to Supabase Edge Function Secrets to enable the evidence assistant.',
    }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = asRecord(await request.json());
  } catch {
    return jsonResponse({ error: 'The request body must be valid JSON.' }, 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const topic = body.topic === 'applications' ? 'applications' : body.topic === 'drivers' ? 'drivers' : null;
  if (!topic) return jsonResponse({ error: 'Choose a supported project topic.' }, 400);
  if (!question || question.length > 1000) {
    return jsonResponse({ error: 'Enter a question between 1 and 1,000 characters.' }, 400);
  }

  const topicContext = topic === 'drivers'
    ? 'The user is reading about vegetation structure, moisture, inundation, viewing geometry, polarization, and other possible influences on radar backscatter. These are general interpretation factors, not findings about the supplied footprint.'
    : 'The user is reading about documented NISAR applications including ecosystems, agriculture, water, and hazards. These are general mission applications, not results calculated from this project.';

  try {
    const response = await fetch(GEMINI_INTERACTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        input: `${topicContext}\n\nProject context:\n${projectContext}\n\nUser question:\n${question}`,
        system_instruction: systemInstruction,
        tools: [{ type: 'google_search' }],
        store: false,
        generation_config: { temperature: 0.2, max_output_tokens: 700 },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: 'EchoGuide reached the Gemini request limit. Wait a moment and try again.' }, 429);
      }
      if (response.status === 401 || response.status === 403) {
        return jsonResponse({ error: 'Google rejected the EchoGuide server key. Check GEMINI_API_KEY in Supabase Edge Function Secrets.' }, 502);
      }
      const upstreamError = await response.text();
      let detail = '';
      try {
        const parsed = asRecord(JSON.parse(upstreamError));
        const error = asRecord(parsed.error);
        if (typeof error.message === 'string') detail = error.message.slice(0, 400);
      } catch {
        detail = upstreamError.slice(0, 400);
      }
      return jsonResponse({ error: `EchoGuide request failed (Google HTTP ${response.status})${detail ? `: ${detail}` : '.'}` }, 502);
    }

    const interaction = asRecord(await response.json());
    const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
    const textBlocks: string[] = [];
    const citations: Array<{ title: string; url: string }> = [];
    const seenUrls = new Set<string>();

    for (const rawStep of steps) {
      const step = asRecord(rawStep);
      if (step.type !== 'model_output' || !Array.isArray(step.content)) continue;
      for (const rawBlock of step.content) {
        const block = asRecord(rawBlock);
        if (block.type !== 'text') continue;
        if (typeof block.text === 'string' && block.text.trim()) textBlocks.push(block.text.trim());
        if (!Array.isArray(block.annotations)) continue;
        for (const rawAnnotation of block.annotations) {
          const annotation = asRecord(rawAnnotation);
          if (annotation.type !== 'url_citation' || typeof annotation.url !== 'string') continue;
          try {
            const url = new URL(annotation.url);
            if (url.protocol !== 'https:' || seenUrls.has(url.toString())) continue;
            seenUrls.add(url.toString());
            citations.push({
              title: typeof annotation.title === 'string' && annotation.title.trim() ? annotation.title.trim() : url.hostname,
              url: url.toString(),
            });
          } catch {
            // Ignore malformed citations from the upstream response.
          }
        }
      }
    }

    const answer = textBlocks.join('\n\n');
    if (!answer) return jsonResponse({ error: 'EchoGuide received no answer. Try rephrasing the question.' }, 502);
    return jsonResponse({ answer, citations, model: 'EchoGuide' });
  } catch {
    return jsonResponse({ error: 'EchoGuide could not reach its research service. Try again shortly.' }, 502);
  }
});
