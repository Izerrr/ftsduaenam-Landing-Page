import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { SmoothScroll } from "@/components/SmoothScroll";
import { StudioPreloader } from "@/components/StudioPreloader";
import { StudioCursor } from "@/components/StudioCursor";
import { TopBar } from "@/components/TopBar";
import { StudioDrawCanvas } from "@/components/StudioDrawCanvas";
import { SynthesiaWaterfall } from "@/components/SynthesiaWaterfall";
import { StudioContextMenu } from "@/components/StudioContextMenu";
import { MonolithScene } from "@/components/MonolithScene";
import { PortalScene } from "@/components/PortalScene";
import { SignalScene } from "@/components/SignalScene";
import {
  type LegalTab,
  closeLegalSheet,
  closeSurveyPanel,
  getLegalTabFromHash,
  isSurveyPanelHash,
  openLegalSheet,
} from "@/lib/sceneNavigation";

const SurveyPanelBoard = lazy(() =>
  import("@/features/mading/MadingBoard").then((mod) => ({
    default: mod.MadingBoard,
  }))
);

const LegalSheet = lazy(() =>
  import("@/components/LegalSheet").then((mod) => ({
    default: mod.LegalSheet,
  }))
);

export function App() {
  const [portalFloodActive, setPortalFloodActive] = useState(false);
  const [monolithCobaltBridge, setMonolithCobaltBridge] = useState(false);
  const [surveyPanelOpen, setSurveyPanelOpen] = useState(() =>
    isSurveyPanelHash(window.location.hash)
  );
  const [legalTab, setLegalTab] = useState<LegalTab | null>(() =>
    getLegalTabFromHash(window.location.hash)
  );

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      setSurveyPanelOpen(isSurveyPanelHash(hash));
      setLegalTab(getLegalTabFromHash(hash));
    };
    const onSurveyPanelEvent = (event: Event) => {
      setSurveyPanelOpen(Boolean((event as CustomEvent<boolean>).detail));
    };
    const onLegalEvent = (event: Event) => {
      setLegalTab((event as CustomEvent<LegalTab | null>).detail ?? null);
    };

    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    window.addEventListener("fts:surveypanel", onSurveyPanelEvent);
    window.addEventListener("fts:legal", onLegalEvent);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("fts:surveypanel", onSurveyPanelEvent);
      window.removeEventListener("fts:legal", onLegalEvent);
    };
  }, []);

  const handleFloodChange = useCallback((active: boolean) => {
    setPortalFloodActive(active);
  }, []);

  const handleCobaltBridgeChange = useCallback((active: boolean) => {
    setMonolithCobaltBridge(active);
  }, []);

  const cobaltSurfaceActive = portalFloodActive || monolithCobaltBridge;
  const hideMainBar = surveyPanelOpen || Boolean(legalTab);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#111112] text-[#F4F4EE]">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

        {/* Lenis smooth scroll inertia + keyboard shortcuts (1, 2, 3) */}
        <SmoothScroll />

        {/* Crisp 0.78s studio preloader (00 -> 26) */}
        <StudioPreloader />

        {/* Bespoke OFF+BRAND triangular studio pointer */}
        <StudioCursor portalFloodActive={cobaltSurfaceActive} />

        {/* Subtle tactile studio grain */}
        <div
          aria-hidden="true"
          className="studio-grain pointer-events-none fixed inset-0 z-30 opacity-[0.035]"
        />

        {/* Freehand hold-and-drag Cobalt light brush */}
        <StudioDrawCanvas portalFloodActive={cobaltSurfaceActive} />

        {/* Synthesia ambient smoke & live WPM */}
        <SynthesiaWaterfall portalFloodActive={cobaltSurfaceActive} />

        {/* Minimalist right-click quick action pill */}
        <StudioContextMenu />

        {!hideMainBar && <TopBar portalFloodActive={portalFloodActive} />}

        <main>
          <MonolithScene onCobaltCoverChange={handleCobaltBridgeChange} />
          <PortalScene onFloodChange={handleFloodChange} />
        </main>

        <SignalScene portalFloodActive={portalFloodActive} />

        <AnimatePresence>
          {surveyPanelOpen && (
            <Suspense fallback={null}>
              <SurveyPanelBoard onClose={closeSurveyPanel} />
            </Suspense>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {legalTab && (
            <Suspense fallback={null}>
              <LegalSheet
                tab={legalTab}
                onSwitchTab={openLegalSheet}
                onClose={closeLegalSheet}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default App;
