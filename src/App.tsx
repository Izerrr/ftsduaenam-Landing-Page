import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { CornerHud } from "@/components/CornerHud";
import { EntryCurtain } from "@/components/EntryCurtain";
import { MonolithScene } from "@/components/MonolithScene";
import { PortalScene } from "@/components/PortalScene";
import { SignalScene } from "@/components/SignalScene";
import { TacticalCursor } from "@/components/TacticalCursor";

export function App() {
  const [portalFloodActive, setPortalFloodActive] = useState(false);

  const handleFloodChange = useCallback((active: boolean) => {
    setPortalFloodActive(active);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#0B0B0C] text-white">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

        {/* Rapid obsidian monolith shutter on arrival */}
        <EntryCurtain />

        {/* Subtle analog cinema film grain overlay */}
        <div
          aria-hidden="true"
          className="cinema-grain pointer-events-none fixed inset-0 z-30 opacity-[0.045]"
        />

        {/* Desktop fine-pointer locking reticle cursor */}
        <TacticalCursor />

        <CornerHud portalFloodActive={portalFloodActive} />

        <main>
          <MonolithScene />
          <PortalScene onFloodChange={handleFloodChange} />
        </main>

        <SignalScene />
      </div>
    </MotionConfig>
  );
}

export default App;
