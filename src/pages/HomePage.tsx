import { ArrowDownRight, ArrowRight, Layers3, Radar, Satellite, Flame } from 'lucide-react';
import AppLink from '@/components/AppLink';

const topics = [
  { icon: Radar, title: 'Start with the radar map', text: 'Explore NISAR through time, then compare a second radar mission and other satellite observations.', link: '/study-map', label: 'Open the study map' },
  { icon: Layers3, title: 'Learn to read the signal', text: 'See how radar echoes respond to vegetation, water, moisture, roughness, and viewing geometry.', link: '/how-sar-works', label: 'Explore SAR basics' },
  { icon: Satellite, title: 'Follow the evidence', text: 'See which fire-related measurements are available now, what they mean, and where the evidence ends.', link: '/sources', label: 'Read data & method' },
];

export default function HomePage() {
  return <>
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-radar/20 bg-gradient-to-br from-[#e5eee8] via-[#f8f7f0] to-[#eee8d9] px-6 py-10 text-ink shadow-card sm:px-10 sm:py-14 lg:px-14 lg:py-20">
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full border border-radar/15"/><div className="pointer-events-none absolute -right-8 -top-12 h-72 w-72 rounded-full border border-radar/15"/><div className="pointer-events-none absolute right-10 top-10 h-48 w-48 rounded-full border border-amber/20"/>
        <div className="relative max-w-3xl">
          <p className="eyebrow text-radar">TerraScope · Earth observation research</p>
          <h1 className="mt-5 max-w-3xl text-balance text-ink">See our planet differently.<br/>Act more wisely.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">TerraScope is a research visualization dashboard for studying satellite evidence. Our current investigation focuses on fire detections in Madhya Pradesh, using NISAR radar alongside VIIRS thermal detections and MODIS burned-area context.</p>
          <div className="mt-8 flex flex-wrap gap-3"><AppLink to="/study-map" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-radar px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800">Open research map <ArrowRight className="h-4 w-4"/></AppLink><AppLink to="/how-sar-works" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line-strong bg-paper/70 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper">How SAR works <ArrowDownRight className="h-4 w-4 text-radar"/></AppLink></div>
        </div>
        <div className="relative mt-12 grid gap-3 border-t border-navy/10 pt-5 text-xs text-muted sm:grid-cols-3"><p><strong className="block text-sm text-ink">Current focus</strong>Fire detection and burned-area context.</p><p><strong className="block text-sm text-ink">Research method</strong>Compare sensor observations with their dates and coverage.</p><p><strong className="block text-sm text-ink">Next applications</strong>Flooding, crops, ecosystems, and broader India coverage.</p></div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Explore the project">
        {topics.map(({ icon: Icon, title, text, link, label }) => <article key={title} className="surface-card lift flex h-full flex-col p-5 sm:p-6"><span className="grid h-11 w-11 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><Icon className="h-5 w-5"/></span><h2 className="mt-5 text-xl">{title}</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p><AppLink to={link} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">{label}<ArrowRight className="h-4 w-4"/></AppLink></article>)}
      </section>

      <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-raised/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-start gap-3"><Flame className="mt-1 h-5 w-5 shrink-0 text-ember"/><div><p className="eyebrow">Now researching</p><h2 className="mt-1 text-xl">Satellite evidence for fire activity</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">The live project focus is fire detection in Madhya Pradesh. Future releases will add analyzed flood, crop, vegetation, and surface-change studies instead of implying they are already part of this analysis.</p></div></div><AppLink to="/upcoming" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink hover:border-radar/40 hover:text-radar sm:self-center">Upcoming research <ArrowRight className="h-4 w-4"/></AppLink></section>
    </main>
  </>;
}
