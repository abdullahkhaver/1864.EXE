/* 1864.EXE 2026 – countdown
   Counts down to doors opening, then switches to "happening now" and
   finally "that's a wrap". Times are read from the HTML so they can be
   changed without touching this file. */
(function () {
  'use strict';

  var root = document.querySelector('[data-clock]');
  if (!root) return;

  var start = new Date(root.getAttribute('data-target') || '2026-11-21T08:30:00+05:00').getTime();
  var end = new Date(root.getAttribute('data-end') || '2026-11-21T16:30:00+05:00').getTime();

  var states = {
    active: root.querySelector('[data-cd-active]'),
    live: root.querySelector('[data-cd-live]'),
    past: root.querySelector('[data-cd-past]')
  };
  var el = {
    days: root.querySelector('[data-days]'),
    hours: root.querySelector('[data-hours]'),
    minutes: root.querySelector('[data-minutes]'),
    seconds: root.querySelector('[data-seconds]')
  };

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function show(name) {
    Object.keys(states).forEach(function (k) {
      if (states[k]) states[k].hidden = k !== name;
    });
  }

  var timer = null;

  function tick() {
    var now = Date.now();
    if (now >= end) { show('past'); stop(); return; }
    if (now >= start) { show('live'); return; }

    var diff = start - now;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);

    if (el.days) el.days.textContent = String(days);
    if (el.hours) el.hours.textContent = pad(hours);
    if (el.minutes) el.minutes.textContent = pad(minutes);
    if (el.seconds) el.seconds.textContent = pad(seconds);
    show('active');
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // Line the updates up with the start of each second so digits change cleanly.
  tick();
  setTimeout(function () {
    tick();
    timer = setInterval(tick, 1000);
  }, 1000 - (Date.now() % 1000));

  // Catch up straight away when the tab becomes visible again.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
})();
