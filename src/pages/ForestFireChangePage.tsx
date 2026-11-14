import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, Flame, Layers, MoveHorizontal } from 'lucide-react';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import SnapshotBadge from '@/components/SnapshotBadge';
import ToggleSwitch from '@/components/ToggleSwitch';
import BeforeAfterSlider from '@/components/map/BeforeAfterSlider';
import DensityHeatLayer from '@/components/map/DensityHeatLayer';
import DetectionMarkers from '@/components/map/DetectionMarkers';
import MapLegend from '@/components/map/MapLegend';
import ModisBurnedAreaPanel from '@/components/ModisBurnedAreaPanel';
import { confidenceCounts, detections, detectionsByDate, isNominal, NOMINAL_DETECTION_DATE } from '@/data/detections';
import LiveEarthDataStory from '@/pages/LiveEarthDataStory';

const FIRST_SCENE = '2026-09-30';
const LAST_SCENE = '2026-11-05';

function datesInWindow(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

const timelineDates = datesInWindow(FIRST_SCENE, LAST_SCENE);

function shortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function longDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function ForestFireChangePage() {
  const [mode, setMode] = useState<'archive' | 'live'>('archive');
  const [showDensity, setShowDensity] = useState(false);
  const [showDayDetections, setShowDayDetections] = useState(true);
  const [showModisBurnDate, setShowModisBurnDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(NOMINAL_DETECTION_DATE);
  const selectedIndex = Math.max(0, timelineDates.indexOf(selectedDate));
  const selectedDetections = detectionsByDate.get(selectedDate) ?? [];
  const selectedNominalCount = useMemo(() => selectedDetections.filter((detection) => isNominal(detection.conf)).length, [selectedDetections]);
  const octNinthDetections = detectionsByDate.get(NOMINAL_DETECTION_DATE) ?? [];
  const octNinthNominalCount = octNinthDetections.filter((detection) => isNominal(detection.conf)).length;

  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 md:pb-16 md:pt-20">
          <div className="max-w-4xl">
            <p className="eyebrow text-radar">Field note / Track 5 · Frame 77</p>
            <h1 className="mt-4 max-w-4xl text-white">{mode === 'archive' ? 'A 36-day radar comparison' : 'Explore the latest NISAR and fire feeds'}</h1>
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted md:text-lg">
              {mode === 'archive' ? (
                <p>Compare two NASA-ISRO NISAR browse previews over central India, then explore the NASA FIRMS heat-detection snapshot for the same footprint. Radar and thermal detections are separate observations with different meanings.</p>
              ) : (
                <p>Live mode checks ASF’s NISAR catalog and the latest five-day NASA FIRMS feed. Remote browse previews and thermal detections remain separate so the display does not suggest a spatial match the quicklooks cannot support.</p>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-radar" />{mode === 'archive' ? '30 Sep → 5 Nov 2026' : 'ASF Search · NISAR GCOV'}</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ember" />NASA FIRMS · VIIRS / NOAA-21</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8" aria-label="Choose data view">
        <div className="inline-flex max-w-full flex-wrap gap-2 rounded-2xl border border-line bg-paper p-2 shadow-card" role="group" aria-label="Choose archived or live satellite data">
          <button type="button" aria-pressed={mode === 'archive'} onClick={() => setMode('archive')} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors ${mode === 'archive' ? 'bg-radar/10 text-radar ring-1 ring-inset ring-radar/25' : 'text-muted hover:bg-raised hover:text-ink'}`}>
            Archive · Sep–Nov 2026
          </button>
          <button type="button" aria-pressed={mode === 'live'} onClick={() => setMode('live')} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors ${mode === 'live' ? 'bg-radar/10 text-radar ring-1 ring-inset ring-radar/25' : 'text-muted hover:bg-raised hover:text-ink'}`}>
            Live · latest feeds
          </button>
        </div>
      </section>

      {mode === 'live' ? <LiveEarthDataStory /> : (
        <>
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 md:pt-12" aria-label="Map layers and date controls">
        <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="h-full">
          <div className="surface-card h-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Map layers</p>
                <h2 className="mt-2 text-2xl">Choose what to see</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-radar/20 bg-radar/10 text-radar">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <ToggleSwitch checked={showDayDetections} onChange={setShowDayDetections}>
                Show all {selectedDetections.length} detections from {longDate(selectedDate)}
              </ToggleSwitch>
              <ToggleSwitch checked={showDensity} onChange={setShowDensity}>
                Show density for all {detections.length.toLocaleString('en-US')} detections, 30 Sep–5 Nov
              </ToggleSwitch>
              <ToggleSwitch checked={showModisBurnDate} onChange={setShowModisBurnDate}>
                Show MODIS MCD64A1 burn-date pixels · Sep 2026 (500 m)
              </ToggleSwitch>
            </div>
          </div>
          </Reveal>

          <Reveal className="h-full">
          <div className="surface-card h-full p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Detection timeline</p>
                <h2 className="mt-2 text-2xl">Move through the snapshot</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-date/20 bg-date/10 text-date">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            {timelineDates.length > 0 ? (
              <>
                <div className="mt-5 grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                  <label htmlFor="date-range" className="sr-only">Choose a date in the detection snapshot</label>
                  <input
                    id="date-range"
                    type="range"
                    min={0}
                    max={Math.max(0, timelineDates.length - 1)}
                    step={1}
                    value={selectedIndex}
                    onChange={(event) => setSelectedDate(timelineDates[Number(event.currentTarget.value)])}
                    aria-valuetext={`${longDate(selectedDate)}; ${selectedDetections.length} detections`}
                    className="timeline-range min-w-0 cursor-pointer"
                    style={{ '--range-progress': `${(selectedIndex / Math.max(1, timelineDates.length - 1)) * 100}%` } as CSSProperties & { '--range-progress': string }}
                  />
                  <output htmlFor="date-range" className="inline-flex min-h-10 min-w-[10rem] items-center justify-center rounded-lg border border-date/30 bg-date/10 px-3 py-2 text-center text-sm font-semibold tabular-nums text-date sm:justify-self-end">
                    {longDate(selectedDate)}
                  </output>
                </div>
                <div className="mt-2 flex justify-between text-xs text-subtle">
                  <span>{shortDate(timelineDates[0])}</span>
                  <span>{shortDate(timelineDates[timelineDates.length - 1])}</span>
                </div>
                <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,19rem)] sm:items-center sm:gap-4">
                  <label htmlFor="date-select" className="text-sm font-medium text-muted">Jump to a date</label>
                  <select
                    id="date-select"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.currentTarget.value)}
                    className="min-h-11 w-full min-w-0 rounded-lg border border-line-strong bg-raised px-3 text-sm font-medium text-ink focus:border-date"
                  >
                    {timelineDates.map((date) => <option key={date} value={date}>{longDate(date)}{(detectionsByDate.get(date)?.length ?? 0) === 0 ? ' · 0 detections' : ''}</option>)}
                  </select>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-ember/20 bg-ember/5 px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ember/10 text-ember">
                    <Flame className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{selectedDetections.length} detections on {longDate(selectedDate)}</p>
                    <p className="text-xs text-muted">{selectedNominalCount} reported as nominal confidence</p>
                  </div>
                </div>
              </>
            ) : (
              <p role="status" className="mt-5 text-sm text-muted">No dated FIRMS records are available in this snapshot.</p>
            )}
          </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 md:py-8" aria-label="Radar comparison map">
        <Reveal>
        <div className="surface-card p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
            <div>
              <p className="eyebrow">NISAR / frequency A browse previews</p>
              <p className="mt-1 text-sm text-subtle">Qualitative image comparison · footprint approximately 21.2–24.3° N, 76.6–80.0° E</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1.5 text-xs font-semibold text-ink"><MoveHorizontal className="h-3.5 w-3.5 text-radar" aria-hidden="true" />Drag or use arrow keys</span>
          </div>
          <BeforeAfterSlider
            beforeSrc="/images/map/before_overlay.png"
            afterSrc="/images/map/after_overlay.png"
            beforeAlt="Grayscale NISAR L-band browse preview for central India, acquired 30 September 2026. Brightness shows returned radar signal and is not a measured change map."
            afterAlt="Grayscale NISAR L-band browse preview for central India, acquired 5 November 2026. Brightness shows returned radar signal and is not a measured change map."
            beforeLabel="Before · 30 Sep 2026"
            afterLabel="After · 5 Nov 2026"
          >
            {showDensity && <DensityHeatLayer detections={detections} />}
            {showDayDetections && <DetectionMarkers detections={selectedDetections} />}
            {showModisBurnDate && <img src="/data/modis/mcd64a1-2026-09-overlay.png" alt="MODIS MCD64A1 September 2026 burned pixels, derived from the supplied NASA burn-date raster" className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-fill" />}
          </BeforeAfterSlider>
          {showDayDetections && selectedDetections.length === 0 && (
            <p role="status" className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs leading-relaxed text-muted">
              No FIRMS records fall inside the project footprint on {longDate(selectedDate)}. This does not establish that no fire occurred.
            </p>
          )}
          <div className="mt-3"><MapLegend /></div>
          <p className="mt-3 rounded-lg border border-ember/20 bg-ember/5 px-3 py-2 text-xs leading-relaxed text-muted">MODIS MCD64A1 recorded 32 burn-date pixels in this footprint for September 2026; all 32 pass the product QA land and valid-data bits. Burn dates fall on 21–30 September. This 500 m monthly product is separate evidence and does not establish that fire caused the NISAR preview contrast.</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 pt-4 text-xs text-subtle sm:px-2">
            <SnapshotBadge />
            <span>Images: NASA-ISRO NISAR GCOV browse previews via ASF Vertex · FIRMS: NOAA-21 VIIRS</span>
          </div>
        </div>
        </Reveal>
      </section>

      <ModisBurnedAreaPanel />

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 md:pb-12" aria-labelledby="story-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">The evidence in sequence</p>
          <h2 id="story-heading" className="mt-3">What this snapshot records</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember">01 / 30 Sep → 5 Nov</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-ink">{detections.length.toLocaleString('en-US')}</p>
            <p className="mt-2 font-medium text-ink">FIRMS thermal detections</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">2,050 records fall inside the project footprint across the 38 daily source files. A row represents one sensor detection, not a unique fire.</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-analysis">02 / Confidence labels</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-ink">{confidenceCounts.nominal.toLocaleString('en-US')}</p>
            <p className="mt-2 font-medium text-ink">nominal-confidence records</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">The supplied snapshot also includes {confidenceCounts.low.toLocaleString('en-US')} low and {confidenceCounts.high.toLocaleString('en-US')} high-confidence detections. Confidence is a sensor classification, not field confirmation.</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-date">03 / 9 Oct 2026</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-ink">{octNinthDetections.length}</p>
            <p className="mt-2 font-medium text-ink">detections on one date</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{octNinthNominalCount} carried nominal confidence. The daily record adds time context; it does not link a thermal point to a visible radar-brightness change.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 md:pb-28">
        <div className="rounded-2xl border border-ember/20 bg-ember/5 p-5 sm:p-7 md:flex md:items-start md:gap-4">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
          <div>
            <h2 className="text-xl">Read the comparison with care</h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted md:text-base">
              These are browse previews, not calibrated measurements or a change-detection product. The two supplied NISAR scenes also differ in their product polarization setup and processing version. The visual differences have not been quantified. The independent MCD64A1 panel above provides monthly burned-area context, but it is not matched to the browse previews. FIRMS points show satellite heat detections; they do not prove a fire occurred at every point, measure burned area, or establish that fire caused a radar change.
            </p>
            <a href="https://nisar-docs.asf.alaska.edu/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-radar hover:text-radar">
              Read the NISAR Data User Guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
        </>
      )}
    </>
  );
}
