"""Regenerate the browser fallback and root export from the filtered CSV."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "processed" / "firms_combined.csv"


def main() -> None:
    records = []
    with SOURCE.open(encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            records.append(
                {
                    "lat": float(row["latitude"]),
                    "lon": float(row["longitude"]),
                    "date": row["acq_date"],
                    "time": row["acq_time"],
                    "conf": row["confidence"],
                    "frp": float(row["frp"]) if row["frp"] else None,
                }
            )

    payload = json.dumps(records, ensure_ascii=False, indent=1)
    (ROOT / "src" / "data" / "firms_context.js").write_text(
        "// Bundled study-footprint records from the filtered NASA FIRMS snapshot.\n"
        "// Low, nominal, and high confidence values are retained.\n"
        f"export const firmsContext = {payload};\n",
        encoding="utf-8",
        newline="\n",
    )
    (ROOT / "firms_context.js").write_text(
        "// Bundled study-footprint records from the filtered NASA FIRMS snapshot.\n"
        "// Low, nominal, and high confidence values are retained.\n"
        f"const firmsContext = {payload};\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"Wrote {len(records)} study-footprint records to both JS exports.")


if __name__ == "__main__":
    main()
