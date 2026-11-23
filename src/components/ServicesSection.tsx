import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { CalendarBlankIcon as CalendarBlank } from "@phosphor-icons/react/CalendarBlank";
import { FolderOpenIcon as FolderOpen } from "@phosphor-icons/react/FolderOpen";
import { KanbanIcon as Kanban } from "@phosphor-icons/react/Kanban";
import { ShieldCheckIcon as ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { UserCircleCheckIcon as UserCircleCheck } from "@phosphor-icons/react/UserCircleCheck";
import { ACCESS_PATHS, POSTER_CARDS, type PosterCardItem } from "@/data/services";

const POSTER_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 22,
};

function PosterIcon({ accent }: { accent: PosterCardItem["accent"] }) {
  if (accent === "cobalt") {
    return <Kanban size={24} weight="bold" className="text-[#0258FF]" aria-hidden="true" />;
  }
  if (accent === "teal") {
    return <FolderOpen size={24} weight="bold" className="text-[#2D6A5B]" aria-hidden="true" />;
  }
  return <CalendarBlank size={24} weight="bold" className="text-[#131313]" aria-hidden="true" />;
}

interface PosterCardProps {
  card: PosterCardItem;
  index: number;
  isDesktop: boolean;
  prefersReduced: boolean;
}

function PosterCard({ card, index, isDesktop, prefersReduced }: PosterCardProps) {
  const [active, setActive] = useState(false);

  const isCoral = card.accent === "coral";
  const isTeal = card.accent === "teal";
  const badgeStyle = isCoral
    ? "bg-[#FF5A36] text-[#131313]"
    : isTeal
      ? "bg-[#2D6A5B] text-white"
      : "bg-[#0258FF] text-white";
  const primaryBtnStyle = isCoral
    ? "bg-[#FF5A36] text-[#131313] border-[#131313] hover:bg-[#FACC15]"
    : isTeal
      ? "bg-[#2D6A5B] text-white border-[#131313] hover:bg-[#131313]"
      : "bg-[#0258FF] text-white border-[#131313] hover:bg-[#131313]";

  const targetRotate = prefersReduced || !isDesktop || active ? 0 : card.restRotate;
  const targetY = prefersReduced ? 0 : active ? -10 : 0;

  return (
    <motion.article
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false);
        }
      }}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: targetY, rotate: targetRotate }}
      animate={{ y: targetY, rotate: targetRotate }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        ...POSTER_SPRING,
        opacity: { duration: 0.35, delay: prefersReduced ? 0 : index * 0.06 },
      }}
      style={{
        borderColor: card.frameHex,
        zIndex: active ? 20 : 1,
      }}
      className="relative flex flex-col justify-between border-[8px] bg-white p-6 shadow-[6px_6px_0_0_#131313] transition-shadow hover:shadow-[10px_10px_0_0_#131313] sm:p-7"
    >
      <div>
        <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-[#131313] pb-4">
          <span
            className={`px-2.5 py-1 font-condensed text-xs font-extrabold uppercase tracking-[0.08em] ${badgeStyle}`}
          >
            {card.number} / {card.subtitle}
          </span>
          <div className="flex h-10 w-10 items-center justify-center border-[1.5px] border-[#131313] bg-[#F5F5F2]">
            <PosterIcon accent={card.accent} />
          </div>
        </div>

        <h3 className="mt-5 font-condensed text-3xl font-extrabold uppercase tracking-[-0.015em] text-[#131313]">
          {card.title}
        </h3>

        <p className="prose-pretty mt-3 text-sm leading-relaxed text-[#4A4A46] sm:text-[0.95rem]">
          {card.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <li
              key={tag}
              className="border border-[#131313] bg-[#F5F5F2] px-2.5 py-1 text-xs font-semibold text-[#131313]"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-col gap-2.5 border-t-[1.5px] border-[#131313] pt-5">
        <a
          href={card.primaryAction.href}
          target={card.primaryAction.external ? "_blank" : undefined}
          rel={card.primaryAction.external ? "noopener noreferrer" : undefined}
          className={`flex min-h-[46px] w-full items-center justify-between border-[1.5px] px-4 font-condensed text-base font-bold uppercase tracking-[0.05em] transition-colors active:scale-[0.98] ${primaryBtnStyle}`}
        >
          <span>{card.primaryAction.label}</span>
          <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
        </a>

        {card.secondaryAction && (
          <a
            href={card.secondaryAction.href}
            target={card.secondaryAction.external ? "_blank" : undefined}
            rel={card.secondaryAction.external ? "noopener noreferrer" : undefined}
            className="flex min-h-[46px] w-full items-center justify-between border-[1.5px] border-[#131313] bg-white px-4 font-condensed text-base font-bold uppercase tracking-[0.05em] text-[#131313] transition-colors hover:bg-[#FEF08A] active:scale-[0.98]"
          >
            <span>{card.secondaryAction.label}</span>
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </a>
        )}
      </div>
    </motion.article>
  );
}

/**
 * Light Canvas Band (#F5F5F2):
 * Part 1: 3 Fanned Poster Service Cards (-3.5deg, 0deg, +3.5deg on desktop; flat stack on mobile).
 *         Each card straightens and lifts with spring physics on hover or keyboard focus-within.
 * Part 2: Compact 2-column Jalur Akses Masuk (#akses) for @student.uns.ac.id & Discord OAuth2.
 */
export function ServicesSection() {
  const prefersReduced = Boolean(useReducedMotion());
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="layanan"
      className="overflow-x-clip bg-[#F5F5F2] py-20 text-[#131313] sm:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-[60ch]">
          <h2 className="headline-balance">
            <span className="font-condensed text-[clamp(2.8rem,1.9rem+4.5vw,5.2rem)] leading-[0.92] font-extrabold uppercase tracking-[-0.025em] text-[#131313]">
              LAYANAN{" "}
            </span>
            <span className="font-editorial text-[clamp(3rem,2rem+4.9vw,5.7rem)] leading-[0.95] italic text-[#0258FF]">
              Tersedia
            </span>
          </h2>
          <p className="prose-pretty mt-4 text-base text-[#4A4A46] sm:text-lg">
            Seluruh alat bantu akademik angkatan dikelola dalam satu ekosistem.
            Pilih layanan yang dibutuhkan dan langsung akses lewat tautan resmi.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 lg:mt-16 lg:grid-cols-3 lg:gap-8 lg:py-4">
          {POSTER_CARDS.map((card, index) => (
            <PosterCard
              key={card.id}
              card={card}
              index={index}
              isDesktop={isDesktop}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>

        {/* Access Paths (#akses): compact sharp 2-column block */}
        <div
          id="akses"
          className="mt-20 scroll-mt-24 border-t-[2px] border-[#131313] pt-14 sm:mt-28 sm:pt-16"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="headline-balance">
              <span className="font-condensed text-[clamp(2.2rem,1.6rem+2.8vw,3.6rem)] leading-[0.94] font-extrabold uppercase tracking-[-0.02em] text-[#131313]">
                JALUR{" "}
              </span>
              <span className="font-editorial text-[clamp(2.4rem,1.7rem+3.1vw,4rem)] leading-[0.96] italic text-[#0258FF]">
                Akses Masuk
              </span>
            </h2>
            <p className="text-sm font-medium text-[#4A4A46]">
              Otentikasi terverifikasi khusus sivitas FATISDA UNS 2026
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 border-[1.5px] border-[#131313] bg-white md:grid-cols-2 md:divide-x md:divide-[#131313]">
            {ACCESS_PATHS.map((path, index) => (
              <div
                key={path.id}
                className={`flex flex-col justify-between p-6 sm:p-8 ${
                  index > 0 ? "border-t-[1.5px] border-[#131313] md:border-t-0" : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      style={{
                        backgroundColor: path.accentHex,
                        color: path.badgeTextHex,
                      }}
                      className="px-2.5 py-1 font-condensed text-xs font-extrabold uppercase tracking-[0.08em]"
                    >
                      {path.number} / {path.audience}
                    </span>
                    {path.id === "google-uns" ? (
                      <UserCircleCheck
                        size={22}
                        weight="bold"
                        className="text-[#0258FF]"
                        aria-hidden="true"
                      />
                    ) : (
                      <ShieldCheck
                        size={22}
                        weight="bold"
                        className="text-[#131313]"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <h3 className="mt-5 font-condensed text-2xl font-extrabold uppercase tracking-[-0.01em] text-[#131313] sm:text-3xl">
                    {path.provider}
                  </h3>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#0258FF] sm:text-sm">
                    {path.identifier}
                  </p>
                  <p className="prose-pretty mt-3 text-sm leading-relaxed text-[#4A4A46] sm:text-base">
                    {path.description}
                  </p>
                </div>

                <div className="mt-6 pt-2">
                  <a
                    href={path.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center gap-2 border-[1.5px] border-[#131313] bg-[#F5F5F2] px-5 font-condensed text-base font-bold uppercase tracking-[0.05em] text-[#131313] transition-colors hover:bg-[#131313] hover:text-white active:scale-[0.98]"
                  >
                    <span>{path.ctaLabel}</span>
                    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
