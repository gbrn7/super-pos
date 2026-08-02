# Setup Wizard Multi-Language (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full multi-language (EN & ID) support with a language switcher for the Quick Setup Wizard.

**Architecture:** Integrate `react-i18next` (`useTranslation`) with `resources/js/locales/{en,id}/translation.json` in `resources/js/pages/setup/index.tsx`.

**Tech Stack:** React 19, react-i18next, Inertia.js v3.

---

### Task 1: Add Setup Translation Keys to Locale JSON Files

**Files:**
- Modify: `resources/js/locales/en/translation.json`
- Modify: `resources/js/locales/id/translation.json`

- [ ] **Step 1: Add `"setup"` translation block to EN translation.json**
- [ ] **Step 2: Add `"setup"` translation block to ID translation.json**
- [ ] **Step 3: Commit translation JSON changes**

---

### Task 2: Refactor Setup Component to use `useTranslation` & Add Language Switcher

**Files:**
- Modify: `resources/js/pages/setup/index.tsx`

- [ ] **Step 1: Import `useTranslation` and add Language Switcher UI in header**
- [ ] **Step 2: Replace static strings with `t('setup...')` calls**
- [ ] **Step 3: Run `npm run build` & feature tests**
- [ ] **Step 4: Commit changes**
