// Usage: npm run og   (after npm run case-media)
// Writes the 1200×630 link previews for LinkedIn and other sites, both built from real Grocery
// screens (public/media/grocery-case/*-390.webp):
//   public/og.png         the portfolio: name and role on the dark site background
//   public/og-grocery.png the Grocery case study: title on warm paper
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const W = 1200;
const H = 630;
const shot = (name) => join(root, `public/media/grocery-case/${name}-390.webp`);

/** A screen in a rounded phone frame, `height` px tall. */
async function phone(name, height, frame) {
  const width = Math.round((height * 390) / 844);
  const radius = 26;
  const border = 6;
  const inner = await sharp(shot(name))
    .resize(width - border * 2, height - border * 2)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width - border * 2}" height="${height - border * 2}"><rect width="100%" height="100%" rx="${radius - border}" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
  const shell = Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" rx="${radius}" fill="${frame}"/></svg>`);
  return { input: await sharp(shell).composite([{ input: inner, left: border, top: border }]).png().toBuffer(), width };
}

async function render({ file, background, frame, text }) {
  const side = await phone('list', 470, frame);
  const back = await phone('suggestions', 470, frame);
  const front = await phone('plan', 540, frame);
  const right = W - 60;
  const frontLeft = right - side.width - front.width + 70;
  await sharp({ create: { width: W, height: H, channels: 4, background } })
    .composite([
      { input: side.input, left: frontLeft - side.width + 70, top: 110 },
      { input: back.input, left: frontLeft + front.width - 70, top: 110 },
      { input: front.input, left: frontLeft, top: 70 },
      { input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${text}</svg>`), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(join(root, file));
  console.log(file);
}

const font = 'font-family="Segoe UI, Helvetica, Arial, sans-serif"';

await render({
  file: 'public/og.png',
  background: '#0d0f12',
  frame: '#2a2f38',
  text: `<g ${font} fill="#f2f2f5">
    <text x="64" y="230" font-size="72" font-weight="700" letter-spacing="-2">Ege Özel</text>
    <text x="64" y="288" font-size="32" font-weight="500" fill="#69d8cc">Software Developer</text>
    <text x="64" y="336" font-size="25" fill="#c9ccd4">Full-stack · product engineering</text>
    <text x="64" y="420" font-size="21" fill="#9a9eaa">Featured: Grocery, meal planning</text>
    <text x="64" y="450" font-size="21" fill="#9a9eaa">to shared shopping</text>
    <text x="64" y="560" font-size="21" fill="#9a9eaa">ege-ozel.github.io</text>
  </g>`,
});

await render({
  file: 'public/og-grocery.png',
  background: '#f4f0e7',
  frame: '#17232c',
  text: `<g ${font} fill="#20332e">
    <text x="64" y="150" font-size="20" fill="#b64a40" letter-spacing="2">CASE STUDY · FULL-STACK PRODUCT</text>
    <text x="64" y="240" font-size="68" font-weight="700" letter-spacing="-2">Grocery</text>
    <text x="64" y="300" font-size="32" font-weight="500">From meal planning</text>
    <text x="64" y="342" font-size="32" font-weight="500">to shared shopping</text>
    <text x="64" y="410" font-size="21" fill="#4a5a54">Preact · Vercel Functions · Supabase RLS</text>
    <text x="64" y="440" font-size="21" fill="#4a5a54">Nutrition rules traced to textbooks</text>
    <text x="64" y="560" font-size="21" fill="#4a5a54">ege-ozel.github.io/projects/grocery</text>
  </g>`,
});
