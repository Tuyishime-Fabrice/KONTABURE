#!/usr/bin/env node
/**
 * Renders the SAMPLE product screens in tools/screens/screens.html to
 * assets/screens/<key>.webp at 2x (2880×1800).
 *
 * Only needed while real dashboard screenshots are not available.
 * Once you have real screenshots, save them over the files in
 * assets/screens/ (same names) and you can delete tools/.
 *
 * Usage: node tools/render-screens.cjs   (requires `playwright`)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const KEYS = ['overview', 'products', 'stock', 'sales', 'credit', 'reports'];
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'screens');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'screens', 'screens.html'));
  await page.waitForSelector('body[data-ready="1"]');

  for (const key of KEYS) {
    const png = await page.locator(`#screen-${key}`).screenshot({ type: 'png' });
    // Encode to WebP inside Chromium (no extra native dependencies needed).
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
