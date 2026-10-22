// Usage: npm run og
// Writes public/og.png (1200×630), the link preview for LinkedIn and other sites:
// the hero film frame with the name and role on a dark band at the left.
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const W = 1200;
const H = 630;

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0d0f12" stop-opacity="0.96"/>
      <stop offset="0.45" stop-color="#0d0f12" stop-opacity="0.85"/>
      <stop offset="0.75" stop-color="#0d0f12" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#0d0f12" stop-opacity="0"/>
      <stop offset="0.45" stop-color="#0d0f12" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect y="${H - 200}" width="${W}" height="200" fill="url(#floor)"/>
  <g font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="#f2f2f5">
    <text x="72" y="270" font-size="76" font-weight="700" letter-spacing="-2">Ege Özel</text>
    <text x="72" y="330" font-size="34" font-weight="500" fill="#69d8cc">Software Developer</text>
    <text x="72" y="378" font-size="28" fill="#c9ccd4">React · TypeScript · shipped products</text>
    <text x="72" y="548" font-size="22" fill="#9a9eaa">ege-ozel.github.io</text>
  </g>
</svg>`);

await sharp(join(root, 'public/media/hero-1600.webp'))
  .resize(W, H, { fit: 'cover', position: 'right' })
  .composite([{ input: overlay }])
  .png({ compressionLevel: 9, palette: true, quality: 85 })
  .toFile(join(root, 'public/og.png'));
console.log('public/og.png');
