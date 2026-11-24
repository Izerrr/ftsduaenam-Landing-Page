import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import {
  IDENTITY,
  SCENES,
  SURVEYPANEL_MODULE,
  URLS,
  type SceneId,
  type SceneMeta,
} from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { Magnetic } from "@/components/Magnetic";
import { SlotRollText } from "@/components/SlotRollText";
import { openSurveyPanel } from "@/lib/sceneNavigation";
import { studioSound, useSoundEnabled } from "@/lib/studioSound";

interface TopBarProps {
  portalFloodActive: boolean;
}

const MENU_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};

const EQ_BARS = [
  { rest: 6, peak: 14, duration: 0.55, delay: 0 },
  { rest: 12, peak: 5, duration: 0.45, delay: 0.14 },
  { rest: 8, peak: 15, duration: 0.62, delay: 0.08 },
] as const;

type HeaderSurface = "dark" | "light" | "cobalt";
type TopCtaTarget = "taskpanel" | "surveypanel";

const TOP_CTA_INTERVAL_MS = 3600;

/**
 * OFF+BRAND architectural top bar + full-screen kinetic overlay menu.
 * Tracks two distinct signals cleanly during scroll:
 * 1. `activeScene`: which chapter visually dominates center viewport (`01. FTS` / `02. WORKSPACE` / `03. CONTACT`).
 * 2. `navSurface`: the exact background color physically sitting behind the header (`y = 32px`),
 *    preventing mismatched white-on-white or dark-on-dark seams between sections.
 */
export function TopBar({ portalFloodActive }: TopBarProps) {
  const [activeScene, setActiveScene] = useState<SceneId>("monolith");
  const [navSceneAtBar, setNavSceneAtBar] = useState<SceneId>("monolith");
  const [bridgeBehindBar, setBridgeBehindBar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredScene, setHoveredScene] = useState<SceneMeta | null>(null);
  const [ctaTarget, setCtaTarget] = useState<TopCtaTarget>("taskpanel");
  const [ctaPaused, setCtaPaused] = useState(false);
  const soundEnabled = useSoundEnabled();
  const prefersReduced = Boolean(useReducedMotion());

  useEffect(() => {
    if (prefersReduced || menuOpen || ctaPaused) return;
    const timer = window.setInterval(() => {
      setCtaTarget((prev) =>
        prev === "taskpanel" ? "surveypanel" : "taskpanel"
      );
    }, TOP_CTA_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prefersReduced, menuOpen, ctaPaused]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene]")
    );
    if (sections.length === 0) return;

    let rafPending = false;

    const syncState = () => {
      rafPending = false;
      const vh = window.innerHeight;
      const barProbeY = 32;
      const focusProbeY = vh * 0.48;

      const bridgeEl = document.querySelector<HTMLElement>(
        "[data-cobalt-bridge='true']"
      );
      const bridgeRect = bridgeEl?.getBoundingClientRect();
      const bridgeVisible =
        Boolean(bridgeEl && bridgeRect) &&
        parseFloat(getComputedStyle(bridgeEl!).opacity) > 0.2;

      const bridgeAtBar =
        bridgeVisible &&
        Boolean(bridgeRect) &&
        bridgeRect!.top <= barProbeY + 8 &&
        bridgeRect!.bottom > barProbeY;
      setBridgeBehindBar(bridgeAtBar);

      // 1. Detect background section sitting directly under the header bar
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= barProbeY && rect.bottom > barProbeY) {
          const id = el.dataset.scene as SceneId | undefined;
          if (id) setNavSceneAtBar(id);
          break;
        }
      }

      // 2. Detect visually dominant chapter at viewport center
      if (
        bridgeVisible &&
        Boolean(bridgeRect) &&
        bridgeRect!.height >= vh * 0.56 &&
        bridgeRect!.top <= focusProbeY &&
        bridgeRect!.bottom > focusProbeY
      ) {
        setActiveScene("portal");
        return;
      }

      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= focusProbeY && rect.bottom > focusProbeY) {
          const id = el.dataset.scene as SceneId | undefined;
          if (id) setActiveScene(id);
          return;
        }
      }
    };

    const scheduleSync = () => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(syncState);
    };

    const observer = new IntersectionObserver(scheduleSync, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    sections.forEach((el) => observer.observe(el));
    syncState();

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setHoveredScene(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const headerSurface: HeaderSurface = menuOpen
    ? "dark"
    : bridgeBehindBar || (navSceneAtBar === "portal" && portalFloodActive)
      ? "cobalt"
      : navSceneAtBar === "portal"
        ? "light"
        : "dark";

  const isLightSurface = headerSurface === "light";
  const isCobaltSurface = headerSurface === "cobalt";

  const primaryInk = isLightSurface
    ? "text-[#111112]"
    : isCobaltSurface
      ? "text-white"
      : "text-[#F4F4EE]";

  const inactiveStep = isLightSurface
    ? "text-[#4A4A45] hover:text-[#111112]"
    : isCobaltSurface
      ? "text-white/75 hover:text-white"
      : "text-[#A1A19C] hover:text-white";

  const ctaPlate = isLightSurface
    ? "bg-[#111112] text-[#F4F4EE] hover:bg-[#0258FF] hover:text-white"
    : isCobaltSurface
      ? "bg-white text-[#111112] hover:bg-[#111112] hover:text-white"
      : "bg-[#F4F4EE] text-[#111112] hover:bg-[#0258FF] hover:text-white";

  const plateStyle = isLightSurface
    ? "border-[#111112]/25 bg-[#F4F4EE]/90 text-[#111112] hover:border-[#111112]"
    : isCobaltSurface
      ? "border-white/40 bg-white/10 text-white hover:border-white hover:bg-white hover:text-[#0258FF]"
      : "border-white/25 bg-[#111112]/85 text-[#F4F4EE] hover:border-white";

  const handleToggleMenu = () => {
    studioSound.playClick();
    setMenuOpen((prev) => {
      if (prev) setHoveredScene(null);
      return !prev;
    });
  };

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        data-theme={isLightSurface ? "light" : "dark"}
        style={
          {
            "--logo-accent": isCobaltSurface ? "#FFFFFF" : "#0258FF",
          } as React.CSSProperties
        }
      >
        {/* Top 2px native scroll-driven progress hairline */}
        <div
          aria-hidden="true"
          className={`scroll-rail fixed top-0 right-0 left-0 h-[2px] transition-colors duration-200 ${
            isCobaltSurface ? "bg-white" : "bg-[#0258FF]"
          }`}
        />

        <div className="mx-auto grid max-w-[1480px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 md:grid-cols-3 sm:px-8 sm:py-5">
          {/* Left: Clean FTS26 monogram */}
          <a
            href="#monolith"
            onClick={() => {
              setMenuOpen(false);
              setHoveredScene(null);
            }}
            aria-label="FTS26 beranda"
            className={`pointer-events-auto inline-flex min-h-[44px] items-center justify-self-start transition-colors duration-200 ${primaryInk}`}
          >
            <FtsLogo className="h-7 w-auto sm:h-8" />
          </a>

          {/* Center (Desktop): Editorial 01 / 02 / 03 index with italic serif numerals */}
          <nav
            aria-label="Navigasi utama"
            className="pointer-events-auto hidden items-center justify-self-center md:flex"
          >
            <ul className="flex items-center gap-6">
              {SCENES.map((scene) => {
                const isActive = scene.id === activeScene;
                return (
                  <li key={scene.id} className="relative">
                    <a
                      href={scene.href}
                      onClick={() => studioSound.playClick()}
                      aria-current={isActive ? "location" : undefined}
                      className={`group relative inline-flex min-h-[44px] items-baseline gap-1.5 px-1.5 py-2 transition-colors duration-200 ${
                        isActive ? primaryInk : inactiveStep
                      }`}
                    >
                      <span
                        className={`font-editorial text-base italic tracking-[-0.02em] transition-colors ${
                          isActive
                            ? isCobaltSurface
                              ? "text-white"
                              : "text-[#0258FF]"
                            : "opacity-70 group-hover:opacity-100"
                        }`}
                      >
                        {scene.index}.
                      </span>
                      <span className="font-condensed text-xs font-extrabold tracking-[0.18em] uppercase">
                        {scene.navTitle}
                      </span>

                      {isActive && (
                        <motion.span
                          layoutId="topbar-scene-line"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          className={`absolute right-0 bottom-1 left-0 h-[1.5px] ${
                            isCobaltSurface ? "bg-white" : "bg-[#0258FF]"
                          }`}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: Chamfered architectural control cluster (Sound + TaskPanel + Menu) */}
          <div className="pointer-events-auto flex items-center justify-self-end gap-2">
            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={() => studioSound.toggle()}
                aria-pressed={soundEnabled}
                aria-label={
                  soundEnabled ? "Matikan efek suara" : "Aktifkan efek suara"
                }
                data-cursor={soundEnabled ? "MUTE" : "SOUND"}
                className={`chamfer-sm inline-flex h-11 w-11 cursor-pointer items-center justify-center gap-[3px] border backdrop-blur-md transition-colors duration-200 active:scale-[0.96] ${plateStyle}`}
              >
                {EQ_BARS.map((bar, idx) => (
                  <motion.span
                    key={idx}
                    aria-hidden="true"
                    animate={
                      soundEnabled && !prefersReduced
                        ? { height: [bar.rest, bar.peak, bar.rest] }
                        : { height: soundEnabled ? bar.rest : 3 }
                    }
                    transition={
                      soundEnabled && !prefersReduced
                        ? {
                            duration: bar.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: bar.delay,
                          }
                        : { duration: 0.2 }
                    }
                    className={`w-[2px] transition-colors ${
                      soundEnabled
                        ? isCobaltSurface
                          ? "bg-white"
                          : "bg-[#0258FF]"
                        : "bg-current opacity-50"
                    }`}
                  />
                ))}
              </button>
            </Magnetic>

            <Magnetic strength={0.2} className="hidden sm:inline-flex">
              <a
                href={
                  ctaTarget === "taskpanel"
                    ? URLS.taskpanel
                    : SURVEYPANEL_MODULE.hash
                }
                target={ctaTarget === "taskpanel" ? "_blank" : undefined}
                rel={
                  ctaTarget === "taskpanel"
                    ? "noopener noreferrer"
                    : undefined
                }
                onMouseEnter={() => setCtaPaused(true)}
                onMouseLeave={() => setCtaPaused(false)}
                onFocus={() => setCtaPaused(true)}
                onBlur={() => setCtaPaused(false)}
                onClick={(event) => {
                  studioSound.playClick();
                  if (ctaTarget === "surveypanel") {
                    event.preventDefault();
                    openSurveyPanel();
                  }
                }}
                aria-label={
                  ctaTarget === "taskpanel"
                    ? "Buka TaskPanel Workspace di tab baru"
                    : "Buka SurveyPanel Kuesioner FTS26"
                }
                data-cursor={ctaTarget === "taskpanel" ? "OPEN" : "SURVEY"}
                className={`chamfer-sm inline-flex min-h-[44px] min-w-[152px] items-center justify-center overflow-hidden px-5 font-condensed text-sm font-extrabold tracking-[0.12em] uppercase transition-colors duration-200 active:scale-[0.97] ${ctaPlate}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ctaTarget}
                    initial={
                      prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }
                    }
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>
                      {ctaTarget === "taskpanel"
                        ? "TASKPANEL"
                        : SURVEYPANEL_MODULE.name}
                    </span>
                    {ctaTarget === "taskpanel" ? (
                      <ArrowUpRightIcon
                        size={15}
                        weight="bold"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowRightIcon
                        size={15}
                        weight="bold"
                        aria-hidden="true"
                      />
                    )}
                  </motion.span>
                </AnimatePresence>
              </a>
            </Magnetic>

            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={handleToggleMenu}
                aria-expanded={menuOpen}
                aria-controls="fullscreen-studio-menu"
                aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                data-cursor={menuOpen ? "CLOSE" : "MENU"}
                className={`chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 border px-4 font-condensed text-xs font-extrabold tracking-[0.16em] uppercase backdrop-blur-md transition-colors duration-200 active:scale-[0.97] ${plateStyle}`}
              >
                <span>{menuOpen ? "CLOSE" : "MENU"}</span>
                <span
                  aria-hidden="true"
                  className="relative flex h-3.5 w-4 flex-col items-center justify-center"
                >
                  <motion.span
                    animate={
                      menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }
                    }
                    transition={MENU_SPRING}
                    className="absolute h-[1.8px] w-4 bg-current"
                  />
                  <motion.span
                    animate={
                      menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }
                    }
                    transition={MENU_SPRING}
                    className="absolute h-[1.8px] w-4 bg-current"
                  />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Full-Screen Kinetic Curtain Menu with Watermark Preview */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="fullscreen-studio-menu"
            initial={prefersReduced ? { opacity: 0 } : { y: "-100%" }}
            animate={prefersReduced ? { opacity: 1 } : { y: "0%" }}
            exit={prefersReduced ? { opacity: 0 } : { y: "-100%" }}
            transition={
              prefersReduced
                ? { duration: 0.15 }
                : { duration: 0.52, ease: [0.76, 0, 0.24, 1] }
            }
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-[#111112] px-4 pt-24 pb-8 text-[#F4F4EE] sm:px-8 sm:pt-28"
          >
            {/* Dynamic Masked Background Index Watermark on Hover */}
            <AnimatePresence mode="wait">
              {hoveredScene && (
                <motion.div
                  key={hoveredScene.id}
                  aria-hidden="true"
                  initial={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: 36, scale: 0.94 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: -24, scale: 0.96 }
                  }
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none fixed inset-0 flex items-center justify-end pr-6 select-none sm:pr-16"
                >
                  <span className="font-condensed text-[clamp(14rem,32vw,30rem)] leading-none font-extrabold tracking-[-0.06em] text-[#0258FF]/15">
                    {hoveredScene.index}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <nav
              aria-label="Menu layar penuh"
              className="relative z-10 mx-auto my-auto w-full max-w-[1480px]"
            >
              <ul className="divide-y divide-white/12 border-y border-white/12">
                {SCENES.map((scene, idx) => {
                  const isRowHovered = hoveredScene?.id === scene.id;
                  return (
                    <li key={scene.id} className="relative overflow-hidden">
                      <motion.a
                        href={scene.href}
                        onMouseEnter={() => {
                          setHoveredScene(scene);
                          studioSound.playHover();
                        }}
                        onMouseLeave={() => setHoveredScene(null)}
                        onFocus={() => setHoveredScene(scene)}
                        onBlur={() => setHoveredScene(null)}
                        onClick={() => {
                          studioSound.playClick();
                          setMenuOpen(false);
                          setHoveredScene(null);
                        }}
                        initial={prefersReduced ? false : { y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          ...MENU_SPRING,
                          delay: prefersReduced ? 0 : 0.12 + idx * 0.06,
                        }}
                        className="group flex min-h-[76px] items-baseline justify-between gap-4 py-5 transition-colors sm:py-7"
                      >
                        <span className="flex items-baseline gap-4 sm:gap-8">
                          <span className="font-mono text-xs tracking-[0.16em] text-[#A1A19C] transition-colors group-hover:text-[#0258FF] sm:text-sm">
                            {scene.index}
                          </span>
                          <span className="font-condensed text-[clamp(2.5rem,1.4rem+5vw,5.4rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase text-[#F4F4EE]">
                            <SlotRollText
                              text={scene.label}
                              active={isRowHovered}
                              hoverColorClass="text-[#0258FF]"
                              stagger={0.038}
                            />
                          </span>
                        </span>
                        <ArrowUpRightIcon
                          size={28}
                          weight="bold"
                          aria-hidden="true"
                          className="shrink-0 text-[#A1A19C] transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#0258FF]"
                        />
                      </motion.a>
                      <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{ scaleX: isRowHovered ? 1 : 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] origin-left bg-[#0258FF]"
                      />
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom menu strip */}
            <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-4 pt-6 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-editorial text-sm italic text-[#A1A19C]">
                  {IDENTITY.tagline}
                </p>
                <span className="hidden font-mono text-[11px] tracking-[0.14em] text-white/35 md:inline">
                  KEYS 1 / 2 / 3 &middot; DRAG TO DRAW &middot; TYPE TO PLAY
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <a
                  href={SURVEYPANEL_MODULE.hash}
                  onClick={() => {
                    studioSound.playClick();
                    setMenuOpen(false);
                    setHoveredScene(null);
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1 font-condensed font-bold tracking-[0.16em] uppercase text-[#5C9AFF] transition-colors hover:text-white"
                >
                  <span>SURVEYPANEL</span>
                </a>
                <a
                  href={URLS.taskpanel}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => studioSound.playClick()}
                  className="inline-flex min-h-[44px] items-center gap-1 font-condensed font-bold tracking-[0.16em] uppercase text-[#5C9AFF] transition-colors hover:text-white"
                >
                  <span>TASKPANEL</span>
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
                </a>
                <a
                  href={URLS.constella}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => studioSound.playClick()}
                  className="inline-flex min-h-[44px] items-center gap-1 font-condensed font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
                >
                  <span>CONSTELLA</span>
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
                </a>
                <a
                  href={URLS.login}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => studioSound.playClick()}
                  className="inline-flex min-h-[44px] items-center font-condensed font-bold tracking-[0.16em] uppercase text-[#F4F4EE] transition-colors hover:text-[#5C9AFF]"
                >
                  LOGIN
                </a>
                <a
                  href={URLS.privacy}
                  onClick={() => {
                    studioSound.playClick();
                    setMenuOpen(false);
                    setHoveredScene(null);
                  }}
                  className="inline-flex min-h-[44px] items-center font-condensed font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
                >
                  PRIVACY
                </a>
                <a
                  href={URLS.terms}
                  onClick={() => {
                    studioSound.playClick();
                    setMenuOpen(false);
                    setHoveredScene(null);
                  }}
                  className="inline-flex min-h-[44px] items-center font-condensed font-bold tracking-[0.16em] uppercase text-[#A1A19C] transition-colors hover:text-white"
                >
                  TERMS
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
