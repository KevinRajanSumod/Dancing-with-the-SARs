"""Load Madhya Pradesh outlines from the openly licensed 2021 ADM2 data."""

from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import shape
from shapely.ops import unary_union


PROJECT_DIR = Path(__file__).resolve().parents[2]
BOUNDARIES_DIR = PROJECT_DIR / "data" / "raw" / "boundaries"
ADMIN2_FILE = BOUNDARIES_DIR / "geoboundaries_ind_adm2_simplified.geojson"
DISTRICT_NAMES_FILE = BOUNDARIES_DIR / "madhya_pradesh_districts_2021.txt"


def load_mp_district_features() -> list[dict]:
    """Return the reviewed MP district subset from the full India ADM2 file."""
    names = [
        line.strip()
        for line in DISTRICT_NAMES_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    if len(names) != len(set(names)):
        raise ValueError("The Madhya Pradesh district manifest contains duplicate names.")

    with ADMIN2_FILE.open(encoding="utf-8") as source:
        admin2 = json.load(source)

    by_name = {}
    for feature in admin2.get("features", []):
        name = feature.get("properties", {}).get("shapeName")
        if name in names:
            if name in by_name:
                raise ValueError(f"The geoBoundaries ADM2 file repeats district name {name!r}.")
            by_name[name] = feature

    missing = sorted(set(names) - set(by_name))
    if missing:
        raise ValueError("District names missing from geoBoundaries ADM2: " + ", ".join(missing))
    return [by_name[name] for name in names]


def load_mp_state_geometry():
    """Dissolve the selected 2021 MP districts into one state outline."""
    geometry = unary_union([shape(feature["geometry"]) for feature in load_mp_district_features()])
    if geometry.is_empty or not geometry.is_valid:
        raise ValueError("The dissolved geoBoundaries Madhya Pradesh outline is empty or invalid.")
    return geometry
