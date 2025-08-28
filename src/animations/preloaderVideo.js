(function initPreloaderVideo() {
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
  function ensureWrapper() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) {
      warn('Conteneur .preloader introuvable.');
      return null;
    }
    let wrapper = preloader.querySelector('.preloader__video');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'preloader__video';
      wrapper.setAttribute('data-le-video', '1');
      wrapper.style.position = 'absolute';
      wrapper.style.inset = '0';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '10';
      wrapper.style.opacity = '1';
      wrapper.style.display = 'block';
      preloader.appendChild(wrapper);
    } else {
      // Mark as managed by us
      wrapper.setAttribute('data-le-video', '1');
    }
    return wrapper;
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
    //s1.src = '/assets/videos/intro.webm';
    s1.src = 'http://127.0.0.1:5500/assets/videos/assets/videos/intro.webm';
    s1.type = 'video/webm';
    const s2 = document.createElement('source');
    //s2.src = '/assets/videos/intro.mp4';
    s2.src = 'http://127.0.0.1:5500/assets/videos/assets/videos/intro.mp4';
    s2.type = 'video/mp4';
    video.appendChild(s1);
    video.appendChild(s2);

    return video;
  }

  function mount() {
    if (state.mounted) return true;
    const wrapper = ensureWrapper();
    if (!wrapper) return false;

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
    on(video, 'canplay', () => {
      // noop: useful in case we want early cues
    });
    on(video, 'canplaythrough', () => {
      state.ready = true;
      emit('le:video:ready', {
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0
      });
      // Attempt autoplay if not yet done
      if (!state.attemptedAutoplay) {
        tryPlay('canplaythrough');
      }
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

    // In case autoplay is blocked, retry upon first interaction
    const retryOnUserGesture = () => {
      if (!state.playing && state.video) {
        tryPlay('pointerdown-retry');
      }
      w.removeEventListener('pointerdown', retryOnUserGesture, { capture: true });
    };
    on(w, 'pointerdown', retryOnUserGesture, { capture: true, once: true });

    state.mounted = true;
    return true;
  }

  function tryPlay(origin) {
    const v = state.video;
    if (!v) return;
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

  function load() {
    if (!mount()) return;
    // Force a load hint
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
    // Remove listeners
    state.listeners.splice(0).forEach((off) => {
      try { off(); } catch (_) {}
    });
    // Remove DOM
    if (state.video && state.video.parentNode) {
      try { state.video.pause(); } catch (_) {}
      state.video.parentNode.removeChild(state.video);
    }
    if (state.wrapper && state.wrapper.getAttribute('data-le-video') === '1') {
      if (state.wrapper.parentNode) state.wrapper.parentNode.removeChild(state.wrapper);
    }
    // Reset
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
})();
