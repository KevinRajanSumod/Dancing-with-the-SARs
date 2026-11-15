import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { LoaderCircle, RotateCcw, Send, Sparkles } from 'lucide-react';
import { askProjectEvidence, type EvidenceChatTurn, type EvidenceTopic } from '@/lib/evidenceAssistant';

interface ProjectEvidenceAssistantProps {
  topic: EvidenceTopic;
}

const prompts: Record<EvidenceTopic, string[]> = {
  drivers: [
    'What can change a radar image even if the land itself has not changed?',
    'Why do the satellite viewing angle and data version matter?',
    'What other evidence could help check a possible fire?',
  ],
  applications: [
    'What kind of radar data can help study forest damage?',
    'Can satellite heat detections show how much land burned?',
    'What other evidence could check the findings on this map?',
  ],
};

export default function ProjectEvidenceAssistant({ topic }: ProjectEvidenceAssistantProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<EvidenceChatTurn[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const titleId = `evidence-assistant-title-${topic}`;
  const inputId = `evidence-assistant-question-${topic}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedQuestion = question.trim();
    if (loading || !submittedQuestion) return;

    const history = messages.slice(-16);
    setLoading(true);
    setQuestion('');
    setError('');
    setMessages((current) => [...current, { role: 'user', text: submittedQuestion }]);
    try {
      const answer = await askProjectEvidence(topic, submittedQuestion, history);
      setMessages((current) => [...current, { role: 'assistant', text: answer.answer }]);
    } catch (requestError) {
      setQuestion(submittedQuestion);
      setMessages((current) => current.slice(0, -1));
      setError(requestError instanceof Error ? requestError.message : 'The evidence assistant could not be reached.');
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    if (loading) return;
    setMessages([]);
    setQuestion('');
    setError('');
    questionRef.current?.focus();
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section className="px-4 py-4" aria-labelledby={titleId}>
      <div className="overflow-hidden rounded-2xl border border-analysis/40 bg-paper shadow-card">
        <div className="border-b border-line bg-raised/75 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow flex items-center gap-2"><Sparkles className="h-4 w-4 text-analysis" aria-hidden="true" /> EchoGuide · satellite research guide</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas/70 px-3 py-1.5 text-xs font-medium text-muted">
                No web search
              </span>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewChat}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/70 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-radar/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Start a new EchoGuide chat"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> New chat
                </button>
              )}
            </div>
          </div>
          <h2 id={titleId} className="mt-3 text-2xl">Talk with EchoGuide.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Ask a question, then keep going with follow-ups. EchoGuide uses project notes and general AI knowledge, not a live web search. It cannot inspect sample images or calculate new measurements.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-5 min-h-52 space-y-4 rounded-xl border border-line bg-canvas/55 p-4 sm:min-h-64 sm:p-5">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-line bg-raised px-4 py-3 text-sm leading-relaxed text-ink">
                  <p className="mb-1 text-xs font-semibold text-analysis">EchoGuide</p>
                  <p>Hi! Ask me about the satellite data or findings here. I’ll keep the context as we chat.</p>
                </div>
                <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
                  {prompts[topic].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => { setQuestion(prompt); questionRef.current?.focus(); }}
                      className="rounded-full border border-line bg-canvas/60 px-3 py-2 text-left text-xs leading-relaxed text-muted transition hover:border-radar/60 hover:bg-radar/10 hover:text-ink focus-visible:outline-offset-2"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div role="log" aria-label="EchoGuide conversation" aria-live="polite" aria-relevant="additions text" className="space-y-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-tr-sm bg-radar text-canvas' : 'rounded-tl-sm border border-line bg-raised text-ink'}`}>
                      <p className={`mb-1 text-xs font-semibold ${message.role === 'user' ? 'text-canvas/75' : 'text-analysis'}`}>
                        {message.role === 'user' ? 'You' : 'EchoGuide'}
                      </p>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start" role="status">
                    <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-raised px-4 py-3 text-sm text-muted">
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> EchoGuide is thinking…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-ember/40 bg-ember/10 p-4 text-sm leading-relaxed text-ink" role="alert">
              <p className="font-semibold">EchoGuide couldn’t reply.</p>
              <p className="mt-1 text-muted">{error} Your question is back in the box so you can try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor={inputId} className="block text-sm font-semibold text-ink">Your message</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                ref={questionRef}
                id={inputId}
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, 1000))}
                onKeyDown={handleQuestionKeyDown}
                maxLength={1000}
                rows={3}
                placeholder="Ask a question or follow up on the conversation…"
                className="min-h-24 w-full resize-y rounded-xl border border-line-strong bg-canvas px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-subtle focus:border-radar focus:outline-none focus:ring-2 focus:ring-radar/20"
                aria-describedby={`${inputId}-note ${inputId}-count`}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-radar px-5 py-3 text-sm font-bold text-canvas transition hover:bg-radar-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {loading ? 'Thinking…' : 'Send message'}
              </button>
            </div>
            <div className="flex flex-col justify-between gap-1 text-xs leading-relaxed text-subtle sm:flex-row">
              <p id={`${inputId}-note`}>No live web search. Press Ctrl+Enter (⌘+Enter on Mac) to send.</p>
              <p id={`${inputId}-count`} className="shrink-0">{question.length}/1,000</p>
            </div>
          </form>

          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-subtle">
            Research help only: sample radar images give visual context, not a measurement of change. Satellite heat detections do not confirm a fire or measure burned land.
          </p>
        </div>
      </div>
    </section>
  );
}
