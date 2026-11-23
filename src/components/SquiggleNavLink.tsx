import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SquiggleNavLinkProps {
  label: string;
  href: string;
  onClick?: () => void;
}

/**
 * Editorial navigation link with a hand-drawn SVG squiggle underline that draws in smoothly on hover/focus.
 */
export function SquiggleNavLink({ label, href, onClick }: SquiggleNavLinkProps) {
  const [active, setActive] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="relative inline-flex min-h-[44px] items-center px-3.5 py-2 font-condensed text-[0.95rem] font-bold uppercase tracking-[0.06em] text-[#131313] transition-colors hover:text-[#0258FF]"
    >
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 88 10"
        fill="none"
        preserveAspectRatio="none"
        className="pointer-events-none absolute right-2.5 bottom-1.5 left-2.5 h-[8px] w-[calc(100%-1.25rem)] overflow-visible"
      >
        <motion.path
          d="M1 6.5C11 2 20 8.5 31 5C42 1.5 52 8.5 64 4.8C73 2 80 6.8 87 4.2"
          stroke="#0258FF"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={false}
          animate={{
            pathLength: active ? 1 : 0,
            opacity: active ? 1 : 0,
          }}
          transition={
            prefersReduced
              ? { duration: 0.01 }
              : {
                  pathLength: { type: "spring", stiffness: 360, damping: 24 },
                  opacity: { duration: 0.12 },
                }
          }
        />
      </svg>
    </a>
  );
}
