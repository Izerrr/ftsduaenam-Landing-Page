import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { BellRingingIcon as BellRinging } from "@phosphor-icons/react/BellRinging";
import { CalendarBlankIcon as CalendarBlank } from "@phosphor-icons/react/CalendarBlank";
import { ChatCircleDotsIcon as ChatCircleDots } from "@phosphor-icons/react/ChatCircleDots";
import { KanbanIcon as Kanban } from "@phosphor-icons/react/Kanban";
import { HAS_DISCORD_INVITE, URLS } from "@/data/services";

/**
 * Dark Showcase Band (#131313, data-theme="dark"):
 * Triggers automatic sticky navbar inversion to white.
 * Features mixed headline ("EKOSISTEM / KAMI"), rotating circular UNS FATISDA 2026 stamp,
 * and 2 thick-framed flagship showcase cards with scroll-driven depth via useScroll/useTransform.
 */
export function DarkShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftCardY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const rightCardY = useTransform(scrollYProgress, [0, 1], [-14, 24]);
  const leftCardTilt = useTransform(scrollYProgress, [0, 0.5, 1], [-1.2, 0, 0.8]);
  const rightCardTilt = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 0, -0.8]);

  return (
    <section
      ref={sectionRef}
      id="ekosistem"
      data-theme="dark"
      className="relative overflow-x-clip bg-[#131313] py-20 text-white sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Top row: Mixed 2-voice headline + rotating circular stamp badge */}
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-white/20 pb-8 sm:pb-10">
          <div>
            <h2 className="headline-balance">
              <span className="block font-condensed text-[clamp(2.9rem,2rem+4.8vw,5.6rem)] leading-[0.9] font-extrabold uppercase tracking-[-0.025em] text-white">
                EKOSISTEM
              </span>
              <span className="mt-1 block pb-1 font-editorial text-[clamp(3.1rem,2.1rem+5.2vw,6.2rem)] leading-[0.95] italic text-[#FACC15]">
                Kami
              </span>
            </h2>
          </div>

          {/* Rotating circular stamp badge: UNS · FATISDA · 2026 · */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
            <svg
              viewBox="0 0 120 120"
              className="fts-stamp-spin h-full w-full text-white"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="fts-stamp-circle"
                  d="M 60, 60 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
                />
              </defs>
              <text
                fill="currentColor"
                fontSize="10.2"
                fontWeight="700"
                letterSpacing="3.4"
                style={{ fontFamily: "var(--font-condensed), sans-serif" }}
              >
                <textPath href="#fts-stamp-circle" startOffset="0%">
                  UNS · FATISDA · 2026 · VIKOLVERE · VERIVELA ·
                </textPath>
              </text>
            </svg>
            <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#0258FF] font-editorial text-xl italic text-white">
              &apos;26
            </div>
          </div>
        </div>

        {/* 2 Flagship Thick-Framed Cards */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-10">
          {/* Card 1: TaskPanel Preview (Cobalt #0258FF thick frame) */}
          <motion.article
            style={
              prefersReduced
                ? undefined
                : { y: leftCardY, rotate: leftCardTilt }
            }
            className="flex flex-col justify-between border-[8px] border-[#0258FF] bg-[#1D1D1C] p-6 sm:p-8"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-[#0258FF] px-3 py-1 font-condensed text-xs font-bold uppercase tracking-[0.08em] text-white">
                  01 / LAYANAN UTAMA
                </span>
                <span className="text-xs font-medium text-[#C8C8C4]">
                  taskpanel.ftsduaenam.web.id
                </span>
              </div>

              <h3 className="mt-5 font-condensed text-3xl font-extrabold uppercase tracking-[-0.015em] text-white sm:text-4xl">
                TASKPANEL WORKSPACE
              </h3>
              <p className="prose-pretty mt-3 max-w-[52ch] text-sm leading-relaxed text-[#C8C8C4] sm:text-base">
                Satu workspace untuk tugas Pribadi, Kelompok (Bagi Rata Subtugas),
                dan Kelas lengkap dengan Kanban, List, Kalender, AI Parser, jadwal
                kuliah live, dan Exam Readiness Tracker.
              </p>

              {/* Simulated TaskPanel visual preview board */}
              <div className="mt-6 border border-white/20 bg-[#131313] p-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Kanban size={16} weight="bold" className="text-[#60A5FA]" aria-hidden="true" />
                    <span>Papan Tugas Kelas &amp; Kelompok</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#C8C8C4]">
                    Pratinjau Antarmuka
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="border border-white/15 bg-[#1D1D1C] p-3">
                    <span className="font-condensed text-xs font-bold uppercase tracking-[0.06em] text-[#60A5FA]">
                      TUGAS KELOMPOK
                    </span>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Pemrograman Berorientasi Objek
                    </p>
                    <p className="mt-1 text-xs text-[#C8C8C4]">
                      Bagi Rata Subtugas: 4 bagian aktif
                    </p>
                  </div>

                  <div className="border border-white/15 bg-[#1D1D1C] p-3">
                    <span className="font-condensed text-xs font-bold uppercase tracking-[0.06em] text-[#FACC15]">
                      EXAM READINESS
                    </span>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Persiapan UTS &amp; UAS
                    </p>
                    <p className="mt-1 text-xs text-[#C8C8C4]">
                      Checklist bab + jadwal ruang ujian
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 pt-2">
              <a
                href={URLS.taskpanel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 border-[1.5px] border-white bg-white px-5 font-condensed text-base font-bold uppercase tracking-[0.05em] text-[#131313] transition-colors hover:bg-[#FACC15] active:scale-[0.98]"
              >
                <span>BUKA TASKPANEL</span>
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
              </a>
              <a
                href={URLS.courses}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 border-[1.5px] border-white/40 bg-transparent px-4 font-condensed text-base font-bold uppercase tracking-[0.05em] text-white transition-colors hover:border-white hover:bg-white/10 active:scale-[0.98]"
              >
                <span>COURSE VAULT</span>
                <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </motion.article>

          {/* Card 2: Discord Bot & Calendar Sync (Coral #FF5A36 thick frame) */}
          <motion.article
            style={
              prefersReduced
                ? undefined
                : { y: rightCardY, rotate: rightCardTilt }
            }
            className="flex flex-col justify-between border-[8px] border-[#FF5A36] bg-[#1D1D1C] p-6 sm:p-8"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-[#FF5A36] px-3 py-1 font-condensed text-xs font-extrabold uppercase tracking-[0.08em] text-[#131313]">
                  02 / BOT &amp; SINKRONISASI
                </span>
                <span className="text-xs font-medium text-[#C8C8C4]">
                  Discord + Calendar .ics
                </span>
              </div>

              <h3 className="mt-5 font-condensed text-3xl font-extrabold uppercase tracking-[-0.015em] text-white sm:text-4xl">
                DISCORD BOT &amp; SYNC JADWAL
              </h3>
              <p className="prose-pretty mt-3 max-w-[52ch] text-sm leading-relaxed text-[#C8C8C4] sm:text-base">
                Briefing otomatis di server angkatan lewat perintah{" "}
                <code className="border border-white/20 bg-[#131313] px-1.5 py-0.5 text-xs text-white">
                  /tugas
                </code>
                , pengingat H-24 dan H-6, serta feed kalender{" "}
                <code className="border border-white/20 bg-[#131313] px-1.5 py-0.5 text-xs text-white">
                  .ics
                </code>{" "}
                Asia/Jakarta dan Web Push PWA.
              </p>

              {/* Simulated Discord Bot & ICS Sync panel */}
              <div className="mt-6 border border-white/20 bg-[#131313] p-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <ChatCircleDots size={16} weight="bold" className="text-[#FF5A36]" aria-hidden="true" />
                    <span>Bot Pengingat &amp; Feed Kalender</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#C8C8C4]">
                    Asia/Jakarta (WIB)
                  </span>
                </div>

                <ul className="mt-3.5 space-y-2.5 text-xs">
                  <li className="flex items-start justify-between gap-3 border border-white/15 bg-[#1D1D1C] p-3">
                    <div className="flex items-start gap-2.5">
                      <BellRinging size={16} weight="bold" className="mt-0.5 shrink-0 text-[#FACC15]" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-white">
                          Morning Briefing &amp; Pengingat Deadline
                        </p>
                        <p className="mt-0.5 text-[#C8C8C4]">
                          Otomatis H-24 dan H-6 sebelum tenggat tugas kelas
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 bg-[#FF5A36] px-2 py-0.5 font-condensed text-[11px] font-extrabold uppercase text-[#131313]">
                      /tugas
                    </span>
                  </li>

                  <li className="flex items-start justify-between gap-3 border border-white/15 bg-[#1D1D1C] p-3">
                    <div className="flex items-start gap-2.5">
                      <CalendarBlank size={16} weight="bold" className="mt-0.5 shrink-0 text-[#60A5FA]" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-white">
                          Calendar Feed (.ics) &amp; Offline PWA
                        </p>
                        <p className="mt-0.5 text-[#C8C8C4]">
                          Auto-sync ke Google / Apple Calendar plus Web Push
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 border border-white/30 px-2 py-0.5 font-condensed text-[11px] font-bold uppercase text-white">
                      .ics
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 pt-2">
              <a
                href={URLS.profile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 border-[1.5px] border-[#FF5A36] bg-[#FF5A36] px-5 font-condensed text-base font-extrabold uppercase tracking-[0.05em] text-[#131313] transition-colors hover:bg-[#FACC15] hover:border-[#FACC15] active:scale-[0.98]"
              >
                <span>ATUR CALENDAR .ICS</span>
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
              </a>
              <a
                href={URLS.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 border-[1.5px] border-white/40 bg-transparent px-4 font-condensed text-base font-bold uppercase tracking-[0.05em] text-white transition-colors hover:border-white hover:bg-white/10 active:scale-[0.98]"
              >
                <span>{HAS_DISCORD_INVITE ? "GABUNG DISCORD" : "DISCORD LOGIN"}</span>
                <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
