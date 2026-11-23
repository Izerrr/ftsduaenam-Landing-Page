import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type CursorState =
  | { mode: "dot" }
  | { mode: "ring" }
  | { mode: "pill"; label: string }
  | { mode: "hidden" };

/**
 * Clean minimalist studio cursor (OFF+BRAND mix-blend-difference style).
 * Desktop fine-pointer only; expands smoothly into a ring over links/buttons
 * or a crisp pill over labeled targets, and yields cleanly when a scene shows its own floating card.
 */
export function StudioCursor() {
  const prefersReduced = Boolean(useReducedMotion());
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CursorState>({ mode: "dot" });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { stiffness: 460, damping: 34, mass: 0.4 });
  const smoothY = useSpring(mouseY, { stiffness: 460, damping: 34, mass: 0.4 });

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

      const el = event.target as HTMLElement | null;
      if (el?.closest("[data-cursor-hide='true']")) {
        setState((prev) => (prev.mode === "hidden" ? prev : { mode: "hidden" }));
        return;
      }

      const labeled = el?.closest<HTMLElement>("[data-cursor]");
      if (labeled?.dataset.cursor) {
        const label = labeled.dataset.cursor;
        setState((prev) =>
          prev.mode === "pill" && prev.label === label
            ? prev
            : { mode: "pill", label }
        );
        return;
      }

      if (el?.closest("a, button")) {
        setState((prev) => (prev.mode === "ring" ? prev : { mode: "ring" }));
        return;
      }

      setState((prev) => (prev.mode === "dot" ? prev : { mode: "dot" }));
    };

    const onPointerLeave = () => {
      setVisible(false);
      setState({ mode: "dot" });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled || prefersReduced) return null;

  const isPill = state.mode === "pill";
  const isRing = state.mode === "ring";
  const isHidden = state.mode === "hidden";

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: smoothX, y: smoothY }}
      animate={{ opacity: visible && !isHidden ? 1 : 0 }}
      transition={{ duration: 0.16 }}
      className="pointer-events-none fixed top-0 left-0 z-[60] hidden mix-blend-difference md:block"
    >
      <motion.div
        animate={{
          width: isPill ? 86 : isRing ? 38 : 10,
          height: isPill ? 32 : isRing ? 38 : 10,
          x: isPill ? -43 : isRing ? -19 : -5,
          y: isPill ? -16 : isRing ? -19 : -5,
          backgroundColor: isRing ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)",
          borderWidth: isRing ? 1.5 : 0,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="flex items-center justify-center rounded-full border-white text-[#111112]"
      >
        {isPill && (
          <span className="font-condensed text-[11px] font-extrabold tracking-[0.14em] uppercase whitespace-nowrap">
            {state.label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
