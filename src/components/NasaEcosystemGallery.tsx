import { ExternalLink } from 'lucide-react';

const imageExamples = [
  {
    title: 'Forest River, North Dakota',
    description: 'NISAR L-band radar shows forests, wetlands, and nearby farmland.',
    src: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA26615.jpg',
    alt: 'False-color NISAR radar image of forests and wetlands along North Dakota’s Forest River, with agricultural fields around it.',
    href: 'https://www.jpl.nasa.gov/images/pia26615-nasa-isro-radar-satellite-captures-first-image-of-north-dakota-wetlands-farmlands/',
    credit: 'NASA/JPL-Caltech · NISAR',
  },
  {
    title: 'Flooded Amazon forest, Peru',
    description: 'NASA UAVSAR shows floodwater beneath a tropical forest canopy.',
    src: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26112/PIA26112.jpg',
    alt: 'False-color airborne radar image of flooded vegetation and waterways in the Peruvian Amazon.',
    href: 'https://science.nasa.gov/photojournal/radar-image-of-amazonian-flooding-similar-to-future-nisar-imagery/',
    credit: 'NASA/JPL-Caltech · UAVSAR',
  },
  {
    title: 'Mount Desert Island, Maine',
    description: 'NISAR L-band radar distinguishes forest, water, and built surfaces.',
    src: 'https://images-assets.nasa.gov/image/PIA26616/PIA26616~large.jpg',
    alt: 'NISAR false-color radar image of Mount Desert Island, Maine, with forest, water, and built surfaces in different colors.',
    href: 'https://science.nasa.gov/photojournal/nasa-isro-radar-satellite-captures-first-image-of-mount-desert-island/',
    credit: 'NASA/JPL-Caltech · NISAR',
  },
];

const videos = [
  {
    title: 'NISAR: Watching Earth move',
    note: 'NASA/JPL mission overview · radar and changing land surfaces',
    videoId: 'wwfvKO9LUnA',
  },
  {
    title: 'From space to soil',
    note: 'NASA Goddard · GEDI lidar and forest biomass; a complementary sensor, not SAR',
    videoId: 'PN_ESIcQFpM',
  },
];

export default function NasaEcosystemGallery() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24" aria-labelledby="nasa-ecosystem-heading">
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow text-signal">NASA ecosystem media</p>
        <h2 id="nasa-ecosystem-heading" className="mt-2">See how satellites observe living landscapes.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">These NASA examples come from other regions. They explain the sensors; they are not Madhya Pradesh data or findings from this study.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {imageExamples.map((image) => (
          <article key={image.title} className="surface-card lift overflow-hidden">
            <a href={image.href} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Open NASA source for ${image.title}`}>
              <div className="relative aspect-[1.55] overflow-hidden bg-[#07131d]">
                <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full bg-[#07131d] object-contain" />
                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-navy/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-signal">NASA data example</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg">{image.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{image.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-radar underline underline-offset-4">{image.credit}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></span>
              </div>
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {videos.map((video) => (
          <article key={video.videoId} className="surface-card overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#061522]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="px-2 pb-2 pt-4"><h3 className="text-lg">{video.title}</h3><p className="mt-1 text-xs leading-relaxed text-muted">{video.note}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
