import { useMemo } from 'react';
import { ArrowDown, ExternalLink, Flame, MapPinned } from 'lucide-react';
import type { MapDetection } from '@/components/maps/MadhyaPradeshMapCanvas';

interface StudyFindingsSummaryProps {
  detections: MapDetection[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  variant?: 'all' | 'summary' | 'charts';
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

export default function StudyFindingsSummary({ detections, selectedDate, onSelectDate, variant = 'all' }: StudyFindingsSummaryProps) {
  const summary = useMemo(() => {
    const dailyCounts = new Map<string, number>();
    const districtCounts = new Map<string, number>();
    const confidenceCounts = new Map<string, number>();

    detections.forEach((detection) => {
      const { date, district, confidence } = detection.properties;
      if (date) dailyCounts.set(date, (dailyCounts.get(date) ?? 0) + 1);
      if (district) districtCounts.set(district, (districtCounts.get(district) ?? 0) + 1);
      const label = confidence.trim().toLowerCase();
      if (label) confidenceCounts.set(label, (confidenceCounts.get(label) ?? 0) + 1);
    });

    const days = [...dailyCounts.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    const districts = [...districtCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const peak = days.reduce((best, day) => day.count > best.count ? day : best, { date: '', count: 0 });
    const maximumDay = Math.max(1, ...days.map((day) => day.count));
    const maximumDistrict = Math.max(1, ...districts.map((district) => district.count));
    return { days, districts, peak, maximumDay, maximumDistrict, confidenceCounts };
  }, [detections]);

  const firstDate = summary.days[0]?.date ?? '';
  const lastDate = summary.days[summary.days.length - 1]?.date ?? '';
  const topThreeShare = detections.length
    ? Math.round(summary.districts.slice(0, 3).reduce((total, district) => total + district.count, 0) / detections.length * 100)
    : 0;
  const nominal = summary.confidenceCounts.get('n') ?? summary.confidenceCounts.get('nominal') ?? 0;
  const high = summary.confidenceCounts.get('h') ?? summary.confidenceCounts.get('high') ?? 0;

  return (
    <section className="surface-card p-5 sm:p-7" aria-labelledby="findings-heading">
      {variant !== 'charts' && <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="eyebrow text-radar">Study result · Madhya Pradesh</p>
          <h2 id="findings-heading" className="mt-2 text-2xl sm:text-3xl">Where and when did satellites detect heat?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            NASA satellite data in this study shows more heat detections in a few districts, with counts changing by day. The busiest day was <strong className="text-ink">{summary.peak.date ? formatDate(summary.peak.date, { day: 'numeric', month: 'long', year: 'numeric' }) : 'not available'}</strong>, with <strong className="text-ink">{summary.peak.count.toLocaleString('en-US')}</strong> reports. These are clues for closer review, not confirmed fires.
          </p>
        </div>
        {onSelectDate && (
          <button type="button" onClick={() => summary.peak.date && onSelectDate(summary.peak.date)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-radar px-4 py-2 text-sm font-bold text-canvas transition hover:bg-radar-200">
            <MapPinned className="h-4 w-4" aria-hidden="true" /> See busiest day on map <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>}

      {variant !== 'charts' && <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Study summary">
        <div className="rounded-xl border border-ember/20 bg-ember/[.06] p-4">
          <p className="text-xs font-semibold text-muted">Satellite heat detections</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ember">{detections.length.toLocaleString('en-US')}</p>
          <p className="mt-1 text-xs text-subtle">reports in the study data</p>
        </div>
        <div className="rounded-xl border border-line bg-canvas/55 p-4">
          <p className="text-xs font-semibold text-muted">Days with observations</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-radar">{summary.days.length.toLocaleString('en-US')}</p>
        <p className="mt-1 text-xs text-subtle">{firstDate && lastDate ? `${formatDate(firstDate, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDate(lastDate, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'date range unavailable'}</p>
        </div>
        <div className="rounded-xl border border-line bg-canvas/55 p-4">
          <p className="text-xs font-semibold text-muted">Busiest day</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{summary.peak.count.toLocaleString('en-US')}</p>
          <p className="mt-1 text-xs text-subtle">detections on {summary.peak.date ? formatDate(summary.peak.date, { day: 'numeric', month: 'short' }) : '—'}</p>
        </div>
        <div className="rounded-xl border border-line bg-canvas/55 p-4">
          <p className="text-xs font-semibold text-muted">Highest district count</p>
          <p className="mt-1 truncate text-2xl font-bold text-ink">{summary.districts[0]?.name ?? '—'}</p>
          <p className="mt-1 text-xs text-subtle">{summary.districts[0]?.count.toLocaleString('en-US') ?? '0'} detections · top 3 districts had {topThreeShare}% of the total</p>
        </div>
      </div>}

      {variant !== 'summary' && <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <section className="rounded-xl border border-line bg-canvas/45 p-4 sm:p-5" aria-labelledby="daily-chart-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 id="daily-chart-heading" className="text-base font-bold">How daily detections changed</h3>
              <p className="mt-1 text-xs text-muted">{onSelectDate ? 'Select a bar to show that date on the map.' : 'The tallest bar marks the busiest day.'}</p>
            </div>
            {summary.peak.date && <span className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember">Peak · {formatDate(summary.peak.date, { day: 'numeric', month: 'short' })} · {summary.peak.count}</span>}
          </div>
          {summary.days.length ? (
            <>
              <div className="mt-4 overflow-x-auto pb-1">
                <div role={onSelectDate ? 'group' : 'img'} aria-label={onSelectDate ? 'Daily satellite heat detections. Select a day to view it on the map.' : 'Daily satellite heat-detection counts.'} className="flex h-36 min-w-[38rem] items-end gap-1 border-b border-line px-1">
                  {summary.days.map((day) => {
                    const isPeak = day.date === summary.peak.date;
                    const isSelected = day.date === selectedDate;
                    const height = Math.max(5, Math.round(day.count / summary.maximumDay * 112));
                    const barClass = `relative min-w-0 flex-1 rounded-t-sm ${isPeak ? 'bg-ember' : isSelected ? 'bg-radar' : 'bg-radar/55'}`;
                    const barTitle = `${formatDate(day.date, { day: 'numeric', month: 'long', year: 'numeric' })}: ${day.count} detections`;
                    return onSelectDate ? (
                      <button key={day.date} type="button" aria-label={`${barTitle}. Select this date on the map.`} aria-pressed={isSelected} title={barTitle} onClick={() => onSelectDate(day.date)} className={`${barClass} outline-none transition hover:brightness-125 focus-visible:ring-2 focus-visible:ring-white`} style={{ height: `${height}px` }} />
                    ) : <div key={day.date} role="img" aria-label={barTitle} title={barTitle} className={barClass} style={{ height: `${height}px` }} />;
                  })}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-subtle"><span>{formatDate(firstDate, { day: 'numeric', month: 'short' })}</span><span>{formatDate(lastDate, { day: 'numeric', month: 'short' })}</span></div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-radar/70" />Detections that day</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-ember" />Busiest day</span>
              </div>
            </>
          ) : <p className="mt-4 text-sm text-muted">No satellite heat detections are available for this period.</p>}
        </section>

        <section className="rounded-xl border border-line bg-canvas/45 p-4 sm:p-5" aria-labelledby="district-chart-heading">
          <h3 id="district-chart-heading" className="text-base font-bold">Districts with the most detections</h3>
          <p className="mt-1 text-xs text-muted">This study counted more detections in these districts.</p>
          <ol className="mt-4 space-y-3">
            {summary.districts.slice(0, 5).map((district, index) => (
              <li key={district.name} className="grid grid-cols-[1.3rem_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                <span className="text-xs text-subtle">{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2"><span className="truncate font-semibold text-ink">{district.name}</span><span className="tabular-nums text-muted">{district.count.toLocaleString('en-US')}</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-ember" style={{ width: `${Math.max(3, district.count / summary.maximumDistrict * 100)}%` }} /></div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg border border-line bg-paper/50 p-3 text-xs leading-relaxed text-muted">These totals do not rank fire danger. Larger districts or more satellite passes can collect more detections.</p>
        </section>
      </div>}

      {variant !== 'summary' && <div className="mt-4 flex gap-3 rounded-xl border border-radar/20 bg-radar/[.06] p-4">
        <Flame className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted"><strong className="text-ink">How to read this:</strong> each report marks heat seen by a satellite. Several reports can come from the same event, and some may not be fires. The map helps people decide what to check next; it does not confirm fires or show how much land burned.</p>
      </div>}

      {variant !== 'summary' && <details className="mt-4 rounded-xl border border-line bg-canvas/35 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-radar focus-visible:outline focus-visible:outline-2 focus-visible:outline-radar">Methods, limits and NASA sources</summary>
        <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted">
          <p>The charts and district totals are calculated from the archived NASA NOAA-21 satellite heat detections inside Madhya Pradesh. NASA’s confidence label describes signal quality; it is not a percentage chance. FRP means estimated heat output; it does not measure burned land.</p>
          <p>This project does not claim that fires caused a radar change. The radar previews are separate from the heat detections, and the calibrated, location-aligned NISAR measurements needed to measure change are not included.</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li><a className="inline-flex items-center gap-1 font-semibold text-radar underline underline-offset-2" href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA FIRMS data <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></li>
            <li><a className="inline-flex items-center gap-1 font-semibold text-radar underline underline-offset-2" href="https://www.earthdata.nasa.gov/sites/default/files/imported/VIIRS_activefire_User_Guide.pdf" target="_blank" rel="noopener noreferrer">NASA VIIRS guide <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></li>
            <li><a className="inline-flex items-center gap-1 font-semibold text-radar underline underline-offset-2" href="https://nisar-docs.asf.alaska.edu/gcov/" target="_blank" rel="noopener noreferrer">NISAR calibrated-data guide <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></li>
          </ul>
        </div>
      </details>}
    </section>
  );
}
