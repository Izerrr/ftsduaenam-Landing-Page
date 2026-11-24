import type {
  MadingClassSource,
  QuestionnaireGroup,
} from "@/features/mading/types";

interface GvizCell {
  v?: string | number | boolean | null;
  f?: string;
}

interface GvizCol {
  label?: string;
}

interface GvizRow {
  c?: (GvizCell | null)[];
}

interface GvizResponse {
  status?: string;
  table?: {
    cols?: GvizCol[];
    rows?: GvizRow[];
  };
}

interface ColumnMap {
  kelompok: number;
  nama: number;
  topik: number;
  peran: number;
  link: number;
}

function cellText(cell: GvizCell | null | undefined): string {
  if (!cell || cell.v === null || cell.v === undefined) return "";
  const raw = typeof cell.f === "string" && cell.f.trim() ? cell.f : String(cell.v);
  return raw.replace(/\s+/g, " ").trim();
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectColumns(headers: string[]): ColumnMap | null {
  const findIdx = (patterns: string[]) =>
    headers.findIndex((h) => patterns.some((p) => h.includes(p)));

  const kelompok = findIdx(["kelompok", "group", "tim"]);
  const nama = findIdx(["nama", "member", "anggota", "author", "penulis"]);
  const topik = findIdx(["topik", "judul", "artikel", "title", "tema"]);
  const peran = findIdx(["peran", "role", "jabatan"]);
  const link = findIdx(["link", "url", "kuesioner", "form", "survey"]);

  if (kelompok === -1 && link === -1) return null;
  return { kelompok, nama, topik, peran, link };
}

function extractValidHttpUrls(raw: string): string[] {
  if (!raw) return [];
  const candidates = raw.match(/https?:\/\/[^\s,;]+/gi) ?? [];
  const valid: string[] = [];

  for (const candidate of candidates) {
    const cleaned = candidate.trim().replace(/[),.;]+$/, "");
    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        valid.push(parsed.toString());
      }
    } catch {
      // Ignore malformed links cleanly
    }
  }

  return valid;
}

function formatLinkHost(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const cleanPath =
      u.host === "uns.id" && u.pathname.length > 1 ? u.pathname : "";
    return `${u.host.replace(/^www\./, "")}${cleanPath}`;
  } catch {
    return rawUrl;
  }
}

function extractGroupOrder(label: string, fallbackOrder: number): number {
  const match = label.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : fallbackOrder;
}

function formatDisplayName(name: string): string {
  const trimmed = name.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  // Normalize ALL CAPS names cleanly to Title Case while preserving intentional mixed casing
  if (trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(" ")
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
      .join(" ");
  }
  return trimmed;
}

/**
 * Fetches & auto-parses a live public Google Sheet (GViz JSON endpoint) into grouped questionnaires:
 * - Auto-resolves columns by header name (handling row-0 header fallback & vertically merged cells)
 * - Explicitly omits sensitive fields like NIM
 * - Merges links & article topics across all rows of each Kelompok regardless of which member submitted it
 */
export async function fetchMadingFeed(
  source: MadingClassSource,
  signal?: AbortSignal
): Promise<QuestionnaireGroup[]> {
  const endpoint = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/gviz/tq?tqx=out:json&gid=${source.gid}`;
  const response = await fetch(endpoint, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} saat memuat Google Sheet`);
  }

  const rawText = await response.text();
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Format respons Google Sheets tidak dikenali");
  }

  const payload = JSON.parse(rawText.slice(start, end + 1)) as GvizResponse;
  if (payload.status && payload.status !== "ok") {
    throw new Error("Google Sheet belum dibuka untuk akses publik atau gagal dibaca");
  }

  const cols = payload.table?.cols ?? [];
  const rows = payload.table?.rows ?? [];

  let dataStartIndex = 0;
  let columnMap = detectColumns(
    cols.map((col) => normalizeHeader(col.label ?? ""))
  );

  // Fallback when sheet puts headers into row 0 instead of table.cols[].label
  if (!columnMap && rows.length > 0) {
    const firstRowHeaders = (rows[0].c ?? []).map((cell) =>
      normalizeHeader(cellText(cell))
    );
    columnMap = detectColumns(firstRowHeaders);
    dataStartIndex = 1;
  }

  if (!columnMap) {
    throw new Error("Kolom Kelompok / Link Kuesioner tidak ditemukan di sheet");
  }

  const groupMap = new Map<string, QuestionnaireGroup>();
  let lastGroupLabel = "";
  let seqOrder = 0;

  for (let i = dataStartIndex; i < rows.length; i += 1) {
    const cells = rows[i].c ?? [];
    const rawGroup =
      columnMap.kelompok !== -1 ? cellText(cells[columnMap.kelompok]) : "";
    const resolvedGroup = rawGroup || lastGroupLabel;

    if (!resolvedGroup) continue;
    lastGroupLabel = resolvedGroup;

    let entry = groupMap.get(resolvedGroup);
    if (!entry) {
      seqOrder += 1;
      entry = {
        id: resolvedGroup.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        kelompok: resolvedGroup,
        order: extractGroupOrder(resolvedGroup, seqOrder),
        topik: null,
        links: [],
        primaryLink: null,
        linkHost: null,
        members: [],
      };
      groupMap.set(resolvedGroup, entry);
    }

    // Grab first non-empty Topik Artikel inside the group
    if (columnMap.topik !== -1 && !entry.topik) {
      const topicVal = cellText(cells[columnMap.topik]);
      if (topicVal) {
        entry.topik = topicVal;
      }
    }

    // Grab any valid Link Kuesioner submitted on any row of the group (Ketua or Anggota)
    if (columnMap.link !== -1) {
      const linkVal = cellText(cells[columnMap.link]);
      const urls = extractValidHttpUrls(linkVal);
      for (const u of urls) {
        if (!entry.links.includes(u)) {
          entry.links.push(u);
        }
      }
      if (!entry.primaryLink && entry.links.length > 0) {
        entry.primaryLink = entry.links[0];
        entry.linkHost = formatLinkHost(entry.links[0]);
      }
    }

    // Add member cleanly (strictly ignoring NIM column)
    if (columnMap.nama !== -1) {
      const rawName = cellText(cells[columnMap.nama]);
      if (rawName) {
        const peran =
          columnMap.peran !== -1
            ? cellText(cells[columnMap.peran]) || "Anggota"
            : "Anggota";
        const isLeader = peran.toLowerCase().includes("ketua");
        entry.members.push({
          nama: formatDisplayName(rawName),
          peran: isLeader ? "Ketua" : "Anggota",
          isLeader,
        });
      }
    }
  }

  return Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      members: [...group.members].sort((a, b) =>
        a.isLeader === b.isLeader ? 0 : a.isLeader ? -1 : 1
      ),
    }))
    .sort((a, b) => a.order - b.order);
}
