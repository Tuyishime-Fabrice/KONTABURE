#!/usr/bin/env node
/**
 * Builds the landing page's product screens from tools/screens/app/screens.html:
 *   1. compiles app.css with Tailwind v3 (the app's own utility classes);
 *   2. renders each screen at 2x and saves assets/screens/<key>.webp;
 *   3. writes crops.json with the [x, y, width, height] of every [data-crop]
 *      element, used to set CROPS / FOCUS in assets/js/kontabure.js.
 *
 * Usage: node tools/screens/app/build.cjs          (needs playwright, network for npx)
 *        TAILWIND_BIN=/path/to/tailwindcss node ... (use a local Tailwind v3 binary)
 *        node tools/screens/app/build.cjs --no-css  (reuse the committed app.css)
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const here = __dirname;
const root = path.resolve(here, '..', '..', '..');
const outDir = path.join(root, 'assets', 'screens');
const KEYS = ['overview', 'finance', 'ai', 'stock', 'products', 'credit'];

if (!process.argv.includes('--no-css')) {
  const bin = process.env.TAILWIND_BIN;
  const args = ['-c', 'tailwind.config.cjs', '-i', 'input.css', '-o', 'app.css', '--minify'];
  if (bin) execFileSync(bin, args, { cwd: here, stdio: 'inherit' });
  else execFileSync('npx', ['--yes', 'tailwindcss@3.4.17', ...args], { cwd: here, stdio: 'inherit' });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(here, 'screens.html'));
  await page.waitForSelector('body[data-ready="1"]');
  await page.waitForTimeout(300);

  const crops = await page.evaluate(() => {
    const o = {};
    document.querySelectorAll('.screen').forEach((sc) => {
      const s = sc.getBoundingClientRect();
      sc.querySelectorAll('[data-crop]').forEach((el) => {
        const e = el.getBoundingClientRect();
        o[el.dataset.crop] = [Math.round(e.left - s.left), Math.round(e.top - s.top), Math.round(e.width), Math.round(e.height)];
      });
    });
    return o;
  });
  fs.writeFileSync(path.join(here, 'crops.json'), JSON.stringify(crops, null, 1) + '\n');

  for (const key of KEYS) {
    const png = await page.locator(`#screen-${key}`).screenshot({ type: 'png' });
    const b64 = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.9).split(',')[1];
    }, png.toString('base64'));
    const file = path.join(outDir, `${key}.webp`);
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    console.log(`${key}.webp  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
  await browser.close();
})();
