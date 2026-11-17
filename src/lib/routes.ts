export interface AppRoute {
  path: string;
  label: string;
  pageTitle: string;
}

// Order here is the order of the navigation links.
export const routes: AppRoute[] = [
  { path: '/', label: 'Home', pageTitle: 'Read the land through radar, heat, and time.' },
  { path: '/study-map', label: 'Explore map', pageTitle: 'Satellite heat detections in Madhya Pradesh.' },
  { path: '/how-sar-works', label: 'How SAR works', pageTitle: 'How SAR reads the surface' },
  { path: '/physical-drivers', label: 'Environmental drivers', pageTitle: 'Environmental drivers of radar backscatter' },
  { path: '/future-applications', label: 'Applications', pageTitle: 'Where repeat radar observations can help' },
  { path: '/sources', label: 'Sources', pageTitle: 'Data, coverage, and interpretation' },
  { path: '/upcoming', label: 'Project progress', pageTitle: 'Fire detection now. Broader Earth monitoring next.' },
  { path: '/case-study', label: 'Live data', pageTitle: 'Check the latest satellite feeds' },
];

export const legacyPageTitles: Record<string, string> = {
  '/madhya-pradesh-map': 'Satellite heat detections in Madhya Pradesh.',
  '/forest-fire-change': 'Satellite heat detections in Madhya Pradesh.',
};
