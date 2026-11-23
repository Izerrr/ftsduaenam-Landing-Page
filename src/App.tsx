import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
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

export function App() {
  const [portalFloodActive, setPortalFloodActive] = useState(false);
  const [monolithCobaltBridge, setMonolithCobaltBridge] = useState(false);

  const handleFloodChange = useCallback((active: boolean) => {
    setPortalFloodActive(active);
  }, []);

  const handleCobaltBridgeChange = useCallback((active: boolean) => {
    setMonolithCobaltBridge(active);
  }, []);

  const cobaltSurfaceActive = portalFloodActive || monolithCobaltBridge;

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

        <TopBar portalFloodActive={cobaltSurfaceActive} />

        <main>
          <MonolithScene onCobaltCoverChange={handleCobaltBridgeChange} />
          <PortalScene onFloodChange={handleFloodChange} />
        </main>

        <SignalScene portalFloodActive={portalFloodActive} />
      </div>
    </MotionConfig>
  );
}

export default App;
