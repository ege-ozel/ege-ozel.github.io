// Usage: npm run case-media
// Cuts the Grocery case-study stills from the real screen recording (public/media/grocery.mp4,
// sample household data) and writes public/media/grocery-case/<name>-390.{avif,webp}.
// The recording is 390×844, so the stills stay at their native width rather than being upscaled.
import { execFile } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const run = promisify(execFile);
const root = resolve(fileURLToPath(import.meta.url), '../..');
const source = join(root, 'public/media/grocery.mp4');
const out = join(root, 'public/media/grocery-case');
const tmp = join(root, 'tmp/case-frames');

/** Seconds into the recording, as read by the bundled ffmpeg-static (other ffmpeg builds can differ by about a second). */
export const stills = {
  list: 0.2,
  autocomplete: 1.4,
  plan: 5.2,
  suggestions: 6.6,
  picker: 9.4,
  undo: 12.6,
};

await mkdir(out, { recursive: true });
await mkdir(tmp, { recursive: true });
for (const [name, at] of Object.entries(stills)) {
  const png = join(tmp, `${name}.png`);
  // -ss after -i decodes up to the exact time; before -i, ffmpeg builds disagree on the frame.
  await run(ffmpeg, ['-v', 'error', '-y', '-i', source, '-ss', String(at), '-frames:v', '1', png]);
  await sharp(png).avif({ quality: 62, effort: 6 }).toFile(join(out, `${name}-390.avif`));
  await sharp(png).webp({ quality: 82 }).toFile(join(out, `${name}-390.webp`));
  console.log(`public/media/grocery-case/${name}-390.{avif,webp}`);
}
await rm(tmp, { recursive: true, force: true });
