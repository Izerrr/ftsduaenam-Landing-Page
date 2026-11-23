import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface FtsLogoProps {
  className?: string;
  compact?: boolean;
  decorative?: boolean;
  trackPointer?: boolean;
}

/**
 * Eerie minimalist Twin-V Eclipse / Watcher Sigil for ftsduaenam (Vikolvere & Verivela · XXVI).
 * Two sharp opposing V-blades form a stark diamond eye-aperture with a cold Electric Cobalt slit iris
 * that subtly follows the pointer across the screen when trackPointer is enabled.
 */
export function FtsLogo({
  className = "h-9 w-auto",
  compact = false,
  decorative = true,
  trackPointer = false,
}: FtsLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const irisRef = useRef<SVGGElement>(null);
  const prefersReduced = Boolean(useReducedMotion());

  useEffect(() => {
    if (!trackPointer || prefersReduced) return;

    const onPointerMove = (event: PointerEvent) => {
      if (!svgRef.current || !irisRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + (compact ? rect.width * 0.5 : 22);
      const cy = rect.top + rect.height * 0.5;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(3.6, Math.hypot(dx, dy) / 140);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist * 0.65;
      irisRef.current.setAttribute(
        "transform",
        `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`
      );
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [compact, prefersReduced, trackPointer]);

  if (compact) {
    return (
      <svg
        ref={svgRef}
        viewBox="0 0 48 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden={decorative ? true : undefined}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "ftsduaenam sigil"}
      >
        {!decorative && <title>ftsduaenam sigil</title>}
        {/* Sharp outer Twin-V eye diamond */}
        <path
          d="M3 22L24 6L45 22L24 38Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Inner faint eclipse ring */}
        <circle
          cx="24"
          cy="22"
          r="8.2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.55"
        />
        {/* Tracking vertical slit iris */}
        <g ref={irisRef}>
          <path
            d="M24 12.5L27 22L24 31.5L21 22Z"
            fill="var(--logo-accent, #0258FF)"
          />
          <circle cx="24" cy="22" r="1.5" fill="currentColor" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 256 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "ftsduaenam"}
    >
      {!decorative && <title>ftsduaenam</title>}

      {/* Emblem: Twin-V Eclipse Watcher Sigil */}
      <g>
        <path
          d="M2 22L22 7L42 22L22 37Z"
          stroke="currentColor"
          strokeWidth="1.9"
        />
        <circle
          cx="22"
          cy="22"
          r="7.4"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.55"
        />
        <g ref={irisRef}>
          <path
            d="M22 13.5L24.8 22L22 30.5L19.2 22Z"
            fill="var(--logo-accent, #0258FF)"
          />
          <circle cx="22" cy="22" r="1.4" fill="currentColor" />
        </g>
      </g>

      {/* Stark editorial wordmark */}
      <text
        x="52"
        y="29.5"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-condensed), sans-serif",
          fontSize: "25px",
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        FTSDUAENAM
      </text>

      {/* Subtle Roman XXVI stamp */}
      <text
        x="212"
        y="28"
        fill="var(--logo-accent, #0258FF)"
        style={{
          fontFamily: "var(--font-editorial), Georgia, serif",
          fontStyle: "italic",
          fontSize: "19px",
          letterSpacing: "0.06em",
        }}
      >
        xxvi
      </text>
    </svg>
  );
}
