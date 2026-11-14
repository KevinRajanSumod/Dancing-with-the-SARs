import { Activity, ArrowDownRight, ArrowRight, Cloud, Flame, Moon, Radio, ScanLine } from 'lucide-react';
import AppLink, { buttonClass } from '@/components/AppLink';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import { detections } from '@/data/detections';

const NASA_EARTH_IMAGE = 'https://images-assets.nasa.gov/image/art002e000192/art002e000192~large.jpg';

const journey = [
  { number: '01', label: 'Compare', title: 'Two radar passes', note: 'Start with the archived Sep–Nov views.', href: '/forest-fire-change', color: 'text-radar' },
  { number: '02', label: 'Decode', title: 'Follow the echo', note: 'See how a microwave pulse becomes an image.', href: '/how-sar-works', color: 'text-radar' },
  { number: '03', label: 'Test', title: 'Consider the drivers', note: 'Separate observed signal from possible cause.', href: '/physical-drivers', color: 'text-ember' },
  { number: '04', label: 'Apply', title: 'Look beyond this case', note: 'Explore what repeat radar can support.', href: '/future-applications', color: 'text-radar' },
];

const storyCards = [
  {
    icon: ScanLine,
    eyebrow: 'The observation',
    title: 'Two passes. One radar footprint.',
    text: 'Compare NISAR browse previews from 30 September and 5 November 2026. Their contrast is visual context, not a measured change product.',
    href: '/forest-fire-change',
    action: 'Open the comparison',
  },
  {
    icon: Radio,
    eyebrow: 'The instrument',
    title: 'Read the echo, not the light.',
    text: 'Synthetic aperture radar sends microwave pulses and records the returned signal, day or night and through most clouds.',
    href: '/how-sar-works',
    action: 'See how SAR works',
  },
  {
    icon: Cloud,
    eyebrow: 'The context',
    title: 'A heat detection is a clue.',
    text: 'NASA FIRMS records satellite thermal detections. They add time context, but do not confirm a fire or map burned area.',
    href: '/physical-drivers',
    action: 'Read the evidence limits',
  },
];

function ProjectBrief() {
  return (
    <aside className="relative mx-auto w-full max-w-[31rem] rounded-[1.75rem] border border-white/15 bg-[#061521]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5" aria-label="Project archive overview">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="eyebrow text-radar">Project archive / Central India</p>
          <p className="mt-1 text-sm text-white/65">NISAR browse comparison</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-radar/25 bg-radar/10 px-3 py-1.5 text-[11px] font-semibold text-radar">
          <span className="h-1.5 w-1.5 rounded-full bg-radar" aria-hidden="true" /> ARCHIVE
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <figure className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src="/images/map/before_overlay.png" alt="Project NISAR L-band browse preview from 30 September 2026, shown as supplied in the archive." className="aspect-[1.22] w-full object-cover" loading="eager" />
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
            <span className="text-white/55">PASS 01</span><span className="font-semibold tabular-nums text-white">30 SEP 2026</span>
          </figcaption>
        </figure>
        <figure className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src="/images/map/after_overlay.png" alt="Project NISAR L-band browse preview from 5 November 2026, shown as supplied in the archive." className="aspect-[1.22] w-full object-cover" loading="eager" />
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
            <span className="text-white/55">PASS 02</span><span className="font-semibold tabular-nums text-white">05 NOV 2026</span>
          </figcaption>
        </figure>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-white/55">
          <span>OBSERVATION WINDOW</span><span className="font-medium tabular-nums text-white/80">36 DAYS</span>
        </div>
        <div className="relative mt-3 h-1 rounded-full bg-white/10" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-radar/70 to-ember/75" />
          <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-radar" />
          <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-ember" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-white">{detections.length.toLocaleString('en-US')}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">FIRMS detection records in the supplied snapshot</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-2xl font-semibold text-white">L-band</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">NISAR radar browse imagery</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/45">Project radar data shown here. Contrast is qualitative; the FIRMS records are separate observations.</p>
      <AppLink to="/forest-fire-change" className="mt-4 flex min-h-11 items-center justify-between rounded-xl bg-radar px-4 text-sm font-semibold text-navy transition-colors hover:bg-cyan-200">
        Open the data story <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </AppLink>
    </aside>
  );
}

export default function HomePage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-navy text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(4, 17, 29, .96) 0%, rgba(4, 17, 29, .87) 40%, rgba(4, 17, 29, .42) 100%), linear-gradient(0deg, rgba(4, 17, 29, .76) 0%, transparent 52%), url("${NASA_EARTH_IMAGE}")`,
          backgroundPosition: 'center, center, 62% 48%',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 -z-10 bg-navy radar-grain opacity-25" aria-hidden="true" />
        <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 pb-24 pt-16 sm:px-8 md:pb-28 md:pt-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow text-radar">Earth observation / Central India</p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              <span className="h-px w-8 bg-radar" aria-hidden="true" /> NASA–ISRO NISAR · L-band
            </p>
            <h1 className="mt-5 max-w-3xl text-white">
              Two radar passes.<br /><span className="text-radar">What can they reveal?</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
              Follow two NISAR radar views, 36 days apart, alongside a snapshot of satellite heat detections. Explore the signals—and the limits of what they can tell us.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppLink to="/forest-fire-change" className={buttonClass('primary')}>
                Explore the map <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </AppLink>
              <AppLink to="/how-sar-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10">
                How SAR works
              </AppLink>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-radar" aria-hidden="true" />Two archive scenes</span>
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />{detections.length.toLocaleString('en-US')} FIRMS records</span>
              <span>30 Sep — 5 Nov 2026</span>
            </div>
          </div>
          <ProjectBrief />
        </div>

        <div className="absolute bottom-3 right-4 max-w-[min(90vw,29rem)] text-right text-[10px] leading-relaxed text-white/65 sm:right-8 sm:text-xs">
          Illustrative Earth image: NASA / Artemis II, NASA Image and Video Library ·{' '}
          <a href="https://images.nasa.gov/details/art002e000192" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">view source</a>.
          {' '}Not the project radar data; this project is not endorsed by NASA or ISRO.
        </div>
      </section>

      <section className="border-b border-navy/10 bg-paper" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">The signal path</p>
              <h2 id="journey-heading" className="mt-3 text-2xl md:text-3xl">Follow the evidence, step by step.</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink/65">A guided route from observation to interpretation. Each stage answers a different question.</p>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {journey.map((step, index) => (
              <li key={step.number} className="list-none">
                <Reveal delayMs={index * 70} className="h-full">
                  <AppLink to={step.href} className="group block h-full rounded-2xl border border-navy/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-teal/35 hover:shadow-card focus-visible:outline-offset-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-mono text-sm font-semibold ${step.color}`}>{step.number} <span aria-hidden="true">/</span> {step.label}</span>
                      <ArrowDownRight className="h-4 w-4 text-ink/30 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-teal" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.note}</p>
                  </AppLink>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28" aria-labelledby="story-heading">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">A field note in three parts</p>
            <h2 id="story-heading" className="mt-4">From pulse to possible change.</h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink/75">
            This is a visual comparison paired with thermal-detection records. It does not establish that fire caused the radar patterns.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {storyCards.map((item, index) => (
            <Reveal key={item.title} delayMs={index * 90} className="h-full">
              <Card className="flex h-full flex-col" interactive>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><item.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className="eyebrow !text-[10px]">{item.eyebrow}</span>
                </div>
                <h3 className="mt-7">{item.title}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-ink/75">{item.text}</p>
                <AppLink to={item.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy">
                  {item.action} <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </AppLink>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="eyebrow">A careful reading</p>
            <h2 className="mt-4">What these signals can—and cannot—say.</h2>
            <AppLink to="/sources" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal transition-colors hover:text-navy">
              Read the source record <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 bg-canvas p-5">
              <Moon className="h-5 w-5 text-teal" aria-hidden="true" />
              <h3 className="mt-4 text-lg">Radar brightness</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">Responds to surface structure, moisture and viewing geometry. A brighter or darker patch is not a diagnosis by itself.</p>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-canvas p-5">
              <Flame className="h-5 w-5 text-ember" aria-hidden="true" />
              <h3 className="mt-4 text-lg">Thermal detections</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">Mark where a satellite sensor registered heat. They are not counts of separate fires, confirmed burn scars, or burned-area measurements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20" aria-label="Project data context">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-paper p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-radar/15 text-teal"><Activity className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">Project archive</p>
              <h2 className="mt-2 text-xl">Separate sensors. A shared place to ask questions.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">The map keeps the radar previews and thermal records distinct. Switch between the saved archive and API-fed live view when you explore.</p>
            </div>
          </div>
          <AppLink to="/forest-fire-change" className={`${buttonClass('secondary')} shrink-0`}>
            Open archive and live data <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </AppLink>
        </div>
      </section>
    </>
  );
}
