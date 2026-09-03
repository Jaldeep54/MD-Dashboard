const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseISODate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function formatDateLong(iso: string): string {
  const { year, month, day } = parseISODate(iso);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatMonthYear(iso: string): string {
  const { year, month } = parseISODate(iso);
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatYear(iso: string): string {
  const { year } = parseISODate(iso);
  return `${year}`;
}

export function monthKey(iso: string): string {
  const { year, month } = parseISODate(iso);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex];
}

export const MONTH_NAMES = MONTHS;

function toUTCDate(iso: string): Date {
  const { year, month, day } = parseISODate(iso);
  return new Date(Date.UTC(year, month - 1, day));
}

/** ISO-ish week number within the year (simple Jan-1-anchored scheme, not ISO 8601). */
export function weekOfYear(iso: string): number {
  const date = toUTCDate(iso);
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return Math.floor(days / 7) + 1;
}

export function weekKey(iso: string): string {
  const { year } = parseISODate(iso);
  return `${year}-W${String(weekOfYear(iso)).padStart(2, "0")}`;
}

/** Label for the Monday-start week containing the given date, e.g. "24-30 Aug 2026". */
export function formatWeekLabel(iso: string): string {
  const date = toUTCDate(iso);
  const dow = date.getUTCDay(); // 0 = Sunday
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const mMonth = MONTHS[monday.getUTCMonth()];
  const sMonth = MONTHS[sunday.getUTCMonth()];
  const year = sunday.getUTCFullYear();

  if (mMonth === sMonth) {
    return `${monday.getUTCDate()}-${sunday.getUTCDate()} ${mMonth} ${year}`;
  }
  return `${monday.getUTCDate()} ${mMonth} - ${sunday.getUTCDate()} ${sMonth} ${year}`;
}
