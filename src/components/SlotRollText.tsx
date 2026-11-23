import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SlotRollTextProps {
  text: string;
  /** Optional controlled active state (defaults to self-managed hover/focus) */
  active?: boolean;
  className?: string;
  /** Tailwind text color class for the incoming rolled-in copy */
  hoverColorClass?: string;
  /** Per-character stagger in seconds */
  stagger?: number;
}

/**
 * OFF+BRAND / landonorris.com signature staggered vertical barrel-roll text effect.
 * On hover/focus, each character scrolls cleanly upward inside a clipped line box while its
 * duplicate rises in from below, creating a fluid diagonal kinetic typography wave.
 */
export function SlotRollText({
  text,
  active,
  className = "",
  hoverColorClass = "text-[#0258FF]",
  stagger = 0.038,
}: SlotRollTextProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const [internalActive, setInternalActive] = useState(false);

  const isControlled = typeof active === "boolean";
  const isHovered = (isControlled ? active : internalActive) && !prefersReduced;

  return (
    <span
      aria-label={text}
      onMouseEnter={isControlled ? undefined : () => setInternalActive(true)}
      onMouseLeave={isControlled ? undefined : () => setInternalActive(false)}
      className={`inline-flex items-baseline ${className}`}
    >
      {Array.from(text).map((char, idx) => {
        const displayChar = char === " " ? "\u00A0" : char;
        const delay = idx * stagger;

        if (prefersReduced) {
          return (
            <span
              key={`${idx}-${char}`}
              aria-hidden="true"
              className={
                (isControlled ? active : internalActive) ? hoverColorClass : ""
              }
            >
              {displayChar}
            </span>
          );
        }

        return (
          <span
            key={`${idx}-${char}`}
            aria-hidden="true"
            className="relative inline-block overflow-hidden py-[0.05em] leading-[0.92]"
          >
            {/* Outgoing glyph rolling upward out of frame */}
            <motion.span
              initial={false}
              animate={{
                y: isHovered ? "-120%" : "0%",
                opacity: isHovered ? 0.35 : 1,
              }}
              transition={{
                duration: 0.62,
                ease: [0.16, 1, 0.3, 1],
                delay,
              }}
              className="block will-change-transform"
            >
              {displayChar}
            </motion.span>

            {/* Incoming glyph rolling smoothly up from below */}
            <motion.span
              initial={false}
              animate={{
                y: isHovered ? "0%" : "120%",
              }}
              transition={{
                duration: 0.62,
                ease: [0.16, 1, 0.3, 1],
                delay,
              }}
              className={`pointer-events-none absolute inset-x-0 top-[0.05em] block will-change-transform ${hoverColorClass}`}
            >
              {displayChar}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
