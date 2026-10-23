// Usage: npm run media -- <source-dir>
// Turns source images into public/media/<id>-<width>.{avif,webp}; see media-sizes.mjs
// for the file-name suffixes and sizes. Source images stay outside this repo.
import { mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { posterPlan } from './media-sizes.mjs';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const source = process.argv[2];
if (!source) {
  console.error('Pass the folder that holds the source screenshots.');
  process.exit(1);
}
const out = join(root, 'public/media');
await mkdir(out, { recursive: true });

for (const file of await readdir(source)) {
  const plan = posterPlan(file);
  if (!plan) continue;
  const { id, widths, ratio } = plan;
  for (const width of widths) {
    const height = Math.round(width * ratio);
    const image = sharp(join(source, file)).resize(width, height, { fit: 'cover', position: 'top' });
    await image.clone().avif({ quality: 55 }).toFile(join(out, `${id}-${width}.avif`));
    await image.clone().webp({ quality: 78 }).toFile(join(out, `${id}-${width}.webp`));
  }
  console.log(`${id}: ${widths.join(', ')}`);
}
