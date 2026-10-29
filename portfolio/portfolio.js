/* Muhammad Raees — portfolio progressive enhancement.
   The page is fully usable with JavaScript disabled; this only adds:
   1) an accessible mobile-nav toggle, 2) a light/dark theme toggle
   (respecting prefers-color-scheme, remembered in localStorage), and
   3) the current year in the footer. */

(function () {
  'use strict';

  // ---- Mobile navigation ----
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }
  function openMenu() {
    if (!toggle || !menu) return;
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeMenu(); } else { openMenu(); }
    });

    // Close after choosing a link (mobile) and on Escape.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    // Reset to desktop state when the viewport grows past the breakpoint.
    var mq = window.matchMedia('(min-width: 761px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(closeMenu);
  }

  // ---- Theme toggle ----
  var themeBtn = document.getElementById('themeToggle');
  var root = document.documentElement;

  function storedTheme() {
    try { return localStorage.getItem('mr-theme'); } catch (e) { return null; }
  }
  function storeTheme(t) {
    try { localStorage.setItem('mr-theme', t); } catch (e) { /* private mode: ignore */ }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label',
        t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  // Initialise from stored choice, else leave CSS prefers-color-scheme in control.
  var saved = storedTheme();
  if (saved === 'dark' || saved === 'light') applyTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      if (!current) current = systemPrefersDark() ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  // ---- Footer year ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
