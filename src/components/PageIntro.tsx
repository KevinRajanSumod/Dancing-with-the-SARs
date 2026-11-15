import type { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  children?: ReactNode;
}

export default function PageIntro({ title, children }: PageIntroProps) {
  return (
    <div className="page-intro relative isolate max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
      <div className="mission-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="page-intro-glow pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full" aria-hidden="true" />
      <div className="page-intro-ring pointer-events-none absolute -bottom-40 right-12 h-72 w-72 rounded-full border" aria-hidden="true" />
      <div className="relative">
        <span className="mb-5 block h-1 w-16 rounded-full bg-gradient-to-r from-signal via-ember to-radar shadow-[0_0_16px_rgba(255,209,102,.3)]" aria-hidden="true" />
        <h1 className="max-w-3xl">{title}</h1>
        {children && <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted md:text-lg">{children}</div>}
      </div>
    </div>
  );
}
