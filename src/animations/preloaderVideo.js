import { computeShouldSkipIntro, setGlobalSkipFlag, markFirstVisitDone } from '../utils/first-visit.js';

(function initPreloaderVideo() {
  // First-visit gating via ES modules
  const w = typeof window !== 'undefined' ? window : undefined;
  if (!w) return;

  const log = (...args) => console.info('[LE:video]', ...args);
  const warn = (...args) => console.warn('[LE:video]', ...args);

  // Internal state
  const state = {
    mounted: false,
    ready: false,
    playing: false,
    ended: false,
    attemptedAutoplay: false,
    listeners: [],
    wrapper: null,
    video: null
  };

  // Utilities
  function emit(name, detail) {
    try { w.dispatchEvent(new CustomEvent(name, { detail })); } catch (_) {}
  }
  function on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    state.listeners.push(() => target.removeEventListener(type, handler, opts));
  }

  function createVideo() {
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('preload', 'auto');
    video.setAttribute('autoplay', '');
    video.muted = true;
    video.loop = false;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.display = 'block';

    // Sources (order: webm then mp4 fallback)
    const s1 = document.createElement('source');
    s1.src = 'https://spectacular-heliotrope-95f142.netlify.app/assets/videos/intro.webm';
    s1.type = 'video/webm';
    const s2 = document.createElement('source');
    s2.src = 'https://spectacular-heliotrope-95f142.netlify.app/assets/videos/intro.mp4';
    s2.type = 'video/mp4';
    video.appendChild(s1);
    video.appendChild(s2);

    return video;
  }

  function tryPlay(origin) {
    const v = state.video;
    if (!v) return;
    if (state.attemptedAutoplay) return;
    state.attemptedAutoplay = true;
    emit('le:video:attempt-play', { origin });
    const p = v.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        state.playing = true;
        state.ended = false;
        log('lecture démarrée');
      }).catch(() => {
        emit('le:video:autoplay-blocked');
        warn('autoplay bloqué; attente d’une interaction');
      });
    } else {
      // Older browsers
      state.playing = true;
      state.ended = false;
    }
  }

  function runIntroFxAndPlay() {
    const gsap = w.gsap;
    const top = document.querySelector('.aspect-ratio-top');
    const bottom = document.querySelector('.aspect-ratio-bottom');
    // Fade-in wrapper over 0.4s and shrink bands from 50vh to 15vh
    if (state.wrapper && gsap) {
      gsap.set(state.wrapper, { autoAlpha: 0 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      tl.to([top, bottom].filter(Boolean), { height: '15vh', duration: 1 }, 0.2)
        .to(state.wrapper, { autoAlpha: 1, duration: 0.8, ease: 'power2.in' }, 0)
        .add(() => tryPlay('intro-fx-complete'));
    } else {
      // No GSAP or wrapper: attempt to play immediately
      tryPlay('no-fx');
    }
  }

  function mount() {
    if (state.mounted) return true;

    // Skip logic: if already visited or reduced motion
    try {
      // Prefer global flag computed in main.js
      const globalSkip = !!(w.LE && w.LE.shouldSkipIntro);
      const decision = !globalSkip && typeof computeShouldSkipIntro === 'function'
        ? computeShouldSkipIntro()
        : { shouldSkip: globalSkip };
      if (typeof setGlobalSkipFlag === 'function') setGlobalSkipFlag(decision);
      if (decision.shouldSkip) {
        const preloaderEl = document.querySelector('.preloader');
        const top = document.querySelector('.aspect-ratio-top');
        const bottom = document.querySelector('.aspect-ratio-bottom');
        if (top) top.style.height = '0vh';
        if (bottom) bottom.style.height = '0vh';
        if (preloaderEl) {
          preloaderEl.style.opacity = '0';
          preloaderEl.style.visibility = 'hidden';
          preloaderEl.style.display = 'none';
        }
        return false;
      }
    } catch (_) {}

    // Require existing preloader in DOM; use existing .preloader__video if present, otherwise fallback to .video-render
    const preloader = document.querySelector('.video-render');
    if (!preloader) {
      warn('Conteneur .preloader/.video-render introuvable.');
      return false;
    }
    const wrapper = preloader.querySelector('.preloader__video') || preloader;

    const video = createVideo();
    wrapper.appendChild(video);
    state.wrapper = wrapper;
    state.video = video;

    // Events wiring
    on(video, 'loadedmetadata', () => {
      emit('le:video:ready', {
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0
      });
    });
    on(video, 'canplaythrough', () => {
      state.ready = true;
      emit('le:video:ready', {
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0
      });
      // Intro FX decides when to play
    });
    on(video, 'timeupdate', () => {
      const duration = video.duration || 0;
      const currentTime = video.currentTime || 0;
      const percent = duration ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
      emit('le:video:progress', { currentTime, duration, percent });
    });
    on(video, 'ended', () => {
      state.playing = false;
      state.ended = true;
      emit('le:video:ended');
    });
    on(video, 'error', () => {
      const err = (video.error && video.error.message) || 'unknown';
      emit('le:video:error', { code: video.error && video.error.code, message: err });
    });

    // Retry play on first user gesture if blocked
    const retryOnUserGesture = () => {
      if (!state.playing && state.video) tryPlay('pointerdown-retry');
      w.removeEventListener('pointerdown', retryOnUserGesture, { capture: true });
    };
    on(w, 'pointerdown', retryOnUserGesture, { capture: true, once: true });

    state.mounted = true;

    // Kick GSAP intro FX (and then play)
    runIntroFxAndPlay();

    return true;
  }

  function load() {
    if (!mount()) return;
    try { state.video.load(); } catch (_) {}
  }

  function play() {
    if (!state.mounted) load();
    tryPlay('api');
  }

  function pause() {
    if (!state.video) return;
    try { state.video.pause(); state.playing = false; } catch (_) {}
  }

  function setOpacity(value) {
    if (!state.wrapper) return;
    state.wrapper.style.opacity = String(Math.max(0, Math.min(1, Number(value) || 0)));
  }

  function show() {
    if (!state.wrapper) return;
    state.wrapper.style.display = 'block';
    state.wrapper.style.visibility = 'visible';
  }

  function hide() {
    if (!state.wrapper) return;
    state.wrapper.style.visibility = 'hidden';
  }

  function destroy() {
    state.listeners.splice(0).forEach((off) => {
      try { off(); } catch (_) {}
    });
    if (state.video && state.video.parentNode) {
      try { state.video.pause(); } catch (_) {}
      state.video.parentNode.removeChild(state.video);
    }
    state.mounted = false;
    state.ready = false;
    state.playing = false;
    state.ended = false;
    state.wrapper = null;
    state.video = null;
  }

  // Expose API
  w.LE ||= {};
  w.LE.video = {
    load,
    play,
    pause,
    setOpacity,
    show,
    hide,
    destroy
  };

  // Auto-init at load without blocking
  if (document.readyState === 'complete') {
    load();
  } else {
    w.addEventListener('load', () => load());
  }

  // Listen for navbar rise event to close aspect ratio divs
  w.addEventListener('le:intro:navbar-rise', () => {
    const gsap = w.gsap;
    if (!gsap) return;
    const top = document.querySelector('.aspect-ratio-top');
    const bottom = document.querySelector('.aspect-ratio-bottom');
    const targets = [top, bottom].filter(Boolean);
    if (targets.length === 0) return;
    const customEase = (w.LE && typeof w.LE.ensureCustomEase === 'function' && w.LE.ensureCustomEase()) || 'power3.inOut';
    
    // Create timeline to sequence animations
    const tl = gsap.timeline();
    
    // Apply global speed multiplier if available
    const speedMultiplier = w.LE?.speedMultiplier || 0.8;
    tl.timeScale(speedMultiplier);
    
    // First: animate bands to 0vh height
    tl.to(targets, { height: '0vh', duration: 1.2, ease: customEase });
    
    // Then: fade out video wrapper
    tl.to(state.wrapper, { autoAlpha: 0, duration: 1.2, ease: customEase }, "<");
    
    // Finally: fade out preloader and set display:none
    tl.to('.preloader', { autoAlpha: 0, duration: 1.2, ease: 'power3.out' })
      .set('.preloader', { display: 'none' })
      .call(() => {
        try {
          if (typeof markFirstVisitDone === 'function') markFirstVisitDone();
          // Keep a global hint as well
          w.LE ||= {};
          w.LE.firstVisitMarked = true;
        } catch (_) {}
      });
  });
})();
