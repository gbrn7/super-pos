# Separate Setup Wizard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exclude setup pages from `AppLayout` (sidebar) by resolving layout as `null` for `setup/` routes in `resources/js/app.tsx`.

**Architecture:** Update Inertia layout resolver in `app.tsx`.

**Tech Stack:** React 19, Inertia.js v3.

---

### Task 1: Update Inertia Layout Resolver in `app.tsx`

**Files:**
- Modify: `resources/js/app.tsx`

- [ ] **Step 1: Add setup/ layout case in `resources/js/app.tsx`**

```tsx
case name.startsWith('setup/'):
    return null;
```

- [ ] **Step 2: Run `npm run build` and Pest feature tests**
- [ ] **Step 3: Commit changes**
