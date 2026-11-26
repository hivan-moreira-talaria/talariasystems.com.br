(() => {
  'use strict';
  const catalogs = globalThis.TalariaLocales;
  if (!catalogs) return;
  const languageLabels = { en: 'EN', 'pt-BR': 'PT-BR', 'pt-PT': 'PT', es: 'ES' };
  const storageKey = 'talaria-language';
  const textNodes = [];
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const nodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    element.dataset.i18n.split(/\s+/).forEach((key, index) => {
      if (key === '-' || !nodes[index]) return;
      const node = nodes[index];
      const original = node.textContent;
      const content = original.trim();
      const start = original.indexOf(content);
      textNodes.push({ node, key, prefix: original.slice(0, start), suffix: original.slice(start + content.length) });
    });
  });
  const attributes = [];
  for (const attribute of ['aria-label', 'aria-roledescription', 'alt', 'title', 'content']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      attributes.push({ element, attribute, key: element.getAttribute(`data-i18n-${attribute}`) });
    });
  }
  const internalLinks = Array.from(document.querySelectorAll('a[href]')).flatMap(element => {
    const href = element.getAttribute('href');
    if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) return [];
    const url = new URL(href, window.location.href);
    return /\.html$/.test(url.pathname) ? [{ element, href }] : [];
  });
  function applyLanguage(language) {
    if (!catalogs[language]) language = 'pt-BR';
    const translate = key => catalogs[language][key] ?? catalogs['pt-BR'][key];
    textNodes.forEach(({ node, key, prefix, suffix }) => {
      const text = translate(key);
      if (text !== undefined) node.textContent = prefix + text + suffix;
    });
    attributes.forEach(({ element, attribute, key }) => {
      const text = translate(key);
      if (text !== undefined) element.setAttribute(attribute, text);
    });
    document.documentElement.lang = language;
    document.querySelectorAll('[data-current-language]').forEach(element => { element.textContent = languageLabels[language]; });
    document.querySelectorAll('[data-language]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    internalLinks.forEach(({ element, href }) => {
      const url = new URL(href, window.location.href);
      if (language === 'pt-BR') url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      element.setAttribute('href', url.href);
    });
    try { localStorage.setItem(storageKey, language); } catch { /* File previews may restrict storage. */ }
    const url = new URL(window.location.href);
    if (language === 'pt-BR') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    try { window.history.replaceState(null, '', url.href); } catch { /* Local files can restrict history updates. */ }
    window.dispatchEvent(new Event('talaria:languagechange'));
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => applyLanguage(button.dataset.language));
  });
  let savedLanguage = null;
  try { savedLanguage = localStorage.getItem(storageKey); } catch { /* The URL remains a usable preference. */ }
  const requested = new URL(window.location.href).searchParams.get('lang') || savedLanguage || 'pt-BR';
  applyLanguage(requested === 'pt' ? 'pt-PT' : requested);
})();
