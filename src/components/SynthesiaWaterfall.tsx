import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { studioSound } from "@/lib/studioSound";
import { isTypingBurstActive, markTypingBurst } from "@/lib/sceneNavigation";

interface NoteBar {
  id: number;
  code: string;
  label: string;
  x: number;
  width: number;
  topY: number;
  bottomY: number;
  held: boolean;
  onFlood: boolean;
}

interface SynthBubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobblePhase: number;
  wobbleAmp: number;
  life: number;
  onFlood: boolean;
}

interface KeyFlare {
  x: number;
  width: number;
  life: number;
  onFlood: boolean;
}

interface SynthesiaWaterfallProps {
  portalFloodActive: boolean;
}

const KEYBOARD_ROWS = [
  "1234567890-=",
  "qwertyuiop[]",
  "asdfghjkl;'",
  "zxcvbnm,./",
] as const;

function getKeyLayout(key: string): {
  normX: number;
  width: number;
  label: string;
} {
  if (key === " ") {
    const jitter = (Math.random() - 0.5) * 0.24;
    return { normX: 0.5 + jitter, width: 46, label: "SPACE" };
  }
  if (key === "Enter") {
    return { normX: 0.9, width: 38, label: "RET" };
  }

  const lower = key.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const idx = row.indexOf(lower);
    if (idx !== -1) {
      const normX = 0.08 + (idx / (row.length - 1)) * 0.84;
      return { normX, width: 20, label: key.toUpperCase() };
    }
  }

  const code = lower.charCodeAt(0) || 65;
  return {
    normX: 0.1 + ((code % 15) / 14) * 0.8,
    width: 20,
    label: key.toUpperCase(),
  };
}

function drawRoundedPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

const RISE_SPEED_PX = 290;
const WPM_WINDOW_MS = 6000;
const HUD_IDLE_MS = 2600;

/**
 * Keyboard Synthesia Waterfall & Floating Bubble Synth + Live WPM Meter:
 * Type any text anywhere on the page to trigger rising Synthesia note beams mapped to QWERTY layout,
 * buoyant bubbles, pentatonic synth tones (when Sound is ON), and a clean auto-hiding WPM pill.
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

  const barsRef = useRef<NoteBar[]>([]);
  const bubblesRef = useRef<SynthBubble[]>([]);
  const flaresRef = useRef<KeyFlare[]>([]);
  const heldByCodeRef = useRef<Map<string, NoteBar>>(new Map());
  const timestampsRef = useRef<number[]>([]);
  const sessionStartRef = useRef<number>(0);

  useEffect(() => {
    portalFloodRef.current = portalFloodActive;
  }, [portalFloodActive]);

  useEffect(() => {
    if (prefersReduced || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();
    let hideTimer = 0;
    let noteSeq = 0;

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
      const words = count / 5;
      return Math.min(240, Math.round((words * 60000) / span));
    };

    const ensureLoop = () => {
      if (rafId !== 0) return;
      lastTime = performance.now();

      const render = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);

        // 1. Update & render bottom key flares
        const flares = flaresRef.current;
        for (let i = flares.length - 1; i >= 0; i -= 1) {
          const flare = flares[i];
          flare.life -= dt * 2.6;
          if (flare.life <= 0) {
            flares.splice(i, 1);
            continue;
          }
          const grad = ctx.createRadialGradient(
            flare.x,
            h - 4,
            1,
            flare.x,
            h - 4,
            flare.width * 2.2
          );
          if (flare.onFlood) {
            grad.addColorStop(
              0,
              `rgba(255, 255, 255, ${(flare.life * 0.72).toFixed(3)})`
            );
            grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          } else {
            grad.addColorStop(
              0,
              `rgba(2, 88, 255, ${(flare.life * 0.72).toFixed(3)})`
            );
            grad.addColorStop(1, "rgba(2, 88, 255, 0)");
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(flare.x, h - 4, flare.width * 2.2, Math.PI, 0);
          ctx.fill();
        }

        // 2. Update & render Synthesia rising note bars
        const bars = barsRef.current;
        for (let i = bars.length - 1; i >= 0; i -= 1) {
          const bar = bars[i];
          bar.topY -= RISE_SPEED_PX * dt;
          if (!bar.held) {
            bar.bottomY -= RISE_SPEED_PX * dt;
          }

          if (bar.bottomY < -20) {
            bars.splice(i, 1);
            continue;
          }

          const height = Math.max(10, bar.bottomY - bar.topY);
          const midY = (bar.topY + bar.bottomY) / 2;
          const verticalFade = Math.max(
            0,
            Math.min(1, midY / (h * 0.42))
          );
          const alpha = Math.max(0.05, verticalFade * 0.9);

          const xLeft = bar.x - bar.width / 2;
          const grad = ctx.createLinearGradient(0, bar.topY, 0, bar.bottomY);
          if (bar.onFlood) {
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
            grad.addColorStop(
              1,
              `rgba(244, 244, 238, ${(alpha * 0.45).toFixed(3)})`
            );
          } else {
            grad.addColorStop(
              0,
              `rgba(92, 154, 255, ${alpha.toFixed(3)})`
            );
            grad.addColorStop(
              0.45,
              `rgba(2, 88, 255, ${(alpha * 0.9).toFixed(3)})`
            );
            grad.addColorStop(
              1,
              `rgba(2, 88, 255, ${(alpha * 0.35).toFixed(3)})`
            );
          }

          drawRoundedPill(ctx, xLeft, bar.topY, bar.width, height, 9);
          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle crisp outer rim
          ctx.strokeStyle = bar.onFlood
            ? `rgba(255, 255, 255, ${(alpha * 0.9).toFixed(3)})`
            : `rgba(140, 186, 255, ${(alpha * 0.65).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Tiny character glyph at note crown
          if (height >= 16 && bar.label !== "SPACE") {
            ctx.fillStyle = bar.onFlood
              ? `rgba(17, 17, 18, ${alpha.toFixed(3)})`
              : `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.font = '700 10px "Barlow Condensed", sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(bar.label, bar.x, bar.topY + 4);
          }
        }

        // 3. Update & render buoyant Synthesia bubbles
        const bubbles = bubblesRef.current;
        for (let i = bubbles.length - 1; i >= 0; i -= 1) {
          const b = bubbles[i];
          b.y -= b.vy * dt;
          b.wobblePhase += dt * 4.2;
          b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * dt;
          b.life -= dt * 0.48;

          if (b.life <= 0 || b.y < -12) {
            bubbles.splice(i, 1);
            continue;
          }

          const alpha = Math.max(0, Math.min(0.75, b.life * 0.78));
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.onFlood
            ? `rgba(255, 255, 255, ${(alpha * 0.35).toFixed(3)})`
            : `rgba(2, 88, 255, ${(alpha * 0.28).toFixed(3)})`;
          ctx.fill();

          ctx.strokeStyle = b.onFlood
            ? `rgba(255, 255, 255, ${(alpha * 0.8).toFixed(3)})`
            : `rgba(92, 154, 255, ${(alpha * 0.75).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (bars.length > 0 || bubbles.length > 0 || flares.length > 0) {
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
      }, HUD_IDLE_MS);
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
        scheduleHudHide();
        return;
      }

      const isPrintable = event.key.length === 1;
      const isEnter = event.key === "Enter";
      if (!isPrintable && !isEnter) return;

      // Preserve idle 1 / 2 / 3 scene jump shortcuts when user isn't mid-typing
      if (
        (event.key === "1" || event.key === "2" || event.key === "3") &&
        !isTypingBurstActive()
      ) {
        return;
      }

      markTypingBurst();

      if (event.repeat) return;

      const now = performance.now();
      if (sessionStartRef.current === 0 || now - (timestampsRef.current.at(-1) ?? 0) > HUD_IDLE_MS) {
        sessionStartRef.current = now;
        timestampsRef.current = [];
      }

      timestampsRef.current.push(now);
      const nextWpm = computeWpm(now);

      setWpm(nextWpm);
      setHudVisible(true);
      setPulseTick((n) => n + 1);
      setTicker((prev) => {
        const appended = isEnter ? "↵ " : event.key;
        return (prev + appended).slice(-18);
      });
      scheduleHudHide();

      const { normX, width, label } = getKeyLayout(event.key);
      const x = normX * window.innerWidth;
      const h = window.innerHeight;
      const onFlood = portalFloodRef.current;

      const bar: NoteBar = {
        id: ++noteSeq,
        code: event.code,
        label,
        x,
        width,
        topY: h - 12,
        bottomY: h,
        held: true,
        onFlood,
      };
      barsRef.current.push(bar);
      heldByCodeRef.current.set(event.code, bar);

      flaresRef.current.push({
        x,
        width,
        life: 1,
        onFlood,
      });

      const bubbleCount = event.key === " " ? 5 : 3;
      for (let i = 0; i < bubbleCount; i += 1) {
        bubblesRef.current.push({
          x: x + (Math.random() - 0.5) * (width + 18),
          y: h - 6 - Math.random() * 14,
          radius: 2.4 + Math.random() * 4.4,
          vy: 140 + Math.random() * 130,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleAmp: 18 + Math.random() * 26,
          life: 0.9 + Math.random() * 0.55,
          onFlood,
        });
      }

      studioSound.playNote(normX);
      ensureLoop();
    };

    const releaseKey = (code: string) => {
      const held = heldByCodeRef.current.get(code);
      if (held) {
        held.held = false;
        heldByCodeRef.current.delete(code);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      releaseKey(event.code);
    };

    const releaseAll = () => {
      heldByCodeRef.current.forEach((bar) => {
        bar.held = false;
      });
      heldByCodeRef.current.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.clearTimeout(hideTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
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

      {/* Minimalist auto-hiding WPM + Live Synth Ticker Pill */}
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
