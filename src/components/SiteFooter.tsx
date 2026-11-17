import AppLink from '@/components/AppLink';
import { ArrowUpRight } from 'lucide-react';
import { routes } from '@/lib/routes';

const projectPaths = ['/', '/study-map', '/case-study', '/upcoming'];
const learningPaths = ['/how-sar-works', '/physical-drivers', '/future-applications', '/sources'];

function FooterLink({ to }: { to: string }) {
  const route = routes.find((item) => item.path === to);
  if (!route) return null;
  return <AppLink to={route.path} className="text-sm text-white/70 transition hover:text-radar">{route.label}</AppLink>;
}

export default function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-[#061522] text-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-radar/[.08] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-ember/[.07] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.35fr_.8fr_.8fr] md:py-16">
        <div className="max-w-md">
          <AppLink to="/" className="inline-flex items-center gap-3 text-white" aria-label="TerraScope home">
            <img src="/images/brand/terrascope-logo.png" alt="TerraScope — See Earth. Think Bigger." className="h-28 w-28 object-contain transition-transform duration-300 hover:scale-[1.03]" />
            <span className="text-2xl font-bold tracking-tight">TerraScope</span>
          </AppLink>
          <p className="mt-5 text-sm font-medium italic text-radar">See our planet differently. Act more wisely.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">An independent Earth-observation research dashboard. The current study explores fire-related satellite evidence across Madhya Pradesh; broader land and water studies are planned.</p>
          <p className="mt-4 text-xs leading-relaxed text-white/55">FIRMS archive records load by date, with the project snapshot available as a fallback. Detections are not burned area. NISAR browse imagery is not a calibrated change measurement.</p>
        </div>

        <nav aria-label="Project pages" className="grid content-start gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[.18em] text-subtle">Explore TerraScope</h2>
          {projectPaths.map((path) => <FooterLink key={path} to={path} />)}
        </nav>

        <nav aria-label="Learning and methods" className="grid content-start gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[.18em] text-subtle">Learn and inspect</h2>
          {learningPaths.map((path) => <FooterLink key={path} to={path} />)}
          <a href="https://github.com/KevinRajanSumod/Dancing-with-the-SARs" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-radar">Project repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </nav>
      </div>

      <div className="relative border-t border-white/[.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs leading-relaxed text-white/70 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>Data credits: NASA · ISRO · NISAR · NASA FIRMS · VIIRS · MODIS · OPERA / Sentinel-1.</p>
          <p>TerraScope is independent. NASA, ISRO, and partner missions do not endorse this project.</p>
        </div>
      </div>
    </footer>
  );
}
