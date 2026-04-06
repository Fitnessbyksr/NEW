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

// ── Contact form submission (demo) ──
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sent! Kallum will be in touch.';
    btn.disabled = true;
    btn.style.background = '#28a745';
  });
})();

// ── Results Carousel ──
(function () {
  const carousel = document.querySelector('.results-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  let current = 0;

  function perView() { return window.innerWidth < 640 ? 1 : 2; }
  function totalPages() { return Math.ceil(slides.length / perView()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot' + (i === current ? ' active' : '');
      btn.setAttribute('aria-label', 'Go to page ' + (i + 1));
      btn.addEventListener('click', () => go(i));
      dotsWrap.appendChild(btn);
    }
  }

  function go(n) {
    current = Math.max(0, Math.min(n, totalPages() - 1));
    const viewportWidth = track.parentElement.offsetWidth;
    track.style.transform = 'translateX(-' + (current * viewportWidth) + 'px)';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === totalPages() - 1;
    buildDots();
  }

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  window.addEventListener('resize', () => go(0), { passive: true });

  go(0);
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
