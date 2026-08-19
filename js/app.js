// Health Intelligence & Longevity Platform Interactivity
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTableOfContents();
  initCopyProtocolButtons();
  initHealthHubFiltering();
  initBiologicalAgeCalculators();
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

// 3. Copy Protocol / Routine Buttons
function initCopyProtocolButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block-wrapper')?.querySelector('pre code');
      if (!codeBlock) return;

      try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        const originalText = btn.innerText;
        btn.innerText = 'Protocol Copied!';
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

// 4. Health Hub Filtering & Live Search
function initHealthHubFiltering() {
  const filterButtons = document.querySelectorAll('.cat-btn');
  const searchInput = document.querySelector('.search-input');
  const blogGrid = document.querySelector('.blog-grid');
  
  if (!blogGrid || !window.HEALTH_ARTICLES) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function renderArticles() {
    const filtered = window.HEALTH_ARTICLES.filter(item => {
      const matchesCat = currentCategory === 'all' || item.category.toLowerCase().includes(currentCategory.toLowerCase());
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      blogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(15,23,42,0.4); border-radius: 12px; border: 1px dashed var(--border-subtle);">
          <h3 style="margin-bottom: 8px;">No clinical guides found</h3>
          <p style="color: var(--text-muted);">Try adjusting your search query or selected health topic.</p>
        </div>
      `;
      return;
    }

    blogGrid.innerHTML = filtered.map(art => `
      <article class="blog-card" data-category="${art.category}">
        <div class="card-img-wrap">
          <span class="badge ${art.badgeType} card-tag">${art.tag}</span>
          ${getHealthCardIconSvg(art.icon)}
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

function getHealthCardIconSvg(iconType) {
  switch(iconType) {
    case 'heart':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    case 'activity':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
    case 'apple':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>`;
    case 'moon':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    case 'shield':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'pill':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="1.5"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  }
}

// 5. Interactive Healthspan & Biological Age Calculator
function initBiologicalAgeCalculators() {
  const calcWrappers = document.querySelectorAll('.roi-calculator-container, .roi-card-wrapper');
  if (calcWrappers.length === 0) return;

  calcWrappers.forEach(wrapper => {
    const vo2Slider = wrapper.querySelector('#slider-vo2') || wrapper.querySelector('.slider-vo2');
    const sleepSlider = wrapper.querySelector('#slider-sleep') || wrapper.querySelector('.slider-sleep');
    const stepsSlider = wrapper.querySelector('#slider-steps') || wrapper.querySelector('.slider-steps');

    const vo2Val = wrapper.querySelector('#val-vo2') || wrapper.querySelector('.val-vo2');
    const sleepVal = wrapper.querySelector('#val-sleep') || wrapper.querySelector('.val-sleep');
    const stepsVal = wrapper.querySelector('#val-steps') || wrapper.querySelector('.val-steps');

    const resultBioAge = wrapper.querySelector('#health-bio-age') || wrapper.querySelector('.health-bio-age');
    const resultHealthspan = wrapper.querySelector('#health-healthspan') || wrapper.querySelector('.health-healthspan');
    const resultCvdRisk = wrapper.querySelector('#health-cvd-risk') || wrapper.querySelector('.health-cvd-risk');
    const resultMitoEfficiency = wrapper.querySelector('#health-mito-eff') || wrapper.querySelector('.health-mito-eff');

    function calculate() {
      if (!vo2Slider || !sleepSlider || !stepsSlider) return;

      const vo2 = parseInt(vo2Slider.value, 10); // 25 - 65 ml/kg/min
      const sleepHours = parseFloat(sleepSlider.value); // 5.0 - 9.5 hrs
      const steps = parseInt(stepsSlider.value, 10); // 3000 - 20000 steps

      if (vo2Val) vo2Val.innerText = `${vo2} ml/kg/min`;
      if (sleepVal) sleepVal.innerText = `${sleepHours.toFixed(1)} hrs/night`;
      if (stepsVal) stepsVal.innerText = `${(steps / 1000).toFixed(1)}k steps/day`;

      // Evidence-based physiological modeling:
      // High Vo2 Max (>50) contributes ~3-5 years biological age reversal and up to ~45% CVD reduction.
      // 7.5 - 8.5 hrs optimal sleep adds ~2-3 years.
      // >10k daily steps reduces all-cause mortality significantly.
      const vo2Delta = (vo2 - 35) * 0.18;
      const sleepDelta = Math.max(0, 1 - Math.abs(sleepHours - 8.0)) * 2.2;
      const stepsDelta = (steps - 5000) * 0.00035;

      const totalAgeReversal = Math.max(0.5, Math.min(9.8, (vo2Delta + sleepDelta + stepsDelta)));
      const healthspanExtensionYears = (totalAgeReversal * 1.35).toFixed(1);
      const cvdRiskReduction = Math.min(68, Math.max(15, Math.round((vo2 / 60) * 45 + (steps / 15000) * 20)));

      if (resultBioAge) resultBioAge.innerText = `-${totalAgeReversal.toFixed(1)} Years`;
      if (resultHealthspan) resultHealthspan.innerText = `+${healthspanExtensionYears} Yrs`;
      if (resultCvdRisk) resultCvdRisk.innerText = `-${cvdRiskReduction}%`;
      if (resultMitoEfficiency) resultMitoEfficiency.innerText = `Top ${(100 - Math.min(96, Math.round(vo2 * 1.45)))}%`;
    }

    [vo2Slider, sleepSlider, stepsSlider].forEach(slider => {
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
