import { Activity, ArrowDownRight, ArrowRight, Cloud, Flame, Moon, Pause, Play, Radio, Satellite, ScanLine, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLink, { buttonClass } from '@/components/AppLink';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import { detections } from '@/data/detections';

const NASA_EARTH_IMAGE = 'https://svs.gsfc.nasa.gov/vis/a010000/a011400/a011474/cover-1024.jpg';
const NASA_EARTH_VIDEO = 'https://svs.gsfc.nasa.gov/vis/a010000/a011400/a011474/Earth_Illuminated-540-MASTER_high.mp4';

const journey = [
  { number: '01', label: 'Compare', title: 'Two radar passes', note: 'Start with the archived Sep–Nov views.', href: '/forest-fire-change', color: 'text-radar' },
  { number: '02', label: 'Decode', title: 'Follow the echo', note: 'See how a microwave pulse becomes an image.', href: '/how-sar-works', color: 'text-radar' },
  { number: '03', label: 'Test', title: 'Consider the drivers', note: 'Separate observed signal from possible cause.', href: '/physical-drivers', color: 'text-ember' },
  { number: '04', label: 'Apply', title: 'Look beyond this case', note: 'Explore what repeat radar can support.', href: '/future-applications', color: 'text-eco' },
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

const signalRail = [
  { icon: Satellite, label: 'Radar archive', value: '2 scenes', note: 'NISAR L-band browse previews', color: 'text-radar' },
  { icon: Radio, label: 'Signal mode', value: 'HV layer', note: 'Same displayed layer, different configurations', color: 'text-radar' },
  { icon: Flame, label: 'Heat context', value: `${detections.length.toLocaleString('en-US')} records`, note: 'NASA FIRMS / VIIRS NOAA-21', color: 'text-ember' },
  { icon: ScanLine, label: 'Reading status', value: 'Qualitative', note: 'Browse contrast is not a change result', color: 'text-analysis' },
];

function SignalRail() {
  return (
    <section className="relative z-10 -mt-8 px-5 sm:-mt-10 sm:px-8" aria-label="Project signal overview">
      <div className="glass-panel mx-auto grid max-w-7xl overflow-hidden rounded-[1.45rem] sm:grid-cols-2 xl:grid-cols-4">
        {signalRail.map((signal, index) => (
          <Reveal key={signal.label} delayMs={index * 70} className="border-b border-white/10 last:border-b-0 sm:odd:border-r sm:even:border-r-0 sm:[&:nth-last-child(2)]:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0">
            <div className="group relative min-h-36 overflow-hidden p-5 sm:p-6">
              <div className="telemetry-line absolute left-0 top-0 h-px w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] ${signal.color}`}><signal.icon className="h-4 w-4" aria-hidden="true" /></span>
                <span className="font-mono text-[10px] tracking-[.15em] text-subtle">0{index + 1}</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.16em] text-subtle">{signal.label}</p>
              <p className="mt-1 text-base font-semibold text-white">{signal.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-subtle">{signal.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectBrief() {
  return (
    <aside className="glass-panel relative mx-auto w-full max-w-[31rem] rounded-[1.75rem] p-4 sm:p-5" aria-label="Project archive overview">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="eyebrow text-radar">Project archive / Central India</p>
          <p className="mt-1 text-sm text-muted">NISAR browse comparison</p>
        </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-radar/25 bg-radar/10 px-3 py-1.5 text-[11px] font-semibold text-radar">
          <span className="h-1.5 w-1.5 rounded-full bg-radar" aria-hidden="true" /> ARCHIVE
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <figure className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src="/images/map/before_overlay.png" alt="Project NISAR L-band browse preview from 30 September 2026, shown as supplied in the archive." className="aspect-[1.22] w-full object-cover" loading="eager" />
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
            <span className="text-muted">PASS 01</span><span className="font-semibold tabular-nums text-white">30 SEP 2026</span>
          </figcaption>
        </figure>
        <figure className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src="/images/map/after_overlay.png" alt="Project NISAR L-band browse preview from 5 November 2026, shown as supplied in the archive." className="aspect-[1.22] w-full object-cover" loading="eager" />
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
            <span className="text-muted">PASS 02</span><span className="font-semibold tabular-nums text-white">05 NOV 2026</span>
          </figcaption>
        </figure>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>OBSERVATION WINDOW</span><span className="font-medium tabular-nums text-muted">36 DAYS</span>
        </div>
        <div className="relative mt-3 h-1 rounded-full bg-white/10" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-radar/70 to-ember/75" />
          <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-radar" />
          <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-ember" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-white">{detections.length.toLocaleString('en-US')}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">FIRMS detection records in the supplied snapshot</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-2xl font-semibold text-white">L-band</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">NISAR radar browse imagery</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-subtle">Project radar data shown here. Contrast is qualitative; the FIRMS records are separate observations.</p>
      <AppLink to="/forest-fire-change" className="mt-4 flex min-h-11 items-center justify-between rounded-xl bg-radar px-4 text-sm font-semibold text-navy transition-colors hover:bg-radar-200">
        Open the data story <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </AppLink>
    </aside>
  );
}

export default function HomePage() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setMotionEnabled(!preference.matches);
    syncMotionPreference();
    preference.addEventListener('change', syncMotionPreference);
    return () => preference.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (motionEnabled) {
      video.load();
      void video.play().catch(() => setMotionEnabled(false));
    } else {
      video.pause();
      video.load();
    }
  }, [motionEnabled]);

  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#030d18] text-white"
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${NASA_EARTH_IMAGE}")` }} />
          <video
            ref={heroVideoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-700"
            muted
            loop
            playsInline
            src={motionEnabled ? NASA_EARTH_VIDEO : undefined}
            preload={motionEnabled ? 'metadata' : 'none'}
            poster={NASA_EARTH_IMAGE}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(90deg, rgba(3,13,24,.96) 0%, rgba(3,13,24,.87) 42%, rgba(3,13,24,.55) 100%), linear-gradient(0deg, rgba(3,13,24,.96) 0%, rgba(3,13,24,.18) 62%, rgba(3,13,24,.45) 100%)' }}
          />
          <div className="mission-grid absolute inset-0 opacity-35" />
          <div className="orbit-field -right-48 top-12 opacity-70"><span className="orbit-dot" /></div>
          <div className="absolute -bottom-40 -left-48 h-[38rem] w-[38rem] rounded-full bg-radar/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 pb-24 pt-20 sm:px-8 md:min-h-[760px] md:pb-28 md:pt-24 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-radar/25 bg-radar/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-radar shadow-[0_0_24px_rgba(100,211,223,.08)]">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Field signal / Central India
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="h-px w-8 bg-radar" aria-hidden="true" /> NASA–ISRO NISAR · L-band archive
            </p>
            <h1 className="mt-5 max-w-3xl text-white">
              Read the pattern.<br /><span className="text-radar">Respect the uncertainty.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              Step inside a live-looking field notebook built from two NISAR radar passes and a separate snapshot of satellite heat detections, 36 days apart.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppLink to="/forest-fire-change" className={buttonClass('primary')}>
                Explore the map <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </AppLink>
              <AppLink to="/how-sar-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10">
                How SAR works
              </AppLink>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-radar" aria-hidden="true" />Two archive scenes</span>
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />{detections.length.toLocaleString('en-US')} FIRMS records</span>
              <span>30 Sep — 5 Nov 2026</span>
            </div>
          </div>
          <ProjectBrief />
        </div>

        <div className="absolute bottom-3 right-4 z-20 flex max-w-[min(94vw,34rem)] items-end gap-3 sm:right-8">
          <button
            type="button"
            onClick={() => setMotionEnabled((enabled) => !enabled)}
            aria-pressed={motionEnabled}
            aria-label={motionEnabled ? 'Pause NASA background motion' : 'Play NASA background motion'}
            title={motionEnabled ? 'Pause background motion' : 'Play background motion'}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/20 bg-canvas/90 px-3 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:border-radar/60 hover:bg-raised focus-visible:outline-none"
          >
            {motionEnabled ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="hidden sm:inline">{motionEnabled ? 'Pause motion' : 'Play motion'}</span>
          </button>
          <p className="max-w-[26rem] text-right text-[10px] leading-relaxed text-muted sm:text-xs">
            NASA Goddard · <a href="https://svs.gsfc.nasa.gov/11474" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Earth Illuminated ISS video and image</a> (NASA/JSC/Image Science and Analysis Laboratory). Not project radar data; this project is not endorsed by NASA or ISRO.
          </p>
        </div>
      </section>

      <SignalRail />

      <section className="border-b border-line bg-canvas pt-20" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 md:pb-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-radar">The signal path</p>
              <h2 id="journey-heading" className="mt-3 text-2xl text-white md:text-3xl">Follow the evidence, step by step.</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted">A guided route from observation to interpretation. Each stage answers a different question.</p>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {journey.map((step, index) => (
              <li key={step.number} className="list-none">
                <Reveal delayMs={index * 70} className="h-full">
                  <AppLink to={step.href} className="group block h-full rounded-2xl border border-white/10 bg-white/[.035] p-5 transition duration-200 hover:-translate-y-1 hover:border-radar/35 hover:bg-white/[.065] hover:shadow-[0_16px_40px_rgba(0,0,0,.22)] focus-visible:outline-offset-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-mono text-sm font-semibold ${step.color}`}>{step.number} <span aria-hidden="true">/</span> {step.label}</span>
                      <ArrowDownRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-radar" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.note}</p>
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
            <p className="eyebrow text-radar">A field note in three parts</p>
            <h2 id="story-heading" className="mt-4 text-white">From pulse to possible change.</h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted">
            This is a visual comparison paired with thermal-detection records. It does not establish that fire caused the radar patterns.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {storyCards.map((item, index) => (
            <Reveal key={item.title} delayMs={index * 90} className="h-full">
              <Card className="flex h-full flex-col !border-white/10 !bg-white/[.04] !shadow-[0_18px_44px_rgba(0,0,0,.2)]" interactive>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><item.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className="eyebrow !text-[10px] !text-radar">{item.eyebrow}</span>
                </div>
                <h3 className="mt-7 text-white">{item.title}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{item.text}</p>
                <AppLink to={item.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-radar hover:text-white">
                  {item.action} <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </AppLink>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="eyebrow text-radar">A careful reading</p>
            <h2 className="mt-4 text-white">What these signals can—and cannot—say.</h2>
            <AppLink to="/sources" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-radar transition-colors hover:text-white">
              Read the source record <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <Moon className="h-5 w-5 text-radar" aria-hidden="true" />
              <h3 className="mt-4 text-lg text-white">Radar brightness</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Responds to surface structure, moisture and viewing geometry. A brighter or darker patch is not a diagnosis by itself.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <Flame className="h-5 w-5 text-ember" aria-hidden="true" />
              <h3 className="mt-4 text-lg text-white">Thermal detections</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Mark where a satellite sensor registered heat. They are not counts of separate fires, confirmed burn scars, or burned-area measurements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20" aria-label="Project data context">
        <div className="glass-panel flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><Activity className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow text-radar">Project archive</p>
              <h2 className="mt-2 text-xl text-white">Separate sensors. A shared place to ask questions.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">The map keeps the radar previews and thermal records distinct. Switch between the saved archive and API-fed live view when you explore.</p>
            </div>
          </div>
          <AppLink to="/forest-fire-change" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[.07] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-radar/50 hover:bg-white/[.12]">
            Open archive and live data <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </AppLink>
        </div>
      </section>
    </>
  );
}
