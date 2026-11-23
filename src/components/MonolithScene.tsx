import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";
import { IDENTITY } from "@/data/services";
import { SignatureDraw } from "@/components/SignatureDraw";
import { Magnetic } from "@/components/Magnetic";
import { useScrollSkew } from "@/hooks/useScrollSkew";

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 180,
  damping: 26,
};

const SLICE_CENTERS = [0.1, 0.3, 0.5, 0.7, 0.9];

interface MonolithSceneProps {
  portalFloodActive: boolean;
}

/**
 * Scene 01: HERO MONOLITH (Deep Charcoal #111112)
 * Dead-centered typographic monolith with scroll-velocity skew, interactive 5-slice tactile wave
 * + 3D tilt, SVG vector signature draw, and synchronized scroll expansion into Scene 02.
 */
export function MonolithScene({ portalFloodActive }: MonolithSceneProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const scrollSkew = useScrollSkew(2.8);

  // Normalized pointer tracking (0..1) via MotionValues + Springs (zero React re-renders)
  const rawXNorm = useMotionValue(0.5);
  const rawYNorm = useMotionValue(0.5);
  const pointerActive = useMotionValue(0);

  const smoothXNorm = useSpring(rawXNorm, { stiffness: 160, damping: 24 });
  const smoothYNorm = useSpring(rawYNorm, { stiffness: 140, damping: 24 });
  const smoothActive = useSpring(pointerActive, { stiffness: 180, damping: 24 });

  // Subtle 3D perspective tilt on the 5-slice backdrop container
  const tiltY = useTransform(smoothXNorm, [0, 1], [-4.5, 4.5]);
  const tiltX = useTransform(smoothYNorm, [0, 1], [3.5, -3.5]);
  const domainY = useTransform(smoothYNorm, [0, 1], [-6, 6]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  // Scroll-linked focal transforms
  const topLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "-14%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "14%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.68], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0.36, 0.68], [1, 0]);
  const monolithScale = useTransform(scrollYProgress, [0, 0.65], [1, 0.84]);

  // Rounded transition panel synchronized with Scene 02
  const portalScale = useTransform(scrollYProgress, [0.46, 0.96], [0.16, 1.04]);
  const portalRadius = useTransform(scrollYProgress, [0.46, 0.9], [44, 0]);
  const portalOpacity = useTransform(scrollYProgress, [0.42, 0.56], [0, 1]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    stageRef.current.style.setProperty("--mx", `${(relX * 100).toFixed(2)}%`);
    stageRef.current.style.setProperty("--my", `${(relY * 100).toFixed(2)}%`);

    rawXNorm.set(relX);
    rawYNorm.set(relY);
    pointerActive.set(1);
  };

  const handlePointerLeave = () => {
    rawXNorm.set(0.5);
    rawYNorm.set(0.5);
    pointerActive.set(0);
  };

  return (
    <section
      ref={trackRef}
      id="monolith"
      data-scene="monolith"
      data-theme="dark"
      className={`relative bg-[#111112] text-[#F4F4EE] ${
        prefersReduced ? "min-h-[100dvh]" : "min-h-[188dvh]"
      }`}
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Subtle studio cobalt spotlight */}
        <div
          aria-hidden="true"
          className="hero-spotlight pointer-events-none absolute inset-0"
        />

        {/* Centered Interactive 5-Slice Tactile Wave + 3D Perspective Tilt */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReduced
              ? undefined
              : {
                  scale: monolithScale,
                  opacity: heroOpacity,
                  perspective: 1200,
                }
          }
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            style={
              prefersReduced
                ? undefined
                : {
                    rotateX: tiltX,
                    rotateY: tiltY,
                  }
            }
            className="relative grid h-[min(60vh,430px)] w-[min(90vw,640px)] grid-cols-5 gap-1.5 sm:gap-2.5"
          >
            {SLICE_CENTERS.map((center, idx) => (
              <SliceColumn
                key={idx}
                index={idx}
                center={center}
                pointerX={smoothXNorm}
                pointerActive={smoothActive}
                prefersReduced={prefersReduced}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Dead-Centered Split-Voice Typography with Scroll-Velocity Skew */}
        <motion.div
          style={
            prefersReduced
              ? undefined
              : {
                  scale: heroScale,
                  opacity: heroOpacity,
                  skewY: scrollSkew,
                }
          }
          className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center text-center select-none"
        >
          <p className="mb-4 font-condensed text-xs font-bold tracking-[0.24em] uppercase text-[#A1A19C] sm:mb-6 sm:text-sm">
            {IDENTITY.code}
          </p>

          <h1
            id="konten-utama"
            tabIndex={-1}
            className="relative flex flex-col items-center focus:outline-none"
          >
            {/* Top wordmark blade */}
            <motion.span
              initial={prefersReduced ? false : { y: 44, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.45 }}
              style={prefersReduced ? undefined : { x: topLineX }}
              className="block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
            >
              FTS
            </motion.span>

            {/* Dimensional editorial serif domain */}
            <motion.span
              initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.56 }}
              style={prefersReduced ? undefined : { y: domainY }}
              className="relative z-20 -my-2 block pb-1 font-editorial text-[clamp(2.5rem,1.2rem+6.2vw,5.2rem)] leading-[1.02] italic tracking-[-0.02em] text-[#0258FF] sm:-my-4 md:text-[clamp(4.2rem,1.8rem+5.6vw,8.6rem)]"
            >
              .web.id
            </motion.span>

            {/* Bottom wordmark blade */}
            <motion.span
              initial={prefersReduced ? false : { y: 44, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.51 }}
              style={prefersReduced ? undefined : { x: bottomLineX }}
              className="block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
            >
              DUAENAM
            </motion.span>
          </h1>

          {/* Sleek SVG vector signature draw */}
          <div className="mt-3 sm:mt-5">
            <SignatureDraw
              trigger="mount"
              stroke="#0258FF"
              className="h-9 w-auto sm:h-11"
            />
          </div>

          {/* Core poetic editorial tagline */}
          <p className="mt-2 font-editorial text-base italic tracking-[0.04em] text-[#A1A19C] sm:text-xl">
            {IDENTITY.tagline}
          </p>
        </motion.div>

        {/* Centered magnetic scroll pill */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: heroOpacity }}
          className="relative z-20 mt-6 sm:mt-8"
        >
          <Magnetic strength={0.28}>
            <a
              href="#portal"
              data-cursor="SCROLL"
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-[#1A1B18]/85 px-5 font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#F4F4EE] backdrop-blur-sm transition-colors hover:border-[#0258FF] hover:bg-[#0258FF]"
            >
              <span>SCROLL</span>
              <ArrowDownIcon
                size={14}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-y-1"
              />
            </a>
          </Magnetic>
        </motion.div>

        {/* Rounded transition panel synchronized with Scene 02's cobalt flood */}
        {!prefersReduced && (
          <motion.div
            aria-hidden="true"
            animate={{
              backgroundColor: portalFloodActive ? "#0258FF" : "#F4F4EE",
            }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              scale: portalScale,
              borderRadius: portalRadius,
              opacity: portalOpacity,
            }}
            className="pointer-events-none absolute inset-0 z-30 origin-center"
          />
        )}
      </div>
    </section>
  );
}

interface SliceColumnProps {
  index: number;
  center: number;
  pointerX: MotionValue<number>;
  pointerActive: MotionValue<number>;
  prefersReduced: boolean;
}

function SliceColumn({
  index,
  center,
  pointerX,
  pointerActive,
  prefersReduced,
}: SliceColumnProps) {
  // Compute smooth bell-curve proximity (0..1) to the cursor's horizontal position
  const proximity = useTransform([pointerX, pointerActive], ([px, active]) => {
    const dist = Math.abs((px as number) - center);
    const wave = Math.max(0, 1 - dist / 0.34);
    return wave * wave * (active as number);
  });

  const y = useTransform(proximity, [0, 1], [0, -22]);
  const scale = useTransform(proximity, [0, 1], [1, 1.035]);
  const glowOpacity = useTransform(proximity, [0, 1], [index === 2 ? 0.55 : 0.12, 1]);
  const digitOpacity = useTransform(proximity, [0, 1], [0.06, 0.2]);

  const isAccentSlice = index === 2;

  return (
    <motion.div
      style={prefersReduced ? undefined : { y, scale }}
      className={`relative overflow-hidden rounded-2xl border ${
        isAccentSlice
          ? "border-[#0258FF]/45 bg-[#1A1B18]"
          : "border-white/[0.08] bg-[#161715]"
      }`}
    >
      {/* Dynamic cobalt wave sheen reacting to cursor proximity */}
      <motion.div
        style={prefersReduced ? undefined : { opacity: glowOpacity }}
        className="absolute inset-0"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(155deg, rgba(2,88,255,0.34) 0%, rgba(2,88,255,0.06) 55%, transparent 100%)",
          }}
        />
      </motion.div>

      <div
        className="absolute inset-y-0 flex items-center justify-center"
        style={{
          width: "500%",
          left: `${-index * 100}%`,
        }}
      >
        <motion.span
          style={prefersReduced ? undefined : { opacity: digitOpacity }}
          className="font-condensed text-[clamp(14rem,34vw,24rem)] leading-none font-extrabold tracking-[-0.06em] text-white"
        >
          26
        </motion.span>
      </div>

      <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.14em] text-white/30">
        0{index + 1}
      </span>
    </motion.div>
  );
}
