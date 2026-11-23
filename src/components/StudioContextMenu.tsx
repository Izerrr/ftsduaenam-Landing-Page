import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ArrowUpRight";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { EraserIcon } from "@phosphor-icons/react/Eraser";
import { URLS } from "@/data/services";
import { dispatchClearInk } from "@/lib/studioEvents";
import { studioSound } from "@/lib/studioSound";

interface MenuPos {
  x: number;
  y: number;
}

const MENU_WIDTH = 200;
const MENU_HEIGHT = 152;

/**
 * Minimalist OFF+BRAND right-click quick-action pill.
 * Triggers on open background area (ignoring links/inputs and Shift+Right-Click for native inspect).
 */
export function StudioContextMenu() {
  const prefersReduced = Boolean(useReducedMotion());
  const [pos, setPos] = useState<MenuPos | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const onContextMenu = (event: MouseEvent) => {
      if (event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("a, button, input, textarea, select, [role='button']")
      ) {
        return;
      }

      event.preventDefault();
      const clampedX = Math.max(
        12,
        Math.min(window.innerWidth - MENU_WIDTH - 12, event.clientX)
      );
      const clampedY = Math.max(
        12,
        Math.min(window.innerHeight - MENU_HEIGHT - 12, event.clientY)
      );
      studioSound.playClick();
      setPos({ x: clampedX, y: clampedY });
    };

    const close = () => setPos(null);

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setPos(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPos(null);
    };

    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleCopyEmail = async () => {
    setPos(null);
    try {
      await navigator.clipboard.writeText(URLS.emailDisplay);
      studioSound.playSuccess();
    } catch {
      window.location.href = URLS.email;
    }
  };

  const handleClearCanvas = () => {
    setPos(null);
    dispatchClearInk();
    studioSound.playClick();
  };

  return (
    <AnimatePresence>
      {pos && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label="Aksi cepat"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 2 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: pos.x, top: pos.y, width: MENU_WIDTH }}
          className="fixed z-[55] overflow-hidden rounded-2xl border border-white/15 bg-[#111112]/92 p-1.5 text-[#F4F4EE] shadow-2xl backdrop-blur-md"
        >
          <a
            role="menuitem"
            href={URLS.taskpanel}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              studioSound.playClick();
              setPos(null);
            }}
            className="flex min-h-[42px] items-center justify-between rounded-xl px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:bg-[#0258FF] hover:text-white"
          >
            <span>TASKPANEL</span>
            <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
          </a>

          <button
            role="menuitem"
            type="button"
            onClick={handleCopyEmail}
            className="flex min-h-[42px] w-full cursor-pointer items-center justify-between rounded-xl px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:bg-white/10"
          >
            <span>COPY EMAIL</span>
            <CopyIcon size={14} weight="bold" aria-hidden="true" />
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={handleClearCanvas}
            className="flex min-h-[42px] w-full cursor-pointer items-center justify-between rounded-xl px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-[#A1A19C] transition-colors hover:bg-white/10 hover:text-white"
          >
            <span>CLEAR CANVAS</span>
            <EraserIcon size={14} weight="bold" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
