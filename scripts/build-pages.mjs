// Pravi jezičke verzije sajta i SEO fajlove:
//   index.html (srpski, izvor)  →  hr/index.html, bs/index.html, en/index.html
//   + SEO blok u <head> svake stranice (title, description, canonical, hreflang,
//     Open Graph, Twitter, JSON-LD), sitemap.xml i robots.txt
//
// Pokreće se preko: npm run build
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { LANGUAGES, TRANSLATIONS, SITE, PLAY_URL, source, sr, translate, pageUrl, esc } from './lib/i18n-source.mjs';

const SEO_BLOCK = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;
if (!SEO_BLOCK.test(source)) throw new Error('U index.html nedostaju markeri <!-- SEO:START --> / <!-- SEO:END -->');

// Ključevi koji nedostaju u prevodu — da se ne bi tiho prikazao srpski tekst
for (const lang of Object.keys(TRANSLATIONS)) {
  const missing = Object.keys(sr).filter((k) => !(k in TRANSLATIONS[lang]));
  if (missing.length) console.warn(`pages: [${lang}] nema prevod za: ${missing.join(', ')} (prikazuje se srpski)`);
}

// ---------------------------------------------------------------
// SEO blok za <head>
// ---------------------------------------------------------------
function seoBlock(lang) {
  const t = translate(lang);
  const info = LANGUAGES[lang];
  const url = pageUrl(lang);
  const image = `${SITE}assets/og/og-${lang}.jpg`;
  const others = Object.keys(LANGUAGES).filter((l) => l !== lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: 'PetLink', url: SITE, inLanguage: info.htmlLang },
      {
        '@type': 'MobileApplication',
        name: 'PetLink',
        operatingSystem: 'Android',
        applicationCategory: 'LifestyleApplication',
        description: t('meta.desc'),
        url,
        image: `${SITE}assets/logo.png`,
        installUrl: PLAY_URL,
        inLanguage: Object.values(LANGUAGES).map((l) => l.htmlLang),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
    ],
  };

  return [
    '<!-- SEO:START -->',
    `<title>${esc(t('meta.title'))}</title>`,
    `<meta name="description" content="${esc(t('meta.desc'))}" />`,
    `<link rel="canonical" href="${url}" />`,
    '',
    '<!-- Alternativne jezičke verzije (za Google) -->',
    ...Object.entries(LANGUAGES).map(([l, i]) => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}" />`,
    '',
    '<!-- Open Graph (deljenje na društvenim mrežama) -->',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="PetLink" />',
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(t('meta.title'))}" />`,
    `<meta property="og:description" content="${esc(t('meta.desc'))}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${esc(t('meta.title'))}" />`,
    `<meta property="og:locale" content="${info.ogLocale}" />`,
    ...others.map((l) => `<meta property="og:locale:alternate" content="${LANGUAGES[l].ogLocale}" />`),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(t('meta.title'))}" />`,
    `<meta name="twitter:description" content="${esc(t('meta.desc'))}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    '',
    '<!-- Strukturirani podaci (Google) -->',
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
    '<!-- SEO:END -->',
  ].join('\n  ');
}

const setLegalLang = (document, lang) => document.querySelectorAll('a[data-legal-link]').forEach((a) => {
  a.setAttribute('href', a.getAttribute('href').split('?')[0] + '?lang=' + lang);
});

// ---------------------------------------------------------------
// Prevedena stranica (hr / bs / en)
// ---------------------------------------------------------------
const isRelative = (u) => u && !/^(#|[a-z]+:|\/|data:)/i.test(u);

function translatedPage(lang) {
  const t = translate(lang);
  const { document } = parseHTML(source);

  document.documentElement.setAttribute('lang', LANGUAGES[lang].htmlLang);
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))));
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))));

  const menuToggle = document.getElementById('menu-toggle');
  menuToggle.setAttribute('aria-label', t('menu.open'));
  menuToggle.setAttribute('data-label-open', t('menu.open'));
  menuToggle.setAttribute('data-label-close', t('menu.close'));

  // Izbor jezika: oznaka na dugmetu + aktivna stavka
  document.getElementById('lang-current').textContent = LANGUAGES[lang].label;
  document.querySelectorAll('.lang-option').forEach((a) => {
    const active = a.getAttribute('data-lang') === lang;
    ['bg-brand-50', 'font-semibold', 'text-brand-700'].forEach((c) => a.classList.toggle(c, active));
    if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });

  // Pravne stranice (privacy.html, terms.html) biraju jezik preko ?lang=
  setLegalLang(document, lang);

  // Preusmeravanje po jeziku radi samo na korenu
  document.getElementById('lang-redirect')?.remove();

  // Stranica je jedan folder dublje: assets/x → ../assets/x, hr/ → ../hr/, ./ → ../
  document.querySelectorAll('[src], [href]').forEach((el) => {
    for (const attr of ['src', 'href']) {
      const v = el.getAttribute(attr);
      if (isRelative(v)) el.setAttribute(attr, '../' + v.replace(/^\.\//, ''));
    }
  });

  const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n';
  return html
    .replace(SEO_BLOCK, seoBlock(lang))
    .replace('<html', `<!-- GENERISANO iz index.html + src/i18n.mjs (npm run build) — ne menjaj ručno -->\n<html`);
}

// ---------------------------------------------------------------
// Upis
// ---------------------------------------------------------------
// Srpski koren: menja se samo SEO blok, ostatak fajla ostaje kako je napisan
fs.writeFileSync('index.html', source.replace(SEO_BLOCK, seoBlock('sr')));

for (const lang of Object.keys(LANGUAGES).filter((l) => l !== 'sr')) {
  fs.mkdirSync(LANGUAGES[lang].path, { recursive: true });
  fs.writeFileSync(LANGUAGES[lang].path + 'index.html', translatedPage(lang));
}

const today = new Date().toISOString().slice(0, 10);
const alternates = Object.keys(LANGUAGES)
  .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(l)}"/>`)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}"/>`)
  .join('\n');
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.keys(LANGUAGES).map((l) => `  <url>
    <loc>${pageUrl(l)}</loc>
    <lastmod>${today}</lastmod>
${alternates}
  </url>`).join('\n')}
</urlset>
`);

fs.writeFileSync('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`);

console.log(`pages: ${Object.keys(LANGUAGES).join(', ')} + sitemap.xml + robots.txt`);
