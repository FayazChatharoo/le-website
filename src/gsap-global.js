// Pont vers GSAP & plugins fournis par Webflow (globaux window.*)

export function getGSAP() {
  const gsap = window.gsap;
  if (!gsap) {
    throw new Error("[GSAP] introuvable. Publie la page Webflow (le Designer ne charge PAS le custom code).");
  }
  return gsap;
}

export function getPlugin(name) {
  const plugin = window[name];
  if (!plugin) {
    console.warn(`[GSAP] Plugin ${name} introuvable via window.${name}. Vérifie son chargement côté Webflow.`);
    return null;
  }
  return plugin;
}


