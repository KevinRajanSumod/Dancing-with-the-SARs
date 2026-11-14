import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, Flame, Layers, MoveHorizontal } from 'lucide-react';
import Card from '@/components/Card';
import SnapshotBadge from '@/components/SnapshotBadge';
import ToggleSwitch from '@/components/ToggleSwitch';
import BeforeAfterSlider from '@/components/map/BeforeAfterSlider';
import DensityHeatLayer from '@/components/map/DensityHeatLayer';
import DetectionMarkers from '@/components/map/DetectionMarkers';
import MapLegend from '@/components/map/MapLegend';
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
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-white/75 md:text-lg">
              {mode === 'archive' ? (
                <p>Compare two NASA-ISRO NISAR browse previews over central India, then explore the NASA FIRMS heat-detection snapshot for the same footprint. Radar and thermal detections are separate observations with different meanings.</p>
              ) : (
                <p>Live mode checks ASF’s NISAR catalog and the latest five-day NASA FIRMS feed. Remote browse previews and thermal detections remain separate so the display does not suggest a spatial match the quicklooks cannot support.</p>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-radar" />{mode === 'archive' ? '30 Sep → 5 Nov 2026' : 'ASF Search · NISAR GCOV'}</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ember" />NASA FIRMS · VIIRS / NOAA-21</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8" aria-label="Choose data view">
        <div className="inline-flex max-w-full flex-wrap gap-2 rounded-2xl border border-navy/10 bg-paper p-2 shadow-card" role="group" aria-label="Choose archived or live satellite data">
          <button type="button" aria-pressed={mode === 'archive'} onClick={() => setMode('archive')} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors ${mode === 'archive' ? 'bg-navy text-white' : 'text-navy hover:bg-canvas'}`}>
            Archive · Sep–Nov 2026
          </button>
          <button type="button" aria-pressed={mode === 'live'} onClick={() => setMode('live')} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors ${mode === 'live' ? 'bg-navy text-white' : 'text-navy hover:bg-canvas'}`}>
            Live · latest feeds
          </button>
        </div>
      </section>

      {mode === 'live' ? <LiveEarthDataStory /> : (
        <>
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 md:pt-12" aria-label="Map layers and date controls">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="surface-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Map layers</p>
                <h2 className="mt-2 text-2xl">Choose what to see</h2>
              </div>
              <Layers className="mt-1 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-3">
              <ToggleSwitch checked={showDayDetections} onChange={setShowDayDetections}>
                Show all {selectedDetections.length} detections from {longDate(selectedDate)}
              </ToggleSwitch>
              <ToggleSwitch checked={showDensity} onChange={setShowDensity}>
                Show density for all {detections.length.toLocaleString('en-US')} detections, 30 Sep–5 Nov
              </ToggleSwitch>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ember/10 text-ember"><Flame className="h-4 w-4" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-navy">{selectedDetections.length} detections on {longDate(selectedDate)}</p>
                <p className="text-xs text-ink/65">{selectedNominalCount} reported as nominal confidence</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Detection timeline</p>
                <h2 className="mt-2 text-2xl">Move through the snapshot</h2>
              </div>
              <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            </div>
            {timelineDates.length > 0 ? (
              <>
                <div className="mt-5 flex items-center justify-between gap-4">
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
                    className="h-2 min-w-0 flex-1 cursor-pointer accent-teal"
                  />
                  <output htmlFor="date-range" className="min-w-[8.5rem] rounded-lg bg-teal-50 px-3 py-2 text-center text-sm font-semibold tabular-nums text-navy">
                    {longDate(selectedDate)}
                  </output>
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink/55">
                  <span>{shortDate(timelineDates[0])}</span>
                  <span>{shortDate(timelineDates[timelineDates.length - 1])}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
                  <label htmlFor="date-select" className="text-sm font-medium text-ink/75">Jump to a date</label>
                  <select
                    id="date-select"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.currentTarget.value)}
                    className="min-h-10 max-w-full rounded-lg border border-navy/15 bg-white px-3 text-sm font-medium text-navy focus:border-teal"
                  >
                    {timelineDates.map((date) => <option key={date} value={date}>{longDate(date)}{(detectionsByDate.get(date)?.length ?? 0) === 0 ? ' · 0 detections' : ''}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <p role="status" className="mt-5 text-sm text-ink/70">No dated FIRMS records are available in this snapshot.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 md:py-8" aria-label="Radar comparison map">
        <div className="surface-card p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
            <div>
              <p className="eyebrow">NISAR / frequency A browse previews</p>
              <p className="mt-1 text-sm text-ink/60">Qualitative image comparison · footprint approximately 21.2–24.3° N, 76.6–80.0° E</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1.5 text-xs font-semibold text-navy"><MoveHorizontal className="h-3.5 w-3.5 text-teal" aria-hidden="true" />Drag or use arrow keys</span>
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
          </BeforeAfterSlider>
          {showDayDetections && selectedDetections.length === 0 && (
            <p role="status" className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs leading-relaxed text-ink/65">
              No FIRMS records fall inside the project footprint on {longDate(selectedDate)}. This does not establish that no fire occurred.
            </p>
          )}
          <div className="mt-3"><MapLegend /></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 px-1 pt-4 text-xs text-ink/55 sm:px-2">
            <SnapshotBadge />
            <span>Images: NASA-ISRO NISAR GCOV browse previews via ASF Vertex · FIRMS: NOAA-21 VIIRS</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 md:pb-12" aria-labelledby="story-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">The evidence in sequence</p>
          <h2 id="story-heading" className="mt-3">What this snapshot records</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">01 / 30 Sep → 5 Nov</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-navy">{detections.length.toLocaleString('en-US')}</p>
            <p className="mt-2 font-medium text-navy">FIRMS thermal detections</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">2,050 records fall inside the project footprint across the 38 daily source files. A row represents one sensor detection, not a unique fire.</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">02 / Confidence labels</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-navy">{confidenceCounts.nominal.toLocaleString('en-US')}</p>
            <p className="mt-2 font-medium text-navy">nominal-confidence records</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">The supplied snapshot also includes {confidenceCounts.low.toLocaleString('en-US')} low and {confidenceCounts.high.toLocaleString('en-US')} high-confidence detections. Confidence is a sensor classification, not field confirmation.</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">03 / 9 Oct 2026</p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-navy">{octNinthDetections.length}</p>
            <p className="mt-2 font-medium text-navy">detections on one date</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{octNinthNominalCount} carried nominal confidence. The daily record adds time context; it does not link a thermal point to a visible radar-brightness change.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 md:pb-28">
        <div className="rounded-2xl border border-ember/20 bg-ember/5 p-5 sm:p-7 md:flex md:items-start md:gap-4">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
          <div>
            <h2 className="text-xl">Read the comparison with care</h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/75 md:text-base">
              These are browse previews, not calibrated measurements or a change-detection product. The two supplied NISAR scenes also differ in their product polarization setup and processing version. The visual differences have not been quantified, and this project has not checked a burned-area product or field evidence. FIRMS points show satellite heat detections; they do not prove a fire occurred at every point, measure burned area, or establish that fire caused a radar change.
            </p>
            <a href="https://nisar-docs.asf.alaska.edu/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy">
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
