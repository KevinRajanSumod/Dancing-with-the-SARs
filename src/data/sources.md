# Study data and evidence

TerraScope is an educational, date-driven view of Madhya Pradesh using satellite radar browse imagery, optical context, and thermal-detection records. It does not calculate calibrated SAR change or attribute a signal to fire.

## Map layers

- The timeline requests NASA GIBS visualizations of NISAR L-band radar for the selected date. Browse mosaics are visualizations, not the underlying calibrated measurements or a derived change layer. An observation may not exist for every date.
- OPERA Sentinel-1 RTC is requested from NASA GIBS at the selected date. It is a separate C-band radar source with different acquisition and processing characteristics; it is not interchangeable with NISAR.
- MODIS Terra corrected reflectance provides optical context beneath radar swaths where available. It differs in resolution, spectral response, and observation timing.
- VIIRS thermal detections are requested from the NASA FIRMS archive for the selected date and filtered to Madhya Pradesh. A bundled NOAA-21 snapshot provides a fallback where available. Platform and product coverage varies by date; near-real-time records can be revised.
- Madhya Pradesh and district boundaries come from the 2021 geoBoundaries India ADM2 simplified dataset. The state outline is dissolved from the selected district polygons; both use ODbL 1.0. The study-area outline is geographic context, not a statement that satellite coverage is limited to that boundary.

## Method and interpretation

- The date slider requests the same date from the visible GIBS layers. Each source has its own coverage, acquisition schedule, and processing.
- The dashboard clips image layers to the state outline, displays FIRMS records, groups nearby map points, and summarizes records by district. It does not load or process the full NISAR HDF5 science products.
- A thermal detection is not burned area; one record is not necessarily one distinct event; and near-real-time values may change during processing.
- Rainfall, soil moisture, vegetation, surface structure, incidence geometry, and product processing can all affect radar backscatter. Quantitative change analysis requires compatible calibrated science products, documented processing, and independent validation.

## References

- [NASA GIBS access and time behavior](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) and [visualization catalog](https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/)
- [ASF NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/)
- [NASA FIRMS active-fire data](https://firms.modaps.eosdis.nasa.gov/active_fire/)
- [NASA/JPL OPERA products](https://www.jpl.nasa.gov/go/opera/products/)
