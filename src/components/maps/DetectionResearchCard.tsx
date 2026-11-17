import { useState } from 'react';
import { ExternalLink, LoaderCircle, Search, Sparkles } from 'lucide-react';
import { askDetectionEvidence, type DetectionEvidenceInput, type EvidenceAnswer } from '@/lib/evidenceAssistant';

export default function DetectionResearchCard({ detection }: { detection: DetectionEvidenceInput }) {
  const [result, setResult] = useState<EvidenceAnswer | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function research() {
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await askDetectionEvidence(detection));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'EchoGuide could not search for reports.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-analysis/30 bg-analysis/[.06] p-4" aria-labelledby="point-research-title">
      <div className="flex items-center gap-2 text-analysis"><Sparkles className="h-4 w-4" aria-hidden="true" /><h3 id="point-research-title" className="text-sm font-bold">EchoGuide · this map point</h3></div>
      <p className="mt-2 text-xs leading-relaxed text-muted">Search the web for reports near this location and date. EchoGuide will also explain why a satellite may flag heat here.</p>
      <button type="button" onClick={() => void research()} disabled={loading} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-radar px-3 py-2 text-xs font-bold text-canvas transition hover:bg-radar-200 disabled:cursor-wait disabled:opacity-60">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
        {loading ? 'Searching reports…' : result ? 'Search again' : 'Search nearby reports'}
      </button>
      {loading && <p role="status" className="mt-3 text-xs text-muted">Checking current web sources for this place and date…</p>}
      {error && <p role="alert" className="mt-3 text-xs leading-relaxed text-ember">{error}</p>}
      {result && (
        <div className="mt-4 border-t border-line/70 pt-3" aria-live="polite">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{result.answer}</p>
          {result.sources?.length ? <ul className="mt-3 space-y-2" aria-label="Web sources">
            {result.sources.slice(0, 5).map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-xs font-semibold text-radar underline underline-offset-2 hover:text-radar-200">{source.title || 'Open source'} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a></li>)}
          </ul> : <p className="mt-3 text-xs leading-relaxed text-muted">No useful web sources were returned. That does not mean nothing happened here; many local events are not reported online.</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-subtle">A web report near the point is not proof that it refers to this exact satellite detection.</p>
        </div>
      )}
    </section>
  );
}
