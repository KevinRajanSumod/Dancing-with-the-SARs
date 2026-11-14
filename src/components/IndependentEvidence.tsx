import { useState } from 'react';
import { createClient, FunctionsHttpError } from '@supabase/supabase-js';
import { ExternalLink, LoaderCircle, Satellite } from 'lucide-react';

type Granule = { title: string; date: string; url: string };
type Product = { id: string; name: string; resolution: string; count: number; granules: Granule[] };
type Result = { period: string; products: Product[] };

function client() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export default function IndependentEvidence() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search() {
    const supabase = client();
    if (!supabase) { setError('Supabase is not configured in this app build.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<Result | { error?: string }>('independent-evidence', { body: {} });
      if (invokeError) {
        if (invokeError instanceof FunctionsHttpError && invokeError.context instanceof Response) {
          const payload = await invokeError.context.clone().json() as { error?: string };
          throw new Error(payload.error || invokeError.message);
        }
        throw invokeError;
      }
      if (!data || !('products' in data)) throw new Error('NASA Earthdata did not return product results.');
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not search NASA Earthdata.'); }
    finally { setLoading(false); }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8" aria-labelledby="independent-evidence-title">
      <div className="surface-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Live NASA catalog check · independent evidence</p>
            <h2 id="independent-evidence-title" className="mt-2 text-2xl">Check burned-area and disturbance products</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Searches NASA Earthdata for MODIS MCD64A1 and OPERA DIST-ALERT-HLS granules intersecting this project footprint from 30 Sep–5 Nov 2026. Matching granules are data availability, not a measured burn or proof of cause.</p>
          </div>
          <button type="button" onClick={search} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-radar px-4 py-2 text-sm font-bold text-canvas disabled:opacity-60">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Satellite className="h-4 w-4" />}
            {loading ? 'Searching NASA…' : 'Search NASA data'}
          </button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-ember/30 bg-ember/10 p-3 text-sm text-ink">{error}</p>}
        {result && <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.products.map((product) => <article key={product.id} className="rounded-xl border border-line bg-canvas/50 p-4">
            <div className="flex items-baseline justify-between gap-3"><h3 className="font-semibold">{product.name}</h3><span className="text-xs text-subtle">{product.resolution}</span></div>
            <p className="mt-2 text-sm text-muted">{product.count} matching granule{product.count === 1 ? '' : 's'} · {result.period}</p>
            {product.count > product.granules.length && <p className="mt-1 text-xs text-subtle">Showing the newest {product.granules.length}; more records are available in NASA Earthdata.</p>}
            {product.granules.length > 0 && <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto border-t border-line pt-3">
              {product.granules.map((granule, index) => <li key={`${granule.title}-${index}`} className="text-xs leading-relaxed"><span className="mr-2 text-radar">{granule.date}</span><a href={granule.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-radar/30 underline-offset-2">{granule.title}<ExternalLink className="ml-1 inline h-3 w-3" /></a></li>)}
            </ul>}
            {product.count === 0 && <p className="mt-3 text-xs text-subtle">No matching granules were found for this place and time window.</p>}
          </article>)}
        </div>}
      </div>
    </section>
  );
}
