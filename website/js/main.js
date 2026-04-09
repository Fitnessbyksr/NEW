/* ============================================================
   FitnessbyKSR — main.js
   ============================================================ */

// ── Navbar scroll shadow ──
(function () {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Mobile menu toggle ──
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('hidden');
    if (open) {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      menu.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ── FAQ accordion ──
(function () {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── Active nav link ──
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Contact form submission ──
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      const res = await fetch('https://formspree.io/f/xpqoekeq', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if (res.ok) {
        btn.textContent = 'Sent! Kallum will be in touch.';
        btn.style.background = '#28a745';
        form.reset();
      } else {
        btn.textContent = 'Something went wrong — please email directly.';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Something went wrong — please email directly.';
      btn.disabled = false;
    }
  });
})();

// ── Intersection Observer for fade-in ──
(function () {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.card, .testimonial-card, .blog-card, .timeline-item');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();
