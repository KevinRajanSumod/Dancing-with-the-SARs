# Sources

## Location
Central India, about 21.2 to 24.3 N, 76.6 to 80.0 E (radar footprint, Frame 77, Track 5).

## Radar (NASA-ISRO NISAR, GCOV, via ASF Vertex)
- 30 Sep 2026: NISAR_L2_PR_GCOV_032_005_D_077_2005_QPDH_A_20260930T132451_20260930T132525_P05023_N_F_J_001
- 5 Nov 2026: NISAR_L2_PR_GCOV_035_005_D_077_4005_DHDH_A_20261105T132451_20261105T132526_P05036_N_F_J_001
- Image used: Frequency A HVHV browse PNG (before.png, after.png). Previews only, not measurements.

## Fire detections (NASA FIRMS, VIIRS NOAA-21, version 2.0NRT)
- Source: https://nrt3.modaps.eosdis.nasa.gov/archive/FIRMS/ (Noaa 21 VIIRS C2, South_Asia), accessed [date]
- 38 daily files, 30 Sep to 5 Nov 2026, unchanged in Data/firms_raw
- Filters: date (acq_date), inside footprint, no confidence filter
- Result: 2,050 detections (low 435, nominal 1,604, high 11)
- Each row is one satellite detection, not a confirmed or separate fire.

## Official references
- NISAR Data User Guide: https://nisar-docs.asf.alaska.edu/ (Kristenson et al., 2026, doi:10.5281/ZENODO.20075813)

## Limits
- Radar change is not proven to be caused by fire.
- Detections don't measure burned area.
- Detections on 5 Nov were recorded on the day of the later radar scene.
- Some detections lie near the footprint edge.

## 1. Project
Name: Dancing with the SARs: Watching Earth's Surface Change (NASA Space Apps Challenge 2026).
Question: What radar brightness changed in one area of central India between 30 Sep and 5 Nov 2026, and what satellite fire detections were recorded in the same period?

## 2. Study area
- Original note: Central India, about 21.2 to 24.3 N, 76.6 to 80.0 E (radar footprint, Frame 77, Track 5).
- Exact footprint corners used for the detection filter, written as (longitude, latitude): (76.58633064906468, 21.290446503925544), (79.8633274914315, 21.22767185713987), (79.97111494969664, 24.234507714377845), (76.62164546849948, 24.307224375480946).
- Corners read from `data/raw/kml/before_footprint.kml` (longitude, latitude): (76.58633064906468, 21.290446503925544), (79.8633274914315, 21.22767185713987), (79.97111494969664, 24.234507714377845), (76.62164546849948, 24.307224375480946).
- Corners read from `data/raw/kml/after_footprint.kml` (longitude, latitude): (76.58633355625204, 21.29071745967597), (79.86285627548574, 21.22795580595786), (79.9706243254978, 24.234523776796717), (76.62164546849948, 24.307224375480946).
- The two KML files do not match each other exactly. The fourth corner is the same in both KML files. The icon names in the KML files are the two NISAR scene names with `_NATIVE_A_HVHV.png` added.
- Madhya Pradesh boundary: `data/raw/boundaries/gadm41_IND_1.json` has 1 row with NAME_1 `MadhyaPradesh` and HASC_1 `IN.MP`. CRS EPSG:4326.
- The radar footprint overlaps Madhya Pradesh. Checked against that polygon, the footprint is not entirely inside the state: part of the four-corner shape falls outside the state outline. On 30 Oct 2026, 8 detections in the footprint file sit inside the footprint and outside the state polygon.
- Boundary source: GADM v4.1 level 1 (`gadm41_IND_1.json`), downloaded 14 Nov 2026 from gadm.org. Licence: GADM academic and non-commercial terms. Licence page: https://gadm.org/license.html. [TO CONFIRM the licence wording]

## 3. Radar data (NASA-ISRO NISAR, GCOV Level 2)
- Earlier scene (30 Sep 2026): NISAR_L2_PR_GCOV_032_005_D_077_2005_QPDH_A_20260930T132451_20260930T132525_P05023_N_F_J_001. Track 5, Frame 77, Descending, QPDH polarisation, processing P05023.
- Later scene (5 Nov 2026): NISAR_L2_PR_GCOV_035_005_D_077_4005_DHDH_A_20261105T132451_20261105T132526_P05036_N_F_J_001. Track 5, Frame 77, Descending, DHDH polarisation, processing P05036.
- These two names are also the icon names in `before_footprint.kml` and `after_footprint.kml`.
- Source: Alaska Satellite Facility, Vertex (search.asf.alaska.edu), accessed [TO CONFIRM date].
- Images used: Frequency A HVHV browse images, saved as `data/processed/before_overlay.png` and `data/processed/after_overlay.png`.
- Original note: Image used: Frequency A HVHV browse PNG (before.png, after.png). Previews only, not measurements. Files named `before.png` and `after.png` are not in `data/processed/`. The overlay files named above are there.
- Note: the two scenes differ in polarisation and processing version. Both include HV.

## 4. Radar processing
- Browse images were georeferenced in QGIS (Georeferencer, four corner points, Polynomial 1, EPSG:4326).
- Output converted to PNG with GDAL (gdal_translate or Warp, data type Byte, nodata value 0).
- PNG signature checked on 14 Nov 2026. `before_overlay.png` and `after_overlay.png` both begin with 89 50 4E 47 0D 0A 1A 0A.
- `data/processed/before_georef.png` and `data/processed/after_georef.png` do not begin with that PNG signature. Both begin with 49 49 2A 00.
- Limit: browse images are previews, not measurement files. Brightness change was judged by eye, not measured.

## 5. Fire data (NASA FIRMS, VIIRS on NOAA-21, version 2.0NRT)
- Original note: Source: https://nrt3.modaps.eosdis.nasa.gov/archive/FIRMS/ (Noaa 21 VIIRS C2, South_Asia), accessed [date].
- Source: FIRMS archive, South_Asia folder, accessed 13 Nov 2026. Page address [TO CONFIRM]. The address written in the original notes is https://nrt3.modaps.eosdis.nasa.gov/archive/FIRMS/.
- Files: 38 daily files in `data/raw/firms_raw/`, Julian days 2026272 to 2026309, read on 14 Nov 2026. None failed. The original notes say these files were left unchanged in Data/firms_raw.
- Every row has satellite `N21` and version `2.0NRT` (47,792 rows).
- Date filter: acq_date from 2026-09-30 to 2026-11-05 inclusive. The Julian number in the file name was not used.
- Footprint filter: point-in-polygon test against the four exact footprint corners listed in section 2.
- Confidence: not filtered. All levels kept.
- Counts read from `data/processed/firms_combined_2026-09-30_to_2026-11-05.csv`, and checked by reading the 38 daily files:
  - Total detection rows read: 47,792.
  - Detections after the date filter: 46,943.
  - Detections inside the footprint: 2,050.
  - Confidence inside the footprint: low 435, nominal 1,604, high 11.
- Original note: Result: 2,050 detections (low 435, nominal 1,604, high 11).
- Nominal detections on 9 Oct 2026 inside the footprint: 17. That file has 24 detections on that date (17 nominal and 7 low).
- The same footprint file has 8 detections on 30 Oct 2026. All 8 are nominal. All 8 are outside the Madhya Pradesh polygon.
- Original note: Each row is one satellite detection, not a confirmed or separate fire.

## 6. Madhya Pradesh detections
- File: `data/processed/mp_firms.geojson`, created by `data/pipeline/mp_filter.py`.
- Features in the file: 4,762. The file does not store the earlier totals. Those were counted again from the 38 daily files.
- Detection rows read: 47,792.
- Detections with acq_date from 2026-09-30 to 2026-11-05: 46,943.
- Detections inside Madhya Pradesh after that date filter: 4,762.
- Confidence inside Madhya Pradesh: low 998, nominal 3,727, high 37.
- Detections by date in `mp_firms.geojson`:
  - 2026-09-30: 29
  - 2026-10-01: 24
  - 2026-10-02: 18
  - 2026-10-03: 24
  - 2026-10-04: 42
  - 2026-10-05: 44
  - 2026-10-06: 89
  - 2026-10-07: 52
  - 2026-10-08: 32
  - 2026-10-09: 46
  - 2026-10-10: 44
  - 2026-10-11: 102
  - 2026-10-12: 124
  - 2026-10-13: 17
  - 2026-10-14: 65
  - 2026-10-15: 149
  - 2026-10-16: 172
  - 2026-10-17: 354
  - 2026-10-18: 145
  - 2026-10-19: 63
  - 2026-10-20: 85
  - 2026-10-21: 202
  - 2026-10-22: 415
  - 2026-10-23: 298
  - 2026-10-24: 236
  - 2026-10-25: 184
  - 2026-10-26: 219
  - 2026-10-27: 261
  - 2026-10-28: 80
  - 2026-10-29: 5
  - 2026-10-31: 16
  - 2026-11-01: 145
  - 2026-11-02: 348
  - 2026-11-03: 324
  - 2026-11-04: 248
  - 2026-11-05: 61
- 30 October 2026: 0 detections inside Madhya Pradesh. The daily file `J2_VIIRS_C2_South_Asia_VJ214IMGTDL_NRT_2026303.txt` has 1,050 detections with acq_date 2026-10-30, and 0 of them are inside the NAME_1 boundary. There is no 2026-10-30 row in `mp_firms.geojson`.
- Note: the state view uses all detections inside the state. The radar covers only part of the state.

## 7. Official references
- NISAR Data User Guide (NASA-ISRO, hosted by ASF): https://nisar-docs.asf.alaska.edu/
  Citation: Kristenson, H., Smale, J., Johnston, A., Herrmann, J., Gens, R., Kennedy, J. H., White, J., Lewandowski, A., Larsen, L., Horn, W., Rosen, P., Lavalle, M., & Fattahi, H. (2026). NISAR Data User Guide. Zenodo. https://doi.org/10.5281/ZENODO.20075813
  Sections used: Data Products, Accessing NISAR Data, Applications.
- Original note: NISAR Data User Guide: https://nisar-docs.asf.alaska.edu/ (Kristenson et al., 2026, doi:10.5281/ZENODO.20075813).
- NASA FIRMS: page used [TO CONFIRM address]. The original notes give https://nrt3.modaps.eosdis.nasa.gov/archive/FIRMS/. Accessed [TO CONFIRM date]. Section 5 records the project note "accessed 13 Nov 2026".
- GADM: https://gadm.org/

## 8. Tools
- Python with pandas, geopandas and shapely (filtering and counts).
- QGIS (georeferencing and export) and GDAL (PNG conversion).
- Cursor (writing and running scripts) and Bolt (building the website).
- Leaflet (map display) on the website.
- AI assistance: AI tools helped write code and text. Every number was checked against the printed counts from the files, and the author wrote the explanations and conclusions.

## 9. Checks
- Files read: 38 of 38. Files that failed: 0.
- Reconciliation for the footprint file:
  - Combined footprint file (`data/processed/firms_combined_2026-09-30_to_2026-11-05.csv`): 2,050 rows, all inside the exact footprint. Confidence inside the footprint: 435 + 1,604 + 11 = 2,050.
  - Daily raw files (38 files in `data/raw/firms_raw/`): 47,792 rows read; 46,943 after the date filter; 849 excluded by date. 47,792 total rows read = 46,943 rows after the date filter + 849 rows excluded by date. 2,050 detections inside the footprint + 44,893 detections outside the footprint = 46,943 rows after the date filter.
- Reconciliation for the state file:
  - 998 + 3,727 + 37 = 4,762 detections inside Madhya Pradesh.
  - The 36 dates listed in section 6 add up to 4,762.
- Raw folder unchanged: `data/raw/` still has the same 41 files and the same byte sizes as the listing taken before `mp_filter.py` was run.
- Checks run on: 14 Nov 2026.

## 10. Limits
- Browse images are previews, not measurements.
- Fire detections show where heat was detected. They are not confirmed fires and do not measure burned area.
- Original note: Detections don't measure burned area.
- Radar change does not prove that a fire caused it.
- Original note: Radar change is not proven to be caused by fire.
- The radar covers one strip (Track 5, Frame 77), not the whole state.
- The radar footprint extends partly beyond the Madhya Pradesh boundary. 1,803 detections are inside the footprint and inside the state, and 247 detections are inside the footprint but outside the state.
- Some detections lie near the edge of the footprint.
- Original note: Some detections lie near the footprint edge.
- Detections on 5 Nov 2026 were recorded on the day of the later radar pass. The footprint file has 38 detections on that date. The state file has 61.
- Original note: Detections on 5 Nov were recorded on the day of the later radar scene.
- The fire data is near-real-time (version 2.0NRT) and may be revised later. All 47,792 rows read have version 2.0NRT.
- No burned-area product (MCD64A1 or VNP64A1) has been checked.
- Original note: Each row is one satellite detection, not a confirmed or separate fire.

## 11. Open items
- Bolt: upload of before_overlay.png and after_overlay.png and display check. [TO CONFIRM status]
- Transparent surround of the radar overlays. [TO CONFIRM status]
