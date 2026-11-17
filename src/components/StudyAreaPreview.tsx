import { useEffect, useState } from 'react';

type Position = [number, number];
type Geometry = { type?: string; coordinates?: unknown };
type BoundaryCollection = { features?: Array<{ geometry?: Geometry }> };
type Bounds = { minLongitude: number; maxLongitude: number; minLatitude: number; maxLatitude: number };

function positionRings(geometry: Geometry): Position[][] {
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates)) return [];
  if (geometry.type === 'Polygon') return coordinates as Position[][];
  if (geometry.type === 'MultiPolygon') return (coordinates as Position[][][]).flat();
  return [];
}

function projectGeometry(geometry: Geometry, bounds: Bounds): string {
  const svgWidth = 400;
  const svgHeight = 300;
  const inset = 24;
  const width = bounds.maxLongitude - bounds.minLongitude || 1;
  const height = bounds.maxLatitude - bounds.minLatitude || 1;
  const scale = Math.min((svgWidth - inset * 2) / width, (svgHeight - inset * 2) / height);
  const offsetX = (svgWidth - width * scale) / 2;
  const offsetY = (svgHeight - height * scale) / 2;

  return positionRings(geometry).map((ring) => {
    if (ring.length < 3) return '';
    const commands = ring.map(([longitude, latitude], index) => {
      const x = offsetX + (longitude - bounds.minLongitude) * scale;
      const y = svgHeight - offsetY - (latitude - bounds.minLatitude) * scale;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `${commands.join(' ')}Z`;
  }).join(' ');
}

export default function StudyAreaPreview() {
  const [outline, setOutline] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/data/madhya-pradesh-boundary.geojson', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('State boundary is unavailable.');
        return await response.json() as BoundaryCollection;
      })
      .then((collection) => {
        const shape = collection.features?.[0]?.geometry;
        if (!shape) return;
        const points = positionRings(shape).flat();
        if (!points.length) return;
        const bounds = {
          minLongitude: Math.min(...points.map(([longitude]) => longitude)),
          maxLongitude: Math.max(...points.map(([longitude]) => longitude)),
          minLatitude: Math.min(...points.map(([, latitude]) => latitude)),
          maxLatitude: Math.max(...points.map(([, latitude]) => latitude)),
        };
        setOutline(projectGeometry(shape, bounds));
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setOutline('');
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081b28] p-3 shadow-[0_30px_90px_rgba(0,0,0,.32)] sm:p-4">
      <div className="absolute inset-0 mission-grid opacity-40" aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-1 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-radar">Study map preview</p>
          <p className="mt-1 text-sm font-semibold text-white">Madhya Pradesh · full state outline</p>
        </div>
        <span className="rounded-full border border-radar/20 bg-radar/10 px-2.5 py-1 text-[10px] font-semibold text-radar">Illustrative view</span>
      </div>

      <svg viewBox="0 0 400 300" role="img" aria-labelledby="study-preview-title study-preview-desc" className="relative mt-2 h-auto w-full">
        <title id="study-preview-title">Illustrative outline of Madhya Pradesh</title>
        <desc id="study-preview-desc">The state boundary is shown with decorative radar rings for visual context. The rings are not a satellite footprint, and no detections or measurements are plotted.</desc>
        <defs>
          <linearGradient id="state-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67d9ec" stopOpacity=".25" />
            <stop offset="1" stopColor="#67d9ec" stopOpacity=".04" />
          </linearGradient>
          <filter id="state-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {outline && <>
          <path d={outline} fill="url(#state-fill)" fillRule="evenodd" />
          <circle cx="200" cy="150" r="54" fill="none" stroke="#f5ad4e" strokeOpacity=".3" strokeWidth="1.2" />
          <circle cx="200" cy="150" r="34" fill="none" stroke="#f5ad4e" strokeDasharray="2 5" strokeLinecap="round" strokeOpacity=".9" strokeWidth="1.2" />
          <circle cx="200" cy="150" r="3" fill="#ffb84f" />
          <path d={outline} fill="none" stroke="#55d5e9" strokeOpacity=".7" strokeWidth="4" filter="url(#state-glow)" />
          <path d={outline} fill="none" stroke="#77e0ef" strokeWidth="1.5" />
        </>}
      </svg>

      <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1 pt-3 text-[10px] text-white/75">
        <span>Boundary: Madhya Pradesh state</span>
        <span>Coverage varies by sensor and date</span>
      </div>
      <p className="relative mt-2 text-[10px] leading-relaxed text-white/60">Illustrative preview · no detections or measurements are plotted. Open the map for dated satellite layers.</p>
    </div>
  );
}
