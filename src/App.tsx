import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react';
import { X } from 'lucide-react';
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
  const [assistantMounted, setAssistantMounted] = useState(false);
  const assistantTriggerRef = useRef<HTMLButtonElement>(null);
  const assistantCloseRef = useRef<HTMLButtonElement>(null);
  const assistantPanelRef = useRef<HTMLElement>(null);
  const topic = pathname === '/how-sar-works' ? 'drivers' : 'applications';

  useEffect(() => {
    document.title = title ? `${title} | TerraScope` : 'TerraScope';
  }, [title]);

  useEffect(() => {
    if (!assistantOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    assistantCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAssistantOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = assistantPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      assistantTriggerRef.current?.focus();
    };
  }, [assistantOpen]);

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
      <SiteHeader pathname={pathname} assistantTriggerRef={assistantTriggerRef} onOpenAssistant={() => { setAssistantMounted(true); setAssistantOpen(true); }} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <PageEffects key={pathname}><Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-20 text-sm text-muted" role="status">Opening this study section…</div>}><Page /></Suspense></PageEffects>
      </main>
      <SiteFooter />
      {assistantMounted && (
        <div hidden={!assistantOpen} className="fixed inset-0 z-[60] bg-black/55" onMouseDown={(event) => { if (event.target === event.currentTarget) setAssistantOpen(false); }}>
          <aside ref={assistantPanelRef} className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-line bg-paper text-ink shadow-2xl" role="dialog" aria-modal="true" aria-label="EchoGuide assistant">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
              <span className="font-semibold text-ink">EchoGuide · satellite research guide</span>
              <button ref={assistantCloseRef} type="button" onClick={() => setAssistantOpen(false)} className="rounded-lg p-2 text-ink hover:bg-raised" aria-label="Close EchoGuide"><X className="h-5 w-5" /></button>
            </div>
            <ProjectEvidenceAssistant key={topic} topic={topic} />
          </aside>
        </div>
      )}
      </div>
    </>
  );
}
