/* Ao Chen — personal page. Vanilla, dependency-free, defensive.
   Everything here is progressive enhancement: the page is complete without it. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- theme toggle ---------------------------------------------------- */
  var toggle = document.getElementById('theme-toggle');

  function isDark() {
    var set = root.getAttribute('data-theme');
    if (set) return set === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function paintToggle() {
    if (!toggle) return;
    var dark = isDark();
    var sun = toggle.querySelector('.icon-sun');
    var moon = toggle.querySelector('.icon-moon');
    /* SVG elements have no .hidden property in every engine; use the attribute. */
    if (sun) { if (dark) sun.setAttribute('hidden', ''); else sun.removeAttribute('hidden'); }
    if (moon) { if (dark) moon.removeAttribute('hidden'); else moon.setAttribute('hidden', ''); }
    /* The name stays neutral ("Dark theme"); aria-pressed carries the state. */
    toggle.setAttribute('aria-pressed', String(dark));
  }

  if (toggle) {
    paintToggle();
    toggle.hidden = false;          /* dead control without JS, so reveal it here */
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.classList.add('theme-switching');
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paintToggle();
      requestAnimationFrame(function () { root.classList.remove('theme-switching'); });
    });

    /* With no stored choice the OS preference drives the page; keep the
       button in sync if that preference flips while the page is open. */
    var schemeMQ = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (schemeMQ) {
      var onScheme = function () { if (!root.getAttribute('data-theme')) paintToggle(); };
      if (schemeMQ.addEventListener) schemeMQ.addEventListener('change', onScheme);
      else if (schemeMQ.addListener) schemeMQ.addListener(onScheme);
    }
  }

  /* ---- nav state and scroll-spy ---------------------------------------- */
  var nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 160);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Fade only the edge that still has content to scroll to. */
  var navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    var paintMask = function () {
      var max = navLinks.scrollWidth - navLinks.clientWidth;
      navLinks.classList.toggle('mask-left', navLinks.scrollLeft > 2);
      navLinks.classList.toggle('mask-right', navLinks.scrollLeft < max - 2);
    };
    navLinks.addEventListener('scroll', paintMask, { passive: true });
    window.addEventListener('resize', paintMask);
    paintMask();
  }

  var setCurrent = function (id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  /* One-off recompute (after a programmatic jump the observer may not fire):
     the current section is the last one whose top is above the spy line. */
  var syncSpy = function () {
    var line = window.innerHeight * 0.47, id = null;
    links.forEach(function (a) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (t && t.getBoundingClientRect().top <= line) id = t.id;
    });
    setCurrent(id || '');
  };

  if (links.length && 'IntersectionObserver' in window) {
    /* The observer is only a cheap trigger; the geometry decides. (Inside an
       iframe rootMargin is ignored, so trusting entry.target there marks the
       wrong section.) */
    var spy = new IntersectionObserver(function () { syncSpy(); },
      { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) spy.observe(target);
    });
  }

  /* ---- roadmap: WAI-ARIA tabs over the milestone strip ----------------- */
  /* Without JS the strip is a list of links to #step-0..#step-7 and every
     panel is visible. Here it becomes a tablist with one visible panel. */
  var strip = document.getElementById('rm-strip');
  var plate = document.getElementById('roadmap-figure');
  var tabs = strip ? Array.prototype.slice.call(strip.querySelectorAll('.rm-tab')) : [];
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('href').slice(1)); });

  if (plate && tabs.length && panels.every(Boolean)) {
    var scroller = strip.parentNode;
    var defaultIndex = 0;

    strip.setAttribute('role', 'tablist');
    Array.prototype.forEach.call(strip.children, function (li) { li.setAttribute('role', 'presentation'); });
    tabs.forEach(function (tab, i) {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      panels[i].setAttribute('tabindex', '0');
      if (tab.parentNode.classList.contains('is-done')) defaultIndex = i;  /* latest achieved */
    });
    plate.classList.add('js-tabs');

    /* Bring a column into view by scrolling the strip only, never the page. */
    /* When scrolling left, leave a slice of the previous column peeking in
       (as the reference carousel does) so it is clear there is more. */
    var revealTab = function (i, instant) {
      var item = tabs[i].parentNode;
      var pad = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
      var left = item.offsetLeft, right = left + item.offsetWidth;
      var view = scroller.scrollLeft, width = scroller.clientWidth;
      var peek = i > 0 ? Math.min(48, Math.max(0, width - item.offsetWidth - 2 * pad)) : 0;
      var to = null;
      if (left - pad - peek < view) to = left - pad - peek;
      else if (right + pad > view + width) to = right + pad - width;
      if (to !== null) {
        to = Math.max(0, to);
        if (scroller.scrollTo) scroller.scrollTo({ left: to, behavior: (instant || reduced) ? 'auto' : 'smooth' });
        else scroller.scrollLeft = to;
      }
    };

    var select = function (i, opts) {
      opts = opts || {};
      tabs.forEach(function (tab, j) {
        var on = j === i;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        tab.parentNode.classList.toggle('is-selected', on);
        panels[j].hidden = !on;
      });
      if (opts.reveal) revealTab(i, opts.instant);
      if (opts.focus) tabs[i].focus();
      if (opts.hash && window.history && history.replaceState) {
        try { history.replaceState(null, '', '#' + panels[i].id); } catch (e) {}
      }
    };

    var indexFromHash = function (hash) {
      var m = /^#step-(\d+)$/.exec(hash || '');
      if (!m) return -1;
      var i = parseInt(m[1], 10);
      return i < tabs.length ? i : -1;
    };

    /* Select step i and bring its panel into view (deep links, cross-refs). */
    var openStep = function (i, onLoad) {
      select(i, { reveal: true, instant: onLoad });
      panels[i].scrollIntoView({ block: 'start', behavior: (onLoad || reduced) ? 'instant' : 'smooth' });
      /* Move focus with the reader when they followed a link, not on load. */
      if (!onLoad) {
        try { panels[i].focus({ preventScroll: true }); } catch (e) { panels[i].focus(); }
      }
    };

    /* On load the browser itself focuses a focusable fragment target (the
       panel has tabindex=0), which paints a focus ring nobody asked for.
       Drop that focus; the sequential-focus starting point stays put. */
    var dropLoadFocus = function (i) {
      if (document.activeElement === panels[i]) panels[i].blur();
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;  /* new tab etc. */
        e.preventDefault();
        select(i, { reveal: true, hash: true });
      });
    });

    strip.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(e.target);
      if (i < 0) return;
      var n = null, last = tabs.length - 1;
      switch (e.key) {
        case 'ArrowRight': case 'Right': n = i === last ? 0 : i + 1; break;
        case 'ArrowLeft': case 'Left': n = i === 0 ? last : i - 1; break;
        case 'Home': n = 0; break;
        case 'End': n = last; break;
        case ' ': case 'Spacebar': n = i; break;   /* links ignore Space; tabs don't */
      }
      if (n === null) return;
      e.preventDefault();
      select(n, { reveal: true, focus: true, hash: true });
    });

    /* In-page links to a step (e.g. "Evidence for step 1"): handle them here
       so a repeat click on the same hash still selects and scrolls. */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
      var a = e.target.closest ? e.target.closest('a[href^="#step-"]') : null;
      if (!a || a.classList.contains('rm-tab')) return;
      var i = indexFromHash(a.getAttribute('href'));
      if (i < 0) return;
      e.preventDefault();
      if (window.history && history.pushState) {
        try { history.pushState(null, '', '#' + panels[i].id); } catch (err) {}
      }
      openStep(i, false);
    });

    window.addEventListener('hashchange', function () {
      var i = indexFromHash(location.hash);
      if (i >= 0) openStep(i, false);
    });

    var initial = indexFromHash(location.hash);
    if (initial >= 0) {
      openStep(initial, true);
      var settle = function () { dropLoadFocus(initial); syncSpy(); };
      requestAnimationFrame(settle);
      if (document.readyState === 'complete') settle();
      else window.addEventListener('load', function () { requestAnimationFrame(settle); });
    } else {
      select(defaultIndex, { reveal: true, instant: true });   /* scrolls the strip only */
    }
  }

  /* ---- reveal on scroll (opt-in, never required) ----------------------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll('.section > .col > h2, .entry, .cvrow, .repo')
    );
    if (targets.length) {
      targets.forEach(function (el, i) { el.setAttribute('data-reveal', ''); el.style.setProperty('--i', i % 6); });
      root.classList.add('js-reveal');
      var reveal = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      targets.forEach(function (el) { reveal.observe(el); });
    }
  }

  /* ---- copy email (mailto link stays the real affordance) -------------- */
  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');

  function announce(msg, label) {
    if (copyStatus) copyStatus.textContent = msg;
    if (copyBtn) {
      copyBtn.textContent = label;
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2400);
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (copyBtn) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';
      var done = function () { announce('Email address copied', 'Copied'); };
      var failed = function () {
        var link = document.getElementById('email-link');
        if (link && window.getSelection && document.createRange) {
          var range = document.createRange();
          range.selectNodeContents(link);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        announce('Copy unavailable; address selected', 'Select to copy');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () {
          if (legacyCopy(email)) done(); else failed();
        });
      } else if (legacyCopy(email)) {
        done();
      } else {
        failed();
      }
    });
  }

  /* ---- print: expand collapsed author lists ---------------------------- */
  /* (Hidden roadmap panels are forced visible by the print stylesheet.) */
  window.addEventListener('beforeprint', function () {
    var all = document.querySelectorAll('details');
    Array.prototype.forEach.call(all, function (d) { d.open = true; });
  });
  /* ---- experience timeline ------------------------------------------- */
  /* Places each Experience card on a shared vertical time axis: top edge =
     end date (newest at the top), bar length = duration. The px-per-month
     scale is the smallest one (>= MIN_M) at which every card's text still
     ends before the next card in the same column begins. */
  (function () {
    var list = document.querySelector('.cvlist');
    if (!list) return;
    var rows = Array.prototype.slice.call(list.querySelectorAll('.cvrow[data-start]'));
    if (!rows.length) return;
    var wide = window.matchMedia ? window.matchMedia('(min-width: 640px)') : null;
    var MIN_M = 6, GAP = 20;
    var now = new Date();

    function month(str) {
      if (str === 'present') return now.getFullYear() * 12 + now.getMonth();
      var p = str.split('-');
      return parseInt(p[0], 10) * 12 + parseInt(p[1], 10) - 1;
    }

    /* Start = beginning of the start month; end = end of the end month. */
    var items = rows.map(function (el) {
      return { el: el, start: month(el.dataset.start), end: month(el.dataset.end) + 1,
               col: el.classList.contains('cv-edu') ? 0 : 1 };
    });
    var newest = Math.max.apply(null, items.map(function (d) { return d.end; }));
    var oldest = Math.min.apply(null, items.map(function (d) { return d.start; }));
    var total = newest - oldest;
    items.forEach(function (d) {
      d.top = newest - d.end;
      d.el.style.setProperty('--top', d.top);
      d.el.style.setProperty('--dur', d.end - d.start);
    });
    list.style.setProperty('--total', total);

    function layout() {
      if (wide && !wide.matches) { list.classList.remove('is-timeline'); return; }
      list.classList.add('is-timeline');
      var m = MIN_M;
      [0, 1].forEach(function (col) {
        var c = items.filter(function (d) { return d.col === col; })
                     .sort(function (a, b) { return a.top - b.top; });
        c.forEach(function (d, k) {
          var room = (k + 1 < c.length ? c[k + 1].top : total) - d.top;
          var need = d.el.offsetHeight + (k + 1 < c.length ? GAP : 0);
          if (room > 0) m = Math.max(m, need / room);
        });
      });
      list.style.setProperty('--m', m.toFixed(2) + 'px');
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; layout(); });
    }
    layout();
    window.addEventListener('resize', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  })();

})();
