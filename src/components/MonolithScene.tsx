import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";
import { IDENTITY } from "@/data/services";
import { VoidCanvas } from "@/components/VoidCanvas";
import { ScrambleText } from "@/components/ScrambleText";

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
};

/**
 * Scene 01: THE MONOLITH (Obsidian Dark #0B0B0C)
 * Immersive kinetic chamber with reactive vector-telemetry canvas, ghosted XXVI depth watermark,
 * opposite-scrolling kinetic rails, split-door FTS/.web.id/DUAENAM typography,
 * and a scroll-driven stark diamond-blade portal breach into Scene 02.
 */
export function MonolithScene() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  // Pointer parallax without React state re-renders
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 110, damping: 20 });
  const parallaxY = useSpring(rawY, { stiffness: 110, damping: 20 });
  const inverseX = useTransform(parallaxX, (v) => -v * 0.65);
  const inverseY = useTransform(parallaxY, (v) => -v * 0.65);
  const deepX = useTransform(parallaxX, (v) => -v * 1.45);
  const deepY = useTransform(parallaxY, (v) => -v * 1.45);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  // Kinetic parting & dimensional depth tied to scroll
  const topLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "-18%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "18%"]);
  const wordScale = useTransform(scrollYProgress, [0, 0.68], [1, 1.18]);
  const wordOpacity = useTransform(scrollYProgress, [0.34, 0.66], [1, 0]);
  const domainScale = useTransform(scrollYProgress, [0, 0.62], [1, 1.42]);
  const romanScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.38]);
  const railLeftX = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const railRightX = useTransform(scrollYProgress, [0, 1], ["-12%", "8%"]);

  // Sharp rotated blade-to-full-canvas stark bone portal breach
  const portalScale = useTransform(scrollYProgress, [0.44, 0.96], [0.04, 2.25]);
  const portalRotate = useTransform(scrollYProgress, [0.44, 0.88], [45, 0]);
  const portalOpacity = useTransform(scrollYProgress, [0.42, 0.56], [0, 1]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    stageRef.current.style.setProperty("--mx", `${(relX * 100).toFixed(2)}%`);
    stageRef.current.style.setProperty("--my", `${(relY * 100).toFixed(2)}%`);

    rawX.set((relX - 0.5) * 32);
    rawY.set((relY - 0.5) * 20);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      ref={trackRef}
      id="monolith"
      data-scene="monolith"
      data-theme="dark"
      className={`relative bg-[#0B0B0C] text-white ${
        prefersReduced ? "min-h-[100dvh]" : "min-h-[195dvh]"
      }`}
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Interactive vector-telemetry atmospheric canvas */}
        <VoidCanvas intensity="high" />

        {/* Pointer-reactive electric cobalt radial spotlight */}
        <div
          aria-hidden="true"
          className="monolith-aura pointer-events-none absolute inset-0"
        />

        {/* Deep ghosted Roman numeral XXVI watermark */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReduced
              ? undefined
              : { x: deepX, y: deepY, scale: romanScale, opacity: wordOpacity }
          }
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span className="stroke-display-dark font-condensed text-[clamp(11rem,28vw,28rem)] leading-none font-extrabold tracking-[-0.06em] opacity-70">
            XXVI
          </span>
        </motion.div>

        {/* Scroll-driven top & bottom kinetic telemetry strips */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[15%] hidden overflow-hidden border-y border-white/[0.06] py-1.5 sm:block"
        >
          <motion.p
            style={prefersReduced ? undefined : { x: railLeftX }}
            className="w-max font-mono text-[10px] tracking-[0.34em] uppercase text-white/25"
          >
            FTSDUAENAM.WEB.ID // FATISDA UNS // VIKOLVERE // VERIVELA // XXVI //
            FTSDUAENAM.WEB.ID // FATISDA UNS // VIKOLVERE // VERIVELA // XXVI //
          </motion.p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[15%] hidden overflow-hidden border-y border-white/[0.06] py-1.5 sm:block"
        >
          <motion.p
            style={prefersReduced ? undefined : { x: railRightX }}
            className="w-max font-mono text-[10px] tracking-[0.34em] uppercase text-white/25"
          >
            SECTOR 01 // MONOLITH // ACCESS RESTRICTED // COHORT XXVI // SECTOR 01 //
            MONOLITH // ACCESS RESTRICTED // COHORT XXVI //
          </motion.p>
        </div>

        {/* Architectural framing corner ticks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-20 flex justify-between font-mono text-xs text-white/30 sm:inset-x-10"
        >
          <span>[01]</span>
          <span>+</span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 bottom-20 flex justify-between font-mono text-xs text-white/30 sm:inset-x-10"
        >
          <span>+</span>
          <span>[XXVI]</span>
        </div>

        {/* Centerpiece Kinetic Monolith Typography */}
        <motion.div
          style={
            prefersReduced
              ? undefined
              : {
                  scale: wordScale,
                  opacity: wordOpacity,
                }
          }
          className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center select-none"
        >
          <div className="mb-5 flex items-center gap-3 sm:mb-7">
            <span aria-hidden="true" className="h-[1px] w-6 bg-[#0258FF] sm:w-10" />
            <ScrambleText
              text={IDENTITY.facultyCode}
              className="font-condensed text-xs font-bold tracking-[0.28em] uppercase text-[#9A9A95] sm:text-sm"
            />
            <span aria-hidden="true" className="h-[1px] w-6 bg-[#0258FF] sm:w-10" />
          </div>

          <h1
            id="konten-utama"
            tabIndex={-1}
            className="relative flex flex-col items-center focus:outline-none"
          >
            {/* Top monolith blade */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="block"
            >
              <motion.span
                initial={prefersReduced ? false : { y: 54, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.45 }}
                style={prefersReduced ? undefined : { x: topLineX }}
                className="block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-white md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
              >
                FTS
              </motion.span>
            </motion.span>

            {/* Razor diagonal slash + dimensional serif domain */}
            <motion.span
              initial={prefersReduced ? false : { scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.58 }}
              style={
                prefersReduced
                  ? undefined
                  : { x: parallaxX, y: parallaxY, scale: domainScale }
              }
              className="relative z-20 -my-2 flex items-center gap-3 pb-1 sm:-my-4"
            >
              <span
                aria-hidden="true"
                className="hidden h-[2px] w-10 bg-white/35 sm:block md:w-16"
              />
              <span className="font-editorial text-[clamp(2.5rem,1.2rem+6.2vw,5.2rem)] leading-[1.02] italic tracking-[-0.02em] text-[#0258FF] md:text-[clamp(4.2rem,1.8rem+5.6vw,8.6rem)]">
                .web.id
              </span>
              <span
                aria-hidden="true"
                className="hidden h-[2px] w-10 bg-white/35 sm:block md:w-16"
              />
            </motion.span>

            {/* Bottom monolith blade */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="block"
            >
              <motion.span
                initial={prefersReduced ? false : { y: 54, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.52 }}
                style={prefersReduced ? undefined : { x: bottomLineX }}
                className="block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-white md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
              >
                DUAENAM
              </motion.span>
            </motion.span>
          </h1>

          {/* Cryptic interactive scramble codename */}
          <p className="mt-6 font-mono text-[11px] tracking-[0.26em] uppercase text-[#9A9A95] sm:mt-8 sm:text-xs">
            <ScrambleText text="VIKOLVERE // VERIVELA" />
          </p>
        </motion.div>

        {/* Scroll breach trigger */}
        <motion.a
          href="#portal"
          data-cursor="BREACH"
          style={prefersReduced ? undefined : { opacity: wordOpacity }}
          className="group relative z-20 mt-8 inline-flex min-h-[44px] items-center gap-2.5 border border-white/20 bg-[#0B0B0C]/70 px-5 font-condensed text-xs font-bold tracking-[0.24em] uppercase text-white transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] sm:mt-10"
        >
          <span>SCROLL TO BREACH</span>
          <ArrowDownIcon
            size={14}
            weight="bold"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-y-1"
          />
        </motion.a>

        {/* Scroll-driven diamond-to-full-screen stark bone breach into Scene 02 */}
        {!prefersReduced && (
          <motion.div
            aria-hidden="true"
            style={{
              scale: portalScale,
              rotate: portalRotate,
              opacity: portalOpacity,
            }}
            className="pointer-events-none absolute z-30 h-[76vmax] w-[76vmax] border-2 border-[#0258FF] bg-[#F4F4F0]"
          />
        )}
      </div>
    </section>
  );
}
