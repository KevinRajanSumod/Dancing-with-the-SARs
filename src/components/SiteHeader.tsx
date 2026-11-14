import { useEffect, useId, useState } from 'react';
import { Menu, Radar, X } from 'lucide-react';
import AppLink from '@/components/AppLink';
import { routes } from '@/lib/routes';

interface SiteHeaderProps {
  pathname: string;
}

function linkClass(isActive: boolean): string {
  const base = 'rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-white';
  return isActive
    ? `${base} bg-white/10 text-white`
    : `${base} text-white/75 hover:bg-white/10 hover:text-white`;
}

export default function SiteHeader({ pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <AppLink to="/" className="group flex min-w-0 items-center gap-3 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-radar/30 bg-radar/10 text-radar transition-colors group-hover:bg-radar/20">
            <Radar className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-semibold tracking-wide sm:text-base">Dancing with the SARs</span>
        </AppLink>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {routes.map((route) => {
              const isActive = route.path === pathname;
              return (
                <li key={route.path}>
                  <AppLink to={route.path} className={linkClass(isActive)} aria-current={isActive ? 'page' : undefined}>
                    {route.label}
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 xl:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <nav id={menuId} aria-label="Mobile" className="border-t border-white/10 bg-navy px-4 pb-5 pt-3 xl:hidden">
          <ul className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {routes.map((route) => {
              const isActive = route.path === pathname;
              return (
                <li key={route.path}>
                  <AppLink
                    to={route.path}
                    className={`block ${linkClass(isActive)}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {route.label}
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
