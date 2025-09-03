// Hero scroll animation with frame-by-frame playback and text line reveals
// Uses GSAP/ScrollTrigger/SplitText from Webflow (window.*)

export default function initHeroScroll() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  
  if (!gsap || !ScrollTrigger || !SplitText) {
    console.warn('[LE:heroScroll] GSAP/ScrollTrigger/SplitText not available');
    return null;
  }

  // Check idempotence
  const heroSection = document.querySelector('.hero');
  if (!heroSection) {
    console.warn('[LE:heroScroll] .hero section not found');
    return null;
  }
  
  if (heroSection.dataset.scInit === '1') {
    return window.LE?.heroScroll || null;
  }
  heroSection.dataset.scInit = '1';

  // Configuration
  const CFG = {
    baseURL: '/assets/framesHero/',
    prefix: 'heroFrame-',
    ext: 'avif',
    pad: 3,
    startIndex: 1,
    lastIndex: 382,
    scrollLen: 4000
  };

  // State
  let currentFrame = CFG.startIndex;
  let canvas = null;
  let ctx = null;
  let images = new Map();
  let preloadedCount = 0;
  let totalFrames = CFG.lastIndex - CFG.startIndex + 1;

  // Create canvas if not present
  function ensureCanvas() {
    const canvasWrapper = document.querySelector('.hero-canvas');
    if (!canvasWrapper) {
      console.warn('[LE:heroScroll] .hero-canvas not found');
      return false;
    }

    canvas = document.getElementById('heroCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'heroCanvas';
      canvasWrapper.appendChild(canvas);
    }

    ctx = canvas.getContext('2d', { alpha: false });
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return true;
  }

  // Resize canvas to cover viewport
  function resizeCanvas() {
    if (!canvas) return;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    canvas.width = vw;
    canvas.height = vh;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
  }

  // Load single frame
  function loadFrame(index) {
    if (images.has(index)) return Promise.resolve(images.get(index));
    
    const paddedIndex = String(index).padStart(CFG.pad, '0');
    const url = `${CFG.baseURL}${CFG.prefix}${paddedIndex}.${CFG.ext}`;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        images.set(index, img);
        preloadedCount++;
        resolve(img);
      };
      img.onerror = () => {
        console.log(`[LE:heroScroll] skip frame ${index}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  // Preload first ~20 frames
  function preloadInitialFrames() {
    const promises = [];
    const initialCount = Math.min(20, totalFrames);
    
    for (let i = CFG.startIndex; i < CFG.startIndex + initialCount; i++) {
      promises.push(loadFrame(i));
    }
    
    return Promise.all(promises).then(() => {
      console.info('[LE:heroScroll] initial frames preloaded');
    });
  }

  // Load remaining frames in background
  function preloadRemainingFrames() {
    for (let i = CFG.startIndex + 20; i <= CFG.lastIndex; i++) {
      loadFrame(i);
    }
  }

  // Draw frame to canvas
  function drawFrame(frameIndex) {
    if (!ctx || !canvas) return;
    
    const img = images.get(frameIndex);
    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    // Calculate cover dimensions (preserve aspect ratio, fill viewport)
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > canvasAspect) {
      // Image is wider - fit to height
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspect;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    } else {
      // Image is taller - fit to width
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    }

    // Clear and draw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  // Lerp utility
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Setup text lines animation
  function setupTextLines(timeline) {
    const lines = document.querySelectorAll('[data-hero-line]:not([data-mode="intro"])');
    let lineCount = 0;

    lines.forEach((lineEl, index) => {
      const inFrame = parseInt(lineEl.dataset.in);
      const outFrame = lineEl.dataset.out ? parseInt(lineEl.dataset.out) : null;
      const stay = lineEl.dataset.stay === '1';

      if (!Number.isFinite(inFrame)) return;

      // Calculate timeline positions
      const startP = (inFrame - CFG.startIndex) / (CFG.lastIndex - CFG.startIndex);
      const endP = outFrame ? (outFrame - CFG.startIndex) / (CFG.lastIndex - CFG.startIndex) : null;

      // Split text if not already split
      let chars = lineEl.querySelectorAll('span');
      if (chars.length === 0) {
        const split = new SplitText(lineEl, { 
          type: "chars",
          position: "absolute",
          preserveWhitespace: true
        });
        chars = split.chars;
      }

      // Set initial states
      gsap.set(lineEl, { autoAlpha: 0 });
      gsap.set(chars, {
        opacity: 0,
        color: "#e68d29"
      });

      // Animation durations
      const opacityDur = 0.18;
      const colorDur = 0.38;

      // Apparition à startP
      timeline.to(chars, {
        opacity: 1,
        color: "#e68d29",
        duration: opacityDur,
        stagger: {
          from: "start",
          amount: 0.60,
          onComplete: function () {
            gsap.to(this.targets()[0], {
              color: "#FFF",
              duration: colorDur,
              ease: "expo.inOut"
            });
          }
        },
        ease: "power4.inOut",
        immediateRender: false
      }, startP);

      // Disparition à endP (si out défini et pas "stay")
      if (!stay && Number.isFinite(outFrame)) {
        const disappearDur = 0.20;
        timeline.to(lineEl, {
          autoAlpha: 0,
          duration: disappearDur,
          ease: "power1.in",
          immediateRender: false
        }, endP);
      }

      // Dispatch enter event
      timeline.call(() => {
        window.dispatchEvent(new CustomEvent("heroLine:enter", { 
          detail: { index, el: lineEl } 
        }));
        console.log('[LE] heroLine enter', index, lineEl.textContent?.substring(0, 20) + '...');
      }, [], startP);

      lineCount++;
    });

    return lineCount;
  }

  // Check for reduced motion
  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  // Main initialization
  function init() {
    if (!ensureCanvas()) return null;

    // Handle reduced motion
    if (prefersReducedMotion()) {
      console.info('[LE:heroScroll] reduced motion - showing static frame');
      loadFrame(CFG.startIndex).then(() => {
        drawFrame(CFG.startIndex);
      });
      
      // Show all text lines without animation
      const lines = document.querySelectorAll('[data-hero-line]:not([data-mode="intro"])');
      lines.forEach(lineEl => {
        gsap.set(lineEl, { autoAlpha: 1 });
        const chars = lineEl.querySelectorAll('span');
        if (chars.length > 0) {
          gsap.set(chars, { opacity: 1, color: "#FFF" });
        }
      });
      
      return { reducedMotion: true };
    }

    // Preload initial frames then setup
    preloadInitialFrames().then(() => {
      drawFrame(CFG.startIndex);

      // Start preloading remaining frames
      preloadRemainingFrames();

      // Create master timeline with ScrollTrigger
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: `+=${CFG.scrollLen}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const newFrame = Math.round(lerp(CFG.startIndex, CFG.lastIndex, self.progress));
            if (newFrame !== currentFrame) {
              currentFrame = newFrame;
              drawFrame(currentFrame);
            }
          }
        }
      });

      // Setup text lines
      const lineCount = setupTextLines(timeline);

      // Refresh ScrollTrigger
      ScrollTrigger.refresh();

      console.info('[LE] heroScroll ready', { 
        frames: { start: CFG.startIndex, end: CFG.lastIndex }, 
        lines: lineCount 
      });

      // Expose timeline globally
      window.LE ||= {};
      window.LE.heroScroll = timeline;
    });

    return { loading: true };
  }

  // Run initialization
  const result = init();

  // Expose globally
  window.LE ||= {};
  window.LE.heroScroll = result;
  window.LE.initHeroScroll = initHeroScroll;

  return result;
}

// Auto-initialize if intro exists
if (window.LE?.intro) {
  window.LE.intro.eventCallback('onComplete', () => {
    initHeroScroll();
  });
} else {
  // Fallback for dev
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScroll);
  } else {
    initHeroScroll();
  }
}
