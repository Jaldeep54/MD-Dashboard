"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import type { TrendPoint } from "@/types/dashboard";

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipContentProps & { valueFormatter: (v: number) => string }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload as TrendPoint | undefined;
  if (!point) return null;
  return (
    <ChartTooltipShell title={String(label)}>
      <ChartTooltipRow label="Actual" value={valueFormatter(point.actual)} color="var(--color-navy-700)" />
      <ChartTooltipRow label="Target" value={valueFormatter(point.target)} color="var(--color-ink-300)" />
    </ChartTooltipShell>
  );
}

export function TrendLineChart({
  data,
  formatter,
  color = "var(--color-navy-700)",
  height = 240,
  showArea = true,
  yDomain,
}: {
  data: TrendPoint[];
  formatter: (v: number) => string;
  color?: string;
  height?: number;
  showArea?: boolean;
  yDomain?: [number, number];
}) {
  const gradientId = `trend-gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const step = Math.max(1, Math.ceil(data.length / 12));

  // Recharts' domain="auto" miscalculates on a narrow-range Area+Line combo chart,
  // so the domain is computed here from the actual data instead.
  const values = data.flatMap((d) => [d.actual, d.target]);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const pad = (dataMax - dataMin) * 0.2 || Math.abs(dataMax) * 0.1 || 1;
  const computedDomain: [number, number] = [dataMin - pad, dataMax + pad];
  const axisPrecision = dataMax >= 100 ? 0 : dataMax >= 10 ? 1 : 2;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={44}
            domain={yDomain ?? computedDomain}
            tickFormatter={(v: number) => v.toFixed(axisPrecision)}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} valueFormatter={formatter} />} />
          {showArea && (
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="target"
            stroke="var(--color-ink-300)"
            strokeWidth={1.75}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={2.25}
            dot={data.length <= 14}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
