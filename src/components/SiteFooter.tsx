import AppLink from '@/components/AppLink';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-white">Dancing with the SARs</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            An independent NASA Space Apps Challenge project. NISAR and FIRMS data are from NASA and partner
            agencies; this project is not affiliated with or endorsed by NASA or ISRO.
          </p>
          <p className="mt-2 text-xs text-white/45">FIRMS snapshot retrieved 13 Nov 2026. Radar browse previews are for visual context only.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
          <AppLink to="/forest-fire-change" className="transition-colors hover:text-radar">Explore the map</AppLink>
          <AppLink to="/sources" className="transition-colors hover:text-radar">Sources & method</AppLink>
        </nav>
      </div>
    </footer>
  );
}
