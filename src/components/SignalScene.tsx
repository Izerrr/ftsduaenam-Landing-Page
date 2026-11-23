import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { IDENTITY, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { VoidCanvas } from "@/components/VoidCanvas";

const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

const HIDDEN_SIGNALS = [
  "LEAVE A TRACE  ·  XXVI  ·  STILL LISTENING  ·  FTSDUAENAM  ·  LEAVE A TRACE",
  "ADMIN@FTSDUAENAM.WEB.ID  ·  VIKOLVERE  ·  VERIVELA  ·  DO NOT FORGET",
  "FATISDA UNS  ·  XXVI  ·  THE SIGNAL REMAINS  ·  VIKOLVERE  ·  VERIVELA",
];

/**
 * Scene III: THE WHISPER (Pitch Abyss #060607)
 * Returns to pitch darkness with pointer-revealed shadows, drifting ghosted XXVI mark,
 * haunted CONTACT display lockup, joined email + copy bar, and austere legal baseline.
 */
export function SignalScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [contactHovered, setContactHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const prefersReduced = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [54, -16]);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReduced || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const relX = ((event.clientX - rect.left) / rect.width) * 100;
    const relY = ((event.clientY - rect.top) / rect.height) * 100;
    sectionRef.current.style.setProperty("--mx", `${relX.toFixed(2)}%`);
    sectionRef.current.style.setProperty("--my", `${relY.toFixed(2)}%`);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(URLS.emailDisplay);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = URLS.email;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <footer
      ref={sectionRef}
      id="signal"
      data-scene="signal"
      data-theme="dark"
      onPointerMove={handlePointerMove}
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#060607] px-4 pt-24 pb-24 text-[#F2F2EE] sm:px-8 sm:pb-28"
    >
      {/* Low-intensity ambient abyss motes */}
      <VoidCanvas intensity="low" />

      {/* Hidden shadow whispers unveiled by pointer torch */}
      <div
        aria-hidden="true"
        className="torch-reveal-mask pointer-events-none absolute inset-0 flex flex-col justify-around overflow-hidden py-24 opacity-60 select-none"
      >
        {HIDDEN_SIGNALS.map((line, idx) => (
          <p
            key={idx}
            className="whitespace-nowrap font-editorial text-xl italic tracking-[0.34em] text-[#F2F2EE]/40 sm:text-2xl"
            style={{ transform: `translateX(${idx % 2 === 0 ? "-6%" : "-14%"})` }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Cold pointer torch + claustrophobic vignette */}
      <div aria-hidden="true" className="abyss-torch pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="abyss-vignette pointer-events-none absolute inset-0" />

      {/* Ghosted giant XXVI watermark */}
      <motion.div
        aria-hidden="true"
        style={prefersReduced ? undefined : { y: ghostY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span className="stroke-display-dark font-editorial text-[clamp(11rem,28vw,28rem)] leading-none italic tracking-[-0.04em] opacity-45">
          xxvi
        </span>
      </motion.div>

      {/* Top whisper */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] text-center">
        <p className="font-editorial text-sm italic tracking-[0.28em] text-[#9B9B96] sm:text-base">
          iii &middot; whisper
        </p>
      </div>

      {/* Centerpiece CONTACT display + transmission bar */}
      <div className="relative z-10 mx-auto my-auto flex w-full max-w-[1440px] flex-col items-center py-12 text-center">
        <motion.a
          href={URLS.email}
          data-cursor="reach"
          onMouseEnter={() => setContactHovered(true)}
          onMouseLeave={() => setContactHovered(false)}
          onFocus={() => setContactHovered(true)}
          onBlur={() => setContactHovered(false)}
          whileTap={prefersReduced ? undefined : { scale: 0.985 }}
          className="group relative inline-flex max-w-full flex-col items-center px-3 py-3 no-underline"
        >
          <span className="flex flex-wrap items-baseline justify-center gap-x-1 sm:gap-x-3">
            <motion.span
              animate={
                prefersReduced
                  ? undefined
                  : { x: contactHovered ? -9 : 0 }
              }
              transition={HOVER_SPRING}
              className={`font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase text-[#F2F2EE] transition-all duration-200 md:text-[clamp(6rem,2.2rem+9.8vw,13rem)] ${
                contactHovered ? "ghost-echo-cobalt" : ""
              }`}
            >
              CON
            </motion.span>
            <motion.span
              animate={
                prefersReduced
                  ? undefined
                  : { x: contactHovered ? 9 : 0 }
              }
              transition={HOVER_SPRING}
              className={`pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.02em] transition-colors duration-300 md:text-[clamp(6.3rem,2.4rem+10.2vw,13.6rem)] ${
                contactHovered ? "text-[#0258FF] ghost-echo-cobalt" : "text-[#F2F2EE]"
              }`}
            >
              TACT
            </motion.span>
          </span>

          {/* Razor cold cobalt underline */}
          <span
            aria-hidden="true"
            className="mt-2 block h-[1.5px] w-full bg-[#F2F2EE]/15"
          >
            <motion.span
              initial={false}
              animate={{ scaleX: contactHovered ? 1 : 0 }}
              transition={prefersReduced ? { duration: 0.01 } : HOVER_SPRING}
              className="block h-full w-full origin-left bg-[#0258FF]"
            />
          </span>
        </motion.a>

        {/* Stark joined email + copy threshold */}
        <div className="mt-7 flex flex-wrap items-stretch justify-center border border-[#F2F2EE]/20 bg-[#060607]/85">
          <a
            href={URLS.email}
            data-cursor="mail"
            className="inline-flex min-h-[48px] items-center gap-2.5 px-5 font-mono text-xs tracking-[0.06em] text-[#F2F2EE] transition-colors hover:bg-[#0258FF] hover:text-white sm:text-sm"
          >
            <span>{URLS.emailDisplay}</span>
            <ArrowUpRightIcon size={15} weight="regular" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            data-cursor="copy"
            className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 border-l border-[#F2F2EE]/20 px-4 font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#9B9B96] transition-colors hover:bg-[#F2F2EE] hover:text-[#060607] active:scale-[0.98]"
          >
            {copied ? (
              <>
                <CheckIcon size={15} weight="bold" aria-hidden="true" />
                <span>TERSALIN</span>
              </>
            ) : (
              <>
                <CopyIcon size={15} weight="regular" aria-hidden="true" />
                <span>SALIN</span>
              </>
            )}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Alamat email admin@ftsduaenam.web.id disalin." : ""}
          </span>
        </div>
      </div>

      {/* Austere Minimal Baseline */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] border-t border-[#F2F2EE]/15 pt-6">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <FtsLogo compact trackPointer className="h-7 w-8 text-[#F2F2EE]" />
            <p className="font-editorial text-sm italic tracking-[0.2em] text-[#9B9B96]">
              {IDENTITY.domain} &middot; xxvi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={URLS.login}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="login"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#F2F2EE] transition-colors hover:text-[#5C9AFF]"
            >
              LOGIN
            </a>
            <a
              href={URLS.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#9B9B96] transition-colors hover:text-[#F2F2EE]"
            >
              PRIVACY
            </a>
            <a
              href={URLS.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#9B9B96] transition-colors hover:text-[#F2F2EE]"
            >
              TERMS
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              data-cursor="top"
              aria-label="Kembali ke paling atas"
              className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 border border-[#F2F2EE]/20 px-3 font-condensed text-xs font-bold tracking-[0.18em] uppercase text-[#F2F2EE] transition-colors hover:border-[#F2F2EE] hover:bg-[#F2F2EE] hover:text-[#060607]"
            >
              <ArrowUpIcon size={14} weight="regular" aria-hidden="true" />
              <span>TOP</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
