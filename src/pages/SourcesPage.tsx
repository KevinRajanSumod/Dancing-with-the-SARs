import { BookOpenCheck, ExternalLink, GraduationCap, Layers3, Satellite, Waypoints } from 'lucide-react';
import AppLink from '@/components/AppLink';
import MarkdownBlocks from '@/components/MarkdownBlocks';
import PageIntro from '@/components/PageIntro';
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
        status: 'Web catalog · ASF search API is already in project code',
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
            <p className="eyebrow">NASA Space Apps resource guide</p>
            <h2 id="resource-library-heading" className="mt-2">How to use these resources in this project</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-ink/65">Most links are catalogs, documentation, tutorials, or examples. They do not need to be connected to the website as APIs.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/5 p-5 sm:p-6">
          <p className="text-sm font-semibold text-navy">API setup in this project</p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink/75">
            The code already contains an ASF Search catalog request and a NASA FIRMS request through the Supabase Edge
            Function. That does not mean the deployed app is connected: connect Bolt Cloud, make sure the project has
            its Supabase URL and public key, deploy the <code>live-earth-data</code> function, and add the private
            <code> FIRMS_MAP_KEY</code> in backend Secrets. Never put that key in browser code. ASF quicklook search
            does not need the FIRMS key. Earthdata Search, the NISAR guide, trainings, StoryMaps, white papers, and
            postcards are links for people to use; they do not require API keys.
          </p>
          <AppLink to="/forest-fire-change" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal underline underline-offset-4 hover:text-navy">
            Open Fire story to check live-feed status <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </AppLink>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {resourceGroups.map((group) => (
            <article key={group.title} className="surface-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal"><group.icon className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <h3>{group.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">{group.intro}</p>
                </div>
              </div>
              <ul className="mt-5 divide-y divide-navy/10">
                {group.resources.map((resource) => (
                  <li key={resource.title} className="py-4 first:pt-0 last:pb-0">
                    <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:text-navy">
                      {resource.title}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{resource.text}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">{resource.status}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:px-8 md:pb-28 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><BookOpenCheck className="h-4 w-4 text-teal" aria-hidden="true" /> On this page</p>
            <nav aria-label="On this page" className="mt-4">
              <ul className="space-y-1 border-l border-navy/15">
                {tocEntries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`-ml-px block border-l-2 border-transparent py-2 text-sm text-ink/65 transition-colors hover:border-teal hover:text-teal ${entry.level === 1 ? 'pl-3 font-semibold text-navy' : 'pl-6'}`}
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
            <p className="mt-2 leading-relaxed text-white/65">NASA and ISRO data are credited to their sources. This site does not imply agency endorsement.</p>
          </div>
        </aside>

        <div className="min-w-0 max-w-4xl" aria-label="Source notes">
          {blocks.length > 0 ? <MarkdownBlocks blocks={blocks} /> : <p>The source notes are empty.</p>}
          <a href="https://images.nasa.gov/details/art002e000192" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy">
            NASA Image and Video Library item <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
    </>
  );
}
