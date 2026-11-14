import { useEffect, useState } from 'react';

const LOCATION_EVENT = 'app:locationchange';

export function normalisePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

// pushState does not fire popstate, so a custom event tells the hook about in-app navigation.
export function navigateTo(path: string): void {
  if (normalisePath(window.location.pathname) === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event(LOCATION_EVENT));
  window.scrollTo(0, 0);
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => normalisePath(window.location.pathname));

  useEffect(() => {
    const update = () => setPathname(normalisePath(window.location.pathname));
    window.addEventListener('popstate', update);
    window.addEventListener(LOCATION_EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(LOCATION_EVENT, update);
    };
  }, []);

  return pathname;
}
