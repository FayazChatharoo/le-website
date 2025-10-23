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
    scrollLen: 8000
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

  // Reference-style scrubbed text renderer (pure function of progress)
  // Mirrors the provided example: split once; compute per-char styles each tick from a shared driver progress.
  function createReferenceTextRender() {
    // Select the 5 hero lines exactly like the reference wants
    // Structure: .hero-content > p > .heading-1 > .hero-line
    const lines = Array.from(document.querySelectorAll('p.hero-line'));
    if (lines.length === 0) return { destroy: () => {} };

    // Pre-split and cache chars
    const lineChars = lines.map((lineEl) => {
      let chars = lineEl.querySelectorAll('span');
      if (chars.length === 0) {
        const split = new SplitText(lineEl, {
          type: 'words,chars',
          position: 'absolute',
          preserveWhitespace: true,
          wordDelimiter: ' '
        });
        chars = split.chars;
      }
      // Initial styles: hidden and base color (orange) using direct style writes
      lineEl.style.display = 'none';
      lineEl.style.opacity = '0';
      lineEl.style.visibility = 'hidden';
      Array.from(chars).forEach((c) => {
        c.style.opacity = '0';
        c.style.color = '#e68d29';
      });
      return Array.from(chars);
    });

    // Easing helpers (approx pow2)
    const easeOut = (t) => 1 - Math.pow(1 - t, 2);
    const easeIn = (t) => t * t;
    const clamp01 = (t) => Math.max(0, Math.min(1, t));

    // Tunables
    const REVEAL_PORTION = 0.5; // D
    const HOLD_OVERLAP = 0.12;  // l (keep line fully visible for a bit)

    function renderFromProgress(pRaw) {
      const p = clamp01(pRaw);
      // Fade out intro heading as scroll starts
      // Intro element (separate from lines)
      const firstHeading = document.querySelector('.hero-content .heading-1');
      if (firstHeading) {
        const fade = clamp01(p / 0.03);
        const o = 1 - fade;
        firstHeading.style.opacity = String(o);
        firstHeading.style.visibility = o <= 0.02 ? 'hidden' : 'visible';
      }

      const K = lines.length;
      const segment = p * K;
      const idx = Math.max(0, Math.min(K - 1, Math.floor(segment)));
      const t = segment - idx;
      console.log('[LE:heroText] p=', p.toFixed(3), 'K=', K, 'idx=', idx, 't=', t.toFixed(3));

      // Hide all non-active lines
      for (let i = 0; i < K; i++) {
        if (i !== idx) {
          const el = lines[i];
          el.style.display = 'none';
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
        }
      }

      const activeLine = lines[idx];
      const chars = lineChars[idx];
      activeLine.style.display = 'block';
      activeLine.style.opacity = '1';
      activeLine.style.visibility = 'visible';

      const D = REVEAL_PORTION;
      const I = Math.min(1, D + HOLD_OVERLAP);
      const isLast = idx === K - 1;
      const lastStay = isLast && activeLine.dataset.stay === '1';

      const revealT = clamp01(t / D);
      const fadeT = lastStay ? 0 : clamp01((t - I) / (1 - I));
      const V = chars.length || 1;

      for (let c = 0; c < V; c++) {
        const char = chars[c];
        const m = c / V;
        const r1 = clamp01((revealT - m) / (1 / V));
        const r2 = clamp01((fadeT - m) / (1 / V));
        const reveal = easeOut(r1);
        const fade = easeIn(r2);
        const opacity = clamp01(reveal * (1 - fade));
        const isFading = fade > 0.01;
        const color = isFading ? '#e68d29' : (reveal > 0.99 ? '#FFF' : '#e68d29');
        char.style.opacity = String(opacity);
        char.style.color = color;
      }
    }

    return { 
      render: renderFromProgress,
      lines: lines // Expose lines array for external access
    };
  }

  // Legacy timeline-based text was removed in favor of the reference scrubbed renderer.

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

    // Immediately hide hero lines to prevent flash on load (will be driven by scrubber)
    const initialLines = document.querySelectorAll('p.hero-line');
    initialLines.forEach(lineEl => {
      lineEl.style.opacity = '0';
      lineEl.style.visibility = 'hidden';
      lineEl.style.display = 'none';
    });

    // Ensure hero-content sits above the canvas (without breaking existing CSS)
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      const style = heroContent.style;
      if (!style.position) style.position = 'relative';
      if (!style.zIndex) style.zIndex = '2';
    }

    // Handle reduced motion
    if (prefersReducedMotion()) {
      console.info('[LE:heroScroll] reduced motion - showing static frame');
      loadFrame(CFG.startIndex).then(() => {
        drawFrame(CFG.startIndex);
      });
      
      // Show all text lines without animation
      const lines = document.querySelectorAll('p.hero-line');
      lines.forEach(lineEl => {
        lineEl.style.display = 'block';
        lineEl.style.opacity = '1';
        lineEl.style.visibility = 'visible';
        const chars = lineEl.querySelectorAll('span');
        chars.forEach((c) => { c.style.opacity = '1'; c.style.color = '#FFF'; });
      });
      
      return { reducedMotion: true };
    }

    // Preload initial frames then setup
    preloadInitialFrames().then(() => {
      drawFrame(CFG.startIndex);

      // Start preloading remaining frames
      preloadRemainingFrames();

      // Create master timeline with ScrollTrigger
      let scrubber = null; // will be assigned after timeline creation
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'heroScroll',
          trigger: '.hero',
          start: 'top top',
          end: `+=${CFG.scrollLen}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 100,
          preventOverlaps: true,
          onUpdate: (self) => {
            const newFrame = Math.round(lerp(CFG.startIndex, CFG.lastIndex, self.progress));
            if (newFrame !== currentFrame) {
              currentFrame = newFrame;
              drawFrame(currentFrame);
            }
            // Drive text renderer from the SAME driver as frames (reference sync)
            try { 
              if (scrubber) {
                scrubber.render(self.progress);
                
                // Check for last line completion to trigger CTA
                if (!lastLineCompleteDispatched && self.progress > 0) {
                  const K = scrubber.lines.length;
                  const idx = Math.floor(self.progress * K);
                  const t = self.progress * K - idx;
                  
                  // If we're on the last line and it's in the hold phase (fully visible)
                  if (idx === K - 1 && t >= 0.5 && t < 0.62) {
                    lastLineCompleteDispatched = true;
                    window.dispatchEvent(new CustomEvent('le:hero:last-line-complete'));
                    console.log('[LE:heroScroll] Last line complete - CTA can animate');
                  }
                }
              }
            } catch (e) { console.warn('[LE:heroText] render error', e); }
          },
          onStart: () => {
            // First heading will be animated out by setupFirstHeading()
          }
        }
      });

      // Setup scrubbed text rendering (no timelines)
      // Fresh, reference-style scrubber render function
      scrubber = createReferenceTextRender();
      
      // Track last line completion for CTA sync
      let lastLineCompleteDispatched = false;

      // EXACT reference approach: standalone ScrollTrigger driving text via its own progress
      // Initial render state
      try { scrubber.render(0); } catch (_) {}

      // We still compute line count for logging
      const lineCount = document.querySelectorAll('p.hero-line').length;

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
