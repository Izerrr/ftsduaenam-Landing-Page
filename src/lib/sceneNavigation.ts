let lastNonNumericKeyTime = 0;

/**
 * Dispatches a scene jump handled by SmoothScroll (Lenis + cobalt shutter on long jumps).
 */
export function jumpToScene(selector: string) {
  window.dispatchEvent(new CustomEvent("fts:jump", { detail: selector }));
}

/**
 * Marks recent typing of non-shortcut keys so numbers 1/2/3 inside a typing flow
 * act as normal Synthesia keys instead of abruptly jumping scenes mid-burst.
 */
export function markTypingBurst() {
  lastNonNumericKeyTime = performance.now();
}

export function isTypingBurstActive(windowMs = 1400): boolean {
  return performance.now() - lastNonNumericKeyTime < windowMs;
}
