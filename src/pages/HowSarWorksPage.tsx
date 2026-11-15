import { Activity, ArrowDown, ArrowUp, ExternalLink, Image as ImageIcon, LocateFixed, Radio, Waves } from 'lucide-react';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const steps = [
  { icon: Radio, title: 'Transmit', text: 'The antenna sends a short microwave pulse toward Earth. Radar supplies its own signal, so sunlight is not required.' },
  { icon: Waves, title: 'Interact', text: 'The pulse meets leaves, branches, soil, water and built surfaces. Their arrangement and moisture affect the returned signal.' },
  { icon: Activity, title: 'Receive', text: 'Some energy scatters back to the antenna. Its travel time and strength are recorded as an echo.' },
  { icon: ImageIcon, title: 'Build an image', text: 'As the satellite moves, many echoes are combined into a sharper image. Pixels represent radar response, not a photograph.' },
];

const stepIconTones = ['bg-radar/10 text-radar', 'bg-eco/10 text-eco', 'bg-ember/10 text-ember', 'bg-analysis/10 text-analysis'];
const NASA_NISAR_RADAR_IMAGE = 'https://images-assets.nasa.gov/image/PIA26616/PIA26616~large.jpg';
const NASA_NISAR_DEPLOYMENT_YOUTUBE_ID = '7fvTqm8Lt2U';

function RadarPulseDiagram() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper p-4 sm:p-8">
      <svg viewBox="0 0 1000 340" role="img" aria-labelledby="pulse-title pulse-desc" className="h-auto w-full">
        <title id="pulse-title">Illustration of a synthetic aperture radar pulse</title>
        <desc id="pulse-desc">A satellite moves above a textured ground surface, sending a cyan microwave pulse down and receiving an amber echo back.</desc>
        <defs>
          <linearGradient id="surfaceGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#67D8E8" stopOpacity=".2" />
            <stop offset="100%" stopColor="#67D8E8" stopOpacity="0" />
          </linearGradient>
          <marker id="arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#67D8E8" />
          </marker>
          <marker id="arrow-ember" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#F49A65" />
          </marker>
        </defs>

        <path d="M0 244 C118 218 180 260 294 235 C402 211 506 253 625 228 C756 201 861 246 1000 214 L1000 340 L0 340 Z" fill="url(#surfaceGlow)" />
        <path d="M0 244 C118 218 180 260 294 235 C402 211 506 253 625 228 C756 201 861 246 1000 214" fill="none" stroke="#67D8E8" strokeOpacity=".55" strokeWidth="2" />
        <g fill="#97A9B3" opacity=".65">
          <path d="M126 231l8-17 8 17h-5v12h-6v-12z"/><path d="M147 232l6-13 6 13h-4v11h-5v-11z"/>
          <path d="M756 222l8-18 8 18h-5v12h-6v-12z"/><path d="M779 224l6-13 6 13h-4v10h-5v-10z"/>
          <path d="M535 238l18-26 19 26z"/><path d="M550 238v-13h8v13" fill="#071828"/>
        </g>
        <g fill="none" stroke="#9FAEB5" strokeOpacity=".35" strokeWidth="1">
          <path d="M55 270l52-21m18 37 54-24m121 21 43-21m91 22 50-29m97 29 61-26m174 32 47-23m61 23 58-29" />
          <path d="M30 289l65-23m173 28 76-28m346 32 73-27m157 28 56-25" />
        </g>

        <path d="M240 72 Q385 55 530 72" fill="none" stroke="#5C7181" strokeDasharray="4 8" strokeWidth="2" />
        <g transform="translate(330 56)" fill="none" stroke="#67D8E8" strokeWidth="2">
          <rect x="-26" y="-12" width="52" height="24" rx="4" fill="#122F45" />
          <path d="M-27 0h-34m34-6h-34m88 6h34m-34-6h34" />
          <path d="M0 13v14m-6-7h12" />
        </g>
        <g transform="translate(450 62)" opacity=".55" fill="none" stroke="#67D8E8" strokeWidth="1.5">
          <rect x="-20" y="-9" width="40" height="18" rx="3" fill="#122F45" />
          <path d="M-21 0h-26m68 0h26m-27 12v12" />
        </g>
        <g transform="translate(570 68)" opacity=".3" fill="none" stroke="#67D8E8" strokeWidth="1.5">
          <rect x="-16" y="-7" width="32" height="14" rx="3" fill="#122F45" />
          <path d="M-17 0h-22m56 0h22m-22 10v10" />
        </g>

        <path d="M330 105 L468 224" fill="none" stroke="#67D8E8" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#arrow-cyan)" className="radar-beam" />
        <path d="M490 218 L421 101" fill="none" stroke="#F49A65" strokeWidth="3" strokeDasharray="6 8" markerEnd="url(#arrow-ember)" className="radar-echo" />
        <circle cx="478" cy="226" r="8" fill="#F49A65" />
        <circle cx="478" cy="226" r="18" fill="none" stroke="#F49A65" strokeOpacity=".55" strokeWidth="2" className="radar-ripple" />
        <circle cx="478" cy="226" r="31" fill="none" stroke="#F49A65" strokeOpacity=".28" strokeWidth="1.5" />

        <text x="44" y="62" fill="#67D8E8" fontSize="12" fontWeight="700" letterSpacing="2">ORBIT / SATELLITE MOVES</text>
        <text x="44" y="318" fill="#9BAEB9" fontSize="12" fontWeight="700" letterSpacing="2">SURFACE / STRUCTURE · MOISTURE · GEOMETRY</text>
        <text x="352" y="171" fill="#A9EDF3" fontSize="13" fontWeight="600">outgoing pulse</text>
        <text x="494" y="158" fill="#F6A377" fontSize="13" fontWeight="600">returning echo</text>
      </svg>
      <p className="mt-3 text-xs leading-relaxed text-subtle">Illustration only. It shows the sensing idea, not the geometry or measurements of a specific NISAR pass.</p>
    </div>
  );
}

function NisarMissionMedia() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-labelledby="mission-media-heading">
      <div className="mb-6 max-w-3xl">
        <p className="eyebrow">NASA mission media · examples beyond this project</p>
        <h2 id="mission-media-heading" className="mt-2">Meet the spacecraft and see a radar sample.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">These NASA/JPL visuals explain the mission. The radar image is from Maine, not the Central India scenes in this story.</p>
      </div>
      <Reveal>
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="grid lg:grid-cols-2">
            <figure className="min-w-0 border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-canvas">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${NASA_NISAR_DEPLOYMENT_YOUTUBE_ID}`}
                  title="NISAR antenna deployment animation · NASA/JPL-Caltech"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <figcaption className="p-5 sm:p-6">
                <h3 className="mt-2 text-xl">NISAR launch and deployment</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">NASA/JPL-Caltech · animation of the spacecraft launch and reflector deployment.</p>
                <a href="https://science.nasa.gov/video-detail/amf-ffc8740c-2d65-4712-a4dd-78152649ab49/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-radar underline underline-offset-4 hover:text-radar-200">
                  NASA video details <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </figcaption>
            </figure>

            <figure className="min-w-0 p-4 sm:p-6">
              <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
                <img
                  src={NASA_NISAR_RADAR_IMAGE}
                  alt="False-color NISAR L-band radar image of Mount Desert Island, Maine, with water in dark tones, forest in green, and hard or regular surfaces in magenta."
                  className="aspect-video w-full bg-[#07131d] object-contain"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-navy/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">NASA NISAR sample · Maine</span>
              </div>
              <figcaption className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-analysis">Different place · mission example</p>
                <h3 className="mt-2 text-xl">Radar can reveal surface patterns.</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">This L-band image shows Mount Desert Island, Maine, acquired Aug. 21, 2025 during commissioning. It is not project data or a change result.</p>
                <a href="https://science.nasa.gov/image-detail/amf-pia26616/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-radar underline underline-offset-4 hover:text-radar-200">
                  Image details and credit · NASA/JPL-Caltech <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function HowSarWorksPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">The instrument / Synthetic aperture radar</p>
        <PageIntro title="How SAR reads the surface">
          <p>
            Synthetic aperture radar (SAR) sends microwave energy and measures the echo that returns. It can collect data
            at night and through most clouds. NISAR carries L-band and S-band radar instruments; the images in this story
            are browse previews of NISAR L-band data.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-labelledby="pulse-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The signal path</p>
            <h2 id="pulse-heading" className="mt-2">Four steps, one echo at a time.</h2>
          </div>
          <span className="rounded-full bg-radar/10 px-3 py-1.5 text-xs font-semibold text-radar">Illustrated process</span>
        </div>
        <RadarPulseDiagram />
        <ol className="relative mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="list-none">
              <Reveal delayMs={index * 70} className="h-full">
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl border border-line ${stepIconTones[index]}`}><step.icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="text-xs font-semibold tracking-[0.12em] text-subtle">STEP 0{index + 1}</span>
                  </div>
                  <h3 className="mt-5">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <NisarMissionMedia />

      <section className="bg-raised py-16 md:py-24" aria-labelledby="echo-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Interpreting backscatter</p>
            <h2 id="echo-heading" className="mt-2">The echo depends on more than one thing.</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">Radar brightness is a measured response shaped by the material and the way the radar views it. It is useful evidence, but it does not label a land-cover change on its own.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <Reveal className="h-full"><Card className="h-full"><span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-eco/10 text-eco"><LocateFixed className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-5">Structure and roughness</h3><p className="mt-3 text-sm leading-relaxed text-muted">Leaves, branches, trunks, bare ground and surface texture scatter microwave energy in different ways.</p></Card></Reveal>
            <Reveal delayMs={80} className="h-full"><Card className="h-full"><span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-radar/10 text-radar"><Activity className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-5">Moisture</h3><p className="mt-3 text-sm leading-relaxed text-muted">Water in soil and vegetation can change the electrical response of a surface and affect the signal returned.</p></Card></Reveal>
            <Reveal delayMs={160} className="h-full"><Card className="h-full"><span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-analysis/10 text-analysis"><ArrowUp className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-5">Viewing setup</h3><p className="mt-3 text-sm leading-relaxed text-muted">Polarization, orbit geometry, processing and acquisition conditions also matter when two scenes are compared.</p></Card></Reveal>
          </div>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-line bg-canvas p-4 text-sm leading-relaxed text-muted">
            <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
            <p>For this project, the browse previews differ in product configuration and processing version. Their visible contrast is a prompt for further analysis, not a measured forest-loss or burn result.</p>
          </div>
        </div>
      </section>
    </>
  );
}
