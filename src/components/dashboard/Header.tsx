"use client";

import { Bell, Factory } from "lucide-react";
import { useState } from "react";
import { PLANT_NAME, PLANT_SUBTITLE } from "@/lib/constants";
import type { ManagementAlert } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function Header({ lastUpdated, alerts }: { lastUpdated: string; alerts: ManagementAlert[] }) {
  const [open, setOpen] = useState(false);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const totalFlags = criticalCount + warningCount;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-navy-950)]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-navy-700)]">
            <Factory className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-[17px] font-bold tracking-tight text-white">{PLANT_NAME}</span>
            <span className="hidden text-[13px] text-white/50 sm:inline">{PLANT_SUBTITLE}</span>
            <span className="hidden h-3.5 w-px bg-white/20 md:inline" />
            <span className="hidden text-[13px] font-medium text-white/70 md:inline">
              MD Management Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className="text-[11px] text-white/40">Last updated</div>
            <div className="text-[13px] font-medium text-white/85 tabular-nums">{lastUpdated}</div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {totalFlags > 0 && (
                <span
                  className={cn(
                    "absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
                    criticalCount > 0 ? "bg-[var(--color-critical-solid)]" : "bg-[var(--color-warning-solid)]",
                  )}
                >
                  {totalFlags}
                </span>
              )}
            </button>
            {open && (
              <div className="animate-fade-in absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
                  Management Attention ({alerts.length})
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.length === 0 && (
                    <div className="px-4 py-6 text-center text-[13px] text-[var(--color-ink-400)]">
                      No active exceptions.
                    </div>
                  )}
                  {alerts.map((a) => (
                    <div key={a.id} className="border-b border-[var(--color-border)] px-4 py-2.5 last:border-0">
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                            a.severity === "critical" && "bg-[var(--color-critical-solid)]",
                            a.severity === "warning" && "bg-[var(--color-warning-solid)]",
                            a.severity === "positive" && "bg-[var(--color-positive-solid)]",
                          )}
                        />
                        <p className="text-[12.5px] leading-snug text-[var(--color-ink-700)]">{a.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
