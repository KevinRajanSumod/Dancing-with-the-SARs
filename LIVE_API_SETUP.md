# Live API setup in Bolt

The Fire story now has two modes:

- **Archive** keeps the Sep 30–Nov 5, 2026 project comparison, its georeferenced preview overlays, and the supplied 2,050-row FIRMS snapshot.
- **Live** asks the Bolt server function for recent NASA FIRMS detections and ASF NISAR GCOV catalog quicklooks. The function filters FIRMS points against the exact project footprint and selects NISAR repeat scenes with matching track, frame, orbit direction, polarization, frequency, and collection where that metadata is available.

## One-time setup

1. Make sure these source changes are in the Bolt project that serves the site. If this folder is a separate local copy, sync/import the changes into that Bolt project first.
2. In that Bolt project, make sure Bolt Cloud is connected. Bolt fills in the browser-safe database URL and public key when a database is connected.
3. Request a free [NASA FIRMS MAP_KEY](https://firms.modaps.eosdis.nasa.gov/api/map_key/).
4. In Bolt, open **Database → Secrets** and add the secret with the exact name `FIRMS_MAP_KEY`. Paste the value there; do not add it to a `VITE_` variable or send it in chat.
5. Open **Fire story → Live · latest feeds** and choose **Refresh feeds**.

If the function or database connection is not present in Bolt, the live panel will tell you which part is unavailable. ASF’s public search metadata and browse previews do not require the FIRMS key. The FIRMS key enables only the FIRMS request.

## What the live mode means

- The app checks the latest five days of VIIRS NOAA-21 near-real-time FIRMS records when Live mode opens, and when **Refresh feeds** is selected. Results are cached for ten minutes.
- NISAR images are fetched from browse URLs returned by ASF Search. They are previews, not full science products or calibrated map layers.
- Live thermal detections are listed by date rather than plotted over the quicklook. That avoids implying that the radar preview and FIRMS positions have been registered together.
- The historical local overlays remain in Archive mode because the project georeferenced them for that specific comparison. Replacing them with raw browse URLs would remove that registered frame and make the archive map points unreliable.
- If ASF has not published two compatible Track 5 / Frame 77 browse scenes, Live mode shows the latest single preview or a catalog status message. It will not create a pair from mismatched scenes.
- Downloading and processing full NISAR GCOV science products for a geospatially aligned map is a separate step and requires Earthdata access and geospatial processing. The current live integration deliberately uses browse previews only.
