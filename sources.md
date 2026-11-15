# TerraScope data and method notes

TerraScope is a date-driven Earth-observation dashboard focused on Madhya Pradesh, India. It places radar browse imagery, optical context, and satellite thermal-detection records on one interactive timeline. The dashboard is exploratory: it does not compute calibrated radar change or establish fire attribution.

## Data sources

- NASA-ISRO NISAR L-band browse visualizations are requested by date from NASA GIBS. These are image layers, not source GCOV measurement rasters.
- OPERA Sentinel-1 RTC and MODIS true-color imagery are requested by date from NASA GIBS as separate context layers.
- NASA FIRMS VIIRS records are queried for the selected date when the service is configured. A bundled NOAA-21 archive is available as a fallback and contains 36 daily source files.
- The current bundled snapshot contains 2,014 study-footprint records (433 low, 1,571 nominal, 10 high) and 4,701 records within the Madhya Pradesh outline (998 low, 3,667 nominal, 36 high). These are detection records, not confirmed or unique fires.
- State and district outlines use the 2021 geoBoundaries India ADM2 simplified dataset. The state outline is dissolved from the selected 52 district polygons; both files are covered by ODbL 1.0.

## Processing

- The Python scripts read the supplied FIRMS daily files, keep all reported confidence levels, and filter point records to the state or study-area geometry.
- Map GeoJSON files carry date, time, confidence, fire radiative power, and day/night status. The browser groups records for map inspection and summarizes them by district.
- NASA POWER provides recent daily rainfall and soil-moisture context for one regional grid cell. These values are not measurements at each radar pixel.

## Limits

- Browse colors are not calibrated backscatter-change measurements. Sensor layers may differ in acquisition date, resolution, wavelength, geometry, and processing.
- A FIRMS detection is a thermal signal, not proof of a fire, a fire perimeter, or burned area.
- The map does not demonstrate that fire caused a radar pattern. Defensible change analysis needs compatible calibrated radar products and independent validation.

## References

- [NASA GIBS API documentation](https://nasa-gibs.github.io/gibs-api-docs/)
- [ASF NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/)
- [NASA FIRMS active-fire data](https://firms.modaps.eosdis.nasa.gov/active_fire/)
- [NASA/JPL OPERA products](https://www.jpl.nasa.gov/go/opera/products/)
- [geoBoundaries India ADM2 metadata and license](https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/)
- [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/)

Code and third-party data/software terms are documented separately in `LICENSE` and `THIRD_PARTY_NOTICES.md`.
