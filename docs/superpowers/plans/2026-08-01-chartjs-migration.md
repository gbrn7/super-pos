# Migration from Recharts to Chart.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `recharts` with `chart.js` and `react-chartjs-2` across the codebase, updating shared chart components, Dashboard, DetailDialog, and auxiliary chart components.

**Architecture:** Update the shared `ChartContainer` wrapper to initialize Chart.js canvas elements with theme CSS variable injection, then rewrite Dashboard, DetailDialog, and remaining chart components to consume `react-chartjs-2`.

**Tech Stack:** React 19, TypeScript, `chart.js`, `react-chartjs-2`, Tailwind CSS v4, Inertia.js.

## Global Constraints
- Node package manager: `npm`
- Chart libraries: `chart.js` v4+, `react-chartjs-2` v5+
- Removed package: `recharts`

---

### Task 1: Package Dependencies Setup

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Chart.js and uninstall Recharts**
Run: `npm install chart.js react-chartjs-2 && npm uninstall recharts`

- [ ] **Step 2: Verify package.json**
Check `package.json` to confirm `chart.js` and `react-chartjs-2` are added under dependencies, and `recharts` is removed.

- [ ] **Step 3: Commit dependency changes**
Run: `git commit -am "deps: replace recharts with chart.js and react-chartjs-2"`

---

### Task 2: Refactor Shared Chart Wrapper Component

**Files:**
- Modify: `resources/js/components/ui/chart.tsx`

- [ ] **Step 1: Register Chart.js modules and rewrite `chart.tsx`**
Update `resources/js/components/ui/chart.tsx` to register `Chart.js` elements (`CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `BarElement`, `ArcElement`, `Title`, `Tooltip`, `Legend`, `Filler`) and adapt `ChartContainer` for `react-chartjs-2` rendering.

- [ ] **Step 2: Verify TypeScript compilation for `chart.tsx`**
Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit shared chart component**
Run: `git commit -am "refactor: update ChartContainer wrapper for Chart.js"`

---

### Task 3: Refactor Dashboard Page Charts

**Files:**
- Modify: `resources/js/pages/dashboard.tsx`

- [ ] **Step 1: Replace Recharts with Chart.js components in `dashboard.tsx`**
Update line chart, bar chart, and doughnut chart usages in `resources/js/pages/dashboard.tsx` to use `react-chartjs-2` (`Line`, `Bar`, `Doughnut`).

- [ ] **Step 2: Verify TypeScript types for dashboard**
Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit dashboard chart refactor**
Run: `git commit -am "refactor: migrate dashboard charts to Chart.js"`

---

### Task 4: Refactor Transaction Detail Dialog Chart

**Files:**
- Modify: `resources/js/pages/transaction/dialog-modal/detail-dialog.tsx`

- [ ] **Step 1: Replace Recharts PieChart with Chart.js Doughnut in `detail-dialog.tsx`**
Update `detail-dialog.tsx` to use `react-chartjs-2` `<Doughnut>` for profit/cost/discount breakdown.

- [ ] **Step 2: Verify TypeScript compilation for detail-dialog**
Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit detail dialog chart refactor**
Run: `git commit -am "refactor: migrate detail dialog breakdown chart to Chart.js"`

---

### Task 5: Refactor Remaining Auxiliary Chart Components & Final Build Check

**Files:**
- Modify: `resources/js/pages/chard-area-interactive.tsx`
- Modify: `resources/js/pages/data-table.tsx`

- [ ] **Step 1: Update auxiliary chart pages to Chart.js**
Refactor any remaining Recharts references in `chard-area-interactive.tsx` and `data-table.tsx`.

- [ ] **Step 2: Run type check and asset build**
Run: `npm run types:check && npm run build`

- [ ] **Step 3: Commit remaining changes**
Run: `git commit -am "refactor: finalize chart.js migration across all components"`
