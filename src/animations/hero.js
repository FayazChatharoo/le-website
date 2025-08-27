import { getGSAP, getPlugin } from "../gsap-global.js";
import { $ } from "../utils/dom.js";

export default function heroAnimation() {
  const gsap = getGSAP();
  const ScrollTrigger = getPlugin('ScrollTrigger');
  if (!ScrollTrigger) return null;

  const section = $('#heroSection');
  if (!section) return null;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=3000",
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  // Place ici tes tweens (frames + textes) quand tu seras prêt
  return tl;
}


