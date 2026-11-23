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
  stiffness: 140,
  damping: 26,
};

const HIDDEN_WHISPERS = [
  "VIKOLVERE  ·  VERIVELA  ·  DO NOT LOOK AWAY  ·  XXVI  ·  VIKOLVERE  ·  VERIVELA",
  "BEHIND THE GLASS  ·  FATISDA UNS  ·  IT IS ALREADY OPEN  ·  FTSDUAENAM  ·  XXVI",
  "SILENCE BEFORE ENTRY  ·  VIKOLVERE  ·  VERIVELA  ·  ONLY ONE DOOR  ·  XXVI",
  "FATISDA UNS  ·  XXVI  ·  OBSERVED  ·  DO NOT LOOK AWAY  ·  FTSDUAENAM.WEB.ID",
  "VIKOLVERE  ·  VERIVELA  ·  STEP THROUGH  ·  XXVI  ·  BEHIND THE GLASS",
];

/**
 * Scene I: THE MONOLITH (Pitch Abyss #060607)
 * Uncanny dark chamber where a pointer-following cold beam silently unveils hidden inscriptions
 * in the shadows, framing haunted split-monolith typography ("FTS / .web.id / DUAENAM") that parts
 * as a stark sterile horizontal light-slit opens into Scene II.
 */
export function MonolithScene() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 90, damping: 22 });
  const parallaxY = useSpring(rawY, { stiffness: 90, damping: 22 });
  const inverseX = useTransform(parallaxX, (v) => -v * 0.55);
  const inverseY = useTransform(parallaxY, (v) => -v * 0.55);
  const echoX = useTransform(parallaxX, (v) => v * 0.42);
  const echoY = useTransform(parallaxY, (v) => v * 0.42);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  // Uncanny slow parting as the visitor descends
  const topLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "-14%"]);
  const bottomLineX = useTransform(scrollYProgress, [0, 0.62], ["0%", "14%"]);
  const wordScale = useTransform(scrollYProgress, [0, 0.68], [1, 1.14]);
  const wordOpacity = useTransform(scrollYProgress, [0.34, 0.66], [1, 0]);
  const domainScale = useTransform(scrollYProgress, [0, 0.62], [1, 1.36]);

  // Horizontal waking light-slit opening into the blinding sterile bone room (Scene II)
  const slitScaleY = useTransform(scrollYProgress, [0.48, 0.96], [0.004, 1]);
  const slitOpacity = useTransform(scrollYProgress, [0.42, 0.54], [0, 1]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    stageRef.current.style.setProperty("--mx", `${(relX * 100).toFixed(2)}%`);
    stageRef.current.style.setProperty("--my", `${(relY * 100).toFixed(2)}%`);

    rawX.set((relX - 0.5) * 30);
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
      className={`relative bg-[#060607] text-[#F2F2EE] ${
        prefersReduced ? "min-h-[100dvh]" : "min-h-[192dvh]"
      }`}
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
      >
        {/* Ambient abyssal dust motes & hypnotic eclipse ripples */}
        <VoidCanvas intensity="high" />

        {/* Hidden inscriptions lurking in pitch darkness, unveiled only inside pointer torch */}
        <div
          aria-hidden="true"
          className="torch-reveal-mask pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden py-16 opacity-65 select-none"
        >
          {HIDDEN_WHISPERS.map((line, idx) => (
            <p
              key={idx}
              className="whitespace-nowrap font-editorial text-xl italic tracking-[0.34em] text-[#F2F2EE]/45 sm:text-2xl"
              style={{ transform: `translateX(${idx % 2 === 0 ? "-4%" : "-12%"})` }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Eerie cold cobalt/bone pointer torch */}
        <div
          aria-hidden="true"
          className="abyss-torch pointer-events-none absolute inset-0"
        />

        {/* Deep claustrophobic cinema vignette */}
        <div
          aria-hidden="true"
          className="abyss-vignette pointer-events-none absolute inset-0"
        />

        {/* Centerpiece Haunted Monolith Typography */}
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
          <p className="mb-6 font-editorial text-sm italic tracking-[0.3em] text-[#9B9B96] sm:mb-8 sm:text-base">
            <ScrambleText text={IDENTITY.facultyCode.toLowerCase()} />
          </p>

          <h1
            id="konten-utama"
            tabIndex={-1}
            className="relative flex flex-col items-center focus:outline-none"
          >
            {/* Top half with subtle drifting ghost echo */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="relative block"
            >
              {!prefersReduced && (
                <motion.span
                  aria-hidden="true"
                  style={{ x: echoX, y: echoY }}
                  className="pointer-events-none absolute inset-0 font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#0258FF]/30 blur-[1.5px] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
                >
                  FTS
                </motion.span>
              )}
              <motion.span
                initial={prefersReduced ? false : { y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.52 }}
                style={prefersReduced ? undefined : { x: topLineX }}
                className="relative block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#F2F2EE] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
              >
                FTS
              </motion.span>
            </motion.span>

            {/* Razor eerie serif domain suspended between the blades */}
            <motion.span
              initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...ENTER_SPRING, delay: 0.65 }}
              style={
                prefersReduced
                  ? undefined
                  : { x: parallaxX, y: parallaxY, scale: domainScale }
              }
              className="relative z-20 -my-2 block pb-1 font-editorial text-[clamp(2.5rem,1.2rem+6.2vw,5.2rem)] leading-[1.02] italic tracking-[-0.015em] text-[#0258FF] ghost-echo-cobalt sm:-my-4 md:text-[clamp(4.2rem,1.8rem+5.6vw,8.6rem)]"
            >
              .web.id
            </motion.span>

            {/* Bottom half with subtle drifting ghost echo */}
            <motion.span
              style={prefersReduced ? undefined : { x: inverseX, y: inverseY }}
              className="relative block"
            >
              {!prefersReduced && (
                <motion.span
                  aria-hidden="true"
                  style={{ x: echoX, y: echoY }}
                  className="pointer-events-none absolute inset-0 font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#0258FF]/30 blur-[1.5px] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
                >
                  DUAENAM
                </motion.span>
              )}
              <motion.span
                initial={prefersReduced ? false : { y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...ENTER_SPRING, delay: 0.58 }}
                style={prefersReduced ? undefined : { x: bottomLineX }}
                className="relative block font-condensed text-[clamp(3.9rem,1.8rem+11.5vw,8.4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] uppercase text-[#F2F2EE] md:text-[clamp(7rem,2.4rem+11.5vw,15.2rem)]"
              >
                DUAENAM
              </motion.span>
            </motion.span>
          </h1>

          <p className="mt-7 font-editorial text-sm italic tracking-[0.26em] text-[#9B9B96] sm:mt-9 sm:text-base">
            <ScrambleText text="vikolvere · verivela" />
          </p>
        </motion.div>

        {/* Quiet eerie descent link */}
        <motion.a
          href="#portal"
          data-cursor="below"
          style={prefersReduced ? undefined : { opacity: wordOpacity }}
          className="group relative z-20 mt-10 inline-flex min-h-[44px] flex-col items-center justify-center gap-1.5 px-4 font-editorial text-xs italic tracking-[0.28em] text-[#9B9B96] transition-colors hover:text-[#F2F2EE] sm:mt-12"
        >
          <span>step inside</span>
          <ArrowDownIcon
            size={14}
            weight="regular"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-y-1"
          />
        </motion.a>

        {/* Blinding sterile bone horizontal light-slit opening smoothly into Scene II */}
        {!prefersReduced && (
          <motion.div
            aria-hidden="true"
            style={{
              scaleY: slitScaleY,
              opacity: slitOpacity,
            }}
            className="pointer-events-none absolute inset-0 z-30 origin-center border-y border-[#0258FF] bg-[#EAE8E1]"
          />
        )}
      </div>
    </section>
  );
}
