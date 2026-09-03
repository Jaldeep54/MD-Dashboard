"use client";

import { Banknote, Factory, Gauge, IndianRupee, Sparkles } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TotalContributionCard } from "@/components/dashboard/TotalContributionCard";
import {
  formatLacsFromMn,
  formatMW,
  formatPct,
  formatRupeePerW,
  formatSigned,
  statusHigherIsBetter,
  statusLowerIsBetter,
} from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import type { DashboardData } from "@/types/dashboard";

export type DrawerTarget =
  | { type: "production" }
  | { type: "capacity" }
  | { type: "cost" }
  | { type: "value" }
  | { type: "contribution" }
  | { type: "line"; lineId: string };

export function ExecutiveKPISection({
  data,
  onOpenDrawer,
}: {
  data: DashboardData;
  onOpenDrawer: (target: DrawerTarget) => void;
}) {
  const { production, capacity, cost, value, contribution, periodLabel, filters, scopeLabel } = data;
  const seed = `${filters.period}-${filters.date}-${filters.line}`;

  const productionStatus = statusHigherIsBetter(production.actualMW, production.targetMW, 3);
  const capacityStatus = statusHigherIsBetter(
    capacity.overallUtilizationPct,
    capacity.overallUtilizationTargetPct,
    3,
  );
  const costStatus = statusLowerIsBetter(cost.actualPerW, cost.targetPerW, 2);
  const valueStatus = statusHigherIsBetter(value.actualPerW, value.targetPerW, 2);
  const contributionStatus = statusHigherIsBetter(contribution.perW, contribution.targetPerW, 3);

  return (
    <section className="mb-8">
      <div className="mb-3.5 flex items-baseline justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
            Executive Summary
          </h2>
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-400)]">
            {scopeLabel} · {periodLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KPICard
          title="Production"
          definition="Actual saleable production versus the management target for the selected period and scope. Total Cell Output is shown alongside in Lacs."
          value={formatMW(production.actualMW)}
          unitNote={formatLacsFromMn(production.totalCellsMn)}
          target={formatMW(production.targetMW)}
          varianceLabel={`${formatPct(production.achievementPct, 1)} achieved`}
          status={productionStatus}
          progressPct={Math.min(100, production.achievementPct)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-prod`)}
          onClick={() => onOpenDrawer({ type: "production" })}
          icon={<Factory className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Overall Capacity Utilization"
          definition="Actual production as a percentage of theoretical installed capacity (1.2 GW annual, prorated to the selected period)."
          value={formatPct(capacity.overallUtilizationPct)}
          target={formatPct(capacity.overallUtilizationTargetPct)}
          varianceLabel={formatSigned(
            capacity.overallUtilizationPct - capacity.overallUtilizationTargetPct,
            (v) => formatPct(v, 1),
          )}
          status={capacityStatus}
          progressPct={capacity.overallUtilizationPct}
          targetMarkerPct={capacity.overallUtilizationTargetPct}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-cap`)}
          onClick={() => onOpenDrawer({ type: "capacity" })}
          icon={<Gauge className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Manufacturing Cost/W"
          definition="Total manufacturing cost divided by total production for the selected period and scope. Lower is better."
          value={formatRupeePerW(cost.actualPerW)}
          target={formatRupeePerW(cost.targetPerW)}
          varianceLabel={`${formatSigned(cost.variancePerW, (v) => formatRupeePerW(v))} vs target`}
          status={costStatus}
          progressPct={Math.min(100, (cost.targetPerW / cost.actualPerW) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-cost`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "cost" })}
          icon={<IndianRupee className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Contribution/W"
          definition="Realised Value/W minus Manufacturing Cost/W - the plant's per-Watt financial margin."
          value={formatRupeePerW(contribution.perW)}
          target={formatRupeePerW(contribution.targetPerW)}
          varianceLabel={`${formatSigned(contribution.variancePerW, (v) => formatRupeePerW(v))} vs target`}
          status={contributionStatus}
          progressPct={Math.min(100, (contribution.perW / contribution.targetPerW) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-contrib`)}
          onClick={() => onOpenDrawer({ type: "contribution" })}
          icon={<Sparkles className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <KPICard
          title="Realised Value/W"
          definition="Total Realised Sales Value divided by Good Saleable Watts sold."
          value={formatRupeePerW(value.actualPerW)}
          target={formatRupeePerW(value.targetPerW)}
          varianceLabel={`${formatSigned(value.variancePerW, (v) => formatRupeePerW(v))} vs target`}
          status={valueStatus}
          progressPct={Math.min(100, (value.actualPerW / value.targetPerW) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-value`)}
          onClick={() => onOpenDrawer({ type: "value" })}
          emphasis="compact"
          icon={<Banknote className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <div className="sm:col-span-2">
          <TotalContributionCard
            totalCr={contribution.totalCr}
            periodLabel={periodLabel}
            scopeLabel={scopeLabel}
            periodDeltaPct={periodOverPeriodDelta(`${seed}-totalcontrib`)}
            onClick={() => onOpenDrawer({ type: "contribution" })}
          />
        </div>
      </div>
    </section>
  );
}
