/**
 * VIDZA PLAYER — SCROLL EFFECTS & REVEAL CONTROLLER
 * High-performance IntersectionObserver, header state, and statistics counter.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeaderScroll();
  initStickyBottomBar();
  initStatsCounter();
});

/**
 * Reveal elements smoothly on scroll into viewport with luxury fade & blur dissolve
 */
function initScrollReveal() {
  // 1. Auto-apply delay classes to grid children for cascading luxury animations
  const staggeredContainers = [
    '.features-grid',
    '.stats-grid',
    '.faq-grid',
    '.devices-split-grid',
    '.about-stats-strip',
    '.audio-engine-grid',
    '.testimonials-slider'
  ];

  staggeredContainers.forEach(selector => {
    document.querySelectorAll(selector).forEach(container => {
      Array.from(container.children).forEach((child, idx) => {
        if (!child.classList.contains('reveal-init')) {
          child.classList.add('reveal-init');
        }
        const hasExistingDelay = /delay-[1-6]/.test(child.className);
        if (!hasExistingDelay) {
          const delayNum = (idx % 5) + 1;
          child.classList.add(`delay-${delayNum}`);
        }
      });
    });
  });

  const revealElements = document.querySelectorAll('.reveal-init');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('reveal-active'));
    return;
  }

  const isMobile = window.innerWidth <= 768;

  // 2. High-performance observer configured to trigger right as elements enter view
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: isMobile ? 0.05 : 0.08,
    rootMargin: isMobile ? '0px 0px -25px 0px' : '0px 0px -35px 0px'
  });

  // 3. Immediately reveal any elements already in the above-the-fold hero viewport
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      // Element is already visible on screen, reveal with its built-in stagger delay
      requestAnimationFrame(() => {
        el.classList.add('reveal-active');
      });
    } else {
      // Below fold: observe for genuine scroll entry
      observer.observe(el);
    }
  });
}

/**
 * Header styling change on scroll
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Sticky Bottom "Download Now" Bar
 * Appears when scrolling past the hero section
 */
function initStickyBottomBar() {
  const bottomBar = document.getElementById('stickyBottomBar');
  const closeBtn = document.getElementById('bottomBarClose');
  const downloadSection = document.getElementById('install') || document.getElementById('download');

  if (!bottomBar) return;

  let isDismissed = false;

  const handleBottomBarVisibility = () => {
    if (isDismissed) return;

    const scrollY = window.scrollY;
    const heroHeight = 450;
    
    // Check if we are near the bottom download CTA section
    let nearDownloadSection = false;
    if (downloadSection) {
      const rect = downloadSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        nearDownloadSection = true;
      }
    }

    if (scrollY > heroHeight && !nearDownloadSection) {
      bottomBar.classList.remove('bottom-bar-hidden');
      bottomBar.classList.add('bottom-bar-visible');
    } else {
      bottomBar.classList.remove('bottom-bar-visible');
      bottomBar.classList.add('bottom-bar-hidden');
    }
  };

  window.addEventListener('scroll', handleBottomBarVisibility, { passive: true });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDismissed = true;
      bottomBar.classList.remove('bottom-bar-visible');
      bottomBar.classList.add('bottom-bar-hidden');
    });
  }
}

/**
 * Animated statistics numbers counter
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = el.getAttribute('data-target');
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const isNumeric = !isNaN(parseFloat(target));

        if (isNumeric) {
          const finalVal = parseFloat(target);
          let current = 0;
          const duration = 1200;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = finalVal / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= finalVal) {
              current = finalVal;
              clearInterval(timer);
            }
            el.textContent = `${prefix}${Math.round(current)}${suffix}`;
          }, stepTime);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
        }

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => statsObserver.observe(num));
}
