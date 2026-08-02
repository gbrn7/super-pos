# Remove Timezone Input from Setup Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove timezone input from Step 2 of Setup Wizard while defaulting timezone to `Asia/Jakarta`.

**Architecture:** Remove timezone JSX element from `resources/js/pages/setup/index.tsx` and adjust validation in `SetupController.php`.

---

### Task 1: Update Frontend & Backend for Timezone Input Removal

**Files:**
- Modify: `resources/js/pages/setup/index.tsx`
- Modify: `app/Http/Controllers/SetupController.php`

- [ ] **Step 1: Remove timezone input JSX from `resources/js/pages/setup/index.tsx`**
- [ ] **Step 2: Update `timezone` validation in `SetupController.php`**
- [ ] **Step 3: Run `npm run build` & Pest tests**
- [ ] **Step 4: Commit changes**
