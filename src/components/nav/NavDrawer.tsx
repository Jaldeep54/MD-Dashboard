"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { NAV_ITEMS } from "@/lib/navigation";
import { PLANT_NAME, PLANT_SUBTITLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

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
    <div className="fixed inset-0 z-[110]">
      <div
        className="animate-overlay-in absolute inset-0 bg-[var(--color-navy-950)]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="animate-nav-drawer-in absolute left-0 top-0 flex h-full w-full max-w-[300px] flex-col border-r border-[var(--color-border)] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <div className="text-[15px] font-bold tracking-tight text-[var(--color-ink-900)]">{PLANT_NAME}</div>
            <div className="text-[12px] text-[var(--color-ink-400)]">{PLANT_SUBTITLE}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-ink-400)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink-900)]"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-400)]">
            Dashboards
          </div>
          <ul className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                      active
                        ? "border-[var(--color-navy-700)] bg-[var(--color-navy-900)] text-white"
                        : "border-transparent text-[var(--color-ink-900)] hover:bg-[var(--color-bg)]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-white/15" : "bg-[var(--color-bg)] group-hover:bg-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[var(--color-navy-600)]")} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                        {item.label}
                        {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </div>
                      <p className={cn("mt-0.5 text-[11.5px] leading-snug", active ? "text-white/70" : "text-[var(--color-ink-500)]")}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--color-border)] px-5 py-3 text-[11px] text-[var(--color-ink-400)]">
          1.2 GW TOPCon Cell Manufacturing
        </div>
      </div>
    </div>,
    document.body,
  );
}
