"use client";

import { ChevronRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { STATUS_STYLES } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { ProcessFlowStepStatus } from "@/types/manufacturing";

export function ProcessFlowVisual({
  steps,
  onSelectStep,
}: {
  steps: ProcessFlowStepStatus[];
  onSelectStep: (stepId: string) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Process Flow"
        title="TOPCon Cell Manufacturing Sequence"
        description="n-type wafer to finished half-cut cell — click a step for its process and equipment detail."
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((step, i) => {
          const isEndpoint = step.id === "wafer-in" || step.id === "final-cell";
          const s = STATUS_STYLES[step.status];
          return (
            <div key={step.id} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => !isEndpoint && onSelectStep(step.id)}
                disabled={isEndpoint}
                title={
                  isEndpoint ? step.name : `${step.name}: ${step.yieldPct.toFixed(1)}% (target ${step.targetPct.toFixed(1)}%)`
                }
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11.5px] font-medium transition-all",
                  isEndpoint
                    ? "border-[var(--color-border-strong)] bg-[var(--color-bg)] text-[var(--color-ink-700)]"
                    : cn("cursor-pointer hover:-translate-y-0.5 hover:shadow-sm", s.bg, s.text, s.border),
                )}
              >
                {!isEndpoint && <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />}
                {step.name}
              </button>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-[var(--color-ink-300)]" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
