import { useEffect, useState, type PointerEvent } from 'react';
import { X } from 'lucide-react';
import { isNominal, type Detection } from '@/data/detections';
import { toFramePercent } from '@/data/studyArea';

interface DetectionMarkersProps {
  detections: Detection[];
}

function popupTransform(x: number, y: number): string {
  const translateX = x < 25 ? '0%' : x > 75 ? '-100%' : '-50%';
  const translateY = y < 40 ? '16px' : 'calc(-100% - 16px)';
  return `translate(${translateX}, ${translateY})`;
}

// Stops taps on markers and popups from also moving the before and after divider.
function stopPointer(event: PointerEvent<HTMLDivElement>) {
  event.stopPropagation();
}

export default function DetectionMarkers({ detections }: DetectionMarkersProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex]);

  const selected = selectedIndex !== null ? detections[selectedIndex] : undefined;
  const selectedPosition = selected ? toFramePercent(selected.lat, selected.lon) : null;

  return (
    <div className="pointer-events-none absolute inset-0" onPointerDown={stopPointer}>
      {detections.map((detection, index) => {
        const { x, y } = toFramePercent(detection.lat, detection.lon);
        const isSelected = index === selectedIndex;
        return (
          <button
            key={`${detection.lat}-${detection.lon}-${detection.date}-${detection.time}-${index}`}
            type="button"
            aria-label={`Satellite detection on ${detection.date} at ${detection.time}, show details`}
            aria-pressed={isSelected}
            onClick={() => setSelectedIndex(isSelected ? null : index)}
            className="pointer-events-auto absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ember shadow-[0_0_0_1px_rgba(7,24,40,.55)] transition-transform duration-150 hover:scale-150 focus-visible:scale-150"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })}

      {selected && selectedPosition && (
        <div
          role="dialog"
          aria-label="Detection details"
          className="pointer-events-auto absolute z-10 w-64 rounded-2xl border border-navy/10 bg-paper p-4 text-sm text-ink shadow-lift"
          style={{
            left: `${selectedPosition.x}%`,
            top: `${selectedPosition.y}%`,
            transform: popupTransform(selectedPosition.x, selectedPosition.y),
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg">Thermal detection</h3>
            <button
              type="button"
              aria-label="Close detection details"
              onClick={() => setSelectedIndex(null)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-navy-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
            <dt className="font-semibold text-navy">Date</dt>
            <dd>{selected.date || 'Not given'}</dd>
            <dt className="font-semibold text-navy">Time</dt>
            <dd>{selected.time ? `${selected.time} UTC` : 'Not given'}</dd>
            <dt className="font-semibold text-navy">Confidence</dt>
            <dd>{selected.conf ? (isNominal(selected.conf) ? 'Nominal' : selected.conf) : 'Not given'}</dd>
            <dt className="font-semibold text-navy">FRP</dt>
            <dd>{selected.frp !== null ? `${selected.frp} MW` : 'Not given'}</dd>
            <dt className="font-semibold text-navy">Location</dt>
            <dd>{`${selected.lat.toFixed(4)}° N, ${selected.lon.toFixed(4)}° E`}</dd>
          </dl>
          <p className="mt-3 border-t border-navy/10 pt-3 text-xs leading-relaxed text-ink/65">A detection is a satellite heat signal, not a confirmed fire.</p>
        </div>
      )}
    </div>
  );
}
