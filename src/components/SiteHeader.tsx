import { useEffect, useId, useState } from 'react';
import { Menu, Radar, X } from 'lucide-react';
import AppLink from '@/components/AppLink';
import { routes } from '@/lib/routes';

interface SiteHeaderProps {
  pathname: string;
}

function linkClass(isActive: boolean): string {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-radar';
  return isActive
    ? `${base} border border-radar/25 bg-radar/10 text-radar shadow-[0_4px_14px_rgba(39,109,99,.10)]`
    : `${base} text-muted hover:bg-raised hover:text-ink`;
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
    <header className="sticky top-0 z-40 px-3 pt-3 text-ink sm:px-5">
      <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 rounded-2xl border border-line bg-paper/95 px-3 shadow-card backdrop-blur-2xl sm:px-4 lg:px-5">
        <AppLink to="/" className="group flex min-w-0 items-center gap-3 text-ink">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar transition-colors group-hover:bg-radar/20">
            <Radar className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span><span className="block truncate text-sm font-semibold tracking-wide sm:text-base">TerraScope</span><span className="hidden text-[10px] font-medium text-muted sm:block">Earth observation research</span></span>
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
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink transition-colors hover:bg-raised xl:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <nav id={menuId} aria-label="Mobile" className="mx-auto mt-2 max-w-7xl rounded-2xl border border-line bg-paper px-4 pb-5 pt-3 shadow-card xl:hidden">
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
