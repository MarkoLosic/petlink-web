// Pravi slike za deljenje linka (Open Graph, 1200×630) za svaki jezik:
//   src/og-template.html  →  assets/og/og-sr.jpg, og-hr.jpg, og-bs.jpg, og-en.jpg
//
// Nije deo "npm run build" jer treba Chromium i slike se retko menjaju.
// Pokreni posle izmene naslova (hero.title1/2) ili šablona: npm run og
// Treba i ImageMagick (magick) za PNG → JPEG.
// Chromium se traži u PATH-u (chromium / google-chrome-stable / google-chrome),
// ili ga zadaj ručno: CHROME=/putanja/do/chrome npm run og
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { LANGUAGES, translate } from './lib/i18n-source.mjs';

const OUT = 'assets/og';
const TEMPLATE = 'src/og-template.html';

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const bin of ['chromium', 'google-chrome-stable', 'google-chrome', 'chromium-browser']) {
    try { execFileSync('which', [bin], { stdio: 'ignore' }); return bin; } catch { /* probaj sledeći */ }
  }
  throw new Error('Nije pronađen Chromium/Chrome. Postavi CHROME=/putanja/do/chrome');
}

const chrome = findChrome();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const template = fs.readFileSync(TEMPLATE, 'utf8');
fs.mkdirSync(OUT, { recursive: true });

for (const lang of Object.keys(LANGUAGES)) {
  const t = translate(lang);
  const chips = [t('g1.cap'), 'Pet Alert', t('nav.ai'), t('g.nfc')];
  const html = template
    .replaceAll('{{lang}}', LANGUAGES[lang].htmlLang)
    .replaceAll('{{title1}}', esc(t('hero.title1')))
    .replaceAll('{{title2}}', esc(t('hero.title2')))
    .replaceAll('{{playSmall}}', esc(t('play.small')))
    .replaceAll('{{chips}}', chips.map((c) => `<span class="chip">${esc(c)}</span>`).join(''));

  // Privremeni fajl pored šablona da bi relativne putanje (fontovi, ikonica) radile
  const tmp = path.resolve(`src/.og-${lang}.html`);
  const png = path.resolve(OUT, `.og-${lang}.png`);
  fs.writeFileSync(tmp, html);
  try {
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--virtual-time-budget=3000',
      `--screenshot=${png}`, `file://${tmp}`,
    ], { stdio: 'ignore' });
    // JPEG je ~4× manji od PNG-a, a mreže ga svejedno rekompresuju
    execFileSync('magick', [png, '-strip', '-quality', '86', `${OUT}/og-${lang}.jpg`]);
  } finally {
    fs.rmSync(tmp, { force: true });
    fs.rmSync(png, { force: true });
  }
  console.log(`og: ${OUT}/og-${lang}.jpg`);
}
