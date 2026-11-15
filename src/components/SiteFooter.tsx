import AppLink from '@/components/AppLink';
import { ArrowUpRight, Radar } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-canvas text-white">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-radar/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_.8fr] md:py-16">
        <div className="max-w-xl">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-radar/25 bg-radar/10 text-radar"><Radar className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-white">TerraScope</p>
          <p className="mt-1 text-sm font-medium italic text-radar">See our planet differently. Act more wisely.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            An independent NASA Space Apps Challenge project about reading radar carefully. NISAR and FIRMS data are credited to their source agencies.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-subtle">FIRMS records cover 30 Sep–5 Nov 2026. Radar browse imagery is visual context, not a calibrated change measurement.</p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-3 text-sm sm:grid-cols-2">
          <AppLink to="/study-map" className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-muted transition hover:border-radar/25 hover:bg-white/[.08] hover:text-white">Open the study map <ArrowUpRight className="h-4 w-4 text-radar transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></AppLink>
          <AppLink to="/how-sar-works" className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-muted transition hover:border-radar/25 hover:bg-white/[.08] hover:text-white">Learn SAR basics <ArrowUpRight className="h-4 w-4 text-radar transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></AppLink>
          <AppLink to="/sources" className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-muted transition hover:border-radar/25 hover:bg-white/[.08] hover:text-white">Sources & method <ArrowUpRight className="h-4 w-4 text-radar transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></AppLink>
          <a href="https://science.nasa.gov/mission/nisar/mission-overview/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-muted transition hover:border-radar/25 hover:bg-white/[.08] hover:text-white">NISAR mission <ArrowUpRight className="h-4 w-4 text-radar transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></a>
        </nav>
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 px-5 py-5 text-[11px] leading-relaxed text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>NASA and ISRO do not endorse this independent project.</span>
        <a href="https://svs.gsfc.nasa.gov/11474" target="_blank" rel="noopener noreferrer" className="transition hover:text-radar">Hero photograph: NASA/JSC · Earth Illuminated ↗</a>
      </div>
    </footer>
  );
}
