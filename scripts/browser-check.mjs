// Usage: npm run build && npm run check
// Serves dist/ locally and checks the built pages in Chrome through Playwright.
// PLAYWRIGHT_MODULE: path to a playwright package (default: "playwright").
// CHROME_PATH: Chrome executable (default: the installed Google Chrome on Windows).
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = join(root, 'dist');
const shots = join(root, 'tmp/qa');
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;

await mkdir(shots, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

async function open(path, viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

const viewports = { phone: { width: 375, height: 812 }, tablet: { width: 768, height: 1024 }, desktop: { width: 1440, height: 900 } };
const pages = { en: '/', tr: '/tr/' };
const cardClipRequests = (page) =>
  page.evaluate(() =>
    performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.mp4') && !r.name.includes('/hero-')).length,
  );

for (const [locale, path] of Object.entries(pages)) {
  for (const [name, viewport] of Object.entries(viewports)) {
    const where = `${locale} ${name}`;
    const { context, page, errors } = await open(path, viewport);
    if ((await page.getAttribute('html', 'lang')) !== locale) fail(where, 'wrong html lang');
    if ((await page.textContent('h1'))?.trim() !== 'Ege Özel') fail(where, 'h1 is not "Ege Özel"');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(where, `horizontal overflow ${overflow}px`);
    const poster = await page.evaluate(() => {
      const img = document.querySelector('.hero__poster');
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
    });
    if (!poster) fail(where, 'hero poster did not load');
    const cvBottom = await page.evaluate(() => document.querySelector('.quick .btn--primary').getBoundingClientRect().bottom);
    if (cvBottom > viewport.height) fail(where, `CV button below the fold (${Math.round(cvBottom)}px)`);
    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll('a.btn, .lang a, .notes summary, .watch:not([hidden]), .hero__toggle:not([hidden])')]
        .filter((el) => el.getBoundingClientRect().height < 40)
        .map((el) => el.textContent.trim()),
    );
    if (smallTargets.length) fail(where, `touch targets under 40px: ${smallTargets.join(', ')}`);
    await page.screenshot({ path: join(shots, `${locale}-${name}-fold.png`) });
    const hidden = [];
    for (const card of await page.locator('.card').all()) {
      await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(150);
      const opacity = await card.evaluate((el) => Number(getComputedStyle(el).opacity));
      if (opacity < 0.99) hidden.push(await card.locator('h3').textContent());
    }
    if (hidden.length) fail(where, `cards not revealed in view: ${hidden.join(', ')}`);
    await page.addStyleTag({ content: '.card { animation: none !important; }' });
    await page.screenshot({ path: join(shots, `${locale}-${name}.png`), fullPage: true });
    if (errors.length) fail(where, `console errors: ${errors.join(' | ')}`);
    await context.close();
  }
}

// Desktop: skip link, JS weight, no card clip before intent, hero loop, lightbox focus, hover, language switch
{
  const where = 'en desktop';
  const { context, page, errors } = await open('/', viewports.desktop);
  await page.keyboard.press('Tab');
  if ((await page.evaluate(() => document.activeElement?.className)) !== 'skip') fail(where, 'first Tab is not the skip link');
  await page.keyboard.press('Enter');
  if ((await page.evaluate(() => document.activeElement?.id)) !== 'work') fail(where, 'skip link does not focus #work');
  await page.evaluate(() => window.scrollTo(0, 0));

  const js = await page.evaluate(() =>
    performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).reduce((sum, r) => sum + r.encodedBodySize, 0),
  );
  if (js > 320_000) fail(where, `${js} bytes of JS loaded`);
  if (await cardClipRequests(page)) fail(where, 'a card clip was requested before any interaction');
  await page.waitForTimeout(1500);
  if (!(await page.evaluate(() => !document.querySelector('.hero__video').paused))) fail(where, 'hero film is not playing');

  const watch = page.locator('.watch--hero');
  await watch.focus();
  await watch.press('Enter');
  await page.waitForTimeout(500);
  if (!(await page.evaluate(() => document.querySelector('dialog.lightbox').open))) fail(where, 'lightbox did not open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  if (await page.evaluate(() => document.querySelector('dialog.lightbox').open)) fail(where, 'Escape did not close the lightbox');
  if (!(await page.evaluate(() => document.activeElement?.classList.contains('watch--hero')))) {
    fail(where, 'focus did not return to the hero watch button');
  }

  // Normal speed: the film advances with the clock and does not stall.
  const heroTime = () => page.evaluate(() => document.querySelector('.hero__video').currentTime);
  const paused = () => page.evaluate(() => document.querySelector('.hero__video').paused);
  const t0 = await heroTime();
  await page.waitForTimeout(3000);
  const advanced = (await heroTime()) - t0;
  if (advanced < 2.5 || advanced > 3.5) fail(where, `hero advanced ${advanced.toFixed(2)} s in 3 s`);

  // While the lightbox shows the film, the background copy waits.
  await watch.click();
  await page.waitForTimeout(400);
  if (!(await paused())) fail(where, 'hero keeps playing behind the lightbox');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  if (await paused()) fail(where, 'hero did not resume after the lightbox closed');

  // Pause and resume from the keyboard (WCAG 2.2.2).
  const toggle = page.locator('.hero__toggle');
  if (!(await toggle.isVisible())) fail(where, 'hero pause button missing');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  if (!(await paused())) fail(where, 'pause button did not pause the hero');
  if ((await toggle.getAttribute('aria-pressed')) !== 'false') fail(where, 'pause button aria-pressed not false when paused');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  if (await paused()) fail(where, 'play button did not resume the hero');

  // Turning on reduced motion while the page is open stops the film and hides the toggle.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  if (!(await paused())) fail(where, 'hero keeps playing after reduced motion was turned on');
  if (await toggle.isVisible()) fail(where, 'pause button still shown under reduced motion');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(800);
  if (await paused()) fail(where, 'hero did not restart after reduced motion was turned off');

  const card = page.locator('.card').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(700);
  const lift = await card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  if (Math.round(lift) !== -4) fail(where, `hover lift ${lift}, expected -4`);
  if (!(await card.evaluate((el) => !el.querySelector('.media__video')?.paused))) fail(where, 'hover did not start the card clip');

  await page.locator('.notes summary').first().click();
  if (!(await page.locator('.notes').first().evaluate((el) => el.open))) fail(where, 'technical notes did not open');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.lang a[hreflang="tr"]');
  await page.waitForLoadState('networkidle');
  if (new URL(page.url()).pathname !== '/tr/') fail(where, `language link went to ${page.url()}`);
  if ((await page.getAttribute('html', 'lang')) !== 'tr') fail(where, 'Turkish page lang is not tr');
  if (errors.length) fail(where, `console errors: ${errors.join(' | ')}`);
  await context.close();
}

// Touch phone: a card clip plays when it scrolls into view, and only one at a time
{
  const where = 'en touch phone';
  const { context, page, errors } = await open('/', viewports.phone, { hasTouch: true, isMobile: true });
  const cards = await page.locator('.card:has(.media__video)').all();
  for (const card of cards) {
    await card.locator('.media__video').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1200);
    const playing = await page.evaluate(() => [...document.querySelectorAll('.media__video')].filter((v) => !v.paused).length);
    const own = await card.evaluate((el) => !el.querySelector('.media__video').paused);
    if (!own) fail(where, `${await card.locator('h3').textContent()} clip did not play in view`);
    if (playing !== 1) fail(where, `${playing} card clips playing at once`);
  }
  if (errors.length) fail(where, `console errors: ${errors.join(' | ')}`);
  await context.close();
}

// JavaScript off: the prerendered page is complete and shows no dead buttons
{
  const { context, page } = await open('/', viewports.phone, { javaScriptEnabled: false });
  const ok = await page.evaluate(
    () =>
      document.querySelectorAll('.card').length === 5 &&
      document.querySelector('h1')?.textContent === 'Ege Özel' &&
      [...document.querySelectorAll('.watch')].every((b) => b.hidden),
  );
  if (!ok) fail('en no-JS', 'content missing or a watch button visible without JavaScript');
  await context.close();
}

// Phone rotation: the hero swaps between the 9:16 and 16:9 films and keeps playing
{
  const where = 'en phone rotation';
  const { context, page } = await open('/', viewports.phone, { hasTouch: true, isMobile: true });
  await page.waitForTimeout(1200);
  const film = () => page.evaluate(() => document.querySelector('.hero__video').getAttribute('src'));
  if (!(await film())?.includes('9x16')) fail(where, `portrait loads ${await film()}`);
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(1200);
  if (!(await film())?.includes('16x9')) fail(where, `landscape still shows ${await film()}`);
  if (await page.evaluate(() => document.querySelector('.hero__video').paused)) fail(where, 'film stopped after rotating');
  await page.setViewportSize(viewports.phone);
  await page.waitForTimeout(800);
  if (!(await film())?.includes('9x16')) fail(where, `back to portrait shows ${await film()}`);
  await context.close();
}

// Reduced motion: no lift, no animations, no autoplay
{
  const where = 'en reduced motion';
  const { context, page } = await open('/', viewports.desktop, { reducedMotion: 'reduce' });
  await page.waitForTimeout(1200);
  if (await page.evaluate(() => !document.querySelector('.hero__video').paused)) fail(where, 'hero film autoplays');
  if (await page.locator('.hero__toggle').isVisible()) fail(where, 'pause button shown without motion');
  const card = page.locator('.card').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(450);
  const lift = await card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  if (lift !== 0) fail(where, `card still lifts (${lift})`);
  if (await cardClipRequests(page)) fail(where, 'a card clip loaded without a click');
  const animated = await page.evaluate(
    () => [...document.querySelectorAll('.enter, .card')].filter((el) => getComputedStyle(el).animationName !== 'none').length,
  );
  if (animated) fail(where, `${animated} elements still animate`);
  await context.close();
}

await browser.close();
server.close();
console.log(JSON.stringify({ screenshots: shots, failures }, null, 2));
if (failures.length) process.exit(1);
