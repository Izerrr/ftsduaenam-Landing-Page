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

const MAX_TRAIL_POINTS = 16;

// Classic asymmetric notched pointer silhouette matching the reference triangle
const POINTER_PATH =
  "M 2.2 1.8 L 2.2 27.6 L 9.8 20.2 L 21.4 20.2 Z";

/**
 * Bespoke Triangular OFF+BRAND Studio Pointer (desktop fine-pointer only):
 * 1. Primary sculpted triangular arrow with Electric Cobalt gradient (#0258FF -> #5C9AFF),
 *    internal facet split line, and dynamic velocity banking tilt.
 * 2. Spring-lagged wireframe ghost triangle that locks onto interactive targets.
 * 3. Triangular vector click shockwaves on pointerdown.
 * 4. Chamfered architectural context tag ([ OPEN ], [ ARCHIVE ], [ COPY ]) attached to the tail.
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

  // Precision tip position
  const rawX = useMotionValue(-120);
  const rawY = useMotionValue(-120);
  const tipX = useSpring(rawX, { stiffness: 1100, damping: 48, mass: 0.15 });
  const tipY = useSpring(rawY, { stiffness: 1100, damping: 48, mass: 0.15 });

  // Elastic trailing ghost wireframe triangle
  const ghostX = useSpring(rawX, { stiffness: 220, damping: 24, mass: 0.6 });
  const ghostY = useSpring(rawY, { stiffness: 220, damping: 24, mass: 0.6 });

  // Velocity-driven aerodynamic banking tilt
  const rawBank = useMotionValue(0);
  const bankAngle = useSpring(rawBank, { stiffness: 260, damping: 20 });

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

    let bankDecayTimer = 0;

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
        // Subtle aerodynamic bank into horizontal/vertical velocity
        const tilt = Math.max(-18, Math.min(18, vx * 7.5 - vy * 2.5));
        rawBank.set(tilt);
      }
      lastPosRef.current = { x, y, time: now };

      // Feed tapered cobalt wake ribbon from the notch tail (+7, +17)
      trailRef.current.push({ x: x + 7, y: y + 17, life: 1 });
      if (trailRef.current.length > MAX_TRAIL_POINTS) {
        trailRef.current.shift();
      }

      window.clearTimeout(bankDecayTimer);
      bankDecayTimer = window.setTimeout(() => {
        rawBank.set(0);
      }, 70);

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
      }, 480);
    };

    const onPointerUp = () => setPressed(false);

    const onPointerLeave = () => {
      setVisible(false);
      setPressed(false);
      setState({ mode: "default" });
      rawBank.set(0);
      lastPosRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    return () => {
      window.clearTimeout(bankDecayTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled, rawBank, rawX, rawY]);

  // Tapered speed ribbon trailing behind the triangular pointer tail
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
          const alpha = Math.max(0, Math.min(0.55, ratio * p1.life * 0.58));

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(2, 88, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.5, ratio * 2.6);
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
      {/* Tapered Cobalt wake ribbon */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] hidden h-full w-full md:block"
      />

      {/* Triangular vector click echoes */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[59] hidden overflow-hidden md:block"
      >
        <AnimatePresence>
          {echoes.map((echo) => (
            <motion.svg
              key={echo.id}
              viewBox="0 0 28 32"
              initial={{ opacity: 0.85, scale: 0.75 }}
              animate={{ opacity: 0, scale: 2.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: echo.x - 4,
                top: echo.y - 4,
              }}
              className="absolute h-8 w-7 overflow-visible"
            >
              <path
                d={POINTER_PATH}
                fill="none"
                stroke={portalFloodActive ? "#FFFFFF" : "#0258FF"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
        </AnimatePresence>
      </div>

      {/* Spring-lagged wireframe ghost triangle */}
      <motion.div
        aria-hidden="true"
        style={{ x: ghostX, y: ghostY }}
        animate={{
          opacity: visible ? (isHidden ? 0.25 : 0.72) : 0,
        }}
        transition={{ duration: 0.16 }}
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden md:block"
      >
        <motion.svg
          viewBox="0 0 28 32"
          animate={{
            scale: pressed ? 0.78 : isInteractive ? 1.32 : 1.08,
            rotate: isInteractive ? -6 : 0,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="-translate-x-[2px] -translate-y-[2px] h-8 w-7 overflow-visible"
        >
          <path
            d={POINTER_PATH}
            fill="none"
            stroke={portalFloodActive ? "#FFFFFF" : "#5C9AFF"}
            strokeWidth={isInteractive ? "1.4" : "1"}
            strokeDasharray={isInteractive ? "none" : "3 3"}
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>

      {/* Primary sculpted triangular arrow pointer + chamfered studio action tag */}
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
            rotate: bankAngle,
            transformOrigin: "2px 2px",
          }}
          animate={{
            scale: pressed ? 0.82 : isInteractive ? 1.08 : 1,
          }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
          className="relative"
        >
          <svg
            viewBox="0 0 28 32"
            className="-translate-x-[2px] -translate-y-[2px] h-8 w-7 overflow-visible drop-shadow-[0_4px_10px_rgba(2,88,255,0.38)]"
          >
            <defs>
              <linearGradient
                id="fts-cursor-cobalt"
                x1="2"
                y1="2"
                x2="18"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0258FF" />
                <stop offset="58%" stopColor="#2F76FF" />
                <stop offset="100%" stopColor="#75A8FF" />
              </linearGradient>
              <linearGradient
                id="fts-cursor-obsidian"
                x1="2"
                y1="2"
                x2="18"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#111112" />
                <stop offset="100%" stopColor="#27282B" />
              </linearGradient>
            </defs>

            {/* Main triangular body matching user's reference image */}
            <path
              d={POINTER_PATH}
              fill={
                portalFloodActive
                  ? "url(#fts-cursor-obsidian)"
                  : "url(#fts-cursor-cobalt)"
              }
              stroke="#F4F4EE"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />

            {/* Internal architectural facet ridge line from tip to notch */}
            <path
              d="M 2.5 2.4 L 9.8 20.2"
              stroke="rgba(244,244,238,0.45)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />

            {/* Precision hot-spot apex dot */}
            <circle cx="2.2" cy="2.2" r="1.3" fill="#F4F4EE" />
          </svg>

          {/* Attached chamfered studio context tag (replaces generic round pill) */}
          <AnimatePresence>
            {isTag && !isHidden && (
              <motion.div
                key={state.label}
                initial={{ opacity: 0, x: -6, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.9 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className={`chamfer-sm absolute top-5 left-6 flex items-center gap-1.5 border px-2.5 py-1 shadow-xl ${
                  portalFloodActive
                    ? "border-white bg-[#111112] text-[#F4F4EE]"
                    : "border-[#5C9AFF]/60 bg-[#111112] text-[#F4F4EE]"
                }`}
              >
                <span className="h-1.5 w-1.5 bg-[#0258FF]" />
                <span className="font-condensed text-[10px] leading-none font-extrabold tracking-[0.18em] uppercase whitespace-nowrap">
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
