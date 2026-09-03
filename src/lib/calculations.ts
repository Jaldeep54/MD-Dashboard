import { AVG_CELL_WATTAGE } from "@/lib/constants";
import type { Status } from "@/types/dashboard";

/** Shared MW / cell-count unit toggle for the Production Performance, Production
 * vs Target, Production Trend, and Cell Line Performance views. */
export type ProductionUnit = "mw" | "lacs";

export function capacityAvailabilityPct(availableMW: number, theoreticalMW: number): number {
  return (availableMW / theoreticalMW) * 100;
}

export function utilizationOfAvailablePct(actualMW: number, availableMW: number): number {
  return (actualMW / availableMW) * 100;
}

export function overallCapacityUtilizationPct(actualMW: number, theoreticalMW: number): number {
  return (actualMW / theoreticalMW) * 100;
}

export function processYieldPct(waferInputMn: number, cellOutputMn: number): number {
  return (cellOutputMn / waferInputMn) * 100;
}

export function achievementPct(actual: number, target: number): number {
  return (actual / target) * 100;
}

export function variance(actual: number, target: number): number {
  return actual - target;
}

/**
 * For metrics where higher-is-better (production, yield, capacity, value, contribution).
 * `goodBandPct` gives a small deadband around target so near-target noise still reads
 * as "good" rather than flipping to "watch" on a fractional shortfall.
 */
export function statusHigherIsBetter(
  actual: number,
  target: number,
  tolerancePct = 2,
  goodBandPct = 1,
): Status {
  const pct = (actual / target) * 100;
  if (pct >= 100 - goodBandPct) return "good";
  if (pct >= 100 - tolerancePct) return "watch";
  return "critical";
}

/** For metrics where lower-is-better (cost). See statusHigherIsBetter for `goodBandPct`. */
export function statusLowerIsBetter(
  actual: number,
  target: number,
  tolerancePct = 2,
  goodBandPct = 1,
): Status {
  const pct = (actual / target) * 100;
  if (pct <= 100 + goodBandPct) return "good";
  if (pct <= 100 + tolerancePct) return "watch";
  return "critical";
}

export function formatMW(value: number, digits = 1): string {
  return `${value.toFixed(digits)} MW`;
}

export function formatGW(value: number, digits = 2): string {
  return `${(value / 1000).toFixed(digits)} GW`;
}

export function formatMn(value: number, digits = 2): string {
  return `${value.toFixed(digits)} Mn`;
}

/**
 * Cell/wafer quantities are displayed in "Lacs" per the plant's convention,
 * where 1 Lakh = 10 Lacs (i.e. Lacs = underlying millions-of-cells value x 10).
 * This is NOT the standard Indian numbering definition of "Lac" (a synonym
 * for Lakh) - it is this dashboard's own display unit, so the conversion is
 * applied deliberately rather than just relabeling "Mn" as "Lacs".
 */
export function formatLacsFromMn(valueMn: number, digits = 2): string {
  return `${(valueMn * 10).toFixed(digits)} Lacs`;
}

/** Cell count (in millions) implied by an MW value, using the plant's average cell wattage. */
export function mwToCellsMn(mw: number): number {
  return mw / AVG_CELL_WATTAGE;
}

/** Numeric value of an MW quantity in the selected production unit (no suffix). */
export function productionDisplayValue(mw: number, unit: ProductionUnit): number {
  return unit === "lacs" ? mwToCellsMn(mw) * 10 : mw;
}

export function productionUnitSuffix(unit: ProductionUnit): string {
  return unit === "lacs" ? "Lacs" : "MW";
}

/** Formats an MW quantity in the selected production unit, converting via the cell-wattage relationship when showing Lacs. */
export function formatProductionValue(mw: number, unit: ProductionUnit, digits = 2): string {
  return `${productionDisplayValue(mw, unit).toFixed(digits)} ${productionUnitSuffix(unit)}`;
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatRupeePerW(value: number, digits = 2): string {
  return `₹${value.toFixed(digits)}/W`;
}

export function formatCr(value: number, digits = 2): string {
  return `₹${value.toFixed(digits)} Cr`;
}

export function formatSigned(value: number, formatter: (v: number) => string): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatter(Math.abs(value))}`;
}

export function formatQuantity(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} Mn`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
