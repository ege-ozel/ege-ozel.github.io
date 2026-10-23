// Usage:
//   npm run video -- <id> <input> --start <s> --duration <s> [--width 1280] [--mobile] [--hero] [--poster-at <s>]
//   npm run video -- gif <input> <output.gif> [--width 640] [--fps 12]
// Writes public/media/<id>.mp4 and a poster frame for build-media.mjs into POSTER_DIR
// (default: ../job-hunt/portfolio/media-src/posters). Fails when the clip is too heavy.
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import ffmpeg from 'ffmpeg-static';
import { clipArgs, gifArgs, posterArgs } from './video.mjs';

const MB = 1024 * 1024;
const root = resolve(fileURLToPath(import.meta.url), '../..');
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    start: { type: 'string', default: '0' },
    duration: { type: 'string' },
    width: { type: 'string' },
    fps: { type: 'string', default: '12' },
    mobile: { type: 'boolean', default: false },
    hero: { type: 'boolean', default: false },
    'poster-at': { type: 'string', default: '0.5' },
  },
});

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

if (positionals[0] === 'gif') {
  const [, input, output] = positionals;
  run(gifArgs({ input, output, width: Number(values.width ?? 640), fps: Number(values.fps) }));
  const size = statSync(output).size;
  console.log(`${output}: ${(size / MB).toFixed(2)} MB`);
  if (size > 5 * MB) {
    console.error('GIF is over 5 MB. Shorten the clip or lower --width/--fps.');
    process.exit(1);
  }
  process.exit(0);
}

const [id, input] = positionals;
if (!id || !input || !values.duration) {
  console.error('Pass <id> <input> --duration <seconds>.');
  process.exit(1);
}
const width = Number(values.width ?? (values.mobile ? 720 : 1280));
const output = join(root, 'public/media', `${id}.mp4`);
run(clipArgs({ input, output, start: Number(values.start), duration: Number(values.duration), width }));

const posterDir = process.env.POSTER_DIR ?? resolve(root, '../job-hunt/portfolio/media-src/posters');
mkdirSync(posterDir, { recursive: true });
const poster = join(posterDir, `${id}${values.mobile ? '.mobile' : ''}.png`);
run(posterArgs({ input: output, output: poster, at: Number(values['poster-at']) }));

const limit = values.hero ? (values.mobile ? 2 : 3.5) * MB : 1 * MB;
const size = statSync(output).size;
console.log(`${id}.mp4: ${(size / MB).toFixed(2)} MB (limit ${(limit / MB).toFixed(1)} MB), poster → ${poster}`);
if (size >= limit) {
  console.error(`${id}.mp4 is over the limit. Shorten it, lower --width, or raise the CRF.`);
  process.exit(1);
}
