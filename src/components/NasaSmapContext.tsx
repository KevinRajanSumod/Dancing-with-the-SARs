import { useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, ExternalLink, RefreshCw } from 'lucide-react';

const API_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const START_DATE = '20260930';
const END_DATE = '20261105';
const REQUEST_LATITUDE = 22.75;
const REQUEST_LONGITUDE = 78.28;
const CACHE_KEY = 'nasa-power-smap-central-india-20260930-20261105-v1';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

interface MoistureDay {
  date: string;
  surface: number | null;
  rootZone: number | null;
}

interface SmapContextData {
  records: MoistureDay[];
  gridLongitude: number;
  gridLatitude: number;
  sources: string[];
}

interface PowerApiResponse {
  header?: { sources?: string[] };
  geometry?: { coordinates?: number[] };
  properties?: { parameter?: Record<string, Record<string, number>> };
}

interface StoredData {
  storedAt: number;
  data: SmapContextData;
}

let memoryCache: StoredData | null = null;
let pendingRequest: Promise<SmapContextData> | null = null;

function readCache(): StoredData | null {
  if (memoryCache && Date.now() - memoryCache.storedAt < CACHE_TTL_MS) return memoryCache;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredData;
    if (!parsed?.data?.records || Date.now() - parsed.storedAt >= CACHE_TTL_MS) return null;
    memoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function parseValue(value: number | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== -999 ? parsed : null;
}

async function fetchContext(): Promise<SmapContextData> {
  const cached = readCache();
  if (cached) return cached.data;
  if (pendingRequest) return pendingRequest;

  const params = new URLSearchParams({
    parameters: 'SFMC,RZMC',
    community: 'HY',
    longitude: String(REQUEST_LONGITUDE),
    latitude: String(REQUEST_LATITUDE),
    start: START_DATE,
    end: END_DATE,
    format: 'JSON',
    'time-standard': 'UTC',
  });

  pendingRequest = (async () => {
    const response = await fetch(`${API_URL}?${params.toString()}`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`NASA POWER returned HTTP ${response.status}.`);
    const payload = await response.json() as PowerApiResponse;
    const parameters = payload.properties?.parameter;
    const surface = parameters?.SFMC;
    const rootZone = parameters?.RZMC;
    if (!surface || !rootZone) throw new Error('NASA POWER did not return the requested SMAP moisture fields.');

    const dates = [...new Set([...Object.keys(surface), ...Object.keys(rootZone)])].sort();
    const records = dates.map((date) => ({
      date,
      surface: parseValue(surface[date]),
      rootZone: parseValue(rootZone[date]),
    })).filter((record) => record.surface !== null || record.rootZone !== null);
    if (records.length === 0) throw new Error('NASA POWER returned no usable SMAP values for this date window.');

    const coordinates = payload.geometry?.coordinates ?? [REQUEST_LONGITUDE, REQUEST_LATITUDE];
    const data: SmapContextData = {
      records,
      gridLongitude: Number(coordinates[0]),
      gridLatitude: Number(coordinates[1]),
      sources: payload.header?.sources ?? [],
    };
    const stored = { storedAt: Date.now(), data };
    memoryCache = stored;
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
    } catch {
      // The in-memory cache still avoids repeat calls in this page session.
    }
    return data;
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}

function dateLabel(date: string): string {
  return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00Z`)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function formatValue(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('en-GB', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export default function NasaSmapContext() {
  const [data, setData] = useState<SmapContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchContext();
      setData(result);
      setSelectedDate((current) => current || result.records[result.records.length - 1]?.date || '');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'NASA SMAP context could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const summaries = useMemo(() => {
    const surface = data?.records.flatMap((record) => record.surface === null ? [] : [record.surface]) ?? [];
    const root = data?.records.flatMap((record) => record.rootZone === null ? [] : [record.rootZone]) ?? [];
    const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    return { meanSurface: mean(surface), meanRoot: mean(root), days: Math.max(surface.length, root.length) };
  }, [data]);

  const selected = data?.records.find((record) => record.date === selectedDate) ?? data?.records[data.records.length - 1];
  const maxMoisture = Math.max(0.05, ...(data?.records.map((record) => record.surface ?? 0) ?? []));

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-3 sm:px-8 md:pb-20" aria-labelledby="smap-heading">
      <div className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><Droplets className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">NASA POWER Hydrology · SMAP L4</p>
              <h2 id="smap-heading" className="mt-2 text-xl text-ink sm:text-2xl">Daily soil moisture near the study area.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Surface (0–5 cm) and root-zone (0–100 cm) volumetric moisture, 30 Sep–5 Nov 2026. Click a day to inspect its values.</p>
            </div>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 text-xs font-semibold text-ink transition hover:bg-raised disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh NASA data
          </button>
        </div>

        {loading && !data && <p role="status" className="mt-5 rounded-xl border border-line bg-canvas/70 p-4 text-sm text-muted">Loading daily SMAP L4 values from NASA POWER…</p>}
        {error && <div role="status" className="mt-5 rounded-xl border border-ember/25 bg-ember/5 p-4 text-sm text-muted"><p>NASA SMAP data is unavailable right now: {error}</p><button type="button" onClick={() => void refresh()} className="mt-2 font-semibold text-ember underline underline-offset-4">Try again</button></div>}

        {data && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-canvas/65 p-4"><p className="text-xs font-semibold uppercase tracking-[.13em] text-subtle">Mean surface moisture</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{formatValue(summaries.meanSurface)} <span className="text-sm font-medium text-muted">m³/m³</span></p><p className="mt-1 text-xs text-muted">top 0–5 cm · window mean</p></div>
              <div className="rounded-xl border border-line bg-canvas/65 p-4"><p className="text-xs font-semibold uppercase tracking-[.13em] text-subtle">Mean root-zone moisture</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{formatValue(summaries.meanRoot)} <span className="text-sm font-medium text-muted">m³/m³</span></p><p className="mt-1 text-xs text-muted">0–100 cm column · window mean</p></div>
              <div className="rounded-xl border border-line bg-canvas/65 p-4"><p className="text-xs font-semibold uppercase tracking-[.13em] text-subtle">Available daily records</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{summaries.days}</p><p className="mt-1 text-xs text-muted">of at most 37 dates in this window</p></div>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-canvas/55 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">Surface soil moisture <span className="font-normal text-muted">· select a date</span></p><span className="rounded-full border border-radar/20 bg-radar/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-radar">m³/m³</span></div>
              <div className="mt-4 grid h-24 items-end gap-1 sm:h-28" style={{ gridTemplateColumns: `repeat(${Math.max(data.records.length, 1)}, minmax(2px, 1fr))` }} role="group" aria-label="NASA SMAP L4 daily surface moisture values; select a date bar to read the values">
                {data.records.map((record) => {
                  const amount = record.surface;
                  const height = amount === null ? 2 : Math.max(5, (amount / maxMoisture) * 100);
                  const label = `${dateLabel(record.date)}: ${formatValue(amount)} m³/m³ surface moisture`;
                  return <button key={record.date} type="button" title={label} aria-label={label} aria-pressed={record.date === selectedDate} onClick={() => setSelectedDate(record.date)} className={`min-w-0 rounded-t-sm transition-colors ${amount === null ? 'bg-line' : record.date === selectedDate ? 'bg-ember' : 'bg-radar/80 hover:bg-ember/80'}`} style={{ height: `${height}%` }} />;
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-subtle"><span>{dateLabel(data.records[0].date)}</span><span>{dateLabel(data.records[data.records.length - 1].date)}</span></div>
              {selected && <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-line bg-raised/70 px-3 py-2 text-xs text-muted" aria-live="polite"><span className="font-semibold text-ink">{dateLabel(selected.date)} 2026</span><span>{formatValue(selected.surface)} m³/m³ surface</span><span>{formatValue(selected.rootZone)} m³/m³ root zone</span></p>}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-3xl">Nearest requested point to 22.75° N, 78.28° E: {data.gridLatitude.toFixed(3)}° N, {data.gridLongitude.toFixed(3)}° E. NASA’s L4_SM product is native ~9 km and served by POWER on a ~0.09° grid with daily UTC values. It is regional context, not field-level moisture or an explanation for the browse-image contrast.</p>
              <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2"><a href="https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">POWER SMAP method <ExternalLink className="h-3 w-3" aria-hidden="true" /></a><a href="https://nsidc.org/data/spl4smgp/versions/8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NSIDC product record <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
