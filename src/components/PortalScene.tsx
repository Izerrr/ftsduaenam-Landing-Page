import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { URLS } from "@/data/services";

interface PortalSceneProps {
  onFloodChange: (active: boolean) => void;
}

const FLOOD_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 28,
};

/**
 * Scene 02: THE PORTAL (Stark Bone #F4F4F0 -> Full-Bleed Electric Cobalt #0258FF Flood)
 * Single monumental interactive gateway: TASKPANEL.
 * Zero explanatory paragraphs; hovering or focusing triggers a full-canvas cobalt flood
 * and magnetic arrow displacement.
 */
export function PortalScene({ onFloodChange }: PortalSceneProps) {
  const [engaged, setEngaged] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const smoothX = useSpring(magX, { stiffness: 220, damping: 22 });
  const smoothY = useSpring(magY, { stiffness: 220, damping: 22 });

  const setPortalActive = (next: boolean) => {
    setEngaged(next);
    onFloodChange(next);
    if (!next) {
      magX.set(0);
      magY.set(0);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (prefersReduced || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
    magX.set(dx);
    magY.set(dy);
  };

  return (
    <section
      id="portal"
      data-scene="portal"
      data-theme="light"
      data-portal-flood={engaged ? "true" : "false"}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#F4F4F0] px-4 py-24 text-[#0B0B0C] sm:px-8"
    >
      {/* Full-bleed Electric Cobalt flood sweep on hover/focus */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          scaleY: engaged ? 1 : 0,
        }}
        transition={prefersReduced ? { duration: 0.12 } : FLOOD_SPRING}
        style={{ transformOrigin: "50% 100%" }}
        className="pointer-events-none absolute inset-0 bg-[#0258FF]"
      />

      {/* Centerpiece single gateway */}
      <div className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center">
        <p
          className={`mb-6 font-condensed text-xs font-bold tracking-[0.26em] uppercase transition-colors duration-200 sm:mb-8 sm:text-sm ${
            engaged ? "text-white/90" : "text-[#4A4A46]"
          }`}
        >
          02 // GATEWAY
        </p>

        <motion.a
          ref={triggerRef}
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setPortalActive(true)}
          onMouseLeave={() => setPortalActive(false)}
          onFocus={() => setPortalActive(true)}
          onBlur={() => setPortalActive(false)}
          onPointerMove={handlePointerMove}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          style={prefersReduced ? undefined : { x: smoothX, y: smoothY }}
          className="group relative inline-flex max-w-full flex-col items-center px-3 py-4 no-underline sm:px-6"
        >
          <span className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-4">
            <span
              className={`font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase transition-colors duration-200 md:text-[clamp(6rem,2.2rem+10vw,13.4rem)] ${
                engaged ? "text-white" : "text-[#0B0B0C]"
              }`}
            >
              TASK
            </span>
            <span
              className={`pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.025em] transition-colors duration-200 md:text-[clamp(6.3rem,2.4rem+10.5vw,14rem)] ${
                engaged ? "text-white" : "text-[#0258FF]"
              }`}
            >
              PANEL
            </span>
            <motion.span
              aria-hidden="true"
              animate={
                prefersReduced
                  ? undefined
                  : {
                      x: engaged ? 8 : 0,
                      y: engaged ? -8 : 0,
                      rotate: engaged ? 4 : 0,
                    }
              }
              transition={FLOOD_SPRING}
              className={`inline-flex self-center transition-colors duration-200 ${
                engaged ? "text-white" : "text-[#0B0B0C]"
              }`}
            >
              <ArrowUpRightIcon
                size={44}
                weight="bold"
                className="h-9 w-9 sm:h-14 sm:w-14 md:h-20 md:w-20"
              />
            </motion.span>
          </span>

          {/* Razor kinetic hairline underneath */}
          <span
            aria-hidden="true"
            className={`mt-3 block h-[2px] w-full origin-left transition-colors duration-200 ${
              engaged ? "bg-white" : "bg-[#0B0B0C]/25"
            }`}
          >
            <motion.span
              initial={false}
              animate={{ scaleX: engaged ? 1 : 0.18 }}
              transition={prefersReduced ? { duration: 0.01 } : FLOOD_SPRING}
              className={`block h-full w-full origin-left ${
                engaged ? "bg-white" : "bg-[#0258FF]"
              }`}
            />
          </span>

          <span
            className={`mt-5 font-condensed text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-200 sm:text-base ${
              engaged ? "text-white" : "text-[#0B0B0C]"
            }`}
          >
            OPEN // TASKPANEL.FTSDUAENAM.WEB.ID
          </span>
        </motion.a>

        <p
          className={`mt-8 font-mono text-xs tracking-[0.12em] uppercase transition-colors duration-200 ${
            engaged ? "text-white/90" : "text-[#4A4A46]"
          }`}
        >
          @student.uns.ac.id &middot; discord oauth2
        </p>

        <a
          href="#signal"
          className={`group mt-12 inline-flex min-h-[44px] items-center gap-2 px-4 font-condensed text-xs font-bold tracking-[0.22em] uppercase transition-colors duration-200 ${
            engaged
              ? "text-white/90 hover:text-white"
              : "text-[#4A4A46] hover:text-[#0B0B0C]"
          }`}
        >
          <span>SIGNAL</span>
          <ArrowDownIcon
            size={14}
            weight="bold"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-y-1"
          />
        </a>
      </div>
    </section>
  );
}
