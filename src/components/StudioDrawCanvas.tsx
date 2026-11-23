import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { subscribeClearInk, toggleStudioInvert } from "@/lib/studioEvents";

interface DrawPoint {
  x: number;
  y: number;
  width: number;
  bornAt: number;
}

interface DrawStroke {
  points: DrawPoint[];
  onFlood: boolean;
}

interface StudioDrawCanvasProps {
  portalFloodActive: boolean;
}

const STROKE_LIFETIME_MS = 3800;

/**
 * Freehand Hold-and-Drag Cobalt Light Brush with Scroll-Inertia Physics:
 * Click, hold, and drag anywhere on open canvas space (outside buttons/links)
 * to sketch fluid OFF+BRAND vector strokes that drift gently with page scroll momentum
 * and dissolve cleanly after ~3.8s (or Esc / "clear").
 */
export function StudioDrawCanvas({ portalFloodActive }: StudioDrawCanvasProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<DrawStroke[]>([]);
  const activeStrokeRef = useRef<DrawStroke | null>(null);
  const portalFloodRef = useRef(portalFloodActive);

  useEffect(() => {
    portalFloodRef.current = portalFloodActive;
  }, [portalFloodActive]);

  useEffect(() => {
    if (prefersReduced || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let isPointerDown = false;
    let hasDragged = false;
    let startX = 0;
    let startY = 0;
    let lastPoint: { x: number; y: number; time: number } | null = null;
    let previousUserSelect = "";
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

    const ensureLoop = () => {
      if (rafId !== 0) return;

      const render = () => {
        const now = performance.now();
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Apply smoothed inertial scroll drift to non-active strokes
        const shiftY = pendingScrollShift * 0.24;
        pendingScrollShift *= 0.76;
        if (Math.abs(pendingScrollShift) < 0.05) pendingScrollShift = 0;

        const strokes = strokesRef.current;
        for (let s = strokes.length - 1; s >= 0; s -= 1) {
          const stroke = strokes[s];
          const isCurrent = stroke === activeStrokeRef.current;

          for (let p = stroke.points.length - 1; p >= 0; p -= 1) {
            const pt = stroke.points[p];
            if (now - pt.bornAt >= STROKE_LIFETIME_MS) {
              stroke.points.splice(p, 1);
            } else if (!isCurrent && shiftY !== 0) {
              pt.y -= shiftY;
            }
          }

          if (stroke.points.length < 2) {
            if (!isCurrent) {
              strokes.splice(s, 1);
            }
            continue;
          }

          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          for (let i = 1; i < stroke.points.length; i += 1) {
            const p0 = stroke.points[i - 1];
            const p1 = stroke.points[i];
            const age = now - p1.bornAt;
            const life = Math.max(0, 1 - age / STROKE_LIFETIME_MS);
            const alpha = Math.pow(life, 1.5);
            if (alpha <= 0.01) continue;

            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            const prevMidX =
              i > 1 ? (stroke.points[i - 2].x + p0.x) / 2 : p0.x;
            const prevMidY =
              i > 1 ? (stroke.points[i - 2].y + p0.y) / 2 : p0.y;

            ctx.beginPath();
            ctx.moveTo(prevMidX, prevMidY);
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            ctx.lineWidth = p1.width * (0.45 + 0.55 * life);
            ctx.strokeStyle = stroke.onFlood
              ? `rgba(255, 255, 255, ${(alpha * 0.9).toFixed(3)})`
              : `rgba(2, 88, 255, ${(alpha * 0.88).toFixed(3)})`;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(prevMidX, prevMidY);
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            ctx.lineWidth = Math.max(0.8, p1.width * 0.34 * life);
            ctx.strokeStyle = stroke.onFlood
              ? `rgba(255, 255, 255, ${alpha.toFixed(3)})`
              : `rgba(92, 154, 255, ${(alpha * 0.92).toFixed(3)})`;
            ctx.stroke();
          }
        }

        if (strokesRef.current.length > 0 || activeStrokeRef.current) {
          rafId = window.requestAnimationFrame(render);
        } else {
          rafId = 0;
        }
      };

      rafId = window.requestAnimationFrame(render);
    };

    const clearAll = () => {
      strokesRef.current = [];
      activeStrokeRef.current = null;
      pendingScrollShift = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const stopDrawing = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      activeStrokeRef.current = null;
      lastPoint = null;
      if (hasDragged) {
        document.body.style.userSelect = previousUserSelect;
        hasDragged = false;
      }
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      if (strokesRef.current.length > 0) {
        pendingScrollShift = Math.max(-180, Math.min(180, pendingScrollShift + delta * 0.55));
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.pointerType === "touch") return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "a, button, input, textarea, select, [role='button'], #fullscreen-studio-menu"
        )
      ) {
        return;
      }

      isPointerDown = true;
      hasDragged = false;
      startX = event.clientX;
      startY = event.clientY;
      lastPoint = { x: startX, y: startY, time: performance.now() };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isPointerDown || !lastPoint) return;

      const x = event.clientX;
      const y = event.clientY;

      if (!hasDragged) {
        const distFromStart = Math.hypot(x - startX, y - startY);
        if (distFromStart < 5) return;

        hasDragged = true;
        previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";

        const stroke: DrawStroke = {
          onFlood: portalFloodRef.current,
          points: [
            { x: startX, y: startY, width: 4.5, bornAt: performance.now() },
          ],
        };
        activeStrokeRef.current = stroke;
        strokesRef.current.push(stroke);
        ensureLoop();
      }

      const stroke = activeStrokeRef.current;
      if (!stroke) return;

      const now = performance.now();
      const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);
      if (dist < 2.2) return;

      const dt = Math.max(6, now - lastPoint.time);
      const speed = dist / dt;
      const dynamicWidth = Math.max(2.2, Math.min(9.2, 8.6 - speed * 1.9));

      stroke.points.push({ x, y, width: dynamicWidth, bornAt: now });
      lastPoint = { x, y, time: now };
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearAll();
        toggleStudioInvert(false);
      }
    };

    const unsubscribeClear = subscribeClearInk(clearAll);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", stopDrawing, { passive: true });
    window.addEventListener("pointercancel", stopDrawing, { passive: true });
    window.addEventListener("blur", stopDrawing, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      stopDrawing();
      unsubscribeClear();
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrawing);
      window.removeEventListener("pointercancel", stopDrawing);
      window.removeEventListener("blur", stopDrawing);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[36] h-full w-full"
    />
  );
}
