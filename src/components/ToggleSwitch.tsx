import type { ReactNode } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

export default function ToggleSwitch({ checked, onChange, children }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex min-h-14 w-full items-start gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3 text-left text-ink transition-colors hover:border-teal/40 hover:bg-teal-50 focus-visible:outline-offset-2"
    >
      <span
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-teal' : 'bg-navy/25'
        }`}
        aria-hidden="true"
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
      <span className="text-sm font-medium leading-relaxed">{children}</span>
    </button>
  );
}
