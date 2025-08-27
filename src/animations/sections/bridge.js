import { getGSAP } from "../../gsap-global.js";
import { $ } from "../../utils/dom.js";
import { E, ease } from "../../utils/timings.js";

export default function bridgeSection() {
  const gsap = getGSAP();
  const section = $('#bridge');
  if (!section) return null;

  const tl = gsap.timeline({ defaults: { ease: ease.out, duration: E.base } });
  // Ex: tl.from(section.querySelector('.some-el'), { autoAlpha: 0, y: 40 });
  return tl;
}


