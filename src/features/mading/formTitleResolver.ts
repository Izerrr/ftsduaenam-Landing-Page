export interface FormTitleMeta {
  title: string | null;
  description?: string | null;
  estimatedTime?: string | null;
  requiresLogin?: boolean;
}

interface CachedTitleRecord extends FormTitleMeta {
  cachedAt: number;
}

const TITLE_CACHE_KEY = "fts26:surveypanel:form-titles:v2";
const TITLE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const BLOCKED_TITLES = new Set([
  "google forms",
  "google formulir",
  "google forms: sign-in",
  "sign in - google accounts",
  "just a moment...",
  "attention required",
  "access denied",
  "page not found",
]);

let seedCachePromise: Promise<Record<string, FormTitleMeta>> | null = null;

function cleanResolvedTitle(rawTitle: unknown): string | null {
  if (typeof rawTitle !== "string") return null;
  let text = rawTitle
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*-\s*(Google Forms|Google Formulir)\s*$/i, "")
    .trim();

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith("“") && text.endsWith("”"))
  ) {
    text = text.slice(1, -1).trim();
  }

  if (!text) return null;
  if (BLOCKED_TITLES.has(text.toLowerCase())) return null;
  if (/^sign in\s*-/i.test(text) || /^google forms:/i.test(text)) return null;
  return text;
}

function cleanResolvedDescription(rawDesc: unknown): string | null {
  if (typeof rawDesc !== "string") return null;
  const text = rawDesc
    .replace(/[\u2022\u25CF\u25AA\u00B7]/g, " - ")
    .replace(/\p{Extended_Pictographic}/gu, " ")
    .replace(/\u200D|\uFE0F/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;
  if (/^access google forms/i.test(text)) return null;
  if (/^create a new survey/i.test(text)) return null;
  return text;
}

function extractEstimatedTime(description: string | null): string | null {
  if (!description) return null;
  const match = description.match(
    /(?:sekitar|kurang lebih|~|±)?\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(?:menit(?:nya)?|mnt)\b/i
  );
  if (!match) return null;
  const prefix = match[0].includes("±") || match[0].includes("~") ? "±" : "";
  const range = match[1].replace(/\s*[-–]\s*/g, "-").trim();
  return `${prefix}${range} MENIT`;
}

export function readCachedFormTitles(): Record<string, FormTitleMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TITLE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CachedTitleRecord>;
    if (!parsed || typeof parsed !== "object") return {};
    const now = Date.now();
    const fresh: Record<string, FormTitleMeta> = {};

    for (const [url, entry] of Object.entries(parsed)) {
      if (
        entry &&
        typeof entry.cachedAt === "number" &&
        now - entry.cachedAt < TITLE_CACHE_TTL_MS
      ) {
        fresh[url] = {
          title: entry.title ?? null,
          ...(entry.description ? { description: entry.description } : {}),
          ...(entry.estimatedTime ? { estimatedTime: entry.estimatedTime } : {}),
          ...(entry.requiresLogin ? { requiresLogin: true } : {}),
        };
      }
    }

    return fresh;
  } catch {
    return {};
  }
}

function writeCachedFormTitle(url: string, meta: FormTitleMeta) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(TITLE_CACHE_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as Record<string, CachedTitleRecord>)
      : {};
    const safeStore = parsed && typeof parsed === "object" ? parsed : {};
    safeStore[url] = {
      ...meta,
      cachedAt: Date.now(),
    };
    window.localStorage.setItem(TITLE_CACHE_KEY, JSON.stringify(safeStore));
  } catch {
    // Ignore storage restriction errors cleanly
  }
}

export function loadSeedFormTitles(): Promise<Record<string, FormTitleMeta>> {
  if (seedCachePromise) return seedCachePromise;

  const base = import.meta.env.BASE_URL ?? "/";
  const seedUrl = `${base.endsWith("/") ? base : `${base}/`}form-titles.json`;

  seedCachePromise = fetch(seedUrl, { cache: "no-cache" })
    .then(async (res) => {
      if (!res.ok) return {};
      const parsed = (await res.json()) as {
        titles?: Record<string, FormTitleMeta>;
      };
      return parsed?.titles && typeof parsed.titles === "object"
        ? parsed.titles
        : {};
    })
    .catch(() => ({}));

  return seedCachePromise;
}

interface MicrolinkPayload {
  status?: string;
  data?: {
    title?: string | null;
    description?: string | null;
    url?: string | null;
  };
}

/**
 * Fallback runtime resolver for newly added Google Form links not yet present in build-time seed.
 * Uses CORS-friendly Microlink metadata extraction + 24h localStorage cache.
 */
export async function resolveLiveFormMeta(
  url: string,
  signal?: AbortSignal
): Promise<FormTitleMeta | null> {
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, { signal });
    if (!res.ok) return null;

    const payload = (await res.json()) as MicrolinkPayload;
    if (payload.status !== "success" || !payload.data) return null;

    const resolvedUrl = payload.data.url ?? "";
    const rawTitle = payload.data.title ?? "";
    const cleanedTitle = cleanResolvedTitle(rawTitle);

    if (
      !cleanedTitle &&
      (resolvedUrl.includes("accounts.google.com") ||
        /sign-?in/i.test(rawTitle))
    ) {
      const meta: FormTitleMeta = { title: null, requiresLogin: true };
      writeCachedFormTitle(url, meta);
      return meta;
    }

    if (!cleanedTitle) return null;

    const description = cleanResolvedDescription(payload.data.description);
    const estimatedTime = extractEstimatedTime(description);
    const meta: FormTitleMeta = {
      title: cleanedTitle,
      ...(description ? { description } : {}),
      ...(estimatedTime ? { estimatedTime } : {}),
    };

    writeCachedFormTitle(url, meta);
    return meta;
  } catch {
    return null;
  }
}
