export interface AppRoute {
  path: string;
  label: string;
}

// Order here is the order of the navigation links.
export const routes: AppRoute[] = [
  { path: '/', label: 'Home' },
  { path: '/how-sar-works', label: 'SAR basics' },
  { path: '/forest-fire-change', label: 'Fire story' },
  { path: '/physical-drivers', label: 'Drivers' },
  { path: '/future-applications', label: 'Applications' },
  { path: '/sources', label: 'Sources' },
  { path: '/upcoming', label: 'Roadmap' },
];
