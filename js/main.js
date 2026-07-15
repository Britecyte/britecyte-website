import { initSectionMotifs } from './section-motifs.js?v=20260710l';
import { initNewsGrid } from './news.js?v=20260710l';

document.addEventListener('DOMContentLoaded', () => {
  initSectionMotifs();
  initNewsGrid();
  initMobileNav();
  initSmoothScroll();
  initScrollReveal();
  initHeaderScroll();
  initContactForm();
  initArticleNav();
  initYear();
  scrollToInitialHash();
});

function initMobileNav() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  const iconPath = toggle?.querySelector('.menu-icon-path');

  const setExpanded = (expanded) => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(expanded));
    nav.classList.toggle('is-open', expanded);
    if (iconPath) {
      iconPath.setAttribute('d', expanded
        ? 'M6 18L18 6M6 6l12 12'
        : 'M4 6h16M4 12h16M4 18h16');
    }
  };

  toggle?.addEventListener('click', () => {
    setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setExpanded(false));
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const targetId = href.slice(hashIndex);
      const pagePath = href.slice(0, hashIndex) || window.location.pathname.split('/').pop() || 'index.html';
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      if (pagePath !== currentPage && pagePath !== '') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function scrollToInitialHash() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView());
  }
}

const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/brighterlives@britecyte.com';

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  const success = document.querySelector('[data-form-success]');
  const error = document.querySelector('[data-form-error]');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultBtnLabel = submitBtn?.textContent?.trim() || 'Send message';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = form.querySelectorAll('input, textarea, select, button');
    fields.forEach((el) => { el.disabled = true; });
    if (success) success.hidden = true;
    if (error) error.hidden = true;
    if (submitBtn) submitBtn.textContent = 'Sending…';

    const subjectField = form.querySelector('[name="subject"]');
    const subjectHidden = form.querySelector('[name="_subject"]');
    if (subjectField instanceof HTMLSelectElement && subjectHidden instanceof HTMLInputElement) {
      const label = subjectField.options[subjectField.selectedIndex]?.text || 'General inquiry';
      subjectHidden.value = `Britecyte website—${label}`;
    }

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      if (!response.ok) throw new Error('Submit failed');

      form.reset();
      if (success) success.hidden = false;
    } catch {
      if (error) error.hidden = false;
    } finally {
      fields.forEach((el) => { el.disabled = false; });
      if (submitBtn) submitBtn.textContent = defaultBtnLabel;
    }
  });
}

function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function initArticleNav() {
  const nav = document.querySelector('[data-article-nav]');
  if (!nav) return;

  const forward = nav.querySelector('[data-article-forward]');
  const prev = nav.querySelector('[data-article-prev]');

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target instanceof Element ? e.target.closest('input, textarea, select, [contenteditable="true"]') : null);
    if (tag) return;

    if (e.key === 'ArrowLeft' && forward?.href) {
      e.preventDefault();
      window.location.assign(forward.href);
    } else if (e.key === 'ArrowRight' && prev?.href) {
      e.preventDefault();
      window.location.assign(prev.href);
    }
  });
}
