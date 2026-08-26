"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { achievementPct, formatMW, formatPct, formatSigned, statusHigherIsBetter } from "@/lib/calculations";
import type { CellLinePerformance, LineFilter } from "@/types/dashboard";

const STATUS_COLOR: Record<string, string> = {
  good: "var(--color-positive-solid)",
  watch: "var(--color-warning-solid)",
  critical: "var(--color-critical-solid)",
};

interface ChartRow {
  name: string;
  lineId: string;
  target: number;
  actual: number;
  achievement: number;
  status: string;
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) return null;
  const variance = row.actual - row.target;
  return (
    <ChartTooltipShell title={row.name}>
      <ChartTooltipRow label="Target" value={formatMW(row.target)} />
      <ChartTooltipRow label="Actual" value={formatMW(row.actual)} />
      <ChartTooltipRow label="Variance" value={formatSigned(variance, (v) => formatMW(v))} />
      <ChartTooltipRow label="Achievement" value={formatPct(row.achievement)} />
    </ChartTooltipShell>
  );
}

export function ProductionVsTargetChart({
  cellLines,
  selectedLine,
  onSelectLine,
}: {
  cellLines: CellLinePerformance[];
  selectedLine: LineFilter;
  onSelectLine: (lineId: string) => void;
}) {
  const data: ChartRow[] = cellLines.map((l) => ({
    name: l.name,
    lineId: l.id,
    target: Number(l.production.targetMW.toFixed(2)),
    actual: Number(l.production.actualMW.toFixed(2)),
    achievement: achievementPct(l.production.actualMW, l.production.targetMW),
    status: statusHigherIsBetter(l.production.actualMW, l.production.targetMW, 3),
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            tick={{ fontSize: 12, fill: "var(--color-ink-500)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
            width={40}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: "var(--color-bg)" }} />
          <Bar
            dataKey="target"
            name="Target"
            fill="var(--color-ink-300)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="actual"
            name="Actual"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            onClick={(entry) => {
              const row = entry as unknown as ChartRow;
              onSelectLine(row.lineId);
            }}
            className="cursor-pointer"
          >
            {data.map((row) => (
              <Cell
                key={row.lineId}
                fill={STATUS_COLOR[row.status]}
                opacity={selectedLine === "all" || selectedLine === row.lineId ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
