export interface AppRoute {
  path: string;
  label: string;
}

// Order here is the order of the navigation links.
export const routes: AppRoute[] = [
  { path: '/', label: 'Overview' },
  { path: '/study-map', label: 'Study map' },
  { path: '/how-sar-works', label: 'How SAR works' },
  { path: '/physical-drivers', label: 'Environmental context' },
  { path: '/future-applications', label: 'Applications' },
  { path: '/sources', label: 'Data & method' },
  { path: '/upcoming', label: 'Project progress' },
];
