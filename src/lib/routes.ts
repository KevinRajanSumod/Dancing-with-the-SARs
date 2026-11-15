export interface AppRoute {
  path: string;
  label: string;
}

// Order here is the order of the navigation links.
export const routes: AppRoute[] = [
  { path: '/', label: 'Study map' },
  { path: '/how-sar-works', label: 'How SAR works' },
  { path: '/sources', label: 'Data & method' },
];
