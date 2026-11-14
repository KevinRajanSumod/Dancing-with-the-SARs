import { useState, type FormEvent } from 'react';
import { ArrowUpRight, LoaderCircle, Search, Send, Sparkles } from 'lucide-react';
import { askProjectEvidence, type EvidenceAnswer, type EvidenceTopic } from '@/lib/evidenceAssistant';

interface ProjectEvidenceAssistantProps {
  topic: EvidenceTopic;
}

const prompts: Record<EvidenceTopic, string[]> = {
  drivers: [
    'What can change radar backscatter without a land-cover change?',
    'Why do polarization and processing versions matter here?',
    'What evidence would help check a possible fire-related change?',
  ],
  applications: [
    'What NISAR products are used to study forest disturbance?',
    'Can FIRMS detections measure burned area?',
    'What independent datasets can help validate a disturbance analysis?',
  ],
};

export default function ProjectEvidenceAssistant({ topic }: ProjectEvidenceAssistantProps) {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<EvidenceAnswer | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const titleId = `evidence-assistant-title-${topic}`;
  const inputId = `evidence-assistant-question-${topic}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !question.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      setResult(await askProjectEvidence(topic, question.trim()));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The evidence assistant could not be reached.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16" aria-labelledby={titleId}>
      <div className="overflow-hidden rounded-2xl border border-analysis/40 bg-paper shadow-card">
        <div className="border-b border-line bg-raised/75 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow flex items-center gap-2"><Sparkles className="h-4 w-4 text-analysis" aria-hidden="true" /> Gemini research assistant</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas/70 px-3 py-1.5 text-xs font-medium text-muted">
              <Search className="h-3.5 w-3.5 text-radar" aria-hidden="true" /> Google Search citations
            </span>
          </div>
          <h2 id={titleId} className="mt-3 text-2xl sm:text-3xl">Ask a follow-up question.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Get a source-linked explanation of SAR methods and published applications. Answers use project notes as context; they do not analyze the browse images or create new measurements.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Suggested questions">
            {prompts[topic].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="rounded-full border border-line bg-canvas/60 px-3 py-2 text-left text-xs leading-relaxed text-muted transition hover:border-radar/60 hover:bg-radar/10 hover:text-ink focus-visible:outline-offset-2"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor={inputId} className="block text-sm font-semibold text-ink">Your question</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                id={inputId}
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={3}
                placeholder="Ask about radar interpretation, NISAR products, or what evidence a follow-up would need…"
                className="min-h-24 w-full resize-y rounded-xl border border-line-strong bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-subtle focus:border-radar focus:outline-none focus:ring-2 focus:ring-radar/20"
                aria-describedby={`${inputId}-note ${inputId}-count`}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-radar px-5 py-3 text-sm font-bold text-canvas transition hover:bg-radar-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {loading ? 'Searching…' : 'Ask Gemini'}
              </button>
            </div>
            <div className="flex flex-col justify-between gap-1 text-xs leading-relaxed text-subtle sm:flex-row">
              <p id={`${inputId}-note`}>Your question is sent to Gemini when you submit. Search-grounded requests may use API quota or incur charges.</p>
              <p id={`${inputId}-count`} className="shrink-0">{question.length}/1,000</p>
            </div>
          </form>

          {loading && <p className="mt-5 text-sm text-muted" role="status">Checking current references and preparing a cited answer…</p>}

          {error && (
            <div className="mt-5 rounded-xl border border-ember/40 bg-ember/10 p-4 text-sm leading-relaxed text-ink" role="alert">
              <p className="font-semibold">The assistant could not answer this yet.</p>
              <p className="mt-1 text-muted">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-xl border border-line bg-canvas/65 p-4 sm:p-5" aria-live="polite">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-analysis">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Answer · {result.model}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{result.answer}</p>
              {result.citations.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Sources checked</h3>
                  <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
                    {result.citations.map((citation) => (
                      <li key={citation.url}>
                        <a href={citation.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-radar underline decoration-radar/30 underline-offset-4 hover:text-radar-200">
                          {citation.title}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-subtle">
            Research support only: the two NISAR browse previews differ in product configuration and processing version. Their visible contrast is not a measured forest-loss or burn result, and FIRMS detections do not confirm a fire or burned area.
          </p>
        </div>
      </div>
    </section>
  );
}
