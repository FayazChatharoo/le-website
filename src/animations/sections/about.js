import { getGSAP } from "../../gsap-global.js";
import { $ } from "../../utils/dom.js";

export default function preFooter() {
  const gsap = getGSAP();
  const section = $('#prefooter');
  if (!section) return null;

  const tl = gsap.timeline();
  // Ajoute tes reveals
  return tl;
}


