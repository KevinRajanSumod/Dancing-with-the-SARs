"""Rebuild the study-footprint daily-count plot from filtered FIRMS data."""

from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "processed" / "firms_combined.csv"
OUTPUT = ROOT / "data" / "output" / "detections_per_day.png"


def main() -> None:
    data = pd.read_csv(SOURCE, parse_dates=["acq_date"])
    counts = data.groupby("acq_date").size().sort_index()
    if counts.empty:
        raise ValueError("No study-footprint FIRMS records are available to plot.")

    fig, axis = plt.subplots(figsize=(12, 5.2), layout="constrained")
    axis.bar(counts.index, counts.values, width=0.82, color="#2f78b7")
    axis.set_title("Satellite heat detections per day · filtered study-footprint snapshot")
    axis.set_xlabel("Acquisition date (UTC)")
    axis.set_ylabel("Detection records")
    axis.grid(axis="y", alpha=0.22, linestyle="--")
    axis.set_axisbelow(True)
    fig.savefig(OUTPUT, dpi=180, facecolor="white")
    plt.close(fig)
    print(f"Wrote {len(counts)} daily values to {OUTPUT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
