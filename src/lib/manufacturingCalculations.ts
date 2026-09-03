/**
 * Pure calculation functions for the Manufacturing Plant Dashboard.
 * Kept separate from the MD dashboard's calculations.ts so the two KPI
 * systems can evolve independently even though several concepts (status
 * bands, percentage formatting) are intentionally reused from there.
 */
import type { Status } from "@/types/dashboard";

export function totalCellOutputMW(goodMW: number, mediumMW: number, lowMW: number): number {
  return goodMW + mediumMW + lowMW;
}

export function productionVariance(actualMW: number, targetMW: number): number {
  return actualMW - targetMW;
}

export function productionAchievementPct(actualMW: number, targetMW: number): number {
  return (actualMW / targetMW) * 100;
}

/** Available capacity may be lower than installed capacity due to planned/unplanned downtime. */
export function availableCapacityMW(installedMW: number, availabilityPct: number): number {
  return (installedMW * availabilityPct) / 100;
}

/** Capacity Utilization = Actual Production / Available Production Capacity x 100 (NOT installed capacity). */
export function capacityUtilizationPct(actualMW: number, availableMW: number): number {
  return (actualMW / availableMW) * 100;
}

export function waferToCellYieldPct(waferInputMn: number, cellOutputMn: number): number {
  return (cellOutputMn / waferInputMn) * 100;
}

export function waferBreakagePct(brokenWafersMn: number, waferInputMn: number): number {
  return (brokenWafersMn / waferInputMn) * 100;
}

export function processStepYieldPct(inputMn: number, outputMn: number): number {
  return (outputMn / inputMn) * 100;
}

/** OEE = Availability x Performance x Quality (all as 0-100 percentages). */
export function oeePct(availabilityPct: number, performancePct: number, qualityPct: number): number {
  return (availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100) * 100;
}

export function firstPassYieldPct(passedFirstTimeMn: number, enteredAssessmentMn: number): number {
  return (passedFirstTimeMn / enteredAssessmentMn) * 100;
}

export function reworkPct(reworkedMn: number, relevantProcessedMn: number): number {
  return (reworkedMn / relevantProcessedMn) * 100;
}

export function finalQualityPassPct(passedFinalMn: number, undergoingFinalMn: number): number {
  return (passedFinalMn / undergoingFinalMn) * 100;
}

/**
 * Distributes a single plant-level ratio (e.g. overall yield or overall
 * equipment availability, 0-100) across weighted components so the product
 * of the component ratios reproduces the plant-level ratio exactly - a
 * series-line reliability model. Used to keep step-level yields and
 * equipment-level availability internally consistent with their plant-level
 * KPI instead of being independently randomized.
 */
export function distributeRatioByWeight(overallPct: number, weights: number[]): number[] {
  const lossBudget = -Math.log(overallPct / 100);
  return weights.map((w) => Math.exp(-lossBudget * w) * 100);
}

export function statusFromTolerance(actual: number, target: number, tolerance: number): Status {
  const deviation = Math.abs(actual - target);
  if (deviation <= tolerance) return "good";
  if (deviation <= tolerance * 1.6) return "watch";
  return "critical";
}
