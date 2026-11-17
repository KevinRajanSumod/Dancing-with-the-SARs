# Boundary data provenance

- `geoboundaries_ind_adm2_simplified.geojson` is the India ADM2 district dataset from geoBoundaries release commit `9469f09`. Its source metadata reports 2021 boundaries and Open Database License 1.0 (ODbL): <https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/>.
- `madhya_pradesh_districts_2021.txt` is the reviewed list of the 52 Madhya Pradesh districts selected from that India dataset. `data/pipeline/mp_boundaries.py` checks every name against the source before returning any geometry.
- The state outline is the geometric union of those same 52 district polygons. This keeps the displayed outline and the point filter on one boundary source and year.
- `public/data/madhya-pradesh-districts.geojson` and `public/data/madhya-pradesh-boundary.geojson` are subsets/adaptations of the ODbL district dataset. Keep the ODbL attribution and license with redistributed copies and derived databases.

The map-preparation script assigns each thermal detection to a 2021 district polygon and keeps any unmatched point visible as unassigned. The current snapshot assigns all 4,701 state records to a district polygon.
