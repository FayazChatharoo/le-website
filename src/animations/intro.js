import { getGSAP, getPlugin } from "../gsap-global.js";
import { $ } from "../utils/dom.js";
import { E, ease } from "../utils/timings.js";

export default function introAnimation() {
  const gsap = getGSAP();
  // Plugins si besoin :
  // const SplitText = getPlugin('SplitText');

  const navbar = $('.navbar');
  if (!navbar) return null;

  const tl = gsap.timeline({ defaults: { ease: ease.out } });
  // Exemples (remplace plus tard par ta vraie timeline "menu/intro") :
  tl.set(navbar, { autoAlpha: 0, yPercent: -20 })
    .to(navbar, { autoAlpha: 1, yPercent: 0, duration: E.base });

  return tl;
}


