// Utilities for first-visit gating of intro/preloader

function getQueryParamBoolean(name) {
  try {
    const url = new URL(window.location.href);
    const value = url.searchParams.get(name);
    return value === '1' || value === 'true';
  } catch (_) {
    return false;
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

function safeGetStorage() {
  try {
    return window.localStorage;
  } catch (_) {
    return null;
  }
}

export function computeShouldSkipIntro() {
  const storage = safeGetStorage();
  const resetIntro = getQueryParamBoolean('resetIntro');
  if (resetIntro && storage) {
    try { storage.removeItem('le:firstVisitDone'); } catch (_) {}
  }

  const forceIntro = getQueryParamBoolean('forceIntro');
  const alreadyVisited = storage ? storage.getItem('le:firstVisitDone') === '1' : false;
  const reduced = prefersReducedMotion();

  // Force takes precedence over everything
  if (forceIntro) {
    return { shouldSkip: false, reason: 'forceIntro', alreadyVisited, reduced };
  }

  // If reduced motion, always skip
  if (reduced) {
    return { shouldSkip: true, reason: 'reduced-motion', alreadyVisited, reduced };
  }

  // Skip if already visited
  if (alreadyVisited) {
    return { shouldSkip: true, reason: 'already-visited', alreadyVisited, reduced };
  }

  return { shouldSkip: false, reason: 'first-visit', alreadyVisited, reduced };
}

export function setGlobalSkipFlag(decision) {
  try {
    window.LE ||= {};
    window.LE.shouldSkipIntro = !!(decision && decision.shouldSkip);
    window.LE.skipIntroReason = decision && decision.reason;
  } catch (_) {}
}

export function markFirstVisitDone() {
  const storage = safeGetStorage();
  if (!storage) return;
  try { storage.setItem('le:firstVisitDone', '1'); } catch (_) {}
}


