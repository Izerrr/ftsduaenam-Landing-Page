import type { MadingFeedConfig } from "@/features/mading/types";

export const MADING_FEEDS: readonly MadingFeedConfig[] = [
  {
    id: "bahasa-indonesia",
    index: "01",
    tag: "HOT RIGHT NOW",
    titleFirst: "BAHASA",
    titleSecond: "Indonesia",
    subtitle: "Kuesioner Artikel Ilmiah",
    isHot: true,
    defaultClass: "B",
    classes: {
      A: null,
      B: {
        spreadsheetId: "1oQt6d9MvtLfzExhRikWJWpf9K4sKeKY5IzUlP1sMZ2Y",
        gid: "1260541291",
      },
    },
  },
] as const;

export const MADING_DEFAULT_FEED_ID = MADING_FEEDS[0].id;
