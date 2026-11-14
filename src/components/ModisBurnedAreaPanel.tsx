import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Flame, ImageOff, RefreshCw } from 'lucide-react';
import { fetchModisBurnedAreaImage } from '@/lib/liveEarthData';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => { if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current); }, []);

  async function loadImage() {
    setLoading(true);
    setError('');
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

  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:px-8 md:pb-14" aria-labelledby="modis-burned-area-heading">
      <div className="surface-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ember/20 bg-ember/10 text-ember"><Flame className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">Separate NASA product · MODIS MCD64A1</p>
              <h2 id="modis-burned-area-heading" className="mt-2 text-xl sm:text-2xl">Monthly burned-area context.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">Request an independent monthly burned-area map for the study footprint. This image is kept separate from the NISAR browse comparison and FIRMS point detections.</p>
            </div>
          </div>
          <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); void loadImage(); }}>
            <label htmlFor="modis-month" className="grid gap-1 text-xs font-semibold text-muted"><span>Product month</span><input id="modis-month" type="month" value={month} onChange={(event) => setMonth(event.currentTarget.value)} required className="min-h-10 rounded-lg border border-line-strong bg-raised px-3 text-sm font-medium text-ink" /></label>
            <button type="submit" disabled={loading || !month} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-ember px-4 text-sm font-semibold text-canvas transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />{loading ? 'Loading…' : 'Load month'}</button>
          </form>
        </div>

        {error && <div role="status" className="mt-5 rounded-xl border border-ember/25 bg-ember/5 p-4 text-sm leading-relaxed text-muted"><p>{error}</p></div>}

        {imageUrl ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-line bg-canvas">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3"><p className="text-sm font-semibold text-ink">NASA MODIS burned-area WMS · {loadedMonth}</p><span className="text-xs text-muted">Project footprint · 76.586–79.971° E, 21.228–24.307° N</span></div>
            <img src={imageUrl} alt={`NASA MODIS MCD64A1 burned-area WMS for ${loadedMonth} over the project footprint`} className="mx-auto block max-h-[34rem] w-full object-contain" />
          </div>
        ) : !error ? (
          <div className="mt-5 flex min-h-36 items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-canvas/55 px-4 text-center text-sm text-muted"><ImageOff className="h-5 w-5 text-subtle" aria-hidden="true" /><span>Choose a month and load the NASA layer to view its image.</span></div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">MCD64A1 is a 500 m monthly burned-area product; its availability can lag the month selected. A blank map can mean no mapped burned pixels or a month with no available coverage. It is not an active-fire feed, does not establish fire cause, and is not pixel-matched to the supplied radar previews.</p>
          <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2"><a href="https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA MCD64A1 <ExternalLink className="h-3 w-3" aria-hidden="true" /></a><a href="https://firms.modaps.eosdis.nasa.gov/mapserver/wms-info/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-radar underline underline-offset-4">NASA FIRMS WMS details <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></div>
        </div>
      </div>
    </section>
  );
}
