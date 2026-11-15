import { useEffect, useId, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import AppLink from '@/components/AppLink';
import { routes } from '@/lib/routes';

interface SiteHeaderProps {
  pathname: string;
}

const desktopPaths = ['/', '/study-map', '/case-study', '/future-applications', '/sources', '/upcoming'];

function linkClass(isActive: boolean): string {
  const base = 'rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-radar';
  return isActive
    ? `${base} border border-radar/25 bg-radar/10 text-radar`
    : `${base} text-muted hover:bg-white/[.06] hover:text-white`;
}

export default function SiteHeader({ pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const learnActive = pathname === '/how-sar-works' || pathname === '/physical-drivers';
  const learnRoutes = routes.filter((route) => route.path === '/how-sar-works' || route.path === '/physical-drivers');

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
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex min-h-[5.5rem] max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1d2a]/95 px-3 shadow-[0_12px_36px_rgba(0,0,0,.22)] backdrop-blur-xl sm:min-h-[6.5rem] sm:px-5 lg:px-6">
        <AppLink to="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 text-white sm:gap-3" aria-label="TerraScope home">
          <img src="/images/brand/terrascope-logo.png" alt="" className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.04] sm:h-[4.75rem] sm:w-[4.75rem]" />
          <span className="font-sans text-lg font-bold tracking-tight text-white sm:text-2xl">TerraScope</span>
        </AppLink>

        <nav aria-label="Main" className="hidden min-w-0 items-center gap-1 xl:flex">
          {desktopPaths.slice(0, 3).map((path) => {
            const route = routes.find((item) => item.path === path);
            if (!route) return null;
            const isActive = route.path === pathname;
            return <AppLink key={route.path} to={route.path} className={linkClass(isActive)} aria-current={isActive ? 'page' : undefined}>{route.label}</AppLink>;
          })}

          <details className="group relative">
            <summary className={`${linkClass(learnActive)} flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden`} aria-label="Learn pages">
              Learn <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/10 bg-[#0b1d2a] p-2 shadow-2xl">
              {learnRoutes.map((route) => {
                const isActive = route.path === pathname;
                return <AppLink key={route.path} to={route.path} onClick={(event) => { const details = event.currentTarget.closest('details'); if (details) details.open = false; }} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-radar/10 text-radar' : 'text-muted hover:bg-white/[.06] hover:text-white'}`} aria-current={isActive ? 'page' : undefined}>{route.label}</AppLink>;
              })}
            </div>
          </details>

          {desktopPaths.slice(3).map((path) => {
            const route = routes.find((item) => item.path === path);
            if (!route) return null;
            const isActive = route.path === pathname;
            return <AppLink key={route.path} to={route.path} className={linkClass(isActive)} aria-current={isActive ? 'page' : undefined}>{route.label}</AppLink>;
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          <AppLink to="/study-map" className="hidden min-h-12 items-center gap-2 rounded-full bg-radar px-5 py-3 text-sm font-bold text-canvas transition hover:bg-radar-200 sm:inline-flex">Open the map <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></AppLink>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/[.08] xl:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id={menuId} aria-label="Mobile" className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[#0b1d2a] px-3 pb-4 pt-3 shadow-2xl xl:hidden">
          <ul className="grid gap-1 sm:grid-cols-2">
            {routes.map((route) => {
              const isActive = route.path === pathname;
              return <li key={route.path}><AppLink to={route.path} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-radar/10 text-radar' : 'text-muted hover:bg-white/[.06] hover:text-white'}`} aria-current={isActive ? 'page' : undefined}>{route.path === '/physical-drivers' ? 'Learn: Environmental context' : route.path === '/how-sar-works' ? 'Learn: How SAR works' : route.label}</AppLink></li>;
            })}
            <li className="sm:col-span-2"><AppLink to="/study-map" className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-radar px-4 py-2 text-sm font-bold text-canvas">Open the map <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></AppLink></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
