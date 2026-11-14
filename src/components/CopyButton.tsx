import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

type CopyState = 'idle' | 'copied' | 'failed';

const RESET_DELAY_MS = 2000;

interface CopyButtonProps {
  text: string;
  label: string;
}

export default function CopyButton({ text, label }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  const visibleLabel = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${visibleLabel}: ${label}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 border-teal px-3 py-1.5 text-sm font-semibold text-teal transition-colors duration-200 hover:bg-teal-50"
    >
      {state === 'copied' ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {visibleLabel}
    </button>
  );
}
