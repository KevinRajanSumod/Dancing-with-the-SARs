import { BookOpenCheck, CloudRain, Droplets, ExternalLink, Flame, GraduationCap, Layers3, Satellite, Waypoints } from 'lucide-react';
import AppLink from '@/components/AppLink';
import MarkdownBlocks from '@/components/MarkdownBlocks';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';
import sourcesText from '@/data/sources.md?raw';
import { parseMarkdown, toPlainText, type Block } from '@/lib/markdown';

const blocks: Block[] = parseMarkdown(sourcesText);

const tocEntries = blocks.flatMap((block) =>
  block.type === 'heading' && block.level <= 2 ? [{ id: block.id, text: toPlainText(block.text), level: block.level }] : [],
);

const resourceGroups = [
  {
    icon: Satellite,
    title: 'Find and access Earth data',
    intro: 'Use these to discover actual scenes and science products for a follow-up analysis.',
    resources: [
      {
        title: 'NASA Earthdata Search',
        href: 'https://search.earthdata.nasa.gov/search',
        text: 'Search NASA’s Earth science collections by place, date, and mission. Look for NISAR L2 GCOV, then inspect the collection and product metadata before downloading.',
        status: 'Web search · Earthdata Login may be needed for downloads',
      },
      {
        title: 'ASF Vertex',
        href: 'https://search.asf.alaska.edu/',
        text: 'Search NISAR scenes by track and frame, then filter for GCOV and compare acquisition, orbit, polarization, and processing information. Download the science product for analysis; a browse image is only a quicklook.',
        status: 'Used in Fire Story live mode · scene metadata and quicklooks only',
      },
      {
        title: 'NISAR Data User Guide',
        href: 'https://nisar-docs.asf.alaska.edu/',
        text: 'Use the GCOV and access sections to understand product layers, names, polarization, processing IDs, file formats, and tools before comparing scenes.',
        status: 'Documentation · no API connection needed',
      },
    ],
  },
  {
    icon: GraduationCap,
    title: 'Learn the method',
    intro: 'Build enough remote-sensing context to interpret products and plan a defensible workflow.',
    resources: [
      {
        title: 'Intro to Remote Sensing',
        href: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing',
        text: 'Review sensors, spatial and temporal resolution, processing, and the difference between observations and derived products.',
        status: 'Learning guide',
      },
      {
        title: 'Intro to Synthetic Aperture Radar',
        href: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar',
        text: 'Use this for wavelength, polarization, scattering, and geometry basics. It is especially useful alongside the Drivers tab.',
        status: 'Learning guide',
      },
      {
        title: 'NASA ARSET Trainings',
        href: 'https://appliedsciences.nasa.gov/get-involved/training',
        text: 'Find structured beginner and advanced training in SAR, disasters, ecosystems, agriculture, and water. Use a training workflow to guide a later analysis; do not treat course examples as measurements from this study area.',
        status: 'Training · course registration may be required',
      },
    ],
  },
  {
    icon: Layers3,
    title: 'Explore applications and examples',
    intro: 'Use NASA examples to choose an application question and learn what evidence it takes to answer it.',
    resources: [
      {
        title: 'NISAR StoryMaps',
        href: 'https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/',
        text: 'Explore worked examples for floods, wildfires, subsidence, oil slicks, and glacier motion. The StoryMaps support the Applications tab as examples, not as project data.',
        status: 'Examples · no API connection needed',
      },
      {
        title: 'NISAR Applications White Papers',
        href: 'https://nisar.jpl.nasa.gov/applications/societal-benefit/',
        text: 'Use the short papers to connect radar observations to an application, stakeholder need, and appropriate independent evidence.',
        status: 'Background reading',
      },
      {
        title: 'UAVSAR Postcards',
        href: 'https://uavsar.jpl.nasa.gov/education/postcards.html',
        text: 'Study labeled airborne radar composites to learn how polarization and interferometry can reveal landscape patterns. UAVSAR is an airborne instrument, so these images are examples, not NISAR scenes.',
        status: 'Illustrated examples',
      },
    ],
  },
  {
    icon: Waypoints,
    title: 'Compare partner-agency SAR resources',
    intro: 'These are separate missions and archives. Use them for method practice or a clearly labeled cross-sensor study, not as interchangeable NISAR observations.',
    resources: [
      {
        title: 'RADARSAT Constellation Mission data',
        href: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
        text: 'Explore Canadian SAR data for maritime, disaster, and ecosystem applications. Use its own acquisition and product metadata when comparing it with another mission.',
        status: 'Partner mission data',
      },
      {
        title: 'CSA SAR Python and QGIS tutorial',
        href: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial',
        text: 'Follow the practical notebook/tutorial workflow for opening and visualizing SAR products. Adapt processing ideas only after checking that the NISAR product format and calibration are supported.',
        status: 'Tutorial · source code on GitHub',
      },
      {
        title: 'RADARSAT-1 data',
        href: 'https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1',
        text: 'Use this historical archive for SAR practice or retrospective comparisons where coverage and acquisition dates fit the question.',
        status: 'Partner mission archive',
      },
      {
        title: 'CONAE SAOCOM catalogue',
        href: 'https://catalogos.conae.gov.ar/catalogo/catalogoSatSaocomInfo.html',
        text: 'Browse SAOCOM archive coverage and thumbnails. The archive is for Argentine territory; downloading or processing requires registration and applicable permissions, so it is not a data source for this central India footprint.',
        status: 'Coverage and access restrictions apply',
      },
      {
        title: 'SAOCOM access information',
        href: 'https://www.argentina.gob.ar/noticias/la-informacion-saocom-cada-vez-mas-accesible',
        text: 'Check CONAE’s access and registration information before planning to use SAOCOM products.',
        status: 'Partner-agency information',
      },
    ],
  },
];

const resourceIconTones = ['bg-radar/10 text-radar', 'bg-analysis/10 text-analysis', 'bg-eco/10 text-eco', 'bg-date/10 text-date'];

const evidenceWorkflow = [
  {
    icon: Satellite,
    step: '01 / Inputs',
    title: 'Radar and thermal records',
    tone: 'bg-radar/10 text-radar',
    text: 'The archive pairs two NISAR L-band browse previews with a NASA FIRMS VIIRS NOAA-21 detection snapshot. These are separate observations, not a spatially matched result.',
    links: [
      { label: 'ASF Vertex', href: 'https://search.asf.alaska.edu/' },
      { label: 'NASA FIRMS', href: 'https://firms.modaps.eosdis.nasa.gov/active_fire/' },
    ],
  },
  {
    icon: Layers3,
    step: '02 / Preparation',
    title: 'A visual archive workflow',
    tone: 'bg-eco/10 text-eco',
    text: 'The supplied browse previews were georeferenced in QGIS and displayed as grayscale overlays. FIRMS points were filtered by acquisition date and the project footprint; the previews are not calibrated measurements.',
    links: [
      { label: 'NISAR Data User Guide', href: 'https://nisar-docs.asf.alaska.edu/' },
    ],
  },
  {
    icon: BookOpenCheck,
    step: '03 / Follow-up',
    title: 'Separate context and follow-up evidence',
    tone: 'bg-analysis/10 text-analysis',
    text: 'The Fire Story now offers a separate monthly NASA MODIS MCD64A1 burned-area layer. It is not overlaid on the NISAR browse previews or FIRMS points, and this project does not calculate pixel overlap, quantify radar change, or infer fire cause. Compatible calibrated radar products and independent local evidence are still needed for a change assessment.',
    links: [
      { label: 'MODIS burned area', href: 'https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/' },
      { label: 'OPERA disturbance alerts', href: 'https://www.earthdata.nasa.gov/data/catalog/lpcloud-opera-l3-dist-alert-hls-v1-1' },
    ],
  },
];

export default function SourcesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-9 pt-14 sm:px-8 md:pb-12 md:pt-20">
        <p className="eyebrow">Documentation / Evidence record</p>
        <PageIntro title="Sources, data and method">
          <p>
            Find the NASA and partner-agency tools behind this project, see where each fits in a follow-up, and review
            the scene record, FIRMS snapshot, study footprint and interpretation limits. Use the copy controls beside
            references to cite them in your own notes.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20" aria-labelledby="resource-library-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Reference library / further learning</p>
            <h2 id="resource-library-heading" className="mt-2">Catalogs, guides, and examples</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted">The links below help you find data or understand methods. They are references for people to use; they are not all connected to this site as data feeds.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-radar/20 bg-raised/80 p-5 sm:p-6">
          <p className="eyebrow">Implemented data connections</p>
          <h3 className="mt-2 text-xl">What this website actually fetches and displays</h3>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">These are implemented data connections. Live services can occasionally be unavailable; archive images and records remain clearly identified as supplied snapshots.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Satellite, title: 'ASF Search · NISAR', text: 'Fire Story live mode requests NISAR GCOV catalog metadata and displays ASF quicklooks when the catalog provides them. It does not download or analyze full science rasters.' },
              { icon: Flame, title: 'NASA FIRMS · active-fire detections', text: 'Fire Story live mode requests the latest five-day NOAA-21 VIIRS records. The archive view uses its supplied historical snapshot; thermal detections are not burned area.' },
              { icon: CloudRain, title: 'NASA POWER · weather context', text: 'Daily precipitation and air-temperature context is fetched for Home, Drivers, and Applications for the study window.' },
              { icon: Droplets, title: 'NASA POWER · SMAP L4 moisture', text: 'Drivers fetches daily SMAP L4 surface and root-zone moisture through POWER’s Hydrology endpoint for a nearby regional grid point.' },
              { icon: Layers3, title: 'NASA MODIS MCD64A1 · burned area', text: 'Fire Story can request a monthly 500 m burned-area map through a protected server connection. It appears as a separate image, never painted over NISAR or FIRMS.' },
              { icon: BookOpenCheck, title: 'Supplied archive materials', text: 'The two NISAR browse previews and the 30 Sep–5 Nov FIRMS record are supplied project materials. Their visual contrast has not been quantified as a change result.' },
            ].map((item) => (
              <article key={item.title} className="rounded-xl border border-line bg-canvas/65 p-4">
                <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-radar/20 bg-radar/10 text-radar"><item.icon className="h-4 w-4" aria-hidden="true" /></span><div><h4 className="text-sm font-semibold text-ink">{item.title}</h4><p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p></div></div>
              </article>
            ))}
          </div>
          <AppLink to="/forest-fire-change" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-radar underline underline-offset-4 hover:text-radar">
            Open Fire Story <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </AppLink>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {resourceGroups.map((group, index) => (
            <Reveal key={group.title} delayMs={index * 70} className="h-full">
              <article className="surface-card h-full p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 ${resourceIconTones[index]}`}><group.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h3>{group.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{group.intro}</p>
                  </div>
                </div>
                <ul className="mt-5 divide-y divide-navy/10">
                  {group.resources.map((resource) => (
                    <li key={resource.title} className="py-4 first:pt-0 last:pb-0">
                      <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-radar underline decoration-teal/30 underline-offset-4 hover:text-radar">
                        {resource.title}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{resource.text}</p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">{resource.status}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20" aria-labelledby="evidence-workflow-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">Resource trail / This project</p>
            <h2 id="evidence-workflow-heading" className="mt-2">From source data to responsible follow-up</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">A quick map of what enters this story, how the archive is presented, and what evidence a future analysis would need.</p>
          </div>
        </div>

        <ol className="mt-6 grid gap-4 lg:grid-cols-3">
          {evidenceWorkflow.map((step) => (
            <li key={step.step} className="list-none">
              <Reveal className="h-full">
                <article className="surface-card h-full p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${step.tone}`}>
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{step.step}</span>
                  </div>
                  <h3 className="mt-5">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.text}</p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
                    {step.links.map((link) => (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-radar underline decoration-radar/30 underline-offset-4 hover:text-white">
                        {link.label}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:px-8 md:pb-28 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink"><BookOpenCheck className="h-4 w-4 text-radar" aria-hidden="true" /> On this page</p>
            <nav aria-label="On this page" className="mt-4">
              <ul className="space-y-1 border-l border-line">
                {tocEntries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`-ml-px block border-l-2 border-transparent py-2 text-sm text-muted transition-colors hover:border-radar hover:text-radar ${entry.level === 1 ? 'pl-3 font-semibold text-ink' : 'pl-6'}`}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-4 rounded-2xl bg-navy p-5 text-sm text-white">
            <p className="font-semibold">Independent project</p>
            <p className="mt-2 leading-relaxed text-muted">NASA and ISRO data are credited to their sources. This site does not imply agency endorsement.</p>
          </div>
        </aside>

        <div className="min-w-0 max-w-4xl" aria-label="Source notes">
          {blocks.length > 0 ? <MarkdownBlocks blocks={blocks} /> : <p>The source notes are empty.</p>}
          <a href="https://svs.gsfc.nasa.gov/11474" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-radar hover:text-radar">
            NASA Earth Illuminated image and video details <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
    </>
  );
}
