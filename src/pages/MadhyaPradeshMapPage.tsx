import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, ExternalLink, Flame, Info, Layers3, Map as MapIcon, MapPin, RefreshCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import MadhyaPradeshMapCanvas, {
  type ClusterSummary,
  type DistrictProperties,
  type MapDetection,
  type MapFeature,
} from '@/components/maps/MadhyaPradeshMapCanvas';
import { detectionDates } from '@/data/detections';

interface FeatureCollection<Properties extends Record<string, unknown> = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: MapFeature<Properties>[];
}

interface DetectionProperties extends Record<string, unknown> {
  date: string;
  time: string;
  confidence: string;
  frp: number | null;
  daynight: string;
  district: string;
}

interface LoadedMapData {
  state: MapFeature;
  districts: MapFeature<DistrictProperties>[];
  detections: MapDetection[];
  footprint: MapFeature | null;
}

type Confidence = 'low' | 'nominal' | 'high';

const SOURCE_START = detectionDates[0] ?? new Date().toISOString().slice(0, 10);
const SOURCE_END = detectionDates[detectionDates.length - 1] ?? SOURCE_START;
const CONFIDENCE_VALUES: Confidence[] = ['low', 'nominal', 'high'];

async function fetchGeoJson<Properties extends Record<string, unknown> = Record<string, unknown>>(url: string): Promise<FeatureCollection<Properties>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load map data (${response.status}).`);
  return response.json() as Promise<FeatureCollection<Properties>>;
}

function prettyDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function normalizedConfidence(value: string): Confidence | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'l' || normalized === 'low') return 'low';
  if (normalized === 'n' || normalized === 'nominal') return 'nominal';
  if (normalized === 'h' || normalized === 'high') return 'high';
  return null;
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: 'radar' | 'ember' | 'analysis' }) {
  const toneClass = tone === 'radar' ? 'text-radar' : tone === 'ember' ? 'text-ember' : 'text-analysis';
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.035] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-subtle">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
    </div>
  );
}

export default function MadhyaPradeshMapPage() {
  const [data, setData] = useState<LoadedMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(SOURCE_START);
  const [endDate, setEndDate] = useState(SOURCE_END);
  const [confidence, setConfidence] = useState<Set<Confidence>>(() => new Set(CONFIDENCE_VALUES));
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'density' | 'individual'>('grouped');
  const [zoom, setZoom] = useState(1);
  const [viewResetKey, setViewResetKey] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState<MapDetection | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchGeoJson('/data/madhya-pradesh-boundary.geojson'),
      fetchGeoJson<DistrictProperties>('/data/madhya-pradesh-districts.geojson'),
      fetchGeoJson<DetectionProperties>('/data/madhya-pradesh-firms.geojson'),
      fetchGeoJson('/data/project-footprint.geojson'),
    ]).then(([state, districts, detections, footprint]) => {
      if (cancelled) return;
      setData({
        state: state.features[0] as MapFeature,
        districts: districts.features,
        detections: detections.features as MapDetection[],
        footprint: (footprint.features[0] as MapFeature | undefined) ?? null,
      });
      setError('');
    }).catch((reason: unknown) => {
      if (cancelled) return;
      setError(reason instanceof Error ? reason.message : 'Map data could not be loaded.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const districtNames = useMemo(
    () => (data?.districts ?? []).map((district) => district.properties.name).sort((a, b) => a.localeCompare(b)),
    [data],
  );

  const timeAndConfidenceFiltered = useMemo(() => (data?.detections ?? []).filter((detection) => {
    const date = detection.properties.date;
    const recordConfidence = normalizedConfidence(detection.properties.confidence);
    return date >= startDate && date <= endDate && recordConfidence !== null && confidence.has(recordConfidence);
  }), [confidence, data, endDate, startDate]);

  const districtCounts = useMemo(() => {
    const counts = new Map<string, number>();
    timeAndConfidenceFiltered.forEach((detection) => {
      const district = detection.properties.district;
      if (district) counts.set(district, (counts.get(district) ?? 0) + 1);
    });
    return counts;
  }, [timeAndConfidenceFiltered]);

  const visibleDetections = useMemo(() => timeAndConfidenceFiltered.filter((detection) => {
    if (selectedDistrict === 'all') return true;
    if (selectedDistrict === '__unassigned__') return !detection.properties.district;
    return detection.properties.district === selectedDistrict;
  }), [selectedDistrict, timeAndConfidenceFiltered]);

  const daysWithRecords = useMemo(
    () => new Set(visibleDetections.map((detection) => detection.properties.date)).size,
    [visibleDetections],
  );
  const unassignedCount = timeAndConfidenceFiltered.filter((detection) => !detection.properties.district).length;
  const rankedDistricts = useMemo(
    () => [...districtCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6),
    [districtCounts],
  );

  function clearSelection() {
    setSelectedDetection(null);
    setSelectedCluster(null);
  }

  function changeStart(value: string) {
    setStartDate(value);
    if (value > endDate) setEndDate(value);
    clearSelection();
  }

  function changeEnd(value: string) {
    setEndDate(value);
    if (value < startDate) setStartDate(value);
    clearSelection();
  }

  function toggleConfidence(value: Confidence) {
    setConfidence((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    clearSelection();
  }

  function chooseDistrict(name: string) {
    setSelectedDistrict((current) => current === name ? 'all' : name);
    clearSelection();
  }

  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 md:pb-14 md:pt-18">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="eyebrow text-radar">State view / Madhya Pradesh</p>
              <h1 className="mt-4 text-white">Satellite heat signals across the state.</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                Explore the full Madhya Pradesh detection snapshot by district and date. Each mark is one NASA FIRMS satellite detection record, not a confirmed or unique fire.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full border border-radar/20 bg-radar/10 px-3 py-2 text-radar"><MapIcon className="h-3.5 w-3.5" aria-hidden="true" />Statewide view</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ember/20 bg-ember/10 px-3 py-2 text-ember"><Flame className="h-3.5 w-3.5" aria-hidden="true" />VIIRS · NOAA-21</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-muted"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{prettyDate(SOURCE_START)} – {prettyDate(SOURCE_END)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 md:py-10" aria-label="Madhya Pradesh statewide FIRMS map">
        <div className="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="surface-card p-5" aria-labelledby="map-filters-heading">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Map controls</p>
                  <h2 id="map-filters-heading" className="mt-2 text-xl">Choose the view</h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><Layers3 className="h-5 w-5" aria-hidden="true" /></span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-semibold text-muted">
                  <span>From</span>
                  <input type="date" min={SOURCE_START} max={endDate} value={startDate} onChange={(event) => changeStart(event.currentTarget.value)} className="min-h-10 min-w-0 rounded-lg border border-line-strong bg-raised px-2 text-xs font-medium text-ink" />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted">
                  <span>Through</span>
                  <input type="date" min={startDate} max={SOURCE_END} value={endDate} onChange={(event) => changeEnd(event.currentTarget.value)} className="min-h-10 min-w-0 rounded-lg border border-line-strong bg-raised px-2 text-xs font-medium text-ink" />
                </label>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold text-muted">Reported confidence</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONFIDENCE_VALUES.map((value) => (
                    <button key={value} type="button" aria-pressed={confidence.has(value)} onClick={() => toggleConfidence(value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${confidence.has(value) ? 'border-ember/40 bg-ember/10 text-ember' : 'border-line bg-canvas text-subtle'}`}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <label htmlFor="district-select" className="mt-5 grid gap-1.5 text-xs font-semibold text-muted">
                <span>Focus district</span>
                <select id="district-select" value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.currentTarget.value); clearSelection(); }} className="min-h-11 rounded-lg border border-line-strong bg-raised px-3 text-sm font-medium text-ink">
                  <option value="all">All Madhya Pradesh</option>
                  {districtNames.map((name) => <option key={name} value={name}>{name}{districtCounts.has(name) ? ` · ${districtCounts.get(name)?.toLocaleString('en-US')}` : ''}</option>)}
                  <option value="__unassigned__">Outside 2021 district layer · {unassignedCount}</option>
                </select>
              </label>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <StatCard label="Records" value={visibleDetections.length.toLocaleString('en-US')} note="selected filters" tone="ember" />
                <StatCard label="Days" value={daysWithRecords.toLocaleString('en-US')} note="with records" tone="radar" />
                <StatCard label="Districts" value={[...districtCounts.values()].filter((count) => count > 0).length.toLocaleString('en-US')} note="with records" tone="analysis" />
              </div>
            </section>

            <section className="surface-card p-5" aria-labelledby="district-ranking-heading">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Current filters</p>
                  <h2 id="district-ranking-heading" className="mt-2 text-lg">District records</h2>
                </div>
                <Activity className="h-5 w-5 text-ember" aria-hidden="true" />
              </div>
              {rankedDistricts.length > 0 ? (
                <ol className="mt-4 space-y-2">
                  {rankedDistricts.map(({ name, count }, index) => (
                    <li key={name}>
                      <button type="button" onClick={() => chooseDistrict(name)} aria-pressed={selectedDistrict === name} className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-line hover:bg-white/[.03] aria-pressed:border-radar/30 aria-pressed:bg-radar/5">
                        <span className="w-5 font-mono text-[10px] text-subtle">0{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
                        <span className="font-mono text-sm tabular-nums text-ember">{count.toLocaleString('en-US')}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-4 text-sm text-muted">No district records match these filters.</p>}
              <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-subtle">Ranking counts point records inside the district polygons. It is not a count of distinct fires.</p>
            </section>

            <section className="surface-card p-5" aria-labelledby="selection-heading">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Map selection</p>
                  <h2 id="selection-heading" className="mt-2 text-lg">{selectedDetection ? 'Detection details' : selectedCluster ? (viewMode === 'density' ? 'Density cell' : 'Grouped records') : selectedDistrict !== 'all' && selectedDistrict !== '__unassigned__' ? selectedDistrict : 'Select a marker or district'}</h2>
                </div>
                {selectedDetection ? <MapPin className="h-5 w-5 text-ember" aria-hidden="true" /> : <Info className="h-5 w-5 text-radar" aria-hidden="true" />}
              </div>
              {selectedDetection ? (
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                  <dt className="text-subtle">Date / time</dt><dd className="font-medium text-ink">{prettyDate(selectedDetection.properties.date)} · {selectedDetection.properties.time || '—'} UTC</dd>
                  <dt className="text-subtle">Sensor</dt><dd className="text-ink">VIIRS · NOAA-21</dd>
                  <dt className="text-subtle">Confidence</dt><dd className="capitalize text-ink">{selectedDetection.properties.confidence || 'Not reported'}</dd>
                  <dt className="text-subtle">Fire radiative power</dt><dd className="text-ink">{selectedDetection.properties.frp === null ? 'Not reported' : `${selectedDetection.properties.frp} MW`}</dd>
                  <dt className="text-subtle">Day / night</dt><dd className="capitalize text-ink">{selectedDetection.properties.daynight || 'Not reported'}</dd>
                  <dt className="text-subtle">District</dt><dd className="text-ink">{selectedDetection.properties.district || 'Outside the 2021 district layer'}</dd>
                  <dt className="text-subtle">Coordinates</dt><dd className="tabular-nums text-ink">{(selectedDetection.geometry.coordinates as [number, number])[1].toFixed(4)}° N, {(selectedDetection.geometry.coordinates as [number, number])[0].toFixed(4)}° E</dd>
                </dl>
              ) : selectedCluster ? (
                <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
                  <p><strong className="text-ember">{selectedCluster.count.toLocaleString('en-US')}</strong> satellite detection records in this map cell.</p>
                  <p>Reported confidence: {selectedCluster.low} low · {selectedCluster.nominal} nominal · {selectedCluster.high} high.</p>
                  <p>Dates represented: {prettyDate(selectedCluster.firstDate)} – {prettyDate(selectedCluster.lastDate)}.</p>
                  <p>Approximate center: {selectedCluster.latitude.toFixed(3)}° N, {selectedCluster.longitude.toFixed(3)}° E.</p>
                </div>
              ) : selectedDistrict !== 'all' ? (
                <p className="mt-4 text-sm leading-relaxed text-muted">{selectedDistrict === '__unassigned__' ? `${visibleDetections.length.toLocaleString('en-US')} records do not intersect the 2021 district polygons. They remain within the project's Madhya Pradesh state filter.` : `${(districtCounts.get(selectedDistrict) ?? 0).toLocaleString('en-US')} detection records match the selected district and current filters.`}</p>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted">Choose a district, a grouped cell, or an individual mark to inspect its date, reported confidence, heat output, and location.</p>
              )}
            </section>
          </aside>

          <div className="min-w-0">
            <section className="surface-card overflow-hidden p-3 sm:p-4" aria-labelledby="state-map-heading">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:px-2">
                <div>
                  <p className="eyebrow">Madhya Pradesh · administrative view</p>
                  <h2 id="state-map-heading" className="mt-1 text-xl">FIRMS detections by district</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-line bg-canvas p-1" role="group" aria-label="Choose detection display">
                    <button type="button" aria-pressed={viewMode === 'grouped'} onClick={() => { setViewMode('grouped'); clearSelection(); }} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${viewMode === 'grouped' ? 'bg-radar/15 text-radar' : 'text-muted hover:text-white'}`}>Grouped</button>
                    <button type="button" aria-pressed={viewMode === 'density'} onClick={() => { setViewMode('density'); clearSelection(); }} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${viewMode === 'density' ? 'bg-radar/15 text-radar' : 'text-muted hover:text-white'}`}>Density</button>
                    <button type="button" aria-pressed={viewMode === 'individual'} onClick={() => { setViewMode('individual'); clearSelection(); }} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${viewMode === 'individual' ? 'bg-radar/15 text-radar' : 'text-muted hover:text-white'}`}>Individual</button>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[1.12] min-h-[26rem] overflow-hidden rounded-xl border border-white/10 bg-[#07131d] sm:aspect-[1.38] xl:aspect-[1.12]">
                {loading && <div role="status" className="absolute inset-0 z-20 grid place-items-center bg-canvas/75 text-sm text-muted"><span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin text-radar" />Loading district and FIRMS data…</span></div>}
                {error && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-canvas/90 p-6 text-center text-sm text-ember">{error}</div>}
                {data && !loading && (
                  <MadhyaPradeshMapCanvas
                    state={data.state}
                    districts={data.districts}
                    detections={visibleDetections}
                    footprint={data.footprint}
                    districtCounts={districtCounts}
                    selectedDistrict={selectedDistrict}
                    selectedDetectionId={selectedDetection?.id ?? null}
                    selectedClusterKey={selectedCluster?.key ?? null}
                    viewMode={viewMode}
                    zoom={zoom}
                    resetViewKey={viewResetKey}
                    onSelectDistrict={(name) => chooseDistrict(name)}
                    onSelectDetection={(detection) => { setSelectedDetection(detection); setSelectedCluster(null); }}
                    onSelectCluster={(cluster) => { setSelectedCluster(cluster); setSelectedDetection(null); }}
                  />
                )}
                <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-white/15 bg-canvas/85 shadow-card backdrop-blur">
                  <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-10 w-10 place-items-center text-white transition hover:bg-white/10"><ZoomIn className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.2).toFixed(1))))} className="grid h-10 w-10 place-items-center border-t border-white/10 text-white transition hover:bg-white/10"><ZoomOut className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label="Reset map view" onClick={() => { setZoom(1); setViewResetKey((value) => value + 1); setSelectedDistrict('all'); clearSelection(); }} className="grid h-10 w-10 place-items-center border-t border-white/10 text-white transition hover:bg-white/10"><RotateCcw className="h-4 w-4" aria-hidden="true" /></button>
                </div>
                <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 text-[10px] font-medium text-ink">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 backdrop-blur"><span className={`h-2.5 w-2.5 ${viewMode === 'density' ? 'rounded-sm' : 'rounded-full'}`} style={viewMode === 'density' ? { background: 'linear-gradient(135deg, #f6b14d, #f04d53)' } : { backgroundColor: '#f6b14d' }} />{viewMode === 'grouped' ? 'Grouped records' : viewMode === 'density' ? 'Records per grid cell' : 'Individual records'}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-canvas/85 px-2.5 py-1.5 backdrop-blur"><span className="h-2.5 w-5 rounded-sm" style={{ background: 'linear-gradient(90deg, #183741, #be5f36)' }} />District record count</span>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 border-t border-line px-1 pt-3 text-[11px] leading-relaxed text-subtle sm:flex-row sm:items-start sm:justify-between sm:px-2">
                <p>{visibleDetections.length.toLocaleString('en-US')} FIRMS records shown · {districtNames.length} district polygons from the 2021 boundary vintage.</p>
                <p>{viewMode === 'density' ? 'Density colors compare record counts across equal-size grid cells; they are not counts of separate fires.' : viewMode === 'grouped' ? 'Grouped marks summarize records in map cells; they are not counts of separate fires.' : 'Each point is one sensor record; overlapping marks may hide other records.'}</p>
              </div>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label="Map interpretation and provenance">
              <div className="rounded-2xl border border-ember/20 bg-ember/5 p-5">
                <div className="flex items-start gap-3">
                  <Flame className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                  <div>
                    <h3 className="text-base">What a mark represents</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted">Each record is a satellite thermal detection. Multiple records can relate to the same event; confidence and heat output are sensor-reported attributes, not field confirmation or burned area.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-radar" aria-hidden="true" />
                  <div>
                    <h3 className="text-base">Boundary and radar context</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted">The state and district outlines use the same 2021 geoBoundaries India ADM2 district shapes (ODbL 1.0); the state line is their dissolved outline. The dashed NISAR outline marks the project’s original study footprint, not statewide radar coverage.</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
                      <a href="https://github.com/wmgeolab/geoBoundaries/tree/9469f09/releaseData/gbOpen/IND/ADM2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">geoBoundaries dataset <ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                      <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">ODbL 1.0 license <ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                      <a href="https://firms.modaps.eosdis.nasa.gov/active_fire/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA FIRMS data <ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
