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
