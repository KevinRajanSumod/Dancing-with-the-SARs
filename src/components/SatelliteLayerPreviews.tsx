import { useState } from 'react';
import { Check, ChevronDown, ImageOff, LoaderCircle, Satellite } from 'lucide-react';

type RadarLayer = 'nisar-daily' | 'nisar-12day' | 'sentinel1';
type PreviewStatus = 'loading' | 'loaded' | 'unavailable';

interface SatelliteLayerPreviewsProps {
  date: string;
  activeLayer: RadarLayer;
  showNaturalColor: boolean;
  onSelectLayer: (layer: RadarLayer) => void;
  onToggleNaturalColor: () => void;
}

const stateBounds = { west: 73.03175, south: 20.07379, east: 83.80923, north: 27.86861 };
const radarLayers: Array<{ value: RadarLayer; title: string; description: string; gibsLayer: string }> = [
  { value: 'nisar-daily', title: 'NISAR · one day', description: 'One date of L-band radar; gaps mean no visible observation.', gibsLayer: 'NISAR_L2_Geocoded_Polarimetric_Covariance' },
  { value: 'nisar-12day', title: 'NISAR · 12 days', description: 'Rolling view for this date and the previous 11 days.', gibsLayer: 'NISAR_L2_Geocoded_Polarimetric_Covariance_12Day' },
  { value: 'sentinel1', title: 'Sentinel-1 radar', description: 'Different satellite and radar band; coverage can differ.', gibsLayer: 'OPERA_L2_Radiometric_Terrain_Corrected_SAR_Sentinel-1' },
];

function gibsPreviewUrl(layer: string, date: string) {
  const params = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: layer,
    STYLES: '', FORMAT: 'image/png', TRANSPARENT: 'true', SRS: 'EPSG:4326',
    BBOX: `${stateBounds.west},${stateBounds.south},${stateBounds.east},${stateBounds.north}`,
    WIDTH: '640', HEIGHT: '480', TIME: date,
  });
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.toString()}`;
}

function Thumbnail({ src, title, status, onLoad, onError, blendNoData = false }: {
  src: string;
  title: string;
  status: PreviewStatus;
  onLoad: () => void;
  onError: () => void;
  blendNoData?: boolean;
}) {
  return (
    <div className="relative aspect-[1.45] overflow-hidden rounded-lg border border-white/10 bg-[#07131d]">
      {status === 'unavailable' ? (
        <div className="absolute inset-0 grid place-content-center justify-items-center gap-2 px-3 text-center text-xs text-muted">
          <ImageOff className="h-5 w-5 text-ember" aria-hidden="true" />
          <span>No image returned for this date</span>
        </div>
      ) : (
        <img src={src} alt={`${title} satellite image preview for the selected date`} loading="lazy" className="h-full w-full object-cover" style={blendNoData ? { mixBlendMode: 'lighten' } : undefined} onLoad={onLoad} onError={onError} />
      )}
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-navy/90 px-2 py-1 text-[10px] font-semibold text-white">
        {status === 'loaded' ? <Check className="h-3 w-3 text-eco" aria-hidden="true" /> : status === 'unavailable' ? <ImageOff className="h-3 w-3 text-ember" aria-hidden="true" /> : <LoaderCircle className="h-3 w-3 animate-spin text-radar" aria-hidden="true" />}
        {status === 'loaded' ? 'NASA image' : status === 'unavailable' ? 'Unavailable' : 'Loading image'}
      </span>
    </div>
  );
}

export default function SatelliteLayerPreviews({ date, activeLayer, showNaturalColor, onSelectLayer, onToggleNaturalColor }: SatelliteLayerPreviewsProps) {
  const [statuses, setStatuses] = useState<Record<string, PreviewStatus>>({});

  function updateStatus(key: string, status: PreviewStatus) {
    setStatuses((current) => current[key] === status ? current : { ...current, [key]: status });
  }

  return (
    <section className="mt-5" aria-labelledby="satellite-preview-heading">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-radar/10 text-radar"><Satellite className="h-4 w-4" aria-hidden="true" /></span>
        <div>
          <h3 id="satellite-preview-heading" className="text-sm font-bold text-ink">Compare real satellite views</h3>
          <p className="text-xs text-muted">Images below use the selected date. Select one to show it on the large map. These are visual browse layers, not before-and-after change measurements.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Satellite imagery previews for the selected date">
        {radarLayers.map((layer) => {
          const key = `${layer.value}:${date}`;
          const status = statuses[key] ?? 'loading';
          return (
            <button key={layer.value} type="button" aria-pressed={activeLayer === layer.value} onClick={() => onSelectLayer(layer.value)} className={`rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:border-radar/50 ${activeLayer === layer.value ? 'border-radar bg-radar/10 ring-1 ring-radar/30' : 'border-line bg-canvas/55'}`}>
              <Thumbnail src={gibsPreviewUrl(layer.gibsLayer, date)} title={layer.title} status={status} onLoad={() => updateStatus(key, 'loaded')} onError={() => updateStatus(key, 'unavailable')} />
              <span className="mt-2 flex items-center justify-between gap-2 px-1">
                <strong className="text-xs text-ink">{layer.title}</strong>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${activeLayer === layer.value ? 'bg-radar text-canvas' : 'bg-raised text-muted'}`}>{activeLayer === layer.value ? 'On map' : 'View'}</span>
              </span>
              <span className="mt-1 block px-1 pb-1 text-[10px] leading-relaxed text-muted">{layer.description}</span>
            </button>
          );
        })}

        <button type="button" aria-pressed={showNaturalColor} onClick={onToggleNaturalColor} className={`rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:border-radar/50 ${showNaturalColor ? 'border-radar bg-radar/10 ring-1 ring-radar/30' : 'border-line bg-canvas/55'}`}>
          {(() => {
            const key = `natural:${date}`;
            const status = statuses[key] ?? 'loading';
            return <Thumbnail src={gibsPreviewUrl('MODIS_Terra_CorrectedReflectance_TrueColor', date)} title="Natural-color background" status={status} onLoad={() => updateStatus(key, 'loaded')} onError={() => updateStatus(key, 'unavailable')} blendNoData />;
          })()}
          <span className="mt-2 flex items-center justify-between gap-2 px-1">
            <strong className="text-xs text-ink">Natural color</strong>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${showNaturalColor ? 'bg-radar text-canvas' : 'bg-raised text-muted'}`}>{showNaturalColor ? 'On map' : 'Add'}</span>
          </span>
          <span className="mt-1 block px-1 pb-1 text-[10px] leading-relaxed text-muted">Optical satellite photo for visual context; it is not radar.</span>
        </button>
      </div>
      <p className="mt-3 rounded-lg border border-line bg-canvas/45 px-3 py-2 text-[11px] leading-relaxed text-muted">MODIS burned-area maps are monthly products, so they appear under the separate MODIS layer with a month selector. Radar and optical images can have different coverage.</p>
      <details className="mt-3 rounded-xl border border-line bg-canvas/45 p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-radar focus-visible:outline focus-visible:outline-2 focus-visible:outline-radar">
          <span>Quick guide: layer differences, dark gaps, and project footprint</span>
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        </summary>
        <div className="mt-3 grid gap-3 text-xs leading-relaxed text-muted sm:grid-cols-2">
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">NISAR daily vs. 12-day</h4>
            <p className="mt-1">These NISAR layers are SAR data shown as false-color backscatter browse images—not natural-color photos or raw radar files. Daily shows one date; the 12-day layer rolls up observations from the selected date and up to the previous 11 days, so it may fill gaps. They can look similar; neither is a before/after change measurement.</p>
          </article>
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">Why Sentinel-1 looks different—or similar</h4>
            <p className="mt-1">Sentinel-1 is a separate C-band radar satellite; the NISAR layer here uses L-band radar. Both show radar backscatter, but wavelength, viewing geometry, date range, and coverage differ. Their colors are not directly comparable, and a visual difference is not a measured land change.</p>
          </article>
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">Dark stripes and missing areas</h4>
            <p className="mt-1">A black or dark wedge marks pixels with no image data for that place and date, often at an image-swath edge. It is not a fire scar or ground feature. Preview styling can blend dark gaps into the background, but cannot fill in missing observations.</p>
          </article>
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">Natural color vs. MODIS burned area</h4>
            <p className="mt-1">Natural color is an optical satellite photo used as a background; clouds or missing coverage can hide the ground. The MODIS burned-area layer is a separate monthly product. If the photo is off or unavailable, the map can show its dark base behind the burn layer.</p>
          </article>
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">Study footprint, boundaries, and heat reports</h4>
            <p className="mt-1">The project footprint is a smaller study area inside Madhya Pradesh. It clips the MODIS overlay; this map does not draw it as a separate outline. White lines are state or district borders. The footprint is not satellite coverage or a fire boundary.</p>
          </article>
          <article className="rounded-lg border border-line/80 bg-paper/60 p-3">
            <h4 className="font-semibold text-ink">Heat signals and EchoGuide</h4>
            <p className="mt-1">Colored heat signals are NASA FIRMS detections from another satellite—not confirmed fires, burn boundaries, or radar measurements. EchoGuide can search for nearby web reports when available, but cannot inspect image pixels or calculate change. This guide explains the map even when AI is unavailable.</p>
          </article>
        </div>
      </details>
    </section>
  );
}
