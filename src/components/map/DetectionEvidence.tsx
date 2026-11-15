import { useMemo } from 'react';
import { confidenceCounts, detections, detectionsByDate, detectionDates, isNominal, type Detection } from '@/data/detections';
const LOW = '#f88379';
const NOMINAL = '#f6b14d';
const HIGH = '#67d9ec';

function confidenceKind(value: string): 'low' | 'nominal' | 'high' | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'l' || normalized === 'low') return 'low';
  if (isNominal(normalized)) return 'nominal';
  if (normalized === 'h' || normalized === 'high') return 'high';
  return null;
}

function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

interface DailyCount {
  date: string;
  low: number;
  nominal: number;
  high: number;
}

function DailyBars({ rows, selectedDate, onSelectDate }: { rows: DailyCount[]; selectedDate: string; onSelectDate: (date: string) => void }) {
  const width = 1110;
  const height = 270;
  const left = 48;
  const right = 18;
  const top = 28;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const slot = plotWidth / rows.length;
  const barWidth = slot * 0.68;
  const maximum = Math.max(1, ...rows.map((row) => row.low + row.nominal + row.high));
  const scaleMaximum = Math.ceil(maximum / 10) * 10 || 10;
  const ticks = [0, 0.5, 1].map((fraction) => Math.round(scaleMaximum * fraction));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 block w-full min-w-[600px] sm:min-w-0" role="group" aria-label="Daily FIRMS detections stacked by reported confidence. Select a bar to update the map date.">
      <title>Daily thermal detections, stacked by reported confidence</title>
      {ticks.map((tick) => {
        const y = top + plotHeight - (tick / scaleMaximum) * plotHeight;
        return <g key={tick} aria-hidden="true"><line x1={left} x2={width - right} y1={y} y2={y} stroke="#405461" strokeWidth="1" /><text x={left - 8} y={y + 4} textAnchor="end" fill="#aab7be" fontSize="11">{tick}</text></g>;
      })}
      {rows.map((row, index) => {
        const x = left + index * slot + (slot - barWidth) / 2;
        const total = row.low + row.nominal + row.high;
        let y = top + plotHeight;
        const segments = [
          { key: 'low', count: row.low, fill: LOW },
          { key: 'nominal', count: row.nominal, fill: NOMINAL },
          { key: 'high', count: row.high, fill: HIGH },
        ];
        const barSegments = segments.map((segment) => {
          const segmentHeight = (segment.count / scaleMaximum) * plotHeight;
          y -= segmentHeight;
          return { ...segment, y, height: segmentHeight };
        });
        const labelVisible = index % 5 === 0 || index === rows.length - 1;
        return (
          <g
            key={row.date}
            role="button"
            tabIndex={0}
            aria-label={`${dateLabel(row.date, { day: 'numeric', month: 'long', year: 'numeric' })}: ${formatCount(total)} detections; ${row.low} low, ${row.nominal} nominal, ${row.high} high confidence. Select date.`}
            aria-pressed={selectedDate === row.date}
            onClick={() => onSelectDate(row.date)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectDate(row.date); } }}
            className="cursor-pointer outline-none focus-visible:opacity-75"
          >
            <title>{`${dateLabel(row.date, { day: 'numeric', month: 'long' })}: ${total} detections`}</title>
            {barSegments.map((segment) => segment.count > 0 && <rect key={segment.key} x={x} y={segment.y} width={barWidth} height={Math.max(1, segment.height)} fill={segment.fill} />)}
            <rect x={x} y={top} width={barWidth} height={plotHeight} fill="transparent" stroke={selectedDate === row.date ? '#ffffff' : 'transparent'} strokeWidth="1.5" />
            {labelVisible && <text x={left + (index + 0.5) * slot} y={height - 13} textAnchor="middle" fill="#aab7be" fontSize="10">{dateLabel(row.date)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export default function DetectionEvidence({ selectedDate, onSelectDate }: { selectedDate: string; onSelectDate: (date: string) => void }) {
  const dates = useMemo(() => detectionDates, []);
  const dailyCounts = useMemo<DailyCount[]>(() => dates.map((date) => {
    const counts = { low: 0, nominal: 0, high: 0 };
    (detectionsByDate.get(date) ?? []).forEach((detection) => {
      const kind = confidenceKind(detection.conf);
      if (kind) counts[kind] += 1;
    });
    return { date, ...counts };
  }), [dates]);

  const peak = useMemo(() => dailyCounts.reduce((best, row) => {
    const count = row.low + row.nominal + row.high;
    return count > best.count ? { date: row.date, count } : best;
  }, { date: dates[0], count: -1 }), [dailyCounts, dates]);

  const nominalHigh = confidenceCounts.nominal + confidenceCounts.high;
  const knownConfidence = nominalHigh + confidenceCounts.low;
  const nominalHighShare = knownConfidence ? (nominalHigh / knownConfidence) * 100 : 0;
  const lowShare = knownConfidence ? (confidenceCounts.low / knownConfidence) * 100 : 0;

  const selectedFrp = useMemo(() => {
    const values = (detectionsByDate.get(selectedDate) ?? [])
      .map((detection: Detection) => detection.frp)
      .filter((frp): frp is number => frp !== null && Number.isFinite(frp));
    return { count: values.length, median: median(values), maximum: values.length ? Math.max(...values) : null };
  }, [selectedDate]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 md:py-8" aria-labelledby="detection-evidence-heading">
      <div className="surface-card p-5 sm:p-6">
        <div className="max-w-3xl">
          <p className="eyebrow">FIRMS snapshot / temporal context</p>
          <h2 id="detection-evidence-heading" className="mt-2 text-2xl">Detection evidence</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">Daily thermal-detection records across the available archive. Select a bar to update the map and date controls.</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-line bg-raised/70 p-4">
            <p className="eyebrow !text-[10px]">Archive records</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ember">{formatCount(detections.length)}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Satellite detections available for this study area across the snapshot dates.</p>
          </article>
          <article className="rounded-xl border border-line bg-raised/70 p-4">
            <p className="eyebrow !text-[10px]">Peak day</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-radar">{formatCount(peak.count)}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{dateLabel(peak.date, { day: 'numeric', month: 'long', year: 'numeric' })} · detections</p>
          </article>
          <article className="rounded-xl border border-line bg-raised/70 p-4">
            <p className="eyebrow !text-[10px]">Reported confidence</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-analysis">{nominalHighShare.toFixed(1)}%</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Nominal + high of records with known confidence; low confidence {lowShare.toFixed(1)}%.</p>
          </article>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0 rounded-xl border border-line bg-canvas/55 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base">Daily detections by confidence</h3>
              <div className="flex flex-wrap gap-3 text-xs text-muted" aria-label="Chart legend">
                {[['Low', LOW], ['Nominal', NOMINAL], ['High', HIGH]].map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />{label}</span>)}
              </div>
            </div>
            <div className="overflow-x-auto">
              <DailyBars rows={dailyCounts} selectedDate={selectedDate} onSelectDate={onSelectDate} />
            </div>
            <p className="mt-1 text-xs text-muted" aria-live="polite">{dateLabel(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' })}: {(detectionsByDate.get(selectedDate) ?? []).length.toLocaleString('en-US')} detections. Choose a date bar to inspect its map records.</p>
          </div>
          <aside className="rounded-xl border border-line bg-canvas/55 p-4" aria-label="Selected date fire radiative power summary">
            <p className="eyebrow !text-[10px]">Selected date / FRP</p>
            <h3 className="mt-2 text-base">Fire radiative power</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">Fire radiative power (MW), a thermal intensity measure.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Records with FRP</dt><dd className="font-semibold tabular-nums text-ink">{selectedFrp.count}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Median</dt><dd className="font-semibold tabular-nums text-ink">{selectedFrp.median === null ? '—' : selectedFrp.median.toFixed(1)} MW</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Maximum</dt><dd className="font-semibold tabular-nums text-ink">{selectedFrp.maximum === null ? '—' : selectedFrp.maximum.toFixed(1)} MW</dd></div>
            </dl>
          </aside>
        </div>

        <p className="mt-5 rounded-lg border border-ember/20 bg-ember/5 px-4 py-3 text-xs leading-relaxed text-muted">Satellite detections are not burned area, one row is not necessarily one fire, near-real-time values can be revised, and this chart does not show that fire caused any radar change.</p>
      </div>
    </section>
  );
}
