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
import { ARCHIVE_MODULE, URLS } from "@/data/services";
import { useScrollSkew } from "@/hooks/useScrollSkew";
import { studioSound } from "@/lib/studioSound";

interface PortalSceneProps {
  onFloodChange: (active: boolean) => void;
}

const FLOOD_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

const BLOB_OUTER_REST =
  "M320 62C424 54 532 108 564 206C596 304 548 424 468 498C388 572 264 596 172 544C80 492 48 378 66 270C84 162 216 70 320 62Z";
const BLOB_OUTER_ACTIVE =
  "M320 42C446 46 548 132 576 228C604 324 530 438 450 510C370 582 246 608 158 532C70 456 58 344 82 240C106 136 194 38 320 42Z";

const BLOB_INNER_REST =
  "M320 116C398 112 484 156 508 232C532 308 494 402 432 458C370 514 274 532 204 492C134 452 108 364 122 280C136 196 242 120 320 116Z";
const BLOB_INNER_ACTIVE =
  "M320 96C416 104 502 170 520 248C538 326 482 418 418 472C354 526 262 544 188 486C114 428 112 342 132 258C152 174 224 88 320 96Z";

/**
 * Scene 02: THE SINGLE PORTAL (Warm Off-White #F4F4EE -> Electric Cobalt #0258FF Flood)
 * Features:
 * - Sheet-over-sheet parallax tuck (scales gently down as Scene 03 rises over it)
 * - Continuous infinite racing marquee strips that accelerate 2.8x on hover
 * - Morphing organic contour blob + interactive cobalt specular glow following the pointer
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

  // Full pass scroll for rotating contour
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
    setEngaged((prev) => {
      if (prev !== next) {
        studioSound.playFlood(next);
      }
      return next;
    });
    onFloodChange(next);
    if (!next) {
      magX.set(0);
      magY.set(0);
    }
  };

  const handleSectionPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReduced || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const relY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    sectionRef.current.style.setProperty("--px", `${relX.toFixed(2)}%`);
    sectionRef.current.style.setProperty("--py", `${relY.toFixed(2)}%`);
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
      onPointerMove={handleSectionPointerMove}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#F4F4EE] px-4 py-18 text-[#111112] sm:px-8"
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

      {/* Interactive Cobalt Specular Glow tracking cursor while flood is active */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          engaged ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(560px circle at var(--px, 50%) var(--py, 50%), rgba(255, 255, 255, 0.22), rgba(92, 154, 255, 0.1) 42%, transparent 72%)",
        }}
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
        {/* Organic vector blob contour rotating on scroll + smoothly morphing shape on hover */}
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
            engaged ? "text-white/25" : "text-[#111112]/10"
          }`}
        >
          <motion.path
            initial={false}
            animate={{ d: engaged ? BLOB_OUTER_ACTIVE : BLOB_OUTER_REST }}
            transition={FLOOD_SPRING}
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <motion.path
            initial={false}
            animate={{ d: engaged ? BLOB_INNER_ACTIVE : BLOB_INNER_REST }}
            transition={FLOOD_SPRING}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
        </motion.svg>

        {/* Continuous Infinite Racing Marquee Bands accelerating 2.8x on hover */}
        <InfiniteBand
          position="top"
          direction={-1}
          fast={engaged}
          engaged={engaged}
          prefersReduced={prefersReduced}
          text="TASKPANEL · FTS26 · WORKSPACE · TASKPANEL · FTS26 · WORKSPACE · "
        />
        <InfiniteBand
          position="bottom"
          direction={1}
          fast={engaged}
          engaged={engaged}
          prefersReduced={prefersReduced}
          text="FTSDUAENAM.WEB.ID · 2026 · FTSDUAENAM.WEB.ID · 2026 · "
        />

        {/* Centerpiece Single Portal */}
        <motion.div
          style={prefersReduced ? undefined : { skewY: scrollSkew }}
          className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center"
        >
          <p
            className={`mb-4 flex items-baseline gap-2 font-condensed text-xs font-bold tracking-[0.24em] uppercase transition-colors duration-200 sm:mb-5 sm:text-sm ${
              engaged ? "text-white" : "text-[#4A4A45]"
            }`}
          >
            <span
              className={`font-editorial text-base italic tracking-normal ${
                engaged ? "text-white" : "text-[#004BE0]"
              }`}
            >
              02.
            </span>
            <span>WORKSPACE</span>
          </p>

          <motion.a
            ref={triggerRef}
            href={URLS.taskpanel}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hide="true"
            onClick={() => studioSound.playClick()}
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

          {/* Highlighted FTS26 Archive Strip: Constella 2026 */}
          <motion.a
            href={ARCHIVE_MODULE.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="ARCHIVE"
            onClick={() => studioSound.playClick()}
            whileTap={prefersReduced ? undefined : { scale: 0.99 }}
            className={`group relative mt-8 flex w-full max-w-[820px] flex-col gap-2.5 border-y px-2 py-4 text-left no-underline transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 ${
              engaged
                ? "border-white/30 text-white hover:border-white"
                : "border-[#111112]/15 text-[#111112] hover:border-[#0258FF]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span
                className={`chamfer-sm border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-200 ${
                  engaged
                    ? "border-white/35 text-white/90"
                    : "border-[#111112]/20 text-[#4A4A45] group-hover:border-[#0258FF]/45 group-hover:text-[#004BE0]"
                }`}
              >
                {ARCHIVE_MODULE.badge}
              </span>

              <span className="flex items-baseline gap-0.5 text-[clamp(1.65rem,1.2rem+1.8vw,2.35rem)] leading-none">
                <span className="font-condensed font-extrabold tracking-[-0.03em] uppercase">
                  {ARCHIVE_MODULE.firstWord}
                </span>
                <span
                  className={`font-editorial italic tracking-[-0.02em] transition-colors duration-200 ${
                    engaged
                      ? "text-white"
                      : "text-[#004BE0] group-hover:text-[#0258FF]"
                  }`}
                >
                  {ARCHIVE_MODULE.secondWord}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-5">
              <span
                className={`font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 ${
                  engaged ? "text-white/85" : "text-[#4A4A45]"
                }`}
              >
                {ARCHIVE_MODULE.metrics}
              </span>

              <span
                className={`inline-flex min-h-[32px] items-center gap-1.5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase transition-colors duration-200 ${
                  engaged
                    ? "text-white"
                    : "text-[#111112] group-hover:text-[#004BE0]"
                }`}
              >
                <span>{ARCHIVE_MODULE.shortDomain}</span>
                <ArrowUpRightIcon
                  size={14}
                  weight="bold"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </motion.a>

          <a
            href="#signal"
            onClick={() => studioSound.playClick()}
            data-cursor="NEXT"
            className={`group mt-8 inline-flex min-h-[44px] flex-col items-center gap-1.5 px-4 py-1 no-underline transition-colors duration-200 ${
              engaged
                ? "text-white/90 hover:text-white"
                : "text-[#4A4A45] hover:text-[#111112]"
            }`}
          >
            <span className="flex items-baseline gap-2">
              <span
                className={`font-editorial text-sm italic ${
                  engaged ? "text-white" : "text-[#004BE0]"
                }`}
              >
                03.
              </span>
              <span className="font-condensed text-xs font-extrabold tracking-[0.22em] uppercase">
                CONTACT
              </span>
              <ArrowDownIcon
                size={12}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-y-1"
              />
            </span>
            <span
              aria-hidden="true"
              className={`block h-[1.5px] w-10 origin-left transition-all duration-200 group-hover:w-full ${
                engaged ? "bg-white/45 group-hover:bg-white" : "bg-[#111112]/25 group-hover:bg-[#004BE0]"
              }`}
            />
          </a>
        </motion.div>
      </motion.div>

      {/* Spring-lagged floating studio preview plate following pointer on hover (Desktop) */}
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
          className="chamfer-sm pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-2.5 border border-white/25 bg-[#111112] px-4 py-2 text-white shadow-xl"
        >
          <span className="h-2 w-2 bg-[#0258FF]" />
          <span className="font-condensed text-xs font-bold tracking-[0.16em] uppercase whitespace-nowrap">
            OPEN WORKSPACE
          </span>
          <ArrowUpRightIcon size={14} weight="bold" />
        </motion.div>
      )}
    </section>
  );
}

interface InfiniteBandProps {
  position: "top" | "bottom";
  direction: 1 | -1;
  fast: boolean;
  engaged: boolean;
  prefersReduced: boolean;
  text: string;
}

function InfiniteBand({
  position,
  direction,
  fast,
  engaged,
  prefersReduced,
  text,
}: InfiniteBandProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const fastRef = useRef(fast);

  useEffect(() => {
    fastRef.current = fast;
  }, [fast]);

  useEffect(() => {
    if (prefersReduced || !trackRef.current || !copyRef.current) return;

    let rafId = 0;
    let lastTime = performance.now();
    let offset = 0;
    let speed = 42;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const copyWidth = copyRef.current?.offsetWidth ?? 0;
      if (copyWidth > 0) {
        const targetSpeed = fastRef.current ? 118 : 42;
        speed += (targetSpeed - speed) * 0.08;
        offset += direction * speed * dt;

        // Wrap cleanly within [-copyWidth, 0) for seamless continuous loop
        if (offset <= -copyWidth) {
          offset += copyWidth;
        } else if (offset > 0) {
          offset -= copyWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [direction, prefersReduced]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 overflow-hidden py-2 transition-colors duration-200 select-none ${
        position === "top" ? "top-0" : "bottom-0"
      } ${engaged ? "text-white/16" : "text-[#111112]/[0.06]"}`}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        <span
          ref={copyRef}
          className="shrink-0 pr-6 font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl"
        >
          {text}
        </span>
        <span className="shrink-0 pr-6 font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl">
          {text}
        </span>
        <span className="shrink-0 pr-6 font-condensed text-3xl font-extrabold tracking-[0.14em] uppercase sm:text-5xl">
          {text}
        </span>
      </div>
    </div>
  );
}
