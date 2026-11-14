import { useEffect, useState, type ComponentType } from 'react';
import { MessageCircle, X } from 'lucide-react';
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
import ProjectEvidenceAssistant from '@/components/ProjectEvidenceAssistant';

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
  const [assistantOpen, setAssistantOpen] = useState(false);
  const topic = pathname === '/future-applications' ? 'applications' : 'drivers';

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
      {assistantOpen && (
        <div className="fixed inset-0 z-[60] bg-black/55" onMouseDown={(event) => { if (event.target === event.currentTarget) setAssistantOpen(false); }}>
          <aside className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-white/15 bg-canvas shadow-2xl" role="dialog" aria-modal="true" aria-label="EchoGuide assistant">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-canvas/95 px-5 py-4 backdrop-blur">
              <span className="font-semibold text-white">EchoGuide · SAR research assistant</span>
              <button type="button" onClick={() => setAssistantOpen(false)} className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Close EchoGuide"><X className="h-5 w-5" /></button>
            </div>
            <ProjectEvidenceAssistant topic={topic} />
          </aside>
        </div>
      )}
      <button type="button" onClick={() => setAssistantOpen(true)} className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-radar px-5 py-3 font-bold text-canvas shadow-xl hover:bg-radar-200" aria-label="Open EchoGuide assistant">
        <MessageCircle className="h-5 w-5" /> Ask EchoGuide
      </button>
    </div>
  );
}
