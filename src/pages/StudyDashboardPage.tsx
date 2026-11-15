import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Layers3, Satellite, Flame, ExternalLink, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import MadhyaPradeshMapCanvas, { type ClusterSummary, type DistrictProperties, type MapDetection, type MapFeature } from '@/components/maps/MadhyaPradeshMapCanvas';
import { fetchViirsHistory, type ViirsHistoryRecord } from '@/lib/viirsHistory';

interface Collection<P extends Record<string, unknown> = Record<string, unknown>> { type: 'FeatureCollection'; features: MapFeature<P>[] }
interface DataState { state: MapFeature; districts: MapFeature<DistrictProperties>[]; detections: MapDetection[]; footprint: MapFeature | null }
interface DetectionProps extends Record<string, unknown> { date: string; time: string; confidence: string; frp: number | null; daynight: string; district: string; satellite?: string; source?: string }

const VIIRS_FIRST_DAY = '2012-01-20';
const NISAR_FIRST_DAY = '2025-10-29';
const SNAPSHOT_FIRST_DAY = '2026-09-30';
const SNAPSHOT_LAST_DAY = '2026-11-05';
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
  const [selectedDate, setSelectedDate] = useState('2026-11-05' <= MAX_DAY ? '2026-11-05' : MAX_DAY);
  const [imageryLayer, setImageryLayer] = useState<'nisar-daily' | 'nisar-12day' | 'sentinel1'>('nisar-12day');
  const [showDetections, setShowDetections] = useState(true);
  const [showOpticalContext, setShowOpticalContext] = useState(true);
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
      load<DetectionProps>('/data/madhya-pradesh-firms-2026.geojson'),
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

  const firmsCovered = selectedDate >= VIIRS_FIRST_DAY && selectedDate <= MAX_DAY;
  const snapshotCovered = selectedDate >= SNAPSHOT_FIRST_DAY && selectedDate <= SNAPSHOT_LAST_DAY;
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
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-2 text-xs font-semibold text-ink">
      <input type="checkbox" checked={active} onChange={(event) => setter(event.currentTarget.checked)} className="accent-radar" />{label}
    </label>
  );

  return <>
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 md:pb-10 md:pt-16">
        <p className="eyebrow text-radar">Satellite evidence · Madhya Pradesh</p>
        <h1 className="mt-3 max-w-4xl text-white">Explore the landscape through radar and time.</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">Move through one timeline, explore VIIRS records from the full available archive, and compare radar or optical views on dates when those sensors have observations.</p>
      </div>
    </section>

    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 md:py-8">
      <section className="surface-card mb-5 p-5 sm:p-6" aria-labelledby="timeline-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">VIIRS detections · radar and optical layers by date</p><h2 id="timeline-heading" className="mt-2 text-xl">One timeline · {formatDate(selectedDate)}</h2></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/10 px-3 py-2 text-xs font-semibold text-radar"><CalendarDays className="h-4 w-4" />{formatDate(VIIRS_FIRST_DAY)} – today</span>
        </div>
        <label className="mt-5 block">
          <span className="sr-only">Select observation date</span>
          <input type="range" min="0" max={dayCount} value={index} onChange={(event) => { setSelectedDate(dayAt(Number(event.currentTarget.value))); setSelectedDetection(null); setSelectedCluster(null); }} className="w-full accent-radar" aria-label={`Observation date, ${formatDate(selectedDate)}`} />
        </label>
        <div className="mt-1 flex justify-between text-[11px] text-subtle"><span>{formatDate(VIIRS_FIRST_DAY)}</span><span>Selected: {formatDate(selectedDate)}</span><span>{formatDate(MAX_DAY)}</span></div>
        <p className="mt-3 text-xs leading-relaxed text-muted">VIIRS history begins in 2012. NISAR browse imagery begins {formatDate(NISAR_FIRST_DAY)}. Recent FIRMS records may be revised.</p>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="surface-card p-5" aria-labelledby="layers-heading">
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-radar/10 text-radar"><Layers3 className="h-4 w-4" /></span><div><p className="eyebrow">Map layers</p><h2 id="layers-heading" className="mt-1 text-lg">Compare observations</h2></div></div>
            <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Choose the satellite image layer">
          {([
                ['nisar-daily', 'NISAR daily browse · L-band'],
                ['nisar-12day', 'NISAR 12-day mosaic · L-band'],
                ['sentinel1', 'Sentinel-1 RTC radar · OPERA'],
              ] as const).map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${imageryLayer === value ? 'border-radar/30 bg-radar/10 text-radar' : 'border-line bg-canvas/70 text-ink'}`}><input type="radio" name="imagery-layer" value={value} checked={imageryLayer === value} onChange={() => setImageryLayer(value)} className="accent-radar" />{label}</label>)}
              {toggle(showOpticalContext, setShowOpticalContext, 'MODIS true-color statewide background')}
              {toggle(showDetections, setShowDetections, 'VIIRS thermal detections')}
              {toggle(showFootprint, setShowFootprint, 'Original NISAR study footprint')}
            </div>
            <p className="mt-3 border-l-2 border-radar/70 pl-3 text-xs leading-relaxed text-ink">NISAR, OPERA Sentinel-1 RTC, and MODIS imagery come from NASA GIBS. VIIRS dots are FIRMS detections; the supplied snapshot covers 30 Sep–5 Nov 2026, and archive records are requested by date. Layer dates, radar bands, processing, and coverage differ.</p>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-muted"><span>District highlight · selected day</span><select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink"><option value="all">All districts</option>{districtNames.map((name) => <option key={name}>{name}</option>)}</select></label>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">VIIRS records</p><strong className="mt-1 block text-xl text-ember">{firmsCovered ? historyReady || snapshotCovered ? visibleDetections.length.toLocaleString() : historyState.status === 'loading' ? 'Loading…' : '—' : '—'}</strong><p className="text-[10px] text-muted">{historyReady ? historyState.status === 'partial' ? 'some sources unavailable' : 'for selected day' : snapshotCovered ? 'supplied snapshot fallback' : historyState.status === 'loading' ? 'selected day' : 'not available'}</p></div><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Radar overlay</p><strong className="mt-1 block text-sm text-radar">{imageryLayer === 'nisar-daily' ? 'NISAR daily' : imageryLayer === 'nisar-12day' ? 'NISAR 12-day' : 'Sentinel-1 RTC'}</strong><p className="text-[10px] text-muted">where observations exist</p></div></div>
          </section>
          <section className="surface-card p-5" aria-live="polite"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-radar"/><h2 className="text-base">Read the map</h2></div>
            {selectedDetection ? <p className="mt-3 text-sm leading-relaxed text-muted">{selectedDetection.properties.date} · {selectedDetection.properties.time} UTC · {selectedDetection.properties.confidence || 'confidence not reported'} confidence · FRP {selectedDetection.properties.frp ?? 'not reported'} MW · {selectedDetection.properties.district || 'district unavailable'}.</p> : selectedCluster ? <p className="mt-3 text-sm leading-relaxed text-muted">{selectedCluster.count} VIIRS records · {selectedCluster.firstDate} to {selectedCluster.lastDate}. A group is not a count of separate events.</p> : <p className="mt-3 text-sm leading-relaxed text-muted">Select a dot or district to inspect its records.</p>}
          </section>
        </aside>

        <section className="surface-card overflow-hidden p-3 sm:p-4" aria-labelledby="map-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:px-2"><div><p className="eyebrow">Interactive study map</p><h2 id="map-heading" className="mt-1 text-xl">Madhya Pradesh · {selectedDate}</h2></div><div className="flex gap-1 overflow-hidden rounded-lg border border-line bg-canvas"><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><ZoomIn className="h-4 w-4" /></button><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.2).toFixed(1))))} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><ZoomOut className="h-4 w-4" /></button><button type="button" aria-label="Reset map" onClick={() => { setZoom(1); setResetViewKey((v) => v + 1); setSelectedDistrict('all'); }} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button></div></div>
          <div className="relative aspect-[1.12] min-h-[27rem] overflow-hidden rounded-xl border border-white/10 bg-[#07131d] sm:aspect-[1.38] xl:aspect-[1.2]">
            {error && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-canvas/90 p-6 text-center text-sm text-ember">{error}</div>}
            {!data && !error && <div role="status" className="absolute inset-0 z-20 grid place-items-center bg-canvas/75 text-sm text-muted">Loading Madhya Pradesh map…</div>}
            {data && <MadhyaPradeshMapCanvas state={data.state} districts={data.districts} detections={visibleDetections} footprint={data.footprint} districtCounts={countsByDistrict} selectedDistrict={selectedDistrict} selectedDetectionId={selectedDetection?.id ?? null} selectedClusterKey={selectedCluster?.key ?? null} viewMode="grouped" showFootprint={showFootprint} selectedDate={selectedDate} showNisarDaily={showNisarDaily} showNisar12Day={showNisar12Day} showSentinel1={showSentinel1} showOptical={showOptical} showOpticalContext={showOpticalContext} zoom={zoom} resetViewKey={resetViewKey} onSelectDistrict={(name) => setSelectedDistrict((current) => current === name ? 'all' : name)} onSelectDetection={(detection) => { setSelectedDetection(detection); setSelectedCluster(null); }} onSelectCluster={(cluster) => { setSelectedCluster(cluster); setSelectedDetection(null); }} />}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">NASA GIBS imagery · {selectedDate}</span>{showDetections && firmsCovered && <span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">{visibleDetections.length} VIIRS records</span>}</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-1 pt-3 text-xs text-muted" aria-label="Map legend">
            <span className="font-semibold text-ink">Map key</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-white bg-[#f5a04a]"/>VIIRS thermal-detection records; circle size/color indicate grouped record counts, not severity</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#263b46]"/>Madhya Pradesh districts</span>
            <span className="inline-flex items-center gap-2"><span className="h-0 w-5 border-t border-dashed border-radar"/>Optional study-footprint outline</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{showDetections && historyState.date === selectedDate && historyState.status === 'loading' ? 'Loading FIRMS records…' : showDetections && firmsCovered && (historyReady || snapshotCovered) ? `${visibleDetections.length.toLocaleString()} detection records for this date.` : showDetections && historyState.date === selectedDate ? historyState.message || 'FIRMS records are unavailable for this date.' : 'No detection records for this date.'} Drag to pan · use controls to zoom. Blank map areas mean that layer has no image coverage here.</p>
        </section>
      </div>

      <section className="surface-card mt-5 p-5 sm:p-6"><div className="flex items-start gap-3"><Satellite className="mt-1 h-5 w-5 shrink-0 text-radar"/><div><p className="eyebrow">How to use this as a SAR study</p><h2 className="mt-2 text-xl">Observe, compare, then ask what could explain the signal.</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><article><h3 className="text-base">1 · What radar sees</h3><p className="mt-1 text-sm leading-relaxed text-muted">NISAR’s L-band radar responds to surface structure, moisture, geometry, and vegetation. Brightness varies with acquisition and processing conditions.</p></article><article><h3 className="text-base">2 · Compare sensors carefully</h3><p className="mt-1 text-sm leading-relaxed text-muted">MODIS optical imagery and VIIRS thermal detections provide different evidence at different scales. Their overlay does not establish that one caused a radar pattern.</p></article><article><h3 className="text-base">3 · Understand the limit</h3><p className="mt-1 text-sm leading-relaxed text-muted">This timeline presents NASA GIBS visual mosaics; it does not compute calibrated backscatter change, burned area, or fire attribution.</p></article></div><div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA GIBS layer documentation <ExternalLink className="h-3 w-3"/></a><a href="https://nisar-docs.asf.alaska.edu/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NISAR product guide <ExternalLink className="h-3 w-3"/></a></div></div></div></section>
      <p className="mx-auto mt-4 max-w-5xl px-2 text-xs leading-relaxed text-subtle"><Flame className="mr-1 inline h-3.5 w-3.5 text-ember"/>Thermal detections are not burned area or confirmed fires; one record may not equal one event. Recent values can change, and the map does not show that fire caused radar changes.</p>
    </main>
  </>;
}
