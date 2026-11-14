import { firmsContext } from '@/data/firmsContext';

// One satellite detection. A detection is a heat signal, not a confirmed fire.
export interface Detection {
  lat: number;
  lon: number;
  date: string;
  time: string;
  conf: string;
  frp: number | null;
}

// Rows without a usable position cannot be drawn, so they are skipped.
function toDetection(row: unknown): Detection | null {
  if (typeof row !== 'object' || row === null) return null;
  const r = row as Record<string, unknown>;
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const frp = Number(r.frp);
  return {
    lat,
    lon,
    date: String(r.date ?? ''),
    time: String(r.time ?? ''),
    conf: String(r.conf ?? ''),
    frp: Number.isFinite(frp) ? frp : null,
  };
}

export const detections: Detection[] = firmsContext
  .map(toDetection)
  .filter((d): d is Detection => d !== null);

const NOMINAL_CONFIDENCE = new Set(['n', 'nominal']);

export function isNominal(conf: string): boolean {
  return NOMINAL_CONFIDENCE.has(conf.trim().toLowerCase());
}

// Dates are expected in YYYY-MM-DD form.
export const NOMINAL_DETECTION_DATE = '2026-10-09';

export const nominalDetections: Detection[] = detections.filter(
  (d) => d.date === NOMINAL_DETECTION_DATE && isNominal(d.conf),
);

// Dates and counts are derived from the supplied FIRMS snapshot; no days are interpolated.
export const detectionsByDate = detections.reduce<Map<string, Detection[]>>((byDate, detection) => {
  const rows = byDate.get(detection.date) ?? [];
  rows.push(detection);
  byDate.set(detection.date, rows);
  return byDate;
}, new Map());

export const detectionDates = [...detectionsByDate.keys()].sort();

export const confidenceCounts = detections.reduce(
  (counts, detection) => {
    const confidence = detection.conf.trim().toLowerCase();
    if (confidence === 'l' || confidence === 'low') counts.low += 1;
    else if (confidence === 'n' || confidence === 'nominal') counts.nominal += 1;
    else if (confidence === 'h' || confidence === 'high') counts.high += 1;
    return counts;
  },
  { low: 0, nominal: 0, high: 0 },
);
