import { Activity, Droplets, Flame, ScanLine, Trees } from 'lucide-react';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const candidateDrivers = [
  {
    icon: Trees,
    title: 'Vegetation structure',
    readout: 'A canopy disturbance could change how much energy scatters within and from the vegetation layer.',
    evidence: 'A controlled, multi-date backscatter analysis at matching polarization, checked against optical or field observations.',
  },
  {
    icon: Droplets,
    title: 'Water in soil and plants',
    readout: 'Rainfall, soil wetness and vegetation water content can alter the radar response even when land cover stays the same.',
    evidence: 'Weather or soil-moisture records and repeated acquisitions that separate short-term wetness from lasting change.',
  },
  {
    icon: Flame,
    title: 'Fire or another disturbance',
    readout: 'Fire may alter vegetation and ground exposure, but logging, harvest and other processes can produce change too.',
    evidence: 'A burned-area product or local report, aligned in space and time, plus a consistent radar time series.',
  },
];

export default function PhysicalDriversPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Interpretation / Candidate explanations</p>
        <PageIntro title="What could drive a radar change?">
          <p>
            Radar brightness responds to surface structure, moisture and the way a scene is observed. The supplied pair
            has not been tested to identify a cause, so the possibilities below are questions for follow-up—not findings
            about this specific footprint.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-labelledby="drivers-heading">
        <h2 id="drivers-heading">Three explanations to test</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {candidateDrivers.map((driver, index) => (
            <Reveal key={driver.title} delayMs={index * 80} className="h-full">
              <Card className="h-full" interactive>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><driver.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-5">{driver.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{driver.readout}</p>
                <div className="mt-5 border-t border-navy/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal">What would help test it</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{driver.evidence}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="polarization-heading">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Radar channel</p>
            <h2 id="polarization-heading" className="mt-3">Why polarization matters.</h2>
          </div>
          <div className="max-w-3xl text-base leading-relaxed text-ink/75">
            <p>Polarization describes the orientation of the radar wave when it is transmitted and received. HV means the radar transmits a horizontally polarized wave and receives a vertically polarized return.</p>
            <p className="mt-4">The project notes say both scenes include HV, but the scenes have different polarization configurations and processing versions. A stronger comparison would isolate the same channel and use compatible, calibrated products before measuring change.</p>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-ember/20 bg-ember/5 p-4 text-sm leading-relaxed text-ink/70">
              <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
              <p>These scene differences are part of the uncertainty in this visual story. No physical driver has been assigned to the observed contrast.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-2xl">
            <p className="eyebrow">Evidence boundary</p>
            <h2 className="mt-2 text-2xl">A detection is not an attribution.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">The FIRMS points add when-and-where heat detections were recorded. They do not confirm a fire, indicate its perimeter, or establish that a particular radar patch changed because of fire.</p>
          </div>
          <Activity className="hidden h-12 w-12 shrink-0 text-radar sm:block" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
