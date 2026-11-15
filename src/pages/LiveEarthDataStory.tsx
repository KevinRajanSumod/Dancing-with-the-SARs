import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Flame, Info, Loader2, Map, Radio, RefreshCw, Satellite } from 'lucide-react';
import AppLink from '@/components/AppLink';
import Card from '@/components/Card';
import ModisBurnedAreaPanel from '@/components/ModisBurnedAreaPanel';
import LiveDataInsight from '@/components/LiveDataInsight';
import StudyFindingsSummary from '@/components/maps/StudyFindingsSummary';
import type { MapDetection } from '@/components/maps/MadhyaPradeshMapCanvas';
import type { LiveEarthData, LiveRadarScene } from '@/lib/liveEarthData';
import { fetchLiveEarthData } from '@/lib/liveEarthData';

function longDate(date: string): string {
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function timeLabel(value: string): string {
  const rawDigits = value.replace(/\D/g, '');
  if (!rawDigits) return 'Time unavailable';
  const digits = rawDigits.padStart(4, '0').slice(-4);
  return digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2)} UTC` : 'Time unavailable';
}

function confidenceLabel(value: string): string {
  switch (value.trim().toLowerCase()) {
    case 'l':
    case 'low': return 'Low';
    case 'n':
    case 'nominal': return 'Nominal';
    case 'h':
    case 'high': return 'High';
    default: return value || 'Not reported';
  }
}

function orbitAccuracyLabel(value: string): string {
  if (value === 'P') return 'precise orbit';
  if (value === 'M') return 'medium-accuracy orbit';
  if (value === 'N') return 'near-real-time orbit';
  return `orbit solution ${value}`;
}

function comparableScenePairs(scenes: LiveRadarScene[]) {
  const groups = new globalThis.Map<string, LiveRadarScene[]>();
  scenes.filter((scene) => scene.maturity === 'VALIDATED')
    .forEach((scene) => {
      const key = `${scene.comparisonKey}:${scene.processingVersion}`;
      groups.set(key, [...(groups.get(key) ?? []), scene]);
    });
  const pairs: Array<{ before: LiveRadarScene; after: LiveRadarScene; days: number }> = [];
  groups.forEach((group) => {
    const ordered = [...group].sort((a, b) => a.acquiredAt.localeCompare(b.acquiredAt));
    for (let index = 1; index < ordered.length; index += 1) {
      const before = ordered[index - 1];
      const after = ordered[index];
      const days = Math.round((Date.parse(`${after.acquiredAt}T00:00:00Z`) - Date.parse(`${before.acquiredAt}T00:00:00Z`)) / 86_400_000);
      if (days > 0) pairs.push({ before, after, days });
    }
  });
  return pairs.sort((a, b) => b.after.acquiredAt.localeCompare(a.after.acquiredAt) || Math.abs(a.days - 12) - Math.abs(b.days - 12)).slice(0, 6);
}

function ScenePreview({ scene }: { scene: LiveRadarScene }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div role="status" className="grid aspect-[1.7] place-items-center rounded-xl bg-navy px-6 text-center text-sm text-muted">
      The ASF browse preview could not be loaded. Open the scene catalog to inspect the product metadata.
    </div>
  ) : (
    <img
      src={scene.browseUrl}
      alt={`Illustrative NISAR GCOV browse preview acquired ${longDate(scene.acquiredAt)}; not a calibrated change map.`}
      onError={() => setFailed(true)}
      className="max-h-[34rem] w-full rounded-xl bg-navy object-contain"
      loading="lazy"
    />
  );
}

export default function LiveEarthDataStory() {
  const [data, setData] = useState<LiveEarthData | null>(null);
  const [studyDetections, setStudyDetections] = useState<MapDetection[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [refreshMessage, setRefreshMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    setRefreshMessage('Checking NASA feeds now…');
    try {
      const next = await fetchLiveEarthData();
      setData(next);
      setRefreshMessage(`Feeds checked ${new Date(next.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`);
      const nextDates = [...new Set(next.firms.records.map((row) => row.date))].sort();
      setSelectedDate((current) => current || nextDates[nextDates.length - 1] || '');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Live data could not be loaded.';
      setError(message);
      setRefreshMessage('Feed refresh failed. See the message above.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void fetch('/data/madhya-pradesh-firms.geojson')
      .then((response) => {
        if (!response.ok) throw new Error('Study summary data is unavailable.');
        return response.json() as Promise<{ features: MapDetection[] }>;
      })
      .then((collection) => { if (!cancelled) setStudyDetections(collection.features); })
      .catch(() => { if (!cancelled) setStudyDetections([]); });
    return () => { cancelled = true; };
  }, []);

  const dates = useMemo(
    () => [...new Set(data?.firms.records.map((record) => record.date) ?? [])].sort(),
    [data],
  );
  const activeDate = dates.includes(selectedDate) ? selectedDate : dates[dates.length - 1] ?? '';
  const selectedRecords = useMemo(
    () => (data?.firms.records ?? []).filter((record) => record.date === activeDate).sort((a, b) => a.time.localeCompare(b.time)),
    [activeDate, data],
  );
  const scenes = useMemo(
    () => (data?.nisar.scenes ?? [])
      .filter((scene) => scene.browseUrl)
      .sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt))
      .slice(0, 6),
    [data],
  );
  const scenePairs = useMemo(() => comparableScenePairs(data?.nisar.scenes ?? []), [data]);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 md:pb-28" aria-labelledby="live-data-heading">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-radar/20 bg-radar/[.06] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Want to explore Madhya Pradesh?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">This page lists current data feeds. Open the full-state map to see satellite layers, districts, and heat-signal locations together.</p>
        </div>
        <AppLink to="/study-map" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-radar px-4 py-2 text-sm font-bold text-canvas transition hover:bg-radar-200">
          <Map className="h-4 w-4" aria-hidden="true" /> Open the full map
        </AppLink>
      </div>
      {studyDetections.length > 0 && <div className="mb-6"><StudyFindingsSummary detections={studyDetections} /></div>}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-radar/25 bg-navy p-5 text-white sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-radar/15 text-radar"><Radio className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow text-radar">Recent NASA updates</p>
            <h2 id="live-data-heading" className="mt-2 text-2xl text-white sm:text-3xl">Check the latest satellite feeds</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">The study summary above uses the saved observation set. Refresh these feeds for separate, recent heat signals and radar scene previews.</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
              <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-2">NASA FIRMS source <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              <a href="https://search.asf.alaska.edu/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-2">NISAR scene catalog <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Checking…' : 'Refresh NASA data'}
        </button>
        {refreshMessage && <p className="w-full text-right text-xs text-muted sm:ml-auto sm:w-auto" role="status" aria-live="polite">{refreshMessage}</p>}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-ember/25 bg-ember/5 p-4 text-sm leading-relaxed text-muted">
          {error}
        </p>
      )}

      {!data && loading && (
        <div role="status" className="mt-6 surface-card flex items-center gap-3 p-6 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-radar" aria-hidden="true" /> Checking NASA’s latest data feeds…
        </div>
      )}

      {data && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <div className="flex items-start gap-3">
                <Satellite className="mt-1 h-5 w-5 shrink-0 text-radar" aria-hidden="true" />
                <div>
                  <p className="eyebrow">NISAR · GCOV</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{data.nisar.scenes.length}</p>
                  <p className="mt-1 text-sm text-muted">catalog scenes intersect this project footprint</p>
                </div>
              </div>
              {data.nisar.message && <p role="status" className="mt-4 text-xs leading-relaxed text-subtle">{data.nisar.message}</p>}
            </Card>
            <Card>
              <div className="flex items-start gap-3">
                <Flame className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
                <div>
                  <p className="eyebrow">NASA FIRMS · VIIRS NOAA-21</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{data.firms.records.length.toLocaleString('en-US')}</p>
                  <p className="mt-1 text-sm text-muted">heat-detection records returned for the latest five-day query</p>
                </div>
              </div>
              {data.firms.message && (
                <p role="status" className={`mt-4 text-xs leading-relaxed ${data.firms.status === 'configuration-required' ? 'text-ember' : 'text-subtle'}`}>
                  {data.firms.message}
                </p>
              )}
            </Card>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-canvas/35 p-4 sm:p-5">
            <div className="mb-4">
              <p className="eyebrow">Evidence, in one place</p>
              <h3 className="mt-1 text-lg">Choose what you want to look at</h3>
              <p className="mt-1 text-sm text-muted">Each section answers a different question. Open one to see its map or records; use the full-state map to view locations together.</p>
            </div>
            <div className="grid gap-3">
            <details className="surface-card p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-radar">
                <span><span className="eyebrow">Radar · NISAR</span><span className="mt-1 block font-semibold text-ink">Did the satellite collect radar scenes here? <span className="font-normal text-muted">{data.nisar.scenes.length} scenes found · {scenes.length} previews</span></span></span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scenes.length ? 'border-eco/25 bg-eco/10 text-eco' : 'border-line bg-canvas text-muted'}`}>{scenes.length ? 'Preview data available' : 'No previews returned'}</span>
                <span className="text-sm font-semibold text-radar">View radar scenes <span aria-hidden="true">⌄</span></span>
              </summary>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">ASF Search API · remote browse preview</p>
                  <h3 id="live-radar-heading" className="mt-2">Latest NISAR scene previews</h3>
                </div>
                <a href={data.nisar.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-radar hover:bg-radar/10">
                  Open ASF Search <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              {scenes.length > 0 ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted">Each browse preview is listed on its own with its acquisition metadata. Use these images for visual orientation, and check the product record before attempting quantitative analysis.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {scenes.map((scene) => (
                      <article key={`${scene.sceneName}-${scene.processingVersion}`} className="rounded-xl border border-line bg-raised p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{longDate(scene.acquiredAt)} · Track {scene.track} · Frame {scene.frame}</p>
                        <ScenePreview scene={scene} />
                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <dt className="text-subtle">Orbit</dt><dd className="font-medium text-ink">{scene.direction === 'D' ? 'Descending' : 'Ascending'}</dd>
                          <dt className="text-subtle">Polarization</dt><dd className="font-medium text-ink">{scene.polarization}</dd>
                          <dt className="text-subtle">Acquisition mode</dt><dd className="font-medium text-ink">{scene.mode}</dd>
                          <dt className="text-subtle">Frequency</dt><dd className="font-medium text-ink">{scene.frequency}</dd>
                          <dt className="text-subtle">Data maturity</dt><dd className="font-medium text-ink">{scene.maturity}</dd>
                          <dt className="text-subtle">Processing release</dt><dd className="font-medium text-ink">{scene.processingVersion}</dd>
                        </dl>
                        {scene.sourceUrl && scene.sourceUrl !== data.nisar.sourceUrl && (
                          <a href={scene.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal underline underline-offset-2">
                            Open product record <ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div role="status" className="mt-5 rounded-xl bg-canvas p-5 text-sm leading-relaxed text-muted">
                  {data.nisar.status === 'unavailable'
                    ? data.nisar.message || 'The ASF catalog is unavailable right now.'
                    : 'No public browse previews were returned for this study area. Try refreshing or inspect the ASF catalog.'}
                </div>
              )}
              <div className="mt-5 flex gap-3 rounded-xl border border-radar/20 bg-radar/5 p-4 text-xs leading-relaxed text-muted">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-radar" aria-hidden="true" />
                <p>NASA-ISRO NISAR browse imagery is illustrative quicklook content. Its display projection and pixel brightness are not a georeferenced, calibrated change product, so live FIRMS points are kept in a separate panel. The NISAR guide also documents calibration artifacts in some pre-calibration BETA products; check each scene’s collection metadata before interpreting it. <a href="https://nisar-docs.asf.alaska.edu/product-known-issues/" target="_blank" rel="noopener noreferrer" className="font-semibold text-radar underline underline-offset-2 hover:text-radar">Read the product notes<span className="sr-only"> (opens in a new tab)</span></a>. This project is independent and is not endorsed by NASA or ISRO.</p>
              </div>
              <LiveDataInsight
                title="NISAR scene previews"
                question="Explain what these NISAR scene counts, previews, and acquisition metadata tell a visitor, how they can use them, and what they cannot conclude from them."
                evidence={`Catalog scenes intersecting footprint: ${data.nisar.scenes.length}. Previews displayed: ${scenes.length}. Catalog status: ${data.nisar.status}. Scenes: ${scenes.map((scene) => `${scene.acquiredAt}; track ${scene.track}; frame ${scene.frame}; ${scene.direction === 'D' ? 'descending' : 'ascending'} orbit; ${scene.polarization}; mode ${scene.mode}; frequency ${scene.frequency}; maturity ${scene.maturity}; processing ${scene.processingVersion}`).join(' | ') || 'No browse previews are currently available.'}. Previews are illustrative, not calibrated change measurements.`}
              />
            </details>

            <details className="surface-card p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-radar">
                <span><span className="eyebrow">Heat signals · NASA FIRMS</span><span className="mt-1 block font-semibold text-ink">Where did satellites detect heat? <span className="font-normal text-muted">{data.firms.records.length.toLocaleString('en-US')} records</span></span></span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${data.firms.records.length ? 'border-eco/25 bg-eco/10 text-eco' : 'border-line bg-canvas text-muted'}`}>{data.firms.records.length ? 'Detection data available' : 'No records returned'}</span>
                <span className="text-sm font-semibold text-radar">View daily records <span aria-hidden="true">⌄</span></span>
              </summary>
              <section className="mt-5" aria-labelledby="live-firms-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">NASA FIRMS · near-real-time</p>
                  <h3 id="live-firms-heading" className="mt-2">Heat detections by day</h3>
                </div>
                <a href={data.firms.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-radar hover:bg-radar/10">
                  FIRMS source <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              {data.firms.records.length > 0 ? (
                <>
                  <label htmlFor="live-firms-date" className="mt-5 block text-sm font-medium text-muted">Choose a date with records</label>
                  <select
                    id="live-firms-date"
                    value={activeDate}
                    onChange={(event) => setSelectedDate(event.currentTarget.value)}
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-raised px-3 text-sm font-medium text-ink focus:border-radar"
                  >
                    {dates.map((date) => (
                      <option key={date} value={date}>{longDate(date)} · {data.firms.records.filter((record) => record.date === date).length} records</option>
                    ))}
                  </select>
                  <p className="mt-4 text-sm font-semibold text-ink">{selectedRecords.length} detection records on {activeDate ? longDate(activeDate) : 'this date'}</p>
                  <div className="mt-3 rounded-xl border border-radar/20 bg-radar/5 p-3 text-xs leading-relaxed text-muted">
                    <p><strong className="text-ink">Detection confidence:</strong> NASA’s category for the satellite signal: low, nominal, or high. It is not a percentage or proof of a fire.</p>
                    <p className="mt-2"><strong className="text-ink">Heat output (FRP):</strong> estimated heat power from that satellite pixel, in megawatts (MW). It does not tell you the fire’s size or burned area.</p>
                  </div>
                  <div className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-line">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
                      <caption className="sr-only">NASA FIRMS thermal detection records for {activeDate ? longDate(activeDate) : 'the selected date'}</caption>
                      <thead className="sticky top-0 bg-canvas text-muted">
                        <tr>
                          <th scope="col" className="px-3 py-2.5 font-semibold">Time</th>
                          <th scope="col" className="px-3 py-2.5 font-semibold">Detection confidence</th>
                          <th scope="col" className="px-3 py-2.5 font-semibold">Heat output (MW)</th>
                          <th scope="col" className="px-3 py-2.5 font-semibold">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecords.map((record, index) => (
                          <tr key={`${record.date}-${record.time}-${record.lat}-${record.lon}-${index}`} className="border-t border-line odd:bg-raised even:bg-canvas/60">
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{timeLabel(record.time)}</td>
                            <td className="px-3 py-2.5">{confidenceLabel(record.conf)}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{record.frp === null ? 'Not reported' : record.frp.toFixed(2)}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{record.lat.toFixed(4)}° N, {record.lon.toFixed(4)}° E</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div role="status" className="mt-5 rounded-xl bg-canvas p-5 text-sm leading-relaxed text-muted">
                  {data.firms.status === 'configuration-required'
                    ? 'Add your NASA FIRMS MAP_KEY to Supabase Edge Function Secrets. The request will then run through the server function without exposing the key in the website.'
                    : data.firms.message || 'No live FIRMS records were returned for the most recent five-day query. This is not evidence that no fire occurred.'}
                </div>
              )}
              <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-subtle">A thermal detection is a satellite heat signal, not a confirmed fire or unique fire. It does not measure burned area. The five-day feed may be revised during standard processing.</p>
              <LiveDataInsight
                title="FIRMS heat detections"
                question="Explain this selected day's FIRMS records in plain language, including the confidence categories and heat-output values, how a visitor can use them, and what they do not prove."
                evidence={`Selected date: ${activeDate || 'none'}. Records on selected date: ${selectedRecords.length}. Total records in latest feed: ${data.firms.records.length}. Confidence categories: ${JSON.stringify(selectedRecords.reduce<Record<string, number>>((counts, record) => { const label = confidenceLabel(record.conf); counts[label] = (counts[label] ?? 0) + 1; return counts; }, {}))}. Reported FRP values: ${selectedRecords.filter((record) => record.frp !== null).length} of ${selectedRecords.length}. Highest FRP: ${Math.max(0, ...selectedRecords.map((record) => record.frp ?? 0)).toFixed(2)} MW. NASA defines confidence as a category, not a probability; FRP is estimated heat power, not fire size or burned area. Records may be revised.`}
              />
              </section>
            </details>
            <ModisBurnedAreaPanel />
            </div>
          </div>

          <details className="mt-5 surface-card p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-radar">
              <span><span className="eyebrow">Scene matches · technical detail</span><span className="mt-1 block font-semibold text-ink">Are there repeat radar scenes to compare? <span className="font-normal text-muted">{scenePairs.length} metadata-matched pairs</span></span><span className="mt-1 block text-xs text-muted">Possible comparisons only; no pixel-level change has been calculated.</span></span>
              <span className="text-sm font-semibold text-radar">Show scene matching details <span aria-hidden="true">⌄</span></span>
            </summary>
          <section className="mt-5" aria-labelledby="matched-scenes-heading">
            <p className="eyebrow">Repeat observations · same acquisition setup</p>
            <h3 id="matched-scenes-heading" className="mt-2 text-xl">Validated NISAR pairs intersecting the study area</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">These pairs match track, orbit direction, frame, acquisition mode, polarization, frequency, validated collection, and processing release. A scene may cover only part of the study area: the shared scene footprint must still be checked. Catalog matching does not align pixels or calculate change.</p>
            {scenePairs.length > 0 ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {scenePairs.map(({ before, after, days }) => (
                  <article key={`${before.sceneName}-${after.sceneName}`} className="rounded-xl border border-line bg-canvas/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{longDate(before.acquiredAt)} → {longDate(after.acquiredAt)} <span className="font-normal text-muted">({days} days)</span></p>
                      <span className="rounded-full border border-eco/20 bg-eco/10 px-2.5 py-1 text-[11px] font-semibold text-eco">VALIDATED · {before.processingVersion}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">Track {before.track} · {before.direction === 'D' ? 'descending' : 'ascending'} · frame {before.frame} · mode {before.mode} · polarization {before.polarization} · band {before.frequency} · {orbitAccuracyLabel(before.orbitAccuracy)} · {before.frameCoverage === 'F' ? 'full source frame' : 'partial source frame'}</p>
                    <div className="mt-3 grid gap-2 text-[11px] text-subtle">
                      <p className="break-all"><span className="font-semibold text-ink">Before:</span> {before.sceneName}</p>
                      <p className="break-all"><span className="font-semibold text-ink">After:</span> {after.sceneName}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {[before, after].map((scene, index) => scene.sourceUrl && scene.sourceUrl !== data.nisar.sourceUrl ? <a key={scene.sceneName} href={scene.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-radar underline underline-offset-2">Open {index === 0 ? 'before' : 'after'} ASF record <ExternalLink className="h-3 w-3" /></a> : null)}
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="mt-4 rounded-lg border border-line bg-canvas/50 p-4 text-sm text-muted">{data.nisar.scenes.some((scene) => scene.maturity === 'UNKNOWN') ? 'The current live-data function does not identify collection maturity, so this page will not guess which records are validated. Refresh this section after deploying the updated live-earth-data function.' : 'No two scenes currently match in the validated collection and processing release within the catalog window. Provisional or browse-only scenes are not treated as quantitative pairs.'}</p>}
            <LiveDataInsight
              title="Repeat-scene candidates"
              question="Explain what the number and metadata of these matched NISAR scene pairs mean, when a researcher might use them, and what additional work is needed before claiming land change."
              evidence={`Metadata-matched pair count: ${scenePairs.length}. Pairs: ${scenePairs.map(({ before, after, days }) => `${before.acquiredAt} to ${after.acquiredAt} (${days} days); track ${before.track}; frame ${before.frame}; ${before.direction === 'D' ? 'descending' : 'ascending'}; mode ${before.mode}; polarization ${before.polarization}; frequency ${before.frequency}; validated; processing ${before.processingVersion}; coverage ${before.frameCoverage === 'F' ? 'full source frame' : 'partial source frame'}`).join(' | ') || 'No validated metadata-matched pairs currently found.'}. Metadata matching does not align pixels or calculate change. The project has no GCOV measurement exports.`}
            />
            <p className="mt-4 rounded-lg border border-amber/20 bg-amber/5 p-4 text-xs leading-relaxed text-muted">The scene files require a free NASA Earthdata Login and are multi-gigabyte products. Check the orbit-solution and coverage fields in each record too. The project currently has no GCOV measurement exports, so no calibrated difference has been computed. The offline processor is in <code className="text-ink">data/pipeline/README_nisar_change.md</code>.</p>
          </section>
          </details>

          <p className="mt-5 rounded-xl border border-line bg-canvas/45 p-4 text-sm leading-relaxed text-muted"><strong className="text-ink">Simple guide:</strong> NISAR shows radar observations; FIRMS marks satellite heat signals; MODIS maps monthly burn scars. Seeing them at the same place or time is useful context, but it does not by itself prove that a fire caused a radar change. <a href="https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/" target="_blank" rel="noopener noreferrer" className="font-semibold text-radar underline underline-offset-2">NASA MCD64A1 details<span className="sr-only"> (opens in a new tab)</span></a></p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-subtle">
            <span>Feeds checked: {new Date(data.fetchedAt).toLocaleString('en-GB')}</span>
            {loading && <span className="inline-flex items-center gap-2" role="status"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Refreshing</span>}
          </div>
        </>
      )}
    </section>
  );
}
