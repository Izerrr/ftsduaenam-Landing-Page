import { useState } from "react";
import { PauseIcon } from "@phosphor-icons/react/Pause";
import { PlayIcon } from "@phosphor-icons/react/Play";
import { COHORT_IDENTITY } from "@/data/services";

/**
 * Monochrome editorial cohort marquee anchored at the bottom of the Hero.
 * Respects prefers-reduced-motion (static unless no-preference) and provides a WCAG 2.2.2 Pause/Play control.
 */
export function CohortMarquee() {
  const [paused, setPaused] = useState(false);

  const renderTrack = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-7 pr-7"
    >
      {COHORT_IDENTITY.marqueeItems.map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className="inline-flex items-center gap-7 font-condensed text-base font-bold uppercase tracking-[0.06em] text-[#131313] sm:text-lg"
        >
          <span className="whitespace-nowrap">{item}</span>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 bg-[#131313]"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative flex w-full items-stretch border-y-[1.5px] border-[#131313] bg-white">
      <div className="min-w-0 flex-1 overflow-hidden py-3">
        <div
          className="fts-marquee-track"
          data-paused={paused ? "true" : "false"}
        >
          {renderTrack(false)}
          {renderTrack(true)}
          {renderTrack(true)}
          {renderTrack(true)}
        </div>
      </div>

      {/* WCAG 2.2.2 pause/play control: changes label cleanly without aria-pressed */}
      <button
        type="button"
        onClick={() => setPaused((prev) => !prev)}
        aria-label={paused ? "Putar teks berjalan" : "Jeda teks berjalan"}
        className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center gap-1.5 border-l-[1.5px] border-[#131313] bg-[#F5F5F2] px-3 font-condensed text-xs font-bold uppercase tracking-[0.06em] text-[#131313] transition-colors hover:bg-[#FEF08A]"
      >
        {paused ? (
          <>
            <PlayIcon size={14} weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline">Putar</span>
          </>
        ) : (
          <>
            <PauseIcon size={14} weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline">Jeda</span>
          </>
        )}
      </button>
    </div>
  );
}
