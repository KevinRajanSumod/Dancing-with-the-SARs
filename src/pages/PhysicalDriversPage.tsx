import { Activity, BookOpen, Droplets, ExternalLink, Flame, ScanLine, Trees } from 'lucide-react';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const drivers = [
  {
    icon: Trees,
    title: 'Vegetation and surface structure',
    readout:
      'Canopy density, branches, trunks, exposed soil, and surface roughness shape how much radar energy returns. Forest disturbance can change that structure, but the direction and size of a backscatter change depend on the site and the acquisition.',
    evidence:
      'Compare calibrated, geocoded time series from the same track and polarization. Use optical imagery, land-cover data, or field observations to check what changed on the ground.',
    source: 'NASA SAR Handbook · Mapping Deforestation',
    href: 'https://earthdata.nasa.gov/s3fs-public/2025-04/SARHB_CH3_Content.pdf',
  },
  {
    icon: Droplets,
    title: 'Moisture and inundation',
    readout:
      'Soil moisture, water on leaves, and standing water beneath vegetation can alter backscatter. Rainfall, irrigation, seasonal flooding, and plant water content can therefore create contrast without a lasting land-cover change.',
    evidence:
      'Check rainfall, soil-moisture or water-level records and acquisition timing. A repeated time series helps distinguish short-lived wetness from persistent structural change.',
    source: 'NASA SAR Handbook · Environmental effects',
    href: 'https://earthdata.nasa.gov/s3fs-public/2025-04/SARHB_CH5_Content.pdf',
  },
  {
    icon: Flame,
    title: 'Fire or another disturbance',
    readout:
      'Fire can alter vegetation structure, but so can logging, harvest, storms, insects, or land conversion. A radar contrast alone cannot identify which process occurred or establish a burn scar.',
    evidence:
      'Use a consistent radar time series with an independently mapped burned-area or disturbance product. Check acquisition dates and validate the interpretation with optical imagery or field evidence.',
    source: 'NASA NISAR ecosystem science',
    href: 'https://science.nasa.gov/mission/nisar/ecosystem/',
  },
];

const driverIconTones = ['bg-eco/10 text-eco', 'bg-radar/10 text-radar', 'bg-ember/10 text-ember'];

const sourceLinkClass = 'mt-4 inline-flex items-center text-xs font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar';

export default function PhysicalDriversPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Interpretation / Candidate explanations</p>
        <PageIntro title="What could drive a radar change?">
          <p>
            NASA’s SAR guidance describes backscatter as a response to both the observed surface and the radar setup.
            The supplied browse previews have not been calibrated or analyzed as a change-detection pair, so the
            explanations below are sourced hypotheses to test—not findings about this footprint.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-labelledby="drivers-heading">
        <h2 id="drivers-heading">Known influences on radar backscatter</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          These are established SAR interpretation factors from NASA’s SAR Handbook. They explain why a visible
          difference needs follow-up; they do not identify what happened at this location.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {drivers.map((driver, index) => (
            <Reveal key={driver.title} delayMs={index * 80} className="h-full">
              <Card className="h-full" interactive>
                <span className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${driverIconTones[index]}`}><driver.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-5">{driver.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{driver.readout}</p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-radar">Evidence to check</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{driver.evidence}</p>
                </div>
                <a href={driver.href} target="_blank" rel="noopener noreferrer" className={sourceLinkClass}>
                  {driver.source}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-raised py-16 md:py-20" aria-labelledby="polarization-heading">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Read the supplied products carefully</p>
            <h2 id="polarization-heading" className="mt-3">The scene configurations differ.</h2>
          </div>
          <div className="max-w-3xl text-base leading-relaxed text-muted">
            <p>
              The supplied scene names encode different polarization configurations: <strong>QPDH</strong> for the
              30 September scene and <strong>DHDH</strong> for the 5 November scene. Their workflow identifiers also
              differ: <strong>P05023</strong> and <strong>P05036</strong>. The NISAR Data User Guide explains these
              fields in the GCOV naming convention. Although both previews show an HV layer, that does not make the
              two browse images a calibrated change measurement.
            </p>
            <p className="mt-4">
              Treat the visible contrast as a prompt to obtain compatible geocoded measurements, match the polarization
              and viewing geometry, account for processing versions, and validate any proposed land change independently.
            </p>
            <a href="https://nisar-docs.asf.alaska.edu/gcov/" target="_blank" rel="noopener noreferrer" className={sourceLinkClass}>
              NISAR Data User Guide · GCOV product naming and layers<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-ember/20 bg-ember/5 p-4 text-sm leading-relaxed text-muted">
              <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
              <p>The contrast has not been quantified. No forest-loss, burn-area, or cause estimate is made on this page.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16" aria-labelledby="learning-heading">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-radar/10 text-radar"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow">NASA learning resources</p>
            <h2 id="learning-heading" className="mt-2">Learn how to test these explanations.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">Use the SAR overview to understand the signal and the ARSET training to learn practical analysis workflows. They explain methods; they do not supply measurements for this footprint.</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <a href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">NASA Intro to SAR <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
              <a href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">NASA Intro to Remote Sensing <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
              <a href="https://appliedsciences.nasa.gov/get-involved/training" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">NASA ARSET trainings <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-2xl">
            <p className="eyebrow">Independent evidence</p>
            <h2 className="mt-2 text-2xl">A heat detection is not an attribution.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">NASA FIRMS reports satellite active-fire and thermal-anomaly detections. Those detections do not confirm a fire at every point, map its perimeter, measure burned area, or establish that fire caused a radar change.</p>
            <a href="https://firms.modaps.eosdis.nasa.gov/active_fire/" target="_blank" rel="noopener noreferrer" className={sourceLinkClass}>
              NASA FIRMS · Active fire data<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <Activity className="hidden h-12 w-12 shrink-0 text-radar sm:block" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
