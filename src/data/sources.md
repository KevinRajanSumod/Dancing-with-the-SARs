# Data and scene record

This story pairs a project-provided radar browse image set with a local snapshot of satellite heat detections. The two sources are displayed as separate evidence layers and should not be read as a causal match.

## NISAR radar imagery

- 30 Sep 2026 scene: NISAR_L2_PR_GCOV_032_005_D_077_2005_QPDH_A_20260930T132451_20260930T132525_P05023_N_F_J_001.
- 5 Nov 2026 scene: NISAR_L2_PR_GCOV_035_005_D_077_4005_DHDH_A_20261105T132451_20261105T132526_P05036_N_F_J_001.
- Data access: [Alaska Satellite Facility (ASF) Vertex](https://search.asf.alaska.edu/). Browse images are low-resolution previews, not measurement rasters. The scene configurations and processing versions differ; both scenes include HV.
- Reference: [NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/) (Kristenson et al., 2026, [doi:10.5281/ZENODO.20075813](https://doi.org/10.5281/ZENODO.20075813)).

## Live feeds

- Live mode requests public NISAR GCOV catalog metadata from the [ASF Search API](https://docs.asf.alaska.edu/api/basics/). Where ASF returns a browse URL, the page displays that remote quicklook; it does not download a full science product or treat the preview as a calibrated raster.
- The [NISAR product notes](https://nisar-docs.asf.alaska.edu/product-known-issues/) describe calibration artifacts in some pre-calibration BETA products. The collection and processing metadata for each returned scene should be checked before drawing conclusions; this project does not assume that every live scene is a BETA product.
- Live thermal detections come from the [NASA FIRMS Area API](https://firms.modaps.eosdis.nasa.gov/api/area), VIIRS NOAA-21 near-real-time, for the latest five-day query. The Supabase Edge Function filters the bounding-box response against the project footprint polygon.
- The FIRMS API key is stored as the Supabase Edge Function secret `FIRMS_MAP_KEY`; it is not sent to the browser. Request a free key at [NASA FIRMS Map Key](https://firms.modaps.eosdis.nasa.gov/api/map_key/).
- The historical Sep–Nov archive continues to use the project's georeferenced preview overlays and fixed FIRMS snapshot. Those images and point layers are spatially framed for the archive; remote live browse quicklooks are kept separate because their preview projection is not suitable for an overlay claim.

## FIRMS thermal detections

- Source: [NASA FIRMS archive](https://nrt3.modaps.eosdis.nasa.gov/archive/FIRMS/), NOAA-21 VIIRS, South Asia, version 2.0NRT.
- Snapshot: 38 daily files from 30 Sep through 5 Nov 2026. The project filtered by acquisition date and the radar footprint, without removing any confidence category.
- Result: 2,050 detection records in the footprint: 435 low, 1,604 nominal and 11 high confidence. On 9 Oct, the project record contains 24 detections, 17 nominal and 7 low.
- A FIRMS row is one thermal detection record. It does not necessarily represent a unique or confirmed fire, and it does not measure burned area. Near-real-time values may be revised.

## Study footprint and method

- Approximate extent: 21.2–24.3° N, 76.6–80.0° E; NISAR Track 5, Frame 77. FIRMS points were selected against the project footprint polygon.
- The before and after browse previews were georeferenced in QGIS and exported as grayscale overlays. The visual comparison is not a calibrated backscatter change analysis.
- The radar previews and FIRMS points were not matched to a burned-area product or field observations. Radar change is not proven to have been caused by fire.
- Provenance gap: the supplied notes do not record the exact ASF Vertex access date for the two browse scenes. Add it if you need a complete retrieval log.

## NASA imagery and mission data

- The homepage background uses NASA/JSC's [Earth Illuminated](https://svs.gsfc.nasa.gov/11474) still photograph from the International Space Station. It is illustrative Earth-observation context, not the project's NISAR image or data.
- The SAR basics page includes NASA/JPL-Caltech's [NISAR launch and deployment animation](https://science.nasa.gov/video-detail/amf-ffc8740c-2d65-4712-a4dd-78152649ab49/) and [NISAR image of Mount Desert Island, Maine](https://science.nasa.gov/image-detail/amf-pia26616/). These are mission examples from outside the Central India project footprint; the Maine radar image was acquired during commissioning on 21 August 2025.
- The home mission cards summarize NASA's [NISAR mission overview](https://science.nasa.gov/mission/nisar/mission-overview/): 12-day exact repeat cycle, approximately 6-day average sampling, mode-dependent 3–10 m SAR resolution, and L- and S-band wavelengths.
- The Drivers and Applications pages point to NASA datasets for broader context: [GEDI L4B aboveground biomass](https://data.nasa.gov/dataset/gedi-l4b-gridded-aboveground-biomass-density-version-2), [SMAP L4 soil moisture](https://nsidc.org/data/spl4smgp/versions/8), [MODIS MCD64A1 burned area](https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MCD64A1/), and [OPERA DSWx-HLS surface-water extent](https://podaac.jpl.nasa.gov/dataset/OPERA_L3_DSWX-HLS_V1). These products have different spatial scales, observation periods, and input sensors; the project has not processed them.

## Mission context

- [NASA NISAR mission overview](https://science.nasa.gov/mission/nisar/mission-overview/): mission scope, instruments and observation cadence.
- [NASA NISAR ecosystem science](https://science.nasa.gov/mission/nisar/ecosystem/): vegetation, biomass, disturbance and recovery context.
- [NASA NISAR mission requirements](https://science.nasa.gov/mission/nisar/mission-requirements/): measurement objectives for vegetation, agriculture, ice and deformation.
