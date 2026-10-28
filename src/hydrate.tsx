import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { isLocale } from './i18n';
import { isPageId } from './pages';
import type { Locale } from './types';

export function start(container: HTMLElement, prerendered: boolean): void {
  // Built pages carry their locale in <html lang> and their page in <html data-page>; the dev
  // server serves only index.html, so there ?lang=tr and ?page=grocery pick them.
  const html = document.documentElement;
  const query = new URLSearchParams(location.search);
  const requested = prerendered ? html.lang : query.get('lang');
  const locale: Locale = isLocale(requested) ? requested : 'en';
  const requestedPage = prerendered ? html.dataset.page : query.get('page');
  const page = isPageId(requestedPage) ? requestedPage : 'home';
  html.dataset.page = page;

  if (page === 'grocery') {
    // The built case study is static and never gets here; this is only the dev-server preview.
    void import('./components/GroceryCase').then(({ GroceryCase }) => {
      createRoot(container).render(<GroceryCase locale={locale} />);
    });
    return;
  }
  const app = (
    <StrictMode>
      <App locale={locale} />
    </StrictMode>
  );
  if (prerendered) hydrateRoot(container, app);
  else createRoot(container).render(app);
}
