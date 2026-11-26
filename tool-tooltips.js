(() => {
  'use strict';
  let active = null;
  const margin = 16;
  const gap = 12;

  function close() {
    if (!active) return;
    active.panel.hidden = true;
    active.button.setAttribute('aria-expanded', 'false');
    active = null;
  }

  function position() {
    if (!active) return;
    const anchor = active.link.getBoundingClientRect();
    const panel = active.panel.getBoundingClientRect();
    const left = Math.max(margin, Math.min(anchor.left + (anchor.width - panel.width) / 2, window.innerWidth - panel.width - margin));
    const above = anchor.top >= panel.height + gap + margin;
    const top = above ? anchor.top - panel.height - gap : Math.max(margin, Math.min(anchor.bottom + gap, window.innerHeight - panel.height - margin));
    active.panel.style.left = `${Math.round(left)}px`;
    active.panel.style.top = `${Math.round(top)}px`;
    active.panel.dataset.placement = above ? 'above' : 'below';
  }

  function open(entry) {
    if (active === entry) return;
    close();
    active = entry;
    entry.panel.hidden = false;
    entry.button.setAttribute('aria-expanded', 'true');
    position();
  }

  document.querySelectorAll('[data-tool-card]').forEach(card => {
    const link = card.querySelector('.tool-logo-link');
    const button = card.querySelector('[data-tool-summary]');
    const panel = document.getElementById(button?.getAttribute('aria-controls'));
    if (!link || !button || !panel) return;
    const entry = { card, link, button, panel };
    button.hidden = false;
    button.addEventListener('click', () => {
      if (active === entry) close();
      else open(entry);
    });
  });

  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  document.addEventListener('click', event => {
    if (active && !active.card.contains(event.target) && !active.panel.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (active && !active.card.contains(event.target) && !active.panel.contains(event.target)) close();
  });
  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('blur', close);
  window.addEventListener('resize', position);
  window.addEventListener('talaria:languagechange', position);
})();
