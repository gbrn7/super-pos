# Remove Dashboard Permission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow all authenticated users/roles to access the Dashboard module by removing the `read-dashboard` permission restriction from backend controllers, frontend navigation, and permission lists.

**Architecture:** Remove `permission:read-dashboard` middleware from `ApiDashboardController`, remove permission checking for Dashboard in `app-sidebar.tsx`, and remove Dashboard from `PERMISSIONLIST` in `PermissionEnums.ts`. Update tests to verify dashboard accessibility without permissions.

**Tech Stack:** Laravel 13, React 19, TypeScript, Pest PHP

## Global Constraints

- Preserve basic authentication protection (`auth:sanctum` / logged-in user check).
- Follow Pest PHP testing conventions.
- Format modified PHP files using `vendor/bin/pint --dirty --format agent`.

---

### Task 1: Remove Dashboard Permission Check from Backend Controller & Update Tests

**Files:**
- Modify: `app/Http/Controllers/Api/ApiDashboardController.php:20-25`
- Modify: `tests/Feature/Dashboard/ApiDashboardControllerTest.php`
- Modify: `tests/Feature/Dashboard/DashboardReturnAdjustmentTest.php`

- [ ] **Step 1: Write/Update the failing test in Pest**

Update `tests/Feature/Dashboard/ApiDashboardControllerTest.php` to verify that an authenticated user without any permissions can successfully access the dashboard endpoint.

```php
it('allows authenticated user to view dashboard without explicit permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/dashboard')
        ->assertStatus(200)
        ->assertJson(['success' => true]);
});
```

- [ ] **Step 2: Run test to verify status**

Run: `php artisan test --compact --filter=ApiDashboardControllerTest`

- [ ] **Step 3: Remove permission middleware from ApiDashboardController**

In `app/Http/Controllers/Api/ApiDashboardController.php`, update `middleware()` method:

```php
    public static function middleware(): array
    {
        return [];
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact --filter=ApiDashboardControllerTest`
Expected: PASS

- [ ] **Step 5: Run Pint code formatter**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/ApiDashboardController.php tests/Feature/Dashboard/
git commit -m "feat(backend): remove permission requirement for dashboard api"
```

---

### Task 2: Remove Dashboard Permission Check from Frontend UI

**Files:**
- Modify: `resources/js/components/app-sidebar.tsx:65-79`
- Modify: `resources/js/support/enums/PermissionEnums.ts:157-164`

- [ ] **Step 1: Remove permission property from Dashboard sidebar item**

In `resources/js/components/app-sidebar.tsx`, change:

```typescript
        {
            title: t('component.sidebar.group_main', 'Utama'),
            items: [
                {
                    title: t(
                        'component.sidebar.dashboard_menu_label',
                        'Dasbor',
                    ),
                    href: dashboard(),
                    icon: LayoutGrid,
                    role: [],
                },
            ],
        },
```

- [ ] **Step 2: Remove Dashboard group from PERMISSIONLIST in PermissionEnums.ts**

In `resources/js/support/enums/PermissionEnums.ts`, remove lines 157-164 (`LABEL: t('permission_label.dashboard.permission', 'Dasbor')` and its `ACCESSLIST`).

- [ ] **Step 3: Run TypeScript & Frontend Build Check**

Run: `npm run build`
Expected: Success with no TypeScript or build errors.

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/app-sidebar.tsx resources/js/support/enums/PermissionEnums.ts
git commit -m "feat(frontend): remove dashboard permission check from sidebar and permission list"
```
