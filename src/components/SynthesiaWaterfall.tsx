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

interface KineticBubble {
  id: number;
  code: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  vy: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  life: number;
  maxLife: number;
  held: boolean;
  isAccent: boolean;
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

function getColumnNorm(key: string): { normX: number; label: string } {
  if (key === " ") {
    return { normX: 0.25 + Math.random() * 0.5, label: "" };
  }
  if (key === "Enter") {
    return { normX: 0.88, label: "↵" };
  }
  const lower = key.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const idx = row.indexOf(lower);
    if (idx !== -1) {
      return {
        normX: 0.08 + (idx / (row.length - 1)) * 0.84,
        label: key.toUpperCase(),
      };
    }
  }
  const code = lower.charCodeAt(0) || 65;
  return {
    normX: 0.12 + ((code % 13) / 12) * 0.76,
    label: key.toUpperCase(),
  };
}

/**
 * Kinetic Bubble & Typography Drift + Live WPM Meter (Non-MIDI):
 * - Typing launches crisp OFF+BRAND glass orbs & floating character echoes upward from the bottom.
 * - Holding any key inflates/charges its orb before releasing it into upward zero-gravity drift.
 * - Features scroll-inertia momentum, 5-slice Hero equalizer pulses, secret keywords, and tab WPM.
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

  const bubblesRef = useRef<KineticBubble[]>([]);
  const heldByCodeRef = useRef<Map<string, KineticBubble>>(new Map());
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
    let bubbleSeq = 0;
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
      if (bubblesRef.current.length > 0) {
        pendingScrollShift = Math.max(
          -180,
          Math.min(180, pendingScrollShift + delta * 0.5)
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

        const scrollShiftY = pendingScrollShift * 0.24;
        pendingScrollShift *= 0.76;
        if (Math.abs(pendingScrollShift) < 0.05) pendingScrollShift = 0;

        const bubbles = bubblesRef.current;
        for (let i = bubbles.length - 1; i >= 0; i -= 1) {
          const b = bubbles[i];

          if (b.held) {
            // Inflate crisply while key is held down near bottom launch line
            b.radius = Math.min(38, b.radius + 36 * dt);
            b.y = Math.max(vh - 76, b.y - 24 * dt);
          } else {
            b.radius += (b.targetRadius - b.radius) * Math.min(1, dt * 8);
            b.y -= b.vy * dt + scrollShiftY * 0.65;
            b.wobblePhase += dt * b.wobbleSpeed;
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * dt;
            b.life -= dt;
          }

          if (b.life <= 0 || b.y < -b.radius - 20) {
            bubbles.splice(i, 1);
            continue;
          }

          const progress = Math.max(0, b.life / b.maxLife);
          const horizonFade = Math.max(0, Math.min(1, b.y / (vh * 0.28)));
          const alpha = Math.min(1, progress * 1.45) * horizonFade;
          if (alpha <= 0.01) continue;

          // Crisp glass orb rim + subtle translucent fill (NO hazy smoke blur)
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.onFlood
            ? `rgba(255, 255, 255, ${(alpha * 0.18).toFixed(3)})`
            : b.isAccent
              ? `rgba(2, 88, 255, ${(alpha * 0.16).toFixed(3)})`
              : `rgba(92, 154, 255, ${(alpha * 0.12).toFixed(3)})`;
          ctx.fill();

          ctx.lineWidth = b.held ? 2 : 1.35;
          ctx.strokeStyle = b.onFlood
            ? `rgba(255, 255, 255, ${(alpha * 0.92).toFixed(3)})`
            : b.isAccent
              ? `rgba(2, 88, 255, ${(alpha * 0.94).toFixed(3)})`
              : `rgba(92, 154, 255, ${(alpha * 0.78).toFixed(3)})`;
          ctx.stroke();

          // Sharp tiny glass crescent specular arc (top-left of orb)
          if (b.radius >= 8) {
            ctx.beginPath();
            ctx.arc(
              b.x,
              b.y,
              Math.max(2, b.radius - 3.5),
              -Math.PI * 0.82,
              -Math.PI * 0.38
            );
            ctx.lineWidth = 1.1;
            ctx.strokeStyle = b.onFlood
              ? `rgba(255, 255, 255, ${(alpha * 0.8).toFixed(3)})`
              : `rgba(244, 244, 238, ${(alpha * 0.65).toFixed(3)})`;
            ctx.stroke();
          }

          // Floating editorial character glyph centered cleanly inside primary orb
          if (b.label && b.radius >= 12) {
            ctx.fillStyle = b.onFlood
              ? `rgba(255, 255, 255, ${alpha.toFixed(3)})`
              : `rgba(2, 88, 255, ${alpha.toFixed(3)})`;
            const fontSize = Math.round(Math.max(11, Math.min(24, b.radius * 0.85)));
            ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.label, b.x, b.y + 0.5);
          }
        }

        if (bubbles.length > 0) {
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
      if (event.repeat) return;

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

      const { normX, label } = getColumnNorm(event.key);
      const x = normX * window.innerWidth;
      const y = window.innerHeight - 28;
      const onFlood = portalFloodRef.current;

      // Feed 5-channel Hero Slice Visualizer
      dispatchSynthSlice(Math.min(4, Math.max(0, Math.floor(normX * 5))));

      // Main primary glyph bubble (inflates while key is held)
      const primaryRadius = event.key === " " ? 24 : 18 + Math.random() * 5;
      const mainBubble: KineticBubble = {
        id: ++bubbleSeq,
        code: event.code,
        label,
        x,
        y,
        radius: 10,
        targetRadius: primaryRadius,
        vy: 155 + Math.random() * 75,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 2.2 + Math.random() * 1.6,
        wobbleAmp: 22 + Math.random() * 24,
        life: 3.1,
        maxLife: 3.1,
        held: true,
        isAccent: true,
        onFlood,
      };
      bubblesRef.current.push(mainBubble);
      heldByCodeRef.current.set(event.code, mainBubble);

      // 2-3 companion crisp satellite micro-bubbles
      const satelliteCount = event.key === " " ? 4 : 2;
      for (let i = 0; i < satelliteCount; i += 1) {
        const satRadius = 3.5 + Math.random() * 5.5;
        bubblesRef.current.push({
          id: ++bubbleSeq,
          code: "",
          label: "",
          x: x + (Math.random() - 0.5) * 44,
          y: y + (Math.random() - 0.5) * 14,
          radius: satRadius,
          targetRadius: satRadius,
          vy: 195 + Math.random() * 120,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 3 + Math.random() * 2.2,
          wobbleAmp: 28 + Math.random() * 28,
          life: 1.8 + Math.random() * 0.9,
          maxLife: 2.7,
          held: false,
          isAccent: false,
          onFlood,
        });
      }

      studioSound.playTypeThock(normX, event.key === " " || isEnter);
      if (isPrintable) {
        checkSecretKeyword(event.key);
      }
      ensureLoop();
    };

    const releaseBubble = (code: string) => {
      const held = heldByCodeRef.current.get(code);
      if (held) {
        held.held = false;
        held.targetRadius = Math.max(held.targetRadius, held.radius);
        heldByCodeRef.current.delete(code);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      releaseBubble(event.code);
    };

    const releaseAll = () => {
      heldByCodeRef.current.forEach((b) => {
        b.held = false;
      });
      heldByCodeRef.current.clear();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.clearTimeout(hideTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
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

      {/* Minimalist auto-hiding WPM + Live Ticker Pill */}
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
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-[#111112]/90 px-4 py-2 text-[#F4F4EE] shadow-2xl backdrop-blur-md">
              <motion.span
                key={pulseTick}
                initial={{ scale: 1.7 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.16 }}
                className="h-2 w-2 rounded-full bg-[#0258FF]"
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
