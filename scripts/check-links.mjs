// Usage: npm run build && node scripts/check-links.mjs
// Requests every external https link in the built pages and fails on any that does not load.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const pages = ['dist/index.html', 'dist/tr/index.html'];
// Canonical and alternate links point at the live site, which this check does not need to reach.
const skip = (href) => /^https:\/\/ege-ozel\.github\.io\/(tr\/)?$/.test(href) || href.endsWith('/og.png');

const hrefs = new Set();
for (const page of pages) {
  const html = await readFile(join(root, page), 'utf8');
  for (const [, href] of html.matchAll(/href="(https:\/\/[^"]+)"/g)) if (!skip(href)) hrefs.add(href.replaceAll('&amp;', '&'));
}

const results = await Promise.all(
  [...hrefs].map(async (href) => {
    try {
      const res = await fetch(href, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 link-check' } });
      // LinkedIn answers every scripted request with 999; the profile opens in a browser.
      const linkedInBlock = res.status === 999 && new URL(href).hostname.endsWith('linkedin.com');
      return { href, status: linkedInBlock ? '999 (LinkedIn blocks scripts)' : res.status, ok: res.ok || linkedInBlock };
    } catch (error) {
      return { href, status: String(error.cause?.code ?? error.name), ok: false };
    }
  }),
);

for (const { href, status, ok } of results.sort((a, b) => a.href.localeCompare(b.href))) console.log(`${ok ? 'ok  ' : 'FAIL'} ${status} ${href}`);
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} links load`);
if (failed.length) process.exit(1);
