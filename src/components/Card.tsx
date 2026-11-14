import { useEffect, useRef, useState, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function Card({ children, className = '', interactive = false }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const interactiveClass = interactive ? 'lift' : '';

  useEffect(() => {
    const node = cardRef.current;
    if (!node || node.closest('.reveal')) return;
    if (typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px 80px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className={`surface-card p-5 sm:p-6 md:p-7 ${interactiveClass} ${entered ? 'card-in-view' : ''} ${className}`}>
      {children}
    </div>
  );
}
