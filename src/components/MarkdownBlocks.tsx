import { Fragment } from 'react';
import CopyButton from '@/components/CopyButton';
import { parseInline, toPlainText, type Block, type InlinePart } from '@/lib/markdown';

function toCopyText(text: string): string {
  return parseInline(text)
    .map((part) => part.type === 'link' ? `${part.text} (${part.href})` : part.text)
    .join('');
}

function renderInline(parts: InlinePart[]) {
  return parts.map((part, index) => {
    switch (part.type) {
      case 'bold':
        return <strong key={index} className="font-semibold text-ink">{part.text}</strong>;
      case 'link':
        return (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-radar underline underline-offset-2 hover:text-radar"
          >
            {part.text}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      default:
        return <Fragment key={index}>{part.text}</Fragment>;
    }
  });
}

const HEADING_CLASS = {
  1: 'text-2xl md:text-3xl',
  2: 'text-xl md:text-2xl',
  3: 'text-lg',
} as const;

interface MarkdownBlocksProps {
  blocks: Block[];
}

// Renders the parsed sources notes. Headings map to h2 to h4 so they follow the page title.
export default function MarkdownBlocks({ blocks }: MarkdownBlocksProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4';
            return (
              <Tag key={index} id={block.id} className={`scroll-mt-24 pt-4 ${HEADING_CLASS[block.level]}`}>
                {block.text}
              </Tag>
            );
          }
          case 'paragraph':
            return <p key={index}>{renderInline(parseInline(block.text))}</p>;
          case 'list':
            return (
              <ul key={index} className="space-y-3">
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5 shadow-card sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{renderInline(parseInline(item))}</span>
                    <CopyButton text={toCopyText(item)} label={toPlainText(item)} />
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
