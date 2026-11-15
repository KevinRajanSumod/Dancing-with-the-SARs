import { useEffect, useState } from 'react';

type Position = [number, number];
type Geometry = { type?: string; coordinates?: unknown };
type FeatureCollection = {
  features?: Array<{
    properties?: { name?: string; date?: string; district?: string };
    geometry?: Geometry;
  }>;
};

function positionRings(geometry: Geometry): Position[][] {
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates)) return [];
  if (geometry.type === 'Polygon') return coordinates as Position[][];
  if (geometry.type === 'MultiPolygon') return (coordinates as Position[][][]).flat();
  return [];
}

function projectGeometry(geometry: Geometry, bounds: { minX: number; maxX: number; minY: number; maxY: number }): string {
  const inset = 22;
  const svgWidth = 400;
  const svgHeight = 300;
  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxY - bounds.minY || 1;
  const scale = Math.min((svgWidth - inset * 2) / width, (svgHeight - inset * 2) / height);
  const offsetX = (svgWidth - width * scale) / 2;
  const offsetY = (svgHeight - height * scale) / 2;

  return positionRings(geometry).map((ring) => {
    const commands = ring.map(([longitude, latitude], index) => {
      const clampedLatitude = Math.max(-85, Math.min(85, latitude)) * Math.PI / 180;
      const mercatorY = Math.log(Math.tan(Math.PI / 4 + clampedLatitude / 2));
      const x = offsetX + (longitude - bounds.minX) * scale;
      const y = svgHeight - offsetY - (mercatorY - bounds.minY) * scale;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `${commands.join(' ')} Z`;
  }).join(' ');
}

export default function StudyAreaPreview() {
  const [outline, setOutline] = useState('');
  const [districtPaths, setDistrictPaths] = useState<Array<{ name: string; path: string; count: number }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch('/data/madhya-pradesh-boundary.geojson', { signal: controller.signal }),
      fetch('/data/madhya-pradesh-districts.geojson', { signal: controller.signal }),
      fetch('/data/madhya-pradesh-firms.geojson', { signal: controller.signal }),
    ])
      .then(async ([boundaryResponse, districtsResponse, detectionsResponse]) => {
        if (!boundaryResponse.ok || !districtsResponse.ok || !detectionsResponse.ok) throw new Error('Study map preview data is unavailable.');
        return await Promise.all([boundaryResponse.json(), districtsResponse.json(), detectionsResponse.json()]) as FeatureCollection[];
      })
      .then(([boundary, districts, detections]) => {
        const shape = boundary.features?.[0]?.geometry;
        const boundaryRings = shape ? positionRings(shape) : [];
        const districtFeatures = districts.features ?? [];
        const allPositions = [...boundaryRings, ...districtFeatures.flatMap((feature) => feature.geometry ? positionRings(feature.geometry) : [])].flat();
        const projected = allPositions.map(([longitude, latitude]) => {
          const clampedLatitude = Math.max(-85, Math.min(85, latitude)) * Math.PI / 180;
          return [longitude, Math.log(Math.tan(Math.PI / 4 + clampedLatitude / 2))] as const;
        });
        const bounds = projected.length ? {
          minX: Math.min(...projected.map(([x]) => x)),
          maxX: Math.max(...projected.map(([x]) => x)),
          minY: Math.min(...projected.map(([, y]) => y)),
          maxY: Math.max(...projected.map(([, y]) => y)),
        } : null;
        if (shape && bounds) setOutline(projectGeometry(shape, bounds));
        const countByDistrict = new Map<string, number>();
        detections.features?.forEach((feature) => {
          const name = feature.properties?.district;
          if (name) countByDistrict.set(name, (countByDistrict.get(name) ?? 0) + 1);
        });
        const features = districtFeatures.flatMap((feature) => {
          const geometry = feature.geometry;
          if (!geometry?.coordinates || !feature.properties?.name) return [];
          if (!bounds) return [];
          return [{ name: feature.properties.name, path: projectGeometry(geometry, bounds), count: countByDistrict.get(feature.properties.name) ?? 0 }];
        });
        setDistrictPaths(features);
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
          <p className="mt-1 text-sm font-semibold text-white">Madhya Pradesh · district heat-detection map</p>
        </div>
        <span className="rounded-full border border-radar/20 bg-radar/10 px-2.5 py-1 text-[10px] font-semibold text-radar">Study data</span>
      </div>

      <svg viewBox="0 0 400 300" role="img" aria-labelledby="study-preview-title study-preview-desc" className="relative mt-2 h-auto w-full">
        <title id="study-preview-title">Madhya Pradesh heat detections by district</title>
        <desc id="study-preview-desc">A correctly proportioned map of Madhya Pradesh, with district shapes aligned to one shared geographic scale and shaded by satellite heat-detection counts.</desc>
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
        {districtPaths.map(({ name, path, count }) => {
          const intensity = Math.sqrt(count / Math.max(1, ...districtPaths.map((district) => district.count)));
          const low = [22, 63, 82];
          const high = [245, 138, 59];
          const color = `rgb(${low.map((value, index) => Math.round(value + (high[index] - value) * intensity)).join(',')})`;
          return <path key={name} d={path} fill={count ? color : '#122431'} fillOpacity=".92" stroke="#a9c3ce" strokeOpacity=".65" strokeWidth=".65" vectorEffect="non-scaling-stroke"><title>{`${name}: ${count.toLocaleString('en-US')} heat detections`}</title></path>;
        })}
        <path d={outline} fill="none" stroke="#d0e4e9" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1 pt-3 text-[10px] text-white/75">
        <span>District color = fewer to more detections</span>
        <span>4,701 detections · 35 dates</span>
      </div>
      <p className="relative mt-2 text-[10px] leading-relaxed text-white/60">Counts show possible heat detections, not confirmed fires. Open the map to explore dates and imagery.</p>
    </div>
  );
}
