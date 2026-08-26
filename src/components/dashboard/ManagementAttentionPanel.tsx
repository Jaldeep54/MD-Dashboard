import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManagementAlert } from "@/types/dashboard";

const SEVERITY_META = {
  critical: {
    icon: OctagonAlert,
    border: "border-[var(--color-critical-border)]",
    bg: "bg-[var(--color-critical-bg)]",
    text: "text-[var(--color-critical-text)]",
    iconColor: "text-[var(--color-critical-solid)]",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-[var(--color-warning-border)]",
    bg: "bg-[var(--color-warning-bg)]",
    text: "text-[var(--color-warning-text)]",
    iconColor: "text-[var(--color-warning-solid)]",
    label: "Warning",
  },
  positive: {
    icon: CheckCircle2,
    border: "border-[var(--color-positive-border)]",
    bg: "bg-[var(--color-positive-bg)]",
    text: "text-[var(--color-positive-text)]",
    iconColor: "text-[var(--color-positive-solid)]",
    label: "Positive",
  },
} as const;

export function ManagementAttentionPanel({ alerts }: { alerts: ManagementAlert[] }) {
  return (
    <section id="management-attention" className="mb-4">
      <div className="mb-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
          Management Attention
        </h2>
        <p className="mt-0.5 text-[13px] text-[var(--color-ink-400)]">
          The most important exceptions for this scope and period — prioritized, not exhaustive.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-positive-border)] bg-[var(--color-positive-bg)] px-5 py-6 text-center text-[13px] font-medium text-[var(--color-positive-text)]">
          No exceptions — the plant is performing within all management targets.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => {
            const meta = SEVERITY_META[alert.severity];
            const Icon = meta.icon;
            return (
              <div
                key={alert.id}
                className={cn("flex items-start gap-3 rounded-xl border px-4 py-3.5", meta.border, meta.bg)}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.iconColor)} />
                <div>
                  <div className={cn("text-[11px] font-semibold uppercase tracking-wide", meta.text)}>
                    {meta.label} · {alert.metric}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink-900)]">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
