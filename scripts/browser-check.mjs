// Usage: npm run build && npm run check
// Serves dist/ locally and checks the built pages in Chrome through Playwright.
// PLAYWRIGHT_MODULE: path to a playwright package (default: "playwright").
// CHROME_PATH: Chrome executable (default: the installed Google Chrome on Windows).
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
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
  // The site follows the system theme; the main checks run dark, the theme block below runs light.
  const context = await browser.newContext({ viewport, colorScheme: 'dark', ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

// Typography: every rendered size, weight and family comes from a token in tokens.css,
// prose stays readable, and no text spills out of its box.
const tokenNames = (prefix) => [...readFileSync(join(root, 'src/styles/tokens.css'), 'utf8').matchAll(new RegExp(`(--${prefix}-[\\w-]+):`, 'g'))].map((m) => m[1]);
const typeTokens = { sizes: [...new Set(tokenNames('fs'))], weights: [...new Set(tokenNames('fw'))] };
// Selectors allowed outside the type tokens (none today).
const typeExceptions = [];
// Notes and captions may stay at the small size; every other running paragraph is 16px or more.
const noteRoles = ['.cs-note', '.cs-small'];

async function checkType(page, where) {
  const issues = await page.evaluate(
    ({ sizes, weights, exceptions, notes }) => {
      const out = [];
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;display:inline-block;';
      document.body.append(probe);
      const resolve = (prop, name) => {
        probe.style[prop] = `var(${name})`;
        return getComputedStyle(probe)[prop];
      };
      const allowedSizes = sizes.map((n) => parseFloat(resolve('fontSize', n)));
      const allowedWeights = weights.map((n) => resolve('fontWeight', n));
      const families = ['--font', '--mono'].map((n) => resolve('fontFamily', n));
      const label = (el) => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''} "${el.textContent.trim().slice(0, 30)}"`;

      const textEls = [...document.body.querySelectorAll('*')].filter(
        (el) =>
          !el.closest('svg, script, style, noscript, [hidden], [aria-hidden="true"]') &&
          !exceptions.some((s) => el.matches(s)) &&
          !el.closest('.sr-only') &&
          el.checkVisibility({ visibilityProperty: true }) &&
          [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
      );
      for (const el of textEls) {
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        if (!allowedSizes.some((s) => Math.abs(s - size) < 0.5)) out.push(`size ${size}px is not a token: ${label(el)}`);
        if (!allowedWeights.includes(cs.fontWeight)) out.push(`weight ${cs.fontWeight} is not a token: ${label(el)}`);
        if (!families.includes(cs.fontFamily)) out.push(`font family outside the tokens: ${label(el)}`);
        const tracking = parseFloat(cs.letterSpacing) / size;
        if (tracking < -0.0405) out.push(`tracking ${tracking.toFixed(3)}em is tighter than -0.04em: ${label(el)}`);
        const block = !cs.display.startsWith('inline') && cs.display !== 'contents';
        const onlyText = [...el.children].every((c) => getComputedStyle(c).display.startsWith('inline'));
        if (block && onlyText && cs.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
          out.push(`text overflows its box by ${el.scrollWidth - el.clientWidth}px: ${label(el)}`);
        }
      }

      // Prose: running paragraphs of two or more lines
      for (const p of document.querySelectorAll('p')) {
        if (!p.checkVisibility() || p.textContent.trim().length < 120) continue;
        const cs = getComputedStyle(p);
        const lines = p.getBoundingClientRect().height / parseFloat(cs.lineHeight);
        if (lines < 2) continue;
        // Characters on a full line: the box width over the average width of this paragraph's own characters.
        const text = p.textContent.trim();
        probe.style.font = cs.font;
        probe.style.letterSpacing = cs.letterSpacing;
        probe.style.whiteSpace = 'nowrap';
        probe.textContent = text;
        const measure = Math.round(p.clientWidth / (probe.getBoundingClientRect().width / text.length));
        probe.textContent = '';
        if (measure > 75) out.push(`about ${measure} characters per line, over 75: ${label(p)}`);
        if (parseFloat(cs.fontSize) < 15.5 && !notes.some((s) => p.matches(s))) out.push(`running text at ${cs.fontSize}: ${label(p)}`);
      }
      for (const h of document.querySelectorAll('h1, h2, h3')) {
        const wrap = getComputedStyle(h).textWrapStyle ?? getComputedStyle(h).textWrap;
        if (h.checkVisibility() && !String(wrap).includes('balance')) out.push(`heading without text-wrap: balance: ${label(h)}`);
      }
      probe.remove();
      return [...new Set(out)];
    },
    { ...typeTokens, exceptions: typeExceptions, notes: noteRoles },
  );
  for (const issue of issues) fail(where, `type: ${issue}`);
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
    const screens = await page.evaluate(() =>
      [...document.querySelectorAll('.hero .shot')].filter((img) => img.complete && img.naturalWidth > 0).length,
    );
    if (screens !== 3) fail(where, `${screens} of 3 hero screens loaded`);
    const cvBottom = await page.evaluate(() => document.querySelector('.quick .btn--primary').getBoundingClientRect().bottom);
    if (cvBottom > viewport.height) fail(where, `CV button below the fold (${Math.round(cvBottom)}px)`);
    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll('a.btn, .lang a, .notes summary, .watch:not([hidden])')]
        .filter((el) => el.getBoundingClientRect().height < 40)
        .map((el) => el.textContent.trim()),
    );
    if (smallTargets.length) fail(where, `touch targets under 40px: ${smallTargets.join(', ')}`);
    await checkType(page, where);
    await page.screenshot({ path: join(shots, `${locale}-${name}-fold.png`) });
    const hidden = [];
    for (const card of await page.locator('.card').all()) {
      await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
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
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  const js = await page.evaluate(() =>
    performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).reduce((sum, r) => sum + r.encodedBodySize, 0),
  );
  if (js > 320_000) fail(where, `${js} bytes of JS loaded`);
  if (await cardClipRequests(page)) fail(where, 'a card clip was requested before any interaction');
  // The featured hero links the case study in the page language.
  const caseHref = await page.locator('.hero .btn--primary').getAttribute('href');
  if (caseHref !== '/projects/grocery/') fail(where, `hero case-study link is ${caseHref}`);

  // The Grocery card's clip opens in the lightbox; Escape closes it and focus returns.
  const watch = page.locator('.card .watch').first();
  await watch.scrollIntoViewIfNeeded();
  await watch.focus();
  await watch.press('Enter');
  await page.waitForTimeout(500);
  if (!(await page.evaluate(() => document.querySelector('dialog.lightbox').open))) fail(where, 'lightbox did not open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  if (await page.evaluate(() => document.querySelector('dialog.lightbox').open)) fail(where, 'Escape did not close the lightbox');
  if (!(await page.evaluate(() => document.activeElement?.classList.contains('watch')))) {
    fail(where, 'focus did not return to the watch button');
  }

  const card = page.locator('.card').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(700);
  const lift = await card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  if (Math.round(lift) !== 0) fail(where, `card moves on hover (${lift}px); hover should only firm the border and play the clip`);
  if (!(await card.evaluate((el) => !el.querySelector('.media__video')?.paused))) fail(where, 'hover did not start the card clip');

  await page.locator('.notes summary').first().click();
  if (!(await page.locator('.notes').first().evaluate((el) => el.open))) fail(where, 'technical notes did not open');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.click('.lang a[hreflang="tr"]');
  // The switch swaps the language in place (no page load): wait for the new language.
  await page.waitForFunction(() => document.documentElement.lang === 'tr', null, { timeout: 5000 }).catch(() => {});
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
    await card.locator('.media__video').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
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
      document.querySelectorAll('.card').length === 6 &&
      document.querySelector('h1')?.textContent === 'Ege Özel' &&
      [...document.querySelectorAll('.watch')].every((b) => b.hidden),
  );
  if (!ok) fail('en no-JS', 'content missing or a watch button visible without JavaScript');
  await context.close();
}

// Reduced motion: no lift, no animations, no autoplay
{
  const where = 'en reduced motion';
  const { context, page } = await open('/', viewports.desktop, { reducedMotion: 'reduce' });
  await page.waitForTimeout(1200);
  if (await page.evaluate(() => [...document.querySelectorAll('video')].some((v) => !v.paused))) fail(where, 'a video autoplays');
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

// Grocery case study: static page, both languages, every width
const casePages = { en: '/projects/grocery/', tr: '/tr/projects/grocery/' };
for (const [locale, path] of Object.entries(casePages)) {
  for (const [name, viewport] of Object.entries(viewports)) {
    const where = `case ${locale} ${name}`;
    const { context, page, errors } = await open(path, viewport);
    if ((await page.getAttribute('html', 'lang')) !== locale) fail(where, 'wrong html lang');
    if ((await page.locator('h1').count()) !== 1) fail(where, 'not exactly one h1');
    if ((await page.textContent('h1'))?.trim() !== 'Grocery') fail(where, 'h1 is not the Grocery title');
    const headlineLines = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2')].map((h) => ({
        text: h.textContent.trim(),
        lines: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)),
      })),
    );
    for (const h of headlineLines) if (h.lines > 2) fail(where, `"${h.text}" wraps to ${h.lines} lines`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(where, `horizontal overflow ${overflow}px`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    if (bg !== 'rgb(13, 15, 18)') fail(where, `page background is ${bg}`);
    const js = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).length);
    if (js > 1) fail(where, `${js} script files loaded on a static page`);
    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll('.cs a.btn, .cs .lang a, .cs-toc a, .cs-top__home, .cs-footer a')]
        .filter((el) => el.getBoundingClientRect().height < 40)
        .map((el) => el.textContent.trim()),
    );
    if (smallTargets.length) fail(where, `touch targets under 40px: ${smallTargets.join(', ')}`);
    await checkType(page, where);
    await page.screenshot({ path: join(shots, `case-${locale}-${name}-fold.png`) });
    // Scroll through so the lazy screens load, then check every one did.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(600);
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter((img) => !(img.complete && img.naturalWidth > 0)).map((img) => img.alt),
    );
    if (broken.length) fail(where, `images not loaded: ${broken.join(' | ')}`);
    if (await page.evaluate(() => performance.getEntriesByType('resource').some((r) => r.name.endsWith('.mp4')))) {
      fail(where, 'the recording loaded before play');
    }
    await page.screenshot({ path: join(shots, `case-${locale}-${name}.png`), fullPage: true });
    if (errors.length) fail(where, `console errors: ${errors.join(' | ')}`);
    await context.close();
  }
}

// Case study on desktop: skip link, table of contents, recording, language and back links
{
  const where = 'case en desktop';
  const { context, page, errors } = await open('/projects/grocery/', viewports.desktop);
  await page.keyboard.press('Tab');
  if ((await page.evaluate(() => document.activeElement?.className)) !== 'skip') fail(where, 'first Tab is not the skip link');
  await page.keyboard.press('Enter');
  if ((await page.evaluate(() => document.activeElement?.id)) !== 'case') fail(where, 'skip link does not focus #case');
  await page.click('.cs-toc a[href="#nutrition"]');
  // The page glides there (scroll-behavior: smooth); wait for it to arrive.
  await page.waitForFunction(() => Math.abs(document.getElementById('nutrition').getBoundingClientRect().top) < 40, null, { timeout: 3000 }).catch(() => {});
  const top = await page.evaluate(() => document.getElementById('nutrition').getBoundingClientRect().top);
  if (Math.abs(top) > 40) fail(where, `table of contents left #nutrition at ${Math.round(top)}px`);
  const video = page.locator('.cs-video video');
  await video.scrollIntoViewIfNeeded();
  await video.evaluate((el) => el.play());
  await page.waitForTimeout(1500);
  if ((await video.evaluate((el) => el.currentTime)) < 0.5) fail(where, 'the recording does not play');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.click('.cs-top .lang a[hreflang="tr"]');
  // The switch swaps the language in place (no page load): wait for the new language.
  await page.waitForFunction(() => document.documentElement.lang === 'tr', null, { timeout: 5000 }).catch(() => {});
  if (new URL(page.url()).pathname !== '/tr/projects/grocery/') fail(where, `language link went to ${page.url()}`);
  await page.click('.cs-top__home');
  await page.waitForLoadState('networkidle');
  if (new URL(page.url()).pathname !== '/tr/') fail(where, `back link went to ${page.url()}`);
  if (errors.length) fail(where, `console errors: ${errors.join(' | ')}`);
  await context.close();
}

// Case study without JavaScript is the same page
{
  const { context, page } = await open('/projects/grocery/', viewports.phone, { javaScriptEnabled: false });
  const sections = await page.locator('.cs-section').count();
  if (sections !== 8) fail('case no-JS', `${sections} sections instead of 8`);
  await context.close();
}

// Theme: the system setting by default, a saved choice overrides it, both pages share it
for (const [where, path] of [['theme home', '/'], ['theme case', '/projects/grocery/']]) {
  for (const [name, viewport] of [['phone', viewports.phone], ['desktop', viewports.desktop]]) {
    const at = `${where} ${name}`;
    const { context, page, errors } = await open(path, viewport, { colorScheme: 'light' });
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const pressed = () => page.evaluate(() => document.querySelector('[data-theme-choice][aria-pressed="true"]')?.dataset.themeChoice);
    if ((await bg()) !== 'rgb(246, 247, 249)') fail(at, `light system theme shows ${await bg()}`);
    if ((await pressed()) !== 'system') fail(at, `switch shows ${await pressed()} instead of system`);
    await page.screenshot({ path: join(shots, `light-${where.split(' ')[1]}-${name}-fold.png`) });
    await page.click('[data-theme-choice="dark"]');
    await page.waitForTimeout(400);
    if ((await bg()) !== 'rgb(13, 15, 18)') fail(at, `dark choice shows ${await bg()}`);
    await page.reload({ waitUntil: 'networkidle' });
    if ((await bg()) !== 'rgb(13, 15, 18)' || (await pressed()) !== 'dark') fail(at, 'the dark choice is not kept after a reload');
    await page.click('[data-theme-choice="system"]');
    await page.waitForTimeout(400);
    if ((await bg()) !== 'rgb(246, 247, 249)') fail(at, 'system choice does not return to light');
    if (errors.length) fail(at, `console errors: ${errors.join(' | ')}`);
    await context.close();
  }
}

await browser.close();
server.close();
console.log(JSON.stringify({ screenshots: shots, failures }, null, 2));
if (failures.length) process.exit(1);
