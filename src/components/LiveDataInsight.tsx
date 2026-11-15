import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, LoaderCircle, Mic, Send, Sparkles } from 'lucide-react';
import { askLiveDataInsight, type EvidenceChatTurn } from '@/lib/evidenceAssistant';

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface LiveDataInsightProps {
  title: string;
  question: string;
  evidence: string;
}

export default function LiveDataInsight({ title, question: sectionGuidance, evidence }: LiveDataInsightProps) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<EvidenceChatTurn[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const inputId = `echo-question-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const suggestedQuestions = [
    `Explain ${title.toLowerCase()} in simple terms.`,
    'What should I notice in these results?',
    'What can this data not prove?',
  ];

  useEffect(() => () => recognitionRef.current?.stop(), []);
  useEffect(() => {
    setMessages([]);
    setDraft('');
    setError('');
  }, [evidence, sectionGuidance]);

  function startVoiceInput() {
    setVoiceError('');
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. You can type your question instead.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim();
        if (transcript) setDraft((current) => `${current}${current.trim() ? ' ' : ''}${transcript}`.slice(0, 500));
      };
      recognition.onerror = () => {
        setVoiceError('Voice input could not be captured. Check microphone permission or type your question.');
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setVoiceError('Could not start voice input. Check microphone permission or type your question.');
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (loading || !text || !evidence.trim()) return;
    setLoading(true);
    setError('');
    setDraft('');
    setMessages((current) => [...current, { role: 'user', text }]);
    try {
      const result = await askLiveDataInsight(text, evidence, sectionGuidance, messages);
      setMessages((current) => [...current, { role: 'assistant', text: result.answer, sources: result.sources }]);
    } catch (reason) {
      setDraft(text);
      setMessages((current) => current[current.length - 1]?.role === 'user' && current[current.length - 1]?.text === text ? current.slice(0, -1) : current);
      setError(reason instanceof Error ? reason.message : 'EchoGuide could not answer right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="mt-5 rounded-2xl border border-analysis/40 bg-analysis/[.07] p-4 shadow-[0_0_24px_rgba(146,128,242,.07)] sm:p-5" aria-label={`Ask EchoGuide about ${title}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-analysis/30 bg-analysis/15 text-analysis"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow text-analysis">Your AI data guide</p>
          <h4 className="mt-1 text-base font-bold text-ink">Ask AI about {title}.</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">Get a plain-language explanation of the data above, then ask follow-up questions.</p>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-line bg-canvas/45 p-3" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`rounded-lg p-3 ${message.role === 'user' ? 'ml-6 bg-radar/10' : 'mr-3 bg-raised'}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${message.role === 'user' ? 'text-radar' : 'text-analysis'}`}>{message.role === 'user' ? 'You' : 'EchoGuide'}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">{message.text}</p>
              {message.role === 'assistant' && message.sources?.length ? (
                <ul className="mt-3 space-y-1.5 border-t border-line/70 pt-2" aria-label="Web sources">
                  {message.sources.slice(0, 5).map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-xs font-semibold text-radar underline underline-offset-2 hover:text-radar-200">
                        {source.title || 'Open source'} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {loading && <p className="flex items-center gap-2 text-xs text-muted" role="status"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> EchoGuide is thinking…</p>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
        {suggestedQuestions.map((prompt) => <button key={prompt} type="button" onClick={() => { setDraft(prompt); questionInputRef.current?.focus(); }} className="rounded-full border border-analysis/25 bg-canvas/65 px-3 py-2 text-left text-xs font-medium text-muted transition hover:border-analysis/60 hover:bg-analysis/10 hover:text-ink">{prompt}</button>)}
      </div>
      <form onSubmit={(event) => void sendMessage(event)} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block w-full text-xs font-semibold text-muted" htmlFor={inputId}>Your question
        <textarea
          ref={questionInputRef}
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value.slice(0, 500))}
          maxLength={500}
          rows={2}
          placeholder="Ask about the numbers, map, or image above…"
          className="mt-1 min-h-12 w-full resize-y rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-sm font-normal text-ink placeholder:text-subtle focus:border-analysis focus:outline-none focus:ring-2 focus:ring-analysis/20"
        />
        </label>
        <button type="button" onClick={() => listening ? recognitionRef.current?.stop() : startVoiceInput()} disabled={loading} aria-label={listening ? 'Stop voice input' : 'Speak your question'} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${listening ? 'border-ember/30 bg-ember/10 text-ember' : 'border-line-strong bg-canvas text-muted hover:border-analysis/50 hover:text-ink'}`}>
          <Mic className="h-4 w-4" aria-hidden="true" />{listening ? 'Stop' : 'Speak'}
        </button>
        <button type="submit" disabled={loading || !draft.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-analysis px-4 py-2 text-sm font-bold text-canvas transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Thinking…' : 'Ask AI'}
        </button>
      </form>
      {listening && <p className="mt-2 text-xs text-ember" role="status">Listening… Speak your question, then press Ask.</p>}
      {voiceError && <p className="mt-2 text-xs text-muted" role="status">{voiceError}</p>}
      {error && <p className="mt-3 rounded-lg border border-ember/25 bg-ember/5 p-3 text-xs leading-relaxed text-muted" role="alert">{error}</p>}
      <p className="mt-2 text-[11px] leading-relaxed text-subtle">Speak uses your browser’s speech recognition, when supported, and may request microphone permission. AI answers use the displayed summary and metadata; they cannot inspect raw radar measurements or prove a fire caused a land change.</p>
    </aside>
  );
}
