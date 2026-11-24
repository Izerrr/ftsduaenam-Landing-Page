import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEEDS_PATH = path.resolve(__dirname, "../src/features/mading/feeds.json");
const OUT_PATH = path.resolve(__dirname, "../public/form-titles.json");

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

function decodeHtmlEntities(input) {
  return input
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number.parseInt(code, 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const n = Number.parseInt(hex, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#039;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, "-");
}

function cleanFormTitle(rawTitle) {
  if (!rawTitle) return null;
  let text = decodeHtmlEntities(rawTitle).replace(/\s+/g, " ").trim();
  text = text.replace(/\s*-\s*(Google Forms|Google Formulir)\s*$/i, "").trim();

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }

  if (!text) return null;
  if (BLOCKED_TITLES.has(text.toLowerCase())) return null;
  if (/^sign in\s*-/i.test(text) || /^google forms:/i.test(text)) return null;
  return text;
}

function cleanFormDescription(rawDesc) {
  if (!rawDesc) return null;
  const text = decodeHtmlEntities(rawDesc)
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

function extractEstimatedTime(description) {
  if (!description) return null;
  const match = description.match(
    /(?:sekitar|kurang lebih|~|±)?\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(?:menit(?:nya)?|mnt)\b/i
  );
  if (!match) return null;
  const prefix = match[0].includes("±") || match[0].includes("~") ? "±" : "";
  const range = match[1].replace(/\s*[-–]\s*/g, "-").trim();
  return `${prefix}${range} MENIT`;
}

function extractHttpUrls(text) {
  const matches = text.match(/https?:\/\/[^\s,"]+/gi) ?? [];
  const valid = new Set();
  for (const raw of matches) {
    const cleaned = raw.trim().replace(/[),.;]+$/, "");
    try {
      const u = new URL(cleaned);
      if (u.protocol === "https:" || u.protocol === "http:") {
        valid.add(u.toString());
      }
    } catch {
      // Ignore malformed links cleanly
    }
  }
  return Array.from(valid);
}

async function resolveSingleFormMeta(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FTS26-SurveyPanel/1.0)",
        "Accept-Language": "id,en;q=0.9",
      },
    });

    if (
      res.status === 401 ||
      res.status === 403 ||
      res.url.includes("accounts.google.com")
    ) {
      return { title: null, requiresLogin: true };
    }

    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    );
    const descMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']\s*\/?>/i
    );
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = cleanFormTitle(ogMatch?.[1] ?? titleMatch?.[1] ?? "");

    if (!title && html.includes("accounts.google.com")) {
      return { title: null, requiresLogin: true };
    }

    if (!title) return null;

    const description = cleanFormDescription(descMatch?.[1] ?? "");
    const estimatedTime = extractEstimatedTime(description);

    return {
      title,
      ...(description ? { description } : {}),
      ...(estimatedTime ? { estimatedTime } : {}),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  let existing = {};
  try {
    const raw = fs.readFileSync(OUT_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.titles === "object") {
      existing = parsed.titles;
    }
  } catch {
    // No existing cache file yet
  }

  let feeds = [];
  try {
    feeds = JSON.parse(fs.readFileSync(FEEDS_PATH, "utf8"));
  } catch {
    console.warn("[syncFormTitles] Unable to read feeds.json cleanly");
    return;
  }

  const urls = new Set();
  for (const feed of feeds) {
    const classSources = Object.values(feed.classes ?? {}).filter(Boolean);
    for (const source of classSources) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/export?format=csv&gid=${source.gid}`;
        const res = await fetch(csvUrl, { cache: "no-store" });
        if (!res.ok) continue;
        const csv = await res.text();
        for (const u of extractHttpUrls(csv)) {
          urls.add(u);
        }
      } catch {
        // Offline or network hiccup: keep existing seeded entries
      }
    }
  }

  if (urls.size === 0) {
    if (!fs.existsSync(OUT_PATH)) {
      fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
      fs.writeFileSync(OUT_PATH, JSON.stringify({ titles: existing }, null, 2));
    }
    return;
  }

  const nextTitles = { ...existing };
  await Promise.all(
    Array.from(urls).map(async (url) => {
      const meta = await resolveSingleFormMeta(url);
      if (meta) {
        nextTitles[url] = meta;
      }
    })
  );

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    `${JSON.stringify({ titles: nextTitles }, null, 2)}\n`,
    "utf8"
  );
  console.log(
    `[syncFormTitles] Synced ${Object.keys(nextTitles).length} form metadata entries.`
  );
}

main().catch((err) => {
  console.warn("[syncFormTitles] Non-fatal error:", err?.message ?? err);
});
