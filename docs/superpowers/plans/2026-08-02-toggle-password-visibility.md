# Toggle Password Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add password visibility toggle buttons (Eye/EyeOff icons) for Password and Confirm Password inputs in Step 3 of Setup Wizard.

**Architecture:** Add state hooks `showPassword` and `showConfirmPassword` in `resources/js/pages/setup/index.tsx`, and wrap input fields with toggle buttons.

---

### Task 1: Add Password Visibility Toggle in Setup Wizard

**Files:**
- Modify: `resources/js/pages/setup/index.tsx`

- [ ] **Step 1: Import `Eye` and `EyeOff` and add `showPassword`, `showConfirmPassword` state hooks**
- [ ] **Step 2: Wrap password & password confirmation inputs with toggle button UI**
- [ ] **Step 3: Run `npm run build` & Pest tests**
- [ ] **Step 4: Commit changes**
