import { Activity, ArrowRight, CloudRain, Droplets, ExternalLink, Flame, Layers3, Leaf, Mountain, Satellite, ScanLine, Tractor, Trees, Waves } from 'lucide-react';
import AppLink from '@/components/AppLink';
import Card from '@/components/Card';
import IndependentEvidence from '@/components/IndependentEvidence';
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

const applicationIconTones = [
  'bg-eco/10 text-eco',
  'bg-date/10 text-date',
  'bg-radar/10 text-radar',
  'bg-analysis/10 text-analysis',
];

const datasets = [
  {
    icon: Satellite,
    tone: 'bg-radar/10 text-radar',
    meta: 'L-band backscatter · GCOV',
    title: 'NISAR GCOV',
    integration: 'ASF catalog + browse previews',
    description: 'Geocoded, radiometrically terrain-corrected backscatter measurements for the available polarization channels. Use the product data and metadata for analysis; browse PNGs are quicklooks.',
    href: 'https://nisar-docs.asf.alaska.edu/gcov/',
    linkLabel: 'Product guide and access',
  },
  {
    icon: Flame,
    tone: 'bg-ember/10 text-ember',
    meta: 'VIIRS / MODIS · near real time',
    title: 'NASA FIRMS active-fire detections',
    integration: 'Archive snapshot + live feed',
    description: 'VIIRS and MODIS thermal-anomaly detections for time-and-location context. A detection is not a fire perimeter or burned-area measurement; NASA advises using standard science-quality data for scientific analysis.',
    href: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
    linkLabel: 'Dataset details and downloads',
  },
  {
    icon: ScanLine,
    tone: 'bg-date/10 text-date',
    meta: '500 m · monthly burn date',
    title: 'MODIS MCD64A1 burned area',
    integration: 'Separate monthly map in Fire Story',
    description: 'A monthly global burned-area product with burn-date and quality layers at 500 m. Its spatial scale and quality flags should be considered when checking a smaller study footprint.',
    href: 'https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/',
    linkLabel: 'NASA product page',
  },
  {
    icon: Layers3,
    tone: 'bg-analysis/10 text-analysis',
    title: 'OPERA DIST-ALERT-HLS',
    integration: 'Reference only',
    meta: '30 m · optical disturbance alerts',
    description: 'NASA’s land-surface disturbance alert product uses Harmonized Landsat and Sentinel-2 observations. It can provide independent optical disturbance context, but a disturbance alert alone does not identify fire as the cause.',
    href: 'https://www.earthdata.nasa.gov/data/catalog/lpcloud-opera-l3-dist-alert-hls-v1-1',
    linkLabel: 'NASA Earthdata catalog',
  },
  {
    icon: Trees,
    tone: 'bg-eco/10 text-eco',
    meta: '1 km grid · observations from 2019–2021',
    title: 'GEDI L4B biomass density',
    integration: 'Reference only',
    description: 'ISS lidar-based estimates of mean above-ground biomass density with uncertainty layers. This is broad ecosystem context and is too coarse to confirm recent changes in a small forest patch.',
    href: 'https://data.nasa.gov/dataset/gedi-l4b-gridded-aboveground-biomass-density-version-2',
    linkLabel: 'NASA dataset details',
  },
  {
    icon: Droplets,
    tone: 'bg-radar/10 text-radar',
    meta: '~9 km native · daily values via NASA POWER',
    title: 'SMAP L4 soil moisture',
    integration: 'Daily context on Drivers',
    description: 'This app requests daily surface and root-zone moisture through NASA POWER. The underlying SMAP L4 product is native ~9 km; the values provide regional timing context, not field-scale readings.',
    href: 'https://nsidc.org/data/spl4smgp/versions/8',
    linkLabel: 'NASA data product',
  },
  {
    icon: Waves,
    tone: 'bg-radar/10 text-radar',
    meta: '30 m · surface-water classes',
    title: 'OPERA DSWx-HLS water extent',
    integration: 'Reference only',
    description: 'Maps open and partial surface water using Harmonized Landsat and Sentinel-2 optical inputs. It complements radar flood analysis, but it is not a NISAR layer.',
    href: 'https://podaac.jpl.nasa.gov/dataset/OPERA_L3_DSWX-HLS_V1',
    linkLabel: 'NASA PO.DAAC product page',
  },
  {
    icon: Mountain,
    tone: 'bg-analysis/10 text-analysis',
    meta: '1 arc-second · about 30 m elevation',
    title: 'NASA SRTM elevation',
    integration: 'Reference only',
    description: 'Global elevation data can provide terrain context and support slope calculations. Slope is a derived layer that this project has not computed.',
    href: 'https://search.earthdata.nasa.gov/search?q=SRTMGL1',
    linkLabel: 'Find SRTM in Earthdata Search',
  },
];

const sourceLinkClass = 'mt-5 inline-flex items-center gap-2 text-xs font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar';

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
                <span className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${applicationIconTones[index]}`}><application.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-6 text-2xl">{application.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{application.text}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
                  {application.sources.map((source) => (
                    <a key={source.label} href={source.href} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">
                      {source.label}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <IndependentEvidence />

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20" aria-labelledby="examples-heading">
        <div className="surface-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-3xl">
            <p className="eyebrow">NASA application references</p>
            <h2 id="examples-heading" className="mt-2 text-2xl">See the mission use cases behind these ideas.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">StoryMaps show examples such as wildfires, floods, and subsidence. The application white papers explain the science and societal questions. Use them to scope a follow-up question; they do not report a result from this project’s footprint.</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <a href="https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">NISAR StoryMaps <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            <a href="https://nisar.jpl.nasa.gov/applications/societal-benefit/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">Applications white papers <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>
        </div>
      </section>

      <section className="bg-raised py-16 md:py-20" aria-labelledby="data-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">NASA data products / Ecosystems, water and hazards</p>
          <h2 id="data-heading" className="mt-3 max-w-3xl">Bring the right evidence to each application.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            These NASA products now have clearly labeled roles in the app: ASF/NISAR browse metadata, FIRMS detections, SMAP moisture context, and a separate MCD64A1 monthly map. The remaining products are research references only. Product context is not a measured NISAR change result.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {datasets.map((dataset) => (
              <Card key={dataset.title} className="h-full !p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl border border-white/10 ${dataset.tone}`}><dataset.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.08em] ${dataset.integration === 'Reference only' ? 'border-white/10 bg-white/[.03] text-subtle' : 'border-radar/20 bg-radar/10 text-radar'}`}>{dataset.integration}</span>
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.12em] text-ember">{dataset.meta}</p>
                <h3 className="mt-2">{dataset.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{dataset.description}</p>
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
            <p className="mt-4 text-base leading-relaxed text-muted">
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
