import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

const SCENE_SHORTCUTS: Record<string, string> = {
  "1": "#monolith",
  "2": "#portal",
  "3": "#signal",
};

/**
 * Provides butter-smooth inertia scrolling via Lenis (disabled under prefers-reduced-motion),
 * smooth hash-anchor interception, and keyboard scene shortcuts (1, 2, 3).
 */
export function SmoothScroll() {
  const prefersReduced = Boolean(useReducedMotion());

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!prefersReduced) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    }

    const scrollToSelector = (selector: string) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.05 });
      } else {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
    };

    // Intercept same-page anchor clicks so Lenis glides cleanly
    const onDocumentClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.05 });
      } else {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
      window.history.pushState(null, "", hash);
    };

    // Keyboard shortcuts: press 1, 2, or 3 to jump straight to scenes 01 / 02 / 03
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const activeTag = document.activeElement?.tagName;
      if (
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }
      const selector = SCENE_SHORTCUTS[event.key];
      if (selector) {
        event.preventDefault();
        scrollToSelector(selector);
      }
    };

    document.addEventListener("click", onDocumentClick);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("keydown", onKeyDown);
      if (rafId) window.cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [prefersReduced]);

  return null;
}
