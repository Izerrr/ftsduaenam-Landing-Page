import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/ArrowLeft";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/ArrowClockwise";
import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { ArrowUpIcon } from "@phosphor-icons/react/ArrowUp";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/MagnifyingGlass";
import { QrCodeIcon } from "@phosphor-icons/react/QrCode";
import { ShareNetworkIcon } from "@phosphor-icons/react/ShareNetwork";
import { ShuffleIcon } from "@phosphor-icons/react/Shuffle";
import { WhatsappLogoIcon } from "@phosphor-icons/react/WhatsappLogo";
import { XIcon } from "@phosphor-icons/react/X";
import { IDENTITY, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { KineticText } from "@/components/KineticText";
import { Magnetic } from "@/components/Magnetic";
import { SignatureDraw } from "@/components/SignatureDraw";
import { MADING_DEFAULT_FEED_ID, MADING_FEEDS } from "@/features/mading/feeds";
import { fetchMadingFeed } from "@/features/mading/madingParser";
import type {
  ClassSectionId,
  MadingDataState,
  QuestionnaireGroup,
} from "@/features/mading/types";
import {
  type FormTitleMeta,
  loadSeedFormTitles,
  readCachedFormTitles,
  resolveLiveFormMeta,
} from "@/features/mading/formTitleResolver";
import { QrShareModal } from "@/features/mading/QrShareModal";
import { useFilledSurveys } from "@/features/mading/useFilledSurveys";
import {
  buildClassBroadcastText,
  buildGroupBroadcastText,
  buildWhatsAppShareUrl,
} from "@/features/mading/whatsappBroadcast";
import { studioSound } from "@/lib/studioSound";

interface MadingBoardProps {
  onClose: () => void;
}

type StatusFilter = "all" | "ready" | "unfilled" | "pending";

const TAB_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

const CLASSES: readonly ClassSectionId[] = ["A", "B"] as const;

const FILTER_TABS: readonly { id: StatusFilter; label: string }[] = [
  { id: "all", label: "SEMUA" },
  { id: "ready", label: "SIAP DIISI" },
  { id: "unfilled", label: "BELUM KAMU ISI" },
  { id: "pending", label: "BELUM ADA LINK" },
] as const;

function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Full-page FTS26 SurveyPanel Board styled with main landing-page elements & subtle motion:
 * - Scroll-linked 2px Electric Cobalt progress rail + rotating organic vector contour
 * - Matkul selector rail + animated Kelas A / B switcher with sliding cobalt indicator
 * - Pointer-tracked spotlight aura, KineticText, SignatureDraw, Magnetic controls & row sweeps
 */
export function MadingBoard({ onClose }: MadingBoardProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLElement>(null);
  const broadcastRef = useRef<HTMLElement>(null);

  const [selectedFeedId, setSelectedFeedId] = useState(MADING_DEFAULT_FEED_ID);
  const [selectedClass, setSelectedClass] = useState<ClassSectionId>(
    MADING_FEEDS[0].defaultClass
  );
  const [refreshTick, setRefreshTick] = useState(0);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [dataState, setDataState] = useState<MadingDataState>({
    status: "loading",
    sourceKey: `${MADING_DEFAULT_FEED_ID}:${MADING_FEEDS[0].defaultClass}`,
    groups: [],
  });
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [shuffledIds, setShuffledIds] = useState<string[] | null>(null);
  const [expandedDescIds, setExpandedDescIds] = useState<string[]>([]);
  const [customBroadcastText, setCustomBroadcastText] = useState<string | null>(
    null
  );
  const [waCopied, setWaCopied] = useState(false);
  const [formTitles, setFormTitles] = useState<Record<string, FormTitleMeta>>(
    () => readCachedFormTitles()
  );

  // Scroll-driven animations scoped cleanly inside the Mading scroll container
  const { scrollYProgress } = useScroll({ container: containerRef });
  const smoothScrollBar = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
  });
  const blobRotate = useTransform(scrollYProgress, [0, 1], [-12, 34]);

  const activeFeed = useMemo(
    () => MADING_FEEDS.find((f) => f.id === selectedFeedId) ?? MADING_FEEDS[0],
    [selectedFeedId]
  );

  const activeClassSource = activeFeed.classes[selectedClass];
  const currentSourceKey = `${activeFeed.id}:${selectedClass}`;
  const { isFilled, markFilled, toggleFilled, clearSourceFilled } =
    useFilledSurveys(currentSourceKey);

  const triggerReload = useCallback(
    (nextFeedId?: string, nextClass?: ClassSectionId) => {
      const targetFeedId = nextFeedId ?? activeFeed.id;
      const targetClass = nextClass ?? selectedClass;
      const targetFeed =
        MADING_FEEDS.find((f) => f.id === targetFeedId) ?? activeFeed;

      setHoveredRowId(null);
      setCustomBroadcastText(null);
      setShuffledIds(null);
      setExpandedDescIds([]);
      if (targetFeed.classes[targetClass]) {
        setDataState((prev) => ({
          status: "loading",
          sourceKey: `${targetFeedId}:${targetClass}`,
          groups:
            prev.sourceKey === `${targetFeedId}:${targetClass}`
              ? prev.groups
              : [],
        }));
      }

      if (nextFeedId) setSelectedFeedId(nextFeedId);
      if (nextClass) setSelectedClass(nextClass);
      if (!nextFeedId && !nextClass) {
        setRefreshTick((n) => n + 1);
      }
    },
    [activeFeed, selectedClass]
  );

  useEffect(() => {
    if (!activeClassSource) return;
    const controller = new AbortController();
    const key = `${activeFeed.id}:${selectedClass}`;

    fetchMadingFeed(activeClassSource, controller.signal)
      .then((groups) => {
        if (controller.signal.aborted) return;
        setDataState({
          status: "ready",
          sourceKey: key,
          groups,
          fetchedAt: Date.now(),
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDataState({
          status: "error",
          sourceKey: key,
          groups: [],
          message:
            err instanceof Error
              ? err.message
              : "Tidak dapat mengambil data kuesioner.",
        });
      });

    return () => controller.abort();
  }, [activeClassSource, activeFeed.id, selectedClass, refreshTick]);

  // Lock background landing-page scrolling & close cleanly with Escape
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !qrOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, qrOpen]);

  const rawGroups = useMemo(
    () =>
      activeClassSource && dataState.sourceKey === currentSourceKey
        ? dataState.groups
        : [],
    [activeClassSource, currentSourceKey, dataState]
  );

  // Enrich groups whose sheet topic column is blank by resolving Google Form titles
  // from build-time seed cache + background CORS-friendly metadata fallback
  useEffect(() => {
    const targetUrls = Array.from(
      new Set(
        rawGroups
          .filter((g) => !g.topik && g.primaryLink)
          .map((g) => g.primaryLink as string)
      )
    );
    if (targetUrls.length === 0) return;

    const controller = new AbortController();

    void loadSeedFormTitles().then(async (seed) => {
      if (controller.signal.aborted) return;

      if (Object.keys(seed).length > 0) {
        setFormTitles((prev) => ({ ...seed, ...prev }));
      }

      const cached = readCachedFormTitles();
      const missingUrls = targetUrls.filter(
        (url) => !(url in seed) && !(url in cached)
      );
      if (missingUrls.length === 0) return;

      const queue = [...missingUrls];
      const runWorker = async () => {
        while (queue.length > 0 && !controller.signal.aborted) {
          const nextUrl = queue.shift();
          if (!nextUrl) return;
          const meta = await resolveLiveFormMeta(nextUrl, controller.signal);
          if (meta && !controller.signal.aborted) {
            setFormTitles((prev) => ({ ...prev, [nextUrl]: meta }));
          }
        }
      };

      const concurrency = Math.min(2, missingUrls.length);
      await Promise.all(Array.from({ length: concurrency }, runWorker));
    });

    return () => controller.abort();
  }, [rawGroups]);

  const effectiveGroups = useMemo(
    () =>
      rawGroups.map((group) => {
        if (!group.primaryLink) return group;
        const meta = formTitles[group.primaryLink];
        if (!meta) return group;
        return {
          ...group,
          topik: group.topik ?? meta.title,
          topikFromForm: !group.topik && Boolean(meta.title),
          formDescription: meta.description ?? null,
          estimatedTime: meta.estimatedTime ?? null,
          requiresLogin: meta.requiresLogin,
        };
      }),
    [rawGroups, formTitles]
  );

  const isLoading =
    Boolean(activeClassSource) &&
    (dataState.sourceKey !== currentSourceKey || dataState.status === "loading");
  const isError =
    Boolean(activeClassSource) &&
    dataState.sourceKey === currentSourceKey &&
    dataState.status === "error";

  const readyGroups = useMemo(
    () => effectiveGroups.filter((g) => Boolean(g.primaryLink)),
    [effectiveGroups]
  );

  const pendingGroups = useMemo(
    () => effectiveGroups.filter((g) => !g.primaryLink),
    [effectiveGroups]
  );

  const unfilledReadyGroups = useMemo(
    () => readyGroups.filter((g) => !isFilled(g.id)),
    [readyGroups, isFilled]
  );

  const filledReadyCount = readyGroups.length - unfilledReadyGroups.length;
  const allReadyFilled =
    readyGroups.length > 0 && unfilledReadyGroups.length === 0;

  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = effectiveGroups.filter((group) => {
      if (filter === "ready" && !group.primaryLink) return false;
      if (filter === "unfilled" && (!group.primaryLink || isFilled(group.id))) {
        return false;
      }
      if (filter === "pending" && group.primaryLink) return false;
      if (!needle) return true;

      const haystack = [
        group.kelompok,
        group.topik ?? "",
        group.formDescription ?? "",
        group.linkHost ?? "",
        ...group.members.map((m) => m.nama),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    if (!shuffledIds) return matched;
    const rank = new Map(shuffledIds.map((id, index) => [id, index]));
    return [...matched].sort(
      (a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999)
    );
  }, [effectiveGroups, filter, query, isFilled, shuffledIds]);

  const handleToggleShuffleOrder = () => {
    studioSound.playClick();
    if (shuffledIds !== null) {
      setShuffledIds(null);
      return;
    }
    const shuffledReady = fisherYatesShuffle(readyGroups);
    const shuffledPending = fisherYatesShuffle(pendingGroups);
    setShuffledIds([...shuffledReady, ...shuffledPending].map((g) => g.id));
  };

  const handleToggleDescription = (groupId: string) => {
    studioSound.playClick();
    setExpandedDescIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSpotlightMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReduced || !spotlightRef.current) return;
    const rect = spotlightRef.current.getBoundingClientRect();
    const rx = ((event.clientX - rect.left) / rect.width) * 100;
    const ry = ((event.clientY - rect.top) / rect.height) * 100;
    spotlightRef.current.style.setProperty("--mx", `${rx.toFixed(1)}%`);
    spotlightRef.current.style.setProperty("--my", `${ry.toFixed(1)}%`);
  };

  const handleOpenRandom = () => {
    const pool =
      unfilledReadyGroups.length > 0 ? unfilledReadyGroups : readyGroups;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick.primaryLink) return;
    markFilled(pick.id);
    studioSound.playClick();
    window.open(pick.primaryLink, "_blank", "noopener,noreferrer");
  };

  const handleCopyGroupLink = async (group: QuestionnaireGroup) => {
    if (!group.primaryLink) return;
    try {
      await navigator.clipboard.writeText(group.primaryLink);
      studioSound.playSuccess();
      setCopiedId(group.id);
      window.setTimeout(
        () => setCopiedId((prev) => (prev === group.id ? null : prev)),
        2000
      );
    } catch {
      window.open(group.primaryLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleSharePanel = async () => {
    const url = `${window.location.origin}/#surveypanel`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "SurveyPanel FTS26",
          text: `Kumpulan kuesioner ${activeFeed.titleFirst} ${activeFeed.titleSecond} Kelas ${selectedClass} FTS26`,
          url,
        });
        studioSound.playSuccess();
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      studioSound.playSuccess();
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard blocked cleanly ignored
    }
  };

  const panelShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/#surveypanel`
      : `${URLS.portal}/#surveypanel`;

  const generatedBroadcastText = useMemo(
    () =>
      buildClassBroadcastText({
        feed: activeFeed,
        classSection: selectedClass,
        readyGroups,
        panelUrl: panelShareUrl,
      }),
    [activeFeed, selectedClass, readyGroups, panelShareUrl]
  );

  const broadcastText = customBroadcastText ?? generatedBroadcastText;

  const scrollToBroadcast = useCallback(() => {
    studioSound.playClick();
    broadcastRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }, [prefersReduced]);

  const handleCopyBroadcastText = async () => {
    try {
      await navigator.clipboard.writeText(broadcastText);
      studioSound.playSuccess();
      setWaCopied(true);
      window.setTimeout(() => setWaCopied(false), 2200);
    } catch {
      window.open(
        buildWhatsAppShareUrl(broadcastText),
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const scrollToMadingTop = useCallback(() => {
    studioSound.playClick();
    containerRef.current?.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [prefersReduced]);

  const progressRatio =
    effectiveGroups.length > 0 ? readyGroups.length / effectiveGroups.length : 0;

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="SurveyPanel Kuesioner FTS26"
      data-surveypanel-dialog="true"
      data-lenis-prevent="true"
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[52] overflow-y-auto bg-[#111112] text-[#F4F4EE] focus:outline-none"
    >
      {/* Subtle tactile paper grain matching landing page */}
      <div
        aria-hidden="true"
        className="studio-grain pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Sticky Mading Top Bar with scroll-driven 2px Cobalt hairline */}
      <header className="sticky top-0 z-30 border-b border-white/12 bg-[#111112]/90 backdrop-blur-md">
        {!prefersReduced && (
          <motion.div
            aria-hidden="true"
            style={{ scaleX: smoothScrollBar }}
            className="fixed top-0 right-0 left-0 h-[2px] origin-left bg-[#0258FF]"
          />
        )}

        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
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
                / SURVEYPANEL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSharePanel()}
              data-cursor={shareCopied ? "COPIED" : "SHARE"}
              className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/20 px-3.5 font-condensed text-xs font-bold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112]"
            >
              {shareCopied ? (
                <>
                  <CheckIcon size={14} weight="bold" aria-hidden="true" />
                  <span>LINK DISALIN</span>
                </>
              ) : (
                <>
                  <ShareNetworkIcon
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">BAGIKAN PANEL</span>
                  <span className="sm:hidden">SHARE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                studioSound.playClick();
                setQrOpen(true);
              }}
              aria-label="Tampilkan QR Code SurveyPanel"
              data-cursor="QR"
              className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/20 px-3.5 font-condensed text-xs font-bold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white"
            >
              <QrCodeIcon size={15} weight="bold" aria-hidden="true" />
              <span className="hidden sm:inline">QR CODE</span>
              <span className="sm:hidden">QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                studioSound.playClick();
                triggerReload();
              }}
              disabled={!activeClassSource || isLoading}
              aria-label="Muat ulang data dari Google Sheet"
              data-cursor="SYNC"
              className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/20 px-3.5 font-condensed text-xs font-bold tracking-[0.14em] uppercase text-[#A1A19C] transition-colors hover:border-[#0258FF] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowClockwiseIcon
                size={15}
                weight="bold"
                aria-hidden="true"
                className={isLoading ? "animate-spin text-[#5C9AFF]" : ""}
              />
              <span className="hidden sm:inline">SYNC SHEET</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-8 sm:py-12">
        {/* Selector Matkul + Switcher Kelas A / B */}
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-white/12 pb-3 sm:flex-row sm:items-end">
          {/* Course Tabs */}
          <nav aria-label="Pilih mata kuliah SurveyPanel" className="flex flex-wrap items-center gap-5">
            {MADING_FEEDS.map((feed) => {
              const isSelected = feed.id === activeFeed.id;
              return (
                <button
                  key={feed.id}
                  type="button"
                  onClick={() => {
                    studioSound.playClick();
                    if (feed.id !== activeFeed.id) {
                      triggerReload(feed.id, feed.defaultClass);
                    }
                  }}
                  className={`relative inline-flex min-h-[42px] cursor-pointer items-baseline gap-2 py-2 transition-colors ${
                    isSelected
                      ? "text-[#F4F4EE]"
                      : "text-[#A1A19C] hover:text-white"
                  }`}
                >
                  <span className="font-editorial text-base italic text-[#0258FF]">
                    {feed.index}.
                  </span>
                  <span className="font-condensed text-sm font-extrabold tracking-[0.16em] uppercase">
                    {feed.titleFirst} {feed.titleSecond.toUpperCase()}
                  </span>
                  {feed.isHot && (
                    <span className="bg-[#0258FF] px-1.5 py-0.5 font-condensed text-[9px] font-extrabold tracking-[0.14em] text-white uppercase">
                      HOT
                    </span>
                  )}

                  {isSelected && (
                    <motion.span
                      layoutId="mading-course-line"
                      transition={TAB_SPRING}
                      className="absolute right-0 -bottom-[13px] left-0 h-[2px] bg-[#0258FF]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Class A / B Switcher */}
          <div
            role="group"
            aria-label="Pilih kelas"
            className="chamfer-sm inline-flex self-start border border-white/15 bg-white/[0.03] p-1 sm:self-auto"
          >
            {CLASSES.map((cls) => {
              const isClassActive = selectedClass === cls;
              const isLinked = Boolean(activeFeed.classes[cls]);
              return (
                <button
                  key={cls}
                  type="button"
                  aria-pressed={isClassActive}
                  onClick={() => {
                    if (cls === selectedClass) return;
                    studioSound.playClick();
                    triggerReload(undefined, cls);
                  }}
                  className={`relative z-10 inline-flex min-h-[36px] cursor-pointer items-center gap-2 px-4 font-condensed text-xs font-extrabold tracking-[0.18em] uppercase transition-colors ${
                    isClassActive
                      ? "text-white"
                      : "text-[#A1A19C] hover:text-white"
                  }`}
                >
                  {isClassActive && (
                    <motion.span
                      layoutId="mading-class-pill"
                      transition={TAB_SPRING}
                      className="chamfer-sm absolute inset-0 -z-10 bg-[#0258FF]"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 ${
                      isClassActive
                        ? "bg-white"
                        : isLinked
                          ? "bg-[#0258FF]"
                          : "bg-white/25"
                    }`}
                  />
                  <span>KELAS {cls}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Highlight / Hot Right Now Spotlight (Mirrors PortalScene contour + SignatureDraw) */}
        <AnimatePresence mode="wait">
          <motion.section
            ref={spotlightRef}
            key={currentSourceKey}
            onPointerMove={handleSpotlightMove}
            aria-labelledby="mading-highlight-heading"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="chamfer-md group/card relative overflow-hidden border border-[#0258FF]/40 bg-[#151618] p-6 sm:p-10"
          >
            {/* Subtle pointer-tracking Cobalt specular glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
              style={{
                background:
                  "radial-gradient(520px circle at var(--mx, 75%) var(--my, 35%), rgba(2, 88, 255, 0.2), rgba(92, 154, 255, 0.05) 45%, transparent 72%)",
              }}
            />

            {/* Rotating organic vector contour echoed from Scene 02 */}
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 640 640"
              fill="none"
              style={prefersReduced ? undefined : { rotate: blobRotate }}
              className="pointer-events-none absolute -top-28 -right-24 h-[380px] w-[380px] text-[#0258FF]/15 sm:h-[460px] sm:w-[460px]"
            >
              <path
                d="M320 62C424 54 532 108 564 206C596 304 548 424 468 498C388 572 264 596 172 544C80 492 48 378 66 270C84 162 216 70 320 62Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M320 116C398 112 484 156 508 232C532 308 494 402 432 458C370 514 274 532 204 492C134 452 108 364 122 280C136 196 242 120 320 116Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="6 10"
              />
            </motion.svg>

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-[#0258FF] px-2.5 py-1 font-condensed text-[11px] font-extrabold tracking-[0.18em] uppercase text-white">
                    <span className="h-1.5 w-1.5 bg-white" />
                    <span>{activeFeed.tag}</span>
                  </span>
                  <span className="font-mono text-xs tracking-[0.14em] uppercase text-[#A1A19C]">
                    {activeFeed.subtitle} &middot; KELAS {selectedClass}
                  </span>
                </div>

                <h1
                  id="mading-highlight-heading"
                  className="flex flex-wrap items-baseline gap-x-3 text-[clamp(2.6rem,1.4rem+5vw,5.4rem)] leading-[0.86]"
                >
                  <span className="font-condensed font-extrabold tracking-[-0.04em] uppercase text-[#F4F4EE]">
                    <KineticText
                      text={activeFeed.titleFirst}
                      hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                    />
                  </span>
                  <span className="font-editorial italic tracking-[-0.025em] text-[#0258FF]">
                    {activeFeed.titleSecond}
                  </span>
                </h1>

                <div className="mt-3">
                  <SignatureDraw
                    key={`${currentSourceKey}-sig`}
                    trigger="mount"
                    stroke="#0258FF"
                    className="h-7 w-auto sm:h-8"
                  />
                </div>
              </div>

              {/* Right Column: Live Progress Ratio & Magnetic Random Button */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                <div className="w-full min-w-[210px] sm:w-56">
                  <div className="mb-1.5 flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
                    <span className="text-[#A1A19C]">LINK TERISI</span>
                    <span className="font-semibold text-[#F4F4EE]">
                      {!activeClassSource
                        ? "BELUM ADA"
                        : isLoading && effectiveGroups.length === 0
                          ? "MEMUAT..."
                          : `${readyGroups.length} / ${effectiveGroups.length}`}
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden bg-white/15">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: progressRatio }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full w-full origin-left bg-[#0258FF]"
                    />
                  </div>
                  {readyGroups.length > 0 && (
                    <div className="mt-2.5 flex items-baseline justify-between font-mono text-[11px] tracking-[0.12em] uppercase">
                      <span className="text-[#A1A19C]">
                        {allReadyFilled ? "SEMUA SUDAH DIISI" : "KAMU ISI"}
                      </span>
                      <span className="flex items-center gap-2 text-[#5C9AFF]">
                        <span>
                          {filledReadyCount} / {readyGroups.length}
                        </span>
                        {filledReadyCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              studioSound.playClick();
                              clearSourceFilled();
                            }}
                            className="cursor-pointer text-[10px] text-[#A1A19C] underline underline-offset-2 transition-colors hover:text-white"
                          >
                            RESET
                          </button>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {readyGroups.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                    <Magnetic strength={0.2}>
                      <button
                        type="button"
                        onClick={handleOpenRandom}
                        data-cursor="RANDOM"
                        className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 bg-[#F4F4EE] px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#111112] transition-colors hover:bg-[#0258FF] hover:text-white"
                      >
                        <ShuffleIcon size={15} weight="bold" aria-hidden="true" />
                        <span>
                          {allReadyFilled
                            ? "ACAK LAGI"
                            : filledReadyCount > 0
                              ? `ACAK SISA (${unfilledReadyGroups.length})`
                              : "PILIHKAN ACAK"}
                        </span>
                        <ArrowUpRightIcon
                          size={14}
                          weight="bold"
                          aria-hidden="true"
                        />
                      </button>
                    </Magnetic>

                    <button
                      type="button"
                      onClick={scrollToBroadcast}
                      data-cursor="WA"
                      className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-white/25 bg-white/[0.03] px-3.5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white"
                    >
                      <WhatsappLogoIcon
                        size={15}
                        weight="bold"
                        aria-hidden="true"
                      />
                      <span>BROADCAST WA</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* Honest Empty Class State when Kelas A (unlinked) is selected */}
        {!activeClassSource ? (
          <div className="chamfer-md mt-8 border border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#5C9AFF]">
              KELAS {selectedClass} &middot; BELUM TERHUBUNG
            </p>
            <p className="mt-3 font-editorial text-2xl italic text-[#F4F4EE] sm:text-3xl">
              Data kuesioner untuk Kelas {selectedClass} belum ditautkan ke sheet.
            </p>
            {activeFeed.classes.B && (
              <button
                type="button"
                onClick={() => {
                  studioSound.playClick();
                  triggerReload(undefined, "B");
                }}
                className="chamfer-sm mt-6 inline-flex min-h-[44px] cursor-pointer items-center gap-2 bg-[#0258FF] px-5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-white transition-colors hover:bg-[#5C9AFF]"
              >
                <span>LIHAT KUESIONER KELAS B</span>
                <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Search, Shuffle & Animated Filter Toolbar */}
            <div className="mt-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                <div className="relative w-full sm:w-72">
                  <MagnifyingGlassIcon
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#A1A19C]"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari kelompok, topik, atau nama..."
                    aria-label="Cari kelompok atau nama mahasiswa"
                    className="chamfer-sm min-h-[44px] w-full border border-white/15 bg-white/[0.03] py-2 pr-9 pl-9 font-sans text-sm text-[#F4F4EE] placeholder:text-[#A1A19C]/70 focus:border-[#0258FF] focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Hapus pencarian"
                      className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1 text-[#A1A19C] hover:text-white"
                    >
                      <XIcon size={14} weight="bold" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {readyGroups.length > 1 && (
                  <button
                    type="button"
                    aria-pressed={Boolean(shuffledIds)}
                    onClick={handleToggleShuffleOrder}
                    data-cursor="SHUFFLE"
                    className={`chamfer-sm inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 border px-3.5 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase transition-colors ${
                      shuffledIds
                        ? "border-[#0258FF] bg-[#0258FF]/18 text-[#5C9AFF]"
                        : "border-white/15 text-[#A1A19C] hover:border-white/35 hover:text-white"
                    }`}
                  >
                    <ShuffleIcon size={14} weight="bold" aria-hidden="true" />
                    <span>
                      {shuffledIds ? "URUTAN ACAK" : "ACAK URUTAN"}
                    </span>
                  </button>
                )}
              </div>

              <div
                role="tablist"
                aria-label="Filter status kuesioner"
                className="flex flex-wrap items-center gap-1.5"
              >
                {FILTER_TABS.map((tab) => {
                  const active = filter === tab.id;
                  const tabCount =
                    tab.id === "all"
                      ? effectiveGroups.length
                      : tab.id === "ready"
                        ? readyGroups.length
                        : tab.id === "unfilled"
                          ? unfilledReadyGroups.length
                          : pendingGroups.length;

                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      onClick={() => {
                        studioSound.playClick();
                        setFilter(tab.id);
                      }}
                      className={`relative z-10 inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 border px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase transition-colors ${
                        active
                          ? "border-transparent text-white"
                          : "border-white/15 text-[#A1A19C] hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="mading-filter-pill"
                          transition={TAB_SPRING}
                          className="chamfer-sm absolute inset-0 -z-10 bg-[#0258FF]"
                        />
                      )}
                      <span>{tab.label}</span>
                      <span className="font-mono text-[10px] opacity-80">
                        ({tabCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Groups Directory */}
            <section
              aria-label={`Daftar kuesioner Kelas ${selectedClass}`}
              className="mt-6"
            >
              {isLoading && effectiveGroups.length === 0 ? (
                <div className="space-y-3 border-y border-white/12 py-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-20 animate-pulse bg-white/[0.04]"
                    />
                  ))}
                  <p className="pt-2 text-center font-mono text-xs tracking-[0.16em] uppercase text-[#A1A19C]">
                    MENGAMBIL DATA KELOMPOK KELAS {selectedClass}...
                  </p>
                </div>
              ) : isError ? (
                <div className="chamfer-md border border-white/20 bg-white/[0.03] p-8 text-center">
                  <p className="font-condensed text-lg font-bold tracking-[0.06em] uppercase text-[#F4F4EE]">
                    GAGAL MEMUAT DATA SURVEYPANEL
                  </p>
                  <p className="mt-2 font-mono text-xs text-[#A1A19C]">
                    {dataState.status === "error" ? dataState.message : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerReload()}
                    className="chamfer-sm mt-5 inline-flex min-h-[44px] cursor-pointer items-center gap-2 bg-[#0258FF] px-5 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-white hover:bg-[#5C9AFF]"
                  >
                    <ArrowClockwiseIcon
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                    />
                    <span>COBA LAGI</span>
                  </button>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="border-y border-white/12 py-12 text-center">
                  <p className="font-editorial text-xl italic text-[#A1A19C]">
                    Tidak ada kelompok yang sesuai filter pencarian.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                    className="chamfer-sm mt-4 inline-flex min-h-[44px] cursor-pointer items-center border border-white/25 px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#F4F4EE] hover:border-white hover:bg-white hover:text-[#111112]"
                  >
                    RESET FILTER
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-white/10 border-y border-white/15">
                  {filteredGroups.map((group, idx) => {
                    const hasLink = Boolean(group.primaryLink);
                    const groupFilled = hasLink && isFilled(group.id);
                    const isCopied = copiedId === group.id;
                    const isHovered = hoveredRowId === group.id;

                    return (
                      <motion.li
                        key={group.id}
                        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: prefersReduced ? 0 : Math.min(0.28, idx * 0.025),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onMouseEnter={() => setHoveredRowId(group.id)}
                        onMouseLeave={() =>
                          setHoveredRowId((prev) =>
                            prev === group.id ? null : prev
                          )
                        }
                        className="relative grid grid-cols-1 items-center gap-4 py-5 transition-colors hover:bg-white/[0.025] md:grid-cols-[155px_1fr_auto] md:gap-6 md:px-2"
                      >
                        {/* Group Index & Name */}
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`font-editorial text-2xl italic leading-none transition-transform duration-200 ${
                              hasLink ? "text-[#0258FF]" : "text-white/25"
                            } ${isHovered ? "translate-x-1" : ""}`}
                          >
                            {String(group.order).padStart(2, "0")}.
                          </span>
                          <span className="font-condensed text-lg font-extrabold tracking-[0.04em] uppercase text-[#F4F4EE]">
                            {group.kelompok}
                          </span>
                        </div>

                        {/* Topic & Team Roster (NIM omitted for privacy) */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {group.topik ? (
                              <h2 className="font-sans text-sm font-semibold text-[#F4F4EE] sm:text-base">
                                {group.topik}
                              </h2>
                            ) : (
                              <h2 className="font-editorial text-base italic text-[#A1A19C]">
                                Kuesioner {group.kelompok}
                              </h2>
                            )}

                            {group.linkHost && (
                              <span className="font-mono text-[11px] tracking-[0.04em] text-[#5C9AFF]">
                                {group.linkHost}
                              </span>
                            )}

                            {group.estimatedTime && (
                              <span className="chamfer-sm border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase text-[#F4F4EE]">
                                {group.estimatedTime}
                              </span>
                            )}

                            {group.requiresLogin && (
                              <span className="chamfer-sm border border-amber-300/35 bg-amber-300/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase text-amber-300">
                                PERLU LOGIN GOOGLE
                              </span>
                            )}
                          </div>

                          {group.formDescription && (
                            <div className="mt-1.5">
                              <p
                                className={`text-xs leading-relaxed text-[#A1A19C]/90 ${
                                  expandedDescIds.includes(group.id)
                                    ? ""
                                    : "line-clamp-2"
                                }`}
                              >
                                {group.formDescription}
                              </p>
                              {group.formDescription.length > 140 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleDescription(group.id)
                                  }
                                  className="mt-0.5 cursor-pointer font-mono text-[10px] tracking-[0.06em] uppercase text-[#5C9AFF] hover:underline"
                                >
                                  {expandedDescIds.includes(group.id)
                                    ? "Ringkas"
                                    : "Lihat selengkapnya"}
                                </button>
                              )}
                            </div>
                          )}

                          <p className="mt-1.5 text-xs leading-relaxed text-[#A1A19C]">
                            {group.members.map((member, mIdx) => (
                              <span key={`${group.id}-${member.nama}-${mIdx}`}>
                                {mIdx > 0 && " · "}
                                <span
                                  className={
                                    member.isLeader
                                      ? "font-medium text-[#F4F4EE]"
                                      : ""
                                  }
                                >
                                  {member.nama}
                                </span>
                                {member.isLeader && (
                                  <span className="ml-1 font-mono text-[10px] uppercase text-[#5C9AFF]">
                                    (Ketua)
                                  </span>
                                )}
                              </span>
                            ))}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          {group.primaryLink ? (
                            <>
                              <Magnetic strength={0.16}>
                                <a
                                  href={group.primaryLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    studioSound.playClick();
                                    markFilled(group.id);
                                  }}
                                  data-cursor="OPEN"
                                  className={`chamfer-sm group/btn inline-flex min-h-[44px] items-center gap-2 px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase transition-colors ${
                                    groupFilled
                                      ? "border border-white/25 bg-transparent text-[#A1A19C] hover:border-[#0258FF] hover:text-white"
                                      : "bg-[#F4F4EE] text-[#111112] hover:bg-[#0258FF] hover:text-white"
                                  }`}
                                >
                                  <span>
                                    {groupFilled ? "ISI LAGI" : "ISI KUESIONER"}
                                  </span>
                                  <ArrowUpRightIcon
                                    size={14}
                                    weight="bold"
                                    aria-hidden="true"
                                    className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                                  />
                                </a>
                              </Magnetic>

                              <button
                                type="button"
                                aria-pressed={groupFilled}
                                onClick={() => {
                                  if (groupFilled) {
                                    studioSound.playClick();
                                  } else {
                                    studioSound.playSuccess();
                                  }
                                  toggleFilled(group.id);
                                }}
                                aria-label={
                                  groupFilled
                                    ? `Batalkan tanda sudah diisi untuk ${group.kelompok}`
                                    : `Tandai ${group.kelompok} sudah diisi`
                                }
                                data-cursor={groupFilled ? "DONE" : "CHECK"}
                                className={`chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 border px-3 font-condensed text-xs font-bold tracking-[0.14em] uppercase transition-colors ${
                                  groupFilled
                                    ? "border-[#0258FF]/70 bg-[#0258FF]/15 text-[#5C9AFF] hover:border-white/40 hover:text-white"
                                    : "border-white/20 text-[#A1A19C] hover:border-white hover:text-white"
                                }`}
                              >
                                <CheckIcon
                                  size={14}
                                  weight="bold"
                                  aria-hidden="true"
                                  className={
                                    groupFilled ? "opacity-100" : "opacity-45"
                                  }
                                />
                                <span>
                                  {groupFilled ? "SUDAH DIISI" : "TANDAI SUDAH"}
                                </span>
                              </button>

                              {group.links.length > 1 &&
                                group.links.slice(1).map((extraLink, extraIdx) => (
                                  <a
                                    key={extraLink}
                                    href={extraLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      studioSound.playClick();
                                      markFilled(group.id);
                                    }}
                                    className="chamfer-sm inline-flex min-h-[44px] items-center gap-1.5 border border-white/25 px-3 font-condensed text-xs font-bold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:text-[#5C9AFF]"
                                  >
                                    <span>LINK {extraIdx + 2}</span>
                                    <ArrowUpRightIcon
                                      size={13}
                                      weight="bold"
                                      aria-hidden="true"
                                    />
                                  </a>
                                ))}

                              <button
                                type="button"
                                onClick={() => void handleCopyGroupLink(group)}
                                aria-label={`Salin link kuesioner ${group.kelompok}`}
                                data-cursor={isCopied ? "COPIED" : "COPY"}
                                className="chamfer-sm inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/20 text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112]"
                              >
                                {isCopied ? (
                                  <CheckIcon
                                    size={15}
                                    weight="bold"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <CopyIcon
                                    size={15}
                                    weight="bold"
                                    aria-hidden="true"
                                  />
                                )}
                              </button>

                              <a
                                href={buildWhatsAppShareUrl(
                                  buildGroupBroadcastText({
                                    feed: activeFeed,
                                    classSection: selectedClass,
                                    group,
                                    panelUrl: panelShareUrl,
                                  })
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => studioSound.playClick()}
                                aria-label={`Bagikan ${group.kelompok} lewat WhatsApp`}
                                data-cursor="WA"
                                className="chamfer-sm inline-flex h-11 w-11 items-center justify-center border border-[#0258FF]/45 bg-[#0258FF]/10 text-[#5C9AFF] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white"
                              >
                                <WhatsappLogoIcon
                                  size={16}
                                  weight="bold"
                                  aria-hidden="true"
                                />
                              </a>
                            </>
                          ) : (
                            <span className="chamfer-sm inline-flex min-h-[40px] items-center border border-white/12 px-3.5 font-mono text-[11px] tracking-[0.12em] uppercase text-[#A1A19C]/75">
                              BELUM ADA LINK
                            </span>
                          )}
                        </div>

                        {/* Signature sweeping cobalt underline (from Menu / Contact) */}
                        <motion.span
                          aria-hidden="true"
                          initial={false}
                          animate={{ scaleX: isHovered ? 1 : 0 }}
                          transition={{
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1.5px] origin-left bg-[#0258FF]"
                        />
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}

        {/* Simple 1-Step WhatsApp Broadcast Card */}
        <section
          id="surveypanel-broadcast"
          ref={broadcastRef}
          aria-labelledby="surveypanel-broadcast-heading"
          className="mt-14 border-t border-white/15 pt-10"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#5C9AFF]">
                SHARE KE GRUP WHATSAPP &middot; KELAS {selectedClass}
              </p>
              <h2
                id="surveypanel-broadcast-heading"
                className="mt-1 flex flex-wrap items-baseline gap-x-2.5 text-[clamp(1.9rem,1.2rem+2.4vw,3rem)] leading-[0.92]"
              >
                <span className="font-condensed font-extrabold tracking-[-0.03em] uppercase text-[#F4F4EE]">
                  <KineticText
                    text="BROADCAST"
                    hoverClassName="transition-colors duration-150 hover:text-[#5C9AFF]"
                  />
                </span>
                <span className="font-editorial italic tracking-[-0.02em] text-[#0258FF]">
                  WhatsApp
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-xs leading-relaxed text-[#A1A19C]">
              Tinggal salin pesan siap pakai ini atau klik kirim langsung ke
              WhatsApp tanpa perlu menyusun daftar link satu per satu.
            </p>
          </div>

          <div className="chamfer-md mt-5 border border-white/15 bg-[#151618] p-4 sm:p-6">
            <label htmlFor="surveypanel-wa-textarea" className="sr-only">
              Pesan broadcast WhatsApp siap pakai
            </label>
            <textarea
              id="surveypanel-wa-textarea"
              rows={8}
              value={broadcastText}
              onChange={(e) => setCustomBroadcastText(e.target.value)}
              className="chamfer-sm w-full resize-y border border-white/12 bg-[#111112] p-4 font-mono text-xs leading-relaxed text-[#F4F4EE] focus:border-[#0258FF] focus:outline-none sm:text-[13px]"
            />

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
              <Magnetic strength={0.18}>
                <button
                  type="button"
                  onClick={() => void handleCopyBroadcastText()}
                  data-cursor={waCopied ? "COPIED" : "COPY"}
                  className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2 bg-[#F4F4EE] px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-[#111112] transition-colors hover:bg-[#0258FF] hover:text-white"
                >
                  {waCopied ? (
                    <>
                      <CheckIcon size={15} weight="bold" aria-hidden="true" />
                      <span>TERSALIN</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={15} weight="bold" aria-hidden="true" />
                      <span>SALIN PESAN</span>
                    </>
                  )}
                </button>
              </Magnetic>

              <Magnetic strength={0.18}>
                <a
                  href={buildWhatsAppShareUrl(broadcastText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => studioSound.playClick()}
                  data-cursor="WHATSAPP"
                  className="chamfer-sm inline-flex min-h-[44px] items-center gap-2 border border-[#0258FF] bg-[#0258FF] px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase text-white transition-colors hover:border-[#5C9AFF] hover:bg-[#5C9AFF] hover:text-[#111112]"
                >
                  <WhatsappLogoIcon
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                  />
                  <span>KIRIM VIA WHATSAPP</span>
                  <ArrowUpRightIcon
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                  />
                </a>
              </Magnetic>
            </div>
          </div>
        </section>
      </main>

      {/* Three-Zone Structured SurveyPanel Studio Footer */}
      <footer
        id="surveypanel-footer"
        className="mx-auto w-full max-w-[1280px] border-t border-white/15 px-4 py-8 sm:px-8"
      >
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
          {/* Zone 1: Brand Monogram + Live Class Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <FtsLogo className="h-6 w-auto text-[#F4F4EE]" />
            <span className="font-mono text-xs text-[#A1A19C]">
              SURVEYPANEL &middot; KELAS {selectedClass}
            </span>
          </div>

          {/* Zone 2: Poetic Editorial Tagline */}
          <p className="font-editorial text-sm italic tracking-[0.04em] text-[#A1A19C] md:text-center md:text-base">
            {IDENTITY.tagline}
          </p>

          {/* Zone 3: Quick Links & Back-to-Top (source sheet kept private) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
            <a
              href={URLS.taskpanel}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => studioSound.playClick()}
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
            >
              WORKSPACE
            </a>
            <a
              href={URLS.privacy}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => studioSound.playClick()}
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
            >
              PRIVACY
            </a>
            <a
              href={URLS.terms}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => studioSound.playClick()}
              className="inline-flex min-h-[44px] items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
            >
              TERMS
            </a>
            <button
              type="button"
              onClick={() => {
                studioSound.playClick();
                onClose();
              }}
              className="inline-flex min-h-[44px] cursor-pointer items-center font-condensed text-xs font-bold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:text-[#5C9AFF]"
            >
              LANDING
            </button>
            <Magnetic strength={0.3}>
              <button
                type="button"
                onClick={scrollToMadingTop}
                data-cursor="TOP"
                aria-label="Kembali ke paling atas SurveyPanel"
                className="chamfer-sm inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/25 text-[#F4F4EE] transition-colors hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white active:scale-95"
              >
                <ArrowUpIcon size={17} weight="bold" aria-hidden="true" />
              </button>
            </Magnetic>
          </div>
        </div>
      </footer>
      </div>

      <QrShareModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        shareUrl={panelShareUrl}
        subtitle={`${activeFeed.titleFirst} ${activeFeed.titleSecond} · KELAS ${selectedClass}`}
      />
    </motion.div>
  );
}
