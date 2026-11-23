import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { IDENTITY, SCENES, URLS, type SceneId } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";

interface CornerHudProps {
  portalFloodActive: boolean;
}

function formatWibClock(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * 4-Corner Fixed Spatial HUD + live WIB relay clock + vertical edge telemetry.
 * Adapts ink and logo accent across Obsidian (#0B0B0C), Bone (#F4F4F0), and Electric Cobalt Flood (#0258FF).
 */
export function CornerHud({ portalFloodActive }: CornerHudProps) {
  const [activeScene, setActiveScene] = useState<SceneId>("monolith");
  const [wibTime, setWibTime] = useState<string>(formatWibClock);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWibTime(formatWibClock());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene]")
    );
    if (sections.length === 0) return;

    const syncActiveScene = () => {
      const probeY = window.innerHeight * 0.45;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= probeY) {
          const id = el.dataset.scene as SceneId | undefined;
          if (id) setActiveScene(id);
          return;
        }
      }
    };

    const observer = new IntersectionObserver(
      () => {
        syncActiveScene();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    syncActiveScene();

    window.addEventListener("scroll", syncActiveScene, { passive: true });
    window.addEventListener("resize", syncActiveScene, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncActiveScene);
      window.removeEventListener("resize", syncActiveScene);
    };
  }, []);

  const isLightSurface = activeScene === "portal" && !portalFloodActive;
  const currentMeta = SCENES.find((s) => s.id === activeScene) ?? SCENES[0];

  const primaryInk = isLightSurface ? "text-[#0B0B0C]" : "text-white";
  const mutedInk = isLightSurface ? "text-[#4A4A46]" : "text-[#9A9A95]";
  const inactiveSceneLink = isLightSurface
    ? "text-[#4A4A46] hover:text-[#0B0B0C]"
    : "text-[#9A9A95] hover:text-white";
  const borderTone = isLightSurface
    ? "border-[#0B0B0C]/35 bg-[#F4F4F0]/80 hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white"
    : "border-white/25 bg-[#0B0B0C]/60 hover:border-white hover:bg-white hover:text-[#0B0B0C]";

  return (
    <header
      className="pointer-events-none fixed inset-0 z-40"
      data-theme={isLightSurface ? "light" : "dark"}
      style={
        {
          "--logo-accent": portalFloodActive ? "#FFFFFF" : "#0258FF",
        } as React.CSSProperties
      }
    >
      {/* Top 2px native CSS scroll-driven progress hairline */}
      <div
        aria-hidden="true"
        className={`scroll-rail fixed top-0 right-0 left-0 h-[2px] transition-colors duration-200 ${
          portalFloodActive ? "bg-white" : "bg-[#0258FF]"
        }`}
      />

      {/* Top Row: Fierce Sigil Wordmark + Live WIB Telemetry + Scene Rail */}
      <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-7 sm:pt-6">
        <a
          href="#monolith"
          data-cursor="ORIGIN"
          aria-label="ftsduaenam.web.id kembali ke awal"
          className={`pointer-events-auto inline-flex min-h-[44px] items-center transition-colors duration-200 ${primaryInk}`}
        >
          <FtsLogo className="hidden h-8 w-auto sm:block sm:h-9" />
          <FtsLogo compact className="block h-9 w-9 sm:hidden" />
        </a>

        {/* Live WIB Telemetry (Desktop center) */}
        <div
          aria-hidden="true"
          className={`hidden items-center gap-3 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-200 lg:flex ${mutedInk}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 ${
              portalFloodActive ? "bg-white" : "bg-[#0258FF]"
            }`}
          />
          <span>WIB {wibTime}</span>
          <span className="opacity-40">/</span>
          <span>SOLO · KBM</span>
        </div>

        <nav
          aria-label="Navigasi scene"
          className="pointer-events-auto flex items-center gap-1 sm:gap-2"
        >
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {SCENES.map((scene) => {
              const isActive = scene.id === activeScene;
              return (
                <li key={scene.id}>
                  <a
                    href={scene.href}
                    data-cursor="JUMP"
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`Scene ${scene.index}: ${scene.label}`}
                    className={`inline-flex min-h-[44px] min-w-[34px] items-center justify-center px-2 font-condensed text-sm font-bold tracking-[0.12em] uppercase transition-colors duration-200 ${
                      isActive ? primaryInk : inactiveSceneLink
                    }`}
                  >
                    <span className="relative">
                      {scene.index}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className={`absolute right-0 -bottom-1 left-0 h-[2px] ${
                            portalFloodActive ? "bg-white" : "bg-[#0258FF]"
                          }`}
                        />
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <span
            aria-hidden="true"
            className={`hidden font-condensed text-xs font-bold tracking-[0.16em] uppercase md:inline ${mutedInk}`}
          >
            // {currentMeta.label}
          </span>
        </nav>
      </div>

      {/* Left vertical telemetry rail (Desktop) */}
      <div
        aria-hidden="true"
        className={`fixed top-1/2 left-5 hidden -translate-y-1/2 -rotate-90 origin-left items-center gap-3 font-condensed text-[11px] font-bold tracking-[0.26em] uppercase transition-colors duration-200 xl:flex ${mutedInk}`}
      >
        <span>{IDENTITY.cohortCode}</span>
        <span className="inline-block h-[1px] w-10 bg-current opacity-40" />
      </div>

      {/* Bottom Row: Cryptic Status Left + Direct TaskPanel Gateway Right */}
      <div className="fixed right-0 bottom-0 left-0 flex items-end justify-between px-4 pb-4 sm:px-7 sm:pb-6">
        <div
          className={`hidden items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 sm:flex ${mutedInk}`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 ${
              portalFloodActive ? "bg-white" : "bg-[#0258FF]"
            }`}
          />
          <span>SYS // XXVI</span>
        </div>

        <a
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="ENTER"
          className={`pointer-events-auto ml-auto inline-flex min-h-[44px] items-center gap-2 border px-3.5 py-2 font-condensed text-sm font-extrabold tracking-[0.12em] uppercase backdrop-blur-[2px] transition-colors duration-200 ${primaryInk} ${borderTone}`}
        >
          <span>TASKPANEL</span>
          <ArrowUpRightIcon size={15} weight="bold" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
