import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRightIcon as ArrowDownRight } from "@phosphor-icons/react/ArrowDownRight";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { COHORT_IDENTITY, SERVICES, URLS } from "@/data/services";
import { SplitBlockCta } from "@/components/SplitBlockCta";
import { CohortMarquee } from "@/components/CohortMarquee";

const LINE_REVEAL = {
  hidden: { y: "105%", opacity: 0 },
  visible: (delay: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 26,
      delay,
    },
  }),
};

/**
 * Hero Band (Light Canvas #F5F5F2, min-h-[100dvh]):
 * 2-voice kinetic mixed headline + concise 1-sentence value prop + Split-Block CTA
 * + asymmetric factual directory box on desktop + monochrome marquee anchored at the bottom.
 */
export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="beranda"
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-between bg-[#F5F5F2] md:min-h-[calc(100dvh-4.75rem)]"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14 lg:px-10">
        {/* Single hero metadata row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[#131313] pb-3 sm:mb-8">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[#131313] sm:text-base">
            {COHORT_IDENTITY.facultyShort} · {COHORT_IDENTITY.year}
          </p>
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[#4A4A46] sm:text-base">
            SURAKARTA &amp; KEBUMEN
          </p>
        </div>

        {/* Asymmetric editorial grid: Hero display left, compact live index card right */}
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <h1
              id="konten-utama"
              tabIndex={-1}
              className="headline-balance focus:outline-none"
            >
              {/* Line 1: Condensed Heavy Uppercase Sans */}
              <span className="block overflow-hidden">
                <motion.span
                  className="block font-condensed text-[clamp(3.15rem,2.1rem+5.6vw,6.4rem)] leading-[0.9] font-extrabold uppercase tracking-[-0.025em] text-[#131313]"
                  variants={LINE_REVEAL}
                  initial={prefersReduced ? false : "hidden"}
                  animate="visible"
                  custom={0.04}
                >
                  SATU PORTAL UNTUK
                </motion.span>
              </span>

              {/* Line 2: Tall High-Contrast Editorial Serif + tilted cohort sticker */}
              <span className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-2 sm:mt-2">
                <span className="inline-block overflow-hidden pb-1">
                  <motion.span
                    className="inline-block font-editorial text-[clamp(3.4rem,2.2rem+6.1vw,7.1rem)] leading-[0.96] font-normal tracking-[-0.02em] text-[#131313]"
                    variants={LINE_REVEAL}
                    initial={prefersReduced ? false : "hidden"}
                    animate="visible"
                    custom={0.14}
                  >
                    FATISDA{" "}
                    <span className="italic text-[#0258FF]">2026</span>
                  </motion.span>
                </span>

                {/* Community die-cut badge */}
                <motion.span
                  initial={prefersReduced ? false : { opacity: 0, rotate: -9, scale: 0.9 }}
                  animate={{ opacity: 1, rotate: -4, scale: 1 }}
                  whileHover={prefersReduced ? undefined : { rotate: 0, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.24 }}
                  className="inline-flex -translate-y-1.5 items-center rounded-full border-[1.5px] border-[#131313] bg-[#FACC15] px-4 py-1.5 font-condensed text-sm font-extrabold uppercase tracking-[0.06em] text-[#131313] shadow-[3px_3px_0_0_#131313] sm:-translate-y-3 sm:text-base"
                >
                  VIKOLVERE · VERIVELA
                </motion.span>
              </span>
            </h1>

            {/* Single concise sentence */}
            <p className="prose-pretty mt-6 max-w-[54ch] text-base leading-relaxed text-[#4A4A46] sm:mt-7 sm:text-lg">
              Portal layanan digital Mahasiswa FATISDA UNS Angkatan 2026 untuk S-1
              Informatika, S-1 Sains Data, dan PSDKU Kebumen.
            </p>

            {/* Action row */}
            <div className="mt-7 flex flex-wrap items-center gap-4 sm:mt-8">
              <SplitBlockCta
                label="BUKA TASKPANEL"
                href={URLS.taskpanel}
                external
                variant="cobalt"
              />
              <a
                href="#layanan"
                className="inline-flex min-h-[52px] items-center gap-2 rounded-none border-[1.5px] border-[#131313] bg-white px-5 font-condensed text-base font-bold uppercase tracking-[0.05em] text-[#131313] whitespace-nowrap transition-colors hover:bg-[#131313] hover:text-white active:scale-[0.98]"
              >
                <span>DAFTAR LAYANAN</span>
                <ArrowDownRight size={18} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right column: Compact sharp quick-directory panel (real catalog links) */}
          <aside
            aria-label="Akses cepat layanan"
            className="border-[1.5px] border-[#131313] bg-white lg:col-span-4"
          >
            <div className="flex items-center justify-between border-b-[1.5px] border-[#131313] bg-[#131313] px-4 py-2.5 text-white">
              <span className="font-condensed text-sm font-bold uppercase tracking-[0.06em]">
                DIREKTORI CEPAT
              </span>
              <span className="font-condensed text-xs font-bold uppercase tracking-[0.06em] text-[#FACC15]">
                {SERVICES.length} LAYANAN AKTIF
              </span>
            </div>

            <ul className="divide-y divide-[#131313]">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <a
                    href={service.primaryAction.href}
                    target={service.primaryAction.external ? "_blank" : undefined}
                    rel={service.primaryAction.external ? "noopener noreferrer" : undefined}
                    className="group flex min-h-[52px] items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#FEF08A]"
                  >
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="font-condensed text-sm font-extrabold text-[#4A4A46]">
                        {service.number}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#131313]">
                          {service.name}
                        </span>
                        <span className="block truncate text-xs text-[#4A4A46]">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={18}
                      weight="bold"
                      aria-hidden="true"
                      className="shrink-0 text-[#131313] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      {/* Bottom monochrome running marquee */}
      <CohortMarquee />
    </section>
  );
}
