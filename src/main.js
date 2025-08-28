import "./animations/preloaderVideo.js";
import introAnimation from "./animations/intro.js";
import navbarAnimation from "./animations/navbar.js";
import heroAnimation from "./animations/hero.js";
import bridgeSection from "./animations/sections/bridge.js";
import aboutSection from "./animations/sections/about.js";

(function initLE(){
  window.addEventListener('load', () => {
    // Lance seulement ce qui existe sur la page
    introAnimation?.();
    navbarAnimation?.();
    heroAnimation?.();
    bridgeSection?.();
    aboutSection?.();
  });
})();



console.info("[LE] bundle chargé live server finder localhost thing");

