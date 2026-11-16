/* =========================================================
   Portfolio interactions (vanilla JS, no libraries)
   1 Theme · 2 Mobile nav · 3 Project filters
   4 Active link · 5 Reveal on scroll · 6 Role rotator · 7 Contact form · 8 Year
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Theme toggle ---------- */
  var themeBtn = document.getElementById('theme-toggle');

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked, ignore */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  var saved = safeGet('theme');
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      safeSet('theme', next);
    });
  }

  /* ---------- 2. Mobile nav ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- 3. Project filters ---------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('#project-grid .project');
  var emptyNote = document.getElementById('empty-note');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-filter');
      var visible = 0;

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });

      cards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !show;
        if (show) visible++;
      });

      if (emptyNote) emptyNote.hidden = visible !== 0;
    });
  });

  /* ---------- 4. Active nav link on scroll ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var links = document.querySelectorAll('.nav-links a');

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var match = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-current', match);
          if (match) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 5. Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- 6. Role rotator (hero) ---------- */
  var rotator = document.getElementById('role-rotator');
  var roles = ['ML Engineer', 'Data Analyst', 'Data Scientist'];

  if (rotator && !reduceMotion) {
    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = true;

    // start by erasing the first role, then cycle
    (function tick() {
      var delay = deleting ? 55 : 95;

      if (deleting) {
        charIndex--;
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 350;
        }
      } else {
        charIndex++;
        if (charIndex >= roles[roleIndex].length) {
          deleting = true;
          delay = 1800;
        }
      }

      rotator.textContent = roles[roleIndex].slice(0, Math.max(charIndex, 0)) || '\u00A0';
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 7. Contact form (Web3Forms) ---------- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-success', type === 'success');
    statusEl.classList.toggle('is-error', type === 'error');
  }

  if (form && statusEl && 'fetch' in window) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var keyField = form.elements['access_key'];
      if (keyField && keyField.value === 'YOUR_ACCESS_KEY_HERE') {
        setStatus('error', 'Form is not set up yet: add your Web3Forms access key in index.html.');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      setStatus('', 'Sending your message...');

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return res.ok && data.success;
          });
        })
        .then(function (ok) {
          if (ok) {
            form.reset();
            setStatus('success', 'Thanks! Your message has been sent.');
          } else {
            setStatus('error', 'Something went wrong. Please try again or email me directly.');
          }
        })
        .catch(function () {
          setStatus('error', 'Network error. Please try again or email me directly.');
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  }

  /* ---------- 8. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
