import { useState } from 'react';
import { Check, ImageOff, LoaderCircle, Satellite } from 'lucide-react';

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
  { value: 'nisar-daily', title: 'NISAR · one day', description: 'A single-date L-band radar browse image.', gibsLayer: 'NISAR_L2_Geocoded_Polarimetric_Covariance' },
  { value: 'nisar-12day', title: 'NISAR · 12 days', description: 'Rolling view for this date and the previous 11 days.', gibsLayer: 'NISAR_L2_Geocoded_Polarimetric_Covariance_12Day' },
  { value: 'sentinel1', title: 'Sentinel-1 radar', description: 'A separate C-band radar source; coverage can differ.', gibsLayer: 'OPERA_L2_Radiometric_Terrain_Corrected_SAR_Sentinel-1' },
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
          <p className="text-xs text-muted">Images below use the selected date. Select one to show it on the large map.</p>
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
    </section>
  );
}
