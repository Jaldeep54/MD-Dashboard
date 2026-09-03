import type { CapacityInfo } from "@/types/manufacturing";

export function MfgCapacityWaterfall({ capacity }: { capacity: CapacityInfo }) {
  const { installedMW, availableMW, actualMW } = capacity;
  const unavailableMW = Math.max(0, installedMW - availableMW);
  const unusedAvailableMW = Math.max(0, availableMW - actualMW);

  const utilizedPct = (actualMW / installedMW) * 100;
  const unusedPct = (unusedAvailableMW / installedMW) * 100;
  const unavailablePct = (unavailableMW / installedMW) * 100;

  const segments = [
    { key: "utilized", label: "Actual Output", pct: utilizedPct, mw: actualMW, color: "var(--color-navy-700)" },
    { key: "unused", label: "Available, Not Utilized", pct: unusedPct, mw: unusedAvailableMW, color: "var(--color-warning-solid)" },
    { key: "unavailable", label: "Unavailable Capacity", pct: unavailablePct, mw: unavailableMW, color: "var(--color-ink-300)" },
  ];

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between text-[12.5px]">
        <span className="font-semibold text-[var(--color-ink-900)]">
          Installed Capacity: {installedMW.toFixed(1)} MW
        </span>
        <span className="text-[var(--color-ink-400)]">100%</span>
      </div>

      <div className="flex h-9 w-full overflow-hidden rounded-lg border border-[var(--color-border)]">
        {segments.map((s) => (
          <div
            key={s.key}
            className="group relative flex h-full items-center justify-center transition-[filter] hover:brightness-95"
            style={{ width: `${Math.max(s.pct, 0.5)}%`, background: s.color }}
          >
            {s.pct > 9 && (
              <span
                className={
                  "text-[11px] font-semibold tabular-nums " +
                  (s.key === "unavailable" ? "text-[var(--color-ink-700)]" : "text-white")
                }
              >
                {s.pct.toFixed(0)}%
              </span>
            )}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-navy-950)] px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {s.label}: {s.mw.toFixed(1)} MW ({s.pct.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink-500)]">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="font-medium text-[var(--color-ink-900)]">{s.mw.toFixed(1)} MW</span>
          </div>
        ))}
      </div>
    </div>
  );
}
