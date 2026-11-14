import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function Card({ children, className = '', interactive = false }: CardProps) {
  const interactiveClass = interactive ? 'lift' : '';
  return (
    <div className={`surface-card p-5 sm:p-6 md:p-7 ${interactiveClass} ${className}`}>
      {children}
    </div>
  );
}
