"""Prepare lightweight Madhya Pradesh map assets from the archived project data.

The source files remain unchanged. The generated web assets are written to
public/data so the statewide map can load them as static files.
"""

from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import Point, mapping, shape
from shapely.ops import unary_union
from mp_boundaries import load_mp_district_features
from project_data_policy import EXCLUDED_OBSERVATION_DATES


PROJECT_DIR = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_DIR / "data" / "processed"
PUBLIC_DATA_DIR = PROJECT_DIR / "public" / "data"

DETECTIONS_FILE = PROCESSED_DIR / "mp_firms.geojson"
FOOTPRINT_FILE = PROCESSED_DIR / "project_footprint.geojson"
def read_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as destination:
        json.dump(payload, destination, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    admin2_features = load_mp_district_features()
    districts = []
    district_shapes = []
    for feature in admin2_features:
        geometry = shape(feature["geometry"])
        name = str(feature.get("properties", {}).get("shapeName", "District"))
        label_point = geometry.representative_point()
        districts.append(
            {
                "type": "Feature",
                "id": feature.get("properties", {}).get("shapeID", name),
                "properties": {
                    "name": name,
                    "boundaryYear": "2021",
                    "labelLongitude": label_point.x,
                    "labelLatitude": label_point.y,
                },
                "geometry": feature["geometry"],
            }
        )
        district_shapes.append((name, geometry))

    detections_source = read_json(DETECTIONS_FILE)
    detections = []
    unmatched = 0
    for feature in detections_source["features"]:
        coordinates = feature.get("geometry", {}).get("coordinates", [])
        if len(coordinates) < 2:
            continue
        properties = feature.get("properties", {})
        date = str(properties.get("date", ""))
        if date in EXCLUDED_OBSERVATION_DATES:
            continue
        longitude, latitude = float(coordinates[0]), float(coordinates[1])
        point = Point(longitude, latitude)
        district_name = next(
            (name for name, geometry in district_shapes if geometry.covers(point)),
            "",
        )
        if not district_name:
            unmatched += 1

        detections.append(
            {
                "type": "Feature",
                "id": len(detections) + 1,
                "properties": {
                    "date": str(properties.get("date", "")),
                    "time": str(properties.get("time", "")),
                    "confidence": str(properties.get("confidence", "")),
                    "frp": properties.get("frp"),
                    "daynight": str(properties.get("daynight", "")),
                    "district": district_name,
                },
                "geometry": {"type": "Point", "coordinates": [longitude, latitude]},
            }
        )

    state_geometry = unary_union([geometry for _, geometry in district_shapes])
    if state_geometry.is_empty or not state_geometry.is_valid:
        raise ValueError("The dissolved geoBoundaries Madhya Pradesh outline is empty or invalid.")

    state = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Madhya Pradesh",
                    "boundarySource": "geoBoundaries India ADM2 simplified 2021, dissolved districts",
                    "boundaryLicense": "ODbL-1.0",
                },
                "geometry": mapping(state_geometry),
            }
        ],
    }

    write_json(PUBLIC_DATA_DIR / "madhya-pradesh-boundary.geojson", state)
    write_json(
        PUBLIC_DATA_DIR / "madhya-pradesh-districts.geojson",
        {"type": "FeatureCollection", "features": districts},
    )
    write_json(
        PUBLIC_DATA_DIR / "madhya-pradesh-firms.geojson",
        {"type": "FeatureCollection", "features": detections},
    )
    write_json(PUBLIC_DATA_DIR / "project-footprint.geojson", read_json(FOOTPRINT_FILE))

    assigned = len(detections) - unmatched
    print(f"Prepared {len(districts)} district boundaries and {len(detections)} detections.")
    print(f"Detections assigned to a 2021 district polygon: {assigned}; unassigned: {unmatched}.")


if __name__ == "__main__":
    main()
