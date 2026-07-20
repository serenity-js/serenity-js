---
status: done
completed: 2026-07-20
---

# Flaky vs Inconsistent: Four-Way Consistency Classification

## Context

The `RETRIED_SUCCESS` outcome, diagonal-split history dot, `retriedAndPassed` field, and consistency
score penalisation are **already implemented**. The data layer correctly distinguishes a retried pass
from a clean pass.

What remains is aligning the **presentation layer** — the dashboard consistency card, the consistency
view, and the about page — to use four distinct classifications instead of three.

## Current State

### Dashboard Consistency Card (`DashboardView.ts`, line ~60)

Currently labels items as:
- `newFailures` → "degraded"
- `newPasses` → "recovered"  
- everything else from `inconsistentTests` → "inconsistent"

**Problem:** A test that is flaky (all runs pass, but some need retry) is labelled "inconsistent" in
the dashboard. It should be labelled "flaky".

### Consistency View (`ConsistencyView.ts`, line ~35)

Currently classifies by last outcome only:
```typescript
const kind = lastOutcome === 'SUCCESS'
    ? 'recovered'
    : (lastOutcome === 'RETRIED_SUCCESS' || lastOutcome === 'PENDING' || lastOutcome === 'SKIPPED')
        ? 'inconsistent'
        : 'degraded';
```

**Problems:**
- A test with history `['RETRIED_SUCCESS', 'RETRIED_SUCCESS']` (flaky every run) is classified as
  "inconsistent" — should be "flaky"
- A test with history `['FAILURE', 'SUCCESS']` is classified as "recovered" — correct
- A test with history `['SUCCESS', 'RETRIED_SUCCESS']` is classified as "inconsistent" — should be "flaky"
- A test with history `['SUCCESS', 'FAILURE']` is classified as "degraded" — correct
- A test with history `['FAILURE', 'RETRIED_SUCCESS']` is classified as "inconsistent" — debatable,
  but should be "flaky" (it now passes, just not cleanly)

### Consistency View Filters

Currently has three filters: `Inconsistent | Degraded | Recovered`

Needs four: `Flaky | Inconsistent | Degraded | Recovered`

---

## Terminology

| Term | Definition | Build impact |
|------|-----------|--------------|
| **Flaky** | A test that fails on an earlier attempt but passes on a subsequent retry *within a single test run*. | Build goes green, but the test needed multiple tries. |
| **Inconsistent** | A test whose *final outcome* (after all retries are exhausted) differs across test runs. | Build goes red unpredictably. |
| **Degraded** | Was passing in the previous run, now failing. | Build newly broken. |
| **Recovered** | Was failing in the previous run, now passes cleanly on the first attempt (no retry). | Build fixed. |

### Classification Rules

Given the `history: string[]` array from `inconsistentTests` (contains `'SUCCESS'`, `'FAILURE'`,
`'RETRIED_SUCCESS'`, etc.):

```
1. Has any FAILURE in history AND last outcome is a failure?
   → "degraded" (was passing, now broken)

2. Has any FAILURE in history AND last outcome is SUCCESS (clean pass)?
   → "recovered" (was broken, now fixed)

3. Has any FAILURE in history AND last outcome is RETRIED_SUCCESS?
   → "inconsistent" (has genuinely failed before, currently surviving via retry)

4. No FAILURE in history (all outcomes are SUCCESS or RETRIED_SUCCESS)?
   → "flaky" (never genuinely fails, but needs retry to pass)
```

Simplified as code:
```typescript
function classifyConsistencyKind(history: string[]): string {
    const lastOutcome = history[history.length - 1];
    const hasFailure = history.some(o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS');

    if (!hasFailure) {
        return 'flaky';
    }
    if (lastOutcome === 'SUCCESS') {
        return 'recovered';
    }
    if (lastOutcome === 'RETRIED_SUCCESS') {
        return 'inconsistent';
    }
    return 'degraded';
}
```

---

## Changes Required

### 1. Dashboard Consistency Card

**File:** `packages/html-reporter/template/components/DashboardView.ts`

Replace the current `consistencyItems` logic (~line 60):

```typescript
const consistencyItems = useMemo(() => [
    ...newFailures.map(t => ({ ...t, kind: 'degraded' as const })),
    ...newPasses.map(t => ({ ...t, kind: 'recovered' as const })),
    ...inconsistent
        .filter(t => !newFailures.some(f => f.source.path === t.source.path)
                  && !newPasses.some(p => p.source.path === t.source.path))
        .map(t => {
            const hasFailure = (t.history || []).some(
                o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS'
            );
            return { ...t, kind: hasFailure ? 'inconsistent' as const : 'flaky' as const };
        }),
].slice(0, 5), [newFailures, newPasses, inconsistent]);
```

Update the kind icon/colour rendering in the card (~line 165):
```typescript
<span class="status-icon ${
    t.kind === 'degraded' ? 'status-icon--fail'
  : t.kind === 'recovered' ? 'status-icon--pass'
  : t.kind === 'flaky' ? 'status-icon--retried-success'
  : 'status-icon--warn'
}">${
    t.kind === 'degraded' ? '✗'
  : t.kind === 'recovered' ? '✓'
  : t.kind === 'flaky' ? '↻'
  : '⚠'
}</span>
```

Update the kind label colour:
```typescript
<span class="status-item-kind" style="color:${
    t.kind === 'degraded' ? 'var(--color-failed)'
  : t.kind === 'recovered' ? 'var(--color-passed)'
  : t.kind === 'flaky' ? 'var(--color-pending)'
  : 'var(--color-pending)'
}">${t.kind}</span>
```

### 2. Consistency View Classification

**File:** `packages/html-reporter/template/components/ConsistencyView.ts`

Replace the classification logic (~line 35):
```typescript
const allInconsistent = useMemo(() => inconsistentTests.map(t => {
    const lastOutcome = t.history && t.history.length > 0 ? t.history[t.history.length - 1] : null;
    const hasFailure = (t.history || []).some(o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS');

    let kind: string;
    if (!hasFailure) {
        kind = 'flaky';
    } else if (lastOutcome === 'SUCCESS') {
        kind = 'recovered';
    } else if (lastOutcome === 'RETRIED_SUCCESS') {
        kind = 'inconsistent';
    } else {
        kind = 'degraded';
    }
    return { ...t, kind, lastOutcome: lastOutcome || 'SKIPPED' };
}), []);
```

### 3. Consistency View Filters

**File:** `packages/html-reporter/template/components/ConsistencyView.ts`

Change the default filter from `'inconsistent'` to `'all'`:
```typescript
const [filter, setFilter] = useState('all');
```

Add counts for all four categories:
```typescript
const flakyCount = allInconsistent.filter(t => t.kind === 'flaky').length;
const inconsistentCount = allInconsistent.filter(t => t.kind === 'inconsistent').length;
const degradedCount = allInconsistent.filter(t => t.kind === 'degraded').length;
const recoveredCount = allInconsistent.filter(t => t.kind === 'recovered').length;
```

Update the filter items logic:
```typescript
const allItems = useMemo(() => {
    if (filter === 'flaky') return allInconsistent.filter(t => t.kind === 'flaky');
    if (filter === 'inconsistent') return allInconsistent.filter(t => t.kind === 'inconsistent');
    if (filter === 'degraded') return allInconsistent.filter(t => t.kind === 'degraded');
    if (filter === 'recovered') return allInconsistent.filter(t => t.kind === 'recovered');
    return allInconsistent;
}, [filter, allInconsistent]);
```

Replace the filter bar chips:
```html
<button class="filter-chip ${filter === 'all' ? 'active' : ''}" onClick=${() => setFilter('all')}
        aria-pressed=${filter === 'all'}>
  <span>All</span> <span class="count">${inconsistentTests.length}</span>
</button>
<button class="filter-chip ${filter === 'flaky' ? 'active' : ''}" onClick=${() => setFilter('flaky')}
        aria-pressed=${filter === 'flaky'}>
  <span>Flaky</span> <span class="count">${flakyCount}</span>
</button>
<button class="filter-chip ${filter === 'inconsistent' ? 'active' : ''}" onClick=${() => setFilter('inconsistent')}
        aria-pressed=${filter === 'inconsistent'}>
  <span>Inconsistent</span> <span class="count">${inconsistentCount}</span>
</button>
<button class="filter-chip failed ${filter === 'degraded' ? 'active' : ''}" onClick=${() => setFilter('degraded')}
        aria-pressed=${filter === 'degraded'}>
  <span>Degraded</span> <span class="count">${degradedCount}</span>
</button>
<button class="filter-chip passed ${filter === 'recovered' ? 'active' : ''}" onClick=${() => setFilter('recovered')}
        aria-pressed=${filter === 'recovered'}>
  <span>Recovered</span> <span class="count">${recoveredCount}</span>
</button>
```

### 4. ConsistencyRow Kind Rendering

**File:** `packages/html-reporter/template/components/rows/ConsistencyRow.ts`

The `kindIcon` function needs a "flaky" case:
```typescript
const kindIcon = (kind: string) => {
    if (kind === 'degraded') return html`<span class="scenario-outcome-icon failed">✗</span>`;
    if (kind === 'recovered') return html`<span class="scenario-outcome-icon passed">✓</span>`;
    if (kind === 'flaky') return html`<span class="scenario-outcome-icon retried-success">↻</span>`;
    return html`<span class="scenario-outcome-icon pending">⚠</span>`;
};
```

### 5. About Page

**File:** `packages/html-reporter/template/components/AboutView.ts`

Locate the Consistency section (currently describes "inconsistent outcomes across recent runs") and
replace with:

```
Consistency

Tests with reliability issues across recent runs. Classifies tests based on their execution pattern:

• Flaky — passes if retried within a single run, but needed multiple attempts. The build goes green,
  but the test is unreliable.
• Inconsistent — final outcome differs across runs even after retries. The build fails unpredictably.
• Degraded — was passing in the previous run, now failing.
• Recovered — was failing in the previous run, now passes cleanly without needing retry.
```

Update the glossary definitions if present:

```
Flaky
  A test that fails on an earlier attempt but passes on a subsequent retry within a single test run.
  The build succeeds, but the test needed multiple tries to get there.

Inconsistent
  A test whose final outcome (after all retries are exhausted) differs across test runs.
  The build fails unpredictably.

Degraded
  A test that was passing in the previous run but is now failing.

Recovered
  A test that was failing in the previous run but now passes cleanly on the first attempt.
  A test that now passes only via retry is "flaky", not "recovered".
```

---

## Acceptance Criteria

### AC-1: Flaky test labelled correctly in dashboard

```
Given a test with history ['RETRIED_SUCCESS', 'RETRIED_SUCCESS'] (flaky every run)
When the Dashboard consistency card is displayed
Then the test is labelled "flaky" (not "inconsistent")
And its icon is ↻ with pending colour
```

### AC-2: Inconsistent test labelled correctly in dashboard

```
Given a test with history ['FAILURE', 'RETRIED_SUCCESS'] (genuinely failed, now passes via retry)
When the Dashboard consistency card is displayed
Then the test is labelled "inconsistent"
And its icon is ⚠ with pending colour
```

### AC-3: Consistency view has four filter chips

```
Given the Consistency view is displayed with mixed test types
Then the filter bar shows: All (N) | Flaky (N) | Inconsistent (N) | Degraded (N) | Recovered (N)
And each chip shows the correct count
And clicking a chip filters to show only tests of that classification
```

### AC-4: Flaky filter shows only flaky tests

```
Given a test with history ['SUCCESS', 'RETRIED_SUCCESS'] (never genuinely failed)
When the user clicks the "Flaky" filter chip
Then that test is visible
And tests with FAILURE in their history are NOT visible
```

### AC-5: Inconsistent filter excludes flaky-only tests

```
Given a test with history ['RETRIED_SUCCESS', 'RETRIED_SUCCESS'] (never genuinely failed)
When the user clicks the "Inconsistent" filter chip
Then that test is NOT visible
```

### AC-6: Degraded uses current run outcome

```
Given a test with history ['SUCCESS', 'FAILURE'] (was passing, now fails)
When the Consistency view is displayed
Then the test is labelled "degraded"
```

### AC-7: Recovered requires clean pass

```
Given a test with history ['FAILURE', 'RETRIED_SUCCESS'] (was failing, now passes via retry)
Then the test is NOT labelled "recovered"
And it is labelled "inconsistent"
```

### AC-8: True recovery requires clean pass

```
Given a test with history ['FAILURE', 'SUCCESS'] (was failing, now passes cleanly)
Then the test is labelled "recovered"
```

### AC-9: Dashboard and consistency view agree on classification

```
Given a test that appears in the dashboard consistency card as "flaky"
When the user clicks "View all →" and navigates to the Consistency view
Then the same test is also classified as "flaky" in the Consistency view
```

### AC-10: Default filter is "all"

```
Given the user navigates to the Consistency view
Then all tests are shown (no pre-filtering)
And the "All" filter chip is active
```

### AC-11: About page explains all four classifications

```
Given the user navigates to the About page
Then the Consistency section defines: flaky, inconsistent, degraded, and recovered
And each definition matches the terminology in this spec
```

---

## Files to Modify

| File | Change |
|------|--------|
| `template/components/DashboardView.ts` | Split "inconsistent" into "flaky" vs "inconsistent" in consistency card |
| `template/components/ConsistencyView.ts` | Four-way classification, four filter chips, default filter "all" |
| `template/components/rows/ConsistencyRow.ts` | Add "flaky" kind icon (↻) |
| `template/components/AboutView.ts` | Update Consistency section with four definitions |

## Tests to Write or Update

| File | What to test |
|------|-------------|
| `spec/components/DashboardView.spec.ts` | Flaky test shows "flaky" label (not "inconsistent") |
| `spec/components/DashboardView.spec.ts` | All four categories render with correct icons |
| `spec/components/ConsistencyView.spec.ts` | Four filter chips with correct counts |
| `spec/components/ConsistencyView.spec.ts` | Flaky filter excludes tests with FAILURE in history |
| `spec/components/ConsistencyView.spec.ts` | Default filter is "all" |
| `spec/components/ConsistencyView.spec.ts` | Classification logic: flaky vs inconsistent vs degraded vs recovered |

---

## Design Decisions

### Why "recovered" requires a clean pass (SUCCESS, not RETRIED_SUCCESS)?

If a test previously failed and now passes only via retry, it hasn't truly recovered — it's moved from
"inconsistent" to "flaky." Recovery means the underlying problem was fixed, evidenced by passing on
the first attempt.

### Why is ['FAILURE', 'RETRIED_SUCCESS'] classified as "inconsistent" not "flaky"?

The test has genuinely failed at some point (all retries exhausted). Even though it currently passes
via retry, the presence of a genuine failure in history indicates a deeper problem than pure flakiness.
"Flaky" is reserved for tests that never genuinely block the build.

### Why default to "all" instead of a specific filter?

Users arrive at the consistency view from the dashboard "View all →" link expecting to see everything.
Pre-filtering hides items they may have just seen on the dashboard, creating confusion.

---

## Implementation Notes (from architect review)

### 1. Add Missing CSS Class

`styles.css` has no `.scenario-outcome-icon.retried-success` variant. Add it after line 572 (alongside
the other `.scenario-outcome-icon.*` classes):

```css
.scenario-outcome-icon.retried-success { background: var(--color-pending-bg); color: var(--color-pending); }
```

Without this, the `ConsistencyRow` icon for flaky tests will render without background/colour styling.

### 2. Extract `classifyConsistencyKind()` to `utils/selectors.ts`

Both `DashboardView` and `ConsistencyView` need the same classification logic. To avoid duplication
(per Phase 6 conventions), place it in `utils/selectors.ts` and import from both call sites:

```typescript
export type ConsistencyKind = 'flaky' | 'inconsistent' | 'degraded' | 'recovered';

export function classifyConsistencyKind(history: string[]): ConsistencyKind {
    const lastOutcome = history[history.length - 1];
    const hasFailure = history.some(o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS');

    if (!hasFailure) return 'flaky';
    if (lastOutcome === 'SUCCESS') return 'recovered';
    if (lastOutcome === 'RETRIED_SUCCESS') return 'inconsistent';
    return 'degraded';
}
```

Export from `utils/index.ts` as well.

### 3. Create `spec/components/ConsistencyView.spec.ts` (New File)

This file does not exist — it must be created. Use the existing `spec/components/DashboardView.spec.ts`
as a structural reference for how component tests are set up in this project (Playwright Test with
the esbuild-based component fixture).

### 4. ConsistencyRow Icon Rendering

The current `ConsistencyRow.ts` renders the icon using:
```typescript
<span class="scenario-outcome-icon ${outcomeClass(t.lastOutcome)}">${outcomeIcon(t.lastOutcome)}</span>
```

This already handles `RETRIED_SUCCESS` correctly (maps to class `retried-success` and icon `↻`) via
the existing `outcomeClass` and `outcomeIcon` utilities. However, the `kind`-based label/colour in
the row's meta area should also be rendered. Either:

- Keep the icon based on `lastOutcome` (shows the actual test result) — this is simpler and already works
- Add a kind badge/label next to the icon showing "flaky", "inconsistent", etc. with the appropriate colour

The dashboard consistency card (section 1 of this spec) shows a kind label with colour. The
ConsistencyRow should show the same kind label for consistency between the two views. Use:

```typescript
<span class="status-item-kind" style="color:${
    t.kind === 'degraded' ? 'var(--color-failed)'
  : t.kind === 'recovered' ? 'var(--color-passed)'
  : 'var(--color-pending)'
}">${t.kind}</span>
```

### 5. Verification

After implementation, run:
```bash
cd packages/html-reporter
npx tsc --project template/tsconfig.json --noEmit
node scripts/bundle-template.mjs
npx playwright test --project=unit
npx playwright test --project=components
```

All must pass. Additionally, generate a report with test data that includes `RETRIED_SUCCESS` outcomes
and visually verify that the dashboard card and consistency view both classify tests correctly with
four distinct labels.
