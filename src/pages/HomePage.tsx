import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Flame,
  Layers3,
  MapPinned,
  RadioTower,
  Satellite,
  ScanLine,
  Sparkles,
  Waves,
} from 'lucide-react';
import AppLink from '@/components/AppLink';
import Reveal from '@/components/Reveal';
import StudyAreaPreview from '@/components/StudyAreaPreview';
import NasaEcosystemGallery from '@/components/NasaEcosystemGallery';

const sources = [
  { name: 'NISAR', note: 'L-band radar browse', tone: 'text-radar' },
  { name: 'NASA FIRMS · VIIRS', note: 'thermal detections', tone: 'text-ember' },
  { name: 'OPERA · Sentinel-1', note: 'C-band radar context', tone: 'text-analysis' },
  { name: 'MODIS', note: 'optical map context', tone: 'text-eco' },
];

const featureCards = [
  {
    icon: Flame,
    title: 'Heat detections, with context',
    eyebrow: 'NASA FIRMS · VIIRS',
    body: 'Map the supplied detection records by date and district. A detection is a sensor observation, not confirmation of a fire or its burned area.',
    type: 'detections' as const,
    size: '',
  },
  {
    icon: MapPinned,
    title: 'One state, many views',
    eyebrow: 'STUDY MAP',
    body: 'Move through time, compare sensor layers where they are available, filter districts, and inspect grouped thermal records on the full-state map.',
    type: 'map' as const,
    size: '',
  },
  {
    icon: Sparkles,
    title: 'A guide to the evidence',
    eyebrow: 'ECHOGUIDE',
    body: 'Ask for plain-language explanations of the project’s data and method. Answers are research support and can depend on service availability.',
    type: 'guide' as const,
    size: '',
  },
];

const roadmap = [
  { state: 'Available now', tone: 'text-eco', title: 'Madhya Pradesh fire study', body: 'A full-state map with dated radar imagery and date-based VIIRS archive records.' },
  { state: 'Planned', tone: 'text-amber', title: 'Stronger measurement comparisons', body: 'Add compatible calibrated radar products and independent validation when suitable data are assembled.' },
  { state: 'Planned', tone: 'text-amber', title: 'More Earth questions', body: 'Build analyzed studies for water, crops, vegetation, and other surface changes.' },
  { state: 'Planned', tone: 'text-amber', title: 'India-wide coverage', body: 'Extend the regional workflow across India after national data coverage and methods are prepared.' },
];

function PreviewGraphic({ kind, mediaClassName = 'mt-5' }: { kind: 'radar' | 'detections' | 'map' | 'guide'; mediaClassName?: string }) {
  if (kind === 'radar') {
    return (
      <figure className={`relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#07131d] ${mediaClassName}`}>
        <img src="https://images-assets.nasa.gov/image/PIA26616/PIA26616~large.jpg" alt="NASA NISAR false-color radar image showing forest, water, and built surfaces on Mount Desert Island, Maine." loading="lazy" className="h-full w-full object-contain" />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-navy/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-radar">NISAR · L-band</span>
        <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[#081b28]/90 px-3 py-2 text-[10px]"><span className="font-semibold text-radar">Real NISAR image · Maine</span><span className="text-white/70">NASA/JPL-Caltech · example, not study data</span></figcaption>
      </figure>
    );
  }

  if (kind === 'detections') {
    return (
      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#081b28] p-4" aria-label="Illustrative thermal detection layer preview">
        <div className="mission-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative flex h-28 items-center justify-around rounded-lg border border-white/10 bg-white/[.02]">
          {[0, 1, 2, 3, 4].map((index) => <span key={index} className={`rounded-full border border-[#ffe2c0] bg-ember/80 shadow-[0_0_20px_rgba(240,120,89,.24)] ${index % 2 ? 'h-3 w-3' : 'h-2 w-2'}`} />)}
          <span className="absolute bottom-2 left-3 rounded-full border border-white/10 bg-canvas/90 px-2 py-1 text-[10px] font-semibold text-ember">Illustrative marks · not live data</span>
        </div>
      </div>
    );
  }

  if (kind === 'map') {
    return (
      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#081b28] p-4" aria-label="Illustrative statewide map controls preview">
        <div className="mission-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative flex h-28 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.02]">
          <span className="rounded-lg border border-radar/20 bg-radar/10 px-2 py-2 text-[10px] font-semibold text-radar">Radar view</span>
          <span className="text-subtle">+</span>
          <span className="rounded-lg border border-ember/20 bg-ember/10 px-2 py-2 text-[10px] font-semibold text-ember">Detection records</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#081b28] p-4" aria-label="Illustrative plain-language research guide preview">
      <div className="relative space-y-2 rounded-lg border border-white/10 bg-white/[.025] p-3">
        <p className="w-4/5 rounded-md bg-radar/10 px-3 py-2 text-[10px] leading-relaxed text-radar">What can this layer tell me?</p>
        <p className="ml-auto w-4/5 rounded-md bg-white/[.06] px-3 py-2 text-[10px] leading-relaxed text-white/75">It shows radar patterns. A separate validation step is needed to explain their cause.</p>
      </div>
    </div>
  );
}

function RadarFeatureCard() {
  return (
    <article className="surface-card lift flex h-full flex-col overflow-hidden p-3 sm:p-4">
      <PreviewGraphic kind="radar" mediaClassName="mt-0" />
      <div className="px-2 pb-2 pt-4">
        <h3 className="text-lg text-white">Radar sees beyond the visible</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">Explore dated Madhya Pradesh radar patterns. Browse imagery is visual context, not a calibrated change measurement.</p>
      </div>
    </article>
  );
}

function RadarDiagram() {
  return (
    <div className="glass-panel relative min-h-64 overflow-hidden rounded-[1.75rem] p-6 sm:p-8" role="img" aria-label="Diagram showing radar waves traveling from a satellite to the ground and returning as an echo">
      <div className="mission-grid absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="relative flex h-52 flex-col items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-radar/25 bg-radar/10 text-radar"><Satellite className="h-6 w-6" aria-hidden="true" /></div>
        <div className="relative flex w-48 flex-col items-center gap-3">
          <span className="radar-beam h-16 w-px bg-gradient-to-b from-radar/90 to-transparent" />
          <span className="absolute top-4 h-8 w-24 rounded-full border border-radar/40" />
          <span className="absolute top-8 h-5 w-16 rounded-full border border-radar/30" />
        </div>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-amber/70 to-transparent" />
      </div>
      <div className="relative mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.15em] text-subtle"><span>Transmitted pulse</span><span>Surface echo</span></div>
    </div>
  );
}

function DetectionDiagram() {
  return (
    <div className="glass-panel relative min-h-64 overflow-hidden rounded-[1.75rem] p-6 sm:p-8" role="img" aria-label="Conceptual map graphic showing isolated thermal detection markers and a separate satellite coverage grid">
      <div className="mission-grid absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="relative flex min-h-48 items-center justify-center rounded-2xl border border-white/10 bg-[#081b28]/55">
        <div className="absolute h-36 w-36 rounded-full border border-radar/20" />
        <div className="absolute h-24 w-24 rounded-full border border-radar/15" />
        <div className="relative grid h-20 w-32 grid-cols-3 place-items-center">
          {[0, 1, 2, 3, 4, 5].map((index) => <span key={index} className="h-2.5 w-2.5 rounded-full border border-[#ffe2c0] bg-ember shadow-[0_0_18px_rgba(240,120,89,.36)]" />)}
        </div>
        <span className="absolute bottom-3 left-3 rounded-full border border-ember/25 bg-ember/10 px-3 py-1 text-[10px] font-semibold text-ember">Conceptual detections · not a real scene</span>
      </div>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3 text-sm text-muted">
      {items.map((item) => <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-eco" aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-8 sm:px-8 md:pb-28 md:pt-14" aria-labelledby="hero-title">
        <section className="home-hero relative isolate overflow-hidden rounded-[2rem] px-5 pb-8 pt-14 sm:px-9 sm:pb-10 sm:pt-20 lg:px-12 lg:pt-24" aria-labelledby="hero-title">
          <div className="pointer-events-none absolute -right-48 -top-56 h-[34rem] w-[34rem] rounded-full border border-radar/10 bg-radar/[.035]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-48 -left-28 h-[27rem] w-[27rem] rounded-full border border-ember/10" aria-hidden="true" />
          <div className="relative">
            <div className="hero-intro mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/[.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-radar sm:text-xs"><CircleDot className="h-3.5 w-3.5" aria-hidden="true" />NASA Space Apps · NISAR + FIRMS</span>
              <h1 id="hero-title" className="hero-headline mt-7 text-balance text-white">A new perspective<br /><span>on a changing Earth.</span></h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Explore radar imagery, thermal observations, and the stories they can help us understand across Madhya Pradesh.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <AppLink to="/study-map" className="hero-primary inline-flex min-h-12 items-center gap-2 rounded-full bg-radar px-6 py-3 text-sm font-bold text-canvas transition hover:-translate-y-0.5 hover:bg-radar-200">Explore the map <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
                <AppLink to="/case-study" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-radar/40 hover:bg-white/[.08]">Explore live data <ArrowUpRight className="h-4 w-4 text-radar" aria-hidden="true" /></AppLink>
              </div>
              <a href="#project-tour" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-subtle transition hover:text-radar">Discover the project <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></a>
            </div>
            <div className="hero-preview relative mx-auto mt-14 max-w-4xl sm:mt-16">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-radar/10 via-transparent to-ember/10 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <StudyAreaPreview />
              </div>
            </div>
          </div>
          <div className="relative mt-9 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-ember">Current focus</p><p className="mt-1 text-sm font-medium text-white">Fire-related satellite evidence</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-radar">Study area</p><p className="mt-1 text-sm font-medium text-white">Madhya Pradesh, India</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber">Next horizons</p><p className="mt-1 text-sm font-medium text-white">More Earth questions · wider coverage</p></div>
          </div>
        </section>

        <Reveal>
          <section className="mt-12 rounded-2xl border border-white/10 bg-white/[.025] px-5 py-5 sm:px-7" aria-label="Data used in this project">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xs"><p className="eyebrow">Satellite evidence, clearly labelled</p><p className="mt-1 text-xs leading-relaxed text-subtle">Sources currently connected to the study map</p></div>
              <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {sources.map((source) => <div key={source.name} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/[.08] bg-canvas/60 px-3 py-2"><span className={`h-2 w-2 rounded-full bg-current ${source.tone}`} aria-hidden="true" /><span><strong className="block text-xs text-white">{source.name}</strong><span className="block text-[10px] text-subtle">{source.note}</span></span></div>)}
              </div>
            </div>
          </section>
        </Reveal>

        <NasaEcosystemGallery compact maxVideos={1} title="See what radar images really look like." description="Explore three real NASA radar scenes and a short NISAR mission video. These examples come from other places; the Madhya Pradesh study observations are on the map." companion={<RadarFeatureCard />} />

        <section id="project-tour" className="scroll-mt-28 pt-20 md:pt-28" aria-labelledby="features-title">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="eyebrow">A closer look</p><h2 id="features-title" className="mt-3 max-w-2xl text-white">A study dashboard built to show its evidence.</h2></div>
              <AppLink to="/sources" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">See the data and method <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, eyebrow, body, type, size }, index) => (
              <Reveal key={title} delayMs={index * 55} className={size}>
                <article className="surface-card lift group h-full p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4"><span className={`grid h-11 w-11 place-items-center rounded-xl border ${type === 'detections' ? 'border-ember/20 bg-ember/10 text-ember' : 'border-radar/20 bg-radar/10 text-radar'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="rounded-full bg-canvas px-3 py-1 text-[10px] font-bold tracking-[.15em] text-subtle">{eyebrow}</span></div>
                  <h3 className="mt-5 text-xl text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                  <PreviewGraphic kind={type} />
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-20 md:pt-28" aria-labelledby="reading-title">
          <Reveal>
            <div className="mb-9 max-w-2xl"><p className="eyebrow">Learn as you explore</p><h2 id="reading-title" className="mt-3 text-white">What can a satellite signal tell us?</h2><p className="mt-3 text-base leading-relaxed text-muted">Different sensors observe different parts of a changing landscape. Use them together as context, while keeping their limits in view.</p></div>
          </Reveal>
          <div className="space-y-5">
            <Reveal>
              <article className="grid items-center gap-6 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#102735] to-[#0b1d2a] p-5 sm:p-7 lg:grid-cols-2 lg:gap-10 lg:p-9">
                <RadarDiagram />
                <div className="py-2"><p className="eyebrow">01 · Radar observation</p><h3 className="mt-3 text-2xl text-white sm:text-3xl">Radar reads how the surface sends energy back.</h3><p className="mt-4 text-sm leading-relaxed text-muted">NISAR’s L-band radar can observe through clouds and in darkness. Its signal responds to surface structure, vegetation, moisture, and viewing geometry—not just one cause.</p><CheckList items={['Browse images are a visual starting point, not calibrated measurements.', 'Radar coverage can vary by place and date.', 'Use the timeline to explore what was observed.']} /><AppLink to="/how-sar-works" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">Learn how SAR works <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink></div>
              </article>
            </Reveal>
            <Reveal>
              <article className="grid items-center gap-6 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#2a2024] via-[#171f2a] to-[#0b1d2a] p-5 sm:p-7 lg:grid-cols-2 lg:gap-10 lg:p-9">
                <div className="order-2 py-2 lg:order-1"><p className="eyebrow text-ember">02 · Thermal detection</p><h3 className="mt-3 text-2xl text-white sm:text-3xl">Heat detections are clues, not a fire boundary.</h3><p className="mt-4 text-sm leading-relaxed text-muted">VIIRS records identify thermal signals seen by a satellite at a particular time. One record is not necessarily one fire, and detections do not tell us how much land burned.</p><CheckList items={['Dots represent individual sensor records.', 'Burned-area products measure a different outcome at a coarser scale.', 'A detection near a radar pattern does not prove it caused that pattern.']} /><AppLink to="/study-map" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ember underline underline-offset-4">Explore detections on the map <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink></div>
                <div className="order-1 lg:order-2"><DetectionDiagram /></div>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="pt-20 md:pt-28" aria-labelledby="roadmap-title">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Research roadmap</p><h2 id="roadmap-title" className="mt-3 text-white">Fire detection now. More Earth questions ahead.</h2></div><AppLink to="/upcoming" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">Project progress <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink></div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {roadmap.map((item, index) => <Reveal key={item.title} delayMs={index * 50}><article className="surface-card lift h-full p-5"><p className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] ${item.tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{item.state}</p><h3 className="mt-4 text-lg text-white">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p></article></Reveal>)}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-subtle">Planned work is not available as a completed analysis in this release.</p>
        </section>

        <section className="pt-20 md:pt-28" aria-labelledby="notes-title">
          <Reveal>
            <div className="mb-8"><p className="eyebrow">Field notes</p><h2 id="notes-title" className="mt-3 text-white">A good place to keep exploring.</h2></div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            <Reveal><AppLink to="/case-study" className="surface-card lift group block h-full p-5 sm:p-6"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><ScanLine className="h-5 w-5" aria-hidden="true" /></span><ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-radar" aria-hidden="true" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-radar">Live data explorer</p><h3 className="mt-2 text-xl text-white">Explore satellite observations</h3><p className="mt-2 text-sm leading-relaxed text-muted">Browse current NISAR scene previews and inspect dated NASA FIRMS thermal detections from their source feeds.</p></AppLink></Reveal>
            <Reveal delayMs={55}><AppLink to="/physical-drivers" className="surface-card lift group block h-full p-5 sm:p-6"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl border border-analysis/20 bg-analysis/10 text-analysis"><Waves className="h-5 w-5" aria-hidden="true" /></span><ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-radar" aria-hidden="true" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-analysis">Environmental context</p><h3 className="mt-2 text-xl text-white">What else changes the signal?</h3><p className="mt-2 text-sm leading-relaxed text-muted">Explore moisture, vegetation, terrain, and geometry as possible influences on radar observations.</p></AppLink></Reveal>
            <Reveal delayMs={110}><AppLink to="/sources" className="surface-card lift group block h-full p-5 sm:p-6"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl border border-amber/20 bg-amber/10 text-amber"><Layers3 className="h-5 w-5" aria-hidden="true" /></span><ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-radar" aria-hidden="true" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-amber">Data & method</p><h3 className="mt-2 text-xl text-white">Follow each layer to its limits</h3><p className="mt-2 text-sm leading-relaxed text-muted">See which sources are used, what the map computes, and where the evidence stops.</p></AppLink></Reveal>
          </div>
        </section>

        <Reveal>
          <section className="relative mt-20 overflow-hidden rounded-[1.75rem] border border-radar/20 bg-gradient-to-r from-[#12303c] via-[#102635] to-[#231f27] p-6 sm:p-9 md:mt-28 md:p-12" aria-labelledby="cta-title">
            <div className="pointer-events-none absolute -right-8 -top-32 h-80 w-80 rounded-full bg-radar/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-40 right-1/3 h-72 w-72 rounded-full bg-ember/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="eyebrow">Start with the map</p><h2 id="cta-title" className="mt-3 text-white">Explore what satellites observed across the state.</h2><p className="mt-3 text-sm leading-relaxed text-muted">Choose a date, compare available layers, and follow each observation back to its source and method.</p></div><AppLink to="/study-map" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-radar px-5 py-3 text-sm font-bold text-canvas transition hover:-translate-y-0.5 hover:bg-radar-200">Open the map <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink></div>
          </section>
        </Reveal>

        <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-relaxed text-muted"><RadioTower className="mr-1 inline h-3.5 w-3.5 text-radar" aria-hidden="true" /> A thermal detection is not a confirmed fire. Radar browse imagery is not a calibrated change measurement, and the layers do not establish that fire caused a radar pattern.</p>
      </section>
    </>
  );
}
