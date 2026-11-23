import { motion, useReducedMotion } from "motion/react";

interface KineticTextProps {
  text: string;
  className?: string;
  hoverClassName?: string;
}

/**
 * Splits a display word into individually spring-reactive glyphs while preserving
 * an accessible whole-word aria-label for screen readers.
 * Keeps hover transforms purely geometric so parent CSS hover colors stay 100% uniform.
 */
export function KineticText({
  text,
  className = "",
  hoverClassName = "",
}: KineticTextProps) {
  const prefersReduced = Boolean(useReducedMotion());

  return (
    <span aria-label={text} className={`inline-flex items-baseline ${className}`}>
      {Array.from(text).map((char, idx) => (
        <motion.span
          key={`${idx}-${char}`}
          aria-hidden="true"
          whileHover={
            prefersReduced
              ? undefined
              : {
                  y: -8,
                  scale: 1.05,
                }
          }
          transition={{ type: "spring", stiffness: 460, damping: 18 }}
          className={`inline-block will-change-transform ${hoverClassName}`}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
