// ==================== Banner Slider ====================
(function () {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  const prevBtn = document.querySelector('.banner-arrow.prev');
  const nextBtn = document.querySelector('.banner-arrow.next');

  if (!slides.length) return;

  let current = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000;

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = index;

    slides[current].classList.add('active');

    // Slide 3 (index 2): black text version
    const titleSvg = document.querySelector('.banner-title-svg');
    const subtitle = document.querySelector('.banner-subtitle');
    if (titleSvg && subtitle) {
      if (current === 2) {
        titleSvg.src = 'images/banner/artzen x1 s-黑.svg';
        subtitle.style.color = 'rgba(0, 0, 0, 0.68)';
        subtitle.style.textShadow = 'none';
      } else {
        titleSvg.src = 'images/banner/artzen x1 s-白.svg';
        subtitle.style.color = 'rgba(255, 255, 255, 0.68)';
        subtitle.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      }
    }

    // Force reset progress bar animation on current dot
    const activeDot = dots[current];
    activeDot.classList.add('active');
    activeDot.style.animation = 'none';
    // Use reflow then clear to restart CSS animation
    void activeDot.offsetHeight;
    activeDot.style.animation = '';
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setTimeout(function tick() {
      next();
      autoplayTimer = setTimeout(tick, AUTOPLAY_INTERVAL);
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      goTo(index);
      startAutoplay();
    });
  });

  // Pause on hover
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    heroBanner.addEventListener('mouseenter', stopAutoplay);
    heroBanner.addEventListener('mouseleave', startAutoplay);
  }

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  if (heroBanner) {
    heroBanner.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroBanner.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
        startAutoplay();
      }
    }, { passive: true });
  }

  // Start autoplay after a short delay to ensure page is ready
  setTimeout(startAutoplay, 100);
})();

// ==================== Header Scroll Effect ====================
(function () {
  const header = document.querySelector('.site-header');
  const productNav = document.querySelector('.product-nav');

  if (!header) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 64) {
      header.classList.add('scrolled');
      if (productNav) productNav.style.top = '40px';
    } else {
      header.classList.remove('scrolled');
      if (productNav) productNav.style.top = '104px';
    }
  }, { passive: true });
})();

// ==================== Scroll Reveal Animation ====================
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.fade-in-up').forEach((el) => {
    observer.observe(el);
  });
})();

// ==================== P3 Scroll-Driven Animation ====================
(function () {
  const section = document.querySelector('.section-p3');
  if (!section) return;

  const lineSvgs = section.querySelectorAll('.p3-line-svg');
  const lineLabels = section.querySelectorAll('.p3-line-label');
  // 三排线的顺序：线条3(顶) → 线条2(中) → 线条1(底)
  const lineEls = [
    { svg: section.querySelector('.p3-line--3 .p3-line-svg'), label: section.querySelector('.p3-line--3 .p3-line-label') },
    { svg: section.querySelector('.p3-line--2 .p3-line-svg'), label: section.querySelector('.p3-line--2 .p3-line-label') },
    { svg: section.querySelector('.p3-line--1 .p3-line-svg'), label: section.querySelector('.p3-line--1 .p3-line-label') },
  ];

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const vh = window.innerHeight;

    // 当 section 顶部到达视窗顶部时 progress=0，滚动到底时 progress=1
    const scrollable = sectionHeight - vh;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));

    lineEls.forEach((el, i) => {
      if (!el.svg || !el.label) return;

      // 每排分段：第 i 排在 progress 的 [i*0.25, (i+1)*0.25] 区间内动画
      const start = i * 0.25;
      const end = start + 0.35;
      const p = Math.max(0, Math.min(1, (progress - start) / (end - start)));
      // easeOutCubic 缓动
      const eased = 1 - Math.pow(1 - p, 3);

      // 线条：clip-path 从 100% → 0%，opacity 从 0 → 1
      el.svg.style.clipPath = 'inset(0 0 0 ' + (100 - eased * 100) + '%)';
      el.svg.style.opacity = eased;

      // 文字标签：translateX 107→0，opacity 0→1
      el.label.style.transform = 'translateX(' + (107 - eased * 107) + 'px)';
      el.label.style.opacity = eased;
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // 初始状态
  update();
})();

// ==================== P4 Animation ====================
(function () {
  const section = document.querySelector('.section-p4');
  const video = section ? section.querySelector('video') : null;
  const headphoneImg = section ? section.querySelector('.p4-headphone-img') : null;
  if (!section || !video || !headphoneImg) return;

  let animated = false;

  // 耳机动画结束后播放视频
  headphoneImg.addEventListener('animationend', function () {
    video.currentTime = 0;
    video.play();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          section.classList.add('p4-animate');
          animated = true;
        }
        // 离开视窗时重置
        if (!entry.isIntersecting && animated) {
          section.classList.remove('p4-animate');
          video.pause();
          video.currentTime = 0;
          headphoneImg.style.opacity = '0';
          headphoneImg.style.transform = 'translateX(200px)';
          animated = false;
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(section);
})();

// ==================== P6 Scroll-Driven Slide ====================
(function () {
  const wrapper = document.querySelector('.section-p6');
  const track = wrapper ? wrapper.querySelector('.p6-track') : null;
  if (!wrapper || !track) return;

  function onScroll() {
    const rect = wrapper.getBoundingClientRect();
    const wrapperHeight = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / wrapperHeight));

    // 从 P6-1 (0) 滑到 P6-2 (-100vw)
    const moveProgress = Math.min(1, progress / 0.85);
    track.style.transform = 'translateX(' + (-moveProgress * 100) + 'vw)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
(function () {
  document.querySelectorAll('.btn-primary, .btn-buy-nav').forEach((btn) => {
    btn.addEventListener('mouseenter', function (e) {
      this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
  });
})();

// ==================== Nav Indicator ====================
(function () {
  const nav = document.querySelector('.header-nav');
  const items = document.querySelectorAll('.nav-item');
  const indicator = document.querySelector('.nav-indicator');
  if (!nav || !indicator || !items.length) return;

  function moveIndicator(el) {
    const navRect = nav.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    indicator.style.left = (itemRect.left - navRect.left) + 'px';
    indicator.style.width = itemRect.width + 'px';
  }

  // Init on active item
  const activeItem = nav.querySelector('.nav-item.active');
  if (activeItem) moveIndicator(activeItem);

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => moveIndicator(item));
  });

  nav.addEventListener('mouseleave', () => {
    const active = nav.querySelector('.nav-item.active');
    if (active) moveIndicator(active);
  });
})();

// ==================== P1 Card Glow Effect ====================
(function () {
  const grid = document.getElementById('p1-cards');
  if (!grid) return;

  grid.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.p1-card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });
})();

// ==================== P2 Color Switcher ====================
(function () {
  const dotsBtn = document.querySelector('.p2-switcher-dots');
  const textBtn = document.querySelector('.p2-switcher-text');
  const textLabel = document.querySelector('.p2-switcher-label');
  const panels = document.querySelectorAll('.p2-panel');
  const dotRings = document.querySelectorAll('.p2-dot-ring');
  const ringCircles = document.querySelectorAll('.p2-progress-ring-circle');
  if (!dotsBtn || !textBtn || !panels.length || !dotRings.length || ringCircles.length < 2) return;

  const CIRCUMFERENCE = 2 * Math.PI * 15; // r=15 → 94.25
  const AUTO_INTERVAL = 5000;
  let currentVariant = 'black';
  let autoTimer = null;
  let animFrameId = null;
  let animStartTime = null;

  function switchVariant(variant, isUserAction) {
    currentVariant = variant;

    // 切换面板
    panels.forEach((p) => {
      p.classList.remove('active');
      if (variant === 'black' && p.classList.contains('p2-panel--black')) {
        p.classList.add('active');
      } else if (variant === 'brown' && p.classList.contains('p2-panel--brown')) {
        p.classList.add('active');
      }
    });

    // 切换 active 状态（控制进度环可见性）
    dotRings.forEach((ring, i) => {
      ring.classList.remove('active', 'selected');
      if (variant === 'black' && i === 0) ring.classList.add('active', 'selected');
      if (variant === 'brown' && i === 1) ring.classList.add('active', 'selected');
    });

    // 重置非活跃环的进度
    ringCircles.forEach((circle, i) => {
      if ((variant === 'black' && i !== 0) || (variant === 'brown' && i !== 1)) {
        circle.style.strokeDashoffset = CIRCUMFERENCE;
      }
    });

    // 更新右侧文字
    if (textLabel) {
      if (variant === 'black') {
        textLabel.textContent = '黑色';
        textLabel.style.color = '#0f0f0f';
      } else {
        textLabel.textContent = '棕色';
        textLabel.style.color = '#b67b4d';
      }
    }

    if (isUserAction) {
      stopAutoplay();
      startAutoplay();
    }
  }

  // ---- 获取当前活跃的 ring circle ----
  function getActiveCircle() {
    return currentVariant === 'black' ? ringCircles[0] : ringCircles[1];
  }

  // ---- Ring animation ----
  function animateRing() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animStartTime = null;
    const circle = getActiveCircle();
    circle.style.strokeDashoffset = CIRCUMFERENCE;

    function tick(now) {
      if (!animStartTime) animStartTime = now;
      const elapsed = now - animStartTime;
      const progress = Math.min(elapsed / AUTO_INTERVAL, 1);
      circle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(tick);
      }
    }

    animFrameId = requestAnimationFrame(tick);
  }

  function stopRingAnimation() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // ---- Autoplay ----
  function autoSwitch() {
    const next = currentVariant === 'black' ? 'brown' : 'black';
    switchVariant(next, false);
    animateRing();
    autoTimer = setTimeout(autoSwitch, AUTO_INTERVAL);
  }

  function startAutoplay() {
    stopAutoplay();
    animateRing();
    autoTimer = setTimeout(autoSwitch, AUTO_INTERVAL);
  }

  function stopAutoplay() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
    stopRingAnimation();
  }

  // ---- Events ----
  dotRings.forEach((ring, i) => {
    ring.addEventListener('click', (e) => {
      e.stopPropagation();
      const variant = i === 0 ? 'black' : 'brown';
      if (variant === currentVariant) return;
      switchVariant(variant, true);
    });
  });

  dotsBtn.addEventListener('click', () => {
    switchVariant('black', true);
  });

  // Start autoplay when section is visible
  const section = document.querySelector('.section-p2');
  if (section) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplay();
          } else {
            stopAutoplay();
            ringCircles.forEach((c) => { c.style.strokeDashoffset = CIRCUMFERENCE; });
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
  }
})();
