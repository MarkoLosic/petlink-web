/* ================================================================
   PRAVNE STRANICE (privacy.html, terms.html) — izbor jezika
   ----------------------------------------------------------------
   • Svaka stranica ima po jedan <article data-lang="sr|hr|bs|en">
     sa kompletnim tekstom na tom jeziku; prikazuje se samo jedan.
   • Naslov taba se čita iz data-title atributa aktivnog članka.
   • Jezik se deli sa početnom stranom (isti localStorage ključ i
     isti ?lang= parametar), pa korisnik ostaje na svom jeziku.
   • Sadržaj (TOC) se automatski pravi od <h2 data-anchor="..."> naslova.
     Isti data-anchor se koristi u svim jezicima, pa link tipa
     privacy.html#delete-account radi bez obzira na jezik.
   ================================================================ */
(function () {
  const STORAGE_KEY = 'petlink-lang';
  const LANGUAGES = {
    sr: { label: 'SR', htmlLang: 'sr-Latn' },
    hr: { label: 'HR', htmlLang: 'hr' },
    bs: { label: 'BS', htmlLang: 'bs' },
    en: { label: 'EN', htmlLang: 'en' },
  };

  // Kratki tekstovi u zaglavlju/podnožju (sve ostalo je u <article>)
  const UI = {
    sr: { back: 'Nazad na početnu', toc: 'Sadržaj', privacy: 'Politika privatnosti', terms: 'Uslovi korišćenja', contact: 'Kontakt', rights: 'Sva prava zadržana.', icons: 'Ikonice', langLabel: 'Izaberi jezik' },
    hr: { back: 'Natrag na početnu', toc: 'Sadržaj', privacy: 'Politika privatnosti', terms: 'Uvjeti korištenja', contact: 'Kontakt', rights: 'Sva prava pridržana.', icons: 'Ikone', langLabel: 'Odaberi jezik' },
    bs: { back: 'Nazad na početnu', toc: 'Sadržaj', privacy: 'Politika privatnosti', terms: 'Uslovi korištenja', contact: 'Kontakt', rights: 'Sva prava zadržana.', icons: 'Ikonice', langLabel: 'Izaberi jezik' },
    en: { back: 'Back to home', toc: 'Contents', privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact', rights: 'All rights reserved.', icons: 'Icons', langLabel: 'Choose language' },
  };

  const safeStorage = {
    get() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } },
    set(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch { /* privatni režim */ } },
  };

  // Redosled: ?lang= u linku → ranije izabran jezik → jezik browsera → engleski
  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGUAGES[fromUrl]) return fromUrl;
    const saved = safeStorage.get();
    if (LANGUAGES[saved]) return saved;
    for (const l of navigator.languages || [navigator.language]) {
      const code = (l || '').toLowerCase().split('-')[0];
      if (code === 'hr') return 'hr';
      if (code === 'bs') return 'bs';
      if (['sr', 'sh', 'cnr', 'me'].includes(code)) return 'sr';
      if (code === 'en') return 'en';
    }
    return 'en';
  }

  document.addEventListener('DOMContentLoaded', () => {

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const langToggle = document.getElementById('lang-toggle');
    const langMenu = document.getElementById('lang-menu');
    const langCurrent = document.getElementById('lang-current');
    const toc = document.getElementById('toc-list');
    const articles = document.querySelectorAll('article[data-lang]');

    // Jedinstveni id-jevi po jeziku (sr-delete-account, en-delete-account...)
    articles.forEach((art) => {
      art.querySelectorAll('h2[data-anchor]').forEach((h) => { h.id = art.dataset.lang + '-' + h.dataset.anchor; });
    });

    function buildToc(article) {
      if (!toc) return;
      toc.innerHTML = '';
      article.querySelectorAll('h2[id]').forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.className = 'block rounded-lg px-2 py-1 transition hover:bg-brand-50 hover:text-brand-700';
        li.appendChild(a);
        toc.appendChild(li);
      });
    }

    // Unutrašnji linkovi (privacy ↔ terms ↔ početna) nose izabrani jezik
    function updateLinks(lang) {
      document.querySelectorAll('a[data-keep-lang]').forEach((a) => {
        const url = new URL(a.getAttribute('href'), location.href);
        url.searchParams.set('lang', lang);
        a.href = url.pathname.split('/').pop() + url.search + url.hash;
      });
    }

    function applyLang(lang) {
      const current = LANGUAGES[lang] ? lang : 'sr';
      const ui = UI[current];
      document.documentElement.lang = LANGUAGES[current].htmlLang;

      articles.forEach((art) => {
        const active = art.dataset.lang === current;
        art.hidden = !active;
        if (active) {
          document.title = art.dataset.title;
          buildToc(art);
        }
      });

      document.querySelectorAll('[data-ui]').forEach((el) => { el.textContent = ui[el.dataset.ui]; });
      langToggle.setAttribute('aria-label', ui.langLabel);
      langCurrent.textContent = LANGUAGES[current].label;
      langMenu.querySelectorAll('.lang-option').forEach((btn) => {
        const active = btn.dataset.lang === current;
        btn.setAttribute('aria-current', active ? 'true' : 'false');
        btn.classList.toggle('bg-brand-50', active);
        btn.classList.toggle('text-brand-700', active);
        btn.classList.toggle('font-semibold', active);
      });
      updateLinks(current);
      return current;
    }

    const setLangMenu = (open) => {
      langMenu.classList.toggle('hidden', !open);
      langToggle.setAttribute('aria-expanded', String(open));
    };
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setLangMenu(langMenu.classList.contains('hidden'));
    });
    langMenu.querySelectorAll('.lang-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = applyLang(btn.dataset.lang);
        safeStorage.set(lang);
        const url = new URL(location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
        setLangMenu(false);
        langToggle.focus();
      });
    });
    document.addEventListener('click', (e) => {
      if (!document.getElementById('lang-switcher').contains(e.target)) setLangMenu(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setLangMenu(false); });

    applyLang(detectLang());

    // Link tipa privacy.html#delete-account → skroluj do te sekcije u aktivnom jeziku
    const anchor = decodeURIComponent(location.hash.slice(1));
    if (anchor) {
      const target = [...document.querySelectorAll('article:not([hidden]) h2[data-anchor]')]
        .find((h) => h.dataset.anchor === anchor || h.id === anchor);
      if (target) target.scrollIntoView();
    }
  });
})();
