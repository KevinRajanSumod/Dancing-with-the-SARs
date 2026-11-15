#!/usr/bin/env python3
"""Calculate a descriptive pixel-wise gamma0 change raster from matched NISAR GCOV COGs.

This tool intentionally refuses scene pairs with mismatched acquisition metadata or raster grids.
It does not detect fire, forest loss, or causation.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

import numpy as np


SCENE_PREFIX = "NISAR_L2_PR_GCOV_"
LAYER_PATTERN = re.compile(r"^(HHHH|HVHV|VVVV|VHVH|RHRH|RVRV)$")


def parse_scene(scene_id: str) -> dict[str, str]:
    name = Path(scene_id).name
    if name.lower().endswith(".h5"):
        name = name[:-3]
    parts = name.split("_")
    if len(parts) < 17 or "_".join(parts[:4]) != SCENE_PREFIX.rstrip("_"):
        raise ValueError(f"Not a recognized NISAR L2 GCOV scene ID: {scene_id}")
    acquisition = re.match(r"^(\d{4})(\d{2})(\d{2})T", parts[11])
    if not acquisition:
        raise ValueError(f"Could not read acquisition date from scene ID: {scene_id}")
    return {
        "cycle": parts[4],
        "track": parts[5],
        "direction": parts[6],
        "frame": parts[7],
        "mode": parts[8],
        "polarization_configuration": parts[9],
        "frequency_band": parts[10],
        "date": f"{acquisition[1]}-{acquisition[2]}-{acquisition[3]}",
        "processing_release": parts[13],
        "scene_id": name,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compute after-minus-before gamma0 backscatter in dB from matched NISAR GCOV COGs."
    )
    parser.add_argument("before", type=Path, help="Earlier, single-band gamma0 COG")
    parser.add_argument("after", type=Path, help="Later, single-band gamma0 COG")
    parser.add_argument("--before-scene", required=True, help="Full source NISAR GCOV scene ID (or .h5 filename)")
    parser.add_argument("--after-scene", required=True, help="Full source NISAR GCOV scene ID (or .h5 filename)")
    parser.add_argument("--layer", required=True, help="Exact diagonal covariance layer in both files, e.g. HVHV")
    parser.add_argument("--collection", required=True, help="ASF collection used for both scenes; choose one collection")
    parser.add_argument("--output-dir", type=Path, required=True, help="Directory for change_gamma0_db.tif and summary.json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not LAYER_PATTERN.fullmatch(args.layer.upper()):
        raise ValueError("Choose one real-valued diagonal GCOV layer: HHHH, HVHV, VVVV, VHVH, RHRH, or RVRV.")
    if not args.collection.strip():
        raise ValueError("Specify the same ASF GCOV collection for both source scenes.")

    before_scene = parse_scene(args.before_scene)
    after_scene = parse_scene(args.after_scene)
    fields_to_match = (
        "track", "direction", "frame", "mode", "polarization_configuration",
        "frequency_band", "processing_release",
    )
    mismatches = [field for field in fields_to_match if before_scene[field] != after_scene[field]]
    if mismatches:
        details = ", ".join(
            f"{field} ({before_scene[field]} vs {after_scene[field]})" for field in mismatches
        )
        raise ValueError(f"Scenes are not a strict metadata match: {details}.")
    if before_scene["date"] >= after_scene["date"]:
        raise ValueError("The earlier scene must have an earlier acquisition date than the later scene.")
    if not args.before.is_file() or not args.after.is_file():
        raise ValueError("Both COG input files must exist.")

    try:
        import rasterio
    except ImportError as error:
        raise RuntimeError("Missing rasterio. Install the dependencies listed in data/pipeline/README_nisar_change.md.") from error

    with rasterio.open(args.before) as before_ds, rasterio.open(args.after) as after_ds:
        if before_ds.count != 1 or after_ds.count != 1:
            raise ValueError("Each input must be a single-band COG exported from the same GCOV layer.")
        if before_ds.crs is None or after_ds.crs is None or before_ds.crs != after_ds.crs:
            raise ValueError("The COGs must have the same defined CRS. Export both with identical Harmony subset settings.")
        same_grid = (
            before_ds.width == after_ds.width
            and before_ds.height == after_ds.height
            and before_ds.transform == after_ds.transform
        )
        if not same_grid:
            raise ValueError("The COGs do not share an identical pixel grid. Re-export both with identical subset settings; this tool will not resample measurements.")
        if not before_ds.crs.is_projected:
            raise ValueError("Inputs must use the projected GCOV grid, not longitude/latitude degrees.")
        if before_ds.tags(1).get("LAYER", args.layer.upper()) != args.layer.upper():
            raise ValueError("The earlier COG layer tag does not match --layer.")
        if after_ds.tags(1).get("LAYER", args.layer.upper()) != args.layer.upper():
            raise ValueError("The later COG layer tag does not match --layer.")

        before = before_ds.read(1, masked=True).astype("float64")
        after = after_ds.read(1, masked=True).astype("float64")
        before_values = np.asarray(before.filled(np.nan))
        after_values = np.asarray(after.filled(np.nan))
        valid = (
            np.isfinite(before_values)
            & np.isfinite(after_values)
            & (before_values > 0)
            & (after_values > 0)
            & (before_ds.read_masks(1) > 0)
            & (after_ds.read_masks(1) > 0)
        )
        valid_count = int(valid.sum())
        if not valid_count:
            raise ValueError("No shared valid positive-power pixels remain after applying the input nodata masks.")

        # GCOV diagonal terms are linear gamma0 power. The difference of their dB
        # values is 10*log10(after/before); output stays masked where either input is invalid.
        delta = np.full(before_values.shape, -9999.0, dtype="float32")
        delta[valid] = (10.0 * np.log10(after_values[valid] / before_values[valid])).astype("float32")
        valid_delta = delta[valid].astype("float64")
        pixel_area = abs(
            before_ds.transform.a * before_ds.transform.e
            - before_ds.transform.b * before_ds.transform.d
        )
        units = before_ds.crs.linear_units.lower()
        area_km2 = valid_count * pixel_area / 1_000_000 if units in {"metre", "meter", "metres", "meters"} else None
        grid_metadata = {
            "crs": str(before_ds.crs),
            "width": int(before_ds.width),
            "height": int(before_ds.height),
            "pixel_size": [float(before_ds.transform.a), float(before_ds.transform.e)],
        }
        profile = before_ds.profile.copy()
        profile.update(driver="GTiff", count=1, dtype="float32", nodata=-9999.0, compress="deflate", tiled=True)
        output = args.output_dir.resolve()
        output.mkdir(parents=True, exist_ok=True)
        raster_path = output / "change_gamma0_db.tif"
        with rasterio.open(raster_path, "w", **profile) as target:
            target.write(delta, 1)
            target.set_band_description(1, f"{args.layer.upper()} after-minus-before gamma0 (dB)")
            target.update_tags(
                quantity="after-minus-before gamma0 backscatter",
                units="dB",
                layer=args.layer.upper(),
                before_scene=before_scene["scene_id"],
                after_scene=after_scene["scene_id"],
                collection=args.collection.strip(),
                interpretation="Descriptive radar difference only; not a fire or forest-loss classification.",
            )

    summary = {
        "quantity": "after-minus-before gamma0 backscatter difference",
        "units": "dB",
        "formula": "10 * log10(after_gamma0_power / before_gamma0_power)",
        "layer": args.layer.upper(),
        "collection": args.collection.strip(),
        "before": before_scene,
        "after": after_scene,
        "shared_valid_pixel_count": valid_count,
        "shared_valid_area_km2": area_km2,
        "statistics_db": {
            "mean": float(np.mean(valid_delta)),
            "median": float(np.median(valid_delta)),
            "standard_deviation": float(np.std(valid_delta)),
            "p05": float(np.percentile(valid_delta, 5)),
            "p95": float(np.percentile(valid_delta, 95)),
            "minimum": float(np.min(valid_delta)),
            "maximum": float(np.max(valid_delta)),
        },
        "input_grid": {
            **grid_metadata,
        },
        "limitations": [
            "This is a descriptive change in radar backscatter, not a land-cover classification.",
            "It does not identify fire, burned area, forest loss, or causation.",
            "Source scene metadata and collection must be checked against ASF product records.",
            "Interpret alongside quality masks, acquisition conditions, and independent evidence.",
        ],
        "generated_on": date.today().isoformat(),
        "change_raster": raster_path.name,
    }
    summary_path = output / "summary.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {raster_path}")
    print(f"Wrote {summary_path}")
    print(f"Shared valid pixels: {valid_count:,}; median change: {summary['statistics_db']['median']:.3f} dB")
    print("This is a backscatter difference only; it does not attribute change to fire.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, RuntimeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(2)
