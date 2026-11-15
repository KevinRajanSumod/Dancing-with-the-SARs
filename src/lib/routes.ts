export interface AppRoute {
  path: string;
  label: string;
}

// Order here is the order of the navigation links.
export const routes: AppRoute[] = [
  { path: '/', label: 'Home' },
  { path: '/study-map', label: 'Explore map' },
  { path: '/how-sar-works', label: 'How SAR works' },
  { path: '/physical-drivers', label: 'Environmental context' },
  { path: '/future-applications', label: 'Applications' },
  { path: '/sources', label: 'Sources' },
  { path: '/upcoming', label: 'Project progress' },
  { path: '/case-study', label: 'Case study' },
];
