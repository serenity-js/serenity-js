# Spec: Integrate Historical Run Indicator into RunSelector

## Problem

When viewing a historical test run, the UI renders **two redundant elements** stacked vertically:

1. A full-width `HistoricalBanner` — purple accent bar showing "Viewing results from: 8294 — 17 Jul 2026 15:17 — 5m 28s" + "show latest" link
2. A `RunSelector` dropdown — showing the same run identity in its selected option

This costs 50–70px of vertical space, duplicates information, and on mobile (where the RunSelector is hidden when the banner is present), the user loses the ability to switch between runs.

## Solution

Remove the `HistoricalBanner` component from views that also have a `RunSelector`. Instead, visually modify the RunSelector itself when a historical run is selected, and render a "show latest" affordance inline within the same row.

## Affected Files

### Components to modify

- `app/components/common/RunSelector.ts` — gains visual state awareness + "show latest" link
- `app/components/scenarios/ScenariosView.ts` — remove HistoricalBanner, pass `isHistorical` + `onShowLatest` to RunSelector
- `app/components/errors/ErrorsView.ts` — same treatment
- `app/styles.css` — add `.run-selector-row--historical` styles, remove `.historical-banner + .run-selector-row { display: none }` mobile rule

### Components to keep unchanged

- `app/components/scenarios/ScenarioDetailView.ts` — this view has **no RunSelector** (it shows a single scenario). The HistoricalBanner remains here because there is no dropdown to absorb its role.
- `app/components/common/HistoricalBanner.ts` — keep the component (ScenarioDetailView still uses it); no changes needed.

### Interaction objects to create/modify

- Create `src/serenity/common/RunSelector.serenity.ts` — new interaction object for the enhanced RunSelector
- `src/serenity/common/HistoricalBanner.serenity.ts` — no changes (still used by ScenarioDetailView tests)

### Tests to create

- `spec/app/common/RunSelector.spec.ts` — component tests for the new behaviour

### Tests to update

- `spec/app/common/HistoricalBanner.spec.ts` — no changes needed (component still exists)
- Integration tests at `integration/html-reporter/` will continue to pass since the RunSelector IO is new and the HistoricalBanner IO is still valid for the ScenarioDetailView context

## Design: Enhanced RunSelector Component

### Props

```typescript
interface RunSelectorProps {
    activeTimestamp: string | null;
    history: ReportHistoryEntry[];
    onRunChange: (event: Event) => void;
    isHistorical: boolean;              // NEW — true when viewing a non-latest run
    showLatestHref?: string;            // NEW — href for the "show latest" link (e.g., "#/tests")
    onShowLatest?: () => void;          // NEW — callback alternative when href is not available
}
```

### Rendered Structure

**When `isHistorical` is false (viewing latest run):**

```html
<div class="run-selector-row">
    <select class="sort-select" aria-label="Select test run" ...>
        <option>8295 — 18 Jul 2026 01:06 — 95% pass rate</option>
        ...
    </select>
</div>
```

**When `isHistorical` is true:**

```html
<div class="run-selector-row run-selector-row--historical">
    <select class="sort-select run-select--historical" aria-label="Select test run (historical)" ...>
        <option>8294 — 17 Jul 2026 15:17 — 95% pass rate</option>
        ...
    </select>
    <a class="show-latest-link" href="#/tests">show latest</a>
</div>
```

### Visual Treatment

The `.run-select--historical` state uses the same accent colour language the banner used:

```css
.run-select--historical {
    background: var(--accent-light) url(...chevron...) no-repeat right 12px center;
    border-color: var(--accent);
}

.show-latest-link {
    font-size: var(--font-md);
    color: var(--accent);
    white-space: nowrap;
    text-decoration: underline;
    text-underline-offset: 2px;
}
```

This gives an ambient "something is different" signal via colour, while the "show latest" link provides a clear escape hatch.

### Accessibility

- When historical, `aria-label` on the select changes to `"Select test run (historical)"` to provide screen reader context
- The "show latest" link has meaningful text ("show latest") — no aria-label needed
- Colour is not the sole indicator — the "show latest" link text provides the semantic signal
- Keyboard: link is tabbable, select is tabbable — standard flow

## Design: CSS Changes

### Add

```css
.run-select--historical {
    background-color: var(--accent-light);
    border-color: var(--accent);
}

.run-select--historical:hover {
    border-color: var(--accent);
    filter: brightness(1.1);
}

.show-latest-link {
    font-size: var(--font-md);
    color: var(--accent);
    white-space: nowrap;
    text-decoration: underline;
    text-underline-offset: 2px;
    flex-shrink: 0;
}

.show-latest-link:hover {
    filter: brightness(1.2);
}
```

### Remove

```css
/* DELETE this mobile rule — no longer needed */
.historical-banner + .run-selector-row { display: none; }
```

### Keep

All existing `.historical-banner` styles remain (ScenarioDetailView still uses it).

## Design: View Changes

### ScenariosView.ts

Before:
```typescript
${historicalRun ? html`
    <${HistoricalBanner} label="Viewing results from:" runLabel=${...} subtitle=${...} showLatestHref="#/tests" onShowLatest=${() => {}} />
` : null}

${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} />` : null}
```

After:
```typescript
${history.length > 1 ? html`<${RunSelector}
    activeTimestamp=${activeRunTimestamp}
    history=${history}
    onRunChange=${onRunChange}
    isHistorical=${!!historicalRun}
    showLatestHref="#/tests"
/>` : null}
```

Remove the `HistoricalBanner` import if it becomes unused in this file.

### ErrorsView.ts

Same pattern — remove HistoricalBanner usage, pass `isHistorical` + `showLatestHref`/`onShowLatest` to RunSelector.

## Interaction Object: `RunSelector.serenity.ts`

```typescript
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import { By, Click, PageElement, Text, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class RunSelector<NET> extends InteractionObject<NET> {

    private selectElement = () =>
        this.child(By.css('select'))
            .describedAs('run selector dropdown');

    private showLatestLink = () =>
        this.child(By.css('.show-latest-link'))
            .describedAs('show latest link');

    selectedRun = (): QuestionAdapter<string> =>
        Value.of(this.selectElement())
            .describedAs('selected run timestamp');

    isHistorical = (): QuestionAdapter<boolean> =>
        Question.about('whether viewing historical run', async actor => {
            const el = await actor.answer(this.rootElement);
            const classes = await el.attribute('class');
            return (classes || '').includes('run-selector-row--historical');
        });

    showLatest = (): Task =>
        Task.where('#actor clicks show latest',
            Click.on(this.showLatestLink()),
        );

    showLatestLinkText = (): QuestionAdapter<string> =>
        Text.of(this.showLatestLink()).trim()
            .describedAs('show latest link text');
}
```

## Component Test Spec: `RunSelector.spec.ts`

### Test Cases

#### User-observable behaviour

1. **renders a dropdown with run options** — mount with 2+ history entries, verify the dropdown displays options
2. **selects the active run** — mount with `activeTimestamp` pointing to a specific run, verify `selectedRun()` matches
3. **does not show "show latest" link when viewing the latest run** — mount with `isHistorical: false`, verify the link is not present
4. **shows "show latest" link when viewing a historical run** — mount with `isHistorical: true`, verify link text is "show latest"
5. **"show latest" link has correct href** — mount with `showLatestHref: '#/tests'`, verify href attribute
6. **indicates historical state** — mount with `isHistorical: true`, verify `view.isHistorical()` returns true
7. **indicates non-historical state** — mount with `isHistorical: false`, verify `view.isHistorical()` returns false

#### Implementation contracts (raw Playwright)

8. **applies historical CSS class when isHistorical is true** — verify `.run-selector-row--historical` and `.run-select--historical` classes are present
9. **does not apply historical CSS class when isHistorical is false** — verify classes are absent
10. **invokes onRunChange when a different option is selected** — expose function, select different option, verify called
11. **invokes onShowLatest callback when link is clicked (no href)** — expose function, click link, verify called
12. **updates aria-label when historical** — verify aria-label includes "(historical)"

### Test Data Setup

Use `minimalData()` with a history array containing at least 2 entries (already present in the default factory). The component props will be:

```typescript
// Latest run state
{
    component: 'RunSelector',
    importPath: './components/common/RunSelector',
    props: {
        activeTimestamp: '2024-06-15T14:30:00.000Z',  // matches history[1] = latest
        history: '__DATA_PROP_history',                // passed from data
        onRunChange: '__noop',
        isHistorical: false,
    },
    data: minimalData(),
    dataAsProps: false,
    interactionObject: RunSelector,
}

// Historical run state
{
    component: 'RunSelector',
    importPath: './components/common/RunSelector',
    props: {
        activeTimestamp: '2024-06-14T10:00:00.000Z',  // matches history[0] = older run
        history: '__DATA_PROP_history',
        onRunChange: '__noop',
        isHistorical: true,
        showLatestHref: '#/tests',
    },
    data: minimalData(),
    dataAsProps: false,
    interactionObject: RunSelector,
}
```

Note: The `history` prop needs the actual array. Check how the mount fixture handles passing complex props — it may need to be inlined or passed via `dataAsProps`. Adjust based on what the fixture supports.

## Acceptance Criteria

1. When a user views the **latest** test run on any view with a RunSelector:
   - The RunSelector dropdown appears with its normal (neutral) styling
   - No "show latest" link is visible
   - No banner is visible

2. When a user views a **historical** test run on any view with a RunSelector:
   - The RunSelector dropdown has accent-coloured background and border (visually distinct)
   - A "show latest" link appears inline, to the right of the dropdown
   - Clicking "show latest" navigates to the latest run (removes `?run=` param)
   - No HistoricalBanner is rendered

3. When a user views a **historical** test run on the **ScenarioDetailView**:
   - The HistoricalBanner continues to appear (this view has no RunSelector)
   - Behaviour is unchanged from today

4. **Mobile (≤767px)**:
   - The RunSelector remains visible (not hidden) when viewing historical data
   - The "show latest" link wraps below the dropdown on narrow screens (flex-wrap)
   - The accent styling remains visible

5. **Accessibility**:
   - Screen readers announce "Select test run (historical)" when in historical state
   - "show latest" link is tabbable and has meaningful text
   - Colour is not the sole indicator of historical state (link text provides secondary signal)

## Migration Notes

- The `HistoricalBanner` component and its interaction object remain in the codebase — they are still used by `ScenarioDetailView`
- The `HistoricalBanner.spec.ts` tests continue to pass without modification
- The CSS `.historical-banner + .run-selector-row { display: none }` rule should be removed since the banner no longer appears adjacent to the RunSelector in any view
- No integration tests at `integration/html-reporter/` reference the HistoricalBanner — no integration test changes needed
- After the change, run `npm run compile` in `packages/html-reporter` (builds template bundle), then regenerate the example report with `npx failsafe example:clean example:test example:add-history` in `integration/html-reporter/` before running `npm test` there
