// Study area footprint in central India. The radar images and detections use these bounds.
export const STUDY_AREA = {
  latMin: 21.228,
  latMax: 24.307,
  lonMin: 76.586,
  lonMax: 79.971,
} as const;

// Converts a latitude and longitude into a percentage position inside the footprint frame.
// Left is west, top is north. Assumes the image covers the footprint bounds exactly.
export function toFramePercent(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - STUDY_AREA.lonMin) / (STUDY_AREA.lonMax - STUDY_AREA.lonMin)) * 100;
  const y = ((STUDY_AREA.latMax - lat) / (STUDY_AREA.latMax - STUDY_AREA.latMin)) * 100;
  return { x, y };
}
