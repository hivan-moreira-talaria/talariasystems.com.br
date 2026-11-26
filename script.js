(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
  function fitSolutionsMenu() {
    const solutions = header?.querySelector('.solutions-dropdown');
    if (!solutions) return;
    const menuWidth = 34 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const available = window.innerWidth - solutions.getBoundingClientRect().left - 24;
    solutions.classList.toggle('is-stacked', menuWidth > available);
  }
  function closeDropdowns(except = null) {
    dropdowns.forEach(dropdown => { if (dropdown !== except) dropdown.open = false; });
  }
  function setMenuOpen(open, returnFocus = false) {
    if (!toggle || !navigation) return;
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    if (!open) closeDropdowns();
    if (returnFocus) toggle.focus();
  }
  if (toggle && navigation) {
    toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => { if (event.target.closest('a, [data-language]')) setMenuOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const openDropdown = dropdowns.find(dropdown => dropdown.open);
      if (openDropdown) {
        openDropdown.open = false;
        openDropdown.querySelector('summary').focus();
      } else if (toggle.getAttribute('aria-expanded') === 'true') setMenuOpen(false, true);
    });
    document.addEventListener('click', event => { if (header && !header.contains(event.target)) setMenuOpen(false); });
    const desktop = window.matchMedia('(min-width: 56rem)');
    desktop.addEventListener('change', event => { if (event.matches) setMenuOpen(false); });
  }
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('toggle', () => {
      if (dropdown.open) {
        fitSolutionsMenu();
        closeDropdowns(dropdown);
      }
    });
  });
  window.addEventListener('resize', fitSolutionsMenu);
  window.addEventListener('talaria:languagechange', fitSolutionsMenu);
  fitSolutionsMenu();
  header?.addEventListener('focusout', event => {
    if (!header.contains(event.relatedTarget)) {
      closeDropdowns();
      setMenuOpen(false);
    }
  });
  document.querySelectorAll('.nav-product-link, .nav-menu-link').forEach(link => {
    if (new URL(link.href).pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
  });
  function updateHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive: true});
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
