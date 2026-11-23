import { motion, useReducedMotion } from "motion/react";

interface KineticTextProps {
  text: string;
  className?: string;
  hoverColor?: string;
}

/**
 * Splits a display word into individually spring-reactive glyphs while preserving
 * an accessible whole-word aria-label for screen readers.
 */
export function KineticText({
  text,
  className = "",
  hoverColor,
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
                  ...(hoverColor ? { color: hoverColor } : {}),
                }
          }
          transition={{ type: "spring", stiffness: 460, damping: 18 }}
          className="inline-block will-change-transform"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
