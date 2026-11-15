"""Create a CSV inventory of installed npm package license declarations."""

from __future__ import annotations

import csv
import json
from importlib import metadata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NODE_MODULES = ROOT / "node_modules"
OUTPUT = ROOT / "THIRD_PARTY_DEPENDENCIES.csv"
PYTHON_DIRECT_DEPENDENCIES = (
    "geopandas",
    "matplotlib",
    "numpy",
    "pandas",
    "rasterio",
    "shapely",
)


def license_label(value: object) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return str(value.get("type", "See package license file"))
    if isinstance(value, list):
        return "; ".join(license_label(item) for item in value)
    return "Not declared in package.json; inspect package license files"


def python_license_label(package: metadata.Distribution) -> str:
    value = package.metadata.get("License-Expression") or package.metadata.get("License")
    if value:
        return str(value).replace("\n", " ").strip()
    classifiers = [
        item.removeprefix("License :: ")
        for item in package.metadata.get_all("Classifier", [])
        if item.startswith("License :: ")
    ]
    return "; ".join(classifiers) if classifiers else "Not declared; inspect package license files"


def main() -> None:
    packages: set[tuple[str, str, str, str]] = set()
    for manifest in NODE_MODULES.rglob("package.json"):
        try:
            package = json.loads(manifest.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        name, version = package.get("name"), package.get("version")
        if name and version:
            packages.add(("JavaScript", str(name), str(version), license_label(package.get("license"))))

    for name in PYTHON_DIRECT_DEPENDENCIES:
        try:
            package = metadata.distribution(name)
        except metadata.PackageNotFoundError:
            packages.add(("Python", name, "not installed", "Not available in this Python environment"))
            continue
        packages.add(("Python", package.metadata.get("Name", name), package.version, python_license_label(package)))

    with OUTPUT.open("w", encoding="utf-8", newline="") as target:
        writer = csv.writer(target)
        writer.writerow(["ecosystem", "package", "version", "declared_license"])
        writer.writerows(sorted(packages))
    print(f"Wrote {len(packages)} package entries to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
