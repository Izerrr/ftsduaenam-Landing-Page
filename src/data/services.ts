export const URLS = {
  portal: "https://ftsduaenam.web.id",
  taskpanel: "https://taskpanel.ftsduaenam.web.id",
  login: "https://taskpanel.ftsduaenam.web.id/login",
  privacy: "https://taskpanel.ftsduaenam.web.id/privacy",
  terms: "https://taskpanel.ftsduaenam.web.id/terms",
  email: "mailto:admin@ftsduaenam.web.id",
  emailDisplay: "admin@ftsduaenam.web.id",
} as const;

export const IDENTITY = {
  brand: "ftsduaenam",
  domain: "ftsduaenam.web.id",
  cohortCode: "VIKOLVERE · VERIVELA // XXVI",
  facultyCode: "FATISDA · UNS · 2026",
} as const;

export type SceneId = "monolith" | "portal" | "signal";

export interface SceneMeta {
  id: SceneId;
  index: string;
  label: string;
  href: `#${SceneId}`;
  theme: "dark" | "light";
}

export const SCENES: readonly SceneMeta[] = [
  {
    id: "monolith",
    index: "01",
    label: "FTSDUAENAM",
    href: "#monolith",
    theme: "dark",
  },
  {
    id: "portal",
    index: "02",
    label: "TASKPANEL",
    href: "#portal",
    theme: "light",
  },
  {
    id: "signal",
    index: "03",
    label: "CONTACT",
    href: "#signal",
    theme: "dark",
  },
] as const;
