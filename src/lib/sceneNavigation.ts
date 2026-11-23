/**
 * Dispatches a scene jump handled by SmoothScroll (Lenis + cobalt shutter on long jumps).
 */
export function jumpToScene(selector: string) {
  window.dispatchEvent(new CustomEvent("fts:jump", { detail: selector }));
}
