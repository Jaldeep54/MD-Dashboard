"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { buildProductionTrend } from "@/data/manufacturingGenerator";
import type { ProductionVsTarget, TrendGranularity } from "@/types/manufacturing";

const GRANULARITY_OPTIONS: { value: TrendGranularity; label: string }[] = [
  { value: "shift", label: "Shift" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function ProductionTrendCard({ vsTarget, seed }: { vsTarget: ProductionVsTarget; seed: string }) {
  const [granularity, setGranularity] = useState<TrendGranularity>("day");

  const trend = useMemo(
    () => buildProductionTrend(vsTarget.actualMW, vsTarget.targetMW, granularity, seed),
    [vsTarget.actualMW, vsTarget.targetMW, granularity, seed],
  );

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <SectionHeading eyebrow="Trend" title="Production Trend" description="Actual vs target production." />
        <SegmentedControl options={GRANULARITY_OPTIONS} value={granularity} onChange={setGranularity} />
      </div>
      <TrendLineChart data={trend} formatter={(v) => `${v.toFixed(2)} MW`} />
    </Card>
  );
}
