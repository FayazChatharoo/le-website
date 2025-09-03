// assets/js/glow-card.js
export default function initGlowCards(options = {}) {
    console.log('initGlowCards');
    const selector = options.selector || '.card';
    const cards = document.querySelectorAll(selector);
  
    cards.forEach(card => {
      const glow = card.querySelector('.glow-layer');
      if (!glow) return;
  
      // Au survol, on bouge le centre du radial-gradient
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        // On passe des % (plus stables si la carte change de taille)
        glow.style.setProperty('--mx', `${(x / r.width) * 100}%`);
        glow.style.setProperty('--my', `${(y / r.height) * 100}%`);
      });
  
      // Optionnel : recentrer / atténuer en sortie
      card.addEventListener('pointerleave', () => {
        glow.style.removeProperty('--mx');
        glow.style.removeProperty('--my');
      });
    });
  }