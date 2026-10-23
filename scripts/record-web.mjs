// Usage: node scripts/record-web.mjs <scenario | path/to/scenario.mjs> [--mobile]
// A scenario may export setup(context) to run before the page opens (for example to answer API calls).
// Records a scenario from scripts/scenarios/<scenario>.mjs with Playwright and writes the raw
// video to RAW_DIR (default: ../job-hunt/portfolio/media-src/raw/<id>[.mobile].webm).
// CHROME_PATH picks the browser (default: the installed Google Chrome on Windows).
import { mkdirSync, renameSync } from 'node:fs';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const { values, positionals } = parseArgs({ allowPositionals: true, options: { mobile: { type: 'boolean', default: false } } });
const [arg] = positionals;
if (!arg) {
  console.error('Pass a scenario name from scripts/scenarios/.');
  process.exit(1);
}
const external = arg.endsWith('.mjs');
const scenarioPath = external ? (isAbsolute(arg) ? arg : resolve(arg)) : join(root, 'scripts/scenarios', `${arg}.mjs`);
const name = external ? basename(arg, '.mjs') : arg;
const scenario = await import(pathToFileURL(scenarioPath).href);
const viewport = values.mobile ? { width: 390, height: 844 } : (scenario.viewport ?? { width: 1280, height: 800 });
const rawDir = process.env.RAW_DIR ?? resolve(root, '../job-hunt/portfolio/media-src/raw');
const tmpDir = join(rawDir, '_tmp');
mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 1,
  isMobile: values.mobile,
  hasTouch: values.mobile,
  colorScheme: 'dark',
  recordVideo: { dir: tmpDir, size: viewport },
});
await scenario.setup?.(context);
const page = await context.newPage();
try {
  await page.goto(scenario.url, { waitUntil: 'networkidle' });
  await scenario.default(page, { mobile: values.mobile });
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  const out = join(rawDir, `${name}${values.mobile ? '.mobile' : ''}.webm`);
  renameSync(await video.path(), out);
  console.log(`raw video → ${out}`);
}
