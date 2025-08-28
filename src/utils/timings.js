export const E = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2
};

export const ease = {
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut"
};

// Global helper to ensure a named CustomEase exists (for non-module environments like Webflow)
(function attachCustomEaseHelper() {
  const w = typeof window !== 'undefined' ? window : undefined;
  if (!w) return;
  w.LE ||= {};
  w.LE.ensureCustomEase = function ensureCustomEase() {
    const gsap = w.gsap;
    const CustomEase = w.CustomEase;
    if (!gsap || !CustomEase) {
      console.warn('[LE] CustomEase indisponible (gsap/CustomEase manquants côté Webflow).');
      return null;
    }
    try {
      // Will overwrite if it already exists with same name; harmless
      CustomEase.create("custom", "M0,0 C0.25,0 0.294,0.023 0.335,0.05 0.428,0.11 0.466,0.292 0.498,0.502 0.532,0.73 0.586,0.88 0.64,0.928 0.679,0.962 0.698,1 1,1 ");
      return "custom";
    } catch (e) {
      // If already exists or plugin not registered, fallback silently
      return "custom";
    }
  };
})();


