import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
const dist = 'D:/CodeSpace/ege-ozel.github.io/dist', out = process.env.TEMP + '/herov11';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  try { const b = await readFile(join(dist, p)); const range = req.headers.range;
    if (range) { const [s, e] = range.replace('bytes=', '').split('-'); const start = +s, end = e ? +e : b.length - 1;
      res.writeHead(206, { 'Content-Type': types[extname(p)], 'Content-Range': `bytes ${start}-${end}/${b.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 }); res.end(b.subarray(start, end + 1)); }
    else { res.writeHead(200, { 'Content-Type': types[extname(p)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes' }); res.end(b); } } catch { res.writeHead(404); res.end(); } });
await new Promise((d) => server.listen(0, '127.0.0.1', d));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [name, viewport] of [['16x9', { width: 1440, height: 900 }], ['9x16', { width: 390, height: 844 }]]) {
  const page = await (await browser.newContext({ viewport })).newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => new Promise((r) => { const v = document.querySelector('.hero__video'); if (!v.paused && v.currentTime > 0) r(); else v.addEventListener('playing', r, { once: true }); }));
  await page.evaluate(() => { const v = document.querySelector('.hero__video'); v.currentTime = 0; });
  const t0 = Date.now(); const log = [];
  for (const at of [5, 7.75, 10.75, 13.75, 17.25, 38]) {
    await page.waitForTimeout(Math.max(0, at * 1000 - (Date.now() - t0)));
    const s = await page.evaluate(() => { const v = document.querySelector('.hero__video'); return { t: v.currentTime, src: v.currentSrc.split('/').pop(), q: v.getVideoPlaybackQuality().droppedVideoFrames }; });
    log.push({ wall: at, ...s });
    await page.locator('.hero__frame').screenshot({ path: `${out}/real-${name}-${at}.png` });
  }
  console.log(name, JSON.stringify(log));
}
await browser.close(); server.close();
