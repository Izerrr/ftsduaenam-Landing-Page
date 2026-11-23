import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface VoidCanvasProps {
  intensity?: "high" | "low";
}

interface AshMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  cobalt: boolean;
}

/**
 * Uncanny abyssal atmosphere canvas for dark scenes.
 * Renders slow-drifting spectral ash motes, faint hypnotic eclipse rings that subtly lean
 * toward the pointer, and occasional ultra-thin analog signal traces (restrained, 60fps).
 * Halts cleanly when offscreen or under prefers-reduced-motion.
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
    let targetX = 0.5;
    let targetY = 0.5;
    let smoothX = 0.5;
    let smoothY = 0.5;
    let tick = 0;

    const moteCount = intensity === "high" ? 48 : 26;
    const motes: AshMote[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (motes.length === 0) {
        for (let i = 0; i < moteCount; i += 1) {
          motes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.16,
            vy: -0.06 - Math.random() * 0.18,
            radius: 0.7 + Math.random() * 1.4,
            alpha: 0.08 + Math.random() * 0.24,
            cobalt: i % 6 === 0,
          });
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      targetX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      targetY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
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

    const draw = () => {
      if (isVisible && width > 0 && height > 0) {
        tick += 0.0045;
        smoothX += (targetX - smoothX) * 0.035;
        smoothY += (targetY - smoothY) * 0.035;

        ctx.clearRect(0, 0, width, height);

        // Eerie concentric eclipse halo leaning slowly toward the visitor's pointer
        const cx = width * (0.5 + (smoothX - 0.5) * 0.08);
        const cy = height * (0.5 + (smoothY - 0.5) * 0.08);
        const minSide = Math.min(width, height);

        for (let r = 0; r < 4; r += 1) {
          const radius = minSide * (0.22 + r * 0.12) + Math.sin(tick + r) * 5;
          ctx.beginPath();
          ctx.lineWidth = r === 1 ? 1.1 : 0.75;
          ctx.strokeStyle =
            r === 1
              ? "rgba(2, 88, 255, 0.15)"
              : `rgba(242, 242, 238, ${(0.055 - r * 0.01).toFixed(3)})`;
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Faint horizontal analog signal tear line drifting slowly down
        const scanY = ((tick * 52) % 1) * height;
        ctx.fillStyle = "rgba(2, 88, 255, 0.06)";
        ctx.fillRect(0, scanY, width, 1);

        // Slow upward-drifting spectral dust motes
        const px = smoothX * width;
        const py = smoothY * height;

        for (let i = 0; i < motes.length; i += 1) {
          const m = motes[i];
          const dx = m.x - px;
          const dy = m.y - py;
          const dist = Math.hypot(dx, dy);

          // Motes glow brighter inside the pointer flashlight beam
          const proximity = dist < 240 ? 1 - dist / 240 : 0;

          m.x += m.vx + Math.sin(tick * 2 + i) * 0.06;
          m.y += m.vy;

          if (m.y < -4) {
            m.y = height + 4;
            m.x = Math.random() * width;
          }
          if (m.x < -4) m.x = width + 4;
          if (m.x > width + 4) m.x = -4;

          const effectiveAlpha = Math.min(0.85, m.alpha + proximity * 0.42);
          ctx.beginPath();
          ctx.fillStyle = m.cobalt
            ? `rgba(92, 154, 255, ${effectiveAlpha.toFixed(3)})`
            : `rgba(242, 242, 238, ${effectiveAlpha.toFixed(3)})`;
          ctx.arc(m.x, m.y, m.radius + proximity * 0.7, 0, Math.PI * 2);
          ctx.fill();
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
