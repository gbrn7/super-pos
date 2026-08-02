# Remove Laravel Telescope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove Laravel Telescope package, providers, configuration, and migrations from the project.

**Architecture:** Clean up composer dependencies and code references for Telescope.

**Tech Stack:** PHP 8.4, Composer, Laravel 13, Pest PHP v4.

## Global Constraints
- Do not break existing feature tests or application initialization.

---

### Task 1: Uninstall Telescope Composer Package & Remove Files

**Files:**
- Remove: `config/telescope.php`
- Remove: `app/Providers/TelescopeServiceProvider.php`
- Remove: `database/migrations/2026_05_13_155549_create_telescope_entries_table.php`
- Modify: `bootstrap/providers.php`
- Modify: `composer.json`
- Modify: `.env`, `.env.example`, `.env.testing`

- [ ] **Step 1: Uninstall Telescope via Composer**

Run: `composer remove laravel/telescope`

- [ ] **Step 2: Remove Telescope files**

Remove:
- `config/telescope.php`
- `app/Providers/TelescopeServiceProvider.php`
- `database/migrations/2026_05_13_155549_create_telescope_entries_table.php`

- [ ] **Step 3: Remove TelescopeServiceProvider from bootstrap/providers.php**

Modify `bootstrap/providers.php` to remove `App\Providers\TelescopeServiceProvider::class`.

- [ ] **Step 4: Clean up environment files**

Remove `TELESCOPE_ENABLED` from `.env`, `.env.example`, and `.env.testing`.

- [ ] **Step 5: Run tests to verify application integrity**

Run: `php artisan test --compact`

- [ ] **Step 6: Commit changes**

```bash
git add .
git commit -m "refactor: remove laravel telescope dependency and config files"
```
