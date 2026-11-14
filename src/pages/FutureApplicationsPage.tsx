import { Activity, ArrowRight, CloudRain, Droplets, ExternalLink, Flame, Leaf, Mountain, Tractor } from 'lucide-react';
import AppLink from '@/components/AppLink';
import Card from '@/components/Card';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';

const applications = [
  {
    icon: Leaf,
    title: 'Forest disturbance and recovery',
    text: 'NASA identifies above-ground biomass, disturbance, and recovery as NISAR ecosystem measurements. Repeat, compatible radar observations can help map where canopy structure changes and follow recovery. Identifying the cause—fire, logging, storm, or another process—requires independent evidence.',
    sources: [
      { label: 'NASA ecosystem science', href: 'https://science.nasa.gov/mission/nisar/ecosystem/' },
      { label: 'NASA mission requirements', href: 'https://science.nasa.gov/mission/nisar/mission-requirements/' },
    ],
  },
  {
    icon: Tractor,
    title: 'Crops and soil moisture',
    text: 'NASA’s NISAR measurement objectives include seasonal cropland area. Radar-derived soil-moisture information can add field-scale context for crop growth and irrigation planning; local crop calendars, weather, and ground observations remain important for decisions.',
    sources: [
      { label: 'NASA mission requirements', href: 'https://science.nasa.gov/mission/nisar/mission-requirements/' },
      { label: 'NASA soil-moisture applications paper', href: 'https://nisar.jpl.nasa.gov/system/documents/files/15_NISARApplications_SoilMoisture1.pdf' },
    ],
  },
  {
    icon: CloudRain,
    title: 'Flooding and water resources',
    text: 'SAR can help map surface water, including flooding beneath some vegetation canopies. Repeated radar measurements can also support studies of groundwater-related land subsidence. These are separate analyses that use suitable geocoded products and time series.',
    sources: [
      { label: 'NASA NISAR water science', href: 'https://nisar.jpl.nasa.gov/science/water/' },
      { label: 'NASA NISAR applications overview', href: 'https://nisar.jpl.nasa.gov/applications/overview/' },
    ],
  },
  {
    icon: Mountain,
    title: 'Ground motion and hazards',
    text: 'Interferometric SAR (InSAR) compares the phase of aligned radar acquisitions to measure surface displacement. This supports analysis of earthquakes, volcanoes, landslides, and subsidence; a browse-image brightness comparison is not an InSAR measurement.',
    sources: [
      { label: 'NASA guide to SAR interferometry', href: 'https://nisar.jpl.nasa.gov/mission/get-to-know-sar/interferometry/' },
      { label: 'NASA mission requirements', href: 'https://science.nasa.gov/mission/nisar/mission-requirements/' },
    ],
  },
];

const datasets = [
  {
    title: 'NISAR GCOV',
    description: 'Geocoded, radiometrically terrain-corrected backscatter measurements for the available polarization channels. Use the product data and metadata for analysis; browse PNGs are quicklooks.',
    href: 'https://nisar-docs.asf.alaska.edu/gcov/',
    linkLabel: 'Product guide and access',
  },
  {
    title: 'NASA FIRMS active-fire detections',
    description: 'VIIRS and MODIS thermal-anomaly detections for time-and-location context. A detection is not a fire perimeter or burned-area measurement; NASA advises using standard science-quality data for scientific analysis.',
    href: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
    linkLabel: 'Dataset details and downloads',
  },
  {
    title: 'MODIS MCD64A1 burned area',
    description: 'A monthly global burned-area product with burn-date and quality layers at 500 m. Its spatial scale and quality flags should be considered when checking a smaller study footprint.',
    href: 'https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/',
    linkLabel: 'NASA product page',
  },
  {
    title: 'OPERA DIST-ALERT-HLS',
    description: 'NASA’s land-surface disturbance alert product uses Harmonized Landsat and Sentinel-2 observations. It can provide independent optical disturbance context, but a disturbance alert alone does not identify fire as the cause.',
    href: 'https://www.earthdata.nasa.gov/data/catalog/lpcloud-opera-l3-dist-alert-hls-v1-1',
    linkLabel: 'NASA Earthdata catalog',
  },
];

const sourceLinkClass = 'mt-5 inline-flex items-center gap-2 text-xs font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:text-navy';

export default function FutureApplicationsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-20">
        <p className="eyebrow">Beyond this case study / Applications</p>
        <PageIntro title="Where repeat radar observations can help">
          <p>
            NASA’s published NISAR science requirements and application material describe uses in ecosystems,
            agriculture, water, and hazard monitoring. The examples below summarize those documented applications;
            they are not results calculated from this project’s two browse previews.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20" aria-label="Documented radar applications">
        <div className="grid gap-4 lg:grid-cols-2">
          {applications.map((application, index) => (
            <Reveal key={application.title} delayMs={index * 70} className="h-full">
              <Card className="flex h-full flex-col" interactive>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><application.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-6 text-2xl">{application.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{application.text}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-navy/10 pt-4">
                  {application.sources.map((source) => (
                    <a key={source.label} href={source.href} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:text-navy">
                      {source.label}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20" aria-labelledby="examples-heading">
        <div className="surface-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-3xl">
            <p className="eyebrow">NASA application references</p>
            <h2 id="examples-heading" className="mt-2 text-2xl">See the mission use cases behind these ideas.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">StoryMaps show examples such as wildfires, floods, and subsidence. The application white papers explain the science and societal questions. Use them to scope a follow-up question; they do not report a result from this project’s footprint.</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <a href="https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:text-navy">NISAR StoryMaps <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            <a href="https://nisar.jpl.nasa.gov/applications/societal-benefit/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:text-navy">Applications white papers <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="data-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">Public products for a fire or disturbance follow-up</p>
          <h2 id="data-heading" className="mt-3 max-w-3xl">Use complementary data for different questions.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/70">
            These are existing NASA products and documentation for a future analysis. This project has not processed
            the burned-area or disturbance products below, and no new measurements are presented here.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {datasets.map((dataset) => (
              <Card key={dataset.title} className="h-full">
                <h3>{dataset.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{dataset.description}</p>
                <a href={dataset.href} target="_blank" rel="noopener noreferrer" className={sourceLinkClass}>
                  {dataset.linkLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-3xl">
            <p className="eyebrow text-radar">Evidence before attribution</p>
            <h2 className="mt-3 text-white">Radar tells one part of the story.</h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              A defensible fire-impact assessment would combine compatible calibrated radar observations with an
              independently mapped burned-area or disturbance product, optical imagery where usable, and local or field
              evidence. Active-fire detections add timing context; they do not measure burned area or prove what caused
              a radar change.
            </p>
          </div>
          <div className="hidden items-center gap-3 text-radar md:flex" aria-hidden="true">
            <Flame className="h-8 w-8" />
            <Activity className="h-8 w-8" />
            <Droplets className="h-8 w-8" />
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
          <AppLink to="/sources" className="inline-flex items-center gap-2 text-sm font-semibold text-radar hover:text-white">Explore this project’s sources and method <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
        </div>
      </section>
    </>
  );
}
