import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Uncanny desktop watcher cursor (mix-blend-difference).
 * Tracks the pointer with hypnotic slow-lag spring inertia; when hovering a threshold
 * marked with [data-cursor], the thin circle widens into an eerie diamond eye-slit.
 */
export function WatcherCursor() {
  const prefersReduced = Boolean(useReducedMotion());
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);
  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 28, mass: 0.65 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 28, mass: 0.65 });

  useEffect(() => {
    if (prefersReduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [prefersReduced]);

  useEffect(() => {
    if (!enabled) return;

    const onPointerMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      setVisible(true);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const nextLabel = target?.dataset.cursor ?? null;
      setCursorLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };

    const onPointerLeave = () => {
      setVisible(false);
      setCursorLabel(null);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled || prefersReduced) return null;

  const isLocked = Boolean(cursorLabel);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
      }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.22 }}
      className="pointer-events-none fixed top-0 left-0 z-50 hidden mix-blend-difference md:block"
    >
      <motion.div
        animate={{
          width: isLocked ? 72 : 26,
          height: isLocked ? 72 : 26,
          x: isLocked ? -36 : -13,
          y: isLocked ? -36 : -13,
          rotate: isLocked ? 45 : 0,
          borderRadius: isLocked ? "0%" : "9999px",
        }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative flex items-center justify-center border border-white/80"
      >
        {isLocked ? (
          <span className="-rotate-45 font-editorial text-xs italic tracking-[0.2em] text-white">
            {cursorLabel}
          </span>
        ) : (
          <span className="h-2.5 w-[1.5px] bg-white" />
        )}
      </motion.div>
    </motion.div>
  );
}
