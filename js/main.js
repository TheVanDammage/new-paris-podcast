/* ============================================================
   THE NEW PARIS PODCAST — main.js
   ============================================================ */

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
