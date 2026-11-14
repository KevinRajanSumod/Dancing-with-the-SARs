import { useEffect, type ComponentType } from 'react';
import AppLink, { buttonClass } from '@/components/AppLink';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { usePathname } from '@/hooks/usePathname';
import { routes } from '@/lib/routes';
import HomePage from '@/pages/HomePage';
import HowSarWorksPage from '@/pages/HowSarWorksPage';
import ForestFireChangePage from '@/pages/ForestFireChangePage';
import PhysicalDriversPage from '@/pages/PhysicalDriversPage';
import FutureApplicationsPage from '@/pages/FutureApplicationsPage';
import SourcesPage from '@/pages/SourcesPage';
import UpcomingPage from '@/pages/UpcomingPage';

const pages: Record<string, ComponentType> = {
  '/': HomePage,
  '/how-sar-works': HowSarWorksPage,
  '/forest-fire-change': ForestFireChangePage,
  '/physical-drivers': PhysicalDriversPage,
  '/future-applications': FutureApplicationsPage,
  '/sources': SourcesPage,
  '/upcoming': UpcomingPage,
};

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center md:px-8">
      <h1>Page not found</h1>
      <p className="mt-6 text-lg">The page you asked for does not exist.</p>
      <AppLink to="/" className={`mt-8 ${buttonClass('primary')}`}>
        Back to home
      </AppLink>
    </section>
  );
}

export default function App() {
  const pathname = usePathname();
  const Page = pages[pathname] ?? NotFoundPage;
  const routeTitle = routes.find((route) => route.path === pathname)?.label;
  const title = pathname === '/' ? 'Reading change in radar' : routeTitle;

  useEffect(() => {
    document.title = title ? `${title} | Dancing with the SARs` : 'Dancing with the SARs';
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-navy focus:shadow-card"
      >
        Skip to content
      </a>
      <SiteHeader pathname={pathname} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Page />
      </main>
      <SiteFooter />
    </div>
  );
}
