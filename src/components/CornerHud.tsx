import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { IDENTITY, SCENES, URLS, type SceneId } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";

interface CornerHudProps {
  portalEclipseActive: boolean;
}

/**
 * Minimal eerie spatial corner frame.
 * Features the pointer-tracking Watcher Sigil top-left, Roman numeral scene markers top-right,
 * vertical whisper on desktop left, and a quiet direct TaskPanel threshold bottom-right.
 */
export function CornerHud({ portalEclipseActive }: CornerHudProps) {
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

  const isLightSurface = activeScene === "portal" && !portalEclipseActive;

  const primaryInk = isLightSurface ? "text-[#0B0B0C]" : "text-[#F2F2EE]";
  const mutedInk = isLightSurface ? "text-[#474742]" : "text-[#9B9B96]";
  const inactiveSceneLink = isLightSurface
    ? "text-[#474742] hover:text-[#0B0B0C]"
    : "text-[#9B9B96] hover:text-[#F2F2EE]";
  const thresholdBtn = isLightSurface
    ? "border-[#0B0B0C]/30 bg-[#EAE8E1]/85 text-[#0B0B0C] hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-[#F2F2EE]"
    : "border-[#F2F2EE]/20 bg-[#060607]/70 text-[#F2F2EE] hover:border-[#0258FF] hover:bg-[#0258FF] hover:text-white";

  return (
    <header
      className="pointer-events-none fixed inset-0 z-40"
      data-theme={isLightSurface ? "light" : "dark"}
      style={
        {
          "--logo-accent": isLightSurface ? "#004BE0" : "#0258FF",
        } as React.CSSProperties
      }
    >
      {/* Top razor scroll progress hairline */}
      <div
        aria-hidden="true"
        className="scroll-rail fixed top-0 right-0 left-0 h-[1.5px] bg-[#0258FF]"
      />

      {/* Top Row: Tracking Watcher Logo Left + Roman Numerals Right */}
      <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-7 sm:pt-6">
        <a
          href="#monolith"
          data-cursor="i"
          aria-label="ftsduaenam.web.id kembali ke awal"
          className={`pointer-events-auto inline-flex min-h-[44px] items-center transition-colors duration-300 ${primaryInk}`}
        >
          <FtsLogo trackPointer className="hidden h-8 w-auto sm:block sm:h-9" />
          <FtsLogo compact trackPointer className="block h-9 w-10 sm:hidden" />
        </a>

        <nav
          aria-label="Navigasi scene"
          className="pointer-events-auto flex items-center"
        >
          <ul className="flex items-center gap-1 sm:gap-2">
            {SCENES.map((scene) => {
              const isActive = scene.id === activeScene;
              return (
                <li key={scene.id}>
                  <a
                    href={scene.href}
                    data-cursor={scene.roman.toLowerCase()}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`Bagian ${scene.roman}: ${scene.label}`}
                    className={`inline-flex min-h-[44px] min-w-[36px] items-center justify-center px-2 font-editorial text-lg italic tracking-[0.12em] transition-colors duration-300 ${
                      isActive ? primaryInk : inactiveSceneLink
                    }`}
                  >
                    <span className="relative">
                      {scene.roman}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute right-0 -bottom-1 left-0 h-[1.5px] bg-[#0258FF]"
                        />
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Left vertical eerie whisper (Desktop) */}
      <div
        aria-hidden="true"
        className={`fixed top-1/2 left-5 hidden -translate-y-1/2 -rotate-90 origin-left items-center gap-3 font-editorial text-xs italic tracking-[0.28em] transition-colors duration-300 xl:flex ${mutedInk}`}
      >
        <span>{IDENTITY.cohortCode.toLowerCase()}</span>
        <span className="inline-block h-[1px] w-10 bg-current opacity-35" />
      </div>

      {/* Bottom Row: Quiet TaskPanel Threshold Right */}
      <div className="fixed right-0 bottom-0 left-0 flex items-end justify-between px-4 pb-4 sm:px-7 sm:pb-6">
        <p
          aria-hidden="true"
          className={`hidden font-editorial text-xs italic tracking-[0.22em] transition-colors duration-300 sm:block ${mutedInk}`}
        >
          xxvi
        </p>

        <a
          href={URLS.taskpanel}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="enter"
          className={`pointer-events-auto ml-auto inline-flex min-h-[44px] items-center gap-2 border px-3.5 py-2 font-condensed text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-[2px] transition-colors duration-300 ${thresholdBtn}`}
        >
          <span>TASKPANEL</span>
          <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
