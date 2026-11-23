import { useScroll, useSpring, useTransform, useVelocity } from "motion/react";

/**
 * Returns a gentle, physically-damped vertical skew value driven by page scroll velocity.
 * Gives giant editorial typography tactile inertia without jitter or React re-renders.
 */
export function useScrollSkew(maxDeg = 3) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const rawSkew = useTransform(velocity, [-2600, 0, 2600], [-maxDeg, 0, maxDeg]);
  return useSpring(rawSkew, { stiffness: 220, damping: 32, mass: 0.5 });
}
