/* =========================================================================
   MINECRAFT JAVA EDITION — FAN SHOWCASE
   main.js — loader, cursor, navbar, parallax, reveal animations,
             gallery lightbox, audio, back-to-top
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     0. PHOTO SLOT PLACEHOLDERS — show a clean "add photo here" box
        instead of a broken-image icon when a screenshot hasn't been
        added to /images yet.
  --------------------------------------------------------------------- */
  document.querySelectorAll('.photo-slot img').forEach(img => {
    const slot = img.closest('.photo-slot');
    if (img.complete && img.naturalWidth === 0) {
      slot.classList.add('slot-empty');
    }
    img.addEventListener('error', () => slot.classList.add('slot-empty'));
    img.addEventListener('load', () => slot.classList.remove('slot-empty'));
  });

  /* ---------------------------------------------------------------------
     1. LOADING SCREEN
  --------------------------------------------------------------------- */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderStatus = document.getElementById('loaderStatus');

  const loadingSteps = [
    { pct: 20, label: 'Loading terrain...' },
    { pct: 45, label: 'Generating biomes...' },
    { pct: 68, label: 'Spawning entities...' },
    { pct: 88, label: 'Building world...' },
    { pct: 100, label: 'Entering world...' }
  ];

  let stepIndex = 0;
  let currentPct = 0;

  function runLoader() {
    if (stepIndex >= loadingSteps.length) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initRevealObserver();     // start reveal animations only once loader is gone
        revealHeroContent();
      }, 350);
      return;
    }
    const target = loadingSteps[stepIndex];
    loaderStatus.textContent = target.label;

    const tick = setInterval(() => {
      currentPct += 2;
      loaderFill.style.width = Math.min(currentPct, target.pct) + '%';
      if (currentPct >= target.pct) {
        clearInterval(tick);
        stepIndex++;
        setTimeout(runLoader, 180);
      }
    }, 16);
  }

  document.body.style.overflow = 'hidden';
  setTimeout(runLoader, 400);

  /* ---------------------------------------------------------------------
     2. (custom cursor removed — using default OS/browser cursor)
  --------------------------------------------------------------------- */
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------------
     3. NAVBAR — solid on scroll + active section highlight + mobile menu
  --------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main > section, .hero');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightActiveSection();
    toggleBackToTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  navLinkEls.forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  function highlightActiveSection() {
    let current = 'home';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        current = sec.id;
      }
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* ---------------------------------------------------------------------
     4. SMOOTH SCROLL for in-page anchors
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 70;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------------------------------------------------------------------
     5. HERO — floating particles + parallax
  --------------------------------------------------------------------- */
  const particleContainer = document.getElementById('heroParticles');
  const PARTICLE_COUNT = 46;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'particle' + (Math.random() > 0.7 ? ' leaf' : '');
    const size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = (Math.random() * 10 + 10) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    particleContainer.appendChild(p);
  }

  const heroBg = document.getElementById('heroBg');
  const heroContent = document.querySelector('.hero-content');
  let ticking = false;

  function parallax() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
      heroContent.style.transform = `translateY(${scrollY * 0.18}px)`;
      heroContent.style.opacity = Math.max(1 - scrollY / 600, 0);
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(parallax);
      ticking = true;
    }
  }, { passive: true });

  // subtle mouse-based parallax on hero
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    if (isTouchDevice) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 14;
    const y = (e.clientY / innerHeight - 0.5) * 10;
    document.querySelector('.hero-mountains.near').style.transform = `translate(${x * 0.6}px, ${y * 0.4}px)`;
    document.querySelector('.hero-mountains.far').style.transform = `translate(${x * 0.3}px, ${y * 0.2}px)`;
  });

  function revealHeroContent() {
    document.querySelectorAll('.hero-content .reveal-up').forEach((el, i) => {
      el.style.setProperty('--i', i);
      setTimeout(() => el.classList.add('in-view'), i * 130);
    });
  }

  /* ---------------------------------------------------------------------
     6. SCROLL REVEAL OBSERVER (fade-up / fade-left / fade-right + stagger)
  --------------------------------------------------------------------- */
  function initRevealObserver() {
    const revealEls = document.querySelectorAll(
      '.reveal-up:not(.hero-content .reveal-up), .reveal-left, .reveal-right'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
     7. GALLERY LIGHTBOX
  --------------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxScene = document.getElementById('lightboxScene');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function updateLightbox() {
    const item = galleryItems[currentIndex];
    const sceneClass = item.dataset.scene;
    lightboxScene.className = 'lightbox-scene scene ' + sceneClass;
    lightboxScene.removeAttribute('data-slot');
    lightboxScene.style.backgroundImage = 'none';
    const testImg = new Image();
    testImg.onload = () => {
      lightboxScene.style.backgroundImage = `url("images/${sceneClass}.jpg")`;
      lightboxScene.classList.remove('slot-empty');
    };
    testImg.onerror = () => {
      lightboxScene.classList.add('slot-empty', 'photo-slot');
      lightboxScene.setAttribute('data-slot', `${sceneClass}.jpg`);
    };
    testImg.src = `images/${sceneClass}.jpg`;
    lightboxCaption.textContent = item.dataset.caption;
  }
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightbox();
  }
  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  /* ---------------------------------------------------------------------
     8. AMBIENT AUDIO + HOVER SOUND (WebAudio synthesized — no external files)
  --------------------------------------------------------------------- */
  const soundToggle = document.getElementById('soundToggle');
  const iconOn = soundToggle.querySelector('.icon-sound-on');
  const iconOff = soundToggle.querySelector('.icon-sound-off');
  let audioCtx = null;
  let ambientNodes = null;
  let soundOn = false;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  // gentle synthesized ambient pad loop (avoids relying on external audio files)
  function startAmbient() {
    const ctx = getCtx();
    const master = ctx.createGain();
    master.gain.value = 0.05;
    master.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 110;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 164.81;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    osc1.connect(master);
    osc2.connect(master);
    osc1.start();
    osc2.start();
    lfo.start();

    ambientNodes = { master, osc1, osc2, lfo };
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    const { master, osc1, osc2, lfo } = ambientNodes;
    master.gain.setTargetAtTime(0, getCtx().currentTime, 0.2);
    setTimeout(() => {
      osc1.stop(); osc2.stop(); lfo.stop();
    }, 400);
    ambientNodes = null;
  }

  function playClick(freq = 440, duration = 0.06, type = 'square', volume = 0.03) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) {
      startAmbient();
      iconOn.style.display = 'block';
      iconOff.style.display = 'none';
    } else {
      stopAmbient();
      iconOn.style.display = 'none';
      iconOff.style.display = 'block';
    }
  });

  // hover click sound on interactive elements
  document.querySelectorAll('[data-sound], .btn, .nav-link, .gallery-item, .char-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundOn) playClick(520 + Math.random() * 80, 0.05, 'square', 0.02);
    });
  });

  /* ---------------------------------------------------------------------
     9. BACK TO TOP
  --------------------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    backToTop.style.opacity = window.scrollY > 800 ? '1' : '0.35';
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
