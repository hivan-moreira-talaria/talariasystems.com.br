(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  function setMenuOpen(open, returnFocus = false) {
    if (!toggle || !navigation) return;
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    if (returnFocus) toggle.focus();
  }
  if (toggle && navigation) {
    toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenuOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenuOpen(false, true);
    });
    document.addEventListener('click', event => { if (header && !header.contains(event.target)) setMenuOpen(false); });
    const desktop = window.matchMedia('(min-width: 56rem)');
    desktop.addEventListener('change', event => { if (event.matches) setMenuOpen(false); });
  }
  function updateHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive: true});
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
        else visible.delete(entry.target.id);
      });
      const current = [...visible.values()].sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0];
      links.forEach(link => {
        if (current && link.getAttribute('href') === '#' + current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-15% 0px -45% 0px', threshold: 0});
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
  const clients = document.getElementById('career-viewport');
  const clientsTrack = clients?.querySelector('.clients-track');
  const clientsList = clients?.querySelector('.clients-list');
  if (clients && clientsTrack && clientsList) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let duplicate = null;
    let hoverTimer = null;
    function clearClientsHover() {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
      clients.classList.remove('is-hover-paused');
    }
    function updateClientsDuration() {
      clients.style.setProperty('--clients-duration', `${Math.max(30, clientsList.getBoundingClientRect().width / 40)}s`);
    }
    function updateClientsMotion() {
      if (reducedMotion.matches) {
        clearClientsHover();
        clients.classList.remove('is-running');
        duplicate?.remove();
        duplicate = null;
        return;
      }
      if (!duplicate) {
        duplicate = clientsList.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.setAttribute('inert', '');
        duplicate.querySelectorAll('img').forEach(img => { img.alt = ''; img.loading = 'eager'; });
        clientsTrack.append(duplicate);
      }
      clients.classList.add('is-running');
      updateClientsDuration();
    }
    function toggleClientsPause() {
      if (!reducedMotion.matches) clients.classList.toggle('is-paused');
    }
    clients.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
      clearClientsHover();
      hoverTimer = window.setTimeout(() => {
        hoverTimer = null;
        clients.classList.add('is-hover-paused');
      }, 500);
    });
    clients.addEventListener('pointerleave', clearClientsHover);
    clients.addEventListener('pointercancel', clearClientsHover);
    window.addEventListener('blur', clearClientsHover);
    clients.addEventListener('click', toggleClientsPause);
    clients.addEventListener('keydown', event => {
      if (event.target === clients && event.key === ' ') {
        event.preventDefault();
        toggleClientsPause();
      }
    });
    reducedMotion.addEventListener('change', updateClientsMotion);
    if ('ResizeObserver' in window) new ResizeObserver(updateClientsDuration).observe(clientsList);
    else window.addEventListener('resize', updateClientsDuration);
    updateClientsMotion();
  }
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
