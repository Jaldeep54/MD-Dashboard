"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatPct, formatRupeePerW } from "@/lib/calculations";
import type { CostComponent } from "@/types/dashboard";

const BAR_COLOR = "var(--color-navy-600)";
const TOP_COLOR = "var(--color-navy-900)";

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload as CostComponent | undefined;
  if (!item) return null;
  return (
    <ChartTooltipShell title={item.component}>
      <ChartTooltipRow label="Cost" value={formatRupeePerW(item.valuePerW)} />
      <ChartTooltipRow label="Share of Total" value={formatPct(item.pctOfTotal, 1)} />
    </ChartTooltipShell>
  );
}

export function CostBreakdownChart({ data }: { data: CostComponent[] }) {
  const sorted = [...data].sort((a, b) => b.valuePerW - a.valuePerW);
  const height = sorted.length * 30 + 20;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
          barCategoryGap={8}
        >
          <CartesianGrid horizontal={false} stroke="var(--color-border)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="component"
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fontSize: 12, fill: "var(--color-ink-700)" }}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: "var(--color-bg)" }} />
          <Bar dataKey="valuePerW" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {sorted.map((entry, i) => (
              <Cell key={entry.component} fill={i === 0 ? TOP_COLOR : BAR_COLOR} fillOpacity={i === 0 ? 1 : 0.75 - i * 0.04} />
            ))}
            <LabelList
              dataKey="valuePerW"
              position="right"
              formatter={(v: unknown) => (typeof v === "number" ? formatRupeePerW(v, 2) : "")}
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--color-ink-700)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
