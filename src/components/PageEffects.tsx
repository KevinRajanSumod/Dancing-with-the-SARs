import { useEffect, useRef, type ReactNode } from 'react';

export default function PageEffects({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return;

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        intersectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -36px 0px' });

    const observeContent = () => {
      const candidates = root.querySelectorAll<HTMLElement>('section, .surface-card');
      candidates.forEach((element, index) => {
        if (element.closest('.reveal') || element.classList.contains('scroll-reveal')) return;
        element.classList.add('scroll-reveal');
        element.style.setProperty('--scroll-delay', `${(index % 5) * 45}ms`);
        intersectionObserver.observe(element);
      });
    };

    root.classList.add('page-effects-ready');
    observeContent();
    const mutationObserver = new MutationObserver(observeContent);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      root.classList.remove('page-effects-ready');
      root.querySelectorAll<HTMLElement>('.scroll-reveal').forEach((element) => {
        element.classList.remove('scroll-reveal', 'is-in-view');
        element.style.removeProperty('--scroll-delay');
      });
    };
  }, []);

  return <div ref={rootRef} className="page-content">{children}</div>;
}
