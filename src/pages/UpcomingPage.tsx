import { Check, Database, Satellite, Waves } from 'lucide-react';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const nextSteps = [
  {
    icon: Satellite,
    tag: 'Strengthen the comparison',
    title: 'Use matched NISAR measurements',
    description: 'Build a repeat-scene comparison with a consistent polarization, compatible processing and calibrated backscatter products over the same footprint.',
  },
  {
    icon: Database,
    tag: 'Add independent evidence',
    title: 'Check for mapped burn impact',
    description: 'Compare the radar observations with a validated burned-area layer, optical imagery and local reports. No burned-area product or field validation is part of the current snapshot.',
  },
  {
    icon: Waves,
    tag: 'Follow the surface through time',
    title: 'Build a seasonal radar series',
    description: 'Add earlier and later acquisitions so temporary moisture differences can be separated from persistent changes and seasonal patterns.',
  },
];

export default function UpcomingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Roadmap / Next questions</p>
        <PageIntro title="What would make the next answer stronger?">
          <p>
            The current story is deliberately observational. These are practical follow-up investigations that would add
            evidence or make the radar comparison more rigorous; they are not completed analyses or live data feeds.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 md:pb-20" aria-label="Follow-up investigations">
        <ol className="grid gap-4 lg:grid-cols-3">
          {nextSteps.map((step, index) => (
            <li key={step.title} className="list-none">
              <Reveal delayMs={index * 80} className="h-full">
                <Card className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-radar/10 text-radar"><step.icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="rounded-full bg-canvas px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-subtle">{step.tag}</span>
                  </div>
                  <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-radar">NEXT QUESTION 0{index + 1}</p>
                  <h2 className="mt-2 text-2xl">{step.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{step.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-subtle"><Check className="h-4 w-4" aria-hidden="true" /> Proposed, not yet analyzed</span>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-raised py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">Other NISAR science directions</p>
          <h2 className="mt-3 max-w-2xl">The same radar mission can support many Earth stories.</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">NISAR’s mission objectives include ecosystem and agricultural change, surface deformation and the dynamics of ice. This project currently presents one central India case study only.</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-ink">
            {['Wetlands & inundation', 'Crop cycles', 'Glacier & sea ice motion', 'Earthquake & landslide deformation'].map((label) => <span key={label} className="rounded-full border border-line bg-canvas px-3 py-2">{label}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
