import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·#";

interface ScrambleTextProps {
  text: string;
  className?: string;
}

/**
 * Interactive hover/focus cipher-scramble text for cryptic editorial tags.
 * Never loops idly; triggers only on user interaction and stays static under prefers-reduced-motion.
 */
export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const triggerScramble = () => {
    if (prefersReduced) return;
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);

    let iteration = 0;
    const step = () => {
      iteration += 0.65;
      const next = text
        .split("")
        .map((char, idx) => {
          if (char === " " || char === "/" || char === "·") return char;
          if (idx < iteration) return text[idx];
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(next);

      if (iteration < text.length) {
        frameRef.current = window.requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };

    frameRef.current = window.requestAnimationFrame(step);
  };

  return (
    <span
      onMouseEnter={triggerScramble}
      className={className}
    >
      {display}
    </span>
  );
}
