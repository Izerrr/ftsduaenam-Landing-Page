import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { CheckIcon } from "@phosphor-icons/react/Check";
import { CopyIcon } from "@phosphor-icons/react/Copy";
import { DownloadSimpleIcon } from "@phosphor-icons/react/DownloadSimple";
import { XIcon } from "@phosphor-icons/react/X";
import { studioSound } from "@/lib/studioSound";

interface QrShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  subtitle: string;
}

/**
 * High-contrast Warm Bone QR Code overlay designed for instant phone scanning
 * in classrooms, slides, or offline campus events.
 */
export function QrShareModal({
  open,
  onClose,
  shareUrl,
  subtitle,
}: QrShareModalProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      studioSound.playSuccess();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked cleanly ignored
    }
  };

  const handleDownloadSvg = () => {
    const svg = qrWrapperRef.current?.querySelector("svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "surveypanel-fts26-qr.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    studioSound.playSuccess();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={
              prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }
            }
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="chamfer-md relative w-full max-w-sm border border-white/20 bg-[#151618] p-6 text-center shadow-2xl sm:p-7"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => {
                studioSound.playClick();
                onClose();
              }}
              aria-label="Tutup modal QR Code"
              className="chamfer-sm absolute top-4 right-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/15 text-[#A1A19C] transition-colors hover:border-white hover:text-white"
            >
              <XIcon size={16} weight="bold" aria-hidden="true" />
            </button>

            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#5C9AFF]">
              SCAN QR CODE
            </p>
            <h2
              id="qr-modal-title"
              className="mt-1 flex items-baseline justify-center gap-1.5 text-3xl leading-none"
            >
              <span className="font-condensed font-extrabold tracking-[-0.03em] uppercase text-[#F4F4EE]">
                SURVEY
              </span>
              <span className="font-editorial italic tracking-[-0.02em] text-[#0258FF]">
                Panel
              </span>
            </h2>
            <p className="mt-1.5 font-mono text-[11px] uppercase text-[#A1A19C]">
              {subtitle}
            </p>

            {/* Warm Bone plate guarantees fast, accurate camera scan contrast */}
            <div
              ref={qrWrapperRef}
              className="chamfer-md mx-auto mt-5 inline-flex bg-[#F4F4EE] p-4 shadow-inner"
            >
              <QRCodeSVG
                value={shareUrl}
                size={200}
                level="M"
                bgColor="#F4F4EE"
                fgColor="#111112"
              />
            </div>

            <p className="mt-3 break-all font-mono text-[11px] text-[#A1A19C]">
              {shareUrl.replace(/^https?:\/\//, "")}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 border border-white/20 px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-[#F4F4EE] transition-colors hover:border-white hover:bg-white hover:text-[#111112]"
              >
                {copied ? (
                  <>
                    <CheckIcon size={14} weight="bold" aria-hidden="true" />
                    <span>DISALIN</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} weight="bold" aria-hidden="true" />
                    <span>SALIN LINK</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="chamfer-sm inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 bg-[#0258FF] px-3 font-condensed text-xs font-extrabold tracking-[0.14em] uppercase text-white transition-colors hover:bg-[#5C9AFF] hover:text-[#111112]"
              >
                <DownloadSimpleIcon size={15} weight="bold" aria-hidden="true" />
                <span>UNDUH SVG</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
