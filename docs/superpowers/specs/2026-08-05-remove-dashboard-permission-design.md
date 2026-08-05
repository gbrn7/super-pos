# Design Spec: Remove Permission Requirement for Dashboard Module

**Date:** 2026-08-05  
**Status:** Approved  

## 1. Goal
Remove the `read-dashboard` permission requirement so that the Dashboard module is accessible to all authenticated users/roles across both backend API and frontend UI.

## 2. Changes Summary
- **Backend Controller (`ApiDashboardController.php`)**: Remove `Middleware('permission:'.DashboardPermissionEnums::READ_DASHBOARD->value, only: ['index'])`.
- **Frontend Navigation (`app-sidebar.tsx`)**: Remove `permission: PERMISSIONENUMS.DASHBOARD.READ` from the Dashboard menu item.
- **Frontend Permission List (`PermissionEnums.ts`)**: Remove Dashboard group (`DashboardPermissionEnums.READ`) from `PERMISSIONLIST` so it does not appear in Role/User permission assignment tables.
- **Automated Tests**: Update tests in `tests/Feature/Dashboard/` to verify that authenticated users can access the dashboard without needing `read-dashboard` permission assigned.

## 3. Security Considerations
Dashboard data is still protected by standard authentication (`auth:sanctum` / auth middleware). Unauthenticated users will continue to receive 401 Unauthorized.
