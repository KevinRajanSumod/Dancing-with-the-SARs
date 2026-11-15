"""Shared project-level rules for excluding selected observation dates."""

from pathlib import Path


DATA_DIR = Path(__file__).resolve().parents[1]
EXCLUDED_DATES_FILE = DATA_DIR / "excluded_observation_dates.txt"
EXCLUDED_OBSERVATION_DATES = frozenset(
    line.strip()
    for line in EXCLUDED_DATES_FILE.read_text(encoding="utf-8").splitlines()
    if line.strip() and not line.lstrip().startswith("#")
)
