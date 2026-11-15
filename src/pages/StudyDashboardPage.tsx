import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Layers3, Satellite, Flame, ExternalLink, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import MadhyaPradeshMapCanvas, { type ClusterSummary, type DistrictProperties, type MapDetection, type MapFeature } from '@/components/maps/MadhyaPradeshMapCanvas';

interface Collection<P extends Record<string, unknown> = Record<string, unknown>> { type: 'FeatureCollection'; features: MapFeature<P>[] }
interface DataState { state: MapFeature; districts: MapFeature<DistrictProperties>[]; detections: MapDetection[]; footprint: MapFeature | null }
interface DetectionProps extends Record<string, unknown> { date: string; time: string; confidence: string; frp: number | null; daynight: string; district: string }

const NISAR_FIRST_DAY = '2025-10-29';
const FIRMS_FIRST_DAY = '2026-09-30';
const FIRMS_LAST_DAY = '2026-11-05';
const DAY_MS = 86_400_000;
const today = new Date().toISOString().slice(0, 10);
const MAX_DAY = today < NISAR_FIRST_DAY ? NISAR_FIRST_DAY : today;
const dayCount = Math.round((Date.parse(`${MAX_DAY}T00:00:00Z`) - Date.parse(`${NISAR_FIRST_DAY}T00:00:00Z`)) / DAY_MS);

async function load<P extends Record<string, unknown>>(url: string): Promise<Collection<P>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Map data request failed (${response.status}).`);
  return response.json() as Promise<Collection<P>>;
}
function dayAt(index: number) { return new Date(Date.parse(`${NISAR_FIRST_DAY}T00:00:00Z`) + index * DAY_MS).toISOString().slice(0, 10); }
function dateIndex(date: string) { return Math.max(0, Math.min(dayCount, Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${NISAR_FIRST_DAY}T00:00:00Z`)) / DAY_MS))); }
function formatDate(date: string) { return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }

export default function StudyDashboardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-11-05' <= MAX_DAY ? '2026-11-05' : MAX_DAY);
  const [imageryLayer, setImageryLayer] = useState<'nisar-daily' | 'nisar-12day' | 'sentinel1' | 'modis'>('nisar-daily');
  const [showDetections, setShowDetections] = useState(true);
  const [showFootprint, setShowFootprint] = useState(true);
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
      if (!cancelled) setData({ state: state.features[0], districts: districts.features, detections: firms.features as MapDetection[], footprint: footprint.features[0] ?? null });
    }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Map data could not be loaded.'); });
    return () => { cancelled = true; };
  }, []);

  const firmsCovered = selectedDate >= FIRMS_FIRST_DAY && selectedDate <= FIRMS_LAST_DAY;
  const showNisarDaily = imageryLayer === 'nisar-daily';
  const showNisar12Day = imageryLayer === 'nisar-12day';
  const showSentinel1 = imageryLayer === 'sentinel1';
  const showOptical = imageryLayer === 'modis';
  const dayDetections = useMemo(() => showDetections && firmsCovered ? (data?.detections ?? []).filter((item) => item.properties.date === selectedDate) : [], [data, firmsCovered, selectedDate, showDetections]);
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
        <p className="eyebrow text-radar">NISAR surface observation study · Madhya Pradesh</p>
        <h1 className="mt-3 max-w-4xl text-white">Explore the landscape through radar and time.</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">Move through the NISAR archive on one map. Add a second radar mission or other satellite views to compare what each sensor observes, then inspect the limits of each layer.</p>
      </div>
    </section>

    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 md:py-8">
      <section className="surface-card mb-5 p-5 sm:p-6" aria-labelledby="timeline-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">NISAR geocoded browse mosaics</p><h2 id="timeline-heading" className="mt-2 text-xl">One timeline · {formatDate(selectedDate)}</h2></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/10 px-3 py-2 text-xs font-semibold text-radar"><CalendarDays className="h-4 w-4" />{formatDate(NISAR_FIRST_DAY)} – today</span>
        </div>
        <label className="mt-5 block">
          <span className="sr-only">Select NISAR date</span>
          <input type="range" min="0" max={dayCount} value={index} onChange={(event) => { setSelectedDate(dayAt(Number(event.currentTarget.value))); setSelectedDetection(null); setSelectedCluster(null); }} className="w-full accent-radar" aria-label={`NISAR date, ${formatDate(selectedDate)}`} />
        </label>
        <div className="mt-1 flex justify-between text-[11px] text-subtle"><span>{formatDate(NISAR_FIRST_DAY)}</span><span>Selected: {formatDate(selectedDate)}</span><span>{formatDate(MAX_DAY)}</span></div>
        <p className="mt-3 text-xs leading-relaxed text-muted">Daily browse images are available from NASA GIBS beginning 29 October 2025. A date can have no NISAR observation; the service may return a blank image. These false-color browse mosaics are for visual interpretation, not calibrated change measurements.</p>
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
                ['modis', 'MODIS Terra true color · optical'],
              ] as const).map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${imageryLayer === value ? 'border-radar/30 bg-radar/10 text-radar' : 'border-line bg-canvas/70 text-ink'}`}><input type="radio" name="imagery-layer" value={value} checked={imageryLayer === value} onChange={() => setImageryLayer(value)} className="accent-radar" />{label}</label>)}
              {toggle(showDetections, setShowDetections, 'VIIRS thermal detections')}
              {toggle(showFootprint, setShowFootprint, 'Original NISAR study footprint')}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">NISAR, OPERA Sentinel-1 RTC, and MODIS imagery come from NASA GIBS. VIIRS dots are FIRMS detection records for 30 Sep–5 Nov 2026 only. Layer dates, radar bands, processing, and coverage differ.</p>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-muted"><span>District highlight · selected day</span><select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink"><option value="all">All districts</option>{districtNames.map((name) => <option key={name}>{name}</option>)}</select></label>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">VIIRS records</p><strong className="mt-1 block text-xl text-ember">{firmsCovered ? visibleDetections.length.toLocaleString() : '—'}</strong><p className="text-[10px] text-muted">{firmsCovered ? 'for selected day' : 'outside snapshot dates'}</p></div><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Image layer</p><strong className="mt-1 block text-sm text-radar">{imageryLayer === 'nisar-daily' ? 'NISAR daily' : imageryLayer === 'nisar-12day' ? 'NISAR 12-day' : imageryLayer === 'sentinel1' ? 'Sentinel-1 RTC' : 'MODIS true color'}</strong><p className="text-[10px] text-muted">selected visualization</p></div></div>
          </section>
          <section className="surface-card p-5" aria-live="polite"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-radar"/><h2 className="text-base">Read the map</h2></div>
            {selectedDetection ? <p className="mt-3 text-sm leading-relaxed text-muted">VIIRS record: {selectedDetection.properties.date} · {selectedDetection.properties.time} UTC · {selectedDetection.properties.confidence || 'confidence not reported'} confidence · FRP {selectedDetection.properties.frp ?? 'not reported'} MW · {selectedDetection.properties.district || 'district unavailable'}.</p> : selectedCluster ? <p className="mt-3 text-sm leading-relaxed text-muted">{selectedCluster.count} VIIRS records grouped at this location, from {selectedCluster.firstDate} to {selectedCluster.lastDate}. Group size is not a count of separate events.</p> : <p className="mt-3 text-sm leading-relaxed text-muted">Select a thermal-detection mark or district to inspect it. A thermal detection is a sensor record, not proof of a unique fire, burned area, or a cause of radar change.</p>}
          </section>
        </aside>

        <section className="surface-card overflow-hidden p-3 sm:p-4" aria-labelledby="map-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:px-2"><div><p className="eyebrow">Interactive study map</p><h2 id="map-heading" className="mt-1 text-xl">Madhya Pradesh · {selectedDate}</h2></div><div className="flex gap-1 overflow-hidden rounded-lg border border-line bg-canvas"><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><ZoomIn className="h-4 w-4" /></button><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.2).toFixed(1))))} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><ZoomOut className="h-4 w-4" /></button><button type="button" aria-label="Reset map" onClick={() => { setZoom(1); setResetViewKey((v) => v + 1); setSelectedDistrict('all'); }} className="grid h-9 w-9 place-items-center text-ink hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button></div></div>
          <div className="relative aspect-[1.12] min-h-[27rem] overflow-hidden rounded-xl border border-white/10 bg-[#07131d] sm:aspect-[1.38] xl:aspect-[1.2]">
            {error && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-canvas/90 p-6 text-center text-sm text-ember">{error}</div>}
            {!data && !error && <div role="status" className="absolute inset-0 z-20 grid place-items-center bg-canvas/75 text-sm text-muted">Loading Madhya Pradesh map…</div>}
            {data && <MadhyaPradeshMapCanvas state={data.state} districts={data.districts} detections={visibleDetections} footprint={data.footprint} districtCounts={countsByDistrict} selectedDistrict={selectedDistrict} selectedDetectionId={selectedDetection?.id ?? null} selectedClusterKey={selectedCluster?.key ?? null} viewMode="grouped" showFootprint={showFootprint} selectedDate={selectedDate} showNisarDaily={showNisarDaily} showNisar12Day={showNisar12Day} showSentinel1={showSentinel1} showOptical={showOptical} zoom={zoom} resetViewKey={resetViewKey} onSelectDistrict={(name) => setSelectedDistrict((current) => current === name ? 'all' : name)} onSelectDetection={(detection) => { setSelectedDetection(detection); setSelectedCluster(null); }} onSelectCluster={(cluster) => { setSelectedCluster(cluster); setSelectedDetection(null); }} />}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">NASA GIBS imagery · {selectedDate}</span>{showDetections && firmsCovered && <span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">{visibleDetections.length} VIIRS records</span>}</div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{firmsCovered && showDetections ? `${visibleDetections.length.toLocaleString()} FIRMS detection records are shown for this date.` : 'No FIRMS snapshot data is available for this selected date.'} Drag to pan · use controls to zoom. District shading reflects the selected date’s record count only.</p>
        </section>
      </div>

      <section className="surface-card mt-5 p-5 sm:p-6"><div className="flex items-start gap-3"><Satellite className="mt-1 h-5 w-5 shrink-0 text-radar"/><div><p className="eyebrow">How to use this as a SAR study</p><h2 className="mt-2 text-xl">Observe, compare, then ask what could explain the signal.</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><article><h3 className="text-base">1 · What radar sees</h3><p className="mt-1 text-sm leading-relaxed text-muted">NISAR’s L-band radar responds to surface structure, moisture, geometry, and vegetation. Brightness varies with acquisition and processing conditions.</p></article><article><h3 className="text-base">2 · Compare sensors carefully</h3><p className="mt-1 text-sm leading-relaxed text-muted">MODIS optical imagery and VIIRS thermal detections provide different evidence at different scales. Their overlay does not establish that one caused a radar pattern.</p></article><article><h3 className="text-base">3 · Understand the limit</h3><p className="mt-1 text-sm leading-relaxed text-muted">This timeline presents NASA GIBS visual mosaics; it does not compute calibrated backscatter change, burned area, or fire attribution.</p></article></div><div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA GIBS layer documentation <ExternalLink className="h-3 w-3"/></a><a href="https://nisar-docs.asf.alaska.edu/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NISAR product guide <ExternalLink className="h-3 w-3"/></a></div></div></div></section>
      <p className="mx-auto mt-4 max-w-5xl px-2 text-xs leading-relaxed text-subtle"><Flame className="mr-1 inline h-3.5 w-3.5 text-ember"/>VIIRS thermal detections are not burned area; one row is not necessarily one event; near-real-time values may be revised. Nothing on this map demonstrates that fire caused any radar change.</p>
    </main>
  </>;
}
