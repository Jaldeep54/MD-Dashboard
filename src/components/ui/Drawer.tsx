"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className="animate-overlay-in absolute inset-0 bg-[var(--color-navy-950)]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="animate-drawer-in absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-white px-6 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--color-ink-900)]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-[var(--color-ink-500)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-ink-400)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink-900)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
