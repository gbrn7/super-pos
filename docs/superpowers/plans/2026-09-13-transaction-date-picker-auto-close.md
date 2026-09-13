# Transaction Date Picker Auto-Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically close the date picker popovers when a start date or end date is selected in the Transaction module's table filter and export modal.

**Architecture:** Introduce controlled open state (`openStartDate`, `openEndDate`) via React `useState` for the Popover components in `data-table.tsx` and `export-modal.tsx`. Pass `open` and `onOpenChange` to `<Popover>`, and dismiss the popover (`setOpen*(false)`) on calendar date selection (`onSelect`).

**Tech Stack:** React 19, Inertia.js v3, Radix UI Popover / Shadcn UI, TypeScript, Vite.

## Global Constraints
- Preserve all existing filter logic, query parameter callbacks, and formatting in `data-table.tsx` and `export-modal.tsx`.
- Follow established project conventions for React state and Shadcn UI Popover usage.
- Ensure type-checking passes with `npm run types:check` and lint passes with `npm run lint:check`.

---

### Task 1: Add Controlled Auto-Close Popover State in Transaction DataTable Filter

**Files:**
- Modify: `resources/js/pages/transaction/data-table.tsx`

**Interfaces:**
- Consumes: `onChangeStartDate: (date: string | null) => void`, `onChangeEndDate: (date: string | null) => void`
- Produces: Controlled popover visibility state `openStartDate` and `openEndDate`

- [ ] **Step 1: Add state declarations in `data-table.tsx`**

In `resources/js/pages/transaction/data-table.tsx`, declare:
```tsx
const [openStartDate, setOpenStartDate] = React.useState(false);
const [openEndDate, setOpenEndDate] = React.useState(false);
```

- [ ] **Step 2: Bind `open` and `onOpenChange` and close on `onSelect` for Start Date filter**

Update the Start Date `<Popover>` and `<CalendarPicker>`:
```tsx
<Popover open={openStartDate} onOpenChange={setOpenStartDate}>
    <PopoverTrigger asChild>
        <Button
            variant="outline"
            disabled={processing}
            className="w-full justify-start text-left font-normal text-sm h-9"
        >
            {queryParam.start_date ? (
                new Date(
                    queryParam.start_date,
                ).toLocaleDateString('id-ID')
            ) : (
                <span className="text-muted-foreground">{t('component.data_table.filter.start_date_label', 'Pilih Tanggal Mulai')}</span>
            )}
        </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
            mode="single"
            selected={
                queryParam.start_date
                    ? new Date(queryParam.start_date)
                    : undefined
            }
            onSelect={(date) => {
                if (date) {
                    const year = date.getFullYear();
                    const month = String(
                        date.getMonth() + 1,
                    ).padStart(2, '0');
                    const day = String(
                        date.getDate(),
                    ).padStart(2, '0');
                    onChangeStartDate(
                        `${year}-${month}-${day}`,
                    );
                    setOpenStartDate(false);
                } else {
                    onChangeStartDate(null);
                }
            }}
        />
    </PopoverContent>
</Popover>
```

- [ ] **Step 3: Bind `open` and `onOpenChange` and close on `onSelect` for End Date filter**

Update the End Date `<Popover>` and `<CalendarPicker>`:
```tsx
<Popover open={openEndDate} onOpenChange={setOpenEndDate}>
    <PopoverTrigger asChild>
        <Button
            variant="outline"
            disabled={processing}
            className="w-full justify-start text-left font-normal text-sm h-9"
        >
            {queryParam.end_date ? (
                new Date(
                    queryParam.end_date,
                ).toLocaleDateString('id-ID')
            ) : (
                <span className="text-muted-foreground">{t('component.data_table.filter.end_date_label', 'Pilih Tanggal Akhir')}</span>
            )}
        </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
            mode="single"
            selected={
                queryParam.end_date
                    ? new Date(queryParam.end_date)
                    : undefined
            }
            onSelect={(date) => {
                if (date) {
                    const year = date.getFullYear();
                    const month = String(
                        date.getMonth() + 1,
                    ).padStart(2, '0');
                    const day = String(
                        date.getDate(),
                    ).padStart(2, '0');
                    onChangeEndDate(
                        `${year}-${month}-${day}`,
                    );
                    setOpenEndDate(false);
                } else {
                    onChangeEndDate(null);
                }
            }}
        />
    </PopoverContent>
</Popover>
```

- [ ] **Step 4: Run type check to verify no TypeScript issues**

Run: `npm run types:check`
Expected: Output without errors in `resources/js/pages/transaction/data-table.tsx`.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/transaction/data-table.tsx
git commit -m "feat(transaction): auto-close date picker popovers on filter selection"
```

---

### Task 2: Add Controlled Auto-Close Popover State in Transaction Export Modal

**Files:**
- Modify: `resources/js/pages/transaction/dialog-modal/export-modal.tsx`

**Interfaces:**
- Consumes: `startDate: string`, `endDate: string`, `setStartDate: (date: string) => void`, `setEndDate: (date: string) => void`
- Produces: Controlled popover visibility state `openStartDate` and `openEndDate`

- [ ] **Step 1: Add state declarations in `export-modal.tsx`**

In `resources/js/pages/transaction/dialog-modal/export-modal.tsx`, declare:
```tsx
const [openStartDate, setOpenStartDate] = useState(false);
const [openEndDate, setOpenEndDate] = useState(false);
```

- [ ] **Step 2: Bind `open` and `onOpenChange` and close on `onSelect` for Start Date**

Update the Start Date `<Popover>` and `<CalendarPicker>`:
```tsx
<Popover open={openStartDate} onOpenChange={setOpenStartDate}>
    <PopoverTrigger asChild>
        <Button
            variant="outline"
            className="h-9 w-full justify-start text-left text-xs font-normal"
        >
            {startDate ? (
                new Date(
                    startDate,
                ).toLocaleDateString('id-ID')
            ) : (
                <span className="text-muted-foreground">
                    Pilih Tanggal
                </span>
            )}
        </Button>
    </PopoverTrigger>
    <PopoverContent
        className="w-auto p-0"
        align="start"
    >
        <CalendarPicker
            mode="single"
            selected={
                startDate
                    ? new Date(startDate)
                    : undefined
            }
            onSelect={(date) => {
                if (date) {
                    const iso = new Date(
                        date.getTime() -
                            date.getTimezoneOffset() *
                                60000,
                    )
                        .toISOString()
                        .slice(0, 10);
                    setStartDate(iso);
                    setOpenStartDate(false);
                }
            }}
        />
    </PopoverContent>
</Popover>
```

- [ ] **Step 3: Bind `open` and `onOpenChange` and close on `onSelect` for End Date**

Update the End Date `<Popover>` and `<CalendarPicker>`:
```tsx
<Popover open={openEndDate} onOpenChange={setOpenEndDate}>
    <PopoverTrigger asChild>
        <Button
            variant="outline"
            className="h-9 w-full justify-start text-left text-xs font-normal"
        >
            {endDate ? (
                new Date(
                    endDate,
                ).toLocaleDateString('id-ID')
            ) : (
                <span className="text-muted-foreground">
                    Pilih Tanggal
                </span>
            )}
        </Button>
    </PopoverTrigger>
    <PopoverContent
        className="w-auto p-0"
        align="start"
    >
        <CalendarPicker
            mode="single"
            selected={
                endDate
                    ? new Date(endDate)
                    : undefined
            }
            onSelect={(date) => {
                if (date) {
                    const iso = new Date(
                        date.getTime() -
                            date.getTimezoneOffset() *
                                60000,
                    )
                        .toISOString()
                        .slice(0, 10);
                    setEndDate(iso);
                    setOpenEndDate(false);
                }
            }}
        />
    </PopoverContent>
</Popover>
```

- [ ] **Step 4: Run type check and linter to verify cleanliness**

Run: `npm run types:check && npm run lint:check`
Expected: Output without errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/transaction/dialog-modal/export-modal.tsx
git commit -m "feat(transaction): auto-close date picker popovers in export modal"
```

---

### Task 3: Verification & Formatting

**Files:**
- Modify: `resources/js/pages/transaction/data-table.tsx`
- Modify: `resources/js/pages/transaction/dialog-modal/export-modal.tsx`

- [ ] **Step 1: Format codebase**

Run: `npm run format:check` (or `npm run format`)

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Successful Vite build with no compilation or bundling errors.

- [ ] **Step 3: Commit any formatting updates if needed**

```bash
git add resources/
git commit -m "style: format transaction components"
```
