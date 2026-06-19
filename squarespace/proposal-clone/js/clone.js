/* Katha proposal clone — shared interactivity
   - mobile nav toggle
   - "What changed" annotation layer
   - contact form client-side validation + success state (no backend)
   Works on every page; pages opt in to the form by including #inquiry-form. */
(function () {
  'use strict';

  /* ---- Mobile nav -------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav__toggle');
  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- "What changed" annotation layer ----------------------------------- */
  var annotBtn = document.querySelector('.annot-toggle');
  if (annotBtn) {
    annotBtn.addEventListener('click', function () {
      var on = document.body.classList.toggle('show-annot');
      annotBtn.textContent = on ? 'Hide changes' : 'What changed';
      annotBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---- Step reveal-on-scroll (Tier 1A) ---------------------------------- */
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealTargets = document.querySelectorAll('.step--reveal');
  if (revealTargets.length && !prefersReduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: ensure visible if no IO or reduced motion
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Contact form ------------------------------------------------------ */
  var form = document.getElementById('inquiry-form');
  if (form) {
    var status = form.querySelector('.form__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = [];
      form.querySelectorAll('[required]').forEach(function (el) {
        if (!el.value || !String(el.value).trim()) {
          missing.push(el);
          el.style.borderBottomColor = 'var(--walnut)';  /* retired rust on the clone surface (red reads as danger) — walnut signals "fix this" without alarm */
        } else {
          el.style.borderBottomColor = '';
        }
      });
      if (missing.length) {
        if (status) status.textContent = 'Please complete the required fields (' + missing.length + ' remaining).';
        missing[0].focus();
        return;
      }
      if (status) {
        status.style.color = '#574C3F';
        status.textContent = 'Thank you — your inquiry is received. We review every inquiry with care and reply within 24 hours.';
      }
      form.reset();
    });
  }
})();
