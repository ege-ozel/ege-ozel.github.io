// Writes every page in both languages from the client template and the SSR bundle:
// dist/index.html and dist/tr/index.html (portfolio), dist/projects/grocery/index.html and
// dist/tr/projects/grocery/index.html (Grocery case study). Runs as the last step of `npm run build`.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// SITE_URL lets another host (for example Vercel) build canonical and preview links for itself.
const SITE = (process.env.SITE_URL ?? 'https://ege-ozel.github.io').replace(/\/$/, '');
const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = join(root, 'dist');
const template = await readFile(join(dist, 'index.html'), 'utf8');
const { renderPage } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);

const escapeAttr = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const locales = ['en', 'tr'];
const prefix = (locale) => (locale === 'en' ? '' : `/${locale}`);
/** Keep in step with src/pages.ts. The case study is a light page; the portfolio stays dark. */
const pages = {
  home: { path: (l) => `${prefix(l)}/`, og: '/og.png', scheme: 'dark', theme: '#0D0F12', type: 'website' },
  grocery: {
    path: (l) => `${prefix(l)}/projects/grocery/`,
    og: '/og-grocery.png',
    scheme: 'light',
    theme: '#F4F0E7',
    type: 'article',
  },
};

// Preload the Latin and Latin Extended (Turkish letters) Geist files so the text does not
// reflow when the font arrives; the reflow pushed the header figures down (layout shift).
const fontPreloads = (await readdir(join(dist, 'assets')))
  .filter((file) => /^geist-latin(-ext)?-wght-normal-.*\.woff2$/.test(file))
  .map((file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`);

function replaceOnce(html, search, replacement) {
  const matched = typeof search === 'string' ? html.includes(search) : search.test(html);
  if (!matched) throw new Error(`Template is missing ${search}`);
  return html.replace(search, () => replacement);
}

for (const [pageId, page] of Object.entries(pages)) {
  for (const locale of locales) {
    const path = page.path(locale);
    const { html, title, description } = renderPage(locale, pageId);
    const head = [
      ...fontPreloads,
      `<link rel="canonical" href="${SITE}${path}" />`,
      ...locales.map((code) => `<link rel="alternate" hreflang="${code}" href="${SITE}${page.path(code)}" />`),
      `<link rel="alternate" hreflang="x-default" href="${SITE}${page.path('en')}" />`,
      `<meta property="og:type" content="${page.type}" />`,
      `<meta property="og:url" content="${SITE}${path}" />`,
      `<meta property="og:title" content="${escapeAttr(title)}" />`,
      `<meta property="og:description" content="${escapeAttr(description)}" />`,
      `<meta property="og:image" content="${SITE}${page.og}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'tr_TR'}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
      `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    ].join('\n    ');

    let out = template;
    out = replaceOnce(out, '<html lang="en">', `<html lang="${locale}" data-page="${pageId}">`);
    out = replaceOnce(out, '<meta name="color-scheme" content="dark" />', `<meta name="color-scheme" content="${page.scheme}" />`);
    out = replaceOnce(out, '<meta name="theme-color" content="#0D0F12" />', `<meta name="theme-color" content="${page.theme}" />`);
    out = replaceOnce(out, /<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
    out = replaceOnce(
      out,
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeAttr(description)}" />`,
    );
    out = replaceOnce(out, '<!--head-->', head);
    out = replaceOnce(out, '<!--app-->', html);

    const dir = join(dist, path);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), out);
    console.log(`prerendered ${pageId} ${locale} → ${join('dist', path, 'index.html')}`);
  }
}

await rm(join(root, 'dist-ssr'), { recursive: true, force: true });
