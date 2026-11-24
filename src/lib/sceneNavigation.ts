let lastNonNumericKeyTime = 0;
let legalReturnHash = "#monolith";

export type LegalTab = "privacy" | "terms";

export function isSurveyPanelHash(hash: string): boolean {
  return hash === "#surveypanel" || hash === "#mading";
}

export function getLegalTabFromHash(hash: string): LegalTab | null {
  if (hash === "#privacy") return "privacy";
  if (hash === "#terms") return "terms";
  return null;
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

export function openLegalSheet(tab: LegalTab) {
  const currentHash = window.location.hash;
  if (currentHash !== "#privacy" && currentHash !== "#terms") {
    legalReturnHash = currentHash || "#monolith";
  }
  const nextHash = tab === "privacy" ? "#privacy" : "#terms";
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, "", nextHash);
  }
  window.dispatchEvent(
    new CustomEvent<LegalTab | null>("fts:legal", { detail: tab })
  );
}

export function closeLegalSheet() {
  if (getLegalTabFromHash(window.location.hash)) {
    window.history.pushState(null, "", legalReturnHash);
  }
  window.dispatchEvent(
    new CustomEvent<LegalTab | null>("fts:legal", { detail: null })
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
