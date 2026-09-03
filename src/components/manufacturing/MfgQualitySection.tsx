"use client";

import { CheckCircle2, ClipboardCheck, ShieldAlert, Wrench } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { statusHigherIsBetter, statusLowerIsBetter } from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import { DefectParetoChart } from "@/components/manufacturing/DefectParetoChart";
import { GradeDistributionChart } from "@/components/manufacturing/GradeDistributionChart";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";
import type { ManufacturingData } from "@/types/manufacturing";

export function MfgQualitySection({
  data,
  onOpenDrawer,
}: {
  data: ManufacturingData;
  onOpenDrawer: (target: MfgDrawerTarget) => void;
}) {
  const { quality, production } = data;
  const seed = `${data.filters.period}-${data.filters.date}-${data.filters.line}`;

  const fpyStatus = statusHigherIsBetter(quality.fpyPct, quality.fpyTargetPct, 2, 0.5);
  const defectStatus = statusLowerIsBetter(quality.defectRatePct, quality.defectRateTargetPct, 1, 0.3);
  const reworkStatus = statusLowerIsBetter(quality.reworkPct, quality.reworkTargetPct, 1, 0.3);
  const finalPassStatus = statusHigherIsBetter(
    quality.finalQualityPassPct,
    quality.finalQualityPassTargetPct,
    1.5,
    0.4,
  );

  return (
    <PageSection title="Quality" description="Grade mix, first-pass yield, defects, rework and final release quality.">
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="First Pass Yield"
          definition="Percentage of cells that pass required quality criteria on the first attempt, without rework."
          value={`${quality.fpyPct.toFixed(1)}%`}
          target={`${quality.fpyTargetPct.toFixed(0)}%`}
          varianceLabel={`${(quality.fpyPct - quality.fpyTargetPct >= 0 ? "+" : "")}${(quality.fpyPct - quality.fpyTargetPct).toFixed(1)}%`}
          status={fpyStatus}
          progressPct={quality.fpyPct}
          targetMarkerPct={quality.fpyTargetPct}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-fpy`)}
          onClick={() => onOpenDrawer({ type: "quality" })}
          icon={<ClipboardCheck className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Defect Rate"
          definition="Percentage of cells failing defined quality criteria at electrical/visual test."
          value={`${quality.defectRatePct.toFixed(1)}%`}
          target={`${quality.defectRateTargetPct.toFixed(1)}%`}
          varianceLabel="of tested cells"
          status={defectStatus}
          progressPct={Math.min(100, (quality.defectRateTargetPct / quality.defectRatePct) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-defect`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "quality" })}
          icon={<ShieldAlert className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Rework"
          definition="Percentage of cells requiring additional processing or rework before final disposition."
          value={`${quality.reworkPct.toFixed(1)}%`}
          target={`${quality.reworkTargetPct.toFixed(0)}%`}
          varianceLabel="of processed cells"
          status={reworkStatus}
          progressPct={Math.min(100, (quality.reworkTargetPct / quality.reworkPct) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-rework`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "quality" })}
          icon={<Wrench className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Final Quality Pass"
          definition="Percentage of finished cells that pass final quality/release criteria. This is a release-stage KPI, distinct from Wafer-to-Cell Yield."
          value={`${quality.finalQualityPassPct.toFixed(1)}%`}
          target={`${quality.finalQualityPassTargetPct.toFixed(0)}%`}
          varianceLabel={`${quality.finalFailPct.toFixed(1)}% fail`}
          status={finalPassStatus}
          progressPct={quality.finalQualityPassPct}
          targetMarkerPct={quality.finalQualityPassTargetPct}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-finalpass`)}
          onClick={() => onOpenDrawer({ type: "quality" })}
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <SectionHeading
            title="Grade Distribution"
            description="Same grade split as the Production section, by definition consistent."
          />
          <GradeDistributionChart grade={production.grade} />
        </Card>

        <Card>
          <SectionHeading title="Final Quality Pass" description="Release-stage pass/fail and main failure reasons." />
          <div className="mb-3 flex items-end gap-4">
            <div>
              <div className="text-[11.5px] text-[var(--color-ink-500)]">Pass</div>
              <div className="text-[22px] font-bold tabular-nums text-[var(--color-positive-text)]">
                {quality.finalQualityPassPct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11.5px] text-[var(--color-ink-500)]">Fail</div>
              <div className="text-[22px] font-bold tabular-nums text-[var(--color-critical-text)]">
                {quality.finalFailPct.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
            Main Failure Reasons
          </div>
          <ul className="mt-1.5 flex flex-col gap-1">
            {quality.mainFailureReasons.map((r) => (
              <li key={r.label} className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--color-ink-700)]">{r.label}</span>
                <span className="font-medium tabular-nums text-[var(--color-ink-900)]">{r.pct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionHeading
          title="Top Defect Categories"
          description="Ranked by count — configurable categories, not limited to the ones shown."
        />
        <DefectParetoChart defects={quality.defects} />
      </Card>
    </PageSection>
  );
}
