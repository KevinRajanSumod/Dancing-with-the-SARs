import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Layers3, Info, ZoomIn, ZoomOut, RotateCcw, Activity } from 'lucide-react';
import MadhyaPradeshMapCanvas, { type ClusterSummary, type DistrictProperties, type MapDetection, type MapFeature } from '@/components/maps/MadhyaPradeshMapCanvas';
import StudyFindingsSummary from '@/components/maps/StudyFindingsSummary';
import DetectionResearchCard from '@/components/maps/DetectionResearchCard';
import SatelliteLayerPreviews from '@/components/SatelliteLayerPreviews';
import { fetchModisBurnedAreaImage } from '@/lib/liveEarthData';

interface Collection<P extends Record<string, unknown> = Record<string, unknown>> { type: 'FeatureCollection'; features: MapFeature<P>[] }
interface DataState { state: MapFeature; districts: MapFeature<DistrictProperties>[]; detections: MapDetection[]; footprint: MapFeature | null }
interface DetectionProps extends Record<string, unknown> { date: string; time: string; confidence: string; frp: number | null; daynight: string; district: string; satellite?: string; source?: string }

async function load<P extends Record<string, unknown>>(url: string): Promise<Collection<P>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Map data request failed (${response.status}).`);
  return response.json() as Promise<Collection<P>>;
}
function formatDate(date: string) { return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function defaultModisMonth() { const date = new Date(); date.setUTCMonth(date.getUTCMonth() - 4); return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; }
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

export default function StudyDashboardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [error, setError] = useState('');
  const [mapTimeMode, setMapTimeMode] = useState<'period' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState('');
  const [imageryLayer, setImageryLayer] = useState<'nisar-daily' | 'nisar-12day' | 'sentinel1' | 'modis'>('nisar-12day');
  const [dayDetectionView, setDayDetectionView] = useState<'density' | 'district' | 'individual'>('density');
  const [showDetections, setShowDetections] = useState(true);
  const [showOpticalContext, setShowOpticalContext] = useState(false);
  const [modisMonth, setModisMonth] = useState(defaultModisMonth);
  const [modisImageUrl, setModisImageUrl] = useState('');
  const [modisLoading, setModisLoading] = useState(false);
  const [modisError, setModisError] = useState('');
  const modisImageUrlRef = useRef('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDetection, setSelectedDetection] = useState<MapDetection | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterSummary | null>(null);
  const [zoom, setZoom] = useState(1);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [imageStatuses, setImageStatuses] = useState<Record<string, 'loaded' | 'unavailable'>>({});

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
        const sortedDates = inState.map((item) => item.properties.date).filter(Boolean).sort();
        const latestDate = sortedDates[sortedDates.length - 1] ?? '';
        setSelectedDate((current) => current || latestDate);
      }
    }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Map data could not be loaded.'); });
    return () => { cancelled = true; };
  }, []);

  const snapshotDates = useMemo(() => [...new Set((data?.detections ?? []).map((item) => item.properties.date).filter(Boolean))].sort(), [data]);
  const dayRecordCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (data?.detections ?? []).forEach((item) => counts.set(item.properties.date, (counts.get(item.properties.date) ?? 0) + 1));
    return counts;
  }, [data]);
  const showNisarDaily = imageryLayer === 'nisar-daily';
  const showNisar12Day = imageryLayer === 'nisar-12day';
  const showSentinel1 = imageryLayer === 'sentinel1';
  const showModis = imageryLayer === 'modis';
  const activeRadarLabel = showModis ? 'MODIS burned area' : showNisarDaily ? 'NISAR daily' : showNisar12Day ? 'NISAR 12-day' : 'Sentinel-1';
  const activeRadarKey = `${imageryLayer}:${selectedDate}`;
  const activeRadarExplanation = showModis
    ? 'Monthly MODIS MCD64A1 burn-scar product for the project footprint. Select a month and load it below; this is separate from radar backscatter and FIRMS heat detections.'
    : showNisarDaily
    ? 'False-color NISAR GCOV browse image for this date. It visualizes SAR backscatter; gaps mean no visible observation for that day.'
    : showNisar12Day
      ? 'Rolling false-color NISAR GCOV mosaic from this date and the previous 11 days. It visualizes SAR backscatter, not a before-and-after change map.'
      : 'Multi-day false-color radar backscatter from a different satellite. Coverage can be partial, and its colors are not directly comparable to NISAR or a measured change map.';
  const radarImageStatus = imageStatuses[activeRadarKey] ?? 'loading';
  const opticalImageStatus = imageStatuses[`natural:${selectedDate}`] ?? 'loading';

  useEffect(() => () => {
    if (modisImageUrlRef.current) URL.revokeObjectURL(modisImageUrlRef.current);
  }, []);

  async function loadModisLayer() {
    setModisLoading(true);
    setModisError('');
    try {
      const blob = await fetchModisBurnedAreaImage(modisMonth);
      const nextUrl = URL.createObjectURL(blob);
      if (modisImageUrlRef.current) URL.revokeObjectURL(modisImageUrlRef.current);
      modisImageUrlRef.current = nextUrl;
      setModisImageUrl(nextUrl);
    } catch (reason) {
      setModisError(reason instanceof Error ? reason.message : 'The MODIS burned-area layer could not be loaded.');
      setModisImageUrl('');
    } finally {
      setModisLoading(false);
    }
  }
  const dayDetections = useMemo(() => {
    if (!showDetections || !selectedDate) return [];
    return (data?.detections ?? []).filter((item) => item.properties.date === selectedDate);
  }, [data, selectedDate, showDetections]);
  const mapSourceDetections = mapTimeMode === 'period' ? data?.detections ?? [] : dayDetections;
  const countsByDistrict = useMemo(() => {
    const counts = new Map<string, number>();
    mapSourceDetections.forEach((item) => { const district = item.properties.district; if (district) counts.set(district, (counts.get(district) ?? 0) + 1); });
    return counts;
  }, [mapSourceDetections]);
  const districtNames = useMemo(() => (data?.districts ?? []).map((item) => item.properties.name).sort((a, b) => a.localeCompare(b)), [data]);
  const visibleDetections = useMemo(() => mapSourceDetections.filter((item) => selectedDistrict === 'all' || item.properties.district === selectedDistrict), [mapSourceDetections, selectedDistrict]);
  const mapDistrictCounts = countsByDistrict;

  function showDateOnMap(date: string) {
    setSelectedDate(date);
    setMapTimeMode('day');
    setSelectedDistrict('all');
    setSelectedDetection(null);
    setSelectedCluster(null);
  }

  const toggle = (active: boolean, setter: (value: boolean) => void, label: string, description: string) => (
    <label className="grid min-h-11 cursor-pointer gap-1 rounded-lg border border-line bg-canvas/70 px-3 py-2 text-sm font-semibold text-ink">
      <span className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(event) => setter(event.currentTarget.checked)} className="accent-radar" />{label}</span>
      <span className="pl-5 text-xs font-normal leading-relaxed text-muted">{description}</span>
    </label>
  );

  return <>
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 md:pb-10 md:pt-16">
        <p className="eyebrow text-radar">Madhya Pradesh · satellite heat study</p>
        <h1 className="mt-3 max-w-4xl text-white">Satellite heat detections in Madhya Pradesh.</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">See where and when satellites detected unusual heat. The map and charts summarize the study data; a detection is a clue to check, not proof of a fire.</p>
      </div>
    </section>

    <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 md:py-8">
      {data && <div className="mb-5"><StudyFindingsSummary detections={data.detections} selectedDate={mapTimeMode === 'day' ? selectedDate : undefined} onSelectDate={showDateOnMap} variant="summary" /></div>}

      <section className="surface-card mb-5 p-4 sm:p-5" aria-label="Choose the map view">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="eyebrow">Explore the result</p><h2 className="mt-1 text-lg">What should the map show?</h2></div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2" role="group" aria-label="Map time period">
            <button type="button" aria-pressed={mapTimeMode === 'period'} onClick={() => { setMapTimeMode('period'); setSelectedDetection(null); setSelectedCluster(null); }} className={`min-h-11 rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${mapTimeMode === 'period' ? 'border-radar/40 bg-radar/10 text-radar' : 'border-line bg-canvas text-muted hover:bg-white/[.04]'}`}>
              All study dates <span className="mt-0.5 block text-xs font-normal opacity-80">See the full pattern</span>
            </button>
            <button type="button" aria-pressed={mapTimeMode === 'day'} onClick={() => { setMapTimeMode('day'); setSelectedDistrict('all'); setSelectedDetection(null); setSelectedCluster(null); }} className={`min-h-11 rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${mapTimeMode === 'day' ? 'border-radar/40 bg-radar/10 text-radar' : 'border-line bg-canvas text-muted hover:bg-white/[.04]'}`}>
              View one day <span className="mt-0.5 block text-xs font-normal opacity-80">See detections with a radar image</span>
            </button>
          </div>
        </div>
      </section>

      {mapTimeMode === 'day' && !showModis && (
        <section className="surface-card mb-5 p-5 sm:p-6" aria-labelledby="timeline-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">Choose a date</p><h2 id="timeline-heading" className="mt-2 text-xl">Showing {selectedDate ? formatDate(selectedDate) : 'the selected day'}</h2></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/10 px-3 py-2 text-xs font-semibold text-radar"><CalendarDays className="h-4 w-4" aria-hidden="true" />{snapshotDates.length} dates with detections</span>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-muted">
            <span>Pick a date</span>
            <select value={selectedDate} onChange={(event) => { setSelectedDate(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-11 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink">
              {snapshotDates.map((date) => <option key={date} value={date}>{formatDate(date)} · {dayRecordCounts.get(date)?.toLocaleString('en-US') ?? 0} heat reports</option>)}
            </select>
          </label>
          <p className="mt-3 text-xs leading-relaxed text-muted">Only dates in the study data are listed. Heat detections and radar images come from separate satellites, so their coverage may not match exactly. Some dates have no radar image.</p>
          <SatelliteLayerPreviews
            date={selectedDate}
            activeLayer={imageryLayer === 'modis' ? 'nisar-12day' : imageryLayer}
            showNaturalColor={showOpticalContext}
            onSelectLayer={setImageryLayer}
            onToggleNaturalColor={() => setShowOpticalContext((current) => !current)}
          />
        </section>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[21rem_minmax(0,1fr)] 2xl:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          {mapTimeMode === 'period' ? (
            <section className="surface-card p-5 sm:p-6" aria-labelledby="period-map-guide">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-ember/10 text-ember"><Activity className="h-4 w-4" aria-hidden="true" /></span><div><p className="eyebrow">Whole study period</p><h2 id="period-map-guide" className="mt-1 text-lg">Read the map colors</h2></div></div>
              <p className="mt-4 text-sm leading-relaxed text-muted">Each district’s color shows how many heat detections were reported across {snapshotDates.length} study dates. Brighter orange means more detections. Select a district to see its total.</p>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-canvas/60 p-3 text-xs text-muted"><span>Fewer detections</span><span className="h-3 w-24 rounded-full bg-gradient-to-r from-[#164154] to-[#f58a3b]" aria-hidden="true"/><span>More detections</span></div>
              <label className="mt-5 grid gap-1.5 text-xs font-semibold text-muted"><span>Focus on one district</span><select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink"><option value="all">All Madhya Pradesh</option>{districtNames.map((name) => <option key={name} value={name}>{name} · {countsByDistrict.get(name)?.toLocaleString('en-US') ?? 0} detections</option>)}</select></label>
              <p className="mt-4 rounded-lg border border-line bg-canvas/60 p-3 text-xs leading-relaxed text-muted">These are detections counted, not a fire-danger score. Larger districts or more satellite passes can have higher totals.</p>
            </section>
          ) : (
            <section className="surface-card p-5 sm:p-6" aria-labelledby="layers-heading">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-radar/10 text-radar"><Layers3 className="h-4 w-4" aria-hidden="true" /></span><div><p className="eyebrow">One-day view</p><h2 id="layers-heading" className="mt-1 text-lg">Choose what to show</h2></div></div>
              <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Choose the satellite image">
                {([
                  ['nisar-daily', 'NISAR radar · daily view', 'One date only; expect more gaps.'],
                  ['nisar-12day', 'NISAR radar · 12-day view', 'The 12 days ending on the date selected above.'],
                  ['sentinel1', 'Sentinel-1 radar image', 'Multi-day false-color radar from a different satellite; coverage may be partial.'],
                  ['modis', 'MODIS burned-area map', 'Monthly mapped burn scars over the project footprint.'],
                ] as const).map(([value, label, description]) => <label key={value} className={`grid min-h-11 cursor-pointer gap-1 rounded-lg border px-3 py-2 text-sm font-semibold ${imageryLayer === value ? 'border-radar/30 bg-radar/10 text-radar' : 'border-line bg-canvas/70 text-ink'}`}><span className="flex items-center gap-2"><input type="radio" name="imagery-layer" value={value} checked={imageryLayer === value} onChange={() => setImageryLayer(value)} className="accent-radar" />{label}</span><span className="pl-5 text-xs font-normal leading-relaxed text-muted">{description}</span></label>)}
                {toggle(showOpticalContext, setShowOpticalContext, 'Show natural-color background', showModis ? 'Shows a satellite photo for the selected image date beneath the monthly burn-scar layer.' : 'Shows a satellite photo around the state beneath the selected radar image.')}
                {toggle(showDetections, setShowDetections, 'Show satellite heat signals', 'Turns the signal summary and its count on or off. These come from another satellite.')}
              </div>
              {showModis && <form className="mt-4 grid grid-cols-[1fr_auto] items-end gap-2" onSubmit={(event) => { event.preventDefault(); void loadModisLayer(); }}>
                <label className="grid gap-1 text-xs font-semibold text-muted"><span>MODIS product month</span><input type="month" value={modisMonth} onChange={(event) => setModisMonth(event.currentTarget.value)} required className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm font-medium text-ink" /></label>
                <button type="submit" disabled={modisLoading || !modisMonth} className="min-h-10 rounded-lg bg-ember px-3 text-xs font-bold text-canvas disabled:opacity-60">{modisLoading ? 'Loading…' : 'Load MODIS'}</button>
                {modisError && <p className="col-span-2 text-xs leading-relaxed text-ember" role="alert">{modisError}</p>}
                {modisImageUrl && !modisError && <p className="col-span-2 text-xs leading-relaxed text-eco" role="status">MODIS burned-area overlay loaded for {modisMonth}. It covers the project footprint only.</p>}
              </form>}
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted">How to show the signals</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Choose how satellite heat signals are displayed">
                  {([
                    ['density', 'Signal clusters'],
                    ['district', 'By district'],
                    ['individual', 'Each report'],
                  ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={dayDetectionView === value} onClick={() => { setDayDetectionView(value); setSelectedDetection(null); setSelectedCluster(null); }} className={`min-h-10 rounded-lg border px-2 text-[11px] font-semibold transition ${dayDetectionView === value ? 'border-radar/40 bg-radar/10 text-radar' : 'border-line bg-canvas/70 text-muted hover:text-ink'}`}>{label}</button>)}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{dayDetectionView === 'density' ? 'Color shows where reports are close together. Select a colored area for its summary.' : dayDetectionView === 'district' ? 'District color compares the number of reports on this date. Select a district for its total.' : 'Each point is one satellite report. Several reports may describe the same event.'}</p>
              </div>
              <div className="mt-3 rounded-lg border border-radar/20 bg-radar/5 p-3" aria-live="polite"><p className="text-xs font-semibold text-radar">Selected map layer: {activeRadarLabel}</p><p className="mt-1 text-xs leading-relaxed text-muted">{activeRadarExplanation}</p></div>
              <label className="mt-4 grid gap-1.5 text-xs font-semibold text-muted"><span>Focus on one district</span><select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); setSelectedDetection(null); setSelectedCluster(null); }} className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm text-ink"><option value="all">All Madhya Pradesh</option>{districtNames.map((name) => <option key={name} value={name}>{name} · {countsByDistrict.get(name)?.toLocaleString('en-US') ?? 0}</option>)}</select></label>
              <p className="mt-3 text-xs leading-relaxed text-muted">NISAR is a NASA–ISRO radar satellite; Sentinel-1 is a separate European radar satellite. Radar images show surface patterns rather than natural-color photos.</p>
              <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Heat signal reports</p><strong className="mt-1 block text-xl text-ember">{visibleDetections.length.toLocaleString('en-US')}</strong><p className="text-[10px] text-muted">not confirmed fires</p></div><div className="rounded-lg border border-line bg-canvas/60 p-3"><p className="text-[10px] uppercase tracking-wider text-subtle">Map layer</p><strong className="mt-1 block text-sm text-radar">{activeRadarLabel}</strong><p className="text-[10px] text-muted">{showModis ? modisMonth : 'for selected date'}</p></div></div>
            </section>
          )}
        </aside>

        <div className="space-y-5">
        <section className="surface-card overflow-hidden p-3 sm:p-4" aria-labelledby="map-heading">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:px-2"><div><p className="eyebrow">Madhya Pradesh map</p><h2 id="map-heading" className="mt-1 text-xl">{mapTimeMode === 'period' ? 'Heat reports by district' : showModis ? `${activeRadarLabel} · ${modisMonth} + satellite heat reports · ${selectedDate ? formatDate(selectedDate) : 'choose a date'}` : `${activeRadarLabel} + satellite heat reports · ${selectedDate ? formatDate(selectedDate) : 'choose a date'}`}</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">{mapTimeMode === 'period' ? 'District color shows the total number of satellite heat reports in the study data.' : showModis ? 'Burned-area pixels use the selected month; the background photo uses the heat-report date. Colored clusters are separate heat reports.' : 'Radar layers are browse images, not before-and-after comparisons. Colored clusters show separate satellite heat reports.'}</p></div><div className="flex gap-1 overflow-hidden rounded-lg border border-line bg-canvas" aria-label={`Map zoom: ${Math.round(zoom * 100)} percent`}><button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 3} onClick={() => setZoom((value) => Math.min(3, Number((value + 0.5).toFixed(1))))} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><ZoomIn className="h-5 w-5" /></button><button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, Number((value - 0.5).toFixed(1))))} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><ZoomOut className="h-5 w-5" /></button><button type="button" aria-label="Reset map" title="Reset map view" onClick={() => { setZoom(1); setResetViewKey((v) => v + 1); setSelectedDistrict('all'); }} className="grid h-11 w-11 place-items-center text-ink hover:bg-white/10"><RotateCcw className="h-5 w-5" /></button></div></div>
          <div className="relative aspect-[1.12] min-h-[27rem] overflow-hidden rounded-xl border border-white/10 bg-[#07131d] sm:aspect-[1.38] xl:aspect-[1.2]">
            {error && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-canvas/90 p-6 text-center text-sm text-ember">{error}</div>}
            {!data && !error && <div role="status" className="absolute inset-0 z-20 grid place-items-center bg-canvas/75 text-sm text-muted">Loading Madhya Pradesh map…</div>}
            {data && <MadhyaPradeshMapCanvas state={data.state} districts={data.districts} detections={visibleDetections} footprint={data.footprint} districtCounts={mapDistrictCounts} selectedDistrict={selectedDistrict} selectedDetectionId={selectedDetection?.id ?? null} selectedClusterKey={selectedCluster?.key ?? null} viewMode={mapTimeMode === 'period' ? 'district' : dayDetectionView} selectedDate={selectedDate} showNisarDaily={mapTimeMode === 'day' && showNisarDaily} showNisar12Day={mapTimeMode === 'day' && showNisar12Day} showSentinel1={mapTimeMode === 'day' && showSentinel1} showModisBurnedArea={mapTimeMode === 'day' && showModis} modisBurnedAreaUrl={modisImageUrl} showOptical={false} showOpticalContext={mapTimeMode === 'day' && showOpticalContext} zoom={zoom} resetViewKey={resetViewKey} onImageryStatus={(kind, status, key) => setImageStatuses((current) => ({ ...current, [key]: status }))} onSelectDistrict={(name) => setSelectedDistrict((current) => current === name ? 'all' : name)} onSelectDetection={(detection) => { setSelectedDetection(detection); setSelectedCluster(null); }} onSelectCluster={(cluster) => { setSelectedCluster(cluster); setSelectedDetection(null); }} />}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-semibold">{mapTimeMode === 'period' ? <span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">{visibleDetections.length.toLocaleString('en-US')} reports · {snapshotDates.length} dates</span> : <><span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">Image date · {selectedDate}</span>{showDetections && <span className="rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 text-ink">{visibleDetections.length.toLocaleString('en-US')} heat reports</span>}</>}</div>
          </div>
          {mapTimeMode === 'day' && showModis && <p className={`mt-3 rounded-lg border px-3 py-2 text-xs ${modisError ? 'border-ember/30 bg-ember/5 text-ember' : 'border-line bg-canvas/45 text-muted'}`} role="status"><strong className="text-ink">{activeRadarLabel}:</strong> {modisError || (modisLoading ? `Loading MODIS ${modisMonth}…` : modisImageUrl ? `Burn-scar overlay loaded for ${modisMonth}.` : 'Choose a month and load the burned-area overlay.')}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-1 pt-3 text-xs text-muted" aria-label="Map legend">
            <span className="font-semibold text-ink">Map key</span>
            {mapTimeMode === 'period' || dayDetectionView === 'district' ? <><span className="inline-flex items-center gap-2"><span className="h-3 w-16 rounded-full bg-gradient-to-r from-[#164154] to-[#f58a3b]"/>Fewer to more reports by district</span><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#263b46]"/>District borders</span></> : dayDetectionView === 'density' ? <><span className="inline-flex items-center gap-2"><span className="h-3 w-8 rounded-sm bg-gradient-to-r from-[#f6b14d]/30 to-[#f05d68]"/>Fewer to more reports per area (this day)</span><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#263b46]"/>District borders</span></> : <><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-white bg-[#f5a04a]"/>One satellite report</span><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#263b46]"/>District borders</span></>}
            {mapTimeMode === 'day' && showOpticalContext && <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-white/50 bg-[#77917b]"/>Natural-color satellite context</span>}
            {mapTimeMode === 'day' && showModis && <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-ember/60 bg-ember/35"/>MODIS burned-area layer · {modisMonth}</span>}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{mapTimeMode === 'period' ? 'Color shows the number of satellite reports, not confirmed fires, burned area, or fire danger. Select a district to focus it.' : dayDetectionView === 'density' ? `${visibleDetections.length.toLocaleString('en-US')} heat reports are grouped into colored areas for ${formatDate(selectedDate)}. Brighter areas contain more nearby reports; colors scale to this selected day. One fire can produce several reports.` : dayDetectionView === 'district' ? `${visibleDetections.length.toLocaleString('en-US')} heat reports are counted within each district for ${formatDate(selectedDate)}. These are reports, not a count of confirmed fires.` : `${visibleDetections.length.toLocaleString('en-US')} satellite heat reports are shown for ${formatDate(selectedDate)}. Several reports can relate to one event. Drag to move the map; use the buttons above to zoom.`}</p>
        </section>
        <section className="surface-card p-5" aria-live="polite"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-radar" aria-hidden="true"/><h2 className="text-base">Explore the map</h2></div>
          {selectedDetection ? <><p className="mt-3 text-sm leading-relaxed text-muted">This heat detection was reported on {formatDate(selectedDetection.properties.date)} at {selectedDetection.properties.time} UTC. NASA’s confidence label ({selectedDetection.properties.confidence || 'not reported'}) describes how clear the satellite signal was; it is not a percentage chance. Estimated heat output: {selectedDetection.properties.frp ?? 'not available'} MW. This does not tell us how much land burned. District: {selectedDetection.properties.district || 'not available'}.</p><DetectionResearchCard detection={{ latitude: Number((selectedDetection.geometry.coordinates as [number, number])[1]), longitude: Number((selectedDetection.geometry.coordinates as [number, number])[0]), date: selectedDetection.properties.date, time: selectedDetection.properties.time, confidence: selectedDetection.properties.confidence, frp: selectedDetection.properties.frp, district: selectedDetection.properties.district }} /></> : selectedCluster ? <><p className="mt-3 text-sm leading-relaxed text-muted">This map area groups {selectedCluster.count.toLocaleString('en-US')} nearby reports around {selectedCluster.latitude.toFixed(3)}° N, {selectedCluster.longitude.toFixed(3)}° E from {formatDate(selectedCluster.firstDate)} to {formatDate(selectedCluster.lastDate)}. A group can include several reports from one event.</p><DetectionResearchCard detection={{ latitude: selectedCluster.latitude, longitude: selectedCluster.longitude, date: selectedDate || selectedCluster.firstDate, time: 'unknown', confidence: 'grouped reports', frp: null, district: '' }} /></> : mapTimeMode === 'period' ? <p className="mt-3 text-sm leading-relaxed text-muted">Select a district on the map to see its total. Use the chart below to open a single day.</p> : <p className="mt-3 text-sm leading-relaxed text-muted">Select a colored area or district to see a summary. Switch to “Each report” if you need to inspect individual satellite records.</p>}
        </section>
        </div>
      </div>

      {data && <div className="mt-5"><StudyFindingsSummary detections={data.detections} selectedDate={mapTimeMode === 'day' ? selectedDate : undefined} onSelectDate={showDateOnMap} variant="charts" /></div>}

      <section className="surface-card mt-5 p-5 sm:p-6" aria-labelledby="interpretation-heading">
        <p className="eyebrow">How to use the result</p>
        <h2 id="interpretation-heading" className="mt-2 text-xl">A starting point for focused field checks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-line bg-canvas/45 p-4"><h3 className="text-base">What we found</h3><p className="mt-1 text-sm leading-relaxed text-muted">Guna had the most detections, followed by Ashoknagar and Hoshangabad. The busiest single day was 22 October 2026.</p></article>
          <article className="rounded-xl border border-line bg-canvas/45 p-4"><h3 className="text-base">What it suggests</h3><p className="mt-1 text-sm leading-relaxed text-muted">These places and dates are useful starting points for checking local reports or clearer images. District totals are simple counts and do not account for district size.</p></article>
          <article className="rounded-xl border border-line bg-canvas/45 p-4"><h3 className="text-base">What it cannot prove</h3><p className="mt-1 text-sm leading-relaxed text-muted">A heat detection does not confirm a fire. The radar previews are not matched to the same ground pixels or calibrated to measure change, so this project cannot tell whether a fire caused a surface change.</p></article>
        </div>
      </section>
    </div>
  </>;
}
