import "./animations/preloaderVideo.js";
import { computeShouldSkipIntro, setGlobalSkipFlag } from "./utils/first-visit.js";
import introAnimation from "./animations/intro.js";
import navbarAnimation from "./animations/navbar.js";
import heroAnimation from "./animations/hero.js";
import initResultsMarquee from "./animations/marquee.js";
import bridgeSection from "./animations/sections/bridge.js";
import aboutSection from "./animations/sections/about.js";
import initGlowCards from "./animations/glow-card.js";
import initHeroScroll from "./scroll/heroScroll.js";

(function initLE(){
  // Compute and expose skip flag ASAP
  try {
    const decision = computeShouldSkipIntro();
    setGlobalSkipFlag(decision);
  } catch (_) {}
  window.addEventListener('load', () => {
    // Lance seulement ce qui existe sur la page
    introAnimation?.();
    navbarAnimation?.();
    heroAnimation?.();
    initResultsMarquee?.();
    bridgeSection?.();
    aboutSection?.();
    initGlowCards({ selector: '.card' });
    initHeroScroll?.();
  });
})();
