import type { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  children?: ReactNode;
}

export default function PageIntro({ title, children }: PageIntroProps) {
  return (
    <div className="max-w-3xl">
      <h1>{title}</h1>
      {children && <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/75 md:text-lg">{children}</div>}
    </div>
  );
}
