import feedsJson from "@/features/mading/feeds.json";
import type { MadingFeedConfig } from "@/features/mading/types";

export const MADING_FEEDS = feedsJson as readonly MadingFeedConfig[];

export const MADING_DEFAULT_FEED_ID = MADING_FEEDS[0].id;
