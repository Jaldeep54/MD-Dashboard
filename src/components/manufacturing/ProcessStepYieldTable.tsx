"use client";

import { ChevronRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { ProcessStepYield } from "@/types/manufacturing";

export function ProcessStepYieldTable({
  steps,
  onSelectStep,
}: {
  steps: ProcessStepYield[];
  onSelectStep: (stepId: string) => void;
}) {
  const worst = [...steps].sort((a, b) => a.yieldPct - b.yieldPct).slice(0, 3).map((s) => s.id);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeading
          title="Process Yield by Step"
          description="Step-level yield (input → output) — the lowest-performing steps are highlighted. Click a row for detail."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Process Step</th>
              <th className="px-3 py-2.5 text-right font-semibold">Input (Mn)</th>
              <th className="px-3 py-2.5 text-right font-semibold">Output (Mn)</th>
              <th className="px-3 py-2.5 text-right font-semibold">Yield %</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={cn(
                  "group cursor-pointer border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-bg)]/70",
                  worst.includes(step.id) && "bg-[var(--color-critical-bg)]/20",
                )}
              >
                <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">
                  <div className="flex items-center gap-2">
                    {step.name}
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-300)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                  {step.inputMn.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                  {step.outputMn.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right font-medium tabular-nums text-[var(--color-ink-900)]">
                  {step.yieldPct.toFixed(2)}%
                </td>
                <td className="px-3 py-3 pr-5 text-right">
                  <StatusBadge status={step.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
