interface FtsLogoProps {
  className?: string;
  decorative?: boolean;
}

/**
 * Clean, high-fashion motorsport-editorial monogram ("FTS26") inspired by LN4 / OFF+BRAND.
 * Uses currentColor + --logo-accent so it transitions effortlessly over Dark, Warm Bone, and Electric Cobalt.
 */
export function FtsLogo({ className = "h-8 w-auto", decorative = true }: FtsLogoProps) {
  return (
    <svg
      viewBox="0 0 132 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "FTS26"}
    >
      {!decorative && <title>FTS26</title>}
      {/* Bold condensed FTS */}
      <text
        x="2"
        y="30"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-condensed), sans-serif",
          fontSize: "32px",
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        FTS
      </text>
      {/* Kinetic forward speed slash */}
      <polygon
        points="54,31 64,7 70,7 60,31"
        fill="var(--logo-accent, #0258FF)"
      />
      {/* High-contrast editorial serif 26 */}
      <text
        x="73"
        y="30"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-editorial), Georgia, serif",
          fontStyle: "italic",
          fontSize: "34px",
          letterSpacing: "-0.03em",
        }}
      >
        26
      </text>
      {/* Accent period dot */}
      <circle cx="116" cy="27" r="3.5" fill="var(--logo-accent, #0258FF)" />
    </svg>
  );
}
