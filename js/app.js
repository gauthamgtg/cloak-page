// Main Application Interactivity
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTableOfContents();
  initCopyCodeButtons();
  initHubFiltering();
  initRoiCalculators();
  initSmoothScroll();
});

// 1. Reading Progress Bar
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

// 2. Table of Contents Active ScrollSpy
function initTableOfContents() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const sections = document.querySelectorAll('.article-content h2, .article-content h3');
  if (tocLinks.length === 0 || sections.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (!id) return;
        
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => {
    if (sec.id) observer.observe(sec);
  });
}

// 3. Copy Code Buttons
function initCopyCodeButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block-wrapper')?.querySelector('pre code');
      if (!codeBlock) return;

      try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        btn.style.background = 'var(--accent-emerald)';
        btn.style.color = '#fff';

        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  });
}

// 4. Blog Hub Filtering & Live Search
function initHubFiltering() {
  const filterButtons = document.querySelectorAll('.cat-btn');
  const searchInput = document.querySelector('.search-input');
  const blogGrid = document.querySelector('.blog-grid');
  
  if (!blogGrid || !window.FINANCE_ARTICLES) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function renderArticles() {
    const filtered = window.FINANCE_ARTICLES.filter(item => {
      const matchesCat = currentCategory === 'all' || item.category.toLowerCase().includes(currentCategory.toLowerCase());
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      blogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(15,23,42,0.4); border-radius: 12px; border: 1px dashed var(--border-subtle);">
          <h3 style="margin-bottom: 8px;">No automation guides found</h3>
          <p style="color: var(--text-muted);">Try adjusting your search query or filter tags.</p>
        </div>
      `;
      return;
    }

    blogGrid.innerHTML = filtered.map(art => `
      <article class="blog-card" data-category="${art.category}">
        <div class="card-img-wrap">
          <span class="badge ${art.badgeType} card-tag">${art.tag}</span>
          ${getCardIconSvg(art.icon)}
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${art.category}</span>
            <span>${art.readTime}</span>
          </div>
          <h3 class="card-title">
            <a href="${art.slug}">${art.title}</a>
          </h3>
          <p class="card-excerpt">${art.excerpt}</p>
          <div class="card-footer">
            <span class="card-author">By ${art.author.name}</span>
            <a href="${art.slug}" class="read-more-link">
              Read Guide
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat') || 'all';
      renderArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderArticles();
    });
  }

  // Initial render
  renderArticles();
}

function getCardIconSvg(iconType) {
  switch(iconType) {
    case 'database':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    case 'cpu':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`;
    case 'code':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    case 'calendar':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    case 'shield':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'globe':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  }
}

// 5. Interactive ROI Savings Calculator
function initRoiCalculators() {
  const calcWrappers = document.querySelectorAll('.roi-calculator-container, .roi-card-wrapper');
  if (calcWrappers.length === 0) return;

  calcWrappers.forEach(wrapper => {
    const txSlider = wrapper.querySelector('#slider-tx') || wrapper.querySelector('.slider-tx');
    const teamSlider = wrapper.querySelector('#slider-team') || wrapper.querySelector('.slider-team');
    const costSlider = wrapper.querySelector('#slider-cost') || wrapper.querySelector('.slider-cost');

    const txVal = wrapper.querySelector('#val-tx') || wrapper.querySelector('.val-tx');
    const teamVal = wrapper.querySelector('#val-team') || wrapper.querySelector('.val-team');
    const costVal = wrapper.querySelector('#val-cost') || wrapper.querySelector('.val-cost');

    const resultSavings = wrapper.querySelector('#roi-annual-savings') || wrapper.querySelector('.roi-annual-savings');
    const resultHours = wrapper.querySelector('#roi-hours-saved') || wrapper.querySelector('.roi-hours-saved');
    const resultCloseDays = wrapper.querySelector('#roi-close-days') || wrapper.querySelector('.roi-close-days');
    const resultAccuracy = wrapper.querySelector('#roi-accuracy') || wrapper.querySelector('.roi-accuracy');

    function calculate() {
      if (!txSlider || !teamSlider) return;

      const monthlyTx = parseInt(txSlider.value, 10);
      const teamSize = parseInt(teamSlider.value, 10);
      const hourlyRate = costSlider ? parseInt(costSlider.value, 10) : 65;

      if (txVal) txVal.innerText = monthlyTx >= 1000 ? `${(monthlyTx / 1000).toFixed(0)}k/mo` : `${monthlyTx}/mo`;
      if (teamVal) teamVal.innerText = `${teamSize} ${teamSize === 1 ? 'person' : 'people'}`;
      if (costVal) costVal.innerText = `$${hourlyRate}/hr`;

      // Formulas:
      // Manual time spent per tx: ~3.5 minutes (0.058 hrs).
      // Automation saves ~92% of manual bookkeeping and reconciliation.
      const monthlyHoursManual = (monthlyTx * 0.058) + (teamSize * 30); // 30 hrs general close ops per team member
      const monthlyHoursSaved = monthlyHoursManual * 0.90;
      const annualHoursSaved = Math.round(monthlyHoursSaved * 12);
      const annualDollarSavings = Math.round(annualHoursSaved * hourlyRate);

      // Close reduction estimate: from ~12 days down to ~2 days
      const daysReduced = Math.min(9, Math.max(5, Math.round(5 + (monthlyTx / 15000))));

      if (resultSavings) resultSavings.innerText = `$${annualDollarSavings.toLocaleString()}`;
      if (resultHours) resultHours.innerText = `${annualHoursSaved.toLocaleString()} hrs`;
      if (resultCloseDays) resultCloseDays.innerText = `-${daysReduced} Days`;
      if (resultAccuracy) resultAccuracy.innerText = `99.8%`;
    }

    [txSlider, teamSlider, costSlider].forEach(slider => {
      if (slider) slider.addEventListener('input', calculate);
    });

    calculate();
  });
}

// 6. Smooth Scroll for Anchor Links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
