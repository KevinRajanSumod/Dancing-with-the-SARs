import { ArrowDownRight, ArrowRight, Compass, Layers3, Radar, Satellite } from 'lucide-react';
import AppLink from '@/components/AppLink';

const topics = [
  { icon: Radar, title: 'Start with the radar map', text: 'Explore NISAR through time, then compare a second radar mission and other satellite observations.', link: '/study-map', label: 'Open the study map' },
  { icon: Layers3, title: 'Learn to read the signal', text: 'See how radar echoes respond to vegetation, water, moisture, roughness, and viewing geometry.', link: '/how-sar-works', label: 'Explore SAR basics' },
  { icon: Satellite, title: 'Follow the evidence', text: 'Review the project snapshot, its supporting layers, and what the observations can—and cannot—tell us.', link: '/sources', label: 'Read data & method' },
];

export default function HomePage() {
  return <>
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-radar/15 bg-gradient-to-br from-[#112b3a] via-[#0a1c29] to-[#101a29] px-6 py-10 text-white shadow-card sm:px-10 sm:py-14 lg:px-14 lg:py-20">
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full border border-radar/10"/><div className="pointer-events-none absolute -right-8 -top-12 h-72 w-72 rounded-full border border-radar/10"/><div className="pointer-events-none absolute right-10 top-10 h-48 w-48 rounded-full border border-radar/10"/>
        <div className="relative max-w-3xl">
          <p className="eyebrow text-radar">TerraScope · a guided Earth observation study</p>
          <h1 className="mt-5 max-w-3xl text-balance text-white">See our planet differently.<br/>Act more wisely.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Explore how NASA–ISRO’s NISAR mission observes the land, compare its view with other satellite evidence, and learn how to interpret radar patterns with care. Start in Madhya Pradesh; the study is designed to grow from there.</p>
          <div className="mt-8 flex flex-wrap gap-3"><AppLink to="/study-map" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-radar px-5 py-3 text-sm font-bold text-canvas transition hover:bg-radar-200">View the project map <ArrowRight className="h-4 w-4"/></AppLink><AppLink to="/how-sar-works" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">How SAR works <ArrowDownRight className="h-4 w-4 text-radar"/></AppLink></div>
        </div>
        <div className="relative mt-12 grid gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:grid-cols-3"><p><strong className="block text-sm text-white">Observe</strong>Browse NISAR scenes on one timeline.</p><p><strong className="block text-sm text-white">Compare</strong>Switch among radar, optical, and thermal evidence.</p><p><strong className="block text-sm text-white">Interpret</strong>Learn what a signal means—and where certainty ends.</p></div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Explore the project">
        {topics.map(({ icon: Icon, title, text, link, label }) => <article key={title} className="surface-card flex h-full flex-col p-5 sm:p-6"><span className="grid h-11 w-11 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><Icon className="h-5 w-5"/></span><h2 className="mt-5 text-xl">{title}</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p><AppLink to={link} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4">{label}<ArrowRight className="h-4 w-4"/></AppLink></article>)}
      </section>

      <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-raised/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-start gap-3"><Compass className="mt-1 h-5 w-5 shrink-0 text-analysis"/><div><p className="eyebrow">The study area</p><h2 className="mt-1 text-xl">Madhya Pradesh first · India-wide later</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">The current dashboard focuses on a single state so its map, timeline, and evidence stay clear. The broader goal is to make multi-sensor SAR study accessible across India.</p></div></div><AppLink to="/study-map" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink hover:border-radar/40 hover:text-radar sm:self-center">Enter the study <ArrowRight className="h-4 w-4"/></AppLink></section>
    </main>
  </>;
}
