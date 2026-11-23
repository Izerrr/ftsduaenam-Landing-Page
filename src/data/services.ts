export const URLS = {
  portal: "https://ftsduaenam.web.id",
  taskpanel: "https://taskpanel.ftsduaenam.web.id",
  constella: "https://networking-ops.ftsduaenam.web.id",
  login: "https://taskpanel.ftsduaenam.web.id/login",
  privacy: "https://taskpanel.ftsduaenam.web.id/privacy",
  terms: "https://taskpanel.ftsduaenam.web.id/terms",
  email: "mailto:admin@ftsduaenam.web.id",
  emailDisplay: "admin@ftsduaenam.web.id",
} as const;

export const ARCHIVE_MODULE = {
  badge: "ARCHIVED · 26",
  firstWord: "CON",
  secondWord: "STELLA",
  metrics: "37 OPS · 31 SESSIONS · 182",
  domain: "NETWORKING-OPS.FTSDUAENAM.WEB.ID",
  shortDomain: "NETWORKING-OPS",
  href: URLS.constella,
} as const;

export const IDENTITY = {
  monogram: "FTS26",
  brand: "ftsduaenam",
  domain: "ftsduaenam.web.id",
  code: "FTS26 // XXVI",
  tagline: "Our work speaks louder than others' words.",
} as const;

export type SceneId = "monolith" | "portal" | "signal";

export interface SceneMeta {
  id: SceneId;
  index: string;
  navTitle: string;
  label: string;
  href: `#${SceneId}`;
  theme: "dark" | "light";
}

export const SCENES: readonly SceneMeta[] = [
  {
    id: "monolith",
    index: "01",
    navTitle: "INDEX",
    label: "FTSDUAENAM",
    href: "#monolith",
    theme: "dark",
  },
  {
    id: "portal",
    index: "02",
    navTitle: "WORKSPACE",
    label: "TASKPANEL",
    href: "#portal",
    theme: "light",
  },
  {
    id: "signal",
    index: "03",
    navTitle: "CONTACT",
    label: "CONTACT",
    href: "#signal",
    theme: "dark",
  },
] as const;
