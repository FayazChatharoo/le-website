import { getGSAP, getPlugin } from "../gsap-global.js";
import { $ } from "../utils/dom.js";

export default function heroAnimation() {
  const gsap = getGSAP();
  const SplitText = getPlugin('SplitText');
  
  if (!SplitText) {
    console.warn('[LE:hero] SplitText plugin not available');
    return null;
  }

  const section = $('.hero');
  const heading = section?.querySelector('.hero-content .heading-1');
  
  if (!section || !heading) return null;

  // Create timeline
  const tl = gsap.timeline({ paused: true });

  // Split text into individual characters
  const splitHeading = new SplitText(heading, { 
    type: "chars,words",
    position: "absolute",
    preserveWhitespace: true,
    autoSplit: true,
    onSplit: (chars) => {
      // Re-apply initial state to new characters
      gsap.set(chars, { 
        opacity: 0, 
        color: 'var(--color--primary)' 
      });
    }
  });
  const chars = splitHeading.chars;

  // Set initial state for all characters
  gsap.set(chars, { 
    opacity: 0, 
    color: 'var(--color--primary)'
  });

  // Set initial state for CTA
  const cta = section?.querySelector('.cta');
  if (cta) {
    gsap.set(cta, { 
      opacity: 0, 
      y: 500 
    });
  }

  // Configuration de l'animation
  const opacityDur = 0.1;
  const colorDur = 0.8;
  
  // Animation principale avec stagger.onComplete
  tl.to(chars, {
    opacity: 1,
    color:"#e68d29",
    duration: opacityDur,
    stagger: {
      from: "start",
      amount: 0.6, // Total stagger time
      onComplete: function() {
        // Transition couleur individuelle pour chaque lettre
        gsap.to(this.targets()[0], {
          color: "#FFF",
          duration: colorDur,
          ease: 'expo.inOut'
        });
      }
    },
    ease: 'power4.inOut',
    immediateRender: false
  });

  // Pause courte après l'animation du texte
  tl.to({}, { duration: 0.3 });

  // Animation du CTA : fade in + slide up
  if (cta) {
    tl.to(cta, {
      opacity: 1,
      y: 0,
      duration: 1.6,
      ease: (window.LE && typeof window.LE.ensureCustomEase === 'function' && window.LE.ensureCustomEase())
    });
  }

  // Accessibility: if reduced motion, jump to final state immediately
  try {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(chars, { opacity: 1, color: '#FFF' });
      if (cta) gsap.set(cta, { opacity: 1, y: 0 });
      // Do not play animations
      return tl;
    }
  } catch (_) {}

  // Listen for preloader fade-out to start hero animation
  window.addEventListener('le:intro:navbar-rise', () => {
    // Wait for preloader to start fading (after bands collapse and video fade)
    setTimeout(() => {
      tl.play();
    }, 1000); // 0.6s (bands) + 0.6s (video) = 1.2s
  });

  // If intro/preloader are skipped (revisit), start the hero timeline automatically
  if (window.LE && window.LE.shouldSkipIntro) {
    // Start soon after paint so layout is ready
    requestAnimationFrame(() => tl.play());
  } else {
    // Safety fallback: if the event never arrives, start after a short delay
    setTimeout(() => {
      try { if (tl && tl.paused && tl.paused()) tl.play(); } catch (_) {}
    }, 2000);
  }

  return tl;
}


