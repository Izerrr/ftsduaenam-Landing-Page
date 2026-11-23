import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { studioSound } from "@/lib/studioSound";
import { isTypingBurstActive, markTypingBurst } from "@/lib/sceneNavigation";
import {
  dispatchClearInk,
  dispatchCobaltWave,
  dispatchSynthSlice,
  subscribeCobaltWave,
  toggleStudioInvert,
} from "@/lib/studioEvents";

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  growthRate: number;
  swirlPhase: number;
  swirlSpeed: number;
  swirlAmp: number;
  life: number;
  maxLife: number;
  peakAlpha: number;
  onFlood: boolean;
}

interface SynthesiaWaterfallProps {
  portalFloodActive: boolean;
}

const DEFAULT_TITLE = "FTS26 | ftsduaenam.web.id";
const WPM_WINDOW_MS = 6000;
const HUD_IDLE_MS = 2400;

const KEYBOARD_ROWS = [
  "1234567890-=",
  "qwertyuiop[]",
  "asdfghjkl;'",
  "zxcvbnm,./",
] as const;

function getColumnNorm(key: string): number {
  if (key === " ") {
    return 0.28 + Math.random() * 0.44;
  }
  if (key === "Enter") {
    return 0.88;
  }
  const lower = key.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const idx = row.indexOf(lower);
    if (idx !== -1) {
      return 0.08 + (idx / (row.length - 1)) * 0.84;
    }
  }
  const code = lower.charCodeAt(0) || 65;
  return 0.12 + ((code % 13) / 12) * 0.76;
}

/**
 * Subtle Ambient Smoke Plumes & Live WPM Meter:
 * - Zero lines, zero floating characters on canvas.
 * - Typing releases soft, atmospheric smoke wisps from the bottom edge that curl and expand
 *   gently upward before dissolving into the background.
 */
export function SynthesiaWaterfall({
  portalFloodActive,
}: SynthesiaWaterfallProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portalFloodRef = useRef(portalFloodActive);

  const [hudVisible, setHudVisible] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [ticker, setTicker] = useState("");
  const [pulseTick, setPulseTick] = useState(0);
  const [waveIds, setWaveIds] = useState<number[]>([]);

  const puffsRef = useRef<SmokePuff[]>([]);
  const timestampsRef = useRef<number[]>([]);
  const sessionStartRef = useRef<number>(0);
  const commandBufRef = useRef("");

  useEffect(() => {
    portalFloodRef.current = portalFloodActive;
  }, [portalFloodActive]);

  // Dynamic browser tab title
  useEffect(() => {
    const syncTitle = () => {
      if (document.hidden) {
        document.title = "FTS26 · Standing by";
      } else if (hudVisible && wpm > 0) {
        document.title = `FTS26 · ${wpm} WPM`;
      } else {
        document.title = DEFAULT_TITLE;
      }
    };
    syncTitle();
    document.addEventListener("visibilitychange", syncTitle);
    return () => document.removeEventListener("visibilitychange", syncTitle);
  }, [hudVisible, wpm]);

  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  // Cobalt shockwave subscription
  useEffect(() => {
    let seq = 0;
    return subscribeCobaltWave(() => {
      const id = ++seq;
      setWaveIds((prev) => [...prev.slice(-2), id]);
      window.setTimeout(() => {
        setWaveIds((prev) => prev.filter((item) => item !== id));
      }, 900);
    });
  }, []);

  useEffect(() => {
    if (prefersReduced || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();
    let hideTimer = 0;
    let lastScrollY = window.scrollY;
    let pendingScrollShift = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const computeWpm = (now: number) => {
      timestampsRef.current = timestampsRef.current.filter(
        (ts) => now - ts <= WPM_WINDOW_MS
      );
      const count = timestampsRef.current.length;
      if (count < 2) {
        return count === 1 ? 12 : 0;
      }
      const span = Math.max(
        1800,
        Math.min(WPM_WINDOW_MS, now - sessionStartRef.current)
      );
      return Math.min(240, Math.round(((count / 5) * 60000) / span));
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      if (puffsRef.current.length > 0) {
        pendingScrollShift = Math.max(
          -160,
          Math.min(160, pendingScrollShift + delta * 0.45)
        );
      }
    };

    const ensureLoop = () => {
      if (rafId !== 0) return;
      lastTime = performance.now();

      const render = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        ctx.clearRect(0, 0, vw, vh);

        const scrollShiftY = pendingScrollShift * 0.22;
        pendingScrollShift *= 0.78;
        if (Math.abs(pendingScrollShift) < 0.05) pendingScrollShift = 0;

        const puffs = puffsRef.current;
        for (let i = puffs.length - 1; i >= 0; i -= 1) {
          const p = puffs[i];
          p.life -= dt;
          if (p.life <= 0 || p.y + p.radius < -20) {
            puffs.splice(i, 1);
            continue;
          }

          p.swirlPhase += dt * p.swirlSpeed;
          p.x += (p.vx + Math.sin(p.swirlPhase) * p.swirlAmp) * dt;
          p.y -= p.vy * dt + scrollShiftY * 0.5;
          p.radius += p.growthRate * dt;

          const progress = 1 - p.life / p.maxLife;
          // Smooth bell fade-in then long atmospheric dissolve
          const envelope =
            progress < 0.18
              ? progress / 0.18
              : Math.pow(1 - (progress - 0.18) / 0.82, 1.6);
          const alpha = Math.max(0, p.peakAlpha * envelope);
          if (alpha <= 0.004) continue;

          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            p.radius * 0.06,
            p.x,
            p.y,
            p.radius
          );

          if (p.onFlood) {
            grad.addColorStop(
              0,
              `rgba(244, 244, 238, ${(alpha * 1.15).toFixed(4)})`
            );
            grad.addColorStop(
              0.48,
              `rgba(244, 244, 238, ${(alpha * 0.45).toFixed(4)})`
            );
            grad.addColorStop(1, "rgba(244, 244, 238, 0)");
          } else {
            grad.addColorStop(
              0,
              `rgba(58, 122, 255, ${alpha.toFixed(4)})`
            );
            grad.addColorStop(
              0.46,
              `rgba(2, 88, 255, ${(alpha * 0.5).toFixed(4)})`
            );
            grad.addColorStop(1, "rgba(2, 88, 255, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (puffs.length > 0) {
          rafId = window.requestAnimationFrame(render);
        } else {
          rafId = 0;
        }
      };

      rafId = window.requestAnimationFrame(render);
    };

    const scheduleHudHide = () => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        setHudVisible(false);
        setTicker("");
        timestampsRef.current = [];
        sessionStartRef.current = 0;
        commandBufRef.current = "";
      }, HUD_IDLE_MS);
    };

    const checkSecretKeyword = (char: string) => {
      if (!/^[a-z0-9]$/i.test(char)) return;
      commandBufRef.current = (commandBufRef.current + char.toLowerCase()).slice(-16);
      const buf = commandBufRef.current;

      if (buf.endsWith("duaenam") || buf.endsWith("fts")) {
        dispatchCobaltWave();
        studioSound.playChord();
        commandBufRef.current = "";
        return;
      }

      if (buf.endsWith("invert")) {
        toggleStudioInvert();
        studioSound.playShutter();
        commandBufRef.current = "";
        return;
      }

      if (buf.endsWith("clear")) {
        dispatchClearInk();
        studioSound.playSuccess();
        commandBufRef.current = "";
      }
    };

    const spawnSmokePlume = (normX: number, intense = false) => {
      const baseX = normX * window.innerWidth;
      const vh = window.innerHeight;
      const onFlood = portalFloodRef.current;
      const count = intense ? 4 : 2;

      for (let i = 0; i < count; i += 1) {
        const maxLife = 2.1 + Math.random() * 1.1;
        puffsRef.current.push({
          x: baseX + (Math.random() - 0.5) * 48,
          y: vh - 6 + Math.random() * 16,
          vx: (Math.random() - 0.5) * 18,
          vy: 58 + Math.random() * 52,
          radius: 36 + Math.random() * 28,
          growthRate: 34 + Math.random() * 26,
          swirlPhase: Math.random() * Math.PI * 2,
          swirlSpeed: 1.4 + Math.random() * 1.4,
          swirlAmp: 20 + Math.random() * 22,
          life: maxLife,
          maxLife,
          peakAlpha: intense ? 0.14 : 0.11,
          onFlood,
        });
      }

      // Cap total active puffs so rapid typing stays silky smooth and subtle
      if (puffsRef.current.length > 75) {
        puffsRef.current.splice(0, puffsRef.current.length - 75);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        activeEl?.isContentEditable
      ) {
        return;
      }

      if (event.key === "Backspace") {
        setTicker((prev) => prev.slice(0, -1));
        commandBufRef.current = commandBufRef.current.slice(0, -1);
        scheduleHudHide();
        return;
      }

      const isPrintable = event.key.length === 1;
      const isEnter = event.key === "Enter";
      if (!isPrintable && !isEnter) return;

      if (
        (event.key === "1" || event.key === "2" || event.key === "3") &&
        !isTypingBurstActive()
      ) {
        return;
      }

      markTypingBurst();

      const normX = getColumnNorm(event.key);

      // Holding a key gently feeds softer continuous smoke wisps
      if (event.repeat) {
        spawnSmokePlume(normX, false);
        ensureLoop();
        scheduleHudHide();
        return;
      }

      const now = performance.now();
      if (
        sessionStartRef.current === 0 ||
        now - (timestampsRef.current.at(-1) ?? 0) > HUD_IDLE_MS
      ) {
        sessionStartRef.current = now;
        timestampsRef.current = [];
      }

      timestampsRef.current.push(now);
      setWpm(computeWpm(now));
      setHudVisible(true);
      setPulseTick((n) => n + 1);
      setTicker((prev) => (prev + (isEnter ? "↵ " : event.key)).slice(-18));
      scheduleHudHide();

      dispatchSynthSlice(Math.min(4, Math.max(0, Math.floor(normX * 5))));
      spawnSmokePlume(normX, event.key === " " || isEnter);

      studioSound.playTypeThock(normX, event.key === " " || isEnter);
      if (isPrintable) {
        checkSecretKeyword(event.key);
      }
      ensureLoop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(hideTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[37] h-full w-full"
      />

      {/* Secret Keyword Cobalt Shockwave Rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[38] flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence>
          {waveIds.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 0.9, scale: 0.1 }}
              animate={{ opacity: 0, scale: 4.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-64 w-64 rounded-full border-2 border-[#0258FF] shadow-[0_0_60px_rgba(2,88,255,0.45)]"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Minimalist auto-hiding WPM + Live Ticker Plate */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-5 z-[39] flex justify-center px-4"
          >
            <div className="chamfer-md flex items-center gap-3 border border-white/20 bg-[#111112]/92 px-4 py-2 text-[#F4F4EE] shadow-2xl backdrop-blur-md">
              <motion.span
                key={pulseTick}
                initial={{ scale: 1.7 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.16 }}
                className="h-2 w-2 bg-[#0258FF]"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="font-condensed text-lg leading-none font-extrabold tracking-[-0.02em] tabular-nums text-white">
                  {String(wpm).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#5C9AFF]">
                  WPM
                </span>
              </div>
              {ticker && (
                <>
                  <span className="h-3.5 w-[1px] bg-white/15" />
                  <span className="max-w-[140px] truncate font-mono text-[11px] tracking-[0.06em] text-[#A1A19C]">
                    {ticker}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
