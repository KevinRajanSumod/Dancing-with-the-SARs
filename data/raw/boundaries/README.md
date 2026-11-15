# Boundary data provenance

The statewide map uses two boundary sources:

- `gadm41_IND_1.json` provides the Madhya Pradesh state outline used by the existing FIRMS state filter. It is GADM v4.1.
- `geoboundaries_ind_adm2_simplified.geojson` is the simplified India ADM2 geometry from geoBoundaries release data at commit `9469f09`. The source represents 2021 boundaries and reports Open Database License 1.0 (ODbL). Source metadata: <https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/>. License: <https://opendatacommons.org/licenses/odbl/1-0/>.

The map-preparation script selects the ADM2 polygons whose representative point falls inside the GADM Madhya Pradesh outline. It joins the supplied state-filtered FIRMS records to those polygons for district filtering and summaries. Twelve records do not intersect a selected 2021 district polygon and are kept visible as unassigned records.
