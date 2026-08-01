# Design Spec: Migration from Recharts to Chart.js

**Date:** 2026-08-01  
**Target Files:**
- [`resources/js/components/ui/chart.tsx`](file:///home/raygbrn/project/laravel/super-pos/resources/js/components/ui/chart.tsx)
- [`resources/js/pages/dashboard.tsx`](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/dashboard.tsx)
- [`resources/js/pages/transaction/dialog-modal/detail-dialog.tsx`](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/transaction/dialog-modal/detail-dialog.tsx)
- [`resources/js/pages/chard-area-interactive.tsx`](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/chard-area-interactive.tsx)
- [`resources/js/pages/data-table.tsx`](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/data-table.tsx)

---

## 1. Executive Summary
Migrate all data visualization components in the application from `recharts` to `chart.js` & `react-chartjs-2`.

---

## 2. Dependencies & Configuration
1. Install `chart.js` and `react-chartjs-2`.
2. Remove `recharts`.
3. Register necessary `Chart.js` elements (`CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `BarElement`, `ArcElement`, `Title`, `Tooltip`, `Legend`, `Filler`) in the shared Chart wrapper (`chart.tsx`).

---

## 3. Component Architecture & Changes

### A. Shared Chart Wrapper (`resources/js/components/ui/chart.tsx`)
- Adapt `ChartContainer` to wrap `react-chartjs-2` canvas components.
- Inject dynamic theme CSS variables (`--color-*`) so colors remain consistent between Light and Dark mode.
- Maintain `ChartConfig` schema for backward compatibility and clean color management.

### B. Dashboard Page (`resources/js/pages/dashboard.tsx`)
- Convert AreaChart / BarChart / PieChart to Chart.js `<Line>`, `<Bar>`, and `<Doughnut>` components.
- Map dataset properties (e.g. sales trend over time, payment methods distribution, top products) to Chart.js structure.

### C. Transaction Detail Dialog (`resources/js/pages/transaction/dialog-modal/detail-dialog.tsx`)
- Convert profit/cost/discount breakdown Donut/Pie chart to Chart.js `<Doughnut>` component with center text plugin or custom overlay.

### D. Other Pages (`chard-area-interactive.tsx`, `data-table.tsx`)
- Refactor remaining Recharts occurrences to Chart.js to ensure complete removal of `recharts`.

---

## 4. Verification & Testing Strategy
- Run TypeScript checks (`npm run types:check`) to verify prop types.
- Build frontend assets (`npm run build`) to ensure bundle compiles cleanly without missing dependencies.
- Verify chart rendering, tooltip popups, responsive resizing, and dark mode styling.
