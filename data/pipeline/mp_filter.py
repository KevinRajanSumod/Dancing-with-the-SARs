"""
Keep only the satellite detections that fall inside Madhya Pradesh.

This script only READS files in data/raw. It never changes, renames, or
deletes those files. Each kept row is one satellite detection.

What it does, in order:
1. Find the Madhya Pradesh shape in the state-boundary file.
2. Read every daily detection file.
3. Keep dates from 2026-09-30 through 2026-11-05.
4. Keep points that sit inside the Madhya Pradesh shape.
5. Keep every confidence level (low, nominal, and high).
6. Save one point per detection to data/processed/mp_firms.geojson.
7. Print how many detections fall on each date.
"""

import sys
from pathlib import Path

import geopandas as gpd
import pandas as pd

# This file lives in data/pipeline/. The project folder is two levels up.
PROJECT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_DIR / "data"

# Original files. We open these to read them. We do not write to data/raw.
BOUNDARY_FILE = DATA_DIR / "raw" / "boundaries" / "gadm41_IND_1.json"
FIRMS_DIR = DATA_DIR / "raw" / "firms_raw"

# The new file this script is allowed to create.
OUTPUT_FILE = DATA_DIR / "processed" / "mp_firms.geojson"

# The state name is stored with no space in the boundary file.
STATE_NAME = "MadhyaPradesh"
STATE_HASC = "IN.MP"

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

# Keep this first day, this last day, and every day in between.
DATE_START = pd.Timestamp("2026-09-30")
DATE_END = pd.Timestamp("2026-11-05")


def stop(message):
    """Print a plain-language reason and end the script."""
    print(message)
    sys.exit(1)


def load_state():
    """Step 1. Load the state shapes and pick Madhya Pradesh."""
    print("Step 1 — state boundary")
    states = gpd.read_file(BOUNDARY_FILE)

    if "NAME_1" not in states.columns:
        stop("The boundary file has no NAME_1 column. Stopping.")

    matches = states[states["NAME_1"] == STATE_NAME]
    print(f"Matching rows for NAME_1 == '{STATE_NAME}': {len(matches)}")

    if len(matches) == 0:
        print("No row matches. NAME_1 values that contain 'Pradesh':")
        pradesh_names = states.loc[
            states["NAME_1"].astype(str).str.contains("Pradesh", na=False),
            "NAME_1",
        ]
        for name in pradesh_names.tolist():
            print(name)
        stop("Stopping. The state name was not found, so nothing was guessed.")

    if len(matches) != 1:
        stop("Stopping. More than one row matched, so nothing was guessed.")

    state = matches.iloc[[0]].copy()
    name_value = state["NAME_1"].iloc[0]
    if name_value != STATE_NAME:
        stop(f"NAME_1 is {name_value!r}. Stopping because it does not match.")

    if "HASC_1" not in state.columns:
        stop("The matching row has no HASC_1 column. Stopping.")

    hasc_value = state["HASC_1"].iloc[0]
    print(f"NAME_1 is {name_value!r}. HASC_1 is {hasc_value!r}.")
    if hasc_value != STATE_HASC:
        stop(f"HASC_1 is {hasc_value!r}, not '{STATE_HASC}'. Stopping.")

    # The boundary file is longitude/latitude (EPSG:4326). If the reader
    # does not attach that label, we set it. We do not move any coordinates.
    print(f"Boundary CRS reported by the reader: {state.crs}")
    if state.crs is None:
        state = state.set_crs("EPSG:4326")
        print("No CRS label was stored in the file. Using EPSG:4326, as specified.")
    elif state.crs.to_epsg() != 4326:
        stop(f"The boundary CRS is {state.crs}, not EPSG:4326. Stopping.")

    return state


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
    return detections


def filter_dates(detections):
    """Step 3. Keep rows whose acq_date is inside the study window."""
    print("Step 3 — dates from 2026-09-30 through 2026-11-05")
    dates = pd.to_datetime(detections["acq_date"], errors="coerce").dt.normalize()
    unreadable = int(dates.isna().sum())
    if unreadable:
        print(f"Rows with an unreadable acq_date: {unreadable}")

    in_window = dates.notna() & (dates >= DATE_START) & (dates <= DATE_END)
    kept = detections.loc[in_window].copy()
    kept["acq_date"] = dates.loc[in_window].dt.strftime("%Y-%m-%d")
    print(f"Detections in this date range: {len(kept)}")
    return kept


def keep_inside_state(detections, state):
    """Step 4. Turn each row into a point and keep points inside the state."""
    print("Step 4 — detections inside Madhya Pradesh")
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
    """Step 5. Count each confidence label. Do not drop any of them."""
    print("Step 5 — confidence (all levels kept)")
    counts = detections["confidence"].value_counts(dropna=False)
    for label in ("low", "nominal", "high"):
        print(f"Detections with confidence {label}: {int(counts.get(label, 0))}")
    other = [label for label in counts.index if label not in ("low", "nominal", "high")]
    for label in other:
        print(f"Detections with confidence {label}: {int(counts.loc[label])}")


def save_geojson(detections):
    """Step 6. Save one point per detection, with only the needed properties."""
    print("Step 6 — save the Madhya Pradesh detection file")
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
    """Step 7. Print how many detections there are on each saved date."""
    print("Step 7 — detections per date")
    counts = saved["date"].astype(str).value_counts().sort_index()
    for date, count in counts.items():
        print(f"{date}: {int(count)}")
    print(f"Total detections: {int(counts.sum())}")


def main():
    state = load_state()
    detections = read_detection_files()
    detections = filter_dates(detections)
    detections = keep_inside_state(detections, state)
    print_confidence(detections)
    saved = save_geojson(detections)
    print_dates(saved)
    print("Done. The original files in data/raw were only read.")


if __name__ == "__main__":
    main()
