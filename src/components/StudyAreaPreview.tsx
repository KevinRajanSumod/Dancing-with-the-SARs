import { useEffect, useState } from 'react';

type Position = [number, number];
type FeatureCollection = {
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: Position[][][];
    };
  }>;
};

function projectState(coordinates: Position[][][]): string {
  const points = coordinates.flat(2);
  if (points.length === 0) return '';

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const width = maxLongitude - minLongitude || 1;
  const height = maxLatitude - minLatitude || 1;
  const inset = 22;
  const svgWidth = 400;
  const svgHeight = 300;
  const scale = Math.min((svgWidth - inset * 2) / width, (svgHeight - inset * 2) / height);
  const drawnWidth = width * scale;
  const drawnHeight = height * scale;
  const offsetX = (svgWidth - drawnWidth) / 2;
  const offsetY = (svgHeight - drawnHeight) / 2;

  return coordinates.map((polygon) => polygon.map((ring) => {
    const commands = ring.map(([longitude, latitude], index) => {
      const x = offsetX + (longitude - minLongitude) * scale;
      const y = svgHeight - offsetY - (latitude - minLatitude) * scale;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `${commands.join(' ')} Z`;
  }).join(' ')).join(' ');
}

export default function StudyAreaPreview() {
  const [outline, setOutline] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/madhya-pradesh-boundary.geojson', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Study-area boundary is unavailable.');
        return response.json() as Promise<FeatureCollection>;
      })
      .then((collection) => {
        const geometry = collection.features?.[0]?.geometry;
        if (geometry?.type === 'MultiPolygon' && geometry.coordinates) {
          setOutline(projectState(geometry.coordinates));
        }
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
        <title id="study-preview-title">Madhya Pradesh study area outline</title>
        <desc id="study-preview-desc">A stylized preview using the project’s state boundary. Satellite coverage and detections are not shown here.</desc>
        <defs>
          <linearGradient id="state-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67d9ec" stopOpacity=".25" />
            <stop offset="1" stopColor="#67d9ec" stopOpacity=".04" />
          </linearGradient>
          <filter id="state-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={outline} fill="url(#state-fill)" fillRule="evenodd" stroke="#67d9ec" strokeWidth="1.6" vectorEffect="non-scaling-stroke" filter="url(#state-glow)" />
        <path d={outline} fill="none" fillRule="evenodd" stroke="#c4f5fa" strokeOpacity=".4" strokeWidth=".55" vectorEffect="non-scaling-stroke" strokeDasharray="2 4" />
        <g aria-hidden="true" fill="none" stroke="#ffb84d" strokeOpacity=".62">
          <circle cx="200" cy="148" r="38" strokeDasharray="3 5" />
          <circle cx="200" cy="148" r="64" strokeOpacity=".26" />
        </g>
        <circle cx="200" cy="148" r="3" fill="#ffb84d" aria-hidden="true" />
      </svg>

      <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1 pt-3 text-[10px] text-white/75">
        <span>Boundary: project study area</span>
        <span>Coverage varies by sensor and date</span>
      </div>
      <p className="relative mt-2 text-[10px] leading-relaxed text-white/60">Preview only · no detections or measurements are plotted. Open the map for dated satellite layers.</p>
    </div>
  );
}
