# NISAR GCOV backscatter-change workflow

`nisar_gcov_change.py` computes an **after-minus-before gamma-nought backscatter difference** in dB from two matched, single-band, geocoded NISAR GCOV Cloud Optimized GeoTIFFs (COGs). It writes a masked GeoTIFF and a JSON summary. The result is a radar measurement difference; it is not a fire, forest-loss, burned-area, or causal classification.

## Input requirements

The dashboard uses date-based browse visualizations for exploration. These previews are not calibrated source measurements and should not be used as input to a quantitative change calculation. This runner is a separate research utility and requires compatible, geocoded GCOV measurement layers.

## Prepare compatible inputs

1. Sign in to [ASF Vertex](https://search.asf.alaska.edu/) with Earthdata Login. Find NISAR **L2 GCOV** scenes that cover the study footprint. Prefer the validated `NISAR_L2_GCOV_V1` collection; if only provisional data are available, keep the result clearly marked provisional.
2. Choose an earlier and later acquisition from the same repeat geometry: same relative track, orbit direction, frame, acquisition mode, polarization configuration, frequency band, and processing release. Select the same real-valued diagonal layer in both scenes, such as `HVHV` or `HHHH`.
3. Use ASF Harmony to export that layer from both products as single-band COGs. Use identical area-of-interest, projection, resolution, and output-grid settings. Keep the full source product IDs and collection name. Do not resample one scene separately to make it fit.
4. Save both COGs outside Git or in a local-only folder. Verify all acquisition and processing metadata before running the calculation.

The [ASF GCOV guide](https://nisar-docs.asf.alaska.edu/gcov/) documents the calibrated gamma-nought layers and their metadata. [ASF Harmony](https://nisar-docs.asf.alaska.edu/harmony/) can extract selected HDF5 datasets as COGs. [ASF’s product overview](https://nisar-docs.asf.alaska.edu/products-overview/) describes validated and provisional collections.

## Run the analysis

In PowerShell, from the project root, install the Python libraries if needed:

```powershell
python -m pip install numpy rasterio
```

Then run the script, replacing the two COG paths and scene IDs with the files and full IDs you selected. Keep the same layer and collection for both scenes.

```powershell
python data/pipeline/nisar_gcov_change.py `
  "C:\path\to\earlier-HVHV.tif" `
  "C:\path\to\later-HVHV.tif" `
  --before-scene "NISAR_L2_PR_GCOV_...full-earlier-scene-id..." `
  --after-scene "NISAR_L2_PR_GCOV_...full-later-scene-id..." `
  --layer HVHV `
  --collection NISAR_L2_GCOV_V1 `
  --output-dir "data/output/nisar-change"
```

The script checks the source IDs for matching track, direction, frame, mode, polarization configuration, frequency band, and processing release; requires the later acquisition date to follow the earlier one; and requires both rasters to have the same CRS and exact pixel grid. It will not silently reproject or resample them. It excludes nodata, non-finite, zero, and negative power values.

Outputs:

- `change_gamma0_db.tif`: valid-pixel after-minus-before values in dB, with nodata preserved.
- `summary.json`: source IDs, selected collection/layer, shared valid-pixel count, and descriptive statistics.

Review the scene records, data maturity, layer selection, and product quality masks before interpreting the output. The script’s automatic shared-pixel mask is based on the exported rasters’ nodata masks and positive power; for a science-quality result, also inspect and apply relevant GCOV mask/number-of-looks information and validate the analysis area. This runner does not infer fire cause. Compare the resulting change map with temporally appropriate burned-area evidence, thermal detections, optical context, and—where possible—field observations before discussing a fire hypothesis.
