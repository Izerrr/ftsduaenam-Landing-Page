export type ServiceAccent = "cobalt" | "teal" | "coral";

export interface ServiceAction {
  label: string;
  href: string;
  external?: boolean;
}

export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  accent: ServiceAccent;
  frameHex: string;
  badgeTextHex: string;
  primaryAction: ServiceAction;
  secondaryAction?: ServiceAction;
  highlights: string[];
}

export interface PosterCardItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accent: ServiceAccent;
  frameHex: string;
  restRotate: number;
  tags: string[];
  primaryAction: ServiceAction;
  secondaryAction?: ServiceAction;
}

export interface AccessPathItem {
  id: string;
  number: string;
  provider: string;
  audience: string;
  identifier: string;
  description: string;
  href: string;
  ctaLabel: string;
  accentHex: string;
  badgeTextHex: string;
}

export interface QuickJumpItem {
  id: string;
  label: string;
  hint: string;
  group: "Layanan" | "Navigasi" | "Akses & Legal";
  href: string;
  external?: boolean;
  keywords: string[];
}

const rawDiscordUrl = (
  import.meta.env.VITE_DISCORD_INVITE_URL ||
  import.meta.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
  ""
).trim();

export const HAS_DISCORD_INVITE = Boolean(rawDiscordUrl);

export const URLS = {
  portal: "https://ftsduaenam.web.id",
  taskpanel: "https://taskpanel.ftsduaenam.web.id",
  login: "https://taskpanel.ftsduaenam.web.id/login",
  courses: "https://taskpanel.ftsduaenam.web.id/dashboard/courses",
  classRoom: "https://taskpanel.ftsduaenam.web.id/dashboard/class",
  profile: "https://taskpanel.ftsduaenam.web.id/dashboard/profile",
  privacy: "https://taskpanel.ftsduaenam.web.id/privacy",
  terms: "https://taskpanel.ftsduaenam.web.id/terms",
  email: "mailto:admin@ftsduaenam.web.id",
  emailDisplay: "admin@ftsduaenam.web.id",
  discord: rawDiscordUrl || "https://taskpanel.ftsduaenam.web.id/login",
} as const;

export const COHORT_IDENTITY = {
  brand: "ftsduaenam",
  generation: "Vikolvere & Verivela",
  facultyShort: "FATISDA UNS",
  facultyFull: "Fakultas Teknologi Informasi dan Sains Data, Universitas Sebelas Maret",
  year: "Angkatan 2026",
  marqueeItems: [
    "S-1 INFORMATIKA",
    "S-1 SAINS DATA",
    "PSDKU KEBUMEN",
    "VIKOLVERE & VERIVELA",
    "FATISDA UNS 2026",
  ],
  programs: [
    {
      code: "01",
      name: "S-1 Informatika",
      campus: "Surakarta",
    },
    {
      code: "02",
      name: "S-1 Sains Data",
      campus: "Surakarta",
    },
    {
      code: "03",
      name: "S-1 Informatika PSDKU",
      campus: "Kebumen",
    },
  ],
} as const;

export const NAV_LINKS = [
  { label: "LAYANAN", href: "#layanan" },
  { label: "EKOSISTEM", href: "#ekosistem" },
  { label: "AKSES", href: "#akses" },
] as const;

/**
 * Katalog layanan resmi ekosistem ftsduaenam.
 * Tambahkan objek baru di array ini saat layanan angkatan bertambah.
 */
export const SERVICES: ServiceItem[] = [
  {
    id: "taskpanel",
    number: "01",
    name: "TaskPanel",
    category: "Layanan Utama",
    description:
      "Manajemen tugas Pribadi, Kelompok (Bagi Rata Subtugas), dan Kelas dengan tampilan Kanban, List, Kalender plus AI Parser, jadwal kuliah live, serta Exam Readiness Tracker untuk UTS dan UAS.",
    accent: "cobalt",
    frameHex: "#0258FF",
    badgeTextHex: "#FFFFFF",
    primaryAction: {
      label: "Buka TaskPanel",
      href: URLS.taskpanel,
      external: true,
    },
    highlights: [
      "Kanban, List, Kalender & AI Parser",
      "Bagi Rata Subtugas Kelompok",
      "Jadwal Kuliah Live & Exam Tracker",
    ],
  },
  {
    id: "course-vault-class",
    number: "02",
    name: "Course Vault & Ruang Kelas",
    category: "Materi & Diskusi",
    description:
      "Repositori terkurasi link Drive, Modul, dan Silabus per mata kuliah, dilengkapi pembagian kelompok kelas otomatis dan forum Q&A diskusi angkatan.",
    accent: "teal",
    frameHex: "#2D6A5B",
    badgeTextHex: "#FFFFFF",
    primaryAction: {
      label: "Buka Course Vault",
      href: URLS.courses,
      external: true,
    },
    secondaryAction: {
      label: "Masuk Ruang Kelas",
      href: URLS.classRoom,
      external: true,
    },
    highlights: [
      "Drive, Modul & Silabus per Matkul",
      "Pembagian Kelompok Otomatis",
      "Forum Q&A Diskusi Kelas",
    ],
  },
  {
    id: "discord-bot",
    number: "03",
    name: "Discord Community & Bot",
    category: "Komunitas & Bot",
    description:
      "Server komunitas angkatan yang terhubung dengan bot penjadwalan: perintah /tugas, Morning Briefing harian, pengingat deadline H-24 dan H-6, serta sinkronisasi role PJ.",
    accent: "coral",
    frameHex: "#FF5A36",
    badgeTextHex: "#131313",
    primaryAction: {
      label: HAS_DISCORD_INVITE ? "Gabung Server Discord" : "Akses via Discord Login",
      href: URLS.discord,
      external: true,
    },
    highlights: [
      "Perintah /tugas & Morning Briefing",
      "Reminder Deadline H-24 dan H-6",
      "Sinkronisasi Role PJ Otomatis",
    ],
  },
  {
    id: "calendar-pwa",
    number: "04",
    name: "Calendar Feed (.ics) & PWA",
    category: "Sinkronisasi",
    description:
      "Link auto-sync kalender zona Asia/Jakarta ke Google Calendar maupun Apple Calendar, disertai notifikasi Web Push dan cache offline untuk jadwal kuliah.",
    accent: "coral",
    frameHex: "#FF5A36",
    badgeTextHex: "#131313",
    primaryAction: {
      label: "Ambil Link .ics",
      href: URLS.profile,
      external: true,
    },
    highlights: [
      "Auto-Sync Asia/Jakarta (.ics)",
      "Google & Apple Calendar Ready",
      "Web Push & Cache Offline PWA",
    ],
  },
];

/**
 * 3 kartu poster miring di section Layanan yang merangkum seluruh layanan ekosistem.
 */
export const POSTER_CARDS: PosterCardItem[] = [
  {
    id: "poster-taskpanel",
    number: "01",
    title: "TaskPanel",
    subtitle: "Layanan Utama",
    description:
      "Kelola tugas Pribadi, Kelompok (Bagi Rata Subtugas), dan Kelas dengan Kanban, List, Kalender plus AI Parser, jadwal live, serta Exam Readiness Tracker.",
    accent: "cobalt",
    frameHex: "#0258FF",
    restRotate: -3.5,
    tags: ["Kanban & Kalender", "AI Parser", "UTS/UAS Tracker"],
    primaryAction: {
      label: "Buka TaskPanel",
      href: URLS.taskpanel,
      external: true,
    },
  },
  {
    id: "poster-vault-class",
    number: "02",
    title: "Course Vault & Kelas",
    subtitle: "Materi & Diskusi",
    description:
      "Akses link Drive, Modul, dan Silabus per mata kuliah tanpa mencari ulang di grup chat, plus pembagian kelompok otomatis dan forum Q&A.",
    accent: "teal",
    frameHex: "#2D6A5B",
    restRotate: 0,
    tags: ["Drive & Silabus", "Kelompok Otomatis", "Forum Q&A"],
    primaryAction: {
      label: "Course Vault",
      href: URLS.courses,
      external: true,
    },
    secondaryAction: {
      label: "Ruang Kelas",
      href: URLS.classRoom,
      external: true,
    },
  },
  {
    id: "poster-sync-discord",
    number: "03",
    title: "Calendar .ics & Discord",
    subtitle: "Sinkronisasi & Bot",
    description:
      "Auto-sync jadwal Asia/Jakarta ke Google atau Apple Calendar, Web Push offline PWA, serta bot Discord /tugas, Morning Briefing, dan reminder H-24 / H-6.",
    accent: "coral",
    frameHex: "#FF5A36",
    restRotate: 3.5,
    tags: [".ics Asia/Jakarta", "Bot /tugas", "H-24 & H-6"],
    primaryAction: {
      label: "Calendar .ics & PWA",
      href: URLS.profile,
      external: true,
    },
    secondaryAction: {
      label: HAS_DISCORD_INVITE ? "Server Discord" : "Discord Login",
      href: URLS.discord,
      external: true,
    },
  },
];

export const ACCESS_PATHS: AccessPathItem[] = [
  {
    id: "google-uns",
    number: "01",
    provider: "Google Workspace UNS",
    audience: "Mahasiswa FATISDA 2026",
    identifier: "@student.uns.ac.id",
    description:
      "Jalur utama mahasiswa untuk membuka jadwal kuliah live, Course Vault, Ruang Kelas, serta tugas personal dan kelompok.",
    href: URLS.login,
    ctaLabel: "Masuk dengan Akun UNS",
    accentHex: "#0258FF",
    badgeTextHex: "#FFFFFF",
  },
  {
    id: "discord-oauth",
    number: "02",
    provider: "Discord OAuth2",
    audience: "Pengurus & PJ Kelas",
    identifier: "Sinkronisasi Role Otomatis",
    description:
      "Jalur pengurus dan Penanggung Jawab (PJ) kelas untuk kelola tugas kelas, briefing bot, dan sinkronisasi role langsung dari Discord.",
    href: URLS.login,
    ctaLabel: "Masuk dengan Discord",
    accentHex: "#FF5A36",
    badgeTextHex: "#131313",
  },
];

export const QUICK_JUMP_ITEMS: QuickJumpItem[] = [
  {
    id: "qj-taskpanel",
    label: "TaskPanel Workspace",
    hint: "taskpanel.ftsduaenam.web.id",
    group: "Layanan",
    href: URLS.taskpanel,
    external: true,
    keywords: ["taskpanel", "tugas", "kanban", "kalender", "jadwal", "exam", "uts", "uas"],
  },
  {
    id: "qj-vault",
    label: "Course Vault (Materi & Silabus)",
    hint: "/dashboard/courses",
    group: "Layanan",
    href: URLS.courses,
    external: true,
    keywords: ["vault", "materi", "drive", "modul", "silabus", "kuliah", "courses"],
  },
  {
    id: "qj-class",
    label: "Ruang Kelas & Forum Q&A",
    hint: "/dashboard/class",
    group: "Layanan",
    href: URLS.classRoom,
    external: true,
    keywords: ["kelas", "class", "kelompok", "diskusi", "forum", "qa"],
  },
  {
    id: "qj-ics",
    label: "Calendar Feed (.ics) & PWA",
    hint: "/dashboard/profile",
    group: "Layanan",
    href: URLS.profile,
    external: true,
    keywords: ["calendar", "kalender", "ics", "sync", "pwa", "push", "offline", "google", "apple"],
  },
  {
    id: "qj-discord",
    label: HAS_DISCORD_INVITE ? "Discord Community & Bot" : "Discord OAuth2 & Bot PJ",
    hint: HAS_DISCORD_INVITE ? "Server Komunitas FATISDA '26" : "/login (Discord OAuth2)",
    group: "Layanan",
    href: URLS.discord,
    external: true,
    keywords: ["discord", "bot", "briefing", "komunitas", "pj", "reminder"],
  },
  {
    id: "qj-sec-intro",
    label: "Tentang ftsduaenam & 3 Prodi",
    hint: "#pengenalan",
    group: "Navigasi",
    href: "#pengenalan",
    keywords: ["prodi", "informatika", "sains data", "kebumen", "psdku", "vikolvere", "verivela"],
  },
  {
    id: "qj-sec-ecosystem",
    label: "Showcase Ekosistem Kami",
    hint: "#ekosistem",
    group: "Navigasi",
    href: "#ekosistem",
    keywords: ["ekosistem", "showcase", "preview", "bot"],
  },
  {
    id: "qj-sec-services",
    label: "Katalog Layanan",
    hint: "#layanan",
    group: "Navigasi",
    href: "#layanan",
    keywords: ["layanan", "katalog", "daftar"],
  },
  {
    id: "qj-sec-access",
    label: "Jalur Akses Masuk",
    hint: "#akses",
    group: "Navigasi",
    href: "#akses",
    keywords: ["akses", "login", "masuk", "student", "uns", "oauth"],
  },
  {
    id: "qj-login",
    label: "Login TaskPanel (UNS / Discord)",
    hint: "taskpanel.ftsduaenam.web.id/login",
    group: "Akses & Legal",
    href: URLS.login,
    external: true,
    keywords: ["login", "masuk", "student.uns.ac.id", "discord", "akun"],
  },
  {
    id: "qj-privacy",
    label: "Kebijakan Privasi",
    hint: "taskpanel.ftsduaenam.web.id/privacy",
    group: "Akses & Legal",
    href: URLS.privacy,
    external: true,
    keywords: ["privacy", "privasi", "legal"],
  },
  {
    id: "qj-terms",
    label: "Ketentuan Layanan",
    hint: "taskpanel.ftsduaenam.web.id/terms",
    group: "Akses & Legal",
    href: URLS.terms,
    external: true,
    keywords: ["terms", "ketentuan", "syarat", "legal"],
  },
  {
    id: "qj-contact",
    label: "Kontak Admin (admin@ftsduaenam.web.id)",
    hint: "Email resmi",
    group: "Akses & Legal",
    href: URLS.email,
    external: false,
    keywords: ["kontak", "email", "admin", "bantuan"],
  },
];

export const FOOTER_COLUMNS = [
  {
    heading: "LAYANAN",
    links: [
      { label: "TaskPanel", href: URLS.taskpanel, external: true },
      { label: "Course Vault", href: URLS.courses, external: true },
      { label: "Ruang Kelas", href: URLS.classRoom, external: true },
      { label: "Calendar Feed (.ics)", href: URLS.profile, external: true },
    ],
  },
  {
    heading: "AKSES",
    links: [
      { label: "Google Workspace UNS", href: URLS.login, external: true },
      { label: "Discord OAuth2 PJ", href: URLS.login, external: true },
      {
        label: HAS_DISCORD_INVITE ? "Server Discord" : "Panduan Jalur Masuk",
        href: HAS_DISCORD_INVITE ? URLS.discord : "#akses",
        external: HAS_DISCORD_INVITE,
      },
    ],
  },
  {
    heading: "LEGAL & KONTAK",
    links: [
      { label: "Kebijakan Privasi", href: URLS.privacy, external: true },
      { label: "Ketentuan Layanan", href: URLS.terms, external: true },
      { label: URLS.emailDisplay, href: URLS.email, external: false },
    ],
  },
] as const;
