import { motion, useReducedMotion } from "motion/react";

interface SignatureDrawProps {
  className?: string;
  trigger?: "mount" | "inView";
  stroke?: string;
}

/**
 * Sleek sweeping SVG stroke signature flourish inspired by Lando Norris's animated vector mark.
 * Animates stroke pathLength from 0 to 1 smoothly on mount or viewport entry.
 */
export function SignatureDraw({
  className = "h-12 w-auto",
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
      viewBox="0 0 320 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <motion.path
        d="M16 48 C 72 16, 128 10, 146 26 C 158 36, 118 52, 136 48 C 168 41, 224 22, 304 18"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...animateProps}
        transition={{
          pathLength: { duration: prefersReduced ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2 },
        }}
      />
      <motion.path
        d="M162 46 C 216 38, 266 34, 300 35"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        {...animateProps}
        transition={{
          pathLength: {
            duration: prefersReduced ? 0 : 0.7,
            delay: prefersReduced ? 0 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: { duration: 0.2, delay: prefersReduced ? 0 : 0.65 },
        }}
      />
    </svg>
  );
}
