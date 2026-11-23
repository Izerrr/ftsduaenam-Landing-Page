import { useEffect, useRef, useState } from "react";
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
import { KineticText } from "@/components/KineticText";
import { useScrollSkew } from "@/hooks/useScrollSkew";
import { subscribeSynthSlice } from "@/lib/studioEvents";
import { studioSound } from "@/lib/studioSound";

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
 * + 3D tilt, press-and-hold "Overdrive" bloom, kinetic letter drift, SVG signature, and portal expand.
 */
export function MonolithScene({ portalFloodActive }: MonolithSceneProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const scrollSkew = useScrollSkew(2.8);
  const [overdrive, setOverdrive] = useState(false);

  // Normalized pointer tracking (0..1) via MotionValues + Springs (zero React re-renders)
  const rawXNorm = useMotionValue(0.5);
  const rawYNorm = useMotionValue(0.5);
  const pointerActive = useMotionValue(0);
  const overdriveRaw = useMotionValue(0);

  const smoothXNorm = useSpring(rawXNorm, { stiffness: 160, damping: 24 });
  const smoothYNorm = useSpring(rawYNorm, { stiffness: 140, damping: 24 });
  const smoothActive = useSpring(pointerActive, { stiffness: 180, damping: 24 });
  const smoothOverdrive = useSpring(overdriveRaw, { stiffness: 220, damping: 22 });

  // Subtle 3D perspective tilt on the 5-slice backdrop container
  const tiltY = useTransform(smoothXNorm, [0, 1], [-4.5, 4.5]);
  const tiltX = useTransform(smoothYNorm, [0, 1], [3.5, -3.5]);
  const domainY = useTransform(smoothYNorm, [0, 1], [-6, 6]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Scroll-linked focal transforms timed exactly to the sticky travel window (0 -> 1)
  const topLineX = useTransform(scrollYProgress, [0, 0.58], ["0%", "-16%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.58], ["0%", "16%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.62], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0.22, 0.56], [1, 0]);
  const monolithScale = useTransform(scrollYProgress, [0, 0.58], [1, 0.84]);

  // Rounded portal card expands completely to 100% viewport right before Scene 02 enters
  const portalScale = useTransform(scrollYProgress, [0.26, 0.96], [0.24, 1.02]);
  const portalRadius = useTransform(scrollYProgress, [0.26, 0.92], [44, 0]);
  const portalOpacity = useTransform(scrollYProgress, [0.22, 0.36], [0, 1]);
  const portalInnerOpacity = useTransform(scrollYProgress, [0.32, 0.5, 0.84, 0.97], [0, 1, 1, 0]);
  const portalInnerScale = useTransform(scrollYProgress, [0.32, 0.95], [0.88, 1.04]);
  const portalBarScaleX = useTransform(scrollYProgress, [0.34, 0.88], [0.15, 1]);

  useEffect(() => {
    overdriveRaw.set(overdrive ? 1 : 0);
  }, [overdrive, overdriveRaw]);

  useEffect(() => {
    if (!overdrive) return;
    const release = () => {
      setOverdrive(false);
      studioSound.playOverdrive(false);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [overdrive]);

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
    if (overdrive) {
      setOverdrive(false);
      studioSound.playOverdrive(false);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) return;
    setOverdrive(true);
    studioSound.playOverdrive(true);
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
        onPointerDown={handlePointerDown}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Subtle studio cobalt spotlight + press-and-hold overdrive bloom */}
        <motion.div
          aria-hidden="true"
          animate={
            prefersReduced
              ? undefined
              : {
                  opacity: overdrive ? 1 : 0.72,
                  scale: overdrive ? 1.18 : 1,
                }
          }
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
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
                overdrive={smoothOverdrive}
                prefersReduced={prefersReduced}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Dead-Centered Split-Voice Typography with Scroll-Velocity Skew + Kinetic Letter Drift */}
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
              <KineticText text="FTS" hoverColor="#5C9AFF" />
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
              <KineticText text="DUAENAM" hoverColor="#5C9AFF" />
            </motion.span>
          </h1>

          {/* Sleek SVG vector signature draw pulsing gently on Overdrive Hold */}
          <motion.div
            animate={
              prefersReduced
                ? undefined
                : { scale: overdrive ? 1.09 : 1 }
            }
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mt-3 sm:mt-5"
          >
            <SignatureDraw
              trigger="mount"
              stroke={overdrive ? "#5C9AFF" : "#0258FF"}
              className="h-9 w-auto transition-colors duration-200 sm:h-11"
            />
          </motion.div>

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
              onClick={() => studioSound.playClick()}
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

        {/* Rounded transition card with typographic preview, filling 100% before Scene 02 */}
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
            className="pointer-events-none absolute inset-0 z-30 flex origin-center flex-col items-center justify-center overflow-hidden border border-[#111112]/10 shadow-2xl"
          >
            {/* Subtle organic contour inside the expanding portal card */}
            <svg
              viewBox="0 0 640 640"
              fill="none"
              className="pointer-events-none absolute h-[min(78vw,560px)] w-[min(78vw,560px)] text-[#111112]/[0.08]"
            >
              <path
                d="M320 62C424 54 532 108 564 206C596 304 548 424 468 498C388 572 264 596 172 544C80 492 48 378 66 270C84 162 216 70 320 62Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            {/* Interior card typography & progress sweep */}
            <motion.div
              style={{
                opacity: portalInnerOpacity,
                scale: portalInnerScale,
              }}
              className="relative z-10 flex w-full max-w-[780px] flex-col items-center px-8 text-center"
            >
              <div className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.22em] uppercase text-[#4A4A45]">
                <span>02</span>
                <span className="h-[1px] w-8 bg-[#111112]/30" />
                <span>NEXT // WORKSPACE</span>
              </div>

              <div className="flex flex-wrap items-baseline justify-center gap-x-2.5 sm:gap-x-4">
                <span className="font-condensed text-[clamp(3rem,1.8rem+7.5vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase text-[#111112]">
                  TASK
                </span>
                <span className="font-editorial text-[clamp(3.2rem,1.9rem+8vw,7.8rem)] leading-[0.88] italic tracking-[-0.025em] text-[#004BE0]">
                  PANEL
                </span>
              </div>

              <div className="mt-6 h-[2px] w-48 overflow-hidden bg-[#111112]/15 sm:w-64">
                <motion.div
                  style={{ scaleX: portalBarScaleX }}
                  className="h-full w-full origin-left bg-[#0258FF]"
                />
              </div>

              <p className="mt-4 font-editorial text-base italic tracking-[0.04em] text-[#4A4A45] sm:text-lg">
                {IDENTITY.tagline}
              </p>
            </motion.div>
          </motion.div>
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
  overdrive: MotionValue<number>;
  prefersReduced: boolean;
}

function SliceColumn({
  index,
  center,
  pointerX,
  pointerActive,
  overdrive,
  prefersReduced,
}: SliceColumnProps) {
  const synthRaw = useMotionValue(0);
  const smoothSynth = useSpring(synthRaw, { stiffness: 420, damping: 20 });

  useEffect(() => {
    if (prefersReduced) return;
    let decayTimer = 0;
    const unsubscribe = subscribeSynthSlice((hitIndex) => {
      if (hitIndex !== index) return;
      synthRaw.set(1);
      window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => {
        synthRaw.set(0);
      }, 150);
    });
    return () => {
      window.clearTimeout(decayTimer);
      unsubscribe();
    };
  }, [index, prefersReduced, synthRaw]);

  // Smooth bell-curve wave boosted by Overdrive Hold + Synthesia equalizer hits
  const energy = useTransform(
    [pointerX, pointerActive, overdrive, smoothSynth],
    ([px, active, od, synth]) => {
      const dist = Math.abs((px as number) - center);
      const wave = Math.max(0, 1 - dist / 0.34);
      const hoverVal = wave * wave * (active as number);
      return Math.max(hoverVal, od as number, synth as number);
    }
  );

  const y = useTransform(energy, [0, 1], [0, -24]);
  const scale = useTransform(energy, [0, 1], [1, 1.045]);
  const glowOpacity = useTransform(energy, [0, 1], [index === 2 ? 0.55 : 0.12, 1]);
  const digitOpacity = useTransform(energy, [0, 1], [0.06, 0.28]);

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
      {/* Dynamic cobalt wave sheen reacting to cursor proximity & Overdrive Hold */}
      <motion.div
        style={prefersReduced ? undefined : { opacity: glowOpacity }}
        className="absolute inset-0"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(155deg, rgba(2,88,255,0.42) 0%, rgba(2,88,255,0.08) 55%, transparent 100%)",
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
