import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowElbowDownLeftIcon as ArrowElbowDownLeft } from "@phosphor-icons/react/ArrowElbowDownLeft";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { CompassIcon as Compass } from "@phosphor-icons/react/Compass";
import { MagnifyingGlassIcon as MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import { XIcon as X } from "@phosphor-icons/react/X";
import { QUICK_JUMP_ITEMS, type QuickJumpItem } from "@/data/services";

interface QuickJumpDialogProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: QuickJumpItem["group"][] = ["Layanan", "Navigasi", "Akses & Legal"];

/**
 * Native <dialog> Quick Jump Command Palette (Cmd/Ctrl + K).
 * Uses showModal(), closedby="any" with Safari pointerdown/pointerup fallback,
 * and CSS overscroll-behavior containment (never mutating html/body overflow).
 */
export function QuickJumpDialog({ open, onClose }: QuickJumpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_JUMP_ITEMS;
    return QUICK_JUMP_ITEMS.filter((item) => {
      const haystack = `${item.label} ${item.hint} ${item.group} ${item.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const clampedActiveIndex =
    filteredItems.length === 0 ? -1 : Math.min(activeIndex, filteredItems.length - 1);

  // Sync open prop with native top-layer showModal() / close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Listen for native close event (Esc, light-dismiss, close button)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = "";
      setQuery("");
      setActiveIndex(0);
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Safari fallback for <dialog closedby="any"> using pointerdown + pointerup bounds check
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || "closedBy" in HTMLDialogElement.prototype) return;

    const isOutside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (event: PointerEvent) => {
      pressedOutside = isOutside(event);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pressedOutside && isOutside(event)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const activateItem = (item: QuickJumpItem) => {
    dialogRef.current?.close();
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.href.startsWith("#")) {
      const target = document.querySelector<HTMLElement>(item.href);
      target?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.href = item.href;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (event.key === "Enter" && clampedActiveIndex >= 0) {
      event.preventDefault();
      activateItem(filteredItems[clampedActiveIndex]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: "any" } as Record<string, string>)}
      className="quick-jump-dialog m-auto w-[min(92vw,36rem)] max-h-[82dvh] rounded-none border-[2px] border-[#131313] bg-[#F5F5F2] p-0 text-[#131313] shadow-[8px_8px_0_0_#131313]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-[1.5px] border-[#131313] bg-[#131313] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Compass size={18} weight="bold" className="text-[#FACC15]" aria-hidden="true" />
          <h2
            id={titleId}
            className="font-condensed text-base font-bold uppercase tracking-[0.06em]"
          >
            Pintasan Cepat ftsduaenam
          </h2>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Tutup pintasan cepat"
          className="inline-flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-none border border-white/30 bg-transparent text-white transition-colors hover:bg-white hover:text-[#131313]"
        >
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {/* Search field */}
      <div className="border-b-[1.5px] border-[#131313] bg-white px-4 py-3">
        <label htmlFor={inputId} className="sr-only">
          Cari layanan, bagian halaman, atau tautan masuk
        </label>
        <div className="flex items-center gap-3">
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="shrink-0 text-[#4A4A46]"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik layanan: TaskPanel, Vault, Kelas, Discord, .ics..."
            autoComplete="off"
            className="min-h-[40px] w-full bg-transparent text-base text-[#131313] placeholder:text-[#4A4A46] focus:outline-none"
          />
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-start gap-3 border-[1.5px] border-dashed border-[#131313]/40 bg-white p-5">
            <p className="text-sm font-medium text-[#131313]">
              Tidak ada layanan atau jalur yang cocok dengan &ldquo;{query}&rdquo;.
            </p>
            <p className="text-sm text-[#4A4A46]">
              Coba kata kunci seperti TaskPanel, Vault, Kelas, Discord, atau Login.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              className="min-h-[44px] cursor-pointer rounded-none border-[1.5px] border-[#131313] bg-[#0258FF] px-4 font-condensed text-sm font-bold uppercase tracking-[0.05em] text-white"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {GROUPS.map((groupName) => {
              const itemsInGroup = filteredItems.filter((item) => item.group === groupName);
              if (itemsInGroup.length === 0) return null;

              return (
                <div key={groupName}>
                  <p className="px-2 pb-1.5 font-condensed text-xs font-bold uppercase tracking-[0.08em] text-[#4A4A46]">
                    {groupName}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {itemsInGroup.map((item) => {
                      const flatIndex = filteredItems.indexOf(item);
                      const isSelected = flatIndex === clampedActiveIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            onClick={() => activateItem(item)}
                            className={`flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 rounded-none border px-3 py-2 text-left transition-colors ${
                              isSelected
                                ? "border-[#131313] bg-[#0258FF] text-white"
                                : "border-transparent bg-white text-[#131313] hover:border-[#131313]"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {item.label}
                              </span>
                              <span
                                className={`block truncate text-xs ${
                                  isSelected ? "text-white/90" : "text-[#4A4A46]"
                                }`}
                              >
                                {item.hint}
                              </span>
                            </span>
                            {item.external ? (
                              <ArrowUpRight
                                size={18}
                                weight="bold"
                                className="shrink-0"
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowElbowDownLeft
                                size={16}
                                weight="bold"
                                className="shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hints */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] border-[#131313] bg-white px-4 py-2.5 text-xs text-[#4A4A46]">
        <span>Gunakan panah atas/bawah dan Enter untuk langsung menuju layanan.</span>
        <span className="font-semibold text-[#131313]">ESC tutup</span>
      </div>
    </dialog>
  );
}
