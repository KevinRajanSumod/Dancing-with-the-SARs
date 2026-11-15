// Study area footprint in central India. The radar images and detections use these bounds.
export const STUDY_AREA = {
  latMin: 21.228,
  latMax: 24.307,
  lonMin: 76.586,
  lonMax: 79.971,
} as const;

// Approximate UTC acquisition spans from the two NISAR scenes cited in sources.md.
// Before: NISAR_L2_PR_GCOV_032_005_D_077_2005_QPDH_A_20260930T132451_20260930T132525_P05023_N_F_J_001
// After: NISAR_L2_PR_GCOV_035_005_D_077_4005_DHDH_A_20261105T132451_20261105T132526_P05036_N_F_J_001
export const RADAR_PASSES_UTC = [
  { date: '2026-09-30', start: '13:24:51', end: '13:25:25', label: 'Before pass' },
  { date: '2026-11-05', start: '13:24:51', end: '13:25:26', label: 'After pass' },
] as const;

// Converts a latitude and longitude into a percentage position inside the footprint frame.
// Left is west, top is north. Assumes the image covers the footprint bounds exactly.
export function toFramePercent(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - STUDY_AREA.lonMin) / (STUDY_AREA.lonMax - STUDY_AREA.lonMin)) * 100;
  const y = ((STUDY_AREA.latMax - lat) / (STUDY_AREA.latMax - STUDY_AREA.latMin)) * 100;
  return { x, y };
}
