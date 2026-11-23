import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FtsLogo } from "@/components/FtsLogo";

/**
 * Crisp 0.78s studio intro curtain inspired by OFF+BRAND / landonorris.com.
 * Counts 00 -> 26 alongside the FTS26 monogram and cobalt progress wipe before lifting cleanly.
 * Automatically skipped when prefers-reduced-motion is enabled.
 */
export function StudioPreloader() {
  const prefersReduced = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;

    const start = performance.now();
    const countDuration = 540;
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / countDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 26));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    const hideTimer = window.setTimeout(() => setVisible(false), 780);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(hideTimer);
    };
  }, [prefersReduced]);

  const show = visible && !prefersReduced;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.64, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#111112] px-6 text-[#F4F4EE]"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            <FtsLogo
              numberText={String(count).padStart(2, "0")}
              className="h-11 w-auto text-[#F4F4EE] sm:h-13"
            />
            <div className="h-[2px] w-36 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full origin-left bg-[#0258FF]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
