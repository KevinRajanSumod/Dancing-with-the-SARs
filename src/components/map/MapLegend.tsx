export default function MapLegend() {
  return (
    <div className="grid gap-5 rounded-2xl border border-navy/10 bg-paper p-4 text-sm text-ink sm:grid-cols-2 sm:p-5">
      <div>
        <p className="font-semibold text-navy">Map key</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-ember shadow-sm" aria-hidden="true" />
            FIRMS thermal detection
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-5 rounded-sm bg-gradient-to-r from-amber-100 via-amber to-crimson" aria-hidden="true" />
            Density by grid cell
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink/65">Density colours show relative counts in the selected full period (30 Sep–5 Nov 2026). A dot is one satellite detection, not one confirmed fire.</p>
      </div>
      <div className="sm:border-l sm:border-navy/10 sm:pl-5">
        <p className="font-semibold text-navy">About each detection</p>
        <p className="mt-2 text-xs leading-relaxed text-ink/65">Select a dot for date, UTC time, reported confidence, fire radiative power (FRP) and location. FRP is the estimated heat output of the satellite detection, in megawatts; it is not burned area.</p>
        <p className="mt-2 text-xs leading-relaxed text-ink/65">Source: NASA FIRMS, VIIRS on NOAA-21, near-real-time version 2.0NRT. The snapshot may be revised.</p>
      </div>
    </div>
  );
}
