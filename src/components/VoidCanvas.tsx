import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface VoidCanvasProps {
  intensity?: "high" | "low";
}

interface DriftNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  cobalt: boolean;
}

/**
 * Lightweight interactive vector-telemetry canvas for obsidian scenes.
 * Draws fine perspective contour arcs and cursor-deflected tactical particles
 * at 60fps. Automatically halts when offscreen or under prefers-reduced-motion.
 */
export function VoidCanvas({ intensity = "high" }: VoidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let tick = 0;

    const nodeCount = intensity === "high" ? 42 : 24;
    const nodes: DriftNode[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (nodes.length === 0) {
        for (let i = 0; i < nodeCount; i += 1) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            size: Math.random() < 0.3 ? 2 : 1.2,
            cobalt: i % 4 === 0,
          });
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const draw = () => {
      if (isVisible && width > 0 && height > 0) {
        tick += 0.008;
        ctx.clearRect(0, 0, width, height);

        // Architectural orbital contour rings centered slightly off-axis
        const cx = width * 0.5 + Math.cos(tick * 0.6) * 18;
        const cy = height * 0.5 + Math.sin(tick * 0.5) * 14;
        const baseRadius = Math.min(width, height) * 0.34;

        ctx.lineWidth = 1;
        for (let r = 0; r < 3; r += 1) {
          const radius = baseRadius + r * (intensity === "high" ? 78 : 96);
          ctx.beginPath();
          ctx.strokeStyle =
            r === 1
              ? "rgba(2, 88, 255, 0.16)"
              : "rgba(255, 255, 255, 0.065)";
          ctx.arc(cx, cy, radius, tick * (r % 2 === 0 ? 1 : -0.8), tick * (r % 2 === 0 ? 1 : -0.8) + Math.PI * 1.45);
          ctx.stroke();
        }

        // Subtle horizontal/vertical laser axis lines anchored to pointer
        if (pointerX > 0 && pointerY > 0 && pointerX < width && pointerY < height) {
          ctx.strokeStyle = "rgba(2, 88, 255, 0.12)";
          ctx.beginPath();
          ctx.moveTo(0, pointerY);
          ctx.lineTo(width, pointerY);
          ctx.moveTo(pointerX, 0);
          ctx.lineTo(pointerX, height);
          ctx.stroke();
        }

        // Update and draw nodes + proximity filaments
        const linkDist = intensity === "high" ? 132 : 110;
        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i];
          const dxp = n.x - pointerX;
          const dyp = n.y - pointerY;
          const distP = Math.hypot(dxp, dyp);

          if (distP > 0 && distP < 140) {
            const push = (140 - distP) / 140;
            n.x += (dxp / distP) * push * 1.1;
            n.y += (dyp / distP) * push * 1.1;
          }

          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;

          ctx.fillStyle = n.cobalt
            ? "rgba(2, 88, 255, 0.72)"
            : "rgba(255, 255, 255, 0.28)";
          ctx.fillRect(n.x - n.size * 0.5, n.y - n.size * 0.5, n.size, n.size);

          for (let j = i + 1; j < nodes.length; j += 1) {
            const m = nodes[j];
            const dist = Math.hypot(n.x - m.x, n.y - m.y);
            if (dist < linkDist) {
              const alpha = (1 - dist / linkDist) * (n.cobalt || m.cobalt ? 0.22 : 0.08);
              ctx.strokeStyle =
                n.cobalt || m.cobalt
                  ? `rgba(2, 88, 255, ${alpha.toFixed(3)})`
                  : `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(m.x, m.y);
              ctx.stroke();
            }
          }
        }
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [intensity, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
