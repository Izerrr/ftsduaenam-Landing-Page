import type {
  ClassSectionId,
  MadingFeedConfig,
  QuestionnaireGroup,
} from "@/features/mading/types";

interface ClassBroadcastInput {
  feed: MadingFeedConfig;
  classSection: ClassSectionId;
  readyGroups: QuestionnaireGroup[];
  panelUrl: string;
}

interface GroupBroadcastInput {
  feed: MadingFeedConfig;
  classSection: ClassSectionId;
  group: QuestionnaireGroup;
  panelUrl: string;
}

function getCourseLabel(feed: MadingFeedConfig): string {
  return `${feed.titleFirst} ${feed.titleSecond} (${feed.subtitle})`;
}

/**
 * Generates a simple, ready-to-forward WhatsApp broadcast recap for a class section.
 */
export function buildClassBroadcastText({
  feed,
  classSection,
  readyGroups,
  panelUrl,
}: ClassBroadcastInput): string {
  const courseLabel = getCourseLabel(feed);

  if (readyGroups.length === 0) {
    return [
      `*SURVEYPANEL FTS26 - ${feed.titleFirst} ${feed.titleSecond}*`,
      `Kelas ${classSection}`,
      "",
      "Belum ada tautan kuesioner aktif di kelas ini.",
      `Pantau daftar kuesioner di: ${panelUrl}`,
    ].join("\n");
  }

  const groupLines = readyGroups.map((group, idx) => {
    const topic = group.topik ?? `Kuesioner ${group.kelompok}`;
    return `${idx + 1}. *${group.kelompok}* - ${topic}\n${group.primaryLink}`;
  });

  return [
    "*SURVEYPANEL FTS26*",
    `${courseLabel} - Kelas ${classSection}`,
    "",
    "Halo teman-teman! Mohon bantuannya untuk mengisi kuesioner berikut:",
    "",
    ...groupLines.flatMap((block, idx) =>
      idx === groupLines.length - 1 ? [block] : [block, ""]
    ),
    "",
    `Semua daftar kuesioner lengkap ada di: ${panelUrl}`,
    "",
    "Terima kasih banyak atas waktunya!",
  ].join("\n");
}

/**
 * Generates a short direct WhatsApp message for sharing one group's questionnaire.
 */
export function buildGroupBroadcastText({
  feed,
  classSection,
  group,
  panelUrl,
}: GroupBroadcastInput): string {
  const courseLabel = getCourseLabel(feed);
  const topic = group.topik ?? `Kuesioner ${group.kelompok}`;

  return [
    "Halo teman-teman!",
    "",
    `Kami dari *${group.kelompok}* (${courseLabel} - Kelas ${classSection}) mohon bantuannya untuk mengisi kuesioner artikel ilmiah dengan topik:`,
    `_"${topic}"_`,
    "",
    `Isi langsung di sini: ${group.primaryLink ?? panelUrl}`,
    "",
    `Kuesioner kelompok lain juga tersedia di SurveyPanel: ${panelUrl}`,
    "",
    "Terima kasih banyak!",
  ].join("\n");
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
