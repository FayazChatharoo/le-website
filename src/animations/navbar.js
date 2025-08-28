import { getGSAP } from "../gsap-global.js";
import { $ } from "../utils/dom.js";
import { E, ease } from "../utils/timings.js";

export default function navbarAnimation() {
  const gsap = getGSAP();
  const el = $('.navbar');
  if (!el) return null;

  console.log("navbarAnimation");

  const tl = gsap.timeline({ paused: true, defaults: { ease: ease.out, duration: E.base } });
  
  // Animation de largeur de la navbar
  // tl.set(el, { width: '0%', opacity: 0 })
  //   .to(el, { 
  //     width: 'clamp(712px, 44.5rem, 50vw)', 
  //     opacity: 1,
  //     duration: 1, 
  //     ease: ease.out 
  //   });
  
  // // Play the animation immediately
  // tl.play();
  
  return tl;
}


