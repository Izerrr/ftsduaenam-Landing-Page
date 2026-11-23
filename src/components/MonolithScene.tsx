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

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 180,
  damping: 26,
};

/**
 * Scene 01: THE MONOLITH (Obsidian Dark #0B0B0C)
 * Monumental split-layer typography ("FTS / .web.id / DUAENAM") with pointer-reactive aura
 * and scroll-driven parting doors that bloom into Scene 02's stark light portal.
 */
export function MonolithScene() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  // Pointer parallax without React state re-renders
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 120, damping: 20 });
  const parallaxY = useSpring(rawY, { stiffness: 120, damping: 20 });
  const inverseX = useTransform(parallaxX, (v) => -v * 0.65);
  const inverseY = useTransform(parallaxY, (v) => -v * 0.65);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  // Kinetic parting & dimensional scale as user scrolls through the monolith
  const topLineX = useTransform(scrollYProgress, [0, 0.65], ["0%", "-11%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.65], ["0%", "11%"]);
  const wordScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.16]);
  const wordOpacity = useTransform(scrollYProgress, [0.35, 0.72], [1, 0]);
  const domainScale = useTransform(scrollYProgress, [0, 0.65], [1, 1.32]);

  // Stark light portal aperture zooming open from center into Scene 02
  const portalScale = useTransform(scrollYProgress, [0.46, 0.96], [0.06, 1.35]);
  const portalOpacity = useTransform(scrollYProgress, [0.44, 0.64], [0, 1]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    stageRef.current.style.setProperty("--mx", `${(relX * 100).toFixed(2)}%`);
    stageRef.current.style.setProperty("--my", `${(relY * 100).toFixed(2)}%`);

    rawX.set((relX - 0.5) * 28);
    rawY.set((relY - 0.5) * 18);
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
        prefersReduced ? "min-h-[100dvh]" : "min-h-[168dvh]"
      }`}
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Interactive cursor-reactive cobalt spotlight */}
        <div
          aria-hidden="true"
          className="monolith-aura pointer-events-none absolute inset-0"
        />

        {/* Architectural quadrant crosshair markers */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-20 flex justify-between font-mono text-xs text-white/25 sm:inset-x-10"
        >
          <span>+</span>
          <span>+</span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-20 flex justify-between font-mono text-xs text-white/25 sm:inset-x-10"
        >
          <span>+</span>
          <span>+</span>
        </div>

        {/* Centerpiece Kinetic Typography */}
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
          <p className="mb-5 font-condensed text-xs font-bold tracking-[0.26em] uppercase text-[#9A9A95] sm:mb-7 sm:text-sm">
            {IDENTITY.facultyCode}
          </p>

          <h1
            id="konten-utama"
            tabIndex={-1}
            className="relative flex flex-col items-center focus:outline-none"
          >
            {/* Top half of monolith wordmark */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="block"
            >
              <motion.span
                initial={prefersReduced ? false : { y: 42, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.04 }}
                style={prefersReduced ? undefined : { x: topLineX }}
                className="block font-condensed text-[clamp(3.75rem,1.8rem+11vw,8.2rem)] leading-[0.82] font-extrabold tracking-[-0.04em] uppercase text-white md:text-[clamp(6.8rem,2.4rem+11.2vw,14.8rem)]"
              >
                FTS
              </motion.span>
            </motion.span>

            {/* Dimensional serif domain inlay carved in electric cobalt */}
            <motion.span
              initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.14 }}
              style={
                prefersReduced
                  ? undefined
                  : { x: parallaxX, y: parallaxY, scale: domainScale }
              }
              className="relative z-20 -my-2 block pb-1 font-editorial text-[clamp(2.4rem,1.2rem+6vw,5rem)] leading-[1.02] italic tracking-[-0.02em] text-[#0258FF] sm:-my-4 md:text-[clamp(4rem,1.8rem+5.5vw,8.4rem)]"
            >
              .web.id
            </motion.span>

            {/* Bottom half of monolith wordmark */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="block"
            >
              <motion.span
                initial={prefersReduced ? false : { y: 42, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.1 }}
                style={prefersReduced ? undefined : { x: bottomLineX }}
                className="block font-condensed text-[clamp(3.75rem,1.8rem+11vw,8.2rem)] leading-[0.82] font-extrabold tracking-[-0.04em] uppercase text-white md:text-[clamp(6.8rem,2.4rem+11.2vw,14.8rem)]"
              >
                DUAENAM
              </motion.span>
            </motion.span>
          </h1>
        </motion.div>

        {/* Scroll advance trigger at bottom center */}
        <motion.a
          href="#portal"
          style={prefersReduced ? undefined : { opacity: wordOpacity }}
          className="group relative z-20 mt-10 inline-flex min-h-[44px] items-center gap-2 px-4 font-condensed text-xs font-bold tracking-[0.22em] uppercase text-[#9A9A95] transition-colors hover:text-white sm:mt-14"
        >
          <span>ENTER</span>
          <ArrowDownIcon
            size={14}
            weight="bold"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-y-1"
          />
        </motion.a>

        {/* Scroll-driven stark light portal aperture blooming seamlessly into Scene 02 */}
        {!prefersReduced && (
          <motion.div
            aria-hidden="true"
            style={{
              scale: portalScale,
              opacity: portalOpacity,
            }}
            className="pointer-events-none absolute z-30 h-[86vmax] w-[86vmax] bg-[#F4F4F0]"
          />
        )}
      </div>
    </section>
  );
}
