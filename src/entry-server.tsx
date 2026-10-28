import { renderToString } from 'react-dom/server';
import { App } from './App';
import { GroceryCase } from './components/GroceryCase';
import { meta } from './data/groceryCase';
import { createT } from './i18n';
import type { PageId } from './pages';
import type { Locale } from './types';

export interface RenderedPage {
  html: string;
  title: string;
  description: string;
}

export function renderPage(locale: Locale, page: PageId = 'home'): RenderedPage {
  const t = createT(locale);
  const html = renderToString(page === 'grocery' ? <GroceryCase locale={locale} /> : <App locale={locale} />);
  if (page === 'grocery') return { html, title: meta.title[locale], description: meta.description[locale] };
  return { html, title: t('meta.title'), description: t('meta.description') };
}
