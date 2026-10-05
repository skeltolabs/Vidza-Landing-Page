/**
 * VIDZA PLAYER — MAIN APPLICATION LOGIC & LEGAL CONTROLLERS
 * Theme toggler, 3-Step Stair Menu, Device switcher, Showcase tabs, Install modal, and Legal Reader.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStairMenu();
  initDeviceSwitcher();
  initFeatureFilters();
  initEcosystemTabs();
  initShowcaseTabs();
  initFaqAccordion();
  initFaqFilters();
  initInstallModals();
  initLegalReader();
  initSmoothScroll();
  initContactForm();
  initContentProtection();
});

/**
 * 1. Theme Toggler (Dark Obsidian <-> Light Mode)
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const drawerToggleBtn = document.getElementById('drawerThemeToggleBtn');
  const icon = document.getElementById('themeToggleIcon');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('vidza_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark');
  
  applyTheme(initialTheme);

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('vidza_theme', theme);
    
    const isLight = theme === 'light';
    const iconName = isLight ? 'dark_mode' : 'light_mode';
    if (icon) icon.textContent = iconName;

    if (drawerToggleBtn) {
      const drawerIcon = drawerToggleBtn.querySelector('.material-symbols-rounded');
      if (drawerIcon) drawerIcon.textContent = iconName;
    }
  }

  function toggle() {
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggle);
  if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', toggle);
}

/**
 * 2. 3-Step Staircase Menu Drawer
 */
function initStairMenu() {
  const openBtn = document.getElementById('stairMenuBtn');
  const drawerOverlay = document.getElementById('stairDrawerOverlay');
  const closeBtn = document.getElementById('stairDrawerClose');
  const navAnchors = document.querySelectorAll('.stair-nav-anchor');

  if (!openBtn || !drawerOverlay) return;

  const openDrawer = () => {
    drawerOverlay.classList.add('active');
    document.body.classList.add('stair-menu-open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawerOverlay.classList.remove('active');
    document.body.classList.remove('stair-menu-open');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerOverlay.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * 3. Hero Device Switcher & Smooth Gesture/Roller Zoom System
 *    (All Screens / Android TV / Smartphone with Center Glide, Mouse Wheel Roller & Pinch-to-Zoom)
 */
function initDeviceSwitcher() {
  const tabBtns = document.querySelectorAll('.device-tab-btn');
  const showcase = document.getElementById('heroDevicesShowcase');
  const tvWrap = document.getElementById('heroTvWrap');
  const phoneWrap = document.getElementById('heroPhoneWrap');

  if (!tabBtns.length || !showcase) return;

  function setDeviceView(targetDevice) {
    tabBtns.forEach(b => {
      const isMatch = b.getAttribute('data-device') === targetDevice;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    showcase.classList.remove('view-both', 'view-tv', 'view-phone');
    showcase.classList.add(`view-${targetDevice}`);
  }

  // 1. Tab buttons click listener (Smooth Glide to Middle & Center)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetDevice = btn.getAttribute('data-device');
      setDeviceView(targetDevice);
    });
  });

  // 2. Direct click/tap on devices to focus and center them smoothly
  if (phoneWrap) {
    phoneWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (showcase.classList.contains('view-phone')) {
        setDeviceView('both');
      } else {
        setDeviceView('phone');
      }
    });
  }

  if (tvWrap) {
    tvWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (showcase.classList.contains('view-tv')) {
        setDeviceView('both');
      } else {
        setDeviceView('tv');
      }
    });
  }

  // 3. Smooth Zoom System (Mouse Wheel Roller on Desktop & Touch Pinch on Mobile)
  let currentZoom = 1.0;
  const minZoom = 0.65;
  const maxZoom = 1.85;

  function updateZoom(newZoom) {
    currentZoom = Math.min(maxZoom, Math.max(minZoom, Math.round(newZoom * 100) / 100));
    showcase.style.setProperty('--hero-zoom', currentZoom);
  }

  // Desktop Up and Down Mouse Wheel Roller Zoom
  showcase.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Rolling up (deltaY < 0) zooms in, rolling down (deltaY > 0) zooms out
    const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
    updateZoom(currentZoom + zoomStep);
  }, { passive: false });

  // Mobile / Touch 2-Finger Pinch-to-Zoom & Double-Tap
  let initialPinchDist = 0;
  let initialZoomOnPinch = 1.0;
  let lastTouchTapTime = 0;

  showcase.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialZoomOnPinch = currentZoom;
    }
  }, { passive: true });

  showcase.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDist / initialPinchDist;
      updateZoom(initialZoomOnPinch * scale);
    }
  }, { passive: false });

  showcase.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDist = 0;
    }

    // Double tap on mobile to zoom in / reset
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      const now = Date.now();
      if (now - lastTouchTapTime < 320) {
        if (currentZoom > 1.05) {
          updateZoom(1.0);
        } else {
          updateZoom(1.35);
        }
        lastTouchTapTime = 0;
      } else {
        lastTouchTapTime = now;
      }
    }
  }, { passive: true });

  // Desktop Double-Click to Toggle Zoom
  showcase.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (currentZoom > 1.05) {
      updateZoom(1.0);
    } else {
      updateZoom(1.35);
    }
  });
}

/**
 * 3B. Feature Category Filters ("Built for Cinephiles & Audiophiles")
 */
function initFeatureFilters() {
  const filterBtns = document.querySelectorAll('.feature-filter-btn');
  const featureCards = document.querySelectorAll('.feature-card');

  if (!filterBtns.length || !featureCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-feature-cat');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      featureCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 3C. Mobile Device Ecosystem Tab Switcher
 */
function initEcosystemTabs() {
  const ecoBtns = document.querySelectorAll('.device-cat-btn');
  const cardPhone = document.getElementById('deviceCardPhone');
  const cardTv = document.getElementById('deviceCardTv');

  if (!ecoBtns.length || !cardPhone || !cardTv) return;

  ecoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-device-target');

      ecoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'tv') {
        cardTv.classList.add('active-device-card');
        cardPhone.classList.remove('active-device-card');
      } else {
        cardPhone.classList.add('active-device-card');
        cardTv.classList.remove('active-device-card');
      }
    });
  });
}

/**
 * 4. Interactive Screenshot Showcase Tabs
 */
const showcaseData = {
  player: {
    title: 'Cinematic 4K HDR Touch Player',
    desc: 'Powered by Media3 and custom FFmpeg decoders. Enjoy gesture-based HUD for instant brightness and volume control up to 200%, pinch-to-zoom, and frame-accurate seek.',
    img: 'assets/images/phone_player.webp',
    features: [
      'Dual edge vertical gestures: Brightness (left) & Volume (right)',
      'Hardware-accelerated HDR10, Dolby Vision & 10-bit color decoding',
      'Format pill badges: 4K UHD, MKV, HEVC, 16:9, Multi-Audio',
      'Pinch-to-zoom: Fit, Stretch, 100% Original, or Crop-to-Fill'
    ]
  },
  color: {
    title: 'Real-Time Color & Picture Tuning',
    desc: 'Fine-tune every visual nuance of your movies with in-pipeline ColorMatrix hardware acceleration. Adjust Brightness, Contrast, Saturation, Vibrance, Warmth, and Sharpness with real-time preview, or instantly switch between 8 handcrafted cinematic presets.',
    img: 'assets/images/phone_color_adjust.webp',
    features: [
      '6 precision color sliders: Brightness, Contrast, Saturation, Vibrance, Warmth & Sharpness',
      '8 cinematic picture presets: Vivid HDR, AMOLED Deep, Cinematic Warm, Film Noir, Cyberpunk',
      'Zero-latency ColorMatrix rendering with direct GPU acceleration',
      'Independent profile saving: Retains preferred picture tuning per video format'
    ]
  },
  stream: {
    title: 'Direct Network Stream & URL Playback',
    desc: 'Stream any online video, live HLS / DASH broadcast, or direct media URL instantly with hardware-accelerated playback and custom HTTP headers support.',
    img: 'assets/images/stream.webp',
    features: [
      'Instant playback of HTTP, HTTPS, HLS (m3u8), and DASH network streams',
      'Hardware decoding pipeline with adaptive bitrate switching',
      'Custom user-agent and stream header configuration',
      'Seamless resume and stream bookmarking directly in your history'
    ]
  },
  night: {
    title: 'Sub-Zero Night Mode & Eye Comfort',
    desc: 'Enjoy late-night cinematic viewing in complete darkness without eye fatigue. Sub-zero software dimming lowers brightness below Android\'s hardware limit, combined with an adjustable warm amber filter.',
    img: 'assets/images/night mode and dimness.webp',
    features: [
      'Sub-zero brightness dimmer: Lowers luminance beyond Android system hardware minimum',
      'Eye Comfort Warm Shield: Calibrated amber temperature to eliminate blue light strain',
      'AMOLED Pure Black: Zero-pixel illumination on OLED displays for maximum battery life',
      'Instant bedtime toggle: One-tap sleep timer and night mode directly from the player HUD'
    ]
  },
  equalizer: {
    title: '5-Band Precision Graphic Equalizer',
    desc: 'Custom in-pipeline Media3 32-bit floating point PCM audio processor. Features 5 calibrated frequency bands (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz), Bass Boost, 3D Virtualizer, and an anti-clipping limiter.',
    img: 'assets/images/phone_equalizer.webp',
    features: [
      '5 calibrated frequency bands: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz',
      'Sub-bass boost knob with non-distorting hardware limiter',
      'Loudness booster up to +200% for quiet movie dialogues',
      'Instant audio delay adjustment (-5000ms to +5000ms)'
    ]
  },
  library: {
    title: 'Intelligent Media Library & Folders',
    desc: 'Organize your entire media collection automatically. Instant folder scanning, Continue Watching history cards, and quick search with zero lag.',
    img: 'assets/images/phone_library.webp',
    features: [
      'Continue Watching carousel with resume position memory',
      'Automatic categorization: Videos, Music, Folders, Playlists',
      'Rich metadata tags: Duration, Resolution, File Size, Codec',
      '100% private: All data stays strictly on your local device'
    ]
  },
  lyrics: {
    title: 'Synchronized Karaoke Lyrics Studio',
    desc: 'Transform your audio listening into a visual karaoke studio. VIDZA auto-detects embedded and external .lrc lyrics, synchronizing glowing highlighted lines to millisecond playback timestamps with customizable typography.',
    img: 'assets/images/phone_lyrics.webp',
    features: [
      'Real-time auto-scrolling synced lyrics with purple-to-red neon active line glow',
      'Full support for embedded ID3 tags, local .lrc files, and online lyric search',
      'Microsecond offset timing calibration (±ms delay) for flawless vocal sync',
      'Customizable lyrics typography, auto-scrolling speed, and background blur effects'
    ]
  },
  tv: {
    title: 'Native Android TV Interface',
    desc: 'Crafted specifically for your living room television. Effortless D-pad remote navigation, glowing focus indicators, and minimal cinematic design.',
    img: 'assets/images/tv_preview.webp',
    features: [
      'Complete remote control compatibility (DPAD & Media keys)',
      'Luxury focus border with elevation and subtle glow',
      'Unified APK: One single install for both Phone and Android TV',
      'Zero clutter: Content-first landscape layout tailored for 4K TVs'
    ]
  }
};

function initShowcaseTabs() {
  const tabs = Array.from(document.querySelectorAll('.showcase-tab-btn'));
  const titleEl = document.getElementById('showcaseTitle');
  const descEl = document.getElementById('showcaseDesc');
  const listEl = document.getElementById('showcaseList');
  const imgEl = document.getElementById('showcaseImg');
  const currentIndexEl = document.getElementById('showcaseCurrentIndex');
  const totalCountEl = document.getElementById('showcaseTotalCount');
  const prevBtn = document.getElementById('showcasePrevBtn');
  const nextBtn = document.getElementById('showcaseNextBtn');
  const dotsContainer = document.getElementById('showcaseDots');
  const previewFrame = document.getElementById('showcasePreviewFrame');

  if (!tabs.length || !titleEl || !imgEl) return;

  const tabKeys = tabs.map(tab => tab.getAttribute('data-tab'));
  if (totalCountEl) totalCountEl.textContent = tabKeys.length;

  let currentIndex = 0;

  function switchTab(index) {
    if (index < 0) index = tabKeys.length - 1;
    if (index >= tabKeys.length) index = 0;
    currentIndex = index;

    const key = tabKeys[currentIndex];
    const data = showcaseData[key];
    if (!data) return;

    // 1. Update tab active state and auto-center
    tabs.forEach((t, i) => {
      if (i === currentIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        t.classList.remove('active');
      }
    });

    // 2. Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    // 3. Update counter
    if (currentIndexEl) currentIndexEl.textContent = currentIndex + 1;

    // 4. Update title, desc, and feature chips
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;

    listEl.innerHTML = '';
    data.features.forEach(feat => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="material-symbols-rounded">check_circle</span><span>${feat}</span>`;
      listEl.appendChild(li);
    });

    // 5. Crossfade image & adapt layout for TV
    imgEl.classList.add('fade-out');
    if (previewFrame && previewFrame.parentElement) {
      if (key === 'tv') {
        previewFrame.parentElement.classList.add('is-tv');
      } else {
        previewFrame.parentElement.classList.remove('is-tv');
      }
    }
    setTimeout(() => {
      imgEl.src = data.img;
      imgEl.alt = data.title;
      imgEl.classList.remove('fade-out');
    }, 120);
  }

  // Tab click listeners
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(index));
  });

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTab(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTab(currentIndex + 1);
    });
  }

  // Dot click listeners
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTab(index);
      });
    });
  }

  // Touch Swipe on mobile (entire showcase display area)
  const swipeTarget = document.querySelector('.showcase-display-area') || previewFrame;
  if (swipeTarget) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    swipeTarget.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].screenX;
        touchStartY = e.touches[0].screenY;
      }
    }, { passive: true });

    swipeTarget.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Ensure horizontal swipe is dominant and at least 35px
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
          if (deltaX < 0) {
            // Swiped left -> Next screen
            switchTab(currentIndex + 1);
          } else {
            // Swiped right -> Previous screen
            switchTab(currentIndex - 1);
          }
        }
      }
    }, { passive: true });
  }
}

/**
 * 5. FAQ Accordion & Category Filtering
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  // Initialize initial active item's maxHeight if one is active on load
  const initialActive = document.querySelector('.faq-item.active');
  if (initialActive) {
    const initialAns = initialActive.querySelector('.faq-answer');
    if (initialAns) {
      initialAns.style.maxHeight = initialAns.scrollHeight + 'px';
    }
  }

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items for a clean single-accordion focus
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherQ = other.querySelector('.faq-question');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Re-adjust open accordion height on window resize to prevent text clipping
  window.addEventListener('resize', () => {
    const activeItem = document.querySelector('.faq-item.active');
    if (activeItem) {
      const ans = activeItem.querySelector('.faq-answer');
      if (ans) {
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    }
  });
}

function initFaqFilters() {
  const filterBtns = document.querySelectorAll('.faq-filter-btn');
  const faqItems = document.querySelectorAll('.faq-item');
  if (!filterBtns.length || !faqItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

      // Filter items
      let firstVisible = null;
      faqItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        const isMatch = filter === 'all' || itemCat === filter;

        if (isMatch) {
          item.style.display = 'block';
          item.style.opacity = '1';
          if (!firstVisible) firstVisible = item;
        } else {
          item.style.display = 'none';
          item.classList.remove('active');
          const q = item.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
          const a = item.querySelector('.faq-answer');
          if (a) a.style.maxHeight = null;
        }
      });

      // Automatically open the first visible question in the filtered tab
      if (firstVisible && !document.querySelector('.faq-item.active[style*="display: block"]')) {
        firstVisible.classList.add('active');
        const q = firstVisible.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'true');
        const a = firstVisible.querySelector('.faq-answer');
        if (a) {
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      }
    });
  });
}

/**
 * 6. Install Modal & Image Lightbox
 */
function initInstallModals() {
  const installBtns = document.querySelectorAll('.trigger-install-modal');
  const modal = document.getElementById('installModal');
  const closeBtn = document.getElementById('installModalClose');

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  installBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Disabled store buttons prevent hash navigation
  modal.querySelectorAll('.store-btn.store-disabled').forEach(btn => {
    btn.addEventListener('click', (e) => e.preventDefault());
  });

  // Lightbox for screenshot preview
  const showcasePreview = document.querySelector('.showcase-preview-frame');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (showcasePreview && lightboxModal && lightboxImg) {
    showcasePreview.addEventListener('click', () => {
      const srcImg = showcasePreview.querySelector('img');
      if (srcImg) {
        lightboxImg.src = srcImg.src;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }
}

/**
 * 7. Play Store Approval Legal Documents Viewer Modal
 */
const legalDocs = {
  'privacy-overview': {
    title: 'Privacy Policy — Overview',
    content: `
      <h4>1. Introduction & Commitment</h4>
      <p>VIDZA Player, developed by SkeltoLabs, is committed to safeguarding user privacy. This policy outlines our zero-data collection architecture designed to comply with the Google Play Developer Distribution Agreement, EU General Data Protection Regulation (GDPR), and California Consumer Privacy Act (CCPA).</p>
      
      <h4>2. Zero Personal Data Collection</h4>
      <p>VIDZA Player does not collect, harvest, transmit, or share any personal information, location data, device identifiers (IMEI/Android ID), or contact lists. The application operates entirely offline on the user's local hardware.</p>

      <h4>3. No Third-Party Tracking SDKs</h4>
      <p>VIDZA Player contains NO third-party advertising networks, analytics tracking services, behavioral profilers, or marketing SDKs. We do not sell or monetize user data.</p>
    `
  },
  'privacy-data': {
    title: 'Privacy Policy — Data Retention',
    content: `
      <h4>1. Local Storage of App Preferences</h4>
      <p>All playback history, resume playback timestamps, equalizer preferences, and playlist queues are stored strictly on the device using Android's private <code>SharedPreferences</code> and room database. These records never leave your local device.</p>

      <h4>2. Clearing App Data</h4>
      <p>Users can permanently wipe all cached media metadata, watch history, and player preferences at any time through the in-app Settings ("Clear All Watch History") or via Android System Settings &gt; Apps &gt; VIDZA Player &gt; Storage &gt; Clear Storage.</p>
    `
  },
  'privacy-permissions': {
    title: 'Privacy Policy — Android Permissions Disclosure',
    content: `
      <p>In accordance with Google Play's User Data and Sensitive Permissions policies, VIDZA Player strictly requests only permissions vital for offline audio and video playback:</p>
      <ul>
        <li><strong>READ_MEDIA_VIDEO &amp; READ_MEDIA_AUDIO (Android 13+) / READ_EXTERNAL_STORAGE:</strong> Required solely to index, list, and decode audio and video files stored on local device storage and SD cards.</li>
        <li><strong>POST_NOTIFICATIONS:</strong> Required on Android 13+ to display ongoing media playback controls (Play, Pause, Skip) in the notification shade and lockscreen.</li>
        <li><strong>FOREGROUND_SERVICE &amp; FOREGROUND_SERVICE_MEDIA_PLAYBACK:</strong> Allows continuous audio playback and background listening when the user minimizes the app or turns off the screen.</li>
        <li><strong>WAKE_LOCK:</strong> Prevents the screen from dimming or turning off during active video playback.</li>
        <li><strong>INTERNET:</strong> Utilized strictly when the user explicitly provides a remote stream URL (SMB, WebDAV, HLS, DASH, RTSP) or requests network streaming. No background telemetry or analytics traffic is transmitted.</li>
      </ul>
    `
  },
  'privacy-storage': {
    title: 'Privacy Policy — Local Storage & Security',
    content: `
      <h4>1. Storage Access Framework (SAF) Compliance</h4>
      <p>VIDZA Player implements Android's modern Storage Access Framework and scoped MediaStore APIs. It does not access private files belonging to other applications.</p>

      <h4>2. ZIP-Slip & Path Traversal Protections</h4>
      <p>When extracting external subtitle archives (.zip), VIDZA enforces canonical path validation to prevent unauthorized directory traversal attacks, ensuring system security.</p>
    `
  },
  'terms-usage': {
    title: 'Terms of Service — User Agreement',
    content: `
      <h4>1. Acceptance of Terms</h4>
      <p>By downloading, installing, or using VIDZA Player, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not install or use the application.</p>

      <h4>2. Scope of Utility</h4>
      <p>VIDZA Player is an offline media playback tool designed to decode local multimedia files. SkeltoLabs grants users a personal, non-exclusive, non-transferable, revocable license to use the application in accordance with applicable laws.</p>
    `
  },
  'terms-license': {
    title: 'Terms of Service — License & Distribution',
    content: `
      <h4>1. Intellectual Property</h4>
      <p>The VIDZA Player software, logo, design system, and proprietary audio processing algorithms are the intellectual property of SkeltoLabs. Users may not reverse-engineer, decompile, or modify proprietary application binaries except where permitted under open-source licenses.</p>

      <h4>2. Commercial Use</h4>
      <p>This software is provided free of charge for personal and non-commercial media playback.</p>
    `
  },
  'terms-liability': {
    title: 'Terms of Service — Limitation of Liability',
    content: `
      <h4>1. "As-Is" Provision</h4>
      <p>VIDZA Player is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied, including fitness for a particular purpose or non-infringement.</p>

      <h4>2. Damage Limitation</h4>
      <p>To the maximum extent permitted by applicable law, SkeltoLabs shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the application or hardware speaker performance under excessive loudness settings.</p>
    `
  },
  'terms-termination': {
    title: 'Terms of Service — Termination',
    content: `
      <p>These terms remain effective until terminated by either party. Users may terminate this agreement at any time by uninstalling VIDZA Player and deleting all copies from their devices. SkeltoLabs reserves the right to modify or discontinue updates without prior notice.</p>
    `
  },
  'disclaimer-content': {
    title: 'Usage Disclaimer — No Hosted Media',
    content: `
      <h4>Important Notice Regarding Content</h4>
      <p><strong>VIDZA Player does not host, provide, broadcast, scrape, or distribute any video or audio files, television streams, or media links.</strong></p>
      <p>VIDZA Player is strictly a playback client and media viewer. All multimedia content played through VIDZA must be legally supplied by the user from their own local storage, personal home server, or authorized streams.</p>
    `
  },
  'disclaimer-copyright': {
    title: 'Usage Disclaimer — Copyright Compliance',
    content: `
      <p>SkeltoLabs respects intellectual property rights and adheres to the Digital Millennium Copyright Act (DMCA). We do not condone or facilitate the unauthorized playback or distribution of copyrighted material.</p>
      <p>Users are exclusively responsible for verifying that their media files and stream URLs comply with applicable local and international copyright laws.</p>
    `
  },
  'disclaimer-network': {
    title: 'Usage Disclaimer — Network Streams',
    content: `
      <p>When using network playback features (SMB, WebDAV, RTSP, HLS, DASH), all network traffic passes directly between your device and your designated network host. VIDZA does not operate proxy servers, cache user streams, or monitor network payloads.</p>
    `
  },
  'disclaimer-safety': {
    title: 'Usage Disclaimer — Audio Safety Warning',
    content: `
      <p>VIDZA Player includes an optional software audio booster capable of elevating volume levels up to 200%. Extended listening at high volume levels can result in permanent hearing damage and may overdrive small device speakers. Users are advised to listen responsibly.</p>
    `
  },
  'oss-media3': {
    title: 'Open Source — AndroidX Media3 & ExoPlayer',
    content: `
      <h4>AndroidX Media3 / ExoPlayer</h4>
      <p>Licensed under the Apache License, Version 2.0 (the "License"). You may obtain a copy of the License at <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener" style="color: var(--red-primary);">https://www.apache.org/licenses/LICENSE-2.0</a>.</p>
      <p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.</p>
    `
  },
  'oss-ffmpeg': {
    title: 'Open Source — FFmpeg Multimedia Framework',
    content: `
      <h4>FFmpeg Audio & Video Decoders</h4>
      <p>VIDZA Player utilizes compiled FFmpeg libraries licensed under the GNU Lesser General Public License (LGPL), version 2.1 or later. FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.</p>
      <p>In accordance with the LGPL, users may request the exact corresponding source code, build scripts, and compilation flags by contacting <a href="mailto:vidza@skeltolabs.com?subject=LGPL%20Source%20Code%20Request%20-%20VIDZA%20Player" style="color: var(--red-primary); font-weight: 700;">vidza@skeltolabs.com</a>.</p>
    `
  },
  'oss-compose': {
    title: 'Open Source — Jetpack Compose',
    content: `
      <h4>Android Jetpack Compose & Material 3</h4>
      <p>Copyright (c) The Android Open Source Project. Licensed under the Apache License, Version 2.0. Used for rendering reactive modern user interfaces on Android Phone and TV.</p>
    `
  },
  'oss-licenses': {
    title: 'Open Source — Third-Party Notices',
    content: `
      <h4>Additional Open Source Components:</h4>
      <ul>
        <li><strong>Coil (Async Image Loading for Kotlin):</strong> Licensed under the Apache License, Version 2.0.</li>
        <li><strong>Kotlinx Coroutines:</strong> Licensed under the Apache License, Version 2.0.</li>
        <li><strong>Material Symbols:</strong> Designed by Google and licensed under the Apache License, Version 2.0.</li>
      </ul>
    `
  }
};

function initLegalReader() {
  const legalBtns = document.querySelectorAll('.footer-legal-btn');
  const legalModal = document.getElementById('legalModal');
  const modalTitle = document.getElementById('legalModalTitle');
  const modalContent = document.getElementById('legalModalContent');
  const closeBtn = document.getElementById('legalModalClose');

  if (!legalModal || !modalTitle || !modalContent) return;

  const openDoc = (key) => {
    const doc = legalDocs[key] || legalDocs['privacy-overview'];
    modalTitle.textContent = doc.title;
    modalContent.innerHTML = doc.content;
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDoc = () => {
    legalModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  legalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-legal');
      openDoc(key);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDoc);

  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) closeDoc();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal.classList.contains('active')) {
      closeDoc();
    }
  });
}

/**
 * 8. Smooth Anchor Scroll
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 9. Contact Form Interaction & Status Feedback
 */
function initContactForm() {
  // Handled directly inside contact.html for async backend submission and in-page success state
}

/**
 * 10. Anti-Copy & Anti-Long-Press Protection
 * Completely restricts copying text, cutting, right-clicking, and mobile long-press context menus,
 * while safely keeping contact form inputs and textareas fully functional.
 */
function initContentProtection() {
  function isFormInput(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  // Prevent right-click and mobile long-press context menu
  document.addEventListener('contextmenu', (e) => {
    if (isFormInput(e.target)) return;
    e.preventDefault();
  }, { capture: true, passive: false });

  // Prevent clipboard copy
  document.addEventListener('copy', (e) => {
    if (isFormInput(e.target)) return;
    e.preventDefault();
  }, { capture: true, passive: false });

  // Prevent clipboard cut
  document.addEventListener('cut', (e) => {
    if (isFormInput(e.target)) return;
    e.preventDefault();
  }, { capture: true, passive: false });

  // Prevent drag-to-select and image dragging
  document.addEventListener('dragstart', (e) => {
    if (isFormInput(e.target)) return;
    e.preventDefault();
  }, { capture: true, passive: false });

  // Prevent keyboard shortcuts (Ctrl+C, Ctrl+U, Ctrl+S, Cmd+C, Cmd+U, Cmd+S)
  document.addEventListener('keydown', (e) => {
    if (isFormInput(e.target)) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    }
  }, { capture: true });

  // Clear accidental selection handles and copy prompts on mobile touch
  document.addEventListener('selectionchange', () => {
    if (isFormInput(document.activeElement)) return;
    const sel = window.getSelection ? window.getSelection() : null;
    if (sel && sel.removeAllRanges && sel.toString().length > 0) {
      sel.removeAllRanges();
    }
  });

  document.addEventListener('touchstart', (e) => {
    if (isFormInput(e.target)) return;
    const sel = window.getSelection ? window.getSelection() : null;
    if (sel && sel.removeAllRanges && sel.toString().length > 0) {
      sel.removeAllRanges();
    }
  }, { passive: true });
}

/**
 * 11. Feature Category Filter Pills
 * Filters the 12 feature cards by category (all / audio / video / core / privacy).
 * Works on both desktop and mobile — cards fade/hide instantly on pill click.
 */
function initFeatureFilters() {
  const filterBtns = document.querySelectorAll('.feature-filter-btn');
  const featureCards = document.querySelectorAll('#featuresGrid .feature-card');

  if (!filterBtns.length || !featureCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-feature-cat');

      // Update active pill
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide cards
      featureCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        const show = cat === 'all' || cardCat === cat;
        card.style.display = show ? '' : 'none';
        card.style.opacity = show ? '1' : '0';
      });
    });
  });
}

/**
 * 12. Ecosystem Tabs (Mobile device-category switcher in #devices section)
 * Switches between "Smartphone" and "Android TV" device category cards on mobile.
 */
function initEcosystemTabs() {
  const tabBtns = document.querySelectorAll('.device-cat-btn');
  const deviceCards = document.querySelectorAll('.device-category-card');

  if (!tabBtns.length || !deviceCards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-device-cat');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      deviceCards.forEach(card => {
        const cardType = card.getAttribute('data-device-type');
        card.style.display = (target === 'all' || cardType === target || !cardType) ? '' : 'none';
      });
    });
  });
}

