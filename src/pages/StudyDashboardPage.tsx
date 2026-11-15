import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Layers3, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import MadhyaPradeshMapCanvas, { type ClusterSummary, type DistrictProperties, type MapDetection, type MapFeature } from '@/components/maps/MadhyaPradeshMapCanvas';
import { fetchViirsHistory, type ViirsHistoryRecord } from '@/lib/viirsHistory';

interface Collection<P extends Record<string, unknown> = Record<string, unknown>> { type: 'FeatureCollection'; features: MapFeature<P>[] }
interface DataState { state: MapFeature; districts: MapFeature<DistrictProperties>[]; detections: MapDetection[]; footprint: MapFeature | null }
interface DetectionProps extends Record<string, unknown> { date: string; time: string; confidence: string; frp: number | null; daynight: string; district: string; satellite?: string; source?: string }

const VIIRS_FIRST_DAY = '2012-01-20';
const NISAR_FIRST_DAY = '2025-10-28';
const DAY_MS = 86_400_000;
const today = new Date().toISOString().slice(0, 10);
const MAX_DAY = today < VIIRS_FIRST_DAY ? VIIRS_FIRST_DAY : today;
const dayCount = Math.round((Date.parse(`${MAX_DAY}T00:00:00Z`) - Date.parse(`${VIIRS_FIRST_DAY}T00:00:00Z`)) / DAY_MS);

async function load<P extends Record<string, unknown>>(url: string): Promise<Collection<P>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Map data request failed (${response.status}).`);
  return response.json() as Promise<Collection<P>>;
}
function dayAt(index: number) { return new Date(Date.parse(`${VIIRS_FIRST_DAY}T00:00:00Z`) + index * DAY_MS).toISOString().slice(0, 10); }
function dateIndex(date: string) { return Math.max(0, Math.min(dayCount, Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${VIIRS_FIRST_DAY}T00:00:00Z`)) / DAY_MS))); }
function formatDate(date: string) { return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function insideRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function insideState(lon: number, lat: number, feature: MapFeature): boolean {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates as unknown[];
  return (polygons as number[][][][]).some((rings) => rings.length > 0 && insideRing(lon, lat, rings[0]) && !rings.slice(1).some((ring) => insideRing(lon, lat, ring)));
}

function districtForPoint(lon: number, lat: number, districts: MapFeature<DistrictProperties>[]): string {
  return districts.find((district) => insideState(lon, lat, district))?.properties.name ?? '';
}

function historyToMapDetections(records: ViirsHistoryRecord[], state: MapFeature, districts: MapFeature<DistrictProperties>[]): MapDetection[] {
  return records.flatMap((record, index) => {
    if (!insideState(record.lon, record.lat, state)) return [];
    return [{
      type: 'Feature' as const,
      id: `${record.satellite ?? 'VIIRS'}-${record.date}-${record.time}-${record.lat}-${record.lon}-${index}`,
      geometry: { type: 'Point' as const, coordinates: [record.lon, record.lat] },
      properties: {
        date: record.date,
        time: record.time,
        confidence: record.conf,
        frp: record.frp,
        daynight: record.daynight ?? '',
        district: districtForPoint(record.lon, record.lat, districts),
        satellite: record.satellite ?? 'VIIRS platform not reported',
        source: record.source ?? 'NASA FIRMS historical archive',
      },
    }];
  });
}

export default function StudyDashboardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [error, setError] = useState('');
  const [historicalDetections, setHistoricalDetections] = useState<MapDetection[]>([]);
  const [historyState, setHistoryState] = useState<{ date: string; status: string; message: string }>({ date: '', status: 'loading', message: '' });
  const [selectedDate, setSelectedDate] = useState(MAX_DAY);
  const [imageryLayer, setImageryLayer] = useState<'nisar-daily' | 'nisar-12day' | 'sentinel1'>('nisar-12day');
  const [showDetections, setShowDetections] = useState(true);
  const [showOpticalContext, setShowOpticalContext] = useState(false);
  const [showFootprint, setShowFootprint] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDetection, setSelectedDetection] = useState<MapDetection | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterSummary | null>(null);
  const [zoom, setZoom] = useState(1);
  const [resetViewKey, setResetViewKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      load('/data/madhya-pradesh-boundary.geojson'),
      load<DistrictProperties>('/data/madhya-pradesh-districts.geojson'),
      load<DetectionProps>('/data/madhya-pradesh-firms.geojson'),
      load('/data/project-footprint.geojson'),
    ]).then(([state, districts, firms, footprint]) => {
      if (!cancelled) {
        const boundary = state.features[0];
        const inState = (firms.features as MapDetection[]).filter((item) => {
          const [lon, lat] = item.geometry.coordinates as [number, number];
          return insideState(lon, lat, boundary);
        });
        setData({ state: boundary, districts: districts.features, detections: inState, footprint: footprint.features[0] ?? null });
      }
    }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Map data could not be loaded.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!data) return;
    const controller = new AbortController();
    setHistoryState({ date: selectedDate, status: 'loading', message: '' });

    const timeoutId = window.setTimeout(() => {
      void fetchViirsHistory(selectedDate, controller.signal)
        .then((response) => {
          if (controller.signal.aborted) return;
          setHistoricalDetections(historyToMapDetections(response.records, data.state, data.districts));
          setHistoryState({ date: selectedDate, status: response.status, message: response.message });
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setHistoricalDetections([]);
          setHistoryState({ date: selectedDate, status: 'unavailable', message: reason instanceof Error ? reason.message : 'Historical VIIRS records could not be loaded.' });
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [data, selectedDate]);

  useEffect(() => {
    if (selectedDate < NISAR_FIRST_DAY && imageryLayer !== 'sentinel1') {
      setImageryLayer('sentinel1');
      setShowOpticalContext(false);
    }
  }, [imageryLayer, selectedDate]);

  const firmsCovered = selectedDate >= VIIRS_FIRST_DAY && selectedDate <= MAX_DAY;
  const snapshotBounds = useMemo(() => {
    const dates = (data?.detections ?? []).map((item) => item.properties.date).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
    return { first: dates[0] ?? '', last: dates[dates.length - 1] ?? '' };
  }, [data]);
  const snapshotCovered = Boolean(snapshotBounds.first && selectedDate >= snapshotBounds.first && selectedDate <= snapshotBounds.last);
  const historyReady = historyState.date === selectedDate && (historyState.status === 'available' || historyState.status === 'partial');
  const showNisarDaily = imageryLayer === 'nisar-daily';
  const showNisar12Day = imageryLayer === 'nisar-12day';
  const showSentinel1 = imageryLayer === 'sentinel1';
  const showOptical = false;
  const dayDetections = useMemo(() => {
    if (!showDetections || !firmsCovered) return [];
    if (historyReady) return historicalDetections;
    if (!snapshotCovered) return [];
    return (data?.detections ?? []).filter((item) => item.properties.date === selectedDate);
  }, [data, firmsCovered, historicalDetections, historyReady, selectedDate, showDetections, snapshotCovered]);
  const countsByDistrict = useMemo(() => {
    const counts = new Map<string, number>();
    dayDetections.forEach((item) => { const district = item.properties.district; if (district) counts.set(district, (counts.get(district) ?? 0) + 1); });
    return counts;
  }, [dayDetections]);
  const districtNames = useMemo(() => (data?.districts ?? []).map((item) => item.properties.name).sort((a, b) => a.localeCompare(b)), [data]);
  const visibleDetections = useMemo(() => dayDetections.filter((item) => selectedDistrict === 'all' || item.properties.district === selectedDistrict), [dayDetections, selectedDistrict]);
  const index = dateIndex(selectedDate);

  const toggle = (active: boolean, setter: (value: boolean) => void, label: string) => (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-2 text-sm font-semibold text-ink">
      <input type="checkbox" checked={active} onChange={(event) => setter(event.currentTarget.checked)} className="accent-radar" />{label}
    </label>
  );

  return <>
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 md:pb-10 md:pt-16">
        <p className="eyebrow text-radar">Satellite evidence · Madhya Pradesh</p>
        <h1 className="mt-3 max-w-4xl text-white">Explore the map, one day at a time.</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">Choose a date, pick what you want to see, then tap a dot or district to learn more. The map combines satellite images with heat signals reported from space.</p>
      </div>
    </section>

    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 md:py-8">
      <section className="surface-card mb-5 p-5 sm:p-6" aria-labelledby="timeline-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Step 1 · Choose a date</p><h2 id="timeline-heading" className="mt-2 text-xl">Showing {formatDate(selectedDate)}</h2></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/10 px-3 py-2 text-xs font-semibold text-radar"><CalendarDays className="h-4 w-4" />{formatDate(VIIRS_FIRST_DAY)} – today</span>
        </div>
        <label className="mt-5 block">
          <span className="sr-only">Select observation date</span>
          <input type="range" min="0" max={dayCount} value={index} onChange={(event) => { setSelectedDate(dayAt(Number(event.currentTarget.value))); setSelectedDetection(null); setSelectedCluster(null); }} className="w-full accent-radar" aria-label={`Observation date, ${formatDate(selectedDate)}`} />
        </label>
        <div className="mt-1 flex justify-between text-[11px] text-subtle"><span>{formatDate(VIIRS_FIRST_DAY)}</span><span>Selected: {formatDate(selectedDate)}</span><span>{formatDate(MAX_DAY)}</span></div>
        <p className="mt-3 text-xs leading-relaxed text-muted">Drag the slider to change the date. The map and any available satellite layers update together. Some layers have no image for some dates.</p>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[21rem_minmax(0,1fr)] 2xl:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="surface-card p-5 sm:p-6" aria-labelledby="layers-heading">
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-radar/10 text-radar"><Layers3 className="h-4 w-4" /></span><div><p className="eyebrow">Step 2 · Choose what to see</p><h2 id="layers-heading" className="mt-1 text-lg">Map layers</h2></div></div>
            <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Choose the satellite image layer">
          {([
                ['nisar-daily', 'Radar image · daily (NISAR)'],
                ['nisar-12day', 'Radar image · 12-day view (NISAR)'],
                ['sentinel1', 'Radar image · Sentinel-1'],
              ] as const).map(([value, label]) => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${imageryLayer === value ? 'border-radar/30 bg-radar/10 text-radar' : 'border-line bg-canvas/70 text-ink'}`}><input type="radio" name="imagery-layer" value={value} checked={imageryLayer === value} disabled={value !== 'sentinel1' && selectedDate < NISAR_FIRST_DAY} onChange={() => { setImageryLayer(value); setShowOpticalContext(false); }} className="accent-radar disabled:cursor-not-allowed" />{label}</label>)}
              {selectedDate < NISAR_FIRST_DAY && <p className="rounded-lg border border-amber/25 bg-amber/5 p-3 text-xs leading-relaxed text-muted">NISAR browse imagery starts on 28 Oct 2025. For this earlier date, the map uses Sentinel‑1 instead.</p>}
              {toggle(showOpticalContext, setShowOpticalContext, 'Show satellite photo background')}
              {toggle(showDetections, setShowDetections, 'Show heat-signal dots')}
              {toggle(showFootprint, setShowFootprint, 'Show study-area outline')}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-subtle">Daily views show one day. The 12-day view uses nearby observations and may show more of the area.</p>
            <p className="mt-3 rounded-lg border border-line bg-canvas/60 p-3 text-xs leading-relaxed text-muted">Radar images show patterns on the ground. Dots mark satellite heat signals. A dot is not proof of a fire or how much land burned.</p>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-muted"><span>Optional · Filter to one district</span><select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink"><option value="all">All districts</option>{districtNames.map((name) => <option key={name}>{name}</option>)}</select></label>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Heat signals</p><strong className="mt-1 block text-xl text-ember">{firmsCovered ? historyReady || snapshotCovered ? visibleDetections.length.toLocaleString() : historyState.status === 'loading' ? 'Loading…' : '—' : '—'}</strong><p className="text-[10px] text-muted">{historyReady ? historyState.status === 'partial' ? 'some sources unavailable' : 'on this date' : snapshotCovered ? 'from saved records' : historyState.status === 'loading' ? 'checking this date' : 'not available'}</p></div><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Image layer</p><strong className="mt-1 block text-sm text-radar">{imageryLayer === 'nisar-daily' ? 'NISAR · daily' : imageryLayer === 'nisar-12day' ? 'NISAR · 12-day' : 'Sentinel-1'}</strong><p className="text-[10px] text-muted">where available</p></div></div>
          </section>
          <section className="surface-card p-5" aria-live="polite"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-radar"/><h2 className="text-base">Step 3 · Tap the map</h2></div>
            {selectedDetection ? <p className="mt-3 text-sm leading-relaxed text-muted">A satellite spotted this heat signal on {selectedDetection.properties.date} at {selectedDetection.properties.time} UTC. Reported confidence: {selectedDetection.properties.confidence || 'not available'}. Estimated heat output: {selectedDetection.properties.frp ?? 'not available'} megawatts. District: {selectedDetection.properties.district || 'not available'}.</p> : selectedCluster ? <p className="mt-3 text-sm leading-relaxed text-muted">This circle groups {selectedCluster.count} nearby heat signals, recorded between {selectedCluster.firstDate} and {selectedCluster.lastDate}. A group is not a count of separate fires.</p> : <p className="mt-3 text-sm leading-relaxed text-muted">Tap a dot or district to see its details. Larger circles group nearby signals together.</p>}
          </section>
        </aside>

        <section className="surface-card overflow-hidden p-3 sm:p-4" aria-labelledby="map-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:px-2"><div><p className="eyebrow">Interactive study map</p><h2 id="map-heading" className="mt-1 text-xl">Madhya Pradesh · {selectedDate}</h2></div><div className="flex gap-1 overflow-hidden rounded-lg border border-line bg-canvas" aria-label={`Map zoom: ${Math.round(zoom * 100)} percent`}><button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 3} onClick={() => setZoom((value) => Math.min(3, Number((value + 0.5).toFixed(1))))} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><ZoomIn className="h-5 w-5" /></button><button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, Number((value - 0.5).toFixed(1))))} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><ZoomOut className="h-5 w-5" /></button><button type="button" aria-label="Reset map" title="Reset map view" onClick={() => { setZoom(1); setResetViewKey((v) => v + 1); setSelectedDistrict('all'); }} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10"><RotateCcw className="h-5 w-5" /></button></div></div>
          <div className="relative aspect-[1.12] min-h-[27rem] overflow-hidden rounded-xl border border-white/10 bg-[#07131d] sm:aspect-[1.38] xl:aspect-[1.2]">
            {error && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-canvas/90 p-6 text-center text-sm text-ember">{error}</div>}
            {!data && !error && <div role="status" className="absolute inset-0 z-20 grid place-items-center bg-canvas/75 text-sm text-muted">Loading Madhya Pradesh map…</div>}
            {data && <MadhyaPradeshMapCanvas state={data.state} districts={data.districts} detections={visibleDetections} footprint={data.footprint} districtCounts={countsByDistrict} selectedDistrict={selectedDistrict} selectedDetectionId={selectedDetection?.id ?? null} selectedClusterKey={selectedCluster?.key ?? null} viewMode="grouped" showFootprint={showFootprint} selectedDate={selectedDate} showNisarDaily={showNisarDaily} showNisar12Day={showNisar12Day} showSentinel1={showSentinel1} showOptical={showOptical} showOpticalContext={showOpticalContext} zoom={zoom} resetViewKey={resetViewKey} onSelectDistrict={(name) => setSelectedDistrict((current) => current === name ? 'all' : name)} onSelectDetection={(detection) => { setSelectedDetection(detection); setSelectedCluster(null); }} onSelectCluster={(cluster) => { setSelectedCluster(cluster); setSelectedDetection(null); }} />}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">Image date · {selectedDate}</span>{showDetections && firmsCovered && <span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">{visibleDetections.length} heat signals</span>}</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-1 pt-3 text-xs text-muted" aria-label="Map legend">
            <span className="font-semibold text-ink">Map key</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-white bg-[#f5a04a]"/>Heat signals; larger circles group nearby signals</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#263b46]"/>Madhya Pradesh districts</span>
            <span className="inline-flex items-center gap-2"><span className="h-0 w-5 border-t border-dashed border-radar"/>Optional study-area outline</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{showDetections && historyState.date === selectedDate && historyState.status === 'loading' ? 'Loading heat signals…' : showDetections && firmsCovered && (historyReady || snapshotCovered) ? `${visibleDetections.length.toLocaleString()} heat signals shown for this date.` : showDetections && historyState.date === selectedDate ? historyState.message || 'Heat signals are unavailable for this date.' : 'No heat signals are available for this date.'} Drag the map to move it. Use the buttons above to zoom. Empty areas mean no image is available there.</p>
        </section>
      </div>

      <section className="surface-card mt-5 p-5 sm:p-6" aria-labelledby="map-help-heading">
        <p className="eyebrow">A quick guide</p>
        <h2 id="map-help-heading" className="mt-2 text-xl">What the map can tell you</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article><h3 className="text-base">The image</h3><p className="mt-1 text-sm leading-relaxed text-muted">Radar and photo layers show different views of the land on your chosen date. Empty areas mean that image is not available there.</p></article>
          <article><h3 className="text-base">The dots</h3><p className="mt-1 text-sm leading-relaxed text-muted">Each dot marks a heat signal spotted by a satellite. It may indicate a fire, but it is not proof and does not show how much land burned.</p></article>
          <article><h3 className="text-base">The limit</h3><p className="mt-1 text-sm leading-relaxed text-muted">Seeing a heat signal and a radar pattern in the same place does not prove that the fire caused the pattern.</p></article>
        </div>
        <p className="mt-4 text-xs text-subtle">Heat signals come from NASA FIRMS. Map images come from NASA GIBS.</p>
      </section>
    </main>
  </>;
}
