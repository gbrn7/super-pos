# Return Menus i18n Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed missing translation keys for return menu in sidebar and localize return action in transaction page.

**Architecture:** Inject JSON properties for return sidebar/action keys and consume them.

**Tech Stack:** React 19.

---

### Task 1: Update Locales JSON Files

**Files:**
- Modify: `resources/js/locales/id/translation.json`
- Modify: `resources/js/locales/en/translation.json`

- [ ] **Step 1: Add return keys to Indonesian locales file**

  Modify [translation.json (ID)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/id/translation.json):
  1. Add `"return_menu_label": "Retur Barang"` to `"sidebar"` block.
  2. Add `"return_btn": "Retur Barang"` to `"component.data_table.action_menu"` block.

- [ ] **Step 2: Add return keys to English locales file**

  Modify [translation.json (EN)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/en/translation.json):
  1. Add `"return_menu_label": "Product Returns"` to `"sidebar"` block.
  2. Add `"return_btn": "Return Items"` to `"component.data_table.action_menu"` block.

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/locales/id/translation.json resources/js/locales/en/translation.json
  git commit -m "feat: add return menu keys to ID and EN localization resource bundles"
  ```

---

### Task 2: Localize Transaction columns.tsx Action Item

**Files:**
- Modify: `resources/js/pages/transaction/columns.tsx`

- [ ] **Step 1: Replace Retur Barang label with t() call**

  Modify [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/transaction/columns.tsx) around line 278:

  ```tsx
                          {props?.onReturnClick && (
                              <DropdownMenuItem
                                  onClick={() => props.onReturnClick!(row.original)}
                              >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  {t(
                                      'component.data_table.action_menu.return_btn',
                                      'Retur Barang',
                                  )}
                              </DropdownMenuItem>
                          )}
  ```

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 2**

  ```bash
  git add resources/js/pages/transaction/columns.tsx
  git commit -m "feat: localize transaction dropdown action return menu option"
  ```
