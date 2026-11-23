import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { IDENTITY, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { SignatureDraw } from "@/components/SignatureDraw";
import { Magnetic } from "@/components/Magnetic";
import { KineticText } from "@/components/KineticText";
import { jumpToScene } from "@/lib/sceneNavigation";
import { useScrollSkew } from "@/hooks/useScrollSkew";
import { studioSound } from "@/lib/studioSound";

const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
};

interface SignalSceneProps {
  portalFloodActive: boolean;
}

/**
 * Scene 03: CONTACT & THREE-ZONE STUDIO FOOTER (Deep Charcoal #111112)
 * Slides smoothly over Scene 02 with synchronized Electric Cobalt shoulder flood,
 * scroll-scrubbed SVG signature draw, kinetic letter hover on CON TACT, and magnetic studio pills.
 */
export function SignalScene({ portalFloodActive }: SignalSceneProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [contactHovered, setContactHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const prefersReduced = Boolean(useReducedMotion());
  const scrollSkew = useScrollSkew(2.4);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Flatten top rounded shoulders cleanly right as Scene 03 reaches the top of the viewport
  const topCornerRadius = useTransform(scrollYProgress, [0.75, 0.98], [36, 0]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(URLS.emailDisplay);
      studioSound.playSuccess();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = URLS.email;
    }
  };

  const scrollToTop = () => {
    studioSound.playClick();
    jumpToScene("#monolith");
  };

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: portalFloodActive ? "#0258FF" : "#F4F4EE",
      }}
      transition={
        prefersReduced
          ? { duration: 0.04 }
          : portalFloodActive
            ? { duration: 0.01 }
            : { duration: 0.14, delay: 0.24 }
      }
      className="relative z-20 -mt-px"
    >
      <motion.footer
        ref={footerRef}
        id="signal"
        data-scene="signal"
        data-theme="dark"
        style={
          prefersReduced
            ? undefined
            : {
                borderTopLeftRadius: topCornerRadius,
                borderTopRightRadius: topCornerRadius,
              }
        }
        className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#111112] px-4 pt-24 pb-10 text-[#F4F4EE] sm:px-8 sm:pb-12"
      >
        {/* Top index */}
        <div className="mx-auto flex w-full max-w-[1440px] items-baseline justify-center gap-2 text-center">
          <span className="font-editorial text-base italic text-[#0258FF]">
            03.
          </span>
          <p className="font-condensed text-xs font-bold tracking-[0.24em] uppercase text-[#A1A19C] sm:text-sm">
            CONTACT
          </p>
        </div>

        {/* Centerpiece Scroll-Scrubbed Signature Draw + Monumental CONTACT + Magnetic Pill Actions */}
        <motion.div
          style={prefersReduced ? undefined : { skewY: scrollSkew }}
          className="mx-auto my-auto flex w-full max-w-[1440px] flex-col items-center py-12 text-center"
        >
          <div className="mb-3">
            <SignatureDraw
              scrollProgress={scrollYProgress}
              stroke="#0258FF"
              className="h-10 w-auto sm:h-12"
            />
          </div>

          <motion.a
            href={URLS.email}
            data-cursor="MAIL"
            onClick={() => studioSound.playClick()}
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
                <KineticText text="CON" />
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
                <KineticText text="TACT" />
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

          {/* Magnetic Chamfered Studio Plate Action Row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.2}>
              <a
                href={URLS.email}
                onClick={() => studioSound.playClick()}
                data-cursor="MAIL"
                className="chamfer-md inline-flex min-h-[48px] items-center gap-2.5 bg-[#F4F4EE] px-6 font-mono text-xs font-medium tracking-[0.04em] text-[#111112] transition-colors hover:bg-[#0258FF] hover:text-white active:scale-[0.98] sm:text-sm"
              >
                <span>{URLS.emailDisplay}</span>
                <ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
              </a>
            </Magnetic>

            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={handleCopyEmail}
                data-cursor={copied ? "COPIED" : "COPY"}
                className="chamfer-md inline-flex min-h-[48px] cursor-pointer items-center gap-2 border border-white/25 bg-transparent px-5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112] active:scale-[0.98]"
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
            </Magnetic>
            <span className="sr-only" aria-live="polite">
              {copied ? "Alamat email admin@ftsduaenam.web.id disalin." : ""}
            </span>
          </div>
        </motion.div>

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

            {/* Zone 2: Poetic tagline */}
            <p className="font-editorial text-sm italic tracking-[0.04em] text-[#A1A19C] md:text-center md:text-base">
              {IDENTITY.tagline}
            </p>

            {/* Zone 3: Direct Gateway & Legal + Circular Magnetic Back-to-Top */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
              <a
                href={URLS.constella}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => studioSound.playClick()}
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
              >
                CONSTELLA
              </a>
              <a
                href={URLS.login}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => studioSound.playClick()}
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:text-[#5C9AFF]"
              >
                LOGIN
              </a>
              <a
                href={URLS.privacy}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => studioSound.playClick()}
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
              >
                PRIVACY
              </a>
              <a
                href={URLS.terms}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => studioSound.playClick()}
                className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
              >
                TERMS
              </a>
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  onClick={scrollToTop}
                  data-cursor="TOP"
                  aria-label="Kembali ke paling atas"
                  className="chamfer-sm inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/25 text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white active:scale-95"
                >
                  <ArrowUpIcon size={17} weight="bold" aria-hidden="true" />
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
