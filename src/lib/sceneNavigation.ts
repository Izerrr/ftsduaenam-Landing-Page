let lastNonNumericKeyTime = 0;

export function isSurveyPanelHash(hash: string): boolean {
  return hash === "#surveypanel" || hash === "#mading";
}

/**
 * Dispatches a scene jump handled by SmoothScroll (Lenis + cobalt shutter on long jumps).
 */
export function jumpToScene(selector: string) {
  window.dispatchEvent(new CustomEvent("fts:jump", { detail: selector }));
}

export function openSurveyPanel() {
  if (window.location.hash !== "#surveypanel") {
    window.history.pushState(null, "", "#surveypanel");
  }
  window.dispatchEvent(
    new CustomEvent<boolean>("fts:surveypanel", { detail: true })
  );
}

export function closeSurveyPanel() {
  if (isSurveyPanelHash(window.location.hash)) {
    window.history.pushState(null, "", "#portal");
  }
  window.dispatchEvent(
    new CustomEvent<boolean>("fts:surveypanel", { detail: false })
  );
}

/**
 * Marks recent typing of non-shortcut keys so numbers 1/2/3 inside a typing flow
 * act as normal ambient/synth keys instead of abruptly jumping scenes mid-burst.
 */
export function markTypingBurst() {
  lastNonNumericKeyTime = performance.now();
}

export function isTypingBurstActive(windowMs = 1400): boolean {
  return performance.now() - lastNonNumericKeyTime < windowMs;
}
