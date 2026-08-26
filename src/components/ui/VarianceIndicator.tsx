import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VarianceIndicatorProps {
  /** true when a positive raw variance is a good outcome (production, value, contribution, yield, capacity). false for cost (lower is better). */
  positiveIsGood: boolean;
  variance: number;
  label: string;
  size?: "sm" | "md";
}

export function VarianceIndicator({ positiveIsGood, variance, label, size = "sm" }: VarianceIndicatorProps) {
  const isFlat = Math.abs(variance) < 1e-9;
  const isGood = isFlat ? true : positiveIsGood ? variance > 0 : variance < 0;
  const Icon = isFlat ? Minus : variance > 0 ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        size === "sm" ? "text-[12px]" : "text-[13px]",
        isFlat
          ? "text-[var(--color-ink-500)]"
          : isGood
            ? "text-[var(--color-positive-text)]"
            : "text-[var(--color-critical-text)]",
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
