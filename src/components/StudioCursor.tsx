import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

type CursorState =
  | { mode: "default" }
  | { mode: "interactive" }
  | { mode: "tag"; label: string }
  | { mode: "hidden" };

interface ClickEcho {
  id: number;
  x: number;
  y: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface StudioCursorProps {
  portalFloodActive?: boolean;
}

const MAX_TRAIL_POINTS = 15;

// Smoothly rounded triangular arrow matching the user's blue triangle reference image
const ROUNDED_TRIANGLE_PATH =
  "M 3 3.4 C 3 2.1 4.6 1.5 5.5 2.4 L 24.4 20.6 C 25.4 21.5 24.7 23.2 23.4 23.2 L 13.2 23.2 C 12.6 23.2 12 23.5 11.6 24 L 5.6 30.8 C 4.7 31.8 3 31.2 3 29.8 Z";

/**
 * Fluid Sculptural Triangular Cursor (inspired by user's blue triangle reference + OFF+BRAND):
 * - Smoothly rounded triangular silhouette with deep-to-sky cobalt gradient (#0258FF -> #7CAEFF).
 * - Soft spring-lagged translucent after-image triangle & fluid ink ribbon trail (no techy radar dashes).
 * - Gentle velocity tilt & organic triangular click ripple.
 * - Editorial context badge that unfolds smoothly when hovering interactive elements.
 */
export function StudioCursor({ portalFloodActive = false }: StudioCursorProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [state, setState] = useState<CursorState>({ mode: "default" });
  const [echoes, setEchoes] = useState<ClickEcho[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const echoIdRef = useRef(0);
  const stateModeRef = useRef<CursorState["mode"]>("default");

  // Precision pointer tip
  const rawX = useMotionValue(-120);
  const rawY = useMotionValue(-120);
  const tipX = useSpring(rawX, { stiffness: 1050, damping: 46, mass: 0.16 });
  const tipY = useSpring(rawY, { stiffness: 1050, damping: 46, mass: 0.16 });

  // Soft liquid after-image triangle
  const afterX = useSpring(rawX, { stiffness: 200, damping: 24, mass: 0.65 });
  const afterY = useSpring(rawY, { stiffness: 200, damping: 24, mass: 0.65 });

  // Smooth velocity-driven tilt
  const rawTilt = useMotionValue(0);
  const smoothTilt = useSpring(rawTilt, { stiffness: 240, damping: 22 });

  useEffect(() => {
    stateModeRef.current = state.mode;
  }, [state.mode]);

  useEffect(() => {
    if (prefersReduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [prefersReduced]);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled && !prefersReduced) {
      root.classList.add("custom-cursor-ready");
    } else {
      root.classList.remove("custom-cursor-ready");
    }
    return () => root.classList.remove("custom-cursor-ready");
  }, [enabled, prefersReduced]);

  useEffect(() => {
    if (!enabled) return;

    let tiltDecayTimer = 0;

    const onPointerMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;
      const now = performance.now();

      rawX.set(x);
      rawY.set(y);
      setVisible(true);

      const prev = lastPosRef.current;
      if (prev) {
        const dt = Math.max(8, now - prev.time);
        const vx = (x - prev.x) / dt;
        const vy = (y - prev.y) / dt;
        const tilt = Math.max(-15, Math.min(15, vx * 6.5 - vy * 2));
        rawTilt.set(tilt);
      }
      lastPosRef.current = { x, y, time: now };

      // Smooth ribbon from the center-notch of the triangle (+9, +19)
      trailRef.current.push({ x: x + 9, y: y + 19, life: 1 });
      if (trailRef.current.length > MAX_TRAIL_POINTS) {
        trailRef.current.shift();
      }

      window.clearTimeout(tiltDecayTimer);
      tiltDecayTimer = window.setTimeout(() => {
        rawTilt.set(0);
      }, 75);

      const el = event.target as HTMLElement | null;
      if (el?.closest("[data-cursor-hide='true']")) {
        setState((prevState) =>
          prevState.mode === "hidden" ? prevState : { mode: "hidden" }
        );
        return;
      }

      const labeled = el?.closest<HTMLElement>("[data-cursor]");
      if (labeled?.dataset.cursor) {
        const label = labeled.dataset.cursor;
        setState((prevState) =>
          prevState.mode === "tag" && prevState.label === label
            ? prevState
            : { mode: "tag", label }
        );
        return;
      }

      if (el?.closest("a, button")) {
        setState((prevState) =>
          prevState.mode === "interactive"
            ? prevState
            : { mode: "interactive" }
        );
        return;
      }

      setState((prevState) =>
        prevState.mode === "default" ? prevState : { mode: "default" }
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      setPressed(true);
      const id = ++echoIdRef.current;
      setEchoes((prev) => [
        ...prev.slice(-3),
        { id, x: event.clientX, y: event.clientY },
      ]);
      window.setTimeout(() => {
        setEchoes((prev) => prev.filter((item) => item.id !== id));
      }, 500);
    };

    const onPointerUp = () => setPressed(false);

    const onPointerLeave = () => {
      setVisible(false);
      setPressed(false);
      setState({ mode: "default" });
      rawTilt.set(0);
      lastPosRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    return () => {
      window.clearTimeout(tiltDecayTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled, rawTilt, rawX, rawY]);

  // Smooth ink ribbon trail
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const pts = trailRef.current;

      for (let i = pts.length - 1; i >= 0; i -= 1) {
        pts[i].life -= 0.085;
        if (pts[i].life <= 0) {
          pts.splice(i, 1);
        }
      }

      if (pts.length > 2 && stateModeRef.current !== "hidden") {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < pts.length; i += 1) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const ratio = i / pts.length;
          const alpha = Math.max(0, Math.min(0.42, ratio * p1.life * 0.45));

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(47, 118, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.6, ratio * 3.2);
          ctx.stroke();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled || prefersReduced) return null;

  const isTag = state.mode === "tag";
  const isInteractive = state.mode === "interactive" || isTag;
  const isHidden = state.mode === "hidden";

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] hidden h-full w-full md:block"
      />

      {/* Soft triangular click bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[59] hidden overflow-hidden md:block"
      >
        <AnimatePresence>
          {echoes.map((echo) => (
            <motion.svg
              key={echo.id}
              viewBox="0 0 28 34"
              initial={{ opacity: 0.65, scale: 0.85 }}
              animate={{ opacity: 0, scale: 2.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: echo.x - 3,
                top: echo.y - 3,
              }}
              className="absolute h-8 w-7 overflow-visible"
            >
              <path
                d={ROUNDED_TRIANGLE_PATH}
                fill="none"
                stroke={portalFloodActive ? "#FFFFFF" : "#3B82FF"}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
        </AnimatePresence>
      </div>

      {/* Soft spring-lagged translucent after-image triangle (fluid, non-techy) */}
      <motion.div
        aria-hidden="true"
        style={{ x: afterX, y: afterY }}
        animate={{
          opacity: visible ? (isHidden ? 0.15 : 0.34) : 0,
        }}
        transition={{ duration: 0.16 }}
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden md:block"
      >
        <motion.svg
          viewBox="0 0 28 34"
          animate={{
            scale: pressed ? 0.84 : isInteractive ? 1.24 : 1.06,
            rotate: isInteractive ? -5 : 0,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="-translate-x-[3px] -translate-y-[3px] h-8 w-7 overflow-visible"
        >
          <path
            d={ROUNDED_TRIANGLE_PATH}
            fill={portalFloodActive ? "rgba(255,255,255,0.45)" : "rgba(47,118,255,0.45)"}
          />
        </motion.svg>
      </motion.div>

      {/* Primary smoothly-rounded Cobalt gradient triangle pointer */}
      <motion.div
        aria-hidden="true"
        style={{ x: tipX, y: tipY }}
        animate={{
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.12 }}
        className="pointer-events-none fixed top-0 left-0 z-[61] hidden md:block"
      >
        <motion.div
          style={{
            rotate: smoothTilt,
            transformOrigin: "3px 3px",
          }}
          animate={{
            scale: pressed ? 0.84 : isInteractive ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative"
        >
          <svg
            viewBox="0 0 28 34"
            className="-translate-x-[3px] -translate-y-[3px] h-8 w-7 overflow-visible drop-shadow-[0_6px_14px_rgba(2,88,255,0.32)]"
          >
            <defs>
              <linearGradient
                id="fts-triangle-gradient"
                x1="3"
                y1="2"
                x2="16"
                y2="31"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0047FF" />
                <stop offset="52%" stopColor="#3B7BFF" />
                <stop offset="100%" stopColor="#8AB4FF" />
              </linearGradient>
              <linearGradient
                id="fts-triangle-obsidian"
                x1="3"
                y1="2"
                x2="16"
                y2="31"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#111112" />
                <stop offset="100%" stopColor="#2A2B2E" />
              </linearGradient>
            </defs>

            <path
              d={ROUNDED_TRIANGLE_PATH}
              fill={
                portalFloodActive
                  ? "url(#fts-triangle-obsidian)"
                  : "url(#fts-triangle-gradient)"
              }
              stroke={portalFloodActive ? "#FFFFFF" : "rgba(244,244,238,0.85)"}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>

          {/* Editorial context tag (warm bone / ink contrast, zero sci-fi chamfers) */}
          <AnimatePresence>
            {isTag && !isHidden && (
              <motion.div
                key={state.label}
                initial={{ opacity: 0, x: -6, y: 2, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.92 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="chamfer-sm absolute top-5 left-6 flex items-center bg-[#F4F4EE] px-2.5 py-1 text-[#111112] shadow-lg"
              >
                <span className="font-condensed text-[10px] leading-none font-extrabold tracking-[0.16em] uppercase whitespace-nowrap">
                  {state.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
