import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { CalendarCheckIcon as CalendarCheck } from "@phosphor-icons/react/CalendarCheck";
import { CheckSquareIcon as CheckSquare } from "@phosphor-icons/react/CheckSquare";
import { FolderOpenIcon as FolderOpen } from "@phosphor-icons/react/FolderOpen";
import { UsersThreeIcon as UsersThree } from "@phosphor-icons/react/UsersThree";
import { COHORT_IDENTITY } from "@/data/services";

const CARD_SPRING = {
  type: "spring" as const,
  stiffness: 320,
  damping: 24,
};

/**
 * Asymmetric 2-column intro section (Light Canvas #F5F5F2):
 * Left: 2 stacked, tilted TaskPanel visual preview cards (-4deg, +3deg) bridged by a die-cut cohort sticker.
 * Right: Concise 2-sentence portal overview + 3 FATISDA study programs index + sharp CTA to #layanan.
 */
export function IntroSection() {
  const prefersReduced = useReducedMotion();
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const topRotate = prefersReduced ? 0 : isWide ? -3.5 : -1.2;
  const bottomRotate = prefersReduced ? 0 : isWide ? 2.8 : 1.2;

  return (
    <section
      id="pengenalan"
      className="overflow-x-clip bg-[#F5F5F2] py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
        {/* Left: Overlapping tilted TaskPanel UI preview cards + die-cut sticker */}
        <div className="relative mx-auto w-full max-w-[540px] lg:col-span-6 lg:max-w-none">
          <div className="relative flex flex-col gap-5 sm:gap-0">
            {/* Top preview card (-3.5deg on tablet/desktop, gentle -1.2deg on 360px) */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 24, rotate: topRotate }}
              whileInView={{ opacity: 1, y: 0, rotate: topRotate }}
              whileHover={prefersReduced ? undefined : { rotate: 0, y: -4 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={CARD_SPRING}
              className="relative z-10 w-full border-[6px] border-[#0258FF] bg-white p-4 shadow-[6px_6px_0_0_#131313] sm:w-[88%] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-[#131313] pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} weight="bold" className="text-[#0258FF]" aria-hidden="true" />
                  <span className="font-condensed text-sm font-extrabold uppercase tracking-[0.06em] text-[#131313]">
                    TASKPANEL · TUGAS &amp; KELOMPOK
                  </span>
                </div>
                <span className="border border-[#131313] bg-[#F5F5F2] px-2 py-0.5 text-[11px] font-semibold text-[#131313]">
                  Contoh Tampilan
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="border-[1.5px] border-[#131313] bg-[#F5F5F2] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#131313]">
                      Struktur Data &amp; Algoritma
                    </span>
                    <span className="bg-[#0258FF] px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-[0.05em] text-white">
                      Bagi Rata Subtugas
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#4A4A46]">
                    Implementasi Graph BFS/DFS · 4 anggota terbagi otomatis
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-[#131313]">
                    <UsersThree size={15} weight="bold" className="text-[#0258FF]" aria-hidden="true" />
                    <span>Kelompok B · Kanban: Dikerjakan</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-[1.5px] border-[#131313] bg-white px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#131313]">
                      Exam Readiness Tracker (UTS)
                    </p>
                    <p className="truncate text-[11px] text-[#4A4A46]">
                      Matematika Diskrit &amp; Statistika Dasar
                    </p>
                  </div>
                  <span className="shrink-0 border border-[#131313] bg-[#FEF08A] px-2 py-1 font-condensed text-xs font-bold uppercase text-[#131313]">
                    Siap Ujian
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Die-cut community sticker bridging the two tilted cards */}
            <motion.div
              initial={prefersReduced ? false : { scale: 0.88, opacity: 0, rotate: -10 }}
              whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
              whileHover={prefersReduced ? undefined : { rotate: -1, scale: 1.05 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={CARD_SPRING}
              className="relative z-30 -my-3 self-center rounded-full border-[2px] border-[#131313] bg-[#FACC15] px-5 py-2 text-center shadow-[4px_4px_0_0_#131313] sm:-my-5 sm:mr-6 sm:self-end"
            >
              <span className="block font-condensed text-sm font-extrabold uppercase tracking-[0.08em] text-[#131313] sm:text-base">
                VIKOLVERE · VERIVELA
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#131313]">
                FATISDA UNS &apos;26
              </span>
            </motion.div>

            {/* Lower preview card (+2.8deg on tablet/desktop, gentle +1.2deg on 360px) */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 24, rotate: bottomRotate }}
              whileInView={{ opacity: 1, y: 0, rotate: bottomRotate }}
              whileHover={prefersReduced ? undefined : { rotate: 0, y: -4 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={CARD_SPRING}
              className="relative z-20 w-full border-[6px] border-[#2D6A5B] bg-white p-4 shadow-[6px_6px_0_0_#131313] sm:ml-auto sm:w-[86%] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-[#131313] pb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} weight="bold" className="text-[#2D6A5B]" aria-hidden="true" />
                  <span className="font-condensed text-sm font-extrabold uppercase tracking-[0.06em] text-[#131313]">
                    COURSE VAULT &amp; JADWAL LIVE
                  </span>
                </div>
                <CalendarCheck size={18} weight="bold" className="text-[#2D6A5B]" aria-hidden="true" />
              </div>

              <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="border-[1.5px] border-[#131313] bg-[#F5F5F2] p-3">
                  <span className="inline-block bg-[#2D6A5B] px-2 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    SILABUS &amp; DRIVE
                  </span>
                  <p className="mt-2 text-xs font-semibold text-[#131313]">
                    Statistika Komputasi
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#4A4A46]">
                    Modul Praktikum &amp; Slide Kuliah
                  </p>
                </div>
                <div className="border-[1.5px] border-[#131313] bg-[#F5F5F2] p-3">
                  <span className="inline-block border border-[#131313] bg-white px-2 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-[0.05em] text-[#131313]">
                    ASIA/JAKARTA
                  </span>
                  <p className="mt-2 text-xs font-semibold text-[#131313]">
                    Basis Data Lanjut
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#4A4A46]">
                    Sync .ics &amp; Cache Offline PWA
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Concise editorial overview + 3 study programs */}
        <div className="lg:col-span-6">
          <h2 className="headline-balance">
            <span className="block font-condensed text-[clamp(2.5rem,1.8rem+3.4vw,4.35rem)] leading-[0.94] font-extrabold uppercase tracking-[-0.02em] text-[#131313]">
              RUANG TERPUSAT
            </span>
            <span className="mt-1 block pb-1 font-editorial text-[clamp(2.7rem,1.9rem+3.8vw,4.8rem)] leading-[0.98] italic text-[#0258FF]">
              FTS &apos;26
            </span>
          </h2>

          <p className="prose-pretty mt-5 max-w-[54ch] text-base leading-relaxed text-[#4A4A46] sm:text-lg">
            <strong className="font-semibold text-[#131313]">ftsduaenam.web.id</strong>{" "}
            menghimpun seluruh layanan digital Mahasiswa Fakultas Teknologi Informasi
            dan Sains Data (FATISDA) UNS Angkatan 2026 dalam satu alamat. Dari
            pengelolaan tugas harian hingga arsip materi dan bot pengingat, semuanya
            terhubung untuk tiga program studi angkatan.
          </p>

          {/* 3 FATISDA Study Programs */}
          <ul
            aria-label="Program studi FATISDA UNS Angkatan 2026"
            className="mt-7 divide-y divide-[#131313] border-y-[1.5px] border-[#131313] bg-white"
          >
            {COHORT_IDENTITY.programs.map((program) => (
              <li
                key={program.code}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-condensed text-sm font-extrabold text-[#0258FF]">
                    {program.code}
                  </span>
                  <span className="text-base font-semibold text-[#131313]">
                    {program.name}
                  </span>
                </div>
                <span className="font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[#4A4A46]">
                  {program.campus}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <a
              href="#layanan"
              className="group inline-flex min-h-[50px] items-center gap-3 rounded-none border-[1.5px] border-[#131313] bg-[#131313] px-6 font-condensed text-base font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-[#0258FF] active:scale-[0.98]"
            >
              <span>TELUSURI LAYANAN</span>
              <ArrowRight
                size={18}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
