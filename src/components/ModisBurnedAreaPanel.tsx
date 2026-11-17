import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { Check, ExternalLink, Flame, ImageOff, RefreshCw } from 'lucide-react';
import { fetchModisBurnedAreaImage } from '@/lib/liveEarthData';
import LiveDataInsight from '@/components/LiveDataInsight';

function defaultMonth(): string {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() - 4);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function ModisBurnedAreaPanel() {
  const [month, setMonth] = useState(defaultMonth);
  const [imageUrl, setImageUrl] = useState('');
  const imageUrlRef = useRef('');
  const [loadedMonth, setLoadedMonth] = useState('');
  const [hasVisiblePixels, setHasVisiblePixels] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => { if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current); }, []);

  async function loadImage() {
    setLoading(true);
    setError('');
    setHasVisiblePixels(null);
    setLoadedMonth('');
    setImageUrl('');
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = '';
    }
    try {
      const blob = await fetchModisBurnedAreaImage(month);
      const nextUrl = URL.createObjectURL(blob);
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = nextUrl;
      setImageUrl(nextUrl);
      setLoadedMonth(month);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The burned-area layer could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  function inspectImage(event: SyntheticEvent<HTMLImageElement>) {
    try {
      const image = event.currentTarget;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        setHasVisiblePixels(null);
        return;
      }
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let visibleCount = 0;
      for (let alpha = 3; alpha < pixels.length; alpha += 4) {
        if (pixels[alpha] > 16 && ++visibleCount > 8) break;
      }
      setHasVisiblePixels(visibleCount > 8);
    } catch {
      // Still show a valid image if the browser cannot inspect its transparency.
      setHasVisiblePixels(null);
    }
  }

  return (
    <section className="surface-card overflow-hidden p-4 sm:p-5" aria-labelledby="modis-burned-area-heading">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ember/20 bg-ember/10 text-ember"><Flame className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">Burn scars · NASA MODIS</p>
              <h2 id="modis-burned-area-heading" className="mt-2 text-xl">Where did NASA map burned land?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Choose a month to check Madhya Pradesh. Burn scars show where land changed after burning; FIRMS dots show heat signals.</p>
              <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${loading ? 'border-line bg-canvas text-muted' : hasVisiblePixels === true ? 'border-eco/25 bg-eco/10 text-eco' : hasVisiblePixels === false ? 'border-amber/25 bg-amber/10 text-amber' : error ? 'border-ember/25 bg-ember/10 text-ember' : 'border-line bg-canvas text-muted'}`} role="status" aria-live="polite">
                {hasVisiblePixels === true && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {loading ? `Checking ${month}…` : hasVisiblePixels === true ? `Burned-area pixels visible · ${loadedMonth}` : hasVisiblePixels === false ? `No burned-area pixels visible · ${loadedMonth}` : error ? 'Layer unavailable' : loadedMonth ? `Image loaded · ${loadedMonth}` : 'Not checked yet · choose a month'}
              </p>
            </div>
          </div>
          <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); void loadImage(); }}>
            <label htmlFor="modis-month" className="grid gap-1 text-xs font-semibold text-muted"><span>Product month</span><input id="modis-month" type="month" value={month} onChange={(event) => setMonth(event.currentTarget.value)} required className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm font-medium text-ink" /></label>
            <button type="submit" disabled={loading || !month} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-ember px-4 text-sm font-semibold text-canvas transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />{loading ? 'Loading…' : 'Load month'}</button>
          </form>
        </div>

        <LiveDataInsight
          title="MODIS monthly burned-area layer"
          question="Explain what the current MODIS month and layer status can tell a visitor, how the product is useful alongside FIRMS and radar, and why a blank map or visible pixels have limits."
          evidence={`Product: NASA MODIS MCD64A1 monthly burned-area layer, approximately 500 m per pixel. Selected month: ${month}. Loaded month: ${loadedMonth || 'not loaded'}. Layer status: ${loading ? 'loading' : error ? `unavailable (${error})` : hasVisiblePixels === true ? 'some non-transparent map pixels are visible' : hasVisiblePixels === false ? 'no non-transparent map pixels were detected in the returned image' : 'not checked yet'}. Monthly coverage can be delayed. A blank image cannot distinguish no mapped burn from missing usable coverage. This is a separate product from FIRMS heat detections and is not pixel-matched to NISAR previews.`}
        />

        {error && <div role="status" className="mt-5 rounded-xl border border-ember/25 bg-ember/5 p-4 text-sm leading-relaxed text-muted"><p>{error}</p></div>}

        {imageUrl ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-line bg-canvas">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3"><p className="text-sm font-semibold text-ink">NASA MODIS burned-area map · {loadedMonth}</p><span className="text-xs text-muted">Study area · Madhya Pradesh</span></div>
            {hasVisiblePixels === false ? (
              <div role="status" className="grid min-h-56 place-items-center bg-canvas px-6 py-8 text-center">
                <div className="max-w-xl">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-raised text-muted"><ImageOff className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-3 text-base font-semibold text-ink">No burned-area pixels are visible for this month.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">This can mean the product mapped no burned land here, or that it has no usable coverage for this area and month. A blank image cannot tell those cases apart.</p>
                  <p className="mt-2 text-xs leading-relaxed text-subtle">MCD64A1 maps monthly burn scars at about 500 m per pixel. It is separate from the red FIRMS heat detections.</p>
                </div>
              </div>
            ) : (
              <img src={imageUrl} alt={`NASA MODIS MCD64A1 burned-area WMS for ${loadedMonth} over the study area`} onLoad={inspectImage} onError={() => { setError('The NASA service returned an image that could not be displayed. Try again later.'); setImageUrl(''); }} className="mx-auto block max-h-[34rem] w-full object-contain" />
            )}
          </div>
        ) : !error ? (
          <div className="mt-5 flex min-h-36 items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-canvas/55 px-4 text-center text-sm text-muted"><ImageOff className="h-5 w-5 text-subtle" aria-hidden="true" /><span>Choose a month and load the NASA layer to view its image.</span></div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">MCD64A1 is NASA’s open monthly burned-area product (about 500 m per pixel). New months can appear with a delay. It maps burn scars; FIRMS dots are separate satellite heat detections. Neither alone proves the cause of a fire, and this layer is not pixel-matched to the radar previews.</p>
          <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2"><a href="https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA MCD64A1 <ExternalLink className="h-3 w-3" aria-hidden="true" /></a><a href="https://firms.modaps.eosdis.nasa.gov/mapserver/wms-info/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA FIRMS WMS details <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></div>
        </div>
      </div>
    </section>
  );
}
