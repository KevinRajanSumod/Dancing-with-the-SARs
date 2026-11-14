import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const KEY_STEP = 2;

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

interface RadarLayerProps {
  src: string;
  alt: string;
  clipPath?: string;
  fit: 'fill' | 'contain';
}

// Shows a message instead of a broken image so the panel never goes blank.
function RadarLayer({ src, alt, clipPath, fit }: RadarLayerProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-navy-800 p-6 text-center text-sm text-white"
        style={{ clipPath }}
      >
        This radar image could not be loaded.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full select-none ${fit === 'contain' ? 'object-contain' : 'object-fill'} mix-blend-screen`}
      style={{ clipPath }}
    />
  );
}

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  children?: ReactNode;
  imageFit?: 'fill' | 'contain';
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  children,
  imageFit = 'fill',
}: BeforeAfterSliderProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(50);

  function setFromClientX(clientX: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (draggingRef.current) setFromClientX(event.clientX);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        setPosition((current) => clamp(current - KEY_STEP));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        setPosition((current) => clamp(current + KEY_STEP));
        break;
      case 'Home':
        setPosition(0);
        break;
      case 'End':
        setPosition(100);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  const rounded = Math.round(position);

  return (
    <div
      ref={frameRef}
      className="relative aspect-[1.06] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-xl bg-navy-800 sm:aspect-[1.06]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <RadarLayer src={beforeSrc} alt={beforeAlt} fit={imageFit} />
      <RadarLayer src={afterSrc} alt={afterAlt} fit={imageFit} clipPath={`inset(0 0 0 ${position}%)`} />

      <div className="absolute inset-0 z-10">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-20 rounded-xl border border-white/25" />

      <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-full border border-white/20 bg-navy/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-card backdrop-blur-sm sm:left-4 sm:top-4 sm:text-xs">
        {beforeLabel}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full border border-white/20 bg-navy/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-card backdrop-blur-sm sm:right-4 sm:top-4 sm:text-xs">
        {afterLabel}
      </div>

      <div className="absolute inset-y-0 z-30 w-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-radar shadow-[0_0_18px_rgba(100,211,223,.6)]" aria-hidden="true" />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Divider between the before and after radar images. Use the left and right arrow keys to move it."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`${rounded} percent of the image shows the before view on the left`}
          onKeyDown={handleKeyDown}
          className="absolute left-0 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border border-white/40 bg-radar text-navy shadow-lift"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
