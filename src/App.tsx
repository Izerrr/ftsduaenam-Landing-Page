import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { CornerHud } from "@/components/CornerHud";
import { EntryCurtain } from "@/components/EntryCurtain";
import { MonolithScene } from "@/components/MonolithScene";
import { PortalScene } from "@/components/PortalScene";
import { SignalScene } from "@/components/SignalScene";
import { WatcherCursor } from "@/components/WatcherCursor";

export function App() {
  const [portalEclipseActive, setPortalEclipseActive] = useState(false);

  const handleEclipseChange = useCallback((active: boolean) => {
    setPortalEclipseActive(active);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#060607] text-[#F2F2EE]">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

        {/* Uncanny waking eye-slit opening reveal */}
        <EntryCurtain />

        {/* Subtle analog cinema grain + faint CRT scanline veil */}
        <div
          aria-hidden="true"
          className="cinema-grain pointer-events-none fixed inset-0 z-30 opacity-[0.05]"
        />
        <div
          aria-hidden="true"
          className="crt-scanlines pointer-events-none fixed inset-0 z-30 opacity-75"
        />

        {/* Desktop slow-lag watcher cursor */}
        <WatcherCursor />

        <CornerHud portalEclipseActive={portalEclipseActive} />

        <main>
          <MonolithScene />
          <PortalScene onEclipseChange={handleEclipseChange} />
        </main>

        <SignalScene />
      </div>
    </MotionConfig>
  );
}

export default App;
