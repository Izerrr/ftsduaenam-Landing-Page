import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { CornerHud } from "@/components/CornerHud";
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
      <div className="min-h-[100dvh] bg-[#0B0B0C] text-white">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

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
