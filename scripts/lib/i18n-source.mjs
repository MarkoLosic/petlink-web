// Zajedničko za build skripte: srpski tekst iz index.html + prevodi iz src/i18n.mjs
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { LANGUAGES, TRANSLATIONS } from '../../src/i18n.mjs';

export { LANGUAGES, TRANSLATIONS };

// Ako sajt pređe na svoj domen, promeni samo ovo (sa "/" na kraju)
export const SITE = 'https://markolosic.github.io/petlink-web/';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.markolosic.petlink';

export const source = fs.readFileSync('index.html', 'utf8');

// Srpski tekst se čita iz index.html, pa ga ne treba duplirati u i18n.mjs
// (getAttribute umesto dataset: linkedom pogrešno mapira data-i18n)
const { document: srcDoc } = parseHTML(source);
export const sr = {
  'meta.title': srcDoc.querySelector('title').textContent.trim(),
  'meta.desc': srcDoc.querySelector('meta[name="description"]').getAttribute('content'),
  'menu.open': srcDoc.getElementById('menu-toggle').getAttribute('data-label-open'),
  'menu.close': srcDoc.getElementById('menu-toggle').getAttribute('data-label-close'),
};
srcDoc.querySelectorAll('[data-i18n]').forEach((el) => { sr[el.getAttribute('data-i18n')] ??= el.textContent.trim(); });
srcDoc.querySelectorAll('[data-i18n-aria]').forEach((el) => { sr[el.getAttribute('data-i18n-aria')] ??= el.getAttribute('aria-label'); });
srcDoc.querySelectorAll('[data-i18n-alt]').forEach((el) => { sr[el.getAttribute('data-i18n-alt')] ??= el.getAttribute('alt'); });

export const translate = (lang) => (key) => TRANSLATIONS[lang]?.[key] ?? sr[key];
export const pageUrl = (lang) => SITE + LANGUAGES[lang].path;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
