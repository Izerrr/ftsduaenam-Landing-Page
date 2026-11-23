import { motion, useReducedMotion } from "motion/react";

interface SignatureDrawProps {
  className?: string;
  trigger?: "mount" | "inView";
  stroke?: string;
}

/**
 * Dynamic SVG stroke line-draw ribbon inspired by Lando Norris's animated vector signature.
 * Animates stroke pathLength from 0 to 1 smoothly using Motion on mount or viewport entry.
 */
export function SignatureDraw({
  className = "h-16 w-auto",
  trigger = "mount",
  stroke = "#0258FF",
}: SignatureDrawProps) {
  const prefersReduced = Boolean(useReducedMotion());

  const animateProps =
    trigger === "mount"
      ? {
          initial: prefersReduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.2 },
          animate: { pathLength: 1, opacity: 1 },
        }
      : {
          initial: prefersReduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.2 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, amount: 0.5 },
        };

  return (
    <svg
      viewBox="0 0 360 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Sweeping expressive kinetic stroke ("f26" abstract ribbon) */}
      <motion.path
        d="M14 72 C 42 22, 74 12, 82 32 C 90 54, 48 80, 74 78 C 102 76, 134 24, 166 24 C 194 24, 166 72, 200 68 C 232 64, 260 18, 286 24 C 306 29, 274 68, 304 66 C 324 64, 336 48, 348 40"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...animateProps}
        transition={{
          pathLength: { duration: prefersReduced ? 0 : 1.35, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.25 },
        }}
      />
      <motion.path
        d="M112 82 C 176 74, 246 72, 338 78"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
        {...animateProps}
        transition={{
          pathLength: {
            duration: prefersReduced ? 0 : 0.8,
            delay: prefersReduced ? 0 : 0.72,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: { duration: 0.2, delay: prefersReduced ? 0 : 0.72 },
        }}
      />
    </svg>
  );
}
