import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { TopBar } from "@/components/TopBar";
import { MonolithScene } from "@/components/MonolithScene";
import { PortalScene } from "@/components/PortalScene";
import { SignalScene } from "@/components/SignalScene";

export function App() {
  const [portalFloodActive, setPortalFloodActive] = useState(false);

  const handleFloodChange = useCallback((active: boolean) => {
    setPortalFloodActive(active);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#111112] text-[#F4F4EE]">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

        {/* Subtle tactile studio grain */}
        <div
          aria-hidden="true"
          className="studio-grain pointer-events-none fixed inset-0 z-30 opacity-[0.035]"
        />

        <TopBar portalFloodActive={portalFloodActive} />

        <main>
          <MonolithScene portalFloodActive={portalFloodActive} />
          <PortalScene onFloodChange={handleFloodChange} />
        </main>

        <SignalScene portalFloodActive={portalFloodActive} />
      </div>
    </MotionConfig>
  );
}

export default App;
