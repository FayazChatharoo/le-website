import { getGSAP } from "../gsap-global.js";
import { $ } from "../utils/dom.js";
import { E, ease } from "../utils/timings.js";

export default function navbarAnimation() {
  const gsap = getGSAP();
  const el = $('.navbar');
  if (!el) return null;

  const tl = gsap.timeline({ paused: true, defaults: { ease: ease.out, duration: E.base } });
  // Ajoute ici les tweens dédiés navbar si besoin (ex: hover orchestrés)
  return tl;
}


