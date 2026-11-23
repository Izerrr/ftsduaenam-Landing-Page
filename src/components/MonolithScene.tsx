import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react/ArrowDown";
import { IDENTITY } from "@/data/services";
import { SignatureDraw } from "@/components/SignatureDraw";
import { Magnetic } from "@/components/Magnetic";
import { KineticText } from "@/components/KineticText";
import { useScrollSkew } from "@/hooks/useScrollSkew";
import { studioSound } from "@/lib/studioSound";

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 170,
  damping: 26,
};

type HeroVariant = "ribbon" | "spread" | "kinetic";

const VARIANT_ORDER: readonly HeroVariant[] = [
  "ribbon",
  "spread",
  "kinetic",
] as const;

const CYCLE_DURATION_MS = 4400;

interface MonolithSceneProps {
  onCobaltCoverChange?: (covered: boolean) => void;
}

/**
 * Scene 01: HERO MONOLITH (Deep Charcoal #111112)
 * Automatically choreographs and cycles between 3 non-techy editorial compositions
 * (OFF+BRAND Ribbon -> Editorial Spread -> Kinetic Showreel), then rises through a distinct
 * Electric Cobalt (#0258FF) serif Workspace interlude into Scene 02.
 */
export function MonolithScene({ onCobaltCoverChange }: MonolithSceneProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const scrollSkew = useScrollSkew(2.8);
  const [overdrive, setOverdrive] = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  const cobaltCoverRef = useRef(false);

  const variant = VARIANT_ORDER[variantIdx];

  // Smooth cursor parallax (0..1)
  const rawXNorm = useMotionValue(0.5);
  const rawYNorm = useMotionValue(0.5);
  const smoothXNorm = useSpring(rawXNorm, { stiffness: 120, damping: 24 });
  const smoothYNorm = useSpring(rawYNorm, { stiffness: 120, damping: 24 });

  // Soft organic parallax for background hand-drawn vector ribbons
  const ribbonX = useTransform(smoothXNorm, [0, 1], [24, -24]);
  const ribbonY = useTransform(smoothYNorm, [0, 1], [18, -18]);
  const ribbonRotate = useTransform(smoothXNorm, [0, 1], [-3.5, 3.5]);
  const serifFloatX = useTransform(smoothXNorm, [0, 1], [-10, 10]);
  const serifFloatY = useTransform(smoothYNorm, [0, 1], [-7, 7]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Tracks Monolith unsticking upward after 02 Cobalt card is fully loaded
  const { scrollYProgress: exitProgress } = useScroll({
    target: trackRef,
    offset: ["end end", "end start"],
  });

  // Track real Cobalt bridge bounds so StudioCursor/brushes switch accurately on blue surface
  useEffect(() => {
    const syncCover = () => {
      const bridgeRect = bridgeRef.current?.getBoundingClientRect();
      const covered =
        !prefersReduced &&
        Boolean(bridgeRect) &&
        bridgeRect!.height >= window.innerHeight * 0.58 &&
        bridgeRect!.top <= window.innerHeight * 0.5 &&
        bridgeRect!.bottom >= window.innerHeight * 0.5 &&
        scrollYProgress.get() >= 0.3;
      if (covered !== cobaltCoverRef.current) {
        cobaltCoverRef.current = covered;
        onCobaltCoverChange?.(covered);
      }
    };

    syncCover();
    window.addEventListener("scroll", syncCover, { passive: true });
    window.addEventListener("resize", syncCover, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncCover);
      window.removeEventListener("resize", syncCover);
      onCobaltCoverChange?.(false);
    };
  }, [onCobaltCoverChange, prefersReduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", () => {
    const bridgeRect = bridgeRef.current?.getBoundingClientRect();
    const covered =
      !prefersReduced &&
      Boolean(bridgeRect) &&
      bridgeRect!.height >= window.innerHeight * 0.58 &&
      bridgeRect!.top <= window.innerHeight * 0.5 &&
      bridgeRect!.bottom >= window.innerHeight * 0.5 &&
      scrollYProgress.get() >= 0.3;
    if (covered !== cobaltCoverRef.current) {
      cobaltCoverRef.current = covered;
      onCobaltCoverChange?.(covered);
    }
  });

  // Automatic 3-composition showreel rotation
  useEffect(() => {
    if (prefersReduced) return;
    const timer = window.setInterval(() => {
      setVariantIdx((prev) => (prev + 1) % VARIANT_ORDER.length);
    }, CYCLE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [prefersReduced]);

  // Scroll-linked focal transforms timed to the sticky travel window (0 -> 1)
  const topLineX = useTransform(scrollYProgress, [0, 0.58], ["0%", "-15%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.58], ["0%", "15%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.62], [1, 1.09]);
  const heroOpacity = useTransform(scrollYProgress, [0.22, 0.56], [1, 0]);
  const bgRibbonScale = useTransform(scrollYProgress, [0, 0.58], [1, 1.16]);

  // Smooth Electric Cobalt bridge card rising out of Hero before Scene 02:
  // keeps "Workspace" 100% visible when loaded, only dissolving right before reaching TopBar on exit
  const portalScale = useTransform(scrollYProgress, [0.24, 0.94], [0.22, 1.02]);
  const portalRadius = useTransform(scrollYProgress, [0.24, 0.9], [20, 0]);
  const portalOpacity = useTransform(scrollYProgress, [0.2, 0.34], [0, 1]);
  const portalInnerOpacity = useTransform(scrollYProgress, [0.32, 0.5], [0, 1]);
  const portalExitOpacity = useTransform(exitProgress, [0.24, 0.44], [1, 0]);
  const portalInnerScale = useTransform(
    scrollYProgress,
    [0.32, 0.9],
    [0.9, 1]
  );
  const portalBarScaleX = useTransform(
    scrollYProgress,
    [0.34, 0.86],
    [0.12, 1]
  );

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
  };

  const handlePointerLeave = () => {
    rawXNorm.set(0.5);
    rawYNorm.set(0.5);
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
        prefersReduced ? "min-h-[100dvh]" : "min-h-[158dvh]"
      }`}
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Flowing Hand-Drawn OFF+BRAND Vector Ribbon Backdrop */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReduced
              ? undefined
              : {
                  opacity: heroOpacity,
                  scale: bgRibbonScale,
                  x: ribbonX,
                  y: ribbonY,
                  rotate: ribbonRotate,
                }
          }
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 1440 900"
            fill="none"
            className="h-[min(92vh,860px)] w-[min(96vw,1440px)] overflow-visible"
          >
            <path
              d="M 180 690 C 80 490 250 180 610 150 C 970 120 1290 260 1260 490 C 1230 720 890 790 550 750 C 310 722 245 815 180 690 Z"
              stroke="rgba(244, 244, 238, 0.07)"
              strokeWidth="1.4"
            />

            <motion.path
              d="M -60 640 C 240 720 420 190 730 240 C 1040 290 910 680 1210 580 C 1360 530 1450 340 1520 260"
              stroke={overdrive ? "#5C9AFF" : "#0258FF"}
              strokeWidth={overdrive ? "3.2" : "2"}
              strokeLinecap="round"
              initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: overdrive ? 0.85 : 0.45,
              }}
              transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <path
              d="M 110 220 C 440 90 790 670 1310 350"
              stroke="rgba(244, 244, 238, 0.05)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* AUTO-CYCLING 3-COMPOSITION HERO STAGE */}
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
          className="relative z-10 mx-auto flex min-h-[380px] w-full max-w-[1400px] flex-col items-center justify-center select-none sm:min-h-[440px]"
        >
          <AnimatePresence mode="wait">
            {variant === "ribbon" && (
              <motion.div
                key="ribbon"
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full flex-col items-center text-center"
              >
                <h1
                  id="konten-utama"
                  tabIndex={-1}
                  className="relative flex flex-col items-center focus:outline-none"
                >
                  <motion.span
                    initial={prefersReduced ? false : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={ENTER_SPRING}
                    style={prefersReduced ? undefined : { x: topLineX }}
                    className="block font-condensed text-[clamp(4.4rem,2rem+12.8vw,9.2rem)] leading-[0.78] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE] md:text-[clamp(7.5rem,2.6rem+13vw,16.4rem)]"
                  >
                    <KineticText
                      text="FTS"
                      hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                    />
                  </motion.span>

                  <motion.span
                    style={
                      prefersReduced
                        ? undefined
                        : { x: serifFloatX, y: serifFloatY }
                    }
                    className="relative z-20 -my-3 flex items-center gap-3 sm:-my-5 sm:gap-5"
                  >
                    <span className="font-editorial text-[clamp(2.6rem,1.2rem+6.2vw,5.4rem)] leading-none italic tracking-[-0.025em] text-[#0258FF] md:text-[clamp(4.4rem,1.8rem+5.8vw,8.6rem)]">
                      .web.id
                    </span>
                    <SignatureDraw
                      trigger="mount"
                      stroke={overdrive ? "#5C9AFF" : "#F4F4EE"}
                      className="hidden h-9 w-auto opacity-85 sm:block md:h-12"
                    />
                  </motion.span>

                  <motion.span
                    initial={prefersReduced ? false : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={ENTER_SPRING}
                    style={prefersReduced ? undefined : { x: bottomLineX }}
                    className="block font-condensed text-[clamp(4.4rem,2rem+12.8vw,9.2rem)] leading-[0.78] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE] md:text-[clamp(7.5rem,2.6rem+13vw,16.4rem)]"
                  >
                    <KineticText
                      text="DUAENAM"
                      hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                    />
                  </motion.span>
                </h1>

                <p className="mt-6 font-editorial text-lg italic tracking-[0.03em] text-[#A1A19C] sm:mt-8 sm:text-2xl">
                  {IDENTITY.tagline}
                </p>
              </motion.div>
            )}

            {variant === "spread" && (
              <motion.div
                key="spread"
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="grid w-full max-w-[1280px] grid-cols-1 items-end gap-6 px-2 md:grid-cols-[1fr_1.45fr] md:gap-12"
              >
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative flex items-baseline">
                    <span className="font-editorial text-[clamp(6.5rem,18vw,16.5rem)] leading-[0.78] italic tracking-[-0.04em] text-[#0258FF]">
                      /26.
                    </span>
                  </div>
                  <div className="mt-3">
                    <SignatureDraw
                      trigger="mount"
                      stroke="#F4F4EE"
                      className="h-9 w-auto sm:h-11"
                    />
                  </div>
                  <p className="mt-4 max-w-[340px] font-editorial text-xl leading-[1.25] italic text-[#F4F4EE]/85 sm:text-2xl">
                    {IDENTITY.tagline}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center md:items-end md:text-right">
                  <h1
                    id="konten-utama"
                    tabIndex={-1}
                    className="flex flex-col items-center focus:outline-none md:items-end"
                  >
                    <motion.span
                      style={prefersReduced ? undefined : { x: topLineX }}
                      className="block font-condensed text-[clamp(4.6rem,13.5vw,13.8rem)] leading-[0.78] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE]"
                    >
                      <KineticText
                        text="FTS"
                        hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                      />
                    </motion.span>
                    <motion.span
                      style={prefersReduced ? undefined : { x: bottomLineX }}
                      className="block font-condensed text-[clamp(4.4rem,13vw,13.2rem)] leading-[0.8] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE]"
                    >
                      <KineticText
                        text="DUAENAM"
                        hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                      />
                    </motion.span>
                  </h1>
                  <span className="mt-3 font-editorial text-2xl italic text-[#5C9AFF] sm:text-3xl">
                    {IDENTITY.domain}
                  </span>
                </div>
              </motion.div>
            )}

            {variant === "kinetic" && (
              <motion.div
                key="kinetic"
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full flex-col items-center text-center"
              >
                <h1
                  id="konten-utama"
                  tabIndex={-1}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <motion.span
                    style={prefersReduced ? undefined : { x: topLineX }}
                    className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-5"
                  >
                    <span className="font-condensed text-[clamp(4.5rem,13.5vw,15rem)] leading-[0.8] font-extrabold tracking-[-0.045em] uppercase text-[#F4F4EE]">
                      <KineticText
                        text="FTS"
                        hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                      />
                    </span>
                    <span className="font-editorial text-[clamp(4.5rem,13.5vw,15rem)] leading-[0.8] italic tracking-[-0.03em] text-[#0258FF]">
                      /26
                    </span>
                  </motion.span>

                  <motion.span
                    style={prefersReduced ? undefined : { x: bottomLineX }}
                    className="mt-1 block font-condensed text-[clamp(3.6rem,10.5vw,11.8rem)] leading-[0.82] font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE]"
                  >
                    <KineticText
                      text="DUAENAM"
                      hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                    />
                  </motion.span>
                </h1>

                <div className="mt-4">
                  <SignatureDraw
                    trigger="mount"
                    stroke="#0258FF"
                    className="h-10 w-auto sm:h-12"
                  />
                </div>

                <p className="mt-2 font-editorial text-lg italic tracking-[0.03em] text-[#A1A19C] sm:text-2xl">
                  {IDENTITY.tagline}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Frameless Editorial Scroll Cue */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: heroOpacity }}
          className="relative z-20 mt-8 flex flex-col items-center sm:mt-10"
        >
          <Magnetic strength={0.22}>
            <a
              href="#portal"
              onClick={() => studioSound.playClick()}
              data-cursor="SCROLL"
              className="group inline-flex min-h-[44px] flex-col items-center gap-2 px-4 py-1 text-[#A1A19C] no-underline transition-colors hover:text-[#F4F4EE]"
            >
              <span className="flex items-baseline gap-2">
                <span className="font-editorial text-sm italic text-[#0258FF]">
                  02.
                </span>
                <span className="font-condensed text-xs font-extrabold tracking-[0.22em] uppercase">
                  WORKSPACE
                </span>
                <ArrowDownIcon
                  size={12}
                  weight="bold"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-y-1 group-hover:text-[#0258FF]"
                />
              </span>
              <span
                aria-hidden="true"
                className="block h-[1.5px] w-10 origin-left bg-white/25 transition-all duration-200 group-hover:w-full group-hover:bg-[#0258FF]"
              />
            </a>
          </Magnetic>
        </motion.div>

        {/* Distinct Electric Cobalt transition card rising out of Dark Hero into Warm Bone Scene 02 */}
        {!prefersReduced && (
          <motion.div
            ref={bridgeRef}
            data-cobalt-bridge="true"
            aria-hidden="true"
            style={{
              scale: portalScale,
              borderRadius: portalRadius,
              opacity: portalOpacity,
            }}
            className="pointer-events-none absolute inset-0 z-30 flex origin-center flex-col items-center justify-center overflow-hidden bg-[#0258FF] text-white shadow-2xl"
          >
            <svg
              viewBox="0 0 640 640"
              fill="none"
              className="pointer-events-none absolute h-[min(78vw,560px)] w-[min(78vw,560px)] text-white/[0.16]"
            >
              <circle
                cx="320"
                cy="320"
                r="240"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>

            <motion.div
              style={{
                opacity: portalInnerOpacity,
                scale: portalInnerScale,
              }}
              className="relative z-10 w-full max-w-[780px]"
            >
              <motion.div
                style={{ opacity: portalExitOpacity }}
                className="flex flex-col items-center px-8 text-center"
              >
                <div className="mb-4 flex items-center gap-3 font-condensed text-xs font-bold tracking-[0.26em] uppercase text-white/80">
                  <span>02</span>
                  <span className="h-[1px] w-8 bg-white/35" />
                  <span>{IDENTITY.domain}</span>
                </div>

                <span className="font-editorial text-[clamp(3.6rem,2rem+8vw,8.6rem)] leading-[0.88] italic tracking-[-0.03em] text-white">
                  Workspace
                </span>

                <div className="mt-6 h-[2px] w-44 overflow-hidden bg-white/25 sm:w-56">
                  <motion.div
                    style={{ scaleX: portalBarScaleX }}
                    className="h-full w-full origin-left bg-white"
                  />
                </div>

                <p className="mt-4 font-editorial text-base italic tracking-[0.04em] text-white/85 sm:text-lg">
                  {IDENTITY.tagline}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
