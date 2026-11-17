"""
Keep only the satellite detections that fall inside Madhya Pradesh.

This script only READS files in data/raw. It never changes, renames, or
deletes those files. Each kept row is one satellite detection.

What it does, in order:
1. Find the Madhya Pradesh shape in the state-boundary file.
2. Read every daily detection file.
3. Keep points that sit inside the Madhya Pradesh shape.
4. Keep every confidence level (low, nominal, and high).
5. Save one point per detection to data/processed/mp_firms.geojson.
6. Print how many detections fall on each date.
"""

import sys
from pathlib import Path

import geopandas as gpd
import pandas as pd
from mp_boundaries import load_mp_state_geometry
from project_data_policy import EXCLUDED_OBSERVATION_DATES

# This file lives in data/pipeline/. The project folder is two levels up.
PROJECT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_DIR / "data"

# Original files. We open these to read them. We do not write to data/raw.
FIRMS_DIR = DATA_DIR / "raw" / "firms_raw"

# The new file this script is allowed to create.
OUTPUT_FILE = DATA_DIR / "processed" / "mp_firms.geojson"

# Columns we keep from each daily file. Extra columns are ignored.
KEEP_COLUMNS = [
    "latitude",
    "longitude",
    "acq_date",
    "acq_time",
    "confidence",
    "frp",
    "daynight",
]

def stop(message):
    """Print a plain-language reason and end the script."""
    print(message)
    sys.exit(1)


def load_state():
    """Step 1. Dissolve the reviewed 2021 geoBoundaries district shapes."""
    print("Step 1 — open 2021 district boundaries")
    try:
        geometry = load_mp_state_geometry()
    except (OSError, ValueError, KeyError) as error:
        stop(f"Could not load the geoBoundaries Madhya Pradesh outline: {error}")
    print("Loaded 52 district shapes and dissolved them into one outline.")
    return gpd.GeoDataFrame(
        {"name": ["Madhya Pradesh"]},
        geometry=[geometry],
        crs="EPSG:4326",
    )


def read_detection_files():
    """Step 2. Read every file in the daily detection folder."""
    print("Step 2 — read daily detection files")
    files = sorted(path for path in FIRMS_DIR.iterdir() if path.is_file())
    tables = []
    failed = []

    for path in files:
        try:
            table = pd.read_csv(
                path,
                usecols=KEEP_COLUMNS,
                dtype={
                    "acq_time": str,
                    "confidence": str,
                    "daynight": str,
                },
            )
        except Exception as error:
            failed.append(path.name)
            print(f"Failed file: {path.name} ({error})")
            continue
        tables.append(table)

    print(f"Files read: {len(tables)}")
    if not failed:
        print("Files that failed: none")
    else:
        print(f"Files that failed: {len(failed)}")

    if not tables:
        stop("No detection file could be read. Stopping.")

    detections = pd.concat(tables, ignore_index=True)
    print(f"Total detection rows read: {len(detections)}")
    excluded = detections["acq_date"].astype(str).isin(EXCLUDED_OBSERVATION_DATES)
    print(f"Rows on excluded observation dates: {int(excluded.sum())}")
    detections = detections.loc[~excluded].copy()
    return detections


def keep_inside_state(detections, state):
    """Step 3. Turn each row into a point and keep points inside the state."""
    print("Step 3 — detections inside Madhya Pradesh")
    points = gpd.GeoDataFrame(
        detections,
        geometry=gpd.points_from_xy(detections["longitude"], detections["latitude"]),
        crs="EPSG:4326",
    )
    # within() keeps a point only when it is inside the state shape.
    inside = gpd.sjoin(
        points,
        state[["geometry"]],
        predicate="within",
        how="inner",
    )
    if inside.index.duplicated().any():
        stop(
            "A detection matched the state shape more than once. "
            "Stopping so detections are not counted twice."
        )
    inside = inside.drop(columns=["index_right"]).reset_index(drop=True)
    print(f"Detections inside Madhya Pradesh: {len(inside)}")
    return inside


def print_confidence(detections):
    """Step 4. Count each confidence label. Do not drop any of them."""
    print("Step 4 — confidence (all levels kept)")
    counts = detections["confidence"].value_counts(dropna=False)
    for label in ("low", "nominal", "high"):
        print(f"Detections with confidence {label}: {int(counts.get(label, 0))}")
    other = [label for label in counts.index if label not in ("low", "nominal", "high")]
    for label in other:
        print(f"Detections with confidence {label}: {int(counts.loc[label])}")


def save_geojson(detections):
    """Step 5. Save one point per detection, with only the needed properties."""
    print("Step 5 — save the Madhya Pradesh detection file")
    output = gpd.GeoDataFrame(
        {
            "date": detections["acq_date"].astype(str),
            "time": detections["acq_time"].astype(str),
            "confidence": detections["confidence"].astype(str),
            "frp": pd.to_numeric(detections["frp"], errors="coerce"),
            "daynight": detections["daynight"].astype(str),
        },
        geometry=detections.geometry,
        crs="EPSG:4326",
    )
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    output.to_file(OUTPUT_FILE, driver="GeoJSON")

    saved = gpd.read_file(OUTPUT_FILE)
    print(f"Saved file: {OUTPUT_FILE}")
    print(f"Features in the saved file: {len(saved)}")
    if len(saved) != len(detections):
        stop(
            "The saved file does not have the same number of detections "
            "as the inside-state count. Stopping."
        )
    if not OUTPUT_FILE.is_file() or OUTPUT_FILE.stat().st_size == 0:
        stop("The saved file is missing or empty. Stopping.")
    return saved


def print_dates(saved):
    """Step 6. Print how many detections there are on each saved date."""
    print("Step 6 — detections per date")
    counts = saved["date"].astype(str).value_counts().sort_index()
    for date, count in counts.items():
        print(f"{date}: {int(count)}")
    print(f"Total detections: {int(counts.sum())}")


def main():
    state = load_state()
    detections = read_detection_files()
    detections = keep_inside_state(detections, state)
    print_confidence(detections)
    saved = save_geojson(detections)
    print_dates(saved)
    print("Done. The remaining source files in data/raw were only read.")


if __name__ == "__main__":
    main()
