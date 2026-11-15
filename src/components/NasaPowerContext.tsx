import { useCallback, useEffect, useMemo, useState } from 'react';
import { CloudRain, ExternalLink, RefreshCw } from 'lucide-react';

const API_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const START_DATE = '20260930';
const END_DATE = '20261105';
const REQUEST_LATITUDE = 22.75;
const REQUEST_LONGITUDE = 78.28;
const CACHE_KEY = 'nasa-power-central-india-20260930-20261105-v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface DailyContext {
  date: string;
  precipitationMm: number | null;
}

interface PowerContextData {
  records: DailyContext[];
  gridLongitude: number;
  gridLatitude: number;
}

interface PowerApiResponse {
  geometry?: { coordinates?: number[] };
  properties?: { parameter?: Record<string, Record<string, number>> };
}

interface StoredContext {
  storedAt: number;
  data: PowerContextData;
}

let memoryCache: StoredContext | null = null;
let pendingRequest: Promise<PowerContextData> | null = null;

function readCache(): StoredContext | null {
  if (memoryCache && Date.now() - memoryCache.storedAt < CACHE_TTL_MS) return memoryCache;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredContext;
    if (!parsed?.data?.records || Date.now() - parsed.storedAt >= CACHE_TTL_MS) return null;
    memoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchContext(): Promise<PowerContextData> {
  const cached = readCache();
  if (cached) return cached.data;
  if (pendingRequest) return pendingRequest;

  const params = new URLSearchParams({
    parameters: 'PRECTOTCORR',
    community: 'AG',
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
    const precipitation = parameters?.PRECTOTCORR;
    if (!precipitation) throw new Error('NASA POWER did not return daily precipitation.');

    const records = Object.keys(precipitation).sort().map((date) => {
      const rain = Number(precipitation[date]);
      return {
        date,
        precipitationMm: Number.isFinite(rain) && rain !== -999 ? rain : null,
      };
    }).filter((record) => record.precipitationMm !== null);

    if (records.length === 0) throw new Error('NASA POWER returned no usable values for this date window.');
    const coordinates = payload.geometry?.coordinates ?? [REQUEST_LONGITUDE, REQUEST_LATITUDE];
    const data: PowerContextData = {
      records,
      gridLongitude: Number(coordinates[0]),
      gridLatitude: Number(coordinates[1]),
    };
    const stored = { storedAt: Date.now(), data };
    memoryCache = stored;
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
    } catch {
      // The in-memory response still prevents repeat requests for this page session.
    }
    return data;
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}

function displayDate(date: string): string {
  return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00Z`)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function formatNumber(value: number | null, digits = 1): string {
  return value === null ? '—' : value.toLocaleString('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export default function NasaPowerContext() {
  const [data, setData] = useState<PowerContextData | null>(null);
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
      setError(reason instanceof Error ? reason.message : 'NASA POWER context could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const summaries = useMemo(() => {
    const records = data?.records ?? [];
    const rainfall = records.flatMap((record) => record.precipitationMm === null ? [] : [record.precipitationMm]);
    const wettestDay = records.reduce<DailyContext | null>((best, record) => (
      record.precipitationMm !== null && (best?.precipitationMm === null || best?.precipitationMm === undefined || record.precipitationMm > best.precipitationMm)
        ? record
        : best
    ), null);
    return {
      totalRain: rainfall.length ? rainfall.reduce((sum, value) => sum + value, 0) : null,
      rainDays: rainfall.filter((value) => value >= 1).length,
      rainCoverage: rainfall.length,
      wettestDay,
    };
  }, [data]);

  const selectedRecord = data?.records.find((record) => record.date === selectedDate) ?? data?.records[data.records.length - 1];
  const chartRecords = data?.records ?? [];
  const maxPrecipitation = Math.max(1, ...chartRecords.map((record) => record.precipitationMm ?? 0));

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-3 sm:px-8 md:pb-20" aria-labelledby="power-heading">
      <div className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar"><CloudRain className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">NASA POWER · rainfall context for SAR</p>
              <h2 id="power-heading" className="mt-2 text-xl text-ink sm:text-2xl">Could rainfall have influenced the radar return?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Rain can change soil and canopy wetness, which can affect L-band radar backscatter without a lasting land-cover change. These daily, model-based precipitation values add regional context for 30 Sep–5 Nov 2026; they are not measurements at each radar pixel or proof of a cause. POWER’s meteorological fields use NASA GMAO MERRA-2 data.</p>
            </div>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 text-xs font-semibold text-ink transition hover:bg-raised disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh NASA data
          </button>
        </div>

        {loading && !data && <p role="status" className="mt-5 rounded-xl border border-line bg-canvas/70 p-4 text-sm text-muted">Loading daily values from the NASA POWER API…</p>}
        {error && (
          <div role="status" className="mt-5 rounded-xl border border-ember/25 bg-ember/5 p-4 text-sm text-muted">
            <p>NASA POWER is unavailable right now: {error}</p>
            <button type="button" onClick={() => void refresh()} className="mt-2 font-semibold text-ember underline underline-offset-4">Try again</button>
          </div>
        )}

        {data && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-canvas/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[.13em] text-subtle">Rainfall total</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{formatNumber(summaries.totalRain)} <span className="text-sm font-medium text-muted">mm</span></p>
                <p className="mt-1 text-xs text-muted">{summaries.rainCoverage} daily values in the window</p>
              </div>
              <div className="rounded-xl border border-line bg-canvas/65 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.13em] text-subtle"><CloudRain className="h-3.5 w-3.5 text-radar" aria-hidden="true" /> Wet days</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{summaries.rainDays}</p>
                <p className="mt-1 text-xs text-muted">days with at least 1 mm at the grid cell</p>
              </div>
              <div className="rounded-xl border border-line bg-canvas/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[.13em] text-subtle">Wettest day</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{formatNumber(summaries.wettestDay?.precipitationMm ?? null)} <span className="text-sm font-medium text-muted">mm</span></p>
                <p className="mt-1 text-xs text-muted">{summaries.wettestDay ? displayDate(summaries.wettestDay.date) : 'no daily value available'}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-canvas/55 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">Daily precipitation <span className="font-normal text-muted">· select a bar for the day</span></p>
                <span className="rounded-full border border-radar/20 bg-radar/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-radar">mm / day</span>
              </div>
              <div className="mt-4 grid h-20 items-end gap-1 sm:h-24 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.max(chartRecords.length, 1)}, minmax(2px, 1fr))` }} role="group" aria-label="NASA POWER daily precipitation values; select a date bar to read the exact value">
                {chartRecords.map((record) => {
                  const amount = record.precipitationMm;
                  const height = amount === null ? 2 : Math.max(5, (amount / maxPrecipitation) * 100);
                  const label = `${displayDate(record.date)}: ${formatNumber(amount)} mm`;
                  return (
                    <button key={record.date} type="button" title={label} aria-label={label} aria-pressed={record.date === selectedDate} onClick={() => setSelectedDate(record.date)} className={`min-w-0 rounded-t-sm transition-colors ${amount === null ? 'bg-line' : record.date === selectedDate ? 'bg-ember' : 'bg-radar/80 hover:bg-ember/80'}`} style={{ height: `${height}%` }} />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-subtle"><span>{chartRecords[0] ? displayDate(chartRecords[0].date) : '—'}</span><span>{chartRecords.length ? displayDate(chartRecords[chartRecords.length - 1].date) : '—'}</span></div>
              {selectedRecord && (
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-line bg-raised/70 px-3 py-2 text-xs text-muted" aria-live="polite">
                  <span className="font-semibold text-ink">{displayDate(selectedRecord.date)}</span>
                  <span>{formatNumber(selectedRecord.precipitationMm)} mm precipitation</span>
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-3xl">Nearest NASA POWER grid cell to 22.75° N, 78.28° E: {data.gridLatitude.toFixed(3)}° N, {data.gridLongitude.toFixed(3)}° E. This coarse rainfall estimate helps check wetness as a possible influence on SAR backscatter; it is not a radar-pixel measurement or evidence of fire.</p>
              <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2">
                <a href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4 hover:text-navy">API details <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
                <a href="https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4 hover:text-navy">Data source & resolution <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
