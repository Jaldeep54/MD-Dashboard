"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatPct } from "@/lib/calculations";
import type { CapacityTrendPoint } from "@/types/dashboard";

const SERIES = [
  { key: "availability", label: "Capacity Availability %", color: "var(--color-info-solid)" },
  { key: "utilizationOfAvailable", label: "Utilization of Available %", color: "var(--color-warning-solid)" },
  { key: "overallUtilization", label: "Overall Capacity Utilization %", color: "var(--color-navy-700)" },
] as const;

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload as CapacityTrendPoint | undefined;
  if (!point) return null;
  return (
    <ChartTooltipShell title={String(label)}>
      {SERIES.map((s) => (
        <ChartTooltipRow key={s.key} label={s.label} value={formatPct(point[s.key])} color={s.color} />
      ))}
    </ChartTooltipShell>
  );
}

export function CapacityTrendChart({ data }: { data: CapacityTrendPoint[] }) {
  const step = Math.max(1, Math.ceil(data.length / 12));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink-500)]">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
              interval={step - 1}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
              width={38}
              domain={[75, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={CustomTooltip} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
