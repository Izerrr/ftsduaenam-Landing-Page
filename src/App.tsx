import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { IntroSection } from "@/components/IntroSection";
import { DarkShowcaseSection } from "@/components/DarkShowcaseSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ClosingFooter } from "@/components/ClosingFooter";
import { QuickJumpDialog } from "@/components/QuickJumpDialog";

export function App() {
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const openQuickJump = useCallback(() => setQuickJumpOpen(true), []);
  const closeQuickJump = useCallback(() => setQuickJumpOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuickJumpOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#F5F5F2] text-[#131313]">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>

        <Navbar onOpenQuickJump={openQuickJump} />

        <main>
          <HeroSection />
          <IntroSection />
          <DarkShowcaseSection />
          <ServicesSection />
        </main>

        <ClosingFooter onOpenQuickJump={openQuickJump} />

        <QuickJumpDialog open={quickJumpOpen} onClose={closeQuickJump} />
      </div>
    </MotionConfig>
  );
}

export default App;
