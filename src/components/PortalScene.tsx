import { useEffect, useRef, useState } from "react";
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
import { useScrollSkew } from "@/hooks/useScrollSkew";

interface PortalSceneProps {
  onFloodChange: (active: boolean) => void;
}

const FLOOD_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

/**
 * Scene 02: THE SINGLE PORTAL (Warm Off-White #F4F4EE -> Electric Cobalt #0258FF Flood)
 * Features:
 * - Sheet-over-sheet parallax tuck (scales gently down as Scene 03 rises over it)
 * - Scroll-velocity typography skew + organic blob breathing morph on hover
 * - Full-bleed Electric Cobalt flood + spring-lagged floating studio preview pill
 */
export function PortalScene({ onFloodChange }: PortalSceneProps) {
  const [engaged, setEngaged] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const scrollSkew = useScrollSkew(2.6);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setHasFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Full pass scroll for rotating contour + kinetic watermark strips
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Exit scroll for Sheet-Over-Sheet depth tuck as Scene 03 slides up over Scene 02
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const tuckScale = useTransform(exitProgress, [0, 1], [1, 0.92]);
  const tuckY = useTransform(exitProgress, [0, 1], [0, 44]);
  const tuckOpacity = useTransform(exitProgress, [0.15, 1], [1, 0.58]);

  const blobRotate = useTransform(scrollYProgress, [0, 1], [-18, 22]);
  const topBandX = useTransform(scrollYProgress, [0, 1], ["-6%", "8%"]);
  const bottomBandX = useTransform(scrollYProgress, [0, 1], ["6%", "-8%"]);

  // Magnetic headline pull
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const smoothX = useSpring(magX, { stiffness: 200, damping: 24 });
  const smoothY = useSpring(magY, { stiffness: 200, damping: 24 });

  // Spring-lagged cursor-following preview pill
  const cardRawX = useMotionValue(0);
  const cardRawY = useMotionValue(0);
  const cardX = useSpring(cardRawX, { stiffness: 160, damping: 22, mass: 0.8 });
  const cardY = useSpring(cardRawY, { stiffness: 160, damping: 22, mass: 0.8 });

  const setPortalActive = (next: boolean) => {
    setEngaged(next);
    onFloodChange(next);
    if (!next) {
      magX.set(0);
      magY.set(0);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (prefersReduced || !triggerRef.current || !sectionRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const sectionRect = sectionRef.current.getBoundingClientRect();

    const dx = ((event.clientX - triggerRect.left) / triggerRect.width - 0.5) * 18;
    const dy = ((event.clientY - triggerRect.top) / triggerRect.height - 0.5) * 14;
    magX.set(dx);
    magY.set(dy);

    cardRawX.set(event.clientX - sectionRect.left + 22);
    cardRawY.set(event.clientY - sectionRect.top - 54);
  };

  return (
    <section
      ref={sectionRef}
      id="portal"
      data-scene="portal"
      data-theme="light"
      data-portal-flood={engaged ? "true" : "false"}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#F4F4EE] px-4 py-24 text-[#111112] sm:px-8"
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

      {/* Inner sheet that gently tucks back as Scene 03 rises over it */}
      <motion.div
        style={
          prefersReduced
            ? undefined
            : {
                scale: tuckScale,
                y: tuckY,
                opacity: tuckOpacity,
              }
        }
        className="relative flex w-full flex-1 flex-col items-center justify-center"
      >
        {/* Organic vector blob contour rotating on scroll + breathing wider on hover */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 640 640"
          fill="none"
          style={prefersReduced ? undefined : { rotate: blobRotate }}
          animate={
            prefersReduced
              ? undefined
              : {
                  scale: engaged ? 1.12 : 1,
                }
          }
          transition={FLOOD_SPRING}
          className={`pointer-events-none absolute h-[min(86vw,640px)] w-[min(86vw,640px)] transition-colors duration-200 ${
            engaged ? "text-white/22" : "text-[#111112]/10"
          }`}
        >
          <path
            d="M320 62C424 54 532 108 564 206C596 304 548 424 468 498C388 572 264 596 172 544C80 492 48 378 66 270C84 162 216 70 320 62Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M320 116C398 112 484 156 508 232C532 308 494 402 432 458C370 514 274 532 204 492C134 452 108 364 122 280C136 196 242 120 320 116Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
        </motion.svg>

        {/* Scroll-driven top & bottom ghosted kinetic bands */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden py-2 transition-colors duration-200 ${
            engaged ? "text-white/15" : "text-[#111112]/[0.06]"
          }`}
        >
          <motion.p
            style={prefersReduced ? undefined : { x: topBandX }}
            className="w-max font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl"
          >
            TASKPANEL &middot; FTS26 &middot; WORKSPACE &middot; TASKPANEL &middot; FTS26 &middot; WORKSPACE &middot;
          </motion.p>
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden py-2 transition-colors duration-200 ${
            engaged ? "text-white/15" : "text-[#111112]/[0.06]"
          }`}
        >
          <motion.p
            style={prefersReduced ? undefined : { x: bottomBandX }}
            className="w-max font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl"
          >
            FTSDUAENAM.WEB.ID &middot; 2026 &middot; FTSDUAENAM.WEB.ID &middot; 2026 &middot;
          </motion.p>
        </div>

        {/* Centerpiece Single Portal */}
        <motion.div
          style={prefersReduced ? undefined : { skewY: scrollSkew }}
          className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center"
        >
          <p
            className={`mb-6 font-condensed text-xs font-bold tracking-[0.26em] uppercase transition-colors duration-200 sm:mb-8 sm:text-sm ${
              engaged ? "text-white" : "text-[#4A4A45]"
            }`}
          >
            02 / WORKSPACE
          </p>

          <motion.a
            ref={triggerRef}
            href={URLS.taskpanel}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hide="true"
            onMouseEnter={() => setPortalActive(true)}
            onMouseLeave={() => setPortalActive(false)}
            onFocus={() => setPortalActive(true)}
            onBlur={() => setPortalActive(false)}
            onPointerMove={handlePointerMove}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            style={prefersReduced ? undefined : { x: smoothX, y: smoothY }}
            className="group relative inline-flex max-w-full flex-col items-center px-4 py-6 no-underline sm:px-10 sm:py-8"
          >
            <span className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-4">
              <motion.span
                animate={prefersReduced ? undefined : { x: engaged ? -7 : 0 }}
                transition={FLOOD_SPRING}
                className={`font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase transition-colors duration-200 md:text-[clamp(6rem,2.2rem+10vw,13.4rem)] ${
                  engaged ? "text-white" : "text-[#111112]"
                }`}
              >
                TASK
              </motion.span>
              <motion.span
                animate={prefersReduced ? undefined : { x: engaged ? 7 : 0 }}
                transition={FLOOD_SPRING}
                className={`pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.025em] transition-colors duration-200 md:text-[clamp(6.3rem,2.4rem+10.5vw,14rem)] ${
                  engaged ? "text-white" : "text-[#004BE0]"
                }`}
              >
                PANEL
              </motion.span>
            </span>

            {/* Razor kinetic sweep hairline */}
            <span
              aria-hidden="true"
              className={`mt-3 block h-[2px] w-full transition-colors duration-200 ${
                engaged ? "bg-white/35" : "bg-[#111112]/20"
              }`}
            >
              <motion.span
                initial={false}
                animate={{ scaleX: engaged ? 1 : 0.22 }}
                transition={prefersReduced ? { duration: 0.01 } : FLOOD_SPRING}
                className={`block h-full w-full origin-left ${
                  engaged ? "bg-white" : "bg-[#0258FF]"
                }`}
              />
            </span>

            <span
              className={`mt-5 inline-flex items-center gap-2 font-condensed text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-200 sm:text-base ${
                engaged ? "text-white" : "text-[#111112]"
              }`}
            >
              <span>TASKPANEL.FTSDUAENAM.WEB.ID</span>
              <ArrowUpRightIcon
                size={16}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </motion.a>

          <p
            className={`mt-6 font-mono text-xs tracking-[0.14em] uppercase transition-colors duration-200 ${
              engaged ? "text-white" : "text-[#4A4A45]"
            }`}
          >
            @student.uns.ac.id &middot; discord
          </p>

          <a
            href="#signal"
            data-cursor="NEXT"
            className={`group mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 font-condensed text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 ${
              engaged
                ? "text-white hover:bg-white/15"
                : "text-[#4A4A45] hover:text-[#111112]"
            }`}
          >
            <span>03 / CONTACT</span>
            <ArrowDownIcon
              size={14}
              weight="bold"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-y-1"
            />
          </a>
        </motion.div>
      </motion.div>

      {/* Spring-lagged floating studio preview pill following pointer on hover (Desktop) */}
      {hasFinePointer && !prefersReduced && (
        <motion.div
          aria-hidden="true"
          style={{ x: cardX, y: cardY }}
          initial={false}
          animate={{
            opacity: engaged ? 1 : 0,
            scale: engaged ? 1 : 0.88,
          }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-2.5 rounded-full border border-white/20 bg-[#111112] px-4 py-2 text-white shadow-xl"
        >
          <span className="h-2 w-2 rounded-full bg-[#0258FF]" />
          <span className="font-condensed text-xs font-bold tracking-[0.16em] uppercase whitespace-nowrap">
            OPEN WORKSPACE
          </span>
          <ArrowUpRightIcon size={14} weight="bold" />
        </motion.div>
      )}
    </section>
  );
}
