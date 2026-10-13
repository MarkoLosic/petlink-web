// Pravi SVG sprite sa SAMO onim Lucide ikonama koje se koriste u index.html
// i upisuje ga između markera <!-- ICONS:START --> i <!-- ICONS:END -->.
//
// Ikona se u HTML-u koristi ovako (ime sa https://lucide.dev/icons):
//   <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-paw-print"/></svg>
// Posle dodavanja nove ikone pokreni: npm run icons
import fs from 'node:fs';
import path from 'node:path';

const HTML = 'index.html';
const ICON_DIR = 'node_modules/lucide-static/icons';

let html = fs.readFileSync(HTML, 'utf8');
const names = [...new Set([...html.matchAll(/href="#i-([a-z0-9-]+)"/g)].map((m) => m[1]))].sort();

const symbols = names.map((name) => {
  const file = path.join(ICON_DIR, `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Nepostojeća Lucide ikona: "${name}"`);
  const inner = fs.readFileSync(file, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]
    .replace(/\s*\n\s*/g, '')
    .replace(/\s*\/>/g, '/>');
  return `<symbol id="i-${name}" viewBox="0 0 24 24">${inner}</symbol>`;
});

const sprite = `<!-- ICONS:START (generiše npm run icons — ne menjaj ručno) -->\n  <svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>\n  <!-- ICONS:END -->`;
const re = /<!-- ICONS:START[\s\S]*?<!-- ICONS:END -->/;
if (!re.test(html)) throw new Error('U index.html nedostaju markeri <!-- ICONS:START --> / <!-- ICONS:END -->');
html = html.replace(re, sprite);
fs.writeFileSync(HTML, html);
console.log(`icons: ${names.length} ikona u sprite-u`);
