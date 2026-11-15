import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export type Position = [number, number];

export interface MapGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point';
  coordinates: unknown;
}

export interface MapFeature<Properties extends Record<string, unknown> = Record<string, unknown>> {
  type: 'Feature';
  id?: string | number;
  properties: Properties;
  geometry: MapGeometry;
}

export interface DistrictProperties extends Record<string, unknown> {
  name: string;
  boundaryYear: string;
  labelLongitude: number;
  labelLatitude: number;
}

export interface DetectionProperties extends Record<string, unknown> {
  date: string;
  time: string;
  confidence: string;
  frp: number | null;
  daynight: string;
  district: string;
  satellite?: string;
  source?: string;
}

export interface MapDetection extends MapFeature<DetectionProperties> {
  id: string | number;
}

export interface DistrictCount {
  name: string;
  count: number;
}

export interface ClusterSummary {
  key: string;
  count: number;
  low: number;
  nominal: number;
  high: number;
  firstDate: string;
  lastDate: string;
  longitude: number;
  latitude: number;
}

interface MadhyaPradeshMapCanvasProps {
  state: MapFeature;
  districts: MapFeature<DistrictProperties>[];
  detections: MapDetection[];
  footprint: MapFeature | null;
  districtCounts: Map<string, number>;
  selectedDistrict: string;
  selectedDetectionId: string | number | null;
  selectedClusterKey: string | null;
  viewMode: 'grouped' | 'density' | 'individual' | 'district';
  selectedDate?: string;
  showNisarDaily?: boolean;
  showNisar12Day?: boolean;
  showSentinel1?: boolean;
  showModisBurnedArea?: boolean;
  modisBurnedAreaUrl?: string;
  showOptical?: boolean;
  showOpticalContext?: boolean;
  onImageryStatus?: (kind: 'radar' | 'optical', status: 'loaded' | 'unavailable', key: string) => void;
  zoom: number;
  resetViewKey: number;
  onSelectDistrict: (name: string) => void;
  onSelectDetection: (detection: MapDetection) => void;
  onSelectCluster: (cluster: ClusterSummary) => void;
}

function isPosition(value: unknown): value is Position {
  return Array.isArray(value) && value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
}

function collectPositions(value: unknown): Position[] {
  if (!Array.isArray(value)) return [];
  if (isPosition(value)) return [[value[0], value[1]]];
  return value.flatMap(collectPositions);
}

function ringsForGeometry(geometry: MapGeometry): Position[][] {
  const coordinates = geometry.coordinates;
  const polygons = geometry.type === 'Polygon' ? [coordinates] : coordinates as unknown[];
  return (polygons as unknown[]).flatMap((polygon) => {
    if (!Array.isArray(polygon)) return [];
    return polygon.flatMap((ring) => {
      if (!Array.isArray(ring)) return [];
      return [ring.filter(isPosition)];
    });
  });
}

interface Projection {
  x: (longitude: number) => number;
  y: (latitude: number) => number;
  width: number;
  height: number;
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cosLatitude: number;
}

function createProjection(state: MapFeature, districts: MapFeature<DistrictProperties>[]): Projection {
  const positions = [
    ...collectPositions(state.geometry.coordinates),
    ...districts.flatMap((district) => collectPositions(district.geometry.coordinates)),
  ];
  const latitudes = positions.map((position) => position[1]);
  const longitudes = positions.map((position) => position[0]);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const centerLatitude = (minLatitude + maxLatitude) / 2;
  const cosLatitude = Math.cos((centerLatitude * Math.PI) / 180);
  const xValues = positions.map((position) => position[0] * cosLatitude);
  const yValues = positions.map((position) => -position[1]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const paddingX = (maxX - minX) * 0.035;
  const paddingY = (maxY - minY) * 0.035;
  return {
    x: (longitude) => longitude * cosLatitude - minX + paddingX,
    y: (latitude) => -latitude - minY + paddingY,
    width: maxX - minX + paddingX * 2,
    height: maxY - minY + paddingY * 2,
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
    minX: -paddingX,
    minY: -paddingY,
    maxX: maxX - minX + paddingX,
    maxY: maxY - minY + paddingY,
    cosLatitude,
  };
}

function pathForGeometry(geometry: MapGeometry, projection: Projection): string {
  return ringsForGeometry(geometry).map((ring) => {
    if (ring.length < 3) return '';
    const commands = ring.map(([longitude, latitude], index) => {
      const x = projection.x(longitude).toFixed(3);
      const y = projection.y(latitude).toFixed(3);
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    });
    return `${commands.join('')}Z`;
  }).join('');
}

function districtFill(count: number, maximum: number): string {
  if (count === 0 || maximum === 0) return '#122431';
  const amount = Math.sqrt(count / maximum);
  const start = [22, 63, 82];
  const end = [245, 138, 59];
  const rgb = start.map((value, index) => Math.round(value + (end[index] - value) * amount));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function densityFill(count: number, maximum: number): string {
  const intensity = Math.sqrt(count / Math.max(1, maximum));
  const low = [246, 177, 77];
  const high = [240, 77, 83];
  const [red, green, blue] = low.map((value, index) => Math.round(value + (high[index] - value) * intensity));
  return `rgb(${red}, ${green}, ${blue})`;
}

function shortDate(date: string): string {
  if (!date) return '—';
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export default function MadhyaPradeshMapCanvas({
  state,
  districts,
  detections,
  footprint,
  districtCounts,
  selectedDistrict,
  selectedDetectionId,
  selectedClusterKey,
  viewMode,
  selectedDate = new Date().toISOString().slice(0, 10),
  showNisarDaily = false,
  showNisar12Day = false,
  showSentinel1 = false,
  showModisBurnedArea = false,
  modisBurnedAreaUrl = '',
  showOptical = false,
  showOpticalContext = false,
  onImageryStatus,
  zoom,
  resetViewKey,
  onSelectDistrict,
  onSelectDetection,
  onSelectCluster,
}: MadhyaPradeshMapCanvasProps) {
  const projection = useMemo(() => createProjection(state, districts), [state, districts]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [resetViewKey]);

  const viewBox = useMemo(() => {
    const width = projection.width / zoom;
    const height = projection.height / zoom;
    const x = (projection.width - width) / 2 + pan.x;
    const y = (projection.height - height) / 2 + pan.y;
    return `${x} ${y} ${width} ${height}`;
  }, [pan, projection, zoom]);

  function beginPan(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || (event.target instanceof Element && event.target.closest('[role="button"]'))) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePan(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const viewWidth = projection.width / zoom;
    const viewHeight = projection.height / zoom;
    const baseX = (projection.width - viewWidth) / 2;
    const baseY = (projection.height - viewHeight) / 2;
    const minX = -baseX;
    const maxX = baseX;
    const minY = -baseY;
    const maxY = baseY;
    setPan({
      x: Math.min(maxX, Math.max(minX, drag.panX - ((event.clientX - drag.startX) * viewWidth) / rect.width)),
      y: Math.min(maxY, Math.max(minY, drag.panY - ((event.clientY - drag.startY) * viewHeight) / rect.height)),
    });
  }

  function endPan(event: ReactPointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const districtPaths = useMemo(() => districts.map((feature) => ({
    feature,
    path: pathForGeometry(feature.geometry, projection),
  })), [districts, projection]);
  const statePath = useMemo(() => pathForGeometry(state.geometry, projection), [state, projection]);
  const footprintPath = useMemo(
    () => footprint ? pathForGeometry(footprint.geometry, projection) : '',
    [footprint, projection],
  );
  const maxDistrictCount = Math.max(0, ...districtCounts.values());

  const imageExtent = useMemo(() => {
    const longitudePadding = (projection.maxLongitude - projection.minLongitude) * 0.16;
    const latitudePadding = (projection.maxLatitude - projection.minLatitude) * 0.16;
    return {
      minLongitude: projection.minLongitude - longitudePadding,
      maxLongitude: projection.maxLongitude + longitudePadding,
      minLatitude: projection.minLatitude - latitudePadding,
      maxLatitude: projection.maxLatitude + latitudePadding,
    };
  }, [projection]);
  const rasterBounds = useMemo(() => {
    const left = projection.x(imageExtent.minLongitude);
    const right = projection.x(imageExtent.maxLongitude);
    const top = projection.y(imageExtent.maxLatitude);
    const bottom = projection.y(imageExtent.minLatitude);
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, [imageExtent, projection]);
  const modisBounds = useMemo(() => {
    const left = projection.x(76.586);
    const right = projection.x(79.971);
    const top = projection.y(24.307);
    const bottom = projection.y(21.228);
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, [projection]);
  const gibsUrl = (layer: string, date: string, transparent = true) => {
    const params = new URLSearchParams({
      SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: layer,
      STYLES: '', FORMAT: 'image/png', TRANSPARENT: String(transparent),
      SRS: 'EPSG:4326', BBOX: `${imageExtent.minLongitude},${imageExtent.minLatitude},${imageExtent.maxLongitude},${imageExtent.maxLatitude}`,
      WIDTH: '900', HEIGHT: '700', TIME: date,
    });
    return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.toString()}`;
  };

  const clusters = useMemo(() => {
    if (viewMode === 'individual') return [];
    const cellSize = Math.max(projection.width, projection.height) / (viewMode === 'density' ? 30 : 42);
    const bins = new Map<string, { points: MapDetection[]; x: number; y: number }>();
    detections.forEach((detection) => {
      const [longitude, latitude] = detection.geometry.coordinates as Position;
      const x = projection.x(longitude);
      const y = projection.y(latitude);
      const column = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      const key = `${column}:${row}`;
      const bin = bins.get(key) ?? { points: [], x: 0, y: 0 };
      bin.points.push(detection);
      bin.x += x;
      bin.y += y;
      bins.set(key, bin);
    });
    return [...bins.entries()].map(([key, bin]) => {
      const countFor = (confidence: string) => bin.points.filter(
        (item) => item.properties.confidence.trim().toLowerCase() === confidence,
      ).length;
      const dates = bin.points.map((item) => item.properties.date).sort();
      const longitude = bin.points.reduce((sum, item) => sum + (item.geometry.coordinates as Position)[0], 0) / bin.points.length;
      const latitude = bin.points.reduce((sum, item) => sum + (item.geometry.coordinates as Position)[1], 0) / bin.points.length;
      return {
        key,
        x: bin.x / bin.points.length,
        y: bin.y / bin.points.length,
        cellX: Math.floor(bin.x / bin.points.length / cellSize) * cellSize,
        cellY: Math.floor(bin.y / bin.points.length / cellSize) * cellSize,
        cellSize,
        count: bin.points.length,
        summary: {
          key,
          count: bin.points.length,
          low: countFor('low') + countFor('l'),
          nominal: countFor('nominal') + countFor('n'),
          high: countFor('high') + countFor('h'),
          firstDate: dates[0] ?? '',
          lastDate: dates[dates.length - 1] ?? '',
          longitude,
          latitude,
        } satisfies ClusterSummary,
      };
    });
  }, [detections, projection, viewMode]);

  const gridLines = useMemo(() => {
    const longitudeStart = Math.ceil(projection.minLongitude / 2) * 2;
    const latitudeStart = Math.ceil(projection.minLatitude / 2) * 2;
    const longitudeCount = Math.max(0, Math.floor((projection.maxLongitude - longitudeStart) / 2) + 1);
    const latitudeCount = Math.max(0, Math.floor((projection.maxLatitude - latitudeStart) / 2) + 1);
    const longitudeLines = Array.from({ length: longitudeCount }, (_, index) => longitudeStart + index * 2)
      .filter((longitude) => projection.x(longitude) >= 0 && projection.x(longitude) <= projection.width)
      .map((longitude) => ({ longitude, x: projection.x(longitude) }));
    const latitudeLines = Array.from({ length: latitudeCount }, (_, index) => latitudeStart + index * 2)
      .map((latitude) => ({ latitude, y: projection.y(latitude) }));
    return { longitudeLines, latitudeLines };
  }, [projection]);

  const radius = Math.max(projection.width, projection.height) / 250;
  const maxCluster = Math.max(1, ...clusters.map((cluster) => cluster.count));

  return (
    <svg
      viewBox={viewBox}
      className={`h-full w-full touch-none ${dragRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
      role="group"
      aria-label="Interactive map of satellite heat detections in Madhya Pradesh"
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={beginPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
    >
      <defs>
        <linearGradient id="mp-map-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0c202d" />
          <stop offset="100%" stopColor="#07131d" />
        </linearGradient>
        <filter id="marker-glow" x="-200%" y="-200%" width="400%" height="400%">
          <feGaussianBlur stdDeviation={radius * 0.6} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="mp-state-clip">
          <path d={statePath} fillRule="evenodd" />
        </clipPath>
        {footprintPath && <clipPath id="mp-footprint-clip"><path d={footprintPath} fillRule="evenodd" /></clipPath>}
      </defs>
      <rect x={-projection.width} y={-projection.height} width={projection.width * 3} height={projection.height * 3} fill="url(#mp-map-bg)" />

      <g aria-hidden="true" opacity="0.28" stroke="#8ab9c8" strokeWidth={radius * 0.18} strokeDasharray={`${radius * 1.5} ${radius * 2.3}`}>
        {gridLines.longitudeLines.map((line) => <line key={`lon-${line.longitude}`} x1={line.x} x2={line.x} y1={projection.minY} y2={projection.maxY} />)}
        {gridLines.latitudeLines.map((line) => <line key={`lat-${line.latitude}`} x1={projection.minX} x2={projection.maxX} y1={line.y} y2={line.y} />)}
      </g>

      {/* Keep the land fill behind satellite imagery so it cannot wash the imagery out. */}
      <path d={statePath} fill="#263b46" fillRule="evenodd" fillOpacity="0.9" stroke="none" pointerEvents="none" />

      {showOpticalContext && <image href={gibsUrl('MODIS_Terra_CorrectedReflectance_TrueColor', selectedDate)} {...rasterBounds} preserveAspectRatio="none" opacity="1" style={{ mixBlendMode: 'lighten' }} pointerEvents="none" onLoad={() => onImageryStatus?.('optical', 'loaded', `natural:${selectedDate}`)} onError={() => onImageryStatus?.('optical', 'unavailable', `natural:${selectedDate}`)} />}
      {showOptical && <image href={gibsUrl('MODIS_Terra_CorrectedReflectance_TrueColor', selectedDate)} {...rasterBounds} preserveAspectRatio="none" opacity="0.86" style={{ mixBlendMode: 'lighten' }} pointerEvents="none" onLoad={() => onImageryStatus?.('optical', 'loaded', `natural:${selectedDate}`)} onError={() => onImageryStatus?.('optical', 'unavailable', `natural:${selectedDate}`)} />}
      {showModisBurnedArea && modisBurnedAreaUrl && <image href={modisBurnedAreaUrl} {...modisBounds} preserveAspectRatio="none" opacity="1" pointerEvents="none" clipPath={footprintPath ? 'url(#mp-footprint-clip)' : undefined} />}
      <g clipPath="url(#mp-state-clip)" pointerEvents="none">
        {showSentinel1 && <image href={gibsUrl('OPERA_L2_Radiometric_Terrain_Corrected_SAR_Sentinel-1', selectedDate)} {...rasterBounds} preserveAspectRatio="none" opacity="0.9" style={{ mixBlendMode: 'lighten' }} onLoad={() => onImageryStatus?.('radar', 'loaded', `sentinel1:${selectedDate}`)} onError={() => onImageryStatus?.('radar', 'unavailable', `sentinel1:${selectedDate}`)} />}
        {showNisar12Day && <image href={gibsUrl('NISAR_L2_Geocoded_Polarimetric_Covariance_12Day', selectedDate)} {...rasterBounds} preserveAspectRatio="none" opacity="0.9" style={{ mixBlendMode: 'lighten' }} onLoad={() => onImageryStatus?.('radar', 'loaded', `nisar-12day:${selectedDate}`)} onError={() => onImageryStatus?.('radar', 'unavailable', `nisar-12day:${selectedDate}`)} />}
        {showNisarDaily && <image href={gibsUrl('NISAR_L2_Geocoded_Polarimetric_Covariance', selectedDate)} {...rasterBounds} preserveAspectRatio="none" opacity="0.95" style={{ mixBlendMode: 'lighten' }} onLoad={() => onImageryStatus?.('radar', 'loaded', `nisar-daily:${selectedDate}`)} onError={() => onImageryStatus?.('radar', 'unavailable', `nisar-daily:${selectedDate}`)} />}
      </g>

      <g>
        {districtPaths.map(({ feature, path }) => {
          const name = feature.properties.name;
          const count = districtCounts.get(name) ?? 0;
          const selected = selectedDistrict === name;
          return (
            <path
              key={String(feature.id ?? name)}
              d={path}
              fill={districtFill(count, maxDistrictCount)}
              fillRule="evenodd"
              fillOpacity={viewMode === 'district' ? (selectedDistrict === 'all' || selected ? 0.92 : 0.42) : showOpticalContext || showNisarDaily || showNisar12Day || showSentinel1 || showOptical ? (selected ? 0.16 : 0.06) : selectedDistrict === 'all' || selected ? 0.92 : 0.42}
              stroke={selected ? '#67d9ec' : '#7c9aa7'}
              strokeWidth={selected ? radius * 1.8 : radius * 0.58}
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="button"
              aria-label={`${name}, ${count.toLocaleString('en-US')} satellite heat detections in the selected view. Select district.`}
              onClick={() => onSelectDistrict(name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectDistrict(name);
                }
              }}
              className="cursor-pointer outline-none transition-[fill,opacity,stroke] focus-visible:stroke-radar"
            >
              <title>{`${name} · ${count.toLocaleString('en-US')} heat detections`}</title>
            </path>
          );
        })}
        <path d={statePath} fill="none" stroke="#d0e4e9" strokeWidth={radius * 1.15} vectorEffect="non-scaling-stroke" pointerEvents="none" />
      </g>

      <g aria-hidden="true" fill="#afc7d0" fontSize={radius * 3.4} fontFamily="ui-monospace, monospace" opacity="0.72">
        {gridLines.longitudeLines.map((line) => (
          <text key={`lon-label-${line.longitude}`} x={line.x} y={projection.maxY + radius * 5.4} textAnchor="middle">{line.longitude}°E</text>
        ))}
        {gridLines.latitudeLines.map((line) => (
          <text key={`lat-label-${line.latitude}`} x={projection.minX + radius * 2.5} y={line.y - radius * 1.4}>{line.latitude}°N</text>
        ))}
      </g>

      {viewMode === 'density' && (
        <g clipPath="url(#mp-state-clip)" aria-label="Relative detection-record density by map cell">
          {clusters.map((cluster) => {
            const isSelected = selectedClusterKey === cluster.key;
            return (
              <rect
                key={cluster.key}
                x={cluster.cellX}
                y={cluster.cellY}
                width={cluster.cellSize}
                height={cluster.cellSize}
                fill={densityFill(cluster.count, maxCluster)}
                fillOpacity={isSelected ? 0.9 : 0.3 + 0.42 * Math.sqrt(cluster.count / maxCluster)}
                stroke={isSelected ? '#ffffff' : '#f6b14d'}
                strokeOpacity={isSelected ? 0.9 : 0.18}
                strokeWidth={isSelected ? radius * 0.9 : radius * 0.2}
                role="button"
                tabIndex={0}
                aria-label={`${cluster.count} detection records in this density grid cell. Select for summary.`}
                onClick={() => onSelectCluster(cluster.summary)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectCluster(cluster.summary);
                  }
                }}
                className="cursor-pointer outline-none focus-visible:stroke-white"
              >
                <title>{`${cluster.count} detection records in density cell · ${shortDate(cluster.summary.firstDate)} to ${shortDate(cluster.summary.lastDate)}`}</title>
              </rect>
            );
          })}
        </g>
      )}

      {viewMode === 'density' && (
        <g fill="none" pointerEvents="none" vectorEffect="non-scaling-stroke">
          {districtPaths.map(({ feature, path }) => (
            <path
              key={`density-outline-${String(feature.id ?? feature.properties.name)}`}
              d={path}
              stroke={feature.properties.name === selectedDistrict ? '#67d9ec' : '#b9cbd1'}
              strokeOpacity={feature.properties.name === selectedDistrict ? 0.95 : 0.72}
              strokeWidth={feature.properties.name === selectedDistrict ? radius * 1.35 : radius * 0.42}
            />
          ))}
          <path d={statePath} stroke="#e4f0f2" strokeWidth={radius * 1.1} />
        </g>
      )}

      {viewMode === 'grouped' ? clusters.map((cluster) => {
        const isSelected = selectedClusterKey === cluster.key;
        const markerRadius = radius * (1.35 + Math.min(2.7, Math.sqrt(cluster.count / maxCluster) * 2.7));
        const strength = 0.45 + 0.5 * (cluster.count / maxCluster);
        return (
          <circle
            key={cluster.key}
            cx={cluster.x}
            cy={cluster.y}
            r={markerRadius}
            fill={cluster.count > maxCluster * 0.58 ? '#f05d68' : '#f5a04a'}
            fillOpacity={isSelected ? 1 : strength}
            stroke={isSelected ? '#ffffff' : '#fff2db'}
            strokeWidth={radius * (isSelected ? 0.95 : 0.45)}
            role="button"
            tabIndex={0}
            aria-label={`${cluster.count} satellite heat detections grouped in this area. Select for a summary.`}
            onClick={() => onSelectCluster(cluster.summary)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectCluster(cluster.summary);
              }
            }}
            className="cursor-pointer outline-none focus-visible:stroke-radar"
            filter={isSelected ? 'url(#marker-glow)' : undefined}
          >
            <title>{`${cluster.count} detection records · ${shortDate(cluster.summary.firstDate)} to ${shortDate(cluster.summary.lastDate)}`}</title>
          </circle>
        );
      }) : viewMode === 'individual' ? detections.map((detection) => {
        const [longitude, latitude] = detection.geometry.coordinates as Position;
        const x = projection.x(longitude);
        const y = projection.y(latitude);
        const selected = detection.id === selectedDetectionId;
        return (
          <circle
            key={detection.id}
            cx={x}
            cy={y}
            r={radius * (selected ? 1.65 : 0.75)}
            fill={detection.properties.confidence.toLowerCase().startsWith('h') ? '#f05d68' : '#f6b14d'}
            fillOpacity={selected ? 1 : 0.78}
            stroke={selected ? '#ffffff' : '#ffe8c1'}
            strokeWidth={radius * 0.35}
            role="button"
            tabIndex={0}
            aria-label={`FIRMS detection, ${detection.properties.date}, ${detection.properties.time} UTC, ${detection.properties.confidence || 'confidence not reported'}. Select for details.`}
            onClick={() => onSelectDetection(detection)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectDetection(detection);
              }
            }}
            className="cursor-pointer outline-none focus-visible:stroke-radar"
            filter={selected ? 'url(#marker-glow)' : undefined}
          >
            <title>{`${detection.properties.date} ${detection.properties.time} UTC · ${detection.properties.confidence} confidence`}</title>
          </circle>
        );
      }) : null}
    </svg>
  );
}
