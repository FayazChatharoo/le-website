// marquee.js
// Animation GSAP d’un marquee infini, compatible avec ta structure Webflow.
//
// Structure attendue :
// .Results-marquee
//   .Results-marquee-track
//     .Results-marquee-group   (cartes…)
//     .Results-marquee-group   (cartes…)
//     [si un seul groupe, on clone automatiquement]

export default function initResultsMarquee() {
    const { gsap } = window;
    if (!gsap) {
      console.warn('[Marquee] GSAP introuvable.');
      return;
    }
  
    const ROOTS = document.querySelectorAll('.results-marquee');
    if (!ROOTS.length) return;
  
    ROOTS.forEach(setupOneMarquee);
  
    // ————— Helpers —————
    function setupOneMarquee(root) {
      const track = root.querySelector('.results-marquee-track');
      if (!track) return;
  
      // 1) S’assurer d’avoir au moins 2 groupes identiques
      ensureTwoGroups(track);
  
      // 2) Construire/relancer l’animation
      let tween = buildTween();
  
      // 3) Pause au survol
      root.addEventListener('mouseenter', () => tween && tween.pause());
      root.addEventListener('mouseleave', () => tween && tween.play());
  
      // 4) Rebuild on resize (debounced)
      let raf = null;
      const onResize = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (tween) tween.kill();
          tween = buildTween();
        });
      };
      window.addEventListener('resize', onResize);
  
      // ——— local helpers
      function buildTween() {
        // IMPORTANT : la boucle seamless suppose 2 moitiés identiques à la suite
        const groups = Array.from(track.querySelectorAll('.results-marquee-group'));
        if (groups.length < 2) return null;
  
        // Remettre le track à 0 avant mesure
        gsap.set(track, { x: 0 });
  
        const loopWidth = groups[0].getBoundingClientRect().width;
  
        // Vitesse : seconds per cycle depuis data-speed, sinon 12s par défaut
        const speedAttr = parseFloat(root.getAttribute('data-speed'));
        const duration = Number.isFinite(speedAttr) ? Math.max(1, speedAttr) : 12;
  
        // Tween linéaire infini 0 → -loopWidth, puis reset à 0 à chaque repeat
        return gsap.to(track, {
          x: -loopWidth,
          duration,
          ease: 'none',
          repeat: -1,
          onRepeat() {
            // reset instantané à 0 pour enchaîner la seconde moitié identique
            gsap.set(track, { x: 0 });
          }
        });
      }
  
      function ensureTwoGroups(trackEl) {
        const groups = trackEl.querySelectorAll('.results-marquee-group');
        if (groups.length === 0) return;
        if (groups.length === 1) {
          // Clone profond pour dupliquer toutes les cartes
          trackEl.appendChild(groups[0].cloneNode(true));
        } else if (groups.length > 2) {
          // Optionnel : garder uniquement 2 groupes pour garantir les moitiés identiques
          // (décommente si besoin de forcer strictement 2)
          // while (trackEl.querySelectorAll('.Results-marquee-group').length > 2) {
          //   trackEl.removeChild(trackEl.lastElementChild);
          // }
        }
        // Conseils CSS (à poser dans Webflow si besoin) :
        // .Results-marquee-track { display:flex; gap: var(--spaces--m, 0); will-change: transform; }
        // .Results-marquee-group { flex: 0 0 auto; }  // empêche le wrap
      }
    }
  }