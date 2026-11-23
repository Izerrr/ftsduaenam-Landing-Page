import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { IDENTITY, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { SignatureDraw } from "@/components/SignatureDraw";

const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
};

/**
 * Scene 03: CONTACT & THREE-ZONE STUDIO FOOTER (Deep Charcoal #111112)
 * Inspired by landonorris.com's heavy-surface rounded card overlap & three-zone structured footer.
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
    <div className="bg-[#F4F4EE]">
      <footer
        id="signal"
        data-scene="signal"
        data-theme="dark"
        className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden rounded-t-[28px] bg-[#111112] px-4 pt-24 pb-10 text-[#F4F4EE] sm:rounded-t-[44px] sm:px-8 sm:pb-12"
      >
        {/* Top index */}
        <div className="mx-auto w-full max-w-[1440px] text-center">
          <p className="font-condensed text-xs font-bold tracking-[0.26em] uppercase text-[#A1A19C] sm:text-sm">
            03 / CONTACT
          </p>
        </div>

        {/* Centerpiece Signature Draw + Monumental CONTACT + Pill Actions */}
        <div className="mx-auto my-auto flex w-full max-w-[1440px] flex-col items-center py-12 text-center">
          <div className="mb-3">
            <SignatureDraw
              trigger="inView"
              stroke="#0258FF"
              className="h-10 w-auto sm:h-12"
            />
          </div>

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
                className="font-condensed text-[clamp(3.3rem,1.6rem+10vw,7.4rem)] leading-[0.86] font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE] md:text-[clamp(6rem,2.2rem+9.8vw,13rem)]"
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
                className="pb-2 font-editorial text-[clamp(3.5rem,1.7rem+10.5vw,7.8rem)] leading-[0.88] italic tracking-[-0.02em] text-[#F4F4EE] transition-colors duration-200 group-hover:text-[#0258FF] md:text-[clamp(6.3rem,2.4rem+10.2vw,13.6rem)]"
              >
                TACT
              </motion.span>
            </span>

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
          </motion.a>

          {/* Studio Pill Action Row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={URLS.email}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#F4F4EE] px-6 font-mono text-xs font-medium tracking-[0.04em] text-[#111112] transition-colors hover:bg-[#0258FF] hover:text-white active:scale-[0.98] sm:text-sm"
            >
              <span>{URLS.emailDisplay}</span>
              <ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-transparent px-5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112] active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <CheckIcon size={15} weight="bold" aria-hidden="true" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <CopyIcon size={15} weight="bold" aria-hidden="true" />
                  <span>COPY EMAIL</span>
                </>
              )}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Alamat email admin@ftsduaenam.web.id disalin." : ""}
            </span>
          </div>
        </div>

        {/* Three-Zone Structured Studio Footer */}
        <div className="mx-auto w-full max-w-[1440px] border-t border-white/15 pt-7">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            {/* Zone 1: Brand Monogram */}
            <div className="flex items-center gap-3">
              <FtsLogo className="h-7 w-auto text-[#F4F4EE]" />
              <span className="font-mono text-xs text-[#A1A19C]">
                {IDENTITY.domain}
              </span>
            </div>

            {/* Zone 2: Cohort Stamp */}
            <p className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#A1A19C] md:text-center">
              {IDENTITY.cohort} &middot; {IDENTITY.faculty}
            </p>

            {/* Zone 3: Direct Gateway & Legal + Circular Back-to-Top */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
              <a
                href={URLS.login}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:text-[#5C9AFF]"
              >
                LOGIN
              </a>
              <a
                href={URLS.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
              >
                PRIVACY
              </a>
              <a
                href={URLS.terms}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
              >
                TERMS
              </a>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Kembali ke paling atas"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white active:scale-95"
              >
                <ArrowUpIcon size={17} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
