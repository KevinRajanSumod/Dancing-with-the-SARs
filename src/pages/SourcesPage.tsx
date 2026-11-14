import { BookOpenCheck, ExternalLink } from 'lucide-react';
import MarkdownBlocks from '@/components/MarkdownBlocks';
import PageIntro from '@/components/PageIntro';
import sourcesText from '@/data/sources.md?raw';
import { parseMarkdown, toPlainText, type Block } from '@/lib/markdown';

const blocks: Block[] = parseMarkdown(sourcesText);

const tocEntries = blocks.flatMap((block) =>
  block.type === 'heading' && block.level <= 2 ? [{ id: block.id, text: toPlainText(block.text), level: block.level }] : [],
);

export default function SourcesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-9 pt-14 sm:px-8 md:pb-12 md:pt-20">
        <p className="eyebrow">Documentation / Evidence record</p>
        <PageIntro title="Sources, data and method">
          <p>
            Explore the scene record, FIRMS snapshot, study footprint and interpretation limits behind this story. Use the
            copy controls beside references to cite them in your own notes.
          </p>
        </PageIntro>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:px-8 md:pb-28 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><BookOpenCheck className="h-4 w-4 text-teal" aria-hidden="true" /> On this page</p>
            <nav aria-label="On this page" className="mt-4">
              <ul className="space-y-1 border-l border-navy/15">
                {tocEntries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`-ml-px block border-l-2 border-transparent py-2 text-sm text-ink/65 transition-colors hover:border-teal hover:text-teal ${entry.level === 1 ? 'pl-3 font-semibold text-navy' : 'pl-6'}`}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-4 rounded-2xl bg-navy p-5 text-sm text-white">
            <p className="font-semibold">Independent project</p>
            <p className="mt-2 leading-relaxed text-white/65">NASA and ISRO data are credited to their sources. This site does not imply agency endorsement.</p>
          </div>
        </aside>

        <div className="min-w-0 max-w-4xl" aria-label="Source notes">
          {blocks.length > 0 ? <MarkdownBlocks blocks={blocks} /> : <p>The source notes are empty.</p>}
          <a href="https://images.nasa.gov/details/art002e000192" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy">
            NASA Image and Video Library item <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
    </>
  );
}
