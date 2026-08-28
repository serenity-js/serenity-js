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

### htm tagged template return type

Use `ReturnType<typeof html>` as the return type for exported component functions. Do NOT use `VNode` or `VNode<any>`.

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

The `interactionObject` fixture avoids the type collision with Playwright's built-in `mount` and is more concise:

```typescript
// ✓ Preferred — type-safe, derives component name from IO class
const view = await interactionObject(AboutView, './components/about/AboutView');
const view = await interactionObject(DashboardView, './components/dashboard/DashboardView', { data: reportData });

// Still available for non-IO tests (DarkMode, ThemeToggle, ARIA, etc.)
await mount({ component: 'FilterBar', importPath: './components/common/FilterBar', props: { ... } });
```

The `component` name is derived from `io.name`. The `path` is the esbuild import path relative to `app/`. Optional third arg takes `{ data, props, chartJs, hash, theme }`.

### Playwright 1.62+ includes `mount` in `PlaywrightTestArgs` — custom `mount` fixtures collide

`PlaywrightTestArgs` defines `mount` with a story-based signature. Overriding it via `useFixtures<{ mount: ... }>` or `test.extend<{ mount: ... }>` with a different signature triggers a type error because the `Fixtures` type requires overrides to be assignable to the parent's type. The only workaround is `as any` at the `use()` call boundary. The `interactionObject` fixture avoids this by using a non-colliding name.

### Test helpers for `SceneRecord` must not include `retries` for simple scenarios

`SceneRecord` is a discriminated union: `SimpleSceneRecord` (no retries), `RetriedSceneRecord` (has retries + attempts), `OutlineSceneRecord` (has scenarioOutline). Including `retries: 0` in a test helper makes TypeScript try to match `RetriedSceneRecord` which then requires `attempts`. Omit `retries` entirely for simple test scenes.

### Regenerating a served html-report requires re-aggregation, not just compile

`npm run compile` rebuilds the template.js bundle, but the served report uses the old embedded template until you re-run aggregation (e.g., `npx failsafe example:clean example:test example:add-history` in `integration/html-reporter/`).

### Moving elements outside a `data-testid` container breaks interaction objects

Before restructuring: check which `data-testid` attributes exist and which tests use them as scoping ancestors. If you move a child element outside, the `data-testid` must move to a wrapper encompassing both.

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

## Working Style — Agent-Specific

### Component rewrites can silently drop functionality

When delegating a component rewrite to a sub-agent, existing functionality can be silently lost if:
1. The rewrite prompt doesn't explicitly list ALL existing behaviours to preserve
2. No component test covers the specific behaviour

**Prevention:** Before rewriting a component, enumerate its observable behaviours and verify each has a test. If a behaviour isn't tested, add the test FIRST, then rewrite.

### Verify with `npm test` (package script), not bare commands

Always use `npm test` for final verification — it runs pretest hooks, all test suites, and coverage. Bare `npx playwright test` skips these and can pass against stale output. The urge to skip a step is the signal the step is needed.

### Regenerate integration test reports after recompiling

Integration tests serve reports from `examples/reports/`. After `npm run compile` updates the template, the served reports are stale until regenerated: `npm run example:clean && npm run example`.

### Kiro hooks do not fire automatically from the write tool

`.kiro/hooks/` defines `PostFileSave` hooks that run in the IDE. The `write` tool does **not** trigger them. Run hook commands manually after file writes (e.g., `npx eslint <changed-files>`).

---

## Agent Design

### Agent definition design: system prompt vs prompt template separation

- **System prompt** — identity, knowledge, constraints (every invocation)
- **Prompt template** — task-specific workflow (single invocation)

Don't duplicate content between them. `resources` in the agent definition provide deep context without bloating the prompt.

---

## Serenity/JS Templates — CI Gotchas

### Template migrations must update ALL touchpoints in one PR

A template migration (e.g., switching reporter) touches many files. Missing any one requires a follow-up PR. The full checklist:
- `package.json` (deps + scripts)
- Config file (crew configuration)
- `.gitignore`
- `.github/workflows/*.yml`
- `.devcontainer/devcontainer.json`
- `README.md` (prerequisites, report paths, scripts docs, troubleshooting, documentation links)

Review the README last — it's the most commonly missed because it's prose, not code.

### `@wdio/xvfb` auto-detection breaks IPC in Docker containers

WebdriverIO 9.30+ bundles `@wdio/xvfb` into `@wdio/local-runner` and auto-activates it when it detects `--headless` Chrome *and* `xvfb-run` is available in PATH. In Docker containers (like the `ghcr.io/serenity-js/playwright` image), `xvfb-run` is present but wrapping the worker process with it breaks Node's IPC channel (`EINVAL` on `process.send()`). Fix: set `autoXvfb: false` in `wdio.conf.ts`.

### Renovate lock file drift on major version bumps

Renovate can update `package.json` without regenerating `package-lock.json` correctly, especially for major version bumps that introduce new transitive dependencies (e.g. Cucumber 13 adding `@cucumber/pretty-formatter` and `@cucumber/query`). CI then fails with `npm ci` complaining about missing packages in the lock file. Fix: add `:lockFileMaintenance` to the Renovate `extends` array — this periodically regenerates the lock file and catches drift before it breaks CI.

### Never place two callouts immediately adjacent to each other

Two consecutive `:::tip` / `:::note` / `:::warning` blocks create visual clutter and neither gets read. Move one to a more relevant location, combine them into one callout, or separate them with prose.

---
