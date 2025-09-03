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

    console.log('[LE] marquee.js loaded');
  
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
        const groups = Array.from(track.querySelectorAll('.results-cards-marquee-group'));
        if (groups.length < 2) return null;

        // Remettre le track à 0 avant mesure
        gsap.set(track, { x: 0 });

        // Calculer la largeur totale de tous les groupes (incluant les gaps)
        const totalWidth = track.getBoundingClientRect().width;
        const loopWidth = totalWidth / 2; // Puisqu'on a 2 groupes identiques
        console.log('[LE:Marquee] Largeur totale:', totalWidth, 'px');
        console.log('[LE:Marquee] Largeur de boucle:', loopWidth, 'px');

        // Vitesse : seconds per cycle depuis data-speed, sinon 12s par défaut
        const speedAttr = parseFloat(root.getAttribute('data-speed'));
        const duration = Number.isFinite(speedAttr) ? Math.max(1, speedAttr) : 12;
        console.log('[LE:Marquee] Durée de cycle:', duration, 's');

        // Créer une timeline pour une boucle seamless parfaite
        const tl = gsap.timeline({ repeat: -1 });
        
        // Animation principale : de 0 à -loopWidth (la moitié de la largeur totale)
        tl.to(track, {
          x: -loopWidth,
          duration,
          ease: 'none'
        });
        
        // Reset instantané à la fin de chaque cycle
        tl.call(() => {
          gsap.set(track, { x: 0 });
          console.log('[LE:Marquee] Reset seamless effectué');
        });

        return tl;
      }
  
      function ensureTwoGroups(trackEl) {
        const groups = trackEl.querySelectorAll('.results-cards-marquee-group');
        if (groups.length === 0) return;
        
        if (groups.length === 1) {
          // Clone profond pour dupliquer toutes les cartes
          const clone = groups[0].cloneNode(true);
          trackEl.appendChild(clone);
          console.log('[LE:Marquee] Groupe dupliqué pour créer la boucle seamless');
        } else if (groups.length > 2) {
          // Garder uniquement 2 groupes pour garantir les moitiés identiques
          while (trackEl.querySelectorAll('.results-cards-marquee-group').length > 2) {
            trackEl.removeChild(trackEl.lastElementChild);
          }
          console.log('[LE:Marquee] Groupes réduits à 2 pour la boucle seamless');
        }
        
        // S'assurer qu'il n'y a pas d'espace entre les groupes
        const finalGroups = trackEl.querySelectorAll('.results-cards-marquee-group');
        if (finalGroups.length === 2) {
          // Supprimer tout gap/margin entre les groupes
          finalGroups.forEach((group, index) => {
            if (index > 0) {
              group.style.marginLeft = '0';
            }
          });
          
          // Supprimer le gap du conteneur parent (column-gap, row-gap, gap) avec !important
          trackEl.style.setProperty('gap', '0', 'important');
          trackEl.style.setProperty('column-gap', '0', 'important');
          trackEl.style.setProperty('row-gap', '0', 'important');
          trackEl.style.setProperty('grid-column-gap', '0', 'important');
          trackEl.style.setProperty('grid-row-gap', '0', 'important');
          
          console.log('[LE:Marquee] Gaps supprimés du conteneur pour une boucle seamless');
        }
        
        // Conseils CSS (à poser dans Webflow si besoin) :
        // .results-marquee-track { display:flex; gap: 0; will-change: transform; }
        // .results-cards-marquee-group { flex: 0 0 auto; margin: 0; }  // empêche le wrap et les gaps
      }
    }
  }