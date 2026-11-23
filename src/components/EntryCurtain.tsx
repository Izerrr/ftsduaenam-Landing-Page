import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FtsLogo } from "@/components/FtsLogo";

/**
 * Rapid 0.85s obsidian monolith shutter reveal on initial arrival.
 * Displays the chamfered XXVI sigil and rapid 00 -> 26 boot counter before parting vertically.
 * Skipped automatically for users with prefers-reduced-motion.
 */
export function EntryCurtain() {
  const prefersReduced = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(true);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;

    const start = performance.now();
    const duration = 560;
    let rafId = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.round(eased * 26));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    const timer = window.setTimeout(() => setVisible(false), 820);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timer);
    };
  }, [prefersReduced]);

  const showCurtain = visible && !prefersReduced;

  return (
    <AnimatePresence>
      {showCurtain && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[70] flex flex-col"
        >
          {/* Top blade */}
          <motion.div
            initial={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
            className="flex-1 border-b border-white/15 bg-[#0B0B0C]"
          />

          {/* Bottom blade */}
          <motion.div
            initial={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
            className="flex-1 border-t border-white/15 bg-[#0B0B0C]"
          />

          {/* Center sigil + cipher counter */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.24 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
          >
            <FtsLogo compact className="h-14 w-14 text-white" />
            <div className="flex items-baseline gap-3">
              <span className="font-condensed text-xs font-bold tracking-[0.3em] uppercase text-[#9A9A95]">
                FTSDUAENAM
              </span>
              <span className="font-mono text-lg font-bold tracking-[0.12em] text-[#0258FF]">
                {String(counter).padStart(2, "0")}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
