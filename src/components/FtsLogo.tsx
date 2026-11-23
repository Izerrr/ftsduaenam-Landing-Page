interface FtsLogoProps {
  className?: string;
  compact?: boolean;
  decorative?: boolean;
}

/**
 * Fierce geometric monolith sigil + razor wordmark for ftsduaenam (XXVI).
 * Features a chamfered twin-blade emblem sliced by an Electric Cobalt slash.
 * Uses currentColor for the frame/wordmark so it adapts instantly across Obsidian, Bone, and Cobalt Flood.
 */
export function FtsLogo({
  className = "h-9 w-auto",
  compact = false,
  decorative = true,
}: FtsLogoProps) {
  if (compact) {
    return (
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden={decorative ? true : undefined}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "ftsduaenam sigil"}
      >
        {!decorative && <title>ftsduaenam sigil</title>}
        {/* Chamfered tactical monolith frame */}
        <polygon
          points="3,3 33,3 41,11 41,41 11,41 3,33"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        {/* Sharp diagonal twin-V blade slash */}
        <polygon points="11,34 26,10 33,10 18,34" fill="var(--logo-accent, #0258FF)" />
        <rect x="10" y="11" width="11" height="3" fill="currentColor" />
        <rect x="23" y="30" width="11" height="3" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 248 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "ftsduaenam"}
    >
      {!decorative && <title>ftsduaenam</title>}

      {/* Emblem: Chamfered obsidian/cobalt monolith sigil */}
      <g>
        <polygon
          points="2,4 30,4 38,12 38,40 10,40 2,32"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <polygon points="10,33 24,10 30,10 16,33" fill="var(--logo-accent, #0258FF)" />
        <rect x="9" y="11" width="10" height="2.8" fill="currentColor" />
        <rect x="21" y="29.5" width="10" height="2.8" fill="currentColor" />
      </g>

      {/* Razor condensed monolith wordmark */}
      <text
        x="48"
        y="30"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-condensed), sans-serif",
          fontSize: "27px",
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        FTSDUAENAM
      </text>

      {/* Slash + XXVI cohort stamp */}
      <polygon points="197,31 206,12 209.5,12 200.5,31" fill="var(--logo-accent, #0258FF)" />
      <text
        x="213"
        y="29"
        fill="currentColor"
        opacity="0.72"
        style={{
          fontFamily: "var(--font-condensed), sans-serif",
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        XXVI
      </text>
    </svg>
  );
}
