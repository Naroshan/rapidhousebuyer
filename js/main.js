/* ============================================================
   RAPID HOUSE BUYER — main.js
   All code wrapped in DOMContentLoaded for reliable execution
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ── NAV SCROLL ─────────────────────────────────────────── */
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── HAMBURGER MENU ─────────────────────────────────────── */
  var hamburger = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.main-nav');

  if (hamburger && mobileNav) {

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = mobileNav.classList.contains('open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    function openMenu() {
      mobileNav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Animate to X
      var spans = hamburger.querySelectorAll('span');
      if (spans[0]) spans[0].style.cssText = 'transform:rotate(45deg) translate(4px,5px);background:#d4af37';
      if (spans[1]) spans[1].style.cssText = 'opacity:0';
      if (spans[2]) spans[2].style.cssText = 'transform:rotate(-45deg) translate(4px,-5px);background:#d4af37';
    }

    function closeMenu() {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // Reset spans
      var spans = hamburger.querySelectorAll('span');
      spans.forEach(function (s) { s.style.cssText = ''; });
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Close when a nav link is clicked
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close when clicking outside the menu
    document.addEventListener('click', function (e) {
      if (mobileNav.classList.contains('open') &&
          !mobileNav.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ── FAQ ACCORDION ──────────────────────────────────────── */
  document.querySelectorAll('.faq__answer').forEach(function (a) {
    a.hidden = true;
  });

  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close all in same list
      var list = btn.closest('.faq__list');
      if (list) {
        list.querySelectorAll('.faq__question').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
          var a = b.nextElementSibling;
          if (a) a.hidden = true;
        });
      }
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        var ans = btn.nextElementSibling;
        if (ans) ans.hidden = false;
      }
    });
  });

  /* ── VALUATION FORM ─────────────────────────────────────── */
  document.querySelectorAll('form.valuation-form').forEach(function (form) {
    // Set Formspree action
    form.setAttribute('action', 'https://formspree.io/f/mnjyjepb');
    form.setAttribute('method', 'POST');

    // Add honeypot if not present
    if (!form.querySelector('input[name="_gotcha"]')) {
      var trap = document.createElement('input');
      trap.type = 'text';
      trap.name = '_gotcha';
      trap.style.display = 'none';
      trap.tabIndex = -1;
      trap.autocomplete = 'off';
      form.appendChild(trap);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate required fields
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#e74c3c';
          field.style.boxShadow = '0 0 0 3px rgba(231,76,60,.15)';
          field.addEventListener('input', function () {
            field.style.borderColor = '';
            field.style.boxShadow = '';
          }, { once: true });
        }
      });
      if (!valid) return;

      var btn = form.querySelector('[type=submit]');
      var origText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Sending&hellip;';
      }

      fetch('https://formspree.io/f/mnjyjepb', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.ok) {
          // Show success
          var success = document.createElement('div');
          success.style.cssText = 'padding:2rem;text-align:center';
          success.innerHTML =
            '<div style="font-size:3rem;margin-bottom:1rem">&#9989;</div>' +
            '<h3 style="font-family:Playfair Display,serif;font-size:1.3rem;color:#f8f7f2;margin-bottom:.75rem">Enquiry Received</h3>' +
            '<p style="font-size:.875rem;color:#aaa;line-height:1.7">' +
            'A consultant will contact you within <strong style="color:#d4af37">2 hours</strong>.<br><br>' +
            'For immediate help: <a href="tel:+442071991698" style="color:#d4af37">020 7199 1698</a> or ' +
            '<a href="https://wa.me/442071991698" style="color:#25D366" target="_blank" rel="noopener">WhatsApp us</a>.' +
            '</p>';
          form.style.display = 'none';
          form.parentNode.appendChild(success);
          if (window.gtag) {
            window.gtag('event', 'form_submit', { event_category: 'Lead', value: 1 });
          }
        } else {
          if (btn) { btn.disabled = false; btn.innerHTML = origText; }
          var msg = (json.errors || []).map(function (e) { return e.message; }).join(', ') ||
                    'Something went wrong. Please try again.';
          alert(msg);
        }
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = origText; }
        alert('Connection error. Please call 020 7199 1698 or WhatsApp us directly.');
      });
    });
  });

  /* ── COOKIE BANNER ──────────────────────────────────────── */
  var banner = document.getElementById('cookieBanner');
  if (banner) {
    if (!localStorage.getItem('rhb_consent')) {
      setTimeout(function () { banner.classList.add('visible'); }, 1800);
    }
    var accept  = document.getElementById('cookieAccept');
    var decline = document.getElementById('cookieDecline');
    if (accept)  accept.addEventListener('click',  function () { localStorage.setItem('rhb_consent', 'all');       banner.classList.remove('visible'); });
    if (decline) decline.addEventListener('click', function () { localStorage.setItem('rhb_consent', 'essential'); banner.classList.remove('visible'); });
  }

  /* ── STAT COUNTERS ──────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target  = parseFloat(el.dataset.count);
        var suffix  = el.dataset.suffix || '';
        var isFloat = String(target).includes('.');
        var dur = 1800;
        var start = performance.now();
        (function tick(now) {
          var p    = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = (isFloat ? (ease * target).toFixed(1) : Math.round(ease * target)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        statObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function (el) { statObs.observe(el); });
  }

  /* ── FADE-UP ON SCROLL ──────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          fadeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.fade-up').forEach(function (el) { fadeObs.observe(el); });
  } else {
    document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('in'); });
  }

  /* ── FOOTER YEAR ────────────────────────────────────────── */
  var fy = document.getElementById('footerYear');
  if (fy) fy.textContent = new Date().getFullYear();

  /* ── SMOOTH SCROLL ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerH - 16,
        behavior: 'smooth'
      });
    });
  });

  /* ── CLICK TRACKING ─────────────────────────────────────── */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.gtag) window.gtag('event', 'phone_click', { event_category: 'Contact' });
    });
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.gtag) window.gtag('event', 'whatsapp_click', { event_category: 'Contact' });
    });
  });

}); // end DOMContentLoaded
