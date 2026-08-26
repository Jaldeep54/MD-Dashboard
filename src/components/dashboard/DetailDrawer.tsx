"use client";

import { useMemo } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CapacityWaterfall } from "@/components/dashboard/CapacityWaterfall";
import { CostBreakdownChart } from "@/components/dashboard/CostBreakdownChart";
import { GradeSummary } from "@/components/dashboard/GradeSummary";
import { LossBreakdownChart } from "@/components/dashboard/LossBreakdownChart";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { CapacityTrendChart } from "@/components/dashboard/CapacityTrendChart";
import {
  formatCr,
  formatMW,
  formatPct,
  formatRupeePerW,
  formatSigned,
  statusHigherIsBetter,
  statusLowerIsBetter,
} from "@/lib/calculations";
import { generateLineDetail } from "@/data/generator";
import type { CellLineId, DashboardData, DashboardFilters } from "@/types/dashboard";
import type { DrawerTarget } from "@/components/dashboard/ExecutiveKPISection";

function StatMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5">
      <div className="text-[11px] font-medium text-[var(--color-ink-500)]">{label}</div>
      <div className="text-[17px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-ink-400)]">{sub}</div>}
    </div>
  );
}

export function DetailDrawer({
  target,
  data,
  filters,
  onClose,
}: {
  target: DrawerTarget | null;
  data: DashboardData;
  filters: DashboardFilters;
  onClose: () => void;
}) {
  const lineDetail = useMemo(() => {
    if (target?.type === "line") {
      return generateLineDetail(filters, target.lineId as CellLineId);
    }
    return null;
  }, [target, filters]);

  const open = target !== null;
  const { title, subtitle } = titleFor(target, data);

  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {target?.type === "production" && <ProductionDetail data={data} />}
      {target?.type === "capacity" && <CapacityDetail data={data} />}
      {target?.type === "cost" && <CostDetail data={data} />}
      {target?.type === "value" && <ValueDetail data={data} />}
      {target?.type === "contribution" && <ContributionDetail data={data} />}
      {target?.type === "line" && lineDetail && (
        <LineDetail data={lineDetail} lineId={target.lineId as CellLineId} />
      )}
    </Drawer>
  );
}

function titleFor(target: DrawerTarget | null, data: DashboardData): { title: string; subtitle: string } {
  const subtitle = `${data.scopeLabel} · ${data.periodLabel}`;
  if (!target) return { title: "", subtitle };
  switch (target.type) {
    case "production":
      return { title: "Production Detail", subtitle };
    case "capacity":
      return { title: "Capacity Performance Detail", subtitle };
    case "cost":
      return { title: "Manufacturing Cost Detail", subtitle };
    case "value":
      return { title: "Realised Value Detail", subtitle };
    case "contribution":
      return { title: "Contribution Detail", subtitle };
    case "line": {
      const line = data.cellLines.find((l) => l.id === target.lineId);
      return { title: `${line?.name ?? "Cell Line"} Detail`, subtitle: data.periodLabel };
    }
  }
}

function ProductionDetail({ data }: { data: DashboardData }) {
  const { production, productionTrend } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatMini label="Actual" value={formatMW(production.actualMW, 2)} />
        <StatMini label="Target" value={formatMW(production.targetMW, 2)} />
        <StatMini label="Achievement" value={formatPct(production.achievementPct)} />
      </div>
      <GradeSummary production={production} />
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Production Trend</h3>
        <TrendLineChart data={productionTrend} formatter={(v) => formatMW(v, 2)} height={220} />
      </div>
    </div>
  );
}

function CapacityDetail({ data }: { data: DashboardData }) {
  const { capacity, capacityTrend } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatMini
          label="Capacity Availability"
          value={formatPct(capacity.availabilityPct)}
          sub={`Target ${formatPct(capacity.availabilityTargetPct)}`}
        />
        <StatMini
          label="Utilization of Available"
          value={formatPct(capacity.utilizationOfAvailablePct)}
          sub={`Target ${formatPct(capacity.utilizationOfAvailableTargetPct)}`}
        />
        <StatMini
          label="Overall Utilization"
          value={formatPct(capacity.overallUtilizationPct)}
          sub={`Target ${formatPct(capacity.overallUtilizationTargetPct)}`}
        />
      </div>
      <CapacityWaterfall capacity={capacity} />
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Capacity Performance Trend</h3>
        <CapacityTrendChart data={capacityTrend} />
      </div>
    </div>
  );
}

function CostDetail({ data }: { data: DashboardData }) {
  const { cost, costTrend } = data;
  const status = statusLowerIsBetter(cost.actualPerW, cost.targetPerW, 2);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
            {formatRupeePerW(cost.actualPerW)}
          </div>
          <div className="text-[13px] text-[var(--color-ink-500)]">Target {formatRupeePerW(cost.targetPerW)}</div>
        </div>
        <StatusBadge
          status={status}
          label={`${formatSigned(cost.variancePerW, (v) => formatRupeePerW(v))} vs target`}
        />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Cost Breakdown</h3>
        <CostBreakdownChart data={cost.breakdown} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Cost/W vs Target Trend</h3>
        <TrendLineChart data={costTrend} formatter={(v) => formatRupeePerW(v)} height={200} />
      </div>
    </div>
  );
}

function ValueDetail({ data }: { data: DashboardData }) {
  const { value, valueTrend } = data;
  const status = statusHigherIsBetter(value.actualPerW, value.targetPerW, 2);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
            {formatRupeePerW(value.actualPerW)}
          </div>
          <div className="text-[13px] text-[var(--color-ink-500)]">Target {formatRupeePerW(value.targetPerW)}</div>
        </div>
        <StatusBadge
          status={status}
          label={`${formatSigned(value.variancePerW, (v) => formatRupeePerW(v))} vs target`}
        />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Realised Value/W vs Target</h3>
        <TrendLineChart data={valueTrend} formatter={(v) => formatRupeePerW(v)} color="var(--color-info-solid)" height={220} />
      </div>
    </div>
  );
}

function ContributionDetail({ data }: { data: DashboardData }) {
  const { contribution, contributionTrend, totalContributionTrend } = data;
  const status = statusHigherIsBetter(contribution.perW, contribution.targetPerW, 3);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
            {formatRupeePerW(contribution.perW)}
          </div>
          <div className="text-[13px] text-[var(--color-ink-500)]">
            Target {formatRupeePerW(contribution.targetPerW)}
          </div>
        </div>
        <StatusBadge
          status={status}
          label={`${formatSigned(contribution.variancePerW, (v) => formatRupeePerW(v))} vs target`}
        />
        <div className="ml-auto rounded-lg bg-[var(--color-navy-900)] px-4 py-2 text-right">
          <div className="text-[10.5px] font-medium text-white/60">Total Contribution</div>
          <div className="text-[18px] font-bold text-white tabular-nums">{formatCr(contribution.totalCr)}</div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Contribution/W vs Target</h3>
        <TrendLineChart
          data={contributionTrend}
          formatter={(v) => formatRupeePerW(v)}
          color="var(--color-positive-solid)"
          height={200}
        />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Total Contribution Trend</h3>
        <TrendLineChart data={totalContributionTrend} formatter={(v) => formatCr(v)} color="var(--color-navy-900)" height={200} />
      </div>
    </div>
  );
}

function LineDetail({ data, lineId }: { data: DashboardData; lineId: CellLineId }) {
  const line = data.cellLines.find((l) => l.id === lineId) ?? data.cellLines[0];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-5">
          <StatMini label="Production" value={formatMW(line.production.actualMW, 2)} sub={`/ ${formatMW(line.production.targetMW, 2)}`} />
          <StatMini label="Achievement" value={formatPct(line.production.achievementPct)} />
          <StatMini label="Capacity" value={formatPct(line.capacity.overallUtilizationPct, 0)} />
          <StatMini label="Yield" value={formatPct(line.yieldMetrics.yieldPct)} />
          <StatMini label="Cost/W" value={formatRupeePerW(line.cost.actualPerW)} />
        </div>
      </div>
      <StatusBadge status={line.status} />
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Production Trend</h3>
        <TrendLineChart data={data.productionTrend} formatter={(v) => formatMW(v, 2)} height={190} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Capacity Trend</h3>
        <CapacityTrendChart data={data.capacityTrend} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Process Loss Breakdown</h3>
        <LossBreakdownChart data={data.lossBreakdown} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Cost/W Trend</h3>
        <TrendLineChart data={data.costTrend} formatter={(v) => formatRupeePerW(v)} height={190} />
      </div>
    </div>
  );
}
