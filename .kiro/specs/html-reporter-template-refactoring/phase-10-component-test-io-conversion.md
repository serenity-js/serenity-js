---
status: outstanding
---

# Phase 10: Complete Component Test IO Conversion

## Goal

Convert all remaining raw Playwright `page.locator()` + `expect()` component tests to
idiomatic Serenity/JS interaction object pattern, completing the work started in phase 9.

## Context

Phase 9 converted the 6 highest-impact files (CapabilitiesView, ExecutionHistory, PhotoStrip,
ActivityNode, SegmentedBar, Delta). 15 files remain with raw Playwright usage. Some are
intentionally raw (accessibility contracts, visual rendering), others need conversion.

## Remaining Files

### User-behaviour tests (convert to IO)

| # | File | Raw usages | Notes |
|---|------|-----------|-------|
| 10.1 | DeepLinking.spec.ts | 17 | URL/hash navigation state restoration |
| 10.2 | HistoricalBanner.spec.ts | 17 | Historical run banner component |
| 10.3 | TagsView.spec.ts | 14 | Tags view filtering/navigation |
| 10.4 | ErrorsView.spec.ts | 13 | Errors view grouping/filtering |
| 10.5 | ScenariosView.spec.ts | 11 | Scenarios view (likely partial — some already IO) |
| 10.6 | ScenarioDetailView.spec.ts | 11 | Detail view (likely partial) |
| 10.7 | TestRunsView.spec.ts | 10 | Test runs view (includes GitLink decision) |
| 10.8 | AboutView.spec.ts | 9 | About/system context page |
| 10.9 | ScenarioRowMobile.spec.ts | 8 | Mobile-responsive scenario row |

### Implementation contract tests (keep raw, verify comments exist)

| # | File | Raw usages | Reason to keep raw |
|---|------|-----------|-------------------|
| — | CapabilitiesView.spec.ts | 19 | Accessibility: ARIA roles, tabindex, keyboard |
| — | SegmentedBar.spec.ts | 8 | Visual: CSS heights, colours, widths |
| — | AnsiColours.spec.ts | 18 | Colour rendering: ANSI→HTML conversion |
| — | DarkMode.spec.ts | 13 | Theme: CSS custom property switching |
| — | SystemContextView.spec.ts | 2 | Minimal (likely already mostly IO) |
| — | ConsistencyView.spec.ts | 1 | Minimal (likely already mostly IO) |

### Decision: AnsiColours and DarkMode

AnsiColours tests verify that ANSI escape sequences produce the correct `<span class="ansi-*">`
elements. DarkMode tests verify CSS custom property values change on theme toggle. Both are
implementation contracts, not user-observable behaviour in the IO sense.

**Recommendation:** Keep both as raw Playwright with explanatory comments. No IO needed.

## Approach

Same as phase 9 — one file at a time, verify after each:
1. Read the spec to understand what's tested
2. Decide what converts vs stays raw
3. Create IO if needed (or extend existing)
4. Convert tests
5. Run tests, verify
6. Commit

## New IOs likely needed

- `HistoricalBanner` — banner component
- `ScenarioRowMobile` — mobile variant (or extend existing `ScenarioItem`)
- `AboutView` — about page

## Existing IOs to extend

- `ScenariosView` — may need deep-linking related methods
- `ScenarioDetailView` — may need additional evidence methods
- `ErrorsView` — may need grouping/filtering methods
- `TagsView` — may need tag selection/filtering methods
- `TestRunsView` — may need GitLink methods (branch/commit href)

## Acceptance Criteria

- [ ] All user-behaviour tests use IO pattern with `Ensure.that()`
- [ ] Implementation contract tests have explanatory comments
- [ ] Full component test suite passes (518+ tests, 0 failures)
- [ ] No raw `expect()` in tests that exercise user-observable behaviour

## Status

✅ **Complete** — all user-behaviour tests converted, implementation contract tests documented.

### Converted files (9 items)

| # | File | Result |
|---|------|--------|
| 10.1 | DeepLinking.spec.ts | ✅ 6 tests converted to IO (ScenarioDetailView + ExecuteScript for URL hash) |
| 10.2 | HistoricalBanner.spec.ts | ✅ 6 IO tests + 2 kept raw (callback wiring, CSS class) |
| 10.3 | TagsView.spec.ts | ✅ 4 IO tests + 1 kept raw (CSS colour gradients) |
| 10.4 | ErrorsView.spec.ts | ✅ 9 IO tests (all converted) |
| 10.5 | ScenariosView.spec.ts | ✅ 3 converted + 1 kept raw (ARIA accessibility) |
| 10.6 | ScenarioDetailView.spec.ts | ✅ 7 per-run retry tab tests converted to IO |
| 10.7 | TestRunsView.spec.ts | ✅ 3 converted (including GitLink branch/commit links) |
| 10.8 | AboutView.spec.ts | ✅ 3 converted to IO |
| 10.9 | ScenarioRowMobile.spec.ts | Kept raw (CSS layout + viewport mechanics) — documented |

### Also converted (minimal stragglers)
- ConsistencyView.spec.ts — 1 placeholder test converted
- SystemContextView.spec.ts — 1 placeholder test converted

### Implementation contract tests (documented, kept raw)

All have explanatory comments at the top of the file or describe block:

| File | Raw `expect()` | Reason |
|------|:-:|---|
| AnsiColours.spec.ts | 13 | ANSI→HTML colour rendering |
| CapabilitiesView.spec.ts | 11 | ARIA roles, tabindex, keyboard |
| DarkMode.spec.ts | 8 | CSS custom property theming |
| SegmentedBar.spec.ts | 5 | CSS heights, colours, widths |
| HistoricalBanner.spec.ts | 4 | Callback wiring, CSS class |
| ScenarioRowMobile.spec.ts | 3 | CSS layout, click target mechanics |
| ScenariosView.spec.ts | 3 | ARIA attributes (aria-live) |
| TagsView.spec.ts | 2 | CSS pass/fail colour gradients |

### New IOs created
- `HistoricalBanner` — `src/serenity/common/HistoricalBanner.serenity.ts`

### Existing IOs extended
- `ScenarioDetailView` — `retryTabCount()`, `activeAttemptLabel()`, `videoSource()`, `hasVideo()`, `openPhotoAt()`, `metaText()`, `activityTreeText()`, `firstRetryTabLabel()`, `lastRetryTabLabel()`
- `ScenariosView` — `runSelectorIsPresent()`
- `TagsView` — `tagNames()`, `groupHeadings()`, `tagCardText()`
- `ErrorsView` — `bodyText()`, `errorGroupTextFor()`, `errorGroupCount()`, `clickFirstErrorGroup()`, `clickErrorGroupContaining()`
- `TestRunsView` — `bodyText()`, `branchLinkText()`, `branchLinkHref()`, `commitLinkText()`, `commitLinkHref()`
- `AboutView` — `bodyText()`, `hasLinkTo()`
- `ConsistencyView` — `bodyText()`
- `SystemContextView` — `bodyText()`

### Verification
- 518 component tests pass (0 failures)
- 49 raw `expect()` calls remain across 8 files (all implementation contracts)
- No raw `expect()` in tests exercising user-observable behaviour
