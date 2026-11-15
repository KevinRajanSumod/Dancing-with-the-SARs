import { Check, Database, Map, Satellite, Waves, CircleAlert } from 'lucide-react';
import AppLink from '@/components/AppLink';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const nextSteps = [
  {
    icon: Satellite,
    tag: 'Strengthen the comparison',
    title: 'Use matched NISAR measurements',
    description: 'Not yet computable from the browse images. The two supplied scenes differ in configuration and processing. A valid comparison needs compatible calibrated GCOV products from the same repeat geometry.',
  },
  {
    icon: Database,
    tag: 'Add independent evidence',
    title: 'Check for mapped burn impact',
    description: 'Partly analyzed in this project: MODIS MCD64A1 identifies 32 QA-valid 500 m burn-date pixels in the footprint, dated 21–30 September 2026. They precede the 30 September radar pass and do not show that fire caused a later radar pattern.',
  },
  {
    icon: Waves,
    tag: 'Follow the surface through time',
    title: 'Build a seasonal radar series',
    description: 'The NISAR timeline now spans the available browse archive, but it is a visual sequence, not a calibrated numeric time series. Numeric seasonal analysis still needs a consistent stack of science products.',
  },
  {
    icon: Map,
    tag: 'Expand geographic coverage',
    title: 'Extend the map across India',
    description: 'The current map is intentionally Madhya Pradesh first. India-wide analysis needs national boundaries, complete sensor coverage, and location-matched data; those are not yet assembled into one comparable analysis.',
  },
];

const roadmapIconTones = ['bg-radar/10 text-radar', 'bg-ember/10 text-ember', 'bg-analysis/10 text-analysis', 'bg-eco/10 text-eco'];

export default function UpcomingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Research plan / Current and upcoming work</p>
        <PageIntro title="Fire detection now. Broader Earth monitoring next.">
          <p>
            Current analysis focuses on fire-related satellite evidence in Madhya Pradesh. Upcoming releases will add independently analyzed flood, crop, vegetation, and surface-change studies as comparable data becomes available.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 md:pb-20" aria-label="Follow-up investigations">
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {nextSteps.map((step, index) => (
            <li key={step.title} className="list-none">
              <Reveal delayMs={index * 80} className="h-full">
                <article className="surface-card lift flex h-full flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border border-line ${roadmapIconTones[index]}`}><step.icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="rounded-full bg-canvas px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-subtle">{step.tag}</span>
                  </div>
                  <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-radar">EVIDENCE CHECK 0{index + 1}</p>
                  <h2 className="mt-2 text-2xl">{step.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{step.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-subtle">{index === 1 ? <Check className="h-4 w-4 text-eco"/> : <CircleAlert className="h-4 w-4 text-ember"/>}{index === 1 ? 'Analyzed from supplied MODIS product' : index === 3 ? 'Deferred · India-wide is the next phase' : 'Needs compatible scene data'}</span>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-raised py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">Independent evidence already analyzed</p>
          <h2 className="mt-3 max-w-2xl">Burn-date pixels are separate from radar observations.</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">The supplied MODIS MCD64A1 monthly product contains 32 valid burn-date pixels in the original study footprint for September 2026. They are dated 21–30 September. This is a product-level observation before the 30 September NISAR pass; it does not identify the cause of radar brightness or confirm every thermal detection.</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">For a matched change measurement, the user must provide compatible NISAR L2 GCOV science files (same orbit/track, polarization, comparable geometry and calibration). The repository currently contains browse previews, not the HDF5 measurement files needed to calculate dB change.</p>
          <AppLink to="/study-map" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">View the full-state study map <Map className="h-4 w-4"/></AppLink>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-ink">
            {['Burn area: 32 QA-valid pixels', 'Burn dates: 21–30 Sep 2026', 'Pixel size: 500 m', 'No causal attribution'].map((label) => <span key={label} className="rounded-full border border-line bg-canvas px-3 py-2">{label}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
