import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigateTo } from '@/hooks/usePathname';

export type ButtonVariant = 'primary' | 'secondary';

const BUTTON_BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-offset-4';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-ember via-ember-300 to-amber text-navy shadow-[0_8px_24px_rgba(248,131,121,.16)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_12px_30px_rgba(248,131,121,.26)]',
  secondary: 'border border-line-strong bg-paper text-ink hover:-translate-y-0.5 hover:bg-raised',
};

export function buttonClass(variant: ButtonVariant): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]}`;
}

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

// Links within the site change the page without reloading the whole site.
export default function AppLink({ to, onClick, ...rest }: AppLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || isModified || event.button !== 0) return;
    event.preventDefault();
    navigateTo(to);
  }

  return <a href={to} onClick={handleClick} {...rest} />;
}
