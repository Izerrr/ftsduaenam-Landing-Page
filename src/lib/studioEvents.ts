export function dispatchSynthSlice(index: number) {
  window.dispatchEvent(new CustomEvent<number>("fts:synth-slice", { detail: index }));
}

export function subscribeSynthSlice(handler: (index: number) => void) {
  const onEvent = (event: Event) => {
    handler((event as CustomEvent<number>).detail);
  };
  window.addEventListener("fts:synth-slice", onEvent);
  return () => window.removeEventListener("fts:synth-slice", onEvent);
}

export function dispatchClearInk() {
  window.dispatchEvent(new CustomEvent("fts:clear-ink"));
}

export function subscribeClearInk(handler: () => void) {
  window.addEventListener("fts:clear-ink", handler);
  return () => window.removeEventListener("fts:clear-ink", handler);
}

export function dispatchCobaltWave() {
  window.dispatchEvent(new CustomEvent("fts:cobalt-wave"));
}

export function subscribeCobaltWave(handler: () => void) {
  window.addEventListener("fts:cobalt-wave", handler);
  return () => window.removeEventListener("fts:cobalt-wave", handler);
}

export function toggleStudioInvert(force?: boolean): boolean {
  const root = document.documentElement;
  if (typeof force === "boolean") {
    root.classList.toggle("studio-inverted", force);
    return force;
  }
  return root.classList.toggle("studio-inverted");
}
