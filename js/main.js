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

// ── MailerLite fallback form submission ──
(function () {
  document.querySelectorAll('form[action*="mailerlite"]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form)
        });
        const data = await res.json();
        if (data.success) {
          btn.textContent = '✓ Day 1 is on its way — check your inbox!';
          btn.style.background = '#28a745';
          form.reset();
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      } catch {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  });
})();

// ── Carousels (results + testimonials) ──
(function () {
  document.querySelectorAll('.results-carousel, .testimonials-carousel').forEach(carousel => {
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

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) go(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    window.addEventListener('resize', () => go(0), { passive: true });

    go(0);
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

// ── Sticky CTA button ──
function initStickyCTA() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'contact.html') return;

  const wrap = document.createElement('div');
  wrap.className = 'sticky-cta-btn';
  wrap.innerHTML = '<a href="contact.html">Book free consultation</a>';
  document.body.appendChild(wrap);

  const onScroll = () => {
    const scrolled = window.scrollY > 400;
    const footer = document.querySelector('.footer');
    const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight + 80 : false;
    wrap.classList.toggle('show', scrolled && !nearFooter);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── WhatsApp button ──
function initWhatsApp() {
  const btn = document.createElement('a');
  btn.className = 'whatsapp-fab';
  btn.href = 'https://wa.me/447399799359';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(btn);

  const onScroll = () => {
    const scrolled = window.scrollY > 400;
    const footer = document.querySelector('.footer');
    const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight + 80 : false;
    btn.classList.toggle('show', scrolled && !nearFooter);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Cookie consent banner ──
(function () {
  if (localStorage.getItem('cookieConsent')) {
    initStickyCTA();
    initWhatsApp();
    return;
  }

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<p>This site uses cookies to improve your experience. ' +
    '<a href="privacy-policy.html">Privacy Policy</a>.</p>' +
    '<div class="cookie-banner-btns">' +
    '<button class="cookie-btn-accept">Accept</button>' +
    '<button class="cookie-btn-decline">Decline</button>' +
    '</div>';

  document.body.appendChild(banner);
  requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('visible')));

  function dismiss(accepted) {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
    banner.classList.remove('visible');
    setTimeout(() => { banner.remove(); initStickyCTA(); initWhatsApp(); }, 350);
  }

  banner.querySelector('.cookie-btn-accept').addEventListener('click', () => dismiss(true));
  banner.querySelector('.cookie-btn-decline').addEventListener('click', () => dismiss(false));
})();
