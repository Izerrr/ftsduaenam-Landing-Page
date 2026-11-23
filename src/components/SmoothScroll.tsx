import { useEffect, useState } from "react";
import Lenis from "lenis";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { studioSound } from "@/lib/studioSound";

const SCENE_SHORTCUTS: Record<string, { selector: string; index: string }> = {
  "1": { selector: "#monolith", index: "01" },
  "2": { selector: "#portal", index: "02" },
  "3": { selector: "#signal", index: "03" },
};

const INDEX_BY_SELECTOR: Record<string, string> = {
  "#monolith": "01",
  "#portal": "02",
  "#signal": "03",
};

interface ShutterState {
  id: number;
  index: string;
}

/**
 * Provides butter-smooth inertia scrolling via Lenis (disabled under prefers-reduced-motion),
 * smooth hash-anchor interception with a brief cobalt shutter wipe, and keyboard shortcuts (1, 2, 3).
 */
export function SmoothScroll() {
  const prefersReduced = Boolean(useReducedMotion());
  const [shutter, setShutter] = useState<ShutterState | null>(null);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId = 0;
    let swapTimer = 0;
    let clearTimer = 0;
    let shutterSeq = 0;

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

      const targetY = target.getBoundingClientRect().top + window.scrollY;
      const distance = Math.abs(targetY - window.scrollY);
      const sceneIndex = INDEX_BY_SELECTOR[selector];

      if (!prefersReduced && distance > 200 && sceneIndex) {
        window.clearTimeout(swapTimer);
        window.clearTimeout(clearTimer);

        studioSound.playShutter();
        setShutter({ id: ++shutterSeq, index: sceneIndex });

        // Cut cleanly while curtain covers 100% viewport, then lift out of frame
        swapTimer = window.setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(target, { immediate: true });
          } else {
            target.scrollIntoView({ behavior: "auto" });
          }
          window.history.pushState(null, "", selector);
        }, 160);

        clearTimer = window.setTimeout(() => {
          setShutter(null);
        }, 380);
        return;
      }

      if (lenis) {
        lenis.scrollTo(target, { duration: 1.05 });
      } else {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
      window.history.pushState(null, "", selector);
    };

    const onJumpEvent = (event: Event) => {
      const selector = (event as CustomEvent<string>).detail;
      if (typeof selector === "string") {
        scrollToSelector(selector);
      }
    };

    // Intercept same-page anchor clicks cleanly
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
      scrollToSelector(hash);
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
      const shortcut = SCENE_SHORTCUTS[event.key];
      if (shortcut) {
        event.preventDefault();
        scrollToSelector(shortcut.selector);
      }
    };

    window.addEventListener("fts:jump", onJumpEvent);
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(clearTimer);
      window.removeEventListener("fts:jump", onJumpEvent);
      document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("keydown", onKeyDown);
      if (rafId) window.cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [prefersReduced]);

  return (
    <AnimatePresence>
      {shutter && !prefersReduced && (
        <motion.div
          key={shutter.id}
          aria-hidden="true"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center bg-[#0258FF] text-white"
        >
          <span className="font-condensed text-6xl font-extrabold tracking-[-0.04em] sm:text-8xl">
            {shutter.index}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
