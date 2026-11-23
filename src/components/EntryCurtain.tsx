import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FtsLogo } from "@/components/FtsLogo";

/**
 * Uncanny waking eye-slit opening reveal on initial arrival (0.95s).
 * A thin horizontal slit of cold cobalt/bone light opens out of pitch darkness,
 * briefly revealing the Watcher sigil before parting silently into the abyss.
 * Skipped automatically under prefers-reduced-motion.
 */
export function EntryCurtain() {
  const prefersReduced = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReduced) return;
    const timer = window.setTimeout(() => setVisible(false), 920);
    return () => window.clearTimeout(timer);
  }, [prefersReduced]);

  const showCurtain = visible && !prefersReduced;

  return (
    <AnimatePresence>
      {showCurtain && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[70] flex flex-col bg-[#060607]"
        >
          {/* Upper eyelid shutter */}
          <motion.div
            initial={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.68, ease: [0.76, 0, 0.24, 1] }}
            className="flex-1 bg-[#060607]"
          />

          {/* Razor thin waking light slit */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.9 }}
            exit={{ scaleX: 1.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#0258FF] to-transparent"
          />

          {/* Lower eyelid shutter */}
          <motion.div
            initial={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.68, ease: [0.76, 0, 0.24, 1] }}
            className="flex-1 bg-[#060607]"
          />

          {/* Silent centered Watcher sigil awakening */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#F2F2EE]"
          >
            <FtsLogo compact className="h-14 w-16 text-[#F2F2EE]" />
            <span className="font-editorial text-sm italic tracking-[0.28em] text-[#9B9B96]">
              xxvi
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
