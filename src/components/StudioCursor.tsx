import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

type CursorState =
  | { mode: "dot" }
  | { mode: "ring" }
  | { mode: "pill"; label: string }
  | { mode: "hidden" };

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

const MAX_TRAIL_POINTS = 18;

/**
 * High-craft OFF+BRAND studio cursor (desktop fine-pointer only):
 * 1. Dual-layer spring physics: snappy core dot + elastic outer halo that stretches & rotates
 *    aerodynamically along your pointer velocity vector.
 * 2. Tapered Electric Cobalt (#0258FF) speed-ribbon canvas trail that appears only during motion.
 * 3. Physical click compression + expanding ripple shockwave on pointerdown.
 * 4. Context-aware morph into a crisp mix-blend-difference ring or labeled studio pill.
 */
export function StudioCursor() {
  const prefersReduced = Boolean(useReducedMotion());
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [state, setState] = useState<CursorState>({ mode: "dot" });
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const rippleIdRef = useRef(0);
  const stateModeRef = useRef<CursorState["mode"]>("dot");

  // Snappy core position
  const rawX = useMotionValue(-120);
  const rawY = useMotionValue(-120);
  const coreX = useSpring(rawX, { stiffness: 900, damping: 44, mass: 0.2 });
  const coreY = useSpring(rawY, { stiffness: 900, damping: 44, mass: 0.2 });

  // Heavier elastic trailing halo
  const haloX = useSpring(rawX, { stiffness: 210, damping: 24, mass: 0.65 });
  const haloY = useSpring(rawY, { stiffness: 210, damping: 24, mass: 0.65 });

  // Velocity-driven aerodynamic stretch & rotation for the outer halo
  const rawAngle = useMotionValue(0);
  const rawStretchX = useMotionValue(1);
  const rawStretchY = useMotionValue(1);
  const stretchX = useSpring(rawStretchX, { stiffness: 240, damping: 20 });
  const stretchY = useSpring(rawStretchY, { stiffness: 240, damping: 20 });

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

  // Pointer tracking, velocity squash-stretch, and click ripples
  useEffect(() => {
    if (!enabled) return;

    let decayTimer = 0;

    const onPointerMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;
      const now = performance.now();

      rawX.set(x);
      rawY.set(y);
      setVisible(true);

      // Compute velocity vector for subtle aerodynamic halo squash & stretch
      const prev = lastPosRef.current;
      if (prev) {
        const dt = Math.max(8, now - prev.time);
        const vx = (x - prev.x) / dt;
        const vy = (y - prev.y) / dt;
        const speed = Math.hypot(vx, vy);

        if (speed > 0.12 && stateModeRef.current === "dot") {
          const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
          const factor = Math.min(0.42, speed * 0.22);
          rawAngle.set(angleDeg);
          rawStretchX.set(1 + factor);
          rawStretchY.set(1 - factor * 0.55);
        }
      }
      lastPosRef.current = { x, y, time: now };

      // Push point to tapered cobalt speed ribbon
      trailRef.current.push({ x, y, life: 1 });
      if (trailRef.current.length > MAX_TRAIL_POINTS) {
        trailRef.current.shift();
      }

      window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => {
        rawStretchX.set(1);
        rawStretchY.set(1);
      }, 75);

      const el = event.target as HTMLElement | null;
      if (el?.closest("[data-cursor-hide='true']")) {
        rawStretchX.set(1);
        rawStretchY.set(1);
        setState((prevState) =>
          prevState.mode === "hidden" ? prevState : { mode: "hidden" }
        );
        return;
      }

      const labeled = el?.closest<HTMLElement>("[data-cursor]");
      if (labeled?.dataset.cursor) {
        const label = labeled.dataset.cursor;
        rawStretchX.set(1);
        rawStretchY.set(1);
        setState((prevState) =>
          prevState.mode === "pill" && prevState.label === label
            ? prevState
            : { mode: "pill", label }
        );
        return;
      }

      if (el?.closest("a, button")) {
        rawStretchX.set(1);
        rawStretchY.set(1);
        setState((prevState) =>
          prevState.mode === "ring" ? prevState : { mode: "ring" }
        );
        return;
      }

      setState((prevState) =>
        prevState.mode === "dot" ? prevState : { mode: "dot" }
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      setPressed(true);
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-3), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 480);
    };

    const onPointerUp = () => setPressed(false);

    const onPointerLeave = () => {
      setVisible(false);
      setPressed(false);
      setState({ mode: "dot" });
      rawStretchX.set(1);
      rawStretchY.set(1);
      lastPosRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    return () => {
      window.clearTimeout(decayTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled, rawAngle, rawStretchX, rawStretchY, rawX, rawY]);

  // Tapered Electric Cobalt ribbon trail rendered smoothly at 60fps+ on canvas
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
        pts[i].life -= 0.075;
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
          const alpha = Math.max(0, Math.min(0.62, ratio * p1.life * 0.65));

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(2, 88, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.6, ratio * 3.4);
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

  const isPill = state.mode === "pill";
  const isRing = state.mode === "ring";
  const isHidden = state.mode === "hidden";

  return (
    <>
      {/* Tapered Electric Cobalt speed ribbon trail */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] hidden h-full w-full md:block"
      />

      {/* Expanding click shockwave ripples */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[59] hidden overflow-hidden md:block"
      >
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.7, scale: 0.25 }}
              animate={{ opacity: 0, scale: 2.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: ripple.x - 18,
                top: ripple.y - 18,
              }}
              className="absolute h-9 w-9 rounded-full border border-[#0258FF]"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Snappy precision inner core dot */}
      <motion.div
        aria-hidden="true"
        style={{ x: coreX, y: coreY }}
        animate={{
          opacity: visible && !isHidden && !isPill ? 1 : 0,
          scale: pressed ? 0.65 : isRing ? 0.55 : 1,
        }}
        transition={{ duration: 0.14 }}
        className="pointer-events-none fixed top-0 left-0 z-[61] hidden mix-blend-difference md:block"
      >
        <div className="-translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white" />
      </motion.div>

      {/* Elastic velocity-stretched outer halo / morphing studio pill */}
      <motion.div
        aria-hidden="true"
        style={{
          x: haloX,
          y: haloY,
        }}
        animate={{
          opacity: visible && !isHidden ? 1 : 0,
        }}
        transition={{ duration: 0.16 }}
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden mix-blend-difference md:block"
      >
        <motion.div
          style={{
            rotate: isPill || isRing ? 0 : rawAngle,
            scaleX: isPill || isRing ? 1 : stretchX,
            scaleY: isPill || isRing ? 1 : stretchY,
          }}
        >
          <motion.div
            animate={{
              width: isPill ? 90 : isRing ? 48 : 30,
              height: isPill ? 34 : isRing ? 48 : 30,
              x: isPill ? -45 : isRing ? -24 : -15,
              y: isPill ? -17 : isRing ? -24 : -15,
              scale: pressed ? 0.84 : 1,
              backgroundColor: isPill
                ? "rgba(255,255,255,1)"
                : "rgba(255,255,255,0)",
              borderWidth: isPill ? 0 : isRing ? 1.75 : 1.25,
            }}
            transition={{ type: "spring", stiffness: 390, damping: 28 }}
            className="flex items-center justify-center rounded-full border-white text-[#111112]"
          >
            {isPill && (
              <span className="font-condensed text-[11px] font-extrabold tracking-[0.16em] uppercase whitespace-nowrap">
                {state.label}
              </span>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
