import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Subtle magnetic pointer pull wrapper for studio pill buttons.
 * Uses MotionValues + Springs exclusively (zero React state re-renders) and respects reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.24,
  className = "inline-flex",
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 20, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 280, damping: 20, mass: 0.4 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width * 0.5)) * strength;
    const dy = (event.clientY - (rect.top + rect.height * 0.5)) * strength;
    rawX.set(dx);
    rawY.set(dy);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={prefersReduced ? undefined : { x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
