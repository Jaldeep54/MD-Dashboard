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
