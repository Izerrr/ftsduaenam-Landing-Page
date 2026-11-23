import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { URLS } from "@/data/services";
import { ScrambleText } from "@/components/ScrambleText";

interface PortalSceneProps {
  onFloodChange: (active: boolean) => void;
}

const FLOOD_SPRING = {
  type: "spring" as const,
  stiffness: 250,
  damping: 26,
};

const BRACKET_SPRING = {
  type: "spring" as const,
  stiffness: 360,
  damping: 24,
};

/**
 * Scene 02: THE PORTAL (Stark Bone #F4F4F0 -> Full-Bleed Electric Cobalt #0258FF Flood)
 * Single monumental interactive gateway: TASKPANEL.
 * Features scroll-rotating blueprint reticle arcs, scroll-driven watermark bands,
 * 4 snapping target-lock brackets, and full-viewport cobalt flood on hover/focus.
 */
export function PortalScene({ onFloodChange }: PortalSceneProps) {
  const [engaged, setEngaged] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ringRotate = useTransform(scrollYProgress, [0, 1], [-32, 32]);
  const topBandX = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"]);
  const bottomBandX = useTransform(scrollYProgress, [0, 1], ["8%", "-10%"]);

  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const smoothX = useSpring(magX, { stiffness: 210, damping: 22 });
  const smoothY = useSpring(magY, { stiffness: 210, damping: 22 });

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
    const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 26;
    const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    magX.set(dx);
    magY.set(dy);
  };

  return (
    <section
      ref={sectionRef}
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

      {/* Architectural rotating reticle rings behind gateway */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 800 800"
        fill="none"
        style={prefersReduced ? undefined : { rotate: ringRotate }}
        className={`pointer-events-none absolute h-[min(92vw,760px)] w-[min(92vw,760px)] transition-colors duration-200 ${
          engaged ? "text-white/20" : "text-[#0B0B0C]/10"
        }`}
      >
        <circle cx="400" cy="400" r="340" stroke="currentColor" strokeWidth="1" strokeDasharray="6 10" />
        <circle cx="400" cy="400" r="245" stroke="currentColor" strokeWidth="1" />
        <line x1="400" y1="20" x2="400" y2="110" stroke="currentColor" strokeWidth="1.2" />
        <line x1="400" y1="690" x2="400" y2="780" stroke="currentColor" strokeWidth="1.2" />
        <line x1="20" y1="400" x2="110" y2="400" stroke="currentColor" strokeWidth="1.2" />
        <line x1="690" y1="400" x2="780" y2="400" stroke="currentColor" strokeWidth="1.2" />
        <line x1="150" y1="650" x2="650" y2="150" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      </motion.svg>

      {/* Scroll-driven top & bottom ghosted kinetic bands */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-16 overflow-hidden py-2 transition-colors duration-200 sm:top-20 ${
          engaged ? "text-white/15" : "text-[#0B0B0C]/[0.07]"
        }`}
      >
        <motion.p
          style={prefersReduced ? undefined : { x: topBandX }}
          className="w-max font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl"
        >
          TASKPANEL // GATEWAY // XXVI // TASKPANEL // GATEWAY // XXVI // TASKPANEL // GATEWAY //
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-16 overflow-hidden py-2 transition-colors duration-200 sm:bottom-20 ${
          engaged ? "text-white/15" : "text-[#0B0B0C]/[0.07]"
        }`}
      >
        <motion.p
          style={prefersReduced ? undefined : { x: bottomBandX }}
          className="w-max font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl"
        >
          SINGLE ENTRY // NO NOISE // WORKSPACE // SINGLE ENTRY // NO NOISE // WORKSPACE //
        </motion.p>
      </div>

      {/* Centerpiece single monumental gateway */}
      <div className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center">
        <p
          className={`mb-7 font-condensed text-xs font-bold tracking-[0.28em] uppercase transition-colors duration-200 sm:mb-9 sm:text-sm ${
            engaged ? "text-white" : "text-[#4A4A46]"
          }`}
        >
          02 // GATEWAY
        </p>

        <motion.a
          ref={triggerRef}
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="ENTER"
          onMouseEnter={() => setPortalActive(true)}
          onMouseLeave={() => setPortalActive(false)}
          onFocus={() => setPortalActive(true)}
          onBlur={() => setPortalActive(false)}
          onPointerMove={handlePointerMove}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          style={prefersReduced ? undefined : { x: smoothX, y: smoothY }}
          className="group relative inline-flex max-w-full flex-col items-center px-6 py-7 no-underline sm:px-12 sm:py-10"
        >
          {/* 4 Snapping Tactical Target-Lock Corner Brackets */}
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : -14, y: engaged ? 0 : -14 }
            }
            transition={BRACKET_SPRING}
            className={`pointer-events-none absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 transition-colors duration-200 sm:h-8 sm:w-8 ${
              engaged ? "border-white" : "border-[#0B0B0C]"
            }`}
          />
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : 14, y: engaged ? 0 : -14 }
            }
            transition={BRACKET_SPRING}
            className={`pointer-events-none absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 transition-colors duration-200 sm:h-8 sm:w-8 ${
              engaged ? "border-white" : "border-[#0B0B0C]"
            }`}
          />
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : -14, y: engaged ? 0 : 14 }
            }
            transition={BRACKET_SPRING}
            className={`pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 transition-colors duration-200 sm:h-8 sm:w-8 ${
              engaged ? "border-white" : "border-[#0B0B0C]"
            }`}
          />
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : 14, y: engaged ? 0 : 14 }
            }
            transition={BRACKET_SPRING}
            className={`pointer-events-none absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 transition-colors duration-200 sm:h-8 sm:w-8 ${
              engaged ? "border-white" : "border-[#0B0B0C]"
            }`}
          />

          {/* Monumental TASK + PANEL display lockup */}
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
                      x: engaged ? 10 : 0,
                      y: engaged ? -10 : 0,
                      rotate: engaged ? 5 : 0,
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
              engaged ? "bg-white/35" : "bg-[#0B0B0C]/20"
            }`}
          >
            <motion.span
              initial={false}
              animate={{ scaleX: engaged ? 1 : 0.2 }}
              transition={prefersReduced ? { duration: 0.01 } : FLOOD_SPRING}
              className={`block h-full w-full origin-left ${
                engaged ? "bg-white" : "bg-[#0258FF]"
              }`}
            />
          </span>

          <span
            className={`mt-5 font-condensed text-sm font-extrabold tracking-[0.22em] uppercase transition-colors duration-200 sm:text-base ${
              engaged ? "text-white" : "text-[#0B0B0C]"
            }`}
          >
            <ScrambleText text="BREACH // TASKPANEL.FTSDUAENAM.WEB.ID" />
          </span>
        </motion.a>

        <p
          className={`mt-8 font-mono text-xs tracking-[0.16em] uppercase transition-colors duration-200 ${
            engaged ? "text-white" : "text-[#4A4A46]"
          }`}
        >
          AUTH // @student.uns.ac.id &middot; discord oauth2
        </p>

        <a
          href="#signal"
          data-cursor="NEXT"
          className={`group mt-10 inline-flex min-h-[44px] items-center gap-2 px-4 font-condensed text-xs font-bold tracking-[0.24em] uppercase transition-colors duration-200 ${
            engaged
              ? "text-white hover:text-white"
              : "text-[#4A4A46] hover:text-[#0B0B0C]"
          }`}
        >
          <span>03 // SIGNAL</span>
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
