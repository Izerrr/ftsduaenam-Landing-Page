import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CommandIcon as Command } from "@phosphor-icons/react/Command";
import { ListIcon as List } from "@phosphor-icons/react/List";
import { XIcon as X } from "@phosphor-icons/react/X";
import { NAV_LINKS, URLS } from "@/data/services";
import { FtsLogo } from "@/components/FtsLogo";
import { SquiggleNavLink } from "@/components/SquiggleNavLink";

interface NavbarProps {
  onOpenQuickJump: () => void;
}

const SPRING_DOT = {
  type: "spring" as const,
  stiffness: 420,
  damping: 20,
};

/**
 * Adaptive Sticky Navbar:
 * Detects dark sections (#131313, marked with data-theme="dark") passing beneath the top bar
 * via IntersectionObserver and switches <FtsLogo /> instantaneously from Cobalt Blue to White.
 */
export function Navbar({ onOpenQuickJump }: NavbarProps) {
  const [isOverDark, setIsOverDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const darkSections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-theme="dark"]')
    );
    if (darkSections.length === 0) return;

    const visibleDark = new Set<Element>();

    const syncFromBoundingBoxes = () => {
      const probeY = 36;
      const hit = darkSections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
      });
      setIsOverDark(hit);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleDark.add(entry.target);
          } else {
            visibleDark.delete(entry.target);
          }
        }
        setIsOverDark(visibleDark.size > 0);
      },
      {
        rootMargin: "-1px 0px -93% 0px",
        threshold: 0,
      }
    );

    darkSections.forEach((section) => observer.observe(section));
    syncFromBoundingBoxes();

    window.addEventListener("scroll", syncFromBoundingBoxes, { passive: true });
    window.addEventListener("resize", syncFromBoundingBoxes, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncFromBoundingBoxes);
      window.removeEventListener("resize", syncFromBoundingBoxes);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-40 w-full transition-colors duration-150"
      data-over-dark={isOverDark ? "true" : "false"}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 md:h-[76px] lg:px-10">
        {/* Left: Instant-inverting script SVG wordmark */}
        <a
          href="#beranda"
          aria-label="ftsduaenam Beranda"
          className={`inline-flex min-h-[44px] items-center py-1 transition-colors duration-150 ${
            isOverDark ? "text-white" : "text-[#0258FF]"
          }`}
        >
          <FtsLogo className="h-9 w-auto sm:h-10" />
        </a>

        {/* Center (Desktop): Crisp 0px bordered white box with hand-drawn squiggle links */}
        <nav
          aria-label="Utama"
          className="hidden md:flex md:items-center md:border-[1.5px] md:border-[#131313] md:bg-white md:px-2"
        >
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <SquiggleNavLink label={item.label} href={item.href} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Quick Jump (Cmd+K) + TaskPanel morph-dot sharp box */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickJump}
            aria-label="Buka pintasan cepat layanan"
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-none border-[1.5px] border-[#131313] bg-white px-2.5 text-sm font-semibold text-[#131313] transition-colors hover:bg-[#FEF08A] active:scale-[0.98]"
          >
            <Command size={18} weight="bold" aria-hidden="true" />
            <span className="hidden font-condensed text-sm font-bold tracking-[0.04em] uppercase sm:inline">
              K
            </span>
          </button>

          <a
            href={URLS.taskpanel}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            onFocus={() => setCtaHovered(true)}
            onBlur={() => setCtaHovered(false)}
            className="hidden min-h-[44px] items-center gap-2.5 rounded-none border-[1.5px] border-[#131313] bg-white px-4 font-condensed text-base font-bold uppercase tracking-[0.05em] text-[#131313] whitespace-nowrap transition-colors hover:bg-[#131313] hover:text-white active:scale-[0.98] md:inline-flex"
          >
            <motion.span
              aria-hidden="true"
              animate={
                prefersReduced
                  ? {
                      backgroundColor: ctaHovered ? "#FACC15" : "#0258FF",
                    }
                  : {
                      rotate: ctaHovered ? 135 : 0,
                      scale: ctaHovered ? 1.18 : 1,
                      backgroundColor: ctaHovered ? "#FACC15" : "#0258FF",
                    }
              }
              transition={SPRING_DOT}
              className="inline-block h-2.5 w-2.5 shrink-0"
            />
            <span>TASKPANEL</span>
          </a>

          {/* Mobile labeled menu trigger (never a bare mystery icon) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-none border-[1.5px] border-[#131313] bg-white px-3 font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[#131313] transition-colors hover:bg-[#FEF08A] active:scale-[0.98] md:hidden"
          >
            {mobileMenuOpen ? (
              <>
                <X size={18} weight="bold" aria-hidden="true" />
                <span>TUTUP</span>
              </>
            ) : (
              <>
                <List size={18} weight="bold" aria-hidden="true" />
                <span>MENU</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-panel"
          aria-label="Navigasi seluler"
          className="border-y-[1.5px] border-[#131313] bg-white px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col divide-y divide-[#131313]/15">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between py-2 font-condensed text-xl font-bold uppercase tracking-[0.04em] text-[#131313] hover:text-[#0258FF]"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-semibold text-[#4A4A46]">Bagian</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t-[1.5px] border-[#131313]">
            <a
              href={URLS.taskpanel}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-none border-[1.5px] border-[#131313] bg-[#0258FF] px-4 font-condensed text-lg font-bold uppercase tracking-[0.05em] text-white"
            >
              <span className="h-2.5 w-2.5 bg-[#FACC15]" aria-hidden="true" />
              <span>BUKA TASKPANEL</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
