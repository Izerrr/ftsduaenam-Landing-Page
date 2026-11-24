import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/ArrowLeft";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { FtsLogo } from "@/components/FtsLogo";
import { KineticText } from "@/components/KineticText";
import { Magnetic } from "@/components/Magnetic";
import { SignatureDraw } from "@/components/SignatureDraw";
import { IDENTITY, URLS } from "@/data/services";
import type { LegalTab } from "@/lib/sceneNavigation";
import { studioSound } from "@/lib/studioSound";

interface LegalSheetProps {
  tab: LegalTab;
  onSwitchTab: (tab: LegalTab) => void;
  onClose: () => void;
}

interface LegalClause {
  index: string;
  heading: string;
  body: string;
}

interface LegalDocument {
  id: LegalTab;
  code: string;
  titleFirst: string;
  titleSecond: string;
  prologue: string;
  clauses: readonly LegalClause[];
}

const LEGAL_DOCUMENTS: Record<LegalTab, LegalDocument> = {
  privacy: {
    id: "privacy",
    code: "DOCUMENT 01 // PRIVACY NOTICE",
    titleFirst: "PRIVACY",
    titleSecond: "Notice",
    prologue:
      "Beroperasi secara independen di luar struktur resmi institusi mana pun. Kami tidak meminta tahu siapa Anda; kami hanya menjaga ruang ini tetap bersih, ringan, dan dapat dipercaya.",
    clauses: [
      {
        index: "01",
        heading: "Entitas Independen & Non-Institusional",
        body: "ftsduaenam.web.id beserta modul pendukungnya (termasuk SurveyPanel) merupakan proyek independen yang dibangun secara sukarela dan non-komersial. Platform ini tidak mewakili secara resmi, tidak terikat secara struktural, dan tidak berada di bawah naungan fakultas, universitas, organisasi kemahasiswaan, maupun lembaga eksternal mana pun.",
      },
      {
        index: "02",
        heading: "Jejak Minimal (Apa yang Tidak Kami Kumpulkan)",
        body: "Situs ini tidak memiliki sistem registrasi pengunjung, tidak menanam skrip pelacakan iklan pihak ketiga, serta tidak pernah menjual, menukar, ataupun memonetisasi data pengunjung. Pada papan kuesioner SurveyPanel, data sensitif seperti Nomor Induk Mahasiswa (NIM) secara sadar disaring keluar sebelum ditampilkan ke publik.",
      },
      {
        index: "03",
        heading: "Penyimpanan Lokal di Perangkat Anda",
        body: "Untuk menunjang kenyamanan tanpa melibatkan akun atau basis data pribadi, situs ini hanya memakai penyimpanan lokal browser (localStorage) di perangkat Anda sendiri: penanda kuesioner yang telah Anda buka/isi (fts26:surveypanel:filled:v1) serta cache sementara pratinjau judul formulir (fts26:surveypanel:form-titles:v2) yang kedaluwarsa otomatis setelah 24 jam.",
      },
      {
        index: "04",
        heading: "Sumber Data Publik & Tautan Eksternal",
        body: "Daftar kuesioner dibaca secara dinamis dari lembar data publik yang bersifat baca-saja, dan pratinjau tautan formulir yang baru ditambahkan dapat diperiksa lewat layanan metadata baca-saja. Saat Anda membuka Google Form, shortlink tujuan, atau melanjutkan pengiriman pesan ke WhatsApp, pemrosesan isian Anda sepenuhnya tunduk pada kebijakan pemilik formulir serta penyedia layanan masing-masing.",
      },
      {
        index: "05",
        heading: "Permintaan Koreksi atau Penghapusan",
        body: "Apabila terdapat tautan kuesioner, nama tim, atau keterangan pada proyek ini yang dirasa perlu disamarkan, dikoreksi, atau ditarik dari tampilan publik, sampaikan dengan sopan melalui admin@ftsduaenam.web.id. Permintaan yang beralasan akan ditindaklanjuti dalam senyap tanpa prosedur berbelit.",
      },
    ],
  },
  terms: {
    id: "terms",
    code: "DOCUMENT 02 // TERMS OF USE",
    titleFirst: "TERMS",
    titleSecond: "of Use",
    prologue:
      "Dibangun diam-diam untuk menyingkirkan kerumitan yang tidak perlu. Anda dipersilakan memanfaatkan alatnya secara wajar; biarkan pembuatnya tetap bekerja lewat hasil.",
    clauses: [
      {
        index: "01",
        heading: "Sifat Layanan & Kemandirian Proyek",
        body: "Seluruh laman, alat bantu distribusi kuesioner, templat pesan, dan eksperimen antarmuka di ftsduaenam.web.id disediakan sebagaimana adanya (as-is) sebagai proyek kolektif independen. Layanan ini hadir untuk mempermudah arus informasi antarpengguna tanpa kontrak komersial maupun jaminan ketersediaan tanpa jeda.",
      },
      {
        index: "02",
        heading: "Batas Tanggung Jawab atas Konten Tujuan",
        body: "SurveyPanel hanya berfungsi sebagai papan indeks dan pengarah tautan yang merujuk ke formulir milik masing-masing kelompok atau peneliti. Pengelola situs tidak menyusun butir pertanyaan survei, tidak mengaudit instrumen penelitian, serta tidak bertanggung jawab atas isi, akurasi, ataupun pengelolaan data pada situs tujuan eksternal.",
      },
      {
        index: "03",
        heading: "Penggunaan yang Pantas & Tertib",
        body: "Pengunjung diharapkan mengisi formulir secara jujur dan menjaga ketertiban bersama. Dilarang memanfaatkan layanan ini untuk memicu lonjakan lalu lintas buatan (flooding), menyebarkan tautan berbahaya, melakukan penambangan data otomatis secara masif, atau merekayasa isian pihak lain.",
      },
      {
        index: "04",
        heading: "Moderasi Tautan & Akses Terkunci",
        body: "Tautan yang terdeteksi membutuhkan otentikasi akun tertentu, tidak lagi aktif, atau bertentangan dengan norma etika akademis dan publik dapat ditandai, disembunyikan, atau diperbarui sewaktu-waktu tanpa pemberitahuan sebelumnya.",
      },
      {
        index: "05",
        heading: "Karya, Ketentuan & Saluran Komunikasi",
        body: "Seluruh rancangan visual dan perangkat lunak di ruang ini disusun secara mandiri di bawah bendera FTS26. Kami lebih memilih hadir lewat fungsi daripada pengakuan. Catatan kebijakan ini dapat disesuaikan kapan saja mengikuti arah pengembangan proyek; pertanyaan atau korespondensi resmi dapat diarahkan ke admin@ftsduaenam.web.id.",
      },
    ],
  },
};

const TAB_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

/**
 * Editorial dark-charcoal Privacy Notice & Terms of Use sheet matching OFF+BRAND typography.
 * Frames FTS26 cleanly as an independent, non-institutional collective project.
 */
export function LegalSheet({ tab, onSwitchTab, onClose }: LegalSheetProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const smoothScrollBar = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
  });

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(URLS.emailDisplay);
      studioSound.playSuccess();
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      window.location.href = URLS.email;
    }
  };

  const doc = LEGAL_DOCUMENTS[tab];
  const otherTab: LegalTab = tab === "privacy" ? "terms" : "privacy";

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={tab === "privacy" ? "Kebijakan Privasi FTS26" : "Ketentuan Penggunaan FTS26"}
      data-legal-dialog="true"
      data-lenis-prevent="true"
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[56] overflow-y-auto bg-[#111112] text-[#F4F4EE] focus:outline-none"
    >
      <div
        aria-hidden="true"
        className="studio-grain pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Sticky Minimal Header */}
        <header className="sticky top-0 z-30 border-b border-white/12 bg-[#111112]/90 backdrop-blur-md">
          {!prefersReduced && (
            <motion.div
              aria-hidden="true"
              style={{ scaleX: smoothScrollBar }}
              className="fixed top-0 right-0 left-0 h-[2px] origin-left bg-[#0258FF]"
            />
          )}

          <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div className="flex items-center gap-4">
              <Magnetic strength={0.2}>
                <button
                  type="button"
                  onClick={() => {
                    studioSound.playClick();
                    onClose();
                  }}
                  data-cursor="BACK"
                  className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/20 bg-white/5 px-3.5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white"
                >
                  <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
                  <span>KEMBALI</span>
                </button>
              </Magnetic>

              <div className="hidden items-center gap-3 sm:flex">
                <FtsLogo className="h-6 w-auto text-[#F4F4EE]" />
                <span className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-[#A1A19C]">
                  / LEGAL NOTICE
                </span>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Pilih dokumen legal"
              className="chamfer-sm inline-flex border border-white/15 bg-white/[0.03] p-1"
            >
              {(
                [
                  { id: "privacy" as const, label: "01. PRIVACY" },
                  { id: "terms" as const, label: "02. TERMS" },
                ] as const
              ).map((item) => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      if (tab === item.id) return;
                      studioSound.playClick();
                      onSwitchTab(item.id);
                      containerRef.current?.scrollTo({
                        top: 0,
                        behavior: prefersReduced ? "auto" : "smooth",
                      });
                    }}
                    className={`relative z-10 inline-flex min-h-[36px] cursor-pointer items-center px-3.5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase transition-colors ${
                      isActive ? "text-white" : "text-[#A1A19C] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="legal-tab-pill"
                        transition={TAB_SPRING}
                        className="chamfer-sm absolute inset-0 -z-10 bg-[#0258FF]"
                      />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-10 sm:px-8 sm:py-14">
          <AnimatePresence mode="wait">
            <motion.article
              key={doc.id}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Independent Collective Header Block */}
              <div className="border-b border-white/15 pb-8">
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5C9AFF]">
                  {doc.code}
                </p>

                <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-[clamp(2.6rem,1.4rem+5vw,5rem)] leading-[0.88]">
                  <span className="font-condensed font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE]">
                    <KineticText
                      text={doc.titleFirst}
                      hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                    />
                  </span>
                  <span className="font-editorial italic tracking-[-0.025em] text-[#0258FF]">
                    {doc.titleSecond}
                  </span>
                </h1>

                <div className="mt-3">
                  <SignatureDraw
                    key={`${doc.id}-sig`}
                    trigger="mount"
                    stroke="#0258FF"
                    className="h-7 w-auto"
                  />
                </div>

                <p className="mt-5 max-w-2xl font-editorial text-lg leading-relaxed italic text-[#F4F4EE]/90 sm:text-xl">
                  "{doc.prologue}"
                </p>

                <div className="chamfer-sm mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 border border-white/15 bg-white/[0.03] px-3.5 py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-[#A1A19C]">
                  <span className="h-1.5 w-1.5 bg-[#0258FF]" />
                  <span>INDEPENDENT PROJECT</span>
                  <span>&middot;</span>
                  <span>NON-INSTITUTIONAL</span>
                  <span>&middot;</span>
                  <span>{IDENTITY.code}</span>
                </div>
              </div>

              {/* Clauses */}
              <ol className="divide-y divide-white/10 border-b border-white/15">
                {doc.clauses.map((clause) => (
                  <li
                    key={clause.index}
                    className="grid grid-cols-1 gap-3 py-7 md:grid-cols-[120px_1fr] md:gap-8"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-editorial text-2xl italic text-[#0258FF]">
                        {clause.index}.
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#A1A19C]">
                        PASAL
                      </span>
                    </div>

                    <div className="max-w-2xl">
                      <h2 className="font-condensed text-lg font-extrabold tracking-[0.06em] uppercase text-[#F4F4EE] sm:text-xl">
                        {clause.heading}
                      </h2>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#A1A19C] sm:text-[15px]">
                        {clause.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Polite Quiet Sign-Off & Switcher */}
              <div className="mt-10 flex flex-col justify-between gap-6 border border-white/12 bg-[#151618] p-6 chamfer-md sm:flex-row sm:items-center">
                <div>
                  <p className="font-condensed text-xs font-extrabold tracking-[0.18em] uppercase text-[#5C9AFF]">
                    KORESPONDENSI & CATATAN
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#A1A19C]">
                    Kami bekerja di balik layar. Segala pertanyaan atau permintaan
                    koreksi dapat dikirimkan dengan tenang ke{" "}
                    <span className="text-[#F4F4EE]">{URLS.emailDisplay}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void handleCopyEmail()}
                    data-cursor={emailCopied ? "COPIED" : "COPY"}
                    className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/20 px-3.5 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112]"
                  >
                    {emailCopied ? (
                      <>
                        <CheckIcon size={14} weight="bold" aria-hidden="true" />
                        <span>EMAIL DISALIN</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon size={14} weight="bold" aria-hidden="true" />
                        <span>SALIN EMAIL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      studioSound.playClick();
                      onSwitchTab(otherTab);
                      containerRef.current?.scrollTo({
                        top: 0,
                        behavior: prefersReduced ? "auto" : "smooth",
                      });
                    }}
                    className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center bg-[#0258FF] px-4 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-white transition-colors hover:bg-[#5C9AFF] hover:text-[#111112]"
                  >
                    {otherTab === "terms"
                      ? "BACA TERMS OF USE"
                      : "BACA PRIVACY NOTICE"}
                  </button>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </main>

        <footer className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-4 border-t border-white/12 px-4 py-6 text-xs text-[#A1A19C] sm:px-8">
          <span className="font-mono tracking-[0.1em] uppercase">
            {IDENTITY.domain} &middot; {IDENTITY.code}
          </span>
          <span className="font-editorial text-sm italic">
            {IDENTITY.tagline}
          </span>
        </footer>
      </div>
    </motion.div>
  );
}
