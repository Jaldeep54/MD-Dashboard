"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatPct } from "@/lib/calculations";
import { formatMWh } from "@/lib/utilityCalculations";
import type { PlantPowerBreakdownRow } from "@/types/utility";

const BAR_COLOR = "var(--color-navy-600)";
const TOP_COLOR = "var(--color-navy-900)";

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload as PlantPowerBreakdownRow | undefined;
  if (!item) return null;
  return (
    <ChartTooltipShell title={item.label}>
      <ChartTooltipRow label="Consumption" value={formatMWh(item.consumptionMWh)} />
      <ChartTooltipRow label="Share of Total" value={formatPct(item.pctOfTotal, 1)} />
    </ChartTooltipShell>
  );
}

/**
 * Flagship visualization for Power & Electrical: the single source-of-truth
 * breakdown that HVAC, Compressed Air and Vacuum read their power figures
 * from (see utilityGenerator.ts) - never a competing, independently-drawn
 * number.
 */
export function PlantPowerBreakdownChart({ data }: { data: PlantPowerBreakdownRow[] }) {
  const sorted = [...data].sort((a, b) => b.consumptionMWh - a.consumptionMWh);
  const height = sorted.length * 32 + 20;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke="var(--color-border)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={130}
            tick={{ fontSize: 12, fill: "var(--color-ink-700)" }}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: "var(--color-bg)" }} />
          <Bar dataKey="consumptionMWh" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {sorted.map((entry, i) => (
              <Cell key={entry.key} fill={i === 0 ? TOP_COLOR : BAR_COLOR} fillOpacity={i === 0 ? 1 : 0.75 - i * 0.05} />
            ))}
            <LabelList
              dataKey="consumptionMWh"
              position="right"
              formatter={(v: unknown) => (typeof v === "number" ? formatMWh(v, 1) : "")}
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--color-ink-700)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
