import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon as ArrowUp } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { CommandIcon as Command } from "@phosphor-icons/react/Command";
import { COHORT_IDENTITY, FOOTER_COLUMNS, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { SplitBlockCta } from "@/components/SplitBlockCta";

interface ClosingFooterProps {
  onOpenQuickJump: () => void;
}

/**
 * Closing CTA & Editorial Footer (#131313, data-theme="dark"):
 * Large mixed display closing prompt, 1-line login guide, Split-Block CTA to /login,
 * hairline divider, oversized white wordmark left, 3 Instrument Serif link columns right,
 * and sharp square scroll-to-top button.
 */
export function ClosingFooter({ onOpenQuickJump }: ClosingFooterProps) {
  const prefersReduced = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <footer
      data-theme="dark"
      className="bg-[#131313] text-white"
    >
      {/* Closing CTA band */}
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <div className="flex flex-col items-start gap-7">
          <h2 className="headline-balance">
            <span className="block font-condensed text-[clamp(2.9rem,2rem+5vw,6rem)] leading-[0.9] font-extrabold uppercase tracking-[-0.025em] text-white">
              SIAP MASUK KE
            </span>
            <span className="mt-1 block pb-1 font-editorial text-[clamp(3.1rem,2.1rem+5.5vw,6.6rem)] leading-[0.95] italic text-[#FACC15]">
              Workspace Kamu?
            </span>
          </h2>

          <p className="prose-pretty max-w-[54ch] text-base leading-relaxed text-[#C8C8C4] sm:text-lg">
            Masuk dengan akun <span className="font-semibold text-white">@student.uns.ac.id</span>{" "}
            untuk mahasiswa, atau <span className="font-semibold text-white">Discord OAuth2</span>{" "}
            untuk pengurus dan PJ kelas.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <SplitBlockCta
              label="MASUK TASKPANEL"
              href={URLS.login}
              external
              variant="light"
            />
            <button
              type="button"
              onClick={onOpenQuickJump}
              className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 border-[1.5px] border-white/40 bg-transparent px-5 font-condensed text-base font-bold uppercase tracking-[0.05em] text-white transition-colors hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              <Command size={18} weight="bold" aria-hidden="true" />
              <span>PINTASAN CEPAT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hairline divider */}
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-8">
            {/* Left: Giant white wordmark + cohort identity */}
            <div className="lg:col-span-5">
              <a
                href="#beranda"
                aria-label="ftsduaenam kembali ke atas"
                className="inline-block text-white transition-opacity hover:opacity-90"
              >
                <FtsLogo className="h-14 w-auto sm:h-16 md:h-20" />
              </a>
              <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-[#C8C8C4]">
                {COHORT_IDENTITY.facultyFull} · {COHORT_IDENTITY.year} (
                {COHORT_IDENTITY.generation}).
              </p>
              <p className="mt-2 font-condensed text-xs font-bold uppercase tracking-[0.08em] text-[#C8C8C4]">
                S-1 INFORMATIKA · S-1 SAINS DATA · PSDKU KEBUMEN
              </p>
            </div>

            {/* Right: 3 clean Instrument Serif link columns */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-6">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.heading}>
                  <h3 className="font-condensed text-xs font-extrabold uppercase tracking-[0.1em] text-[#FACC15]">
                    {column.heading}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className="group inline-flex min-h-[36px] items-center gap-1.5 font-editorial text-xl leading-snug text-white transition-colors hover:text-[#FACC15]"
                        >
                          <span className="underline-offset-4 group-hover:underline">
                            {link.label}
                          </span>
                          {link.external && (
                            <ArrowUpRight
                              size={15}
                              weight="bold"
                              aria-hidden="true"
                              className="opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                            />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Far right: Sharp 0px square scroll-to-top button */}
            <div className="flex items-start lg:col-span-1 lg:justify-end">
              <motion.button
                type="button"
                onClick={scrollToTop}
                aria-label="Kembali ke paling atas"
                whileHover={prefersReduced ? undefined : { y: -3 }}
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-none border-[1.5px] border-white/40 bg-transparent text-white transition-colors hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-[#131313]"
              >
                <ArrowUp size={22} weight="bold" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-xs text-[#C8C8C4]">
            <span>ftsduaenam.web.id · Portal Mahasiswa FATISDA UNS 2026</span>
            <span>Vikolvere &amp; Verivela</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
