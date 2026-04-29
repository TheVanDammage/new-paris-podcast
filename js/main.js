/* ============================================================
   THE NEW PARIS PODCAST — main.js
   ============================================================ */

// ---- GDPR / CNIL cookie consent for Google Analytics ----
const GA_MEASUREMENT_ID = 'G-9X0PJY922H';
const CONSENT_KEY = 'tnpp_cookie_consent';

window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});

function loadGoogleAnalytics() {
  if (document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function deleteAnalyticsCookies() {
  const domainParts = location.hostname.split('.');
  const domains = [
    location.hostname,
    domainParts.length > 1 ? `.${domainParts.slice(-2).join('.')}` : location.hostname
  ];
  const cookieNames = document.cookie
    .split(';')
    .map(cookie => cookie.trim().split('=')[0])
    .filter(name => name === '_ga' || name.startsWith('_ga_') || name.startsWith('_gid') || name.startsWith('_gat'));

  cookieNames.forEach(name => {
    domains.forEach(domain => {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    });
    document.cookie = `${name}=; Max-Age=0; path=/`;
  });
}

function applyCookieConsent(choice) {
  const granted = choice === 'accepted';

  gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: granted ? 'granted' : 'denied'
  });

  if (granted) loadGoogleAnalytics();
  else deleteAnalyticsCookies();
}

function getSavedConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (error) {
    return null;
  }
}

function saveConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch (error) {
    // If storage is unavailable, keep consent for the current page only.
  }
}

function buildCookieBanner() {
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <p>We use Google Analytics cookies only if you agree, to understand site traffic and improve the podcast website. You can accept, reject, or change your choice later. <a href="privacy.html">Privacy policy</a></p>
    <div class="cookie-actions">
      <button class="cookie-btn reject" type="button" data-cookie-choice="rejected">Reject</button>
      <button class="cookie-btn accept" type="button" data-cookie-choice="accepted">Accept</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelectorAll('[data-cookie-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.cookieChoice;
      saveConsent(choice);
      applyCookieConsent(choice);
      banner.classList.remove('open');
    });
  });

  return banner;
}

const savedConsent = getSavedConsent();
if (savedConsent) applyCookieConsent(savedConsent);

document.addEventListener('DOMContentLoaded', () => {
  const banner = buildCookieBanner();
  if (!savedConsent) banner.classList.add('open');

  document.querySelectorAll('[data-cookie-settings]').forEach(button => {
    button.addEventListener('click', () => banner.classList.add('open'));
  });
});

// ---- Nav: scroll background ----
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Nav: active link highlight ----
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ---- Mobile menu ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Fade-in on scroll ----
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  fadeEls.forEach(el => observer.observe(el));
}

// ---- Episode search & filter (episodes page only) ----
const searchInput  = document.getElementById('episode-search');
const sortSelect   = document.getElementById('episode-sort');
const episodeRows  = document.querySelectorAll('.episode-row');
const noResults    = document.getElementById('no-results');

function filterEpisodes() {
  if (!searchInput || !episodeRows.length) return;

  const query  = searchInput.value.toLowerCase().trim();
  const sort   = sortSelect ? sortSelect.value : 'newest';
  let visible  = 0;

  episodeRows.forEach(row => {
    const text = row.dataset.search || row.textContent.toLowerCase();
    const match = !query || text.includes(query);
    row.classList.toggle('hidden', !match);
    if (match) visible++;
  });

  if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';

  // Re-sort in DOM
  if (sort && episodeRows.length) {
    const list = document.querySelector('.episodes-list');
    if (!list) return;
    const rows = [...list.querySelectorAll('.episode-row')];
    rows.sort((a, b) => {
      const na = parseInt(a.dataset.num || 0);
      const nb = parseInt(b.dataset.num || 0);
      return sort === 'oldest' ? na - nb : nb - na;
    });
    rows.forEach(r => list.appendChild(r));
  }
}

if (searchInput) searchInput.addEventListener('input', filterEpisodes);
if (sortSelect)  sortSelect.addEventListener('change', filterEpisodes);

// ---- Smooth anchor scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 70) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
