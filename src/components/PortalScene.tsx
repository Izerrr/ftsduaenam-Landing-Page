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
  onEclipseChange: (active: boolean) => void;
}

const ECLIPSE_SPRING = {
  type: "spring" as const,
  stiffness: 200,
  damping: 26,
};

/**
 * Scene II: THE DOOR (Sterile Pale Bone #EAE8E1 -> Sudden Abyssal Eclipse #060607)
 * Walking out of darkness into an unsettlingly stark, over-lit silent room with a giant
 * pointer-watching eclipse iris behind the sole threshold: TASKPANEL.
 * Hovering or focusing snaps the lights out into pitch abyss with cold cobalt luminescence.
 */
export function PortalScene({ onEclipseChange }: PortalSceneProps) {
  const [engaged, setEngaged] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const outerRingRotate = useTransform(scrollYProgress, [0, 1], [-22, 22]);
  const topWhisperX = useTransform(scrollYProgress, [0, 1], ["-5%", "8%"]);
  const bottomWhisperX = useTransform(scrollYProgress, [0, 1], ["6%", "-8%"]);

  // Smooth slow-lag pupil tracking & subtle magnetic pull
  const irisRawX = useMotionValue(0);
  const irisRawY = useMotionValue(0);
  const irisX = useSpring(irisRawX, { stiffness: 110, damping: 22 });
  const irisY = useSpring(irisRawY, { stiffness: 110, damping: 22 });

  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const smoothX = useSpring(magX, { stiffness: 190, damping: 24 });
  const smoothY = useSpring(magY, { stiffness: 190, damping: 24 });

  const setEclipse = (next: boolean) => {
    setEngaged(next);
    onEclipseChange(next);
    if (!next) {
      magX.set(0);
      magY.set(0);
    }
  };

  const handleSectionPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReduced || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    irisRawX.set(nx * 36);
    irisRawY.set(ny * 26);
  };

  const handleTriggerPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (prefersReduced || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
    const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    magX.set(dx);
    magY.set(dy);
  };

  return (
    <section
      ref={sectionRef}
      id="portal"
      data-scene="portal"
      data-theme="light"
      data-portal-eclipse={engaged ? "true" : "false"}
      onPointerMove={handleSectionPointerMove}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#EAE8E1] px-4 py-24 text-[#0B0B0C] sm:px-8"
    >
      {/* Sudden Lights-Out Abyssal Eclipse layer on hover/focus */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: engaged ? 1 : 0,
        }}
        transition={prefersReduced ? { duration: 0.12 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 bg-[#060607]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(520px circle at 50% 50%, rgba(2, 88, 255, 0.26), rgba(2, 88, 255, 0.05) 45%, transparent 72%)",
          }}
        />
      </motion.div>

      {/* Giant Silent Watching Eclipse Iris behind the sole threshold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.svg
          viewBox="0 0 720 720"
          fill="none"
          style={prefersReduced ? undefined : { rotate: outerRingRotate }}
          className={`h-[min(88vw,680px)] w-[min(88vw,680px)] transition-colors duration-300 ${
            engaged ? "text-[#F2F2EE]/18" : "text-[#0B0B0C]/12"
          }`}
        >
          {/* Outer sharp eye-diamond outline */}
          <path d="M40 360L360 140L680 360L360 580Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="360" cy="360" r="240" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 11" />
          <circle cx="360" cy="360" r="142" stroke="currentColor" strokeWidth="1" />
        </motion.svg>

        {/* Pointer-tracking inner pupil slit */}
        <motion.div
          style={prefersReduced ? undefined : { x: irisX, y: irisY }}
          animate={
            prefersReduced
              ? undefined
              : {
                  scaleY: engaged ? 1.38 : 1,
                  scaleX: engaged ? 0.55 : 1,
                }
          }
          transition={ECLIPSE_SPRING}
          className={`absolute h-36 w-12 rounded-full border transition-colors duration-300 sm:h-48 sm:w-16 ${
            engaged
              ? "border-[#0258FF]/70 bg-[#0258FF]/20"
              : "border-[#0B0B0C]/15 bg-[#0B0B0C]/[0.04]"
          }`}
        />
      </div>

      {/* Subtle scroll-driven ghost whispers along upper & lower perimeter */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-16 overflow-hidden py-2 transition-colors duration-300 sm:top-20 ${
          engaged ? "text-[#F2F2EE]/[0.08]" : "text-[#0B0B0C]/[0.07]"
        }`}
      >
        <motion.p
          style={prefersReduced ? undefined : { x: topWhisperX }}
          className="w-max font-editorial text-2xl italic tracking-[0.28em] sm:text-4xl"
        >
          the only door &middot; taskpanel &middot; xxvi &middot; the only door &middot; taskpanel &middot; xxvi &middot;
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-16 overflow-hidden py-2 transition-colors duration-300 sm:bottom-20 ${
          engaged ? "text-[#F2F2EE]/[0.08]" : "text-[#0B0B0C]/[0.07]"
        }`}
      >
        <motion.p
          style={prefersReduced ? undefined : { x: bottomWhisperX }}
          className="w-max font-editorial text-2xl italic tracking-[0.28em] sm:text-4xl"
        >
          vikolvere &middot; verivela &middot; step inside &middot; vikolvere &middot; verivela &middot; step inside &middot;
        </motion.p>
      </div>

      {/* Centerpiece sole monumental door: TASKPANEL */}
      <div className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center">
        <p
          className={`mb-7 font-editorial text-sm italic tracking-[0.28em] transition-colors duration-300 sm:mb-9 sm:text-base ${
            engaged ? "text-[#9B9B96]" : "text-[#474742]"
          }`}
        >
          ii &middot; the only door
        </p>

        <motion.a
          ref={triggerRef}
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="enter"
          onMouseEnter={() => setEclipse(true)}
          onMouseLeave={() => setEclipse(false)}
          onFocus={() => setEclipse(true)}
          onBlur={() => setEclipse(false)}
          onPointerMove={handleTriggerPointerMove}
          whileTap={prefersReduced ? undefined : { scale: 0.985 }}
          style={prefersReduced ? undefined : { x: smoothX, y: smoothY }}
          className="group relative inline-flex max-w-full flex-col items-center px-6 py-7 no-underline sm:px-12 sm:py-9"
        >
          {/* Vertical razor threshold lines flanking the door */}
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : -14, opacity: engaged ? 1 : 0.35 }
            }
            transition={ECLIPSE_SPRING}
            className={`pointer-events-none absolute top-3 bottom-3 left-0 w-[1.5px] transition-colors duration-300 ${
              engaged ? "bg-[#0258FF]" : "bg-[#0B0B0C]"
            }`}
          />
          <motion.span
            aria-hidden="true"
            animate={
              prefersReduced
                ? undefined
                : { x: engaged ? 0 : 14, opacity: engaged ? 1 : 0.35 }
            }
            transition={ECLIPSE_SPRING}
            className={`pointer-events-none absolute top-3 right-0 bottom-3 w-[1.5px] transition-colors duration-300 ${
              engaged ? "bg-[#0258FF]" : "bg-[#0B0B0C]"
            }`}
          />

          <span className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-4">
            <span
              className={`font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase transition-colors duration-300 md:text-[clamp(6rem,2.2rem+10vw,13.4rem)] ${
                engaged ? "text-[#F2F2EE] ghost-echo-cobalt" : "text-[#0B0B0C]"
              }`}
            >
              TASK
            </span>
            <span
              className={`pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.025em] transition-colors duration-300 md:text-[clamp(6.3rem,2.4rem+10.5vw,14rem)] ${
                engaged ? "text-[#0258FF] ghost-echo-cobalt" : "text-[#004BE0]"
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
                    }
              }
              transition={ECLIPSE_SPRING}
              className={`inline-flex self-center transition-colors duration-300 ${
                engaged ? "text-[#F2F2EE]" : "text-[#0B0B0C]"
              }`}
            >
              <ArrowUpRightIcon
                size={44}
                weight="regular"
                className="h-9 w-9 sm:h-14 sm:w-14 md:h-20 md:w-20"
              />
            </motion.span>
          </span>

          <span
            className={`mt-5 font-condensed text-xs font-bold tracking-[0.26em] uppercase transition-colors duration-300 sm:text-sm ${
              engaged ? "text-[#F2F2EE]" : "text-[#0B0B0C]"
            }`}
          >
            <ScrambleText text="TASKPANEL.FTSDUAENAM.WEB.ID" />
          </span>
        </motion.a>

        <p
          className={`mt-7 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-300 sm:text-xs ${
            engaged ? "text-[#9B9B96]" : "text-[#474742]"
          }`}
        >
          @student.uns.ac.id &middot; discord
        </p>

        <a
          href="#signal"
          data-cursor="iii"
          className={`group mt-10 inline-flex min-h-[44px] items-center gap-2 px-4 font-editorial text-xs italic tracking-[0.26em] transition-colors duration-300 ${
            engaged
              ? "text-[#9B9B96] hover:text-[#F2F2EE]"
              : "text-[#474742] hover:text-[#0B0B0C]"
          }`}
        >
          <span>iii &middot; whisper</span>
          <ArrowDownIcon
            size={14}
            weight="regular"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-y-1"
          />
        </a>
      </div>
    </section>
  );
}
