import { ArrowRight, CloudRain, Leaf, MapPin, Tractor } from 'lucide-react';
import AppLink from '@/components/AppLink';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const applications = [
  {
    icon: Leaf,
    title: 'Track ecosystem disturbance and recovery',
    text: 'Repeated radar observations can help researchers study vegetation structure and biomass trends, including how ecosystems respond to disturbance. Interpreting a specific event still depends on consistent data and local validation.',
    link: 'https://science.nasa.gov/mission/nisar/ecosystem/',
    linkLabel: 'NASA ecosystem science',
  },
  {
    icon: Tractor,
    title: 'Observe crops and surface moisture',
    text: 'Radar can support seasonal monitoring of agricultural areas and surface soil moisture, including when clouds limit optical observations. Those measurements can add context for water and land management.',
    link: 'https://science.nasa.gov/mission/nisar/mission-overview/',
    linkLabel: 'NISAR mission overview',
  },
  {
    icon: CloudRain,
    title: 'Respond to changing hazards',
    text: 'NISAR is designed to observe land and ice changes relevant to hazards such as earthquakes, landslides and floods. Repeat observations can help analysts map affected areas and understand how the surface evolves.',
    link: 'https://science.nasa.gov/mission/nisar/mission-requirements/',
    linkLabel: 'Mission measurement objectives',
  },
];

export default function FutureApplicationsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Beyond this case study / Applications</p>
        <PageIntro title="From radar echoes to useful context">
          <p>
            NISAR is designed to observe changes in Earth’s land, water, vegetation and ice. Its repeat radar views can
            support research and decisions when optical images are obscured by cloud or darkness. This project is a small
            visual example, not an operational fire-monitoring service.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-label="Possible applications">
        <div className="grid gap-4 lg:grid-cols-3">
          {applications.map((application, index) => (
            <Reveal key={application.title} delayMs={index * 80} className="h-full">
              <Card className="flex h-full flex-col" interactive>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><application.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-6 text-2xl">{application.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{application.text}</p>
                <a href={application.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy">
                  {application.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy py-16 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-3xl">
            <p className="eyebrow text-radar">When signals work together</p>
            <h2 className="mt-3 text-white">Radar tells part of the story.</h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              For fire impacts, radar observations are most useful alongside independent evidence: active-fire detections,
              optical imagery, a mapped burned-area product, weather and field reports. Those sources answer different
              questions and should not be collapsed into one signal.
            </p>
          </div>
          <MapPin className="hidden h-12 w-12 text-radar md:block" aria-hidden="true" />
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
          <AppLink to="/sources" className="inline-flex items-center gap-2 text-sm font-semibold text-radar hover:text-white">Explore the sources and method <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
        </div>
      </section>
    </>
  );
}
