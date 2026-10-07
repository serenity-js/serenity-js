---
inclusion: fileMatch
fileMatchPattern: "**/html-reporter/**"
---

# Lessons Learned

Niche patterns and temporary rules discovered during development. Durable conventions are graduated
into the relevant steering doc (see `steering-maintenance.md` for the document map).

Items here are either:
- Too specific to warrant space in a general steering doc
- Temporary (tied to a current phase that will end)
- Not yet mature enough to formalise

---

## Stabilisation Policy

### html-reporter is in UI stabilisation — no new UI elements without approval

Do not introduce new UI elements (filter chips, views, buttons, panels, sections) without explicitly asking the user first. Implementation changes to existing elements are fine — adding new visible surface area is not.

---

## HTML Reporter — Implementation Gotchas

### `serialiseOutcome` defaults to `ExecutionSuccessful` for unrecognised types

`outcomeSerialisers.ts` has an `outcomeCodeMap` that maps outcome class → code. If a new outcome type is added to `@serenity-js/core` (or an existing one like `ExecutionIgnored` is overlooked), the fallback `return { code: ExecutionSuccessful.Code }` silently records failures as successes. When adding outcome types to core, always update `outcomeCodeMap`, `VALID_OUTCOME_CODES`, and `OUTCOME_CODE_DISPLAY_STRINGS` in the html-reporter.

### `history` prop shadows `window.history` in html-reporter components

Inside a component that receives a `history: ReportHistoryEntry[]` prop, bare `history.replaceState(...)` resolves to the **prop** (an array), not `window.history`. Always use `window.history.replaceState(...)` explicitly.

### `utils/index.ts` barrel is side-effect-free — keep it that way

Before adding a new export to `utils/index.ts`, verify the module has no top-level throws, no `window` access at import time, and no mutable state initialization.

### Consistency view icon must use the same outcomeClass/outcomeIcon as scenario detail

No component should independently map outcomes to icons — always go through `outcomeClass`/`outcomeIcon`. A separate `kindIcon()` function will diverge from the canonical mapping.

### Chart.js legend sizing with usePointStyle

`usePointStyle: true` renders legend items using each dataset's `pointRadius` — tiny for bar datasets. Use `boxWidth`/`boxHeight` instead.

### PhotoStrip collectPhotos traversal order

Each activity's own `artifacts` array is processed **before** recursing into `children`. Parent screenshots appear before children's.

### Don't add a separate status indicator when an existing control already communicates the state

Before introducing a banner/alert/status bar, check whether an existing interactive element (dropdown, tab, breadcrumb) already communicates the same state. If it does, enhance that element's visual treatment instead of adding a new component.

### Use `optionalField(key, value)` for conditional JSON fields

When building JSON objects with fields that should be absent (not `null`) when empty, use the `optionalField` helper instead of inline spread patterns:

```typescript
// ✓ Good — clear, consistent, no linter complaints
...optionalField('ci', ci),
...optionalField('browser', getBrowser(test.tags)),

// ✗ Avoid — confusing to readers, eqeqeq lint rule flags !=
...(x != null && { x }),
...x && { x },
```

The helper lives in `SummaryJsonWriter.ts`. If needed elsewhere, extract to a shared utility.

### Zod 4: use `z.iso.datetime()` not `z.string().datetime()`

`z.string().datetime()` is deprecated in Zod 4. Use `z.iso.datetime()` — produces identical JSON Schema output but avoids deprecation warnings.

### Cross-run history matching uses `findHistoricalMatch`, not `sceneIdentity`

`sceneIdentity()` produces exact `path:line` keys for **within-run** navigation identity (URLs, scenario detail routing). `findHistoricalMatch()` uses 2-of-3 fuzzy matching (path, line, name) for **cross-run** history — resilient to both renames and moves within a file. New code that correlates the same test across different runs must use `findHistoricalMatch` (or `groupOutcomesByScene` for bulk grouping), never `sceneIdentity`.

### `groupOutcomesByScene` is the shared cross-run grouping primitive

Both consistency scoring (`computeConsistencyAtRun`) and unstable test detection (`identifyUnstableTests`) delegate to `groupOutcomesByScene` in `model/groupScenes.ts`. New cross-run analysis should use it rather than rolling its own grouping loop. It returns `SceneOutcomeGroup[]` with `representative`, `outcomes`, and `labels`.

### `effectiveOutcome` centralises the retried-pass classification

A retried pass is classified as `RETRIED_SUCCESS` (distinct from `SUCCESS`) for consistency analysis. This logic lives in `effectiveOutcome()` in `model/outcomes.ts`. Do not inline the `retries > 0 && outcome === SUCCESS` ternary — call `effectiveOutcome(scene)` instead.

### Client-side code reuses server-side matching via `app/utils/navigation.ts` adapters

`findHistoricalMatch`, `sceneIdentity`, and `tagDiscriminator` from `cli/model/sceneIdentity.ts` are wrapped in `app/utils/navigation.ts` with client-friendly signatures (optional `line`, optional `tags`). Browser-side code imports from the adapter, not from the server module directly.

---

## HTML Reporter — CSS & Layout

### Virtual scroll container height must account for ALL elements above it

When calculating `max-height: calc(100vh - Xpx)`, `X` must account for everything above: topbar, padding, run selector (conditional), search input, filter bar, card padding. On mobile ~220px, desktop ~380px.

### Mobile media query resets override earlier specificity-equal rules

When a mobile `@media` block redeclares a broad selector, any narrower overrides for that property must also appear inside the media query.

### Fixed-height flex panels require explicit `height`, not just `max-height`

A `position: fixed` flex-column panel with only `max-height` will shrink to content. Give it explicit `height` so the flex algorithm has a definite size to distribute.

### Sticky table headers require the table-wrap to be the scroll container

Ensure only ONE element in the hierarchy scrolls the table content. The body above the table-wrap must not scroll.

### Sticky cells at intersections need z-index hierarchy across both axes

```
5: thead th:first-child    (top + left)
4: tfoot td:first-child    (bottom + left)
3: thead th / tfoot td     (single axis: top or bottom)
2: tbody td:first-child    (single axis: left only)
1: tbody td                (no stickiness)
```

### The `.controls-row` pattern: flex-wrap with `flex-basis: 100%` for responsive break

Use `flex: 1 1 220px` on children with `@media (max-width: 767px) { flex-basis: 100% }` to force wrapping on mobile without per-child media queries.

### iOS Safari 26+ Liquid Glass clips `position: fixed` and page-bottom content

**The fix:** Move scroll from viewport to body element to prevent toolbar collapse:
```css
@media (max-width: 768px) {
  html { overflow: hidden; }
  body { overflow: auto; overscroll-behavior: contain; }
}
```
Trade-off: address bar stays permanently expanded on mobile.

---

## HTML Reporter — Preact Patterns

### Preact components that conditionally render nothing: guard at the call site

Don't put `if (condition) return null` inside a component. Let the parent decide whether to render it.

### Decompose components by visual section, not just by complexity metric

If a user would describe a part of the UI as a distinct thing ("the activity row", "the data table", "the error block"), it should be its own component.

### Skip-to-content links in hash-routed SPAs must use preventDefault + focus()

Native `<a href="#main-content">` changes `window.location.hash` which hash-based routers interpret as a route. Use `onClick` with `preventDefault()` + `focus()` instead.

### Always use existing CSS classes for links — never invent unverified class names

Check `styles.css` for existing patterns before using a class. The report uses `view-all-link` for navigational actions — there is no `btn-primary`.

### Theme toggle belongs in sidebar, not in per-page headers

A theme preference is set-and-forget. The sidebar footer is the correct location — costs zero content-area real estate.

---

## HTML Reporter — Build Quirks

### `bundle-template.mjs` output path must match the import's resolved location

The `ReportTemplateWriter` imports `./template.js` relative to its own file. When the file moves, the bundle script must write to the matching compiled path. If the report renders blank, check that `esm/cli/template.js` contains the real bundled HTML.

### pnpm `--` separator breaks yargs command parsing

Fix: strip a leading `--` from argv before passing to yargs:
```javascript
const cleanArgv = argv[0] === '--' ? argv.slice(1) : argv;
```

### yargs version resolution in monorepos

Explicitly pass the version from the package's own `package.json` — `yargs().version()` without an argument finds the workspace root version.

### README filename lookups must be case-insensitive

On Linux CI (case-sensitive ext4), `Path.from('readme.md')` won't resolve to `README.md`. Use `readdirSync` + case-insensitive regex to find the actual filename.

---

## HTML Reporter — Testing Quirks

### Component extraction is import-path-stable

When extracting sub-components from a view file, as long as the parent file still exports the same function at the same path, all existing tests continue to pass. Extracted children are internal details.

### `data-testid` on views enables scoped interaction object hierarchies

Fixture → view root by `data-testid` → child widgets by `data-testid` → widget scopes its own locators within.

### Interaction object locators must use prefix matching when component state appends to aria-labels

Use `[aria-label^="Select test run"]` instead of exact matching when a component conditionally appends to its `aria-label`.

### CSS text-transform affects element.text() in interaction objects

`text-transform: uppercase` means `element.text()` returns the *rendered* (transformed) text. Comparison values must match the rendered case.

### Use ContextItem meta-question pattern for structured element data

When a component renders repeated items with consistent internal structure, model them as a MetaQuestion class with static methods and use PEQL's `.where()` + `.eachMappedTo()`.

### ListItemNotFoundError and isPresent() — known limitation

`.first()` on an empty filtered list throws during description resolution. `Ensure.that(question, not(isPresent()))` doesn't work with `.first()` on potentially empty lists. Tracked in `.kiro/specs/list-item-not-found-error-handling.md`.

### `isPresent()` vs `isVisible()` for conditional interactions

- `isPresent()` checks DOM existence — the element is in the DOM but may be hidden via CSS
- `isVisible()` checks computed visibility — use this for `Check.whether()` with elements hidden on some viewports

### Interaction object methods must not conflate `isPresent` and `isVisible`

Never name a method `isVisible()` or `...IsVisible()` when it delegates to `.isPresent()`. These are semantically different:
- `isPresent()` = DOM existence (is the element in the tree?)
- `isVisible()` = computed CSS visibility (is it rendered and not hidden?)

If an IO needs to check whether a child element exists (e.g., "does the README section appear?"), name it `...IsPresent()`. Reserve `isVisible` for actual visibility checks via `isVisible()` from `@serenity-js/web`.

For component-level presence, prefer the `Optional` interface inherited from `InteractionObject` — `Ensure.that(view, isPresent())` — over custom child-element lookups. The root element check is more reliable across platforms (child lookups have shown flakiness on Windows CI due to timing).

### Stale http-server processes cause phantom test failures

If integration tests fail to start, check for port conflicts. Kill stale servers:
```bash
pkill -f 'http-server.*8080'; pkill -f 'http-server.*8090'; sleep 2
```

### Prefer the `interactionObject` fixture over `mount` for IO-based component tests

The html-reporter's `interactionObject` fixture (in `spec/app/story-fixtures.ts`) avoids the type collision with Playwright's built-in `mount` and is more concise. This is specific to the html-reporter's component test setup — user-facing projects should use the built-in `story` fixture from `@serenity-js/playwright-test` instead (see `story("path").as(IOClass)` pattern).

```typescript
// ✓ html-reporter component tests — uses custom interactionObject fixture
const view = await interactionObject(AboutView, './components/about/AboutView');
const view = await interactionObject(DashboardView, './components/dashboard/DashboardView', { data: reportData });

// ✓ User-facing component tests — uses built-in story fixture
const card = story('components/UserCard/Default', { name: 'Alice' }).as(UserCard);

// Still available for non-IO tests (DarkMode, ThemeToggle, ARIA, etc.)
await mount({ component: 'FilterBar', importPath: './components/common/FilterBar', props: { ... } });
```

The `component` name is derived from `io.name`. The `path` is the esbuild import path relative to `app/`. Optional third arg takes `{ data, props, chartJs, hash, theme }`.

### Playwright 1.62+ includes `mount` in `PlaywrightTestArgs` — custom `mount` fixtures collide

`PlaywrightTestArgs` defines `mount` with a story-based signature. Overriding it via `useFixtures<{ mount: ... }>` or `test.extend<{ mount: ... }>` with a different signature triggers a type error because the `Fixtures` type requires overrides to be assignable to the parent's type. The only workaround is `as any` at the `use()` call boundary. The `interactionObject` fixture avoids this by using a non-colliding name.

### Test helpers for `SceneRecord` must not include `retries` for simple scenarios

`SceneRecord` is a discriminated union: `SimpleSceneRecord` (no retries), `RetriedSceneRecord` (has retries + attempts), `OutlineSceneRecord` (has scenarioOutline). Including `retries: 0` in a test helper makes TypeScript try to match `RetriedSceneRecord` which then requires `attempts`. Omit `retries` entirely for simple test scenes.

### Recompiling doesn't update the example reports the integration tests serve

`npm run compile` rebuilds the `template.js` bundle, but the reports in `integration/html-reporter/examples/reports/` embed the old template until they're regenerated. `npm test` regenerates them via its `pretest` script (`npm run example`); targeted `npx playwright test` runs don't, so after recompiling their results are invalid.

### Moving elements outside a `data-testid` container breaks interaction objects

Before restructuring: check which `data-testid` attributes exist and which tests use them as scoping ancestors. If you move a child element outside, the `data-testid` must move to a wrapper encompassing both.

### Use `UrlViewState` and `ViewControls` in view interaction objects

- `UrlViewState<Parameter>` (`src/serenity/common/`) reads the state a view syncs to the URL, falling back to the view's defaults for parameters the view omits. Each view declares its own parameters and defaults: `new UrlViewState({ search: '', filter: 'all', sort: 'name' })`. Tasks use `waitUntilEquals` / `waitUntilContains` to wait for their outcome.
- `ViewControls` handles controls shown inline on wider screens and in a bottom sheet on mobile: `pick(inline, inSheet)` and `within(...activities)`. Don't check `this.mobile` in views. The Errors view's stats sheet is separate, as KPI cards aren't controls.

### Filter chips: use `data-filter` for keys and `.chip-label` for labels

Chip labels don't always match the keys used in the URL ("At Risk" vs `at-risk`) — read the key from `data-filter`, e.g. via `FilterBar.filterKey(label)`. The chip's full text includes its count (`'Passed\n0'`), so read labels from `.chip-label`.

### Virtualised lists render rows in their first render

`useVirtualizer` sets `initialRect` to the viewport size, so the first render already includes the visible rows. Without it, views briefly render an empty list, and tests read zero rows straight after a view appears.

### Effects that subscribe to events must re-sync after subscribing

`App` re-reads the route straight after adding its `hashchange` listener. Anything that changes between the initial render and the subscription (e.g. navigating to a deep link right after the report loads) is otherwise lost.

### The report lists the latest run's scenarios only

Historical runs are reachable through each scenario's execution history, so scenarios that only existed in an older run can't be listed (#3546). In the `single` example report, run 40 is synthetic, and its scenarios exist in no other run — use the `multi-module` report for tests that navigate from a module table to the list of scenarios.

---

## HTML Reporter — Mobile UX Patterns

### Views must return a single root element (not a Fragment)

When a view returns adjacent elements (e.g., ViewTopbar + flex-fill-view as siblings), the test fixture can't locate the component root with `#app > *`. Always wrap in a single container — either `<div class="flex-fill-view">` for virtual-scroll views or a plain `<div>` for others.

### useEffect with inline arrow function in deps causes re-firing

A `useEffect([isOpen, onClose])` where `onClose` is `() => setState(false)` creates a new function reference every render. If the effect does `.focus()`, it steals focus from inputs on every keystroke. Split into separate effects: focus management depends only on `[isOpen]`, keyboard handling can depend on `[isOpen, onClose]`.

### Navigation IO hamburger must scope to `.view-topbar`

When both `desktop-topbar` (hidden on mobile) and `view-topbar` (visible on mobile) contain a `button[aria-label="Open menu"]`, the unscoped selector matches the hidden one first. Use `.view-topbar button[aria-label="Open menu"]` for correct mobile behaviour.

### `reducedMotion: 'reduce'` in integration test Playwright config

Eliminates all animation/transition timing issues in tests. The global CSS rule `* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }` ensures `animationend` events still fire. Good practice to model for the community.

### `onRunChange` must read current URL from `window.location.hash`

The `route` prop in a closure may be stale if `useViewState.syncStateToUrl` has written to the hash via `replaceState` since the last render. Read the live URL directly when constructing navigation targets.

### Use `naturalCompare` for all user-facing sorted lists

`a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })` ensures "Test 10" sorts after "Test 9". Extracted as `app/utils/naturalCompare.ts` — use it everywhere instead of bare `localeCompare`.

### Extend the centralised `link()` function rather than building URLs locally

When a hook or component needs to construct a navigation URL, extend the `LinkOptions` discriminated union in `src/navigation/link.ts` rather than creating a local URL builder. This keeps URL encoding and parameter construction in one place.

---

