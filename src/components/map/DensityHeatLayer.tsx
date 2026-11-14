import { useMemo } from 'react';
import type { Detection } from '@/data/detections';
import { toFramePercent } from '@/data/studyArea';

const GRID_SIZE = 24;
const CELL_ALPHA = 0.85;

type Rgb = [number, number, number];
const PALE_AMBER: Rgb = [252, 239, 214];
const AMBER: Rgb = [232, 163, 61];
const DARK_RED: Rgb = [139, 30, 30];

function mix(from: Rgb, to: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => Math.round(from[i] + (to[i] - from[i]) * t)) as Rgb;
}

// Pale amber for the fewest detections, through amber, to dark red for the most.
function densityColour(t: number): string {
  const [r, g, b] = t <= 0.5 ? mix(PALE_AMBER, AMBER, t * 2) : mix(AMBER, DARK_RED, (t - 0.5) * 2);
  return `rgba(${r}, ${g}, ${b}, ${CELL_ALPHA})`;
}

interface DensityHeatLayerProps {
  detections: Detection[];
}

// Counts detections in a grid over the footprint and shades each cell by its count.
export default function DensityHeatLayer({ detections }: DensityHeatLayerProps) {
  const cells = useMemo(() => {
    const counts = new Map<number, number>();
    for (const detection of detections) {
      const { x, y } = toFramePercent(detection.lat, detection.lon);
      if (x < 0 || x > 100 || y < 0 || y > 100) continue;
      const col = Math.min(GRID_SIZE - 1, Math.floor((x / 100) * GRID_SIZE));
      const row = Math.min(GRID_SIZE - 1, Math.floor((y / 100) * GRID_SIZE));
      const key = row * GRID_SIZE + col;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()].map(([key, count]) => ({
      col: key % GRID_SIZE,
      row: Math.floor(key / GRID_SIZE),
      colour: densityColour(count / max),
    }));
  }, [detections]);

  const cellPercent = 100 / GRID_SIZE;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {cells.map((cell) => (
        <div
          key={`${cell.row}-${cell.col}`}
          className="absolute"
          style={{
            left: `${cell.col * cellPercent}%`,
            top: `${cell.row * cellPercent}%`,
            width: `${cellPercent}%`,
            height: `${cellPercent}%`,
            backgroundColor: cell.colour,
          }}
        />
      ))}
    </div>
  );
}
