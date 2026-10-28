import type { Locale } from './types';

/** Every prerendered page. `home` is the portfolio, the others are case studies. */
export type PageId = 'home' | 'grocery';
export const pageIds: readonly PageId[] = ['home', 'grocery'];

export function isPageId(value: unknown): value is PageId {
  return value === 'home' || value === 'grocery';
}

/** "/" and "/tr/" for the portfolio, "/projects/grocery/" and "/tr/projects/grocery/" for the case study. */
export function pagePath(page: PageId, locale: Locale): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return page === 'home' ? `${prefix}/` : `${prefix}/projects/${page}/`;
}
