// A small reader for the subset of Markdown used in sources.md:
// headings, paragraphs, bullet lists, **bold** and [links](url).

export type InlinePart =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; id: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

const INLINE_PATTERN = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: 'text', text: text.slice(last, index) });
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push({ type: 'bold', text: token.slice(2, -2) });
    } else {
      const label = token.slice(1, token.indexOf(']'));
      const href = token.slice(token.indexOf('(') + 1, -1);
      parts.push({ type: 'link', text: label, href });
    }
    last = index + token.length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

export function toPlainText(text: string): string {
  return parseInline(text)
    .map((part) => part.text)
    .join('');
}

function slugify(text: string, used: Map<string, number>): string {
  const base =
    toPlainText(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const usedIds = new Map<string, number>();
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const listItem = /^[-*]\s+(.*)$/.exec(line);

    if (line === '') {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length as 1 | 2 | 3;
      const text = heading[2];
      blocks.push({ type: 'heading', level, id: slugify(text, usedIds), text });
    } else if (listItem) {
      flushParagraph();
      listItems.push(listItem[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}
