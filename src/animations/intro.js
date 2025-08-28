export default function introAnimation() {
  // Utiliser GSAP depuis window, sans imports ES
  const { gsap } = window;
  if (!gsap) {
    console.error('[GSAP] introuvable. Assure-toi que Webflow charge GSAP avant ce bundle.');
    return null;
  }

  // Sélecteurs
  const preloader = document.querySelector('.preloader');
  const navbar = document.querySelector('.navbar');
  const navbarLogo = document.querySelector('.navbar-logo');
  const navbarItemsContainer = document.querySelector('.navbar-items');
  const glassEffect = document.querySelector('.navbar-glasseffect');
  const glassTint = document.querySelector('.navbar-glasstint') || document.querySelector('.navbarglasstint');
  const glassShine = document.querySelector('.navbar-glassshine');
  if (!navbar) return null;

  // Idempotence
  if (preloader && preloader.dataset.leIntroInit === '1') {
    return window.LE && window.LE.intro ? window.LE.intro : null;
  }
  if (preloader) preloader.dataset.leIntroInit = '1';

  // Items ciblés (2 x p.body-text + 1 x .navbar-cta)
  const pItems = navbarItemsContainer ? Array.from(navbarItemsContainer.querySelectorAll('p.body-text')) : [];
  const ctaItem = navbarItemsContainer ? navbarItemsContainer.querySelector('.navbar-cta') : null;
  const navItems = [...pItems.slice(0, 2), ...(ctaItem ? [ctaItem] : [])];

  // Etat initial
  gsap.set(preloader, { autoAlpha: 1 });
  const logoWidth = navbarLogo && navbarLogo.offsetWidth > 0 ? navbarLogo.offsetWidth : 100;
  const initialWidth = logoWidth + 48; // 2 * 24px (approx des marges/paddings)
  gsap.set(navbar, {
    position: 'fixed',
    top: '50%',
    yPercent: -50,
    autoAlpha: 0,
    width: `${initialWidth}px`
  });
  // Préparer les bordures (arriveront plus tard)
  gsap.set(navbar, {
    borderStyle: 'none',
    borderTopWidth: '0em',
    borderBottomWidth: '0em'
  });
  if (navbarLogo) gsap.set(navbarLogo, { autoAlpha: 0 });
  if (navbarItemsContainer) gsap.set(navbarItemsContainer, { width: '0%' });
  navItems.forEach((item) => gsap.set(item, { autoAlpha: 0, y: -100 }));
  if (glassEffect) gsap.set(glassEffect, { autoAlpha: 0 });
  if (glassTint) gsap.set(glassTint, { autoAlpha: 0 });
  if (glassShine) gsap.set(glassShine, { autoAlpha: 0 });

  // Timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.add('start', 0).add('logo', 'start');

  // Phase logo — fade seul du logo + attente
  tl.set(navbar, { autoAlpha: 1 }, 'logo')
    .to(navbarLogo || navbar, { autoAlpha: 1, duration: 1.0 }, 'logo')
    .to({}, { duration: 1.0 });

  // Phase frame — apparition du cadre + largeur target + attente
  tl.add('frame')
    .to(navbar, { autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 'frame')
    .to(navbar, {
      borderStyle: 'solid',
      borderTopWidth: '0.0015em',
      borderBottomWidth: '0.0015em',
      borderTopColor: 'var(--color--white)',
      borderBottomColor: 'var(--color--white)',
      duration: 1.2,
      ease: 'slow.inOut'
    }, 'frame')
    .to(navbar, {
      width: 'clamp(712px, 44.5rem, 50vw)',
      duration: 2,
      ease: (window.LE && typeof window.LE.ensureCustomEase === 'function' && window.LE.ensureCustomEase()) || 'power2.out'
    }, 'frame')
    .to({}, { duration: 0.4 });

  // Phase verre — couches simultanées
  tl.add('glass', 'frame')
  if (glassEffect) tl.to(glassEffect, { autoAlpha: 1, duration: 0.2 }, 'glass');
  if (glassTint) tl.to(glassTint, { autoAlpha: 1, duration: 0.2 }, 'glass');
  if (glassShine) {
    gsap.set(glassShine, {
      boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgb(255, 255, 255, 0) 0px 0px 0px 0px inset'
    });
    tl.to(glassShine, {
      autoAlpha: 1,
      duration: 0.2,
      boxShadow: 'rgba(0, 0, 0, 0.2) 0px -6px 11px 10px inset, rgb(255, 255, 255) 2px 8px 1px -6px inset'
    }, 'glass');
  }

  // Phase items — croissance conteneur + reveals séquentiels
  tl.add('items');
  if (navbarItemsContainer) tl.to(navbarItemsContainer, { width: '66%', duration: 0.6, ease: 'power3.out' }, 'items');

  let currentTime = 'items+=0.1';
  navItems.forEach((item, index) => {
    tl.to(item, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.inOut' }, currentTime, "<");
    currentTime = index < navItems.length - 1 ? '+=0.0' : '+=0.0';
  });

  // Pause, remontée, pause, puis sortie preloader
  tl.to({}, { duration: 0.4 })
    .to(navbar, { top: '5vh', yPercent: 0, duration: 0.6, ease: 'power3.inOut' })
    .to({}, { duration: 0.4 });

  if (preloader) tl.to(preloader, { autoAlpha: 0, duration: 0.6 }).set(preloader, { display: 'none' });

  // Expose pour debug
  window.LE ||= {};
  window.LE.intro = tl;
  return tl;
}


