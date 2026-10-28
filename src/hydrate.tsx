import { StrictMode, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { isLocale } from './i18n';
import { isPageId } from './pages';
import type { Locale } from './types';

export function start(container: HTMLElement, prerendered: boolean): void {
  // Built pages carry their locale in <html lang> and their page in <html data-page>; the dev
  // server serves index.html for every path, so there the path (/tr/, /projects/grocery/) or
  // ?lang=tr and ?page=grocery pick them.
  const html = document.documentElement;
  const query = new URLSearchParams(location.search);
  const segments = location.pathname.split('/').filter(Boolean);
  const projects = segments.indexOf('projects');
  const requested = prerendered ? html.lang : (query.get('lang') ?? segments[0]);
  const locale: Locale = isLocale(requested) ? requested : 'en';
  const requestedPage = prerendered ? html.dataset.page : (query.get('page') ?? (projects >= 0 ? segments[projects + 1] : null));
  const page = isPageId(requestedPage) ? requestedPage : 'home';
  html.dataset.page = page;
  html.lang = locale;

  if (page === 'grocery') {
    // The built case study is static and never gets here; this is only the dev-server preview.
    void import('./components/GroceryCase').then(({ GroceryCase }) => {
      createRoot(container).render(<GroceryCase locale={locale} />);
    });
    return;
  }
  const app = (
    <StrictMode>
      <Root initial={locale} />
    </StrictMode>
  );
  if (prerendered) hydrateRoot(container, app);
  else createRoot(container).render(app);
}

declare global {
  interface Window {
    /** Set while the portfolio is hydrated: the head script's language switch renders through it. */
    __renderLocale?: (locale: Locale) => void;
  }
}

/**
 * Holds the page language, so the language switch changes it in place without loading the other
 * page. The head script in index.html fetches the other page's head, starts the transition and
 * calls __renderLocale; flushSync makes React finish the new language inside that transition.
 */
function Root({ initial }: { initial: Locale }) {
  const [locale, setLocale] = useState(initial);
  useEffect(() => {
    window.__renderLocale = (next) => flushSync(() => setLocale(next));
    return () => {
      delete window.__renderLocale;
    };
  }, []);
  return <App locale={locale} />;
}
