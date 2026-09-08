/**
 * Pure calculation functions for the Utility Dashboard. Mirrors the
 * conventions in calculations.ts / manufacturingCalculations.ts: formulas,
 * status bands, and formatters are kept separate from UI components, and
 * generic building blocks (distributeRatioByWeight, statusHigherIsBetter)
 * are reused from those modules rather than reimplemented here.
 */
import { DG_PROFILE, EXCESS_DEMAND_PENALTY_RS_PER_KVA_PER_MONTH } from "@/lib/utilityConstants";

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

/** RO Recovery % = RO Product / RO Feed x 100. */
export function roRecoveryPct(feedKL: number, productKL: number): number {
  return (productKL / feedKL) * 100;
}

/** RO Reject % = RO Reject / RO Feed x 100. By construction Recovery% + Reject% = 100%
 * whenever productKL + rejectKL = feedKL (enforced in utilityGenerator.ts, verified via
 * assertInvariant). */
export function roRejectPct(feedKL: number, rejectKL: number): number {
  return (rejectKL / feedKL) * 100;
}

/**
 * ETP Recovery % was left undefined in the source requirements doc. Explicit
 * assumption adopted here: Recycled/Reused Water / ETP Inlet x 100, i.e. how
 * much of the water entering the ETP is ultimately returned to the plant
 * (cooling makeup, process reuse) rather than discharged.
 */
export function etpRecoveryPct(recycledKL: number, inletKL: number): number {
  return (recycledKL / inletKL) * 100;
}

// ---------------------------------------------------------------------------
// Power
// ---------------------------------------------------------------------------

/** Excess-demand penalty when Peak Demand exceeds Sanctioned Capacity, prorated
 * from the tariff's monthly slab down to the selected period's length. */
export function demandPenaltyRs(peakKVA: number, sanctionedKVA: number, periodHours: number): number {
  const excessKVA = Math.max(0, peakKVA - sanctionedKVA);
  const monthlyHours = 30 * 24;
  return excessKVA * EXCESS_DEMAND_PENALTY_RS_PER_KVA_PER_MONTH * (periodHours / monthlyHours);
}

/** DG fuel burn for the assumed standby duty cycle (see DG_PROFILE for the load-factor assumption). */
export function dgFuelConsumptionLPerDay(capacityKVA: number = DG_PROFILE.capacityKVA): number {
  return (
    capacityKVA *
    DG_PROFILE.typicalLoadFactor *
    DG_PROFILE.assumedRunHoursPerDay *
    DG_PROFILE.specificFuelConsumptionLPerKWh
  );
}

export function dgFuelCostRs(fuelConsumptionLPerDay: number): number {
  return fuelConsumptionLPerDay * DG_PROFILE.dieselPriceRsPerL;
}

// ---------------------------------------------------------------------------
// Additive rollups (distinct from the multiplicative series-line model used
// for compounding availabilities - see distributeRatioByWeight, reused
// as-is from manufacturingCalculations.ts for that case).
// ---------------------------------------------------------------------------

/** Splits a plant-level total across weighted rows that sum back to the total
 * exactly (Plant Power Breakdown, Gas by type, Chemical spend by type). */
export function distributeAdditiveByShare(total: number, shares: number[]): number[] {
  return shares.map((s) => total * s);
}

// ---------------------------------------------------------------------------
// Downtime & Economic Impact
// ---------------------------------------------------------------------------

export interface DowntimeImpactInputs {
  actualPct: number;
  targetPct: number;
  periodHours: number;
  affectedCapacityShare: number;
  productionTargetMW: number;
  contributionPerW: number;
}

export interface DowntimeImpactResult {
  shortfallPct: number;
  downtimeHours: number;
  lostProductionMW: number;
  economicImpactCr: number;
}

/**
 * Estimated production/economic impact of a utility running below its
 * availability target: downtime hours implied by the shortfall, the MW of
 * production that would be lost across the affected share of capacity, and
 * the ₹ Cr impact at the MD Dashboard's Contribution/W for the same scope
 * (same /10 conversion the MD/Manufacturing generators use: ₹/W x MW / 10 = ₹ Cr).
 */
export function computeDowntimeImpact({
  actualPct,
  targetPct,
  periodHours,
  affectedCapacityShare,
  productionTargetMW,
  contributionPerW,
}: DowntimeImpactInputs): DowntimeImpactResult {
  const shortfallPct = Math.max(0, targetPct - actualPct);
  const downtimeHours = periodHours * (shortfallPct / 100);
  const lostProductionMW = productionTargetMW * affectedCapacityShare * (shortfallPct / 100);
  const economicImpactCr = (contributionPerW * lostProductionMW) / 10;
  return { shortfallPct, downtimeHours, lostProductionMW, economicImpactCr };
}

// ---------------------------------------------------------------------------
// Data-quality / invariant checks (correction #7)
// ---------------------------------------------------------------------------

/**
 * Verifies `actual` is within `tolerance` of `expected`; warns in development
 * rather than silently rendering an inconsistent number. No test framework is
 * configured in this repo, so this lightweight assertion is the convention
 * used both here and in the optional Playwright checks.
 */
export function assertInvariant(label: string, actual: number, expected: number, tolerance = 0.5): boolean {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (!ok && process.env.NODE_ENV !== "production") {
    console.warn(
      `[utility data-quality] ${label}: expected ~${expected.toFixed(3)}, got ${actual.toFixed(3)} (diff ${(
        actual - expected
      ).toFixed(3)})`,
    );
  }
  return ok;
}

// ---------------------------------------------------------------------------
// Formatters (unit-specific; ₹/W, ₹ Cr, % etc. are reused from calculations.ts)
// ---------------------------------------------------------------------------

export function formatMWh(value: number, digits = 1): string {
  return `${value.toFixed(digits)} MWh`;
}

export function formatKL(value: number, digits = 1): string {
  return `${value.toFixed(digits)} KL`;
}

export function formatUnitValue(value: number, unit: string, digits = 1): string {
  return `${value.toFixed(digits)} ${unit}`;
}
