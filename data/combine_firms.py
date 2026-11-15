"""
Combine daily NASA FIRMS detection files into one CSV.

This script only READS files in firms_raw. It never changes those files.
Each row is one satellite detection (not called a "fire" here).
"""

from pathlib import Path  # Path helps us find folders and files on the computer

import pandas as pd  # pandas reads tables and filters rows

# This folder is Data/, where this script lives.
DATA_DIR = Path(__file__).resolve().parent

# The original NASA files stay here. We only open them to read.
RAW_DIR = DATA_DIR / "firms_raw"

# The one new combined file we will create (outside firms_raw).
OUTPUT_FILE = DATA_DIR / "firms_combined.csv"

# Columns we keep in the output (the NASA files have extra columns we drop).
KEEP_COLUMNS = [
    "latitude",
    "longitude",
    "acq_date",
    "acq_time",
    "confidence",
    "frp",
    "daynight",
]

# Radar footprint corners as (longitude, latitude), in the order you gave.
# We close the shape by returning to the first corner at the end of the test.
FOOTPRINT = [
    (76.586, 21.291),
    (79.863, 21.228),
    (79.971, 24.235),
    (76.622, 24.307),
]


def point_in_polygon(x, y, polygon):
    """
    Return True if the point (x, y) is inside the polygon.

    This is a ray-casting test: draw a line east from the point and count
    how many polygon edges it crosses. An odd count means the point is inside.
    This is NOT a simple rectangle (min/max lon and lat).
    x is longitude, y is latitude.
    """
    inside = False
    n = len(polygon)
    j = n - 1  # previous corner (starts as the last corner)
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        # Does this edge cross the horizontal ray going right from (x, y)?
        crosses = (yi > y) != (yj > y)
        if crosses:
            # Longitude where the edge meets the ray
            x_at_cross = (xj - xi) * (y - yi) / (yj - yi) + xi
            if x < x_at_cross:
                inside = not inside  # each crossing flips inside/outside
        j = i
    return inside


def main():
    # List every .txt file in firms_raw, in name order so the run is repeatable.
    files = sorted(RAW_DIR.glob("*.txt"))
    files_read = 0  # how many files we successfully opened
    unread_files = []  # names of files that could not be read
    tables = []  # one small table per successful file

    for path in files:
        try:
            # Read the comma-separated NASA table. Encoding errors won't crash us.
            table = pd.read_csv(path)
            files_read += 1
            tables.append(table)
        except Exception as error:
            # Remember the file name and keep going with the others.
            unread_files.append(f"{path.name} ({error})")

    # If nothing loaded, stop with a clear message instead of crashing later.
    if not tables:
        print("No files could be read.")
        print(f"Number of files read: {files_read}")
        print("Files that could not be read:")
        if unread_files:
            for name in unread_files:
                print(f"  - {name}")
        else:
            print("  (none)")
        return

    # Stack every file's rows into one big table.
    all_rows = pd.concat(tables, ignore_index=True)
    total_rows_read = len(all_rows)

    # Keep only the columns we need (still includes every confidence value).
    all_rows = all_rows[KEEP_COLUMNS].copy()

    # Turn acq_date text into real dates and discard rows with no usable date.
    all_rows["acq_date"] = pd.to_datetime(all_rows["acq_date"], errors="coerce")
    all_rows = all_rows[all_rows["acq_date"].notna()].copy()

    # Keep detections whose lon/lat fall inside the four-corner footprint.
    inside_mask = [
        point_in_polygon(lon, lat, FOOTPRINT)
        for lon, lat in zip(all_rows["longitude"], all_rows["latitude"])
    ]
    kept = all_rows[inside_mask].copy()
    rows_after_footprint = len(kept)

    # Sort by date, then by time, so the file reads in time order.
    # acq_time is text like 05:23; that order matches clock time.
    kept = kept.sort_values(["acq_date", "acq_time"], kind="mergesort")

    # Write dates back as YYYY-MM-DD text for a clean CSV.
    kept["acq_date"] = kept["acq_date"].dt.strftime("%Y-%m-%d")

    # Save one new file with the header row once at the top.
    kept.to_csv(OUTPUT_FILE, index=False)

    # Count kept rows by confidence (low / nominal / high). Do not drop any of them.
    confidence_counts = kept["confidence"].value_counts()

    # Count kept rows by acquisition date.
    date_counts = kept["acq_date"].value_counts().sort_index()

    # ----- summary (this is the last thing the script does) -----
    print(f"Number of files read: {files_read}")
    print("Files that could not be read:")
    if unread_files:
        for name in unread_files:
            print(f"  - {name}")
    else:
        print("  (none)")
    print(f"Total rows read: {total_rows_read}")
    print(f"Rows with a usable acquisition date: {len(all_rows)}")
    print(f"Rows kept after the footprint filter: {rows_after_footprint}")
    print("Count of kept rows by confidence:")
    for label in ["low", "nominal", "high"]:
        print(f"  {label}: {int(confidence_counts.get(label, 0))}")
    extra_conf = [c for c in confidence_counts.index if c not in ("low", "nominal", "high")]
    for label in extra_conf:
        print(f"  {label}: {int(confidence_counts[label])}")
    print("Count of kept rows by acq_date:")
    for date_value, count in date_counts.items():
        print(f"  {date_value}: {int(count)}")


if __name__ == "__main__":
    # Running "python Data/combine_firms.py" starts here.
    main()
