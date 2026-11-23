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

const AXIS_CENTERS = [0.1, 0.3, 0.5, 0.7, 0.9];

interface MonolithSceneProps {
  portalFloodActive: boolean;
}

/**
 * Scene 01: HERO MONOLITH (Deep Charcoal #111112)
 * OFF+BRAND editorial-brutalist architecture:
 * - Sweeping 3D topographic vector contour field + 5 open vertical hairline telemetry axes (no rounded card boxes)
 * - Asymmetric two-tier monumental lockup (FTS /26. + DUAENAM .web.id) with opposite horizontal scroll parallax
 * - Full-width architectural datum header & bottom ledger with chamfered 02 / WORKSPACE trigger
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

  const smoothXNorm = useSpring(rawXNorm, { stiffness: 150, damping: 24 });
  const smoothYNorm = useSpring(rawYNorm, { stiffness: 140, damping: 24 });
  const smoothActive = useSpring(pointerActive, { stiffness: 180, damping: 24 });
  const smoothOverdrive = useSpring(overdriveRaw, { stiffness: 220, damping: 22 });

  // 3D perspective parallax for the topographic vector contour field
  const contourRotateY = useTransform(smoothXNorm, [0, 1], [-7, 7]);
  const contourRotateX = useTransform(smoothYNorm, [0, 1], [6, -6]);
  const contourShiftX = useTransform(smoothXNorm, [0, 1], [18, -18]);
  const contourShiftY = useTransform(smoothYNorm, [0, 1], [14, -14]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Scroll-linked focal transforms timed to the sticky travel window (0 -> 1)
  const topRowX = useTransform(scrollYProgress, [0, 0.58], ["0%", "-14%"]);
  const bottomRowX = useTransform(scrollYProgress, [0, 0.58], ["0%", "14%"]);
  const contourScrollRotate = useTransform(scrollYProgress, [0, 0.7], [-8, 18]);
  const heroScale = useTransform(scrollYProgress, [0, 0.62], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0.22, 0.56], [1, 0]);
  const backdropScale = useTransform(scrollYProgress, [0, 0.58], [1, 0.88]);

  // Architectural portal frame expands to 100% viewport right before Scene 02 enters
  const portalScale = useTransform(scrollYProgress, [0.26, 0.96], [0.24, 1.02]);
  const portalRadius = useTransform(scrollYProgress, [0.26, 0.92], [14, 0]);
  const portalOpacity = useTransform(scrollYProgress, [0.22, 0.36], [0, 1]);
  const portalInnerOpacity = useTransform(
    scrollYProgress,
    [0.32, 0.5, 0.84, 0.97],
    [0, 1, 1, 0]
  );
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
    const relX = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );
    const relY = Math.max(
      0,
      Math.min(1, (event.clientY - rect.top) / rect.height)
    );

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
        className="sticky top-0 flex h-[100dvh] w-full flex-col justify-between overflow-hidden px-4 pt-22 pb-7 sm:px-8 sm:pt-26 sm:pb-9"
      >
        {/* Architectural Backdrop: Topographic Vector Contours + 5 Open Vertical Telemetry Axes */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReduced
              ? undefined
              : {
                  scale: backdropScale,
                  opacity: heroOpacity,
                  perspective: 1200,
                }
          }
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {/* Open 5-column vertical hairline telemetry grid (no rounded card boxes) */}
          <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-5 px-4 sm:px-8">
            {AXIS_CENTERS.map((center, idx) => (
              <TelemetryAxis
                key={idx}
                index={idx}
                center={center}
                pointerX={smoothXNorm}
                pointerActive={smoothActive}
                overdrive={smoothOverdrive}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>

          {/* 3D Topographic Vector Contour Rings (mirrors Scene 02 organic vector linework) */}
          <motion.svg
            viewBox="0 0 1200 760"
            fill="none"
            style={
              prefersReduced
                ? undefined
                : {
                    rotateX: contourRotateX,
                    rotateY: contourRotateY,
                    rotateZ: contourScrollRotate,
                    x: contourShiftX,
                    y: contourShiftY,
                  }
            }
            className="pointer-events-none absolute h-[min(88vw,760px)] w-[min(94vw,1200px)] overflow-visible"
          >
            {/* Outer architectural contour */}
            <path
              d="M 600 74 C 860 58 1090 164 1126 356 C 1162 548 984 686 648 704 C 312 722 92 590 74 388 C 56 186 340 90 600 74 Z"
              stroke="rgba(244, 244, 238, 0.08)"
              strokeWidth="1.2"
            />
            {/* Mid dashed telemetry orbit */}
            <path
              d="M 600 148 C 812 136 994 218 1020 368 C 1046 518 898 624 632 636 C 366 648 186 544 172 386 C 158 228 388 160 600 148 Z"
              stroke={overdrive ? "rgba(92, 154, 255, 0.65)" : "rgba(2, 88, 255, 0.36)"}
              strokeWidth="1.4"
              strokeDasharray="8 12"
              className="transition-colors duration-200"
            />
            {/* Inner high-tension vector ring */}
            <path
              d="M 600 226 C 756 218 892 278 912 384 C 932 490 818 564 618 572 C 418 580 286 502 276 388 C 266 274 444 234 600 226 Z"
              stroke={overdrive ? "rgba(244, 244, 238, 0.34)" : "rgba(244, 244, 238, 0.13)"}
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Diagonal speed datum slash across center */}
            <line
              x1="210"
              y1="610"
              x2="990"
              y2="150"
              stroke="rgba(2, 88, 255, 0.2)"
              strokeWidth="1"
            />
          </motion.svg>
        </motion.div>

        {/* Top Architectural Datum Rail */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: heroOpacity }}
          className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-white/12 pb-3"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 bg-[#0258FF]" />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#F4F4EE]">
              01 / MONOLITH
            </span>
          </div>

          <span className="hidden font-mono text-[11px] tracking-[0.22em] uppercase text-[#A1A19C] sm:inline">
            {IDENTITY.domain}
          </span>

          <span className="font-condensed text-xs font-extrabold tracking-[0.22em] uppercase text-[#A1A19C]">
            {IDENTITY.code}
          </span>
        </motion.div>

        {/* Centerpiece: Asymmetric Monumental Split-Voice Editorial Typography */}
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
          className="relative z-10 mx-auto my-auto flex w-full max-w-[1440px] flex-col justify-center py-4 select-none"
        >
          <h1
            id="konten-utama"
            tabIndex={-1}
            className="relative flex w-full flex-col focus:outline-none"
          >
            {/* Tier 1: Left-anchored FTS + Editorial /26. + Sweeping Vector Signature */}
            <motion.span
              initial={prefersReduced ? false : { y: 44, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.44 }}
              style={prefersReduced ? undefined : { x: topRowX }}
              className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-6 md:justify-start md:pl-[4%]"
            >
              <span className="font-condensed text-[clamp(4.4rem,2rem+12.5vw,9.2rem)] leading-[0.8] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE] md:text-[clamp(7.5rem,2.5rem+12.8vw,15.8rem)]">
                <KineticText text="FTS" hoverColor="#5C9AFF" />
              </span>

              <span className="flex items-baseline gap-1 font-editorial text-[clamp(3.2rem,1.5rem+8.5vw,6.4rem)] leading-[0.82] italic tracking-[-0.03em] text-[#0258FF] md:text-[clamp(5.2rem,2rem+8.8vw,10.8rem)]">
                <span>/</span>
                <span>26.</span>
              </span>

              <motion.span
                animate={
                  prefersReduced ? undefined : { scale: overdrive ? 1.08 : 1 }
                }
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="hidden self-center pl-2 lg:inline-flex"
              >
                <SignatureDraw
                  trigger="mount"
                  stroke={overdrive ? "#5C9AFF" : "#0258FF"}
                  className="h-12 w-auto transition-colors duration-200 xl:h-15"
                />
              </motion.span>
            </motion.span>

            {/* Tier 2: Right-anchored DUAENAM + .web.id with razor cobalt baseline */}
            <motion.span
              initial={prefersReduced ? false : { y: 44, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.52 }}
              style={prefersReduced ? undefined : { x: bottomRowX }}
              className="mt-1 flex flex-wrap items-baseline justify-center gap-x-3 sm:mt-0 sm:gap-x-5 md:justify-end md:pr-[3%]"
            >
              <span className="relative inline-flex flex-col items-start">
                <span className="font-editorial text-[clamp(2.2rem,1.1rem+5.2vw,4.4rem)] leading-[0.95] italic tracking-[-0.02em] text-[#5C9AFF] md:text-[clamp(3.4rem,1.4rem+5vw,6.4rem)]">
                  .web.id
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 block h-[2px] w-full bg-[#0258FF]"
                />
              </span>

              <span className="font-condensed text-[clamp(4.2rem,1.9rem+12vw,8.8rem)] leading-[0.8] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE] md:text-[clamp(7.2rem,2.4rem+12.2vw,15.2rem)]">
                <KineticText text="DUAENAM" hoverColor="#5C9AFF" />
              </span>
            </motion.span>
          </h1>

          {/* Mobile/Tablet centered vector signature */}
          <div className="mt-4 flex justify-center lg:hidden">
            <SignatureDraw
              trigger="mount"
              stroke={overdrive ? "#5C9AFF" : "#0258FF"}
              className="h-9 w-auto sm:h-11"
            />
          </div>
        </motion.div>

        {/* Bottom Architectural Ledger: Tagline on Left, Chamfered 02 / WORKSPACE Trigger on Right */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: heroOpacity }}
          className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 border-t border-white/15 pt-4 sm:flex-row"
        >
          <p className="font-editorial text-base italic tracking-[0.03em] text-[#F4F4EE]/85 sm:text-xl">
            {IDENTITY.tagline}
          </p>

          <Magnetic strength={0.24}>
            <a
              href="#portal"
              onClick={() => studioSound.playClick()}
              data-cursor="SCROLL"
              className="chamfer-sm group inline-flex min-h-[44px] items-center gap-3 border border-white/25 bg-[#17181A] px-5 py-2.5 font-condensed text-xs font-extrabold tracking-[0.2em] uppercase text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white"
            >
              <span className="font-mono text-[11px] text-[#5C9AFF] transition-colors group-hover:text-white">
                02
              </span>
              <span>WORKSPACE</span>
              <ArrowDownIcon
                size={14}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-y-1"
              />
            </a>
          </Magnetic>
        </motion.div>

        {/* Architectural transition frame with typographic preview, filling 100% before Scene 02 */}
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

interface TelemetryAxisProps {
  index: number;
  center: number;
  pointerX: MotionValue<number>;
  pointerActive: MotionValue<number>;
  overdrive: MotionValue<number>;
  prefersReduced: boolean;
}

function TelemetryAxis({
  index,
  center,
  pointerX,
  pointerActive,
  overdrive,
  prefersReduced,
}: TelemetryAxisProps) {
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

  const energy = useTransform(
    [pointerX, pointerActive, overdrive, smoothSynth],
    ([px, active, od, synth]) => {
      const dist = Math.abs((px as number) - center);
      const wave = Math.max(0, 1 - dist / 0.32);
      const hoverVal = wave * wave * (active as number);
      return Math.max(hoverVal, od as number, synth as number);
    }
  );

  const barScaleY = useTransform(energy, [0, 1], [0.14, 0.86]);
  const barOpacity = useTransform(energy, [0, 1], [0.16, 0.95]);
  const labelOpacity = useTransform(energy, [0, 1], [0.22, 0.9]);

  return (
    <div
      className={`relative flex h-full flex-col justify-between border-l border-white/[0.06] py-28 pl-3 ${
        index === 4 ? "border-r border-r-white/[0.06]" : ""
      }`}
    >
      {/* Active vertical Cobalt telemetry filament along the structural axis */}
      <motion.span
        style={
          prefersReduced
            ? undefined
            : {
                scaleY: barScaleY,
                opacity: barOpacity,
              }
        }
        className="pointer-events-none absolute top-0 bottom-0 -left-[1px] w-[2px] origin-center bg-[#0258FF]"
      />

      <motion.span
        style={prefersReduced ? undefined : { opacity: labelOpacity }}
        className="font-mono text-[10px] tracking-[0.18em] text-[#5C9AFF]"
      >
        0{index + 1}
      </motion.span>

      <span className="h-[1px] w-3 bg-white/15" />
    </div>
  );
}
