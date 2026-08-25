// One-off script, not part of the build — regenerates the favicon PNG set
// from the SVG mark. Run manually if the logo ever changes:
//   node scripts/generate-favicons.mjs
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'node:fs/promises';

const source = 'src/assets/logo/mark.svg';

const sizes = {
  'public/favicon-16x16.png': 16,
  'public/favicon-32x32.png': 32,
  'public/apple-touch-icon.png': 180,
  // Also doubles as Seo.astro's default og:image/twitter:image fallback.
  'src/assets/logo/icon.png': 1080,
};

for (const [out, size] of Object.entries(sizes)) {
  await sharp(source, { density: 384 }).resize(size, size).png().toFile(out);
  console.log(`wrote ${out}`);
}

const icoBuffer = await pngToIco(['public/favicon-16x16.png', 'public/favicon-32x32.png']);
await writeFile('public/favicon.ico', icoBuffer);
console.log('wrote public/favicon.ico');
