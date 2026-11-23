import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { IDENTITY, SCENES, URLS, type SceneId } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";

interface CornerHudProps {
  portalFloodActive: boolean;
}

/**
 * 4-Corner Fixed Spatial HUD replacing a conventional navbar.
 * Automatically switches ink color between dark (#0B0B0C) and light (#F4F4F0 / #0258FF flood)
 * based on the active scene beneath the viewport center.
 */
export function CornerHud({ portalFloodActive }: CornerHudProps) {
  const [activeScene, setActiveScene] = useState<SceneId>("monolith");

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
    ? "border-[#0B0B0C]/30 hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white"
    : "border-white/25 hover:border-white hover:bg-white hover:text-[#0B0B0C]";

  return (
    <header
      className="pointer-events-none fixed inset-0 z-40"
      data-theme={isLightSurface ? "light" : "dark"}
    >
      {/* Top 2px native scroll-driven progress hairline */}
      <div
        aria-hidden="true"
        className={`scroll-rail fixed top-0 right-0 left-0 h-[2px] transition-colors duration-200 ${
          portalFloodActive ? "bg-white" : "bg-[#0258FF]"
        }`}
      />

      {/* Top Row: Wordmark Left + Scene Index Right */}
      <div className="flex items-start justify-between px-4 pt-4 sm:px-7 sm:pt-6">
        <a
          href="#monolith"
          aria-label="ftsduaenam.web.id kembali ke awal"
          className={`pointer-events-auto inline-flex min-h-[44px] items-center transition-colors duration-200 ${primaryInk}`}
        >
          <FtsLogo className="h-8 w-auto sm:h-9" />
        </a>

        <nav
          aria-label="Navigasi scene"
          className="pointer-events-auto flex items-center gap-1 sm:gap-2"
        >
          <ul className="flex items-center gap-1">
            {SCENES.map((scene) => {
              const isActive = scene.id === activeScene;
              return (
                <li key={scene.id}>
                  <a
                    href={scene.href}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`Scene ${scene.index}: ${scene.label}`}
                    className={`inline-flex min-h-[44px] min-w-[36px] items-center justify-center px-2 font-condensed text-sm font-bold tracking-[0.1em] uppercase transition-colors duration-200 ${
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
            className={`hidden font-condensed text-xs font-bold tracking-[0.14em] uppercase sm:inline ${mutedInk}`}
          >
            // {currentMeta.label}
          </span>
        </nav>
      </div>

      {/* Bottom Row: Cohort Micro-Code Left + Direct TaskPanel Gateway Right */}
      <div className="fixed right-0 bottom-0 left-0 flex items-end justify-between px-4 pb-4 sm:px-7 sm:pb-6">
        <p
          className={`hidden font-condensed text-xs font-bold tracking-[0.16em] uppercase transition-colors duration-200 sm:block ${mutedInk}`}
        >
          {IDENTITY.cohortCode}
        </p>

        <a
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          className={`pointer-events-auto ml-auto inline-flex min-h-[44px] items-center gap-2 border px-3.5 py-2 font-condensed text-sm font-bold tracking-[0.1em] uppercase backdrop-blur-[2px] transition-colors duration-200 ${primaryInk} ${borderTone}`}
        >
          <span>TASKPANEL</span>
          <ArrowUpRightIcon size={15} weight="bold" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
