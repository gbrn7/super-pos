# Backend Setup i18n Messages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide localized backend response messages for SetupController actions using Laravel translation files (`lang/en/setup.php` and `lang/id/setup.php`).

**Architecture:** Create language files in `lang/{en,id}/setup.php` and wrap `SetupController` JSON messages with `__('setup...')`.

---

### Task 1: Create Translation Files and Update SetupController

**Files:**
- Create: `lang/en/setup.php`
- Create: `lang/id/setup.php`
- Modify: `app/Http/Controllers/SetupController.php`
- Modify: `tests/Feature/SetupControllerTest.php`

- [ ] **Step 1: Create `lang/en/setup.php` and `lang/id/setup.php`**
- [ ] **Step 2: Update `SetupController.php` to use `__('setup...')`**
- [ ] **Step 3: Update `SetupControllerTest.php` assertions for localized messages**
- [ ] **Step 4: Run Pest tests**
- [ ] **Step 5: Commit changes**
