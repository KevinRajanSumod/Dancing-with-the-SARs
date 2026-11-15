import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AppLink, { buttonClass } from '@/components/AppLink';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageEffects from '@/components/PageEffects';
import { usePathname } from '@/hooks/usePathname';
import { routes } from '@/lib/routes';
const HowSarWorksPage = lazy(() => import('@/pages/HowSarWorksPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const PhysicalDriversPage = lazy(() => import('@/pages/PhysicalDriversPage'));
const FutureApplicationsPage = lazy(() => import('@/pages/FutureApplicationsPage'));
const UpcomingPage = lazy(() => import('@/pages/UpcomingPage'));
const SourcesPage = lazy(() => import('@/pages/SourcesPage'));
const StudyDashboardPage = lazy(() => import('@/pages/StudyDashboardPage'));
const LiveEarthDataStory = lazy(() => import('@/pages/LiveEarthDataStory'));
import ProjectEvidenceAssistant from '@/components/ProjectEvidenceAssistant';

const pages: Record<string, ComponentType> = {
  '/': HomePage,
  '/madhya-pradesh-map': StudyDashboardPage,
  '/study-map': StudyDashboardPage,
  '/forest-fire-change': StudyDashboardPage,
  '/how-sar-works': HowSarWorksPage,
  '/physical-drivers': PhysicalDriversPage,
  '/future-applications': FutureApplicationsPage,
  '/sources': SourcesPage,
  '/upcoming': UpcomingPage,
  '/case-study': LiveEarthDataStory,
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
  const title = routeTitle;
  const [assistantOpen, setAssistantOpen] = useState(false);
  const topic = pathname === '/how-sar-works' ? 'drivers' : 'applications';

  useEffect(() => {
    document.title = title ? `${title} | TerraScope` : 'TerraScope';
  }, [title]);

  return (
    <>
      <div className="site-atmosphere" aria-hidden="true"><span className="ambient-orb ambient-orb-warm" /><span className="ambient-orb ambient-orb-cool" /></div>
      <div className="relative z-10 flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-navy focus:shadow-card"
      >
        Skip to content
      </a>
      <SiteHeader pathname={pathname} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <PageEffects key={pathname}><Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-20 text-sm text-muted" role="status">Opening this study section…</div>}><Page /></Suspense></PageEffects>
      </main>
      <SiteFooter />
      {assistantOpen && (
        <div className="fixed inset-0 z-[60] bg-black/55" onMouseDown={(event) => { if (event.target === event.currentTarget) setAssistantOpen(false); }}>
          <aside className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-line bg-paper text-ink shadow-2xl" role="dialog" aria-modal="true" aria-label="EchoGuide assistant">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
              <span className="font-semibold text-ink">EchoGuide · SAR research assistant</span>
              <button type="button" onClick={() => setAssistantOpen(false)} className="rounded-lg p-2 text-ink hover:bg-raised" aria-label="Close EchoGuide"><X className="h-5 w-5" /></button>
            </div>
            <ProjectEvidenceAssistant topic={topic} />
          </aside>
        </div>
      )}
      <button type="button" onClick={() => setAssistantOpen(true)} className="fixed bottom-24 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-radar text-canvas shadow-xl transition hover:bg-radar-200 sm:bottom-24 sm:right-5 sm:flex sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3 sm:font-bold" aria-label="Open EchoGuide assistant" title="Open the AI research assistant">
        <MessageCircle className="h-5 w-5" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Ask EchoGuide</span>
      </button>
      </div>
    </>
  );
}
