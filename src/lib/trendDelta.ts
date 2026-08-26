import { seededRandom } from "@/lib/prng";

/** Synthetic period-over-period delta (%) for KPI trend chips. Deterministic per seed. */
export function periodOverPeriodDelta(seedKey: string, magnitude = 4): number {
  const r = seededRandom(`pop-${seedKey}`)();
  return (r * 2 - 1) * magnitude;
}
