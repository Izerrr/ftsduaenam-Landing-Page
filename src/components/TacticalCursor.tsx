import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Desktop-only tactical reticle cursor (Lando Norris x Why Zero feel).
 * Uses MotionValues + Springs exclusively for position (zero React re-renders on move)
 * and snaps into locked target brackets whenever hovering elements marked with [data-cursor].
 */
export function TacticalCursor() {
  const prefersReduced = Boolean(useReducedMotion());
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { stiffness: 420, damping: 32, mass: 0.45 });
  const smoothY = useSpring(mouseY, { stiffness: 420, damping: 32, mass: 0.45 });

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

      if (coordRef.current) {
        const x = String(Math.round(event.clientX)).padStart(4, "0");
        const y = String(Math.round(event.clientY)).padStart(4, "0");
        coordRef.current.textContent = `${x}.${y}`;
      }

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
      transition={{ duration: 0.16 }}
      className="pointer-events-none fixed top-0 left-0 z-50 hidden mix-blend-difference md:block"
    >
      {/* Outer reticle / locking brackets */}
      <motion.div
        animate={{
          width: isLocked ? 88 : 30,
          height: isLocked ? 34 : 30,
          x: isLocked ? -44 : -15,
          y: isLocked ? -17 : -15,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="relative flex items-center justify-center border border-white/80"
      >
        {/* Corner notches when locked */}
        <span className="absolute -top-[1px] -left-[1px] h-2 w-2 border-t-2 border-l-2 border-white" />
        <span className="absolute -top-[1px] -right-[1px] h-2 w-2 border-t-2 border-r-2 border-white" />
        <span className="absolute -bottom-[1px] -left-[1px] h-2 w-2 border-b-2 border-l-2 border-white" />
        <span className="absolute -right-[1px] -bottom-[1px] h-2 w-2 border-r-2 border-b-2 border-white" />

        {isLocked ? (
          <span className="font-condensed text-[11px] font-extrabold tracking-[0.18em] uppercase text-white">
            {cursorLabel}
          </span>
        ) : (
          <span className="h-1 w-1 bg-white" />
        )}
      </motion.div>

      {/* Live cryptic coordinate whisper */}
      {!isLocked && (
        <span
          ref={coordRef}
          className="absolute top-4 left-5 font-mono text-[10px] tracking-[0.12em] text-white/75"
        >
          0000.0000
        </span>
      )}
    </motion.div>
  );
}
