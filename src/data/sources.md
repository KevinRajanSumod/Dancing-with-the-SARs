# Study data and evidence

This dashboard is an educational, Madhya Pradesh-first view of NISAR L-band radar browse mosaics, with separately identified optical and thermal-detection context. It does not currently calculate calibrated SAR change or attribute a signal to fire.

## NISAR radar imagery

- The map requests the daily GIBS visualization `NISAR_L2_Geocoded_Polarimetric_Covariance` and the 12-day `NISAR_L2_Geocoded_Polarimetric_Covariance_12Day` for the selected timeline date.
- NASA GIBS provides display visualizations of Earth-observation products through public map services. These are false-color browse mosaics, not the underlying calibrated measurements or a derived change layer. The user-selected date is a request date; an observation may not exist for every day.
- GIBS documentation: [access basics and time behavior](https://nasa-gibs.github.io/gibs-api-docs/access-basics/), [visualization catalog](https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/). NISAR product interpretation: [ASF NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/).
- The archive’s two supplied browse scenes remain documented as historical project material: 30 Sep 2026 `NISAR_L2_PR_GCOV_032_005_D_077_2005_QPDH_A_20260930T132451_20260930T132525_P05023_N_F_J_001`; 5 Nov 2026 `NISAR_L2_PR_GCOV_035_005_D_077_4005_DHDH_A_20261105T132451_20261105T132526_P05036_N_F_J_001`. They use different configurations and processing releases, so visual differences are not a quantitative change estimate.

## Other map layers

- OPERA Sentinel-1 RTC is requested from [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/) at the selected timeline date. The underlying OPERA RTC-S1 product is Sentinel-1 C-band radar data with near-global land coverage, produced separately from NISAR. It is a cross-mission comparison, not an interchangeable NISAR observation; see [NASA/JPL OPERA coverage](https://www.jpl.nasa.gov/go/opera/products/) and [RTC product description](https://www.jpl.nasa.gov/go/opera/products/rtc-product/).
- MODIS Terra corrected reflectance true color is requested from [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/) for the selected date and provides a full-state visual background beneath radar swaths. It is optical context, not radar measurement; resolution, spectral response, and acquisition timing differ from NISAR.
- VIIRS NOAA-21 thermal detection records come from the supplied [NASA FIRMS archive snapshot](https://firms.modaps.eosdis.nasa.gov/active_fire/), 30 Sep–5 Nov 2026. The interface filters records by selected date and district. District shading counts records; it does not count unique events.
- Madhya Pradesh and district boundaries come from GADM v4.1 and the 2021 geoBoundaries India ADM2 simplified dataset, respectively. The original NISAR study footprint is shown only as a reference outline and does not mean NISAR coverage is limited to or complete across that footprint.

## Method and interpretation

- A date slider requests the same date from the visible GIBS image layers. Dates outside the FIRMS snapshot have no thermal records to display.
- The dashboard clips the image layers to the state outline, renders supplied FIRMS records, and summarizes records by district. It does not load or process the full NISAR HDF5 products.
- Thermal detections are not burned area; one record is not necessarily one distinct event; near-real-time detection values may be revised. The map does not show that fire caused a radar change.
- Rainfall and soil moisture can affect radar backscatter alongside vegetation, surface structure, incidence geometry, and processing. A defensible quantitative change study requires compatible calibrated NISAR science products, masking and processing controls, and independent validation.

## Further study

- [NISAR mission overview](https://science.nasa.gov/mission/nisar/mission-overview/) describes mission goals and instruments.
- [ASF NISAR GCOV Worldview guide](https://hyp3-docs.asf.alaska.edu/nisar-docs/worldview/) explains how to inspect the browse visualization and connect it to source products.
- Full GCOV science products can be searched through [ASF Vertex](https://search.asf.alaska.edu/); downloads require an Earthdata account. This dashboard uses the public browse service and needs no user API key.
