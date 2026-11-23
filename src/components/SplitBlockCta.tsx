import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";

interface SplitBlockCtaProps {
  label: string;
  href: string;
  external?: boolean;
  variant?: "cobalt" | "dark" | "light";
  className?: string;
}

const SPRING_OVERSHOOT = {
  type: "spring" as const,
  stiffness: 420,
  damping: 18,
  mass: 0.75,
};

/**
 * Extrafazant-inspired split-block CTA (.button-052 adaptation):
 * Two joined sharp 0px boxes: left arrow slot [->] and label box [ LABEL ].
 * On hover/focus: rotates -3deg with spring overshoot; left arrow slides away while right arrow emerges.
 */
export function SplitBlockCta({
  label,
  href,
  external = false,
  variant = "cobalt",
  className = "",
}: SplitBlockCtaProps) {
  const [engaged, setEngaged] = useState(false);
  const prefersReduced = useReducedMotion();

  const palette = {
    cobalt: {
      frame: "border-[#131313]",
      arrowLeft: "bg-[#131313] text-white",
      labelBox: "bg-[#0258FF] text-white",
      arrowRight: "bg-[#FACC15] text-[#131313]",
    },
    dark: {
      frame: "border-[#131313]",
      arrowLeft: "bg-[#0258FF] text-white",
      labelBox: "bg-[#131313] text-white",
      arrowRight: "bg-[#0258FF] text-white",
    },
    light: {
      frame: "border-white",
      arrowLeft: "bg-[#FACC15] text-[#131313]",
      labelBox: "bg-[#0258FF] text-white",
      arrowRight: "bg-white text-[#131313]",
    },
  }[variant];

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onHoverStart={() => setEngaged(true)}
      onHoverEnd={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      animate={
        prefersReduced
          ? undefined
          : {
              rotate: engaged ? -3 : 0,
              y: engaged ? -2 : 0,
            }
      }
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={SPRING_OVERSHOOT}
      className={`group inline-flex min-h-[52px] items-stretch rounded-none border-[1.5px] ${palette.frame} font-condensed text-lg font-bold uppercase tracking-[0.04em] no-underline select-none ${className}`}
    >
      {/* Left arrow slot: collapses smoothly on hover/focus */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          prefersReduced
            ? { width: 48, opacity: 1 }
            : {
                width: engaged ? 0 : 48,
                opacity: engaged ? 0 : 1,
              }
        }
        transition={SPRING_OVERSHOOT}
        className={`flex shrink-0 items-center justify-center overflow-hidden border-r-[1.5px] ${palette.frame} ${palette.arrowLeft}`}
        style={{ borderRightWidth: engaged && !prefersReduced ? 0 : 1.5 }}
      >
        <ArrowRightIcon size={20} weight="bold" className="shrink-0" />
      </motion.span>

      {/* Main label slot: stays single-line on desktop */}
      <span
        className={`flex items-center px-5 py-3 whitespace-nowrap transition-colors duration-150 ${palette.labelBox}`}
      >
        {label}
      </span>

      {/* Right arrow slot: emerges on hover/focus */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          prefersReduced
            ? { width: 0, opacity: 0 }
            : {
                width: engaged ? 48 : 0,
                opacity: engaged ? 1 : 0,
              }
        }
        transition={SPRING_OVERSHOOT}
        className={`flex shrink-0 items-center justify-center overflow-hidden ${palette.arrowRight}`}
        style={{
          borderLeftWidth: engaged && !prefersReduced ? 1.5 : 0,
          borderLeftStyle: "solid",
          borderLeftColor: variant === "light" ? "#FFFFFF" : "#131313",
        }}
      >
        <ArrowRightIcon size={20} weight="bold" className="shrink-0" />
      </motion.span>
    </motion.a>
  );
}
