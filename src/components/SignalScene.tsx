import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { IDENTITY, URLS } from "@/data/services";

const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
};

/**
 * Scene 03: THE SIGNAL (Obsidian Dark #0B0B0C)
 * Monumental CONTACT lockup + instant clipboard copy + stark minimal gateway/legal baseline.
 */
export function SignalScene() {
  const [contactHovered, setContactHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const prefersReduced = Boolean(useReducedMotion());

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
      id="signal"
      data-scene="signal"
      data-theme="dark"
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#0B0B0C] px-4 pt-24 pb-24 text-white sm:px-8 sm:pb-28"
    >
      {/* Top index */}
      <div className="mx-auto w-full max-w-[1440px] text-center">
        <p className="font-condensed text-xs font-bold tracking-[0.26em] uppercase text-[#9A9A95] sm:text-sm">
          03 // SIGNAL
        </p>
      </div>

      {/* Centerpiece CONTACT typography */}
      <div className="mx-auto my-auto flex w-full max-w-[1440px] flex-col items-center py-12 text-center">
        <motion.a
          href={URLS.email}
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
                  : { x: contactHovered ? -8 : 0 }
              }
              transition={HOVER_SPRING}
              className="font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase text-white md:text-[clamp(6rem,2.2rem+9.8vw,13rem)]"
            >
              CON
            </motion.span>
            <motion.span
              animate={
                prefersReduced
                  ? undefined
                  : { x: contactHovered ? 8 : 0 }
              }
              transition={HOVER_SPRING}
              className="pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.02em] text-white transition-colors duration-200 group-hover:text-[#0258FF] md:text-[clamp(6.3rem,2.4rem+10.2vw,13.6rem)]"
            >
              TACT
            </motion.span>
          </span>

          {/* Electric cobalt underline sweep */}
          <span
            aria-hidden="true"
            className="mt-2 block h-[2px] w-full bg-white/15"
          >
            <motion.span
              initial={false}
              animate={{ scaleX: contactHovered ? 1 : 0 }}
              transition={prefersReduced ? { duration: 0.01 } : HOVER_SPRING}
              className="block h-full w-full origin-left bg-[#0258FF]"
            />
          </span>

          <span className="mt-5 inline-flex items-center gap-2 font-mono text-sm tracking-[0.06em] text-white transition-colors group-hover:text-[#60A5FA] sm:text-base">
            <span>{URLS.emailDisplay}</span>
            <ArrowUpRightIcon size={17} weight="bold" aria-hidden="true" />
          </span>
        </motion.a>

        {/* Functional clipboard copy action */}
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/25 bg-transparent px-4 font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#9A9A95] transition-colors hover:border-white hover:bg-white hover:text-[#0B0B0C] active:scale-[0.98]"
          >
            {copied ? (
              <>
                <CheckIcon size={15} weight="bold" aria-hidden="true" />
                <span>TERSALIN</span>
              </>
            ) : (
              <>
                <CopyIcon size={15} weight="bold" aria-hidden="true" />
                <span>SALIN EMAIL</span>
              </>
            )}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Alamat email admin@ftsduaenam.web.id disalin." : ""}
          </span>
        </div>
      </div>

      {/* Stark Minimal Baseline */}
      <div className="mx-auto w-full max-w-[1440px] border-t border-white/15 pt-6">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="font-condensed text-xs font-bold tracking-[0.18em] uppercase text-[#9A9A95]">
            {IDENTITY.domain} &middot; {IDENTITY.facultyCode}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={URLS.login}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-white transition-colors hover:text-[#60A5FA]"
            >
              LOGIN
            </a>
            <a
              href={URLS.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#9A9A95] transition-colors hover:text-white"
            >
              PRIVACY
            </a>
            <a
              href={URLS.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#9A9A95] transition-colors hover:text-white"
            >
              TERMS
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Kembali ke paling atas"
              className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 border border-white/25 px-3 font-condensed text-xs font-bold tracking-[0.14em] uppercase text-white transition-colors hover:border-white hover:bg-white hover:text-[#0B0B0C]"
            >
              <ArrowUpIcon size={14} weight="bold" aria-hidden="true" />
              <span>TOP</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
