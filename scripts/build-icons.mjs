// Pravi SVG sprite sa SAMO onim Phosphor ikonama koje stranica koristi
// i upisuje ga između markera <!-- ICONS:START --> i <!-- ICONS:END -->.
//
// Ikona se u HTML-u koristi ovako (ime sa https://phosphoricons.com):
//   <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-paw-print"/></svg>
// Podrazumevani stil je WEIGHT ispod; drugi stil se bira sufiksom imena,
// npr. #i-star-fill, #i-heart-bold, #i-house-regular.
// Posle dodavanja nove ikone pokreni: npm run icons
//
// Ikone: Phosphor Icons (https://phosphoricons.com), MIT licenca.
import fs from 'node:fs';
import path from 'node:path';

const PAGES = ['index.html', 'privacy.html', 'terms.html'];
const ICON_DIR = 'node_modules/@phosphor-icons/core/assets';
const WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];
const WEIGHT = 'duotone';

function iconFile(id) {
  const m = id.match(new RegExp(`^(.+)-(${WEIGHTS.join('|')})$`));
  const [name, weight] = m ? [m[1], m[2]] : [id, WEIGHT];
  return path.join(ICON_DIR, weight, weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`);
}

for (const page of PAGES) {
  let html = fs.readFileSync(page, 'utf8');
  const ids = [...new Set([...html.matchAll(/href="#i-([a-z0-9-]+)"/g)].map((m) => m[1]))].sort();

  const symbols = ids.map((id) => {
    const file = iconFile(id);
    if (!fs.existsSync(file)) throw new Error(`Nepostojeća Phosphor ikona: "${id}" (nema ${file})`);
    const inner = fs.readFileSync(file, 'utf8').match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].trim();
    return `<symbol id="i-${id}" viewBox="0 0 256 256">${inner}</symbol>`;
  });

  const sprite = `<!-- ICONS:START (generiše npm run icons — ne menjaj ručno) -->\n  <!-- Ikone: Phosphor Icons — https://phosphoricons.com — MIT License, Copyright (c) 2023 Phosphor Icons -->\n  <svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>\n  <!-- ICONS:END -->`;
  const re = /<!-- ICONS:START[\s\S]*?<!-- ICONS:END -->/;
  if (!re.test(html)) throw new Error(`U ${page} nedostaju markeri <!-- ICONS:START --> / <!-- ICONS:END -->`);
  html = html.replace(re, sprite);
  fs.writeFileSync(page, html);
  console.log(`icons: ${page} — ${ids.length} ikona u sprite-u`);
}
