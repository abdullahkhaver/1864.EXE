/* 1864.EXE 2026 – page behaviour
   Menu, header shadow, current-section link, scoring tabs, the
   "happening now" row in the schedule, and registration links. */
(function () {
  'use strict';

  /* Put the Google Form link here when it's ready, e.g.
     'https://forms.gle/xxxxxxxxxxxx'. Until then, Register buttons scroll
     to the registration section and show a short note. */
  var REGISTRATION_URL = 'https://forms.gle/2uRRPz7z88tMafNv7';

  var doc = document.documentElement;
  doc.classList.remove('no-js');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Header ---------- */
  var header = $('#header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn');
  var nav = $('#mainNav');
  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-btn-text').textContent = open ? 'Close' : 'Menu';
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Highlight the section you're reading ---------- */
  if ('IntersectionObserver' in window && nav) {
    var links = $$('a[href^="#"]', nav);
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) { link.classList.add('is-current'); link.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Scoring tabs ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % n, true); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((i - 1 + n) % n, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });
    select(0, false);
  });

  /* ---------- "Happening now" in the schedule (event day, Pakistan time) ---------- */
  var schedule = $('[data-schedule]');
  function markNow() {
    if (!schedule) return;
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var get = function (type) { var p = parts.find(function (x) { return x.type === type; }); return p ? p.value : ''; };
    var isEventDay = get('year') === '2026' && get('month') === '11' && get('day') === '21';
    var now = get('hour') + ':' + get('minute');
    $$('li', schedule).forEach(function (li) {
      var on = isEventDay && now >= li.getAttribute('data-start') && now < li.getAttribute('data-end');
      li.classList.toggle('is-now', on);
    });
  }
  markNow();
  setInterval(markNow, 60000);

  /* ---------- Registration links ---------- */
  var toast = $('#toast');
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 4000);
  }

  $$('[data-register]').forEach(function (a) {
    if (REGISTRATION_URL) {
      a.href = REGISTRATION_URL;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      return;
    }
    a.addEventListener('click', function () {
      showToast('The registration form opens soon. Contact the organisers to reserve a place.');
    });
  });
})();
