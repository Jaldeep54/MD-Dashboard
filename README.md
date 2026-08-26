# LAPLACE — MD Management Dashboard

An interactive Managing Director dashboard for **LAPLACE**, a 1.2 GW TOPCon solar
cell manufacturing plant. Built with Next.js, TypeScript, Tailwind CSS, and
Recharts, using structured dummy data designed to be swapped for real APIs
without touching the UI.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's here

- **Global filters** — Shift / Day / Month / Year period, date, and cell line
  scope, all of which actually recompute the dashboard.
- **Executive KPIs** — Production, Overall Capacity Utilization, Manufacturing
  Cost/W, Realised Value/W, Contribution/W, and Total Contribution, each
  clickable into a detail drawer.
- **Production, Capacity, Yield/Loss, Cost, and Value & Contribution
  sections** with interactive Recharts visualizations (bar, trend, donut,
  multi-line) and hover tooltips.
- **Cell Line Performance table** and a **Management Attention** exception
  panel that surfaces the 3–5 most important issues from the current data.
- **Drill-down drawers** for every KPI and every cell line.

## Architecture

- `src/types/dashboard.ts` — shared data model.
- `src/lib/` — manufacturing formulas (capacity, yield, cost, value,
  contribution), formatting helpers, and a seeded PRNG for deterministic
  dummy data.
- `src/data/generator.ts` — builds a full `DashboardData` object from
  `DashboardFilters`. This is the single seam to swap for a real API later
  (e.g. replace `generateDashboardData` with a `fetch` call of the same
  shape).
- `src/components/dashboard/` — all dashboard UI, data-driven and
  presentation-only.
- `src/components/ui/` — reusable primitives (Card, Dropdown, Drawer,
  SegmentedControl, StatusBadge, InfoTooltip).

## Manufacturing logic

Theoretical capacity is fixed at 1.2 GW/year and prorated to the selected
period (Year → Month → Day → Shift) using a 360-day/12-month/3-shift
calendar. All other formulas (capacity availability, utilization of
available capacity, overall capacity utilization, process yield,
contribution) follow the definitions in the product spec and are computed in
`src/lib/calculations.ts`.
