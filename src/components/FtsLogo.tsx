interface FtsLogoProps {
  className?: string;
  decorative?: boolean;
}

/**
 * Custom brush-script SVG wordmark "ftsduaenam" inspired by editorial studio lettering.
 * Uses currentColor so it inverts instantaneously between cobalt (#0258FF) on light bands
 * and pure white (#FFFFFF) over #131313 dark bands.
 */
export function FtsLogo({ className = "h-9 w-auto", decorative = true }: FtsLogoProps) {
  return (
    <svg
      viewBox="0 0 278 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "ftsduaenam"}
    >
      {!decorative && <title>ftsduaenam</title>}
      <g transform="rotate(-2.2 139 36)">
        <text
          x="10"
          y="48"
          fill="currentColor"
          style={{
            fontFamily: "var(--font-script), Georgia, cursive",
            fontSize: "43px",
            letterSpacing: "-0.02em",
          }}
        >
          ftsduaenam
        </text>
        {/* Calligraphic brush underline strokes */}
        <path
          d="M16 59.5C72 54.8 154 53.2 246 57.2C252 57.5 256.5 56.4 259 55.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M162 63.8C190 62.1 218 61.8 238 63.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.78"
        />
      </g>
    </svg>
  );
}
