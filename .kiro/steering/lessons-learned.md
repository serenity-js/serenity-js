# Lessons Learned

Project-specific patterns discovered during development that aren't obvious from the code alone.

## Playwright Test retries emit SceneSequenceDetected

When Playwright Test retries a scenario, the adapter emits `SceneSequenceDetected` + `SceneParametersDetected` framing (the same framing used for Cucumber Scenario Outlines). The events share a single `sceneId` and arrive in one queue. Distinguish retries from outlines by checking for `RetryableSceneDetected` in the event stream.

If you're processing `DomainEventQueues` and see `SceneSequenceDetected`, always check whether `RetryableSceneDetected` is also present before assuming it's a Scenario Outline.

## Cucumber Scenario Outlines produce one sceneId per example row

The Cucumber adapter calls `serenity.assignNewSceneId()` for every example row in a Scenario Outline. All rows share the same `ScenarioDetails` (name + source location of the outline declaration), so `DomainEventQueues` merges them into **one queue**. But `SceneDataCollector.groupEventsBySceneId()` then splits them back into separate groups — one `SceneRecordBuilder` per example.

The critical downstream implication: `resolveRetries()` sees N records from one queue with no project tag differentiation. Without the `RetryableSceneDetected` check, it treats them as N retry attempts of the same test — marking a 42-example outline as "retried 41 times" and flagging it flaky.

Rule: when `resolveRetries()` encounters multiple records in a project group, check `areScenarioOutlineExamples()` before assuming retries. The signal is: records have `scenarioOutline` data AND no `RetryableSceneDetected` events for their sceneIds.

## ANSI escape sequences are Playwright Test-specific

Only Playwright Test embeds ANSI SGR colour codes in error messages (green for Expected, red for Received). Cucumber, Mocha, Jasmine, and WebdriverIO produce plain text errors — sometimes with structured Expected/Received on separate lines, but no escape sequences.

Implications for error rendering:
- **List views** (ErrorRow, ScenarioRow): use `stripAnsi()` for plain text — colour fragments in truncated single-line previews look broken regardless of test runner
- **Detail views** (ErrorBlock): use `ansiToHtml()` with `white-space: pre-wrap` — preserves newline structure from all runners and renders ANSI colours when present
- Never assume error messages will have ANSI codes when designing error display logic

## DomainEventQueues merges events by ScenarioDetails, not just sceneId

`DomainEventQueues.queueIdFor()` groups non-`SceneStarts` events by matching `ScenarioDetails` (name + location), not just by `sceneId`. This means events from different sceneIds can end up in the same queue if they share the same scenario identity. This is intentional — it enables retry grouping — but it means a single queue may contain multiple `SceneStarts`/`SceneFinished` pairs.

## Source line numbers are not always available

Not all test runner adapters emit source line numbers (e.g. Protractor/Mocha). When building identifiers from `source.path + ':' + source.line`, always handle the case where `line` is `undefined`. Use the scenario name as a disambiguation fallback.

## Client-side scenario lookups must use tagDiscriminator, not just source location

The server-side aggregator (`DataSnapshotAggregator`) uses `sceneIdentityWithTags()` which includes browser/project/platform tags when matching scenarios. Any client-side code (Preact components) that looks up a scenario by source location must do the same — otherwise it will match the **first** variant (e.g. desktop) when it should match a specific variant (e.g. mobile).

Symptom: the dashboard consistency card showed SUCCESS history dots for a test marked as degraded, because `getHistory()` matched the passing desktop variant instead of the failing mobile variant.

Rule: whenever you `scenarios.find()` using `source.path + ':' + source.line`, also compare `tagDiscriminator(ref.tags) === tagDiscriminator(scenario.tags)` when the ref has tags. The `tagDiscriminator()` utility in `app/utils/navigation.ts` mirrors the server-side function in `src/cli/model/sceneIdentity.ts`.

## The html-reporter has two distinct execution modes

1. **Crew member mode** (`TestRunArchiver` + `HtmlReportGenerator`) — runs during a test, writes artifacts directly to `test-runs/`, reads from the same output directory for aggregation. No `sourceFileSystem` needed.

2. **CLI aggregate mode** — reads `db.json` files from arbitrary external paths, needs a `sourceFileSystem` rooted at their common ancestor to copy artifacts into the output directory. Always pass `sourceFileSystem` in this mode.

## Tree collapse rules in CapabilitiesView

The GitHub-style single-child collapse logic has specific preservation rules:
- **Don't start collapsing** if the node has a `readme` or files (it has content to display)
- **Stop collapsing into** a child that has a `readme` (it has documentation worth showing separately)
- **DO collapse through** children that only have files but no readme (files display fine on the collapsed node)

The asymmetry is intentional: files are content that transfers to the parent when collapsed, but readmes are navigation targets that need their own clickable node.

## Chart.js legend sizing with usePointStyle

`usePointStyle: true` in Chart.js legend config renders legend items using each dataset's `pointRadius` — which is tiny (2-3px) for bar datasets. Use `boxWidth`/`boxHeight` instead for consistent legend item sizing across mixed chart types (bars + lines).

## Artifact types and their rendering

| Artifact | Persisted to disk? | Inlined in data.js? | Rendered as |
|----------|:-:|:-:|---|
| `Photo` (screenshot) | Yes (.png) | No (path reference) | Thumbnail + lightbox |
| `HTTPRequestResponse` | No | Yes (`restQuery`) | Collapsible REST panel |
| `LogEntry` | No | Yes (`reportData[]`) | Pre-formatted text block |
| `TextData` | No | Yes (`reportData[]`) | Pre-formatted text block |
| `JSONData` (generic) | No | Yes (`reportData[]`) | Pre-formatted JSON block |
| Video (.webm) | Yes | No (path reference) | Inline video player |

Binary artifacts (photos, videos) are persisted as files and referenced by path. Structured data artifacts (HTTP exchanges, logs, text) are inlined directly in `db.json`/`data.js` for self-containment.

## Kiro hooks do not fire automatically from the write tool

`.kiro/hooks/` defines `PostFileSave` hooks (e.g. `lint-on-save`) that run when a file is saved in the IDE. The `write` tool does **not** trigger these hooks. To respect them:

1. At the start of any task, read `.kiro/hooks/` to discover what hooks exist and what commands they run.
2. After every batch of file writes, run the hook commands manually — e.g. `npx eslint <changed-files>` for `lint-on-save`.
3. Treat hook commands as mandatory verification steps, not optional extras, before presenting work as complete.

## htm tagged template return type in Preact components

`htm.bind(h)` returns a function typed as `(strings, ...values) => HResult | HResult[]` where `HResult` is `VNode<Attributes>`. This means `html\`...\`` can return either a VNode or an array of VNodes at the type level, even though a single root element always produces a single VNode at runtime.

For ESLint's `@typescript-eslint/explicit-module-boundary-types` rule, use `ReturnType<typeof html>` as the return type for exported component functions. Do NOT use `VNode` or `VNode<any>` — these don't match the union type that htm declares and cause TS2322 errors.

The existing `RunSelector.ts` established this pattern first.

## PhotoStrip collectPhotos traversal order

The `collectPhotos` function in `PhotoStrip` processes each activity's own `artifacts` array **before** recursing into `children`. This means a parent activity's screenshots appear before its children's screenshots in the gallery, even though the child activity executes during the parent.

## Component extraction is import-path-stable

The html-reporter's component tests reference components via `importPath: './components/ComponentName'` in the esbuild-based test fixture. When extracting sub-components from a view file, as long as the parent file still exports the same function at the same path, all existing tests continue to pass without modification. The extracted children are internal implementation details that don't need their own import paths in existing tests.

## Always use `npm run compile` when building a package

Each package produces both CJS (`lib/`) and ESM (`esm/`) output. Running `npx tsc --build tsconfig.build.json` only builds one of them. Other packages that depend on it (via `workspace:*` links) may resolve to either output depending on their `moduleResolution` setting (e.g., `Node16` uses the `exports` field which distinguishes `import` vs `require` conditions).

Always use `npm run compile` in the package directory — this runs both `tsconfig-cjs.build.json` and `tsconfig-esm.build.json` builds. Failing to build both will cause type errors in downstream packages that happen to resolve via the stale output.

## Test-scoped crew members must be unassigned after each test

In `packages/playwright-test/src/api/index.ts`, the `configureScenarioInternal` fixture calls `serenity.configure({ crew: [...] })` for each test. Because `configure()` appends crew to the `StageManager.subscribers` array (via `stage.assign()`), crew members accumulate across tests running in the same worker. This causes duplicate screenshots (N Photographers = N screenshots per interaction).

The fix: `configure()` returns the instantiated crew array. The fixture stores it and calls `serenity.unassign(...sceneCrew)` in the `finally` block after `persist()`. This ensures each test starts with a clean crew.

## `history` prop shadows `window.history` in html-reporter components

The `ScenarioDetailView` component receives a `history: ReportHistoryEntry[]` prop. Inside the component, bare `history.replaceState(...)` calls resolve to the **prop** (an array), not `window.history`. After bundling/minification this becomes `t.replaceState(...)` which silently fails.

Always use `window.history.replaceState(...)` explicitly in components that have a `history` prop.

## Report terminology: "flaky" vs "inconsistent"

These terms have precise, distinct meanings in the report:

- **Flaky** — a test that fails on an earlier attempt but passes on a subsequent retry *within a single test run*. The build goes green, but the test needed multiple tries.
- **Inconsistent** — a test whose *final outcome* (after all retries are exhausted) differs across test runs. The build goes red unpredictably.

Other classification labels: **degraded** (was passing, now failing), **recovered** (was failing, now passes *cleanly* without retry).

"Recovered" requires a clean pass — if the test now passes only via retry, it's "flaky" not "recovered."

## Consistency view icon must use the same outcomeClass/outcomeIcon as scenario detail

The ConsistencyRow previously had its own `kindIcon()` function that mapped a "kind" string to an icon+colour independently of the `outcomeClass`/`outcomeIcon` utilities used everywhere else. This caused the consistency view to show a red cross (✗) for a test whose scenario detail showed a green tick (✓) — because one used `kind === 'degraded'` logic while the other used `outcomeClass(scenario.outcome)`.

Fix: ConsistencyRow and DashboardView consistency card now derive icons from `outcomeClass(lastOutcome)` / `outcomeIcon(lastOutcome)`, using the same `lastOutcome` string that drives all other outcome rendering. No component should independently map outcomes to icons — always go through `outcomeClass`/`outcomeIcon`.

## html-reporter is in UI stabilisation — no new UI elements without approval

The html-reporter module is being stabilised for release. Do not introduce new UI elements (filter chips, views, buttons, panels, sections) without explicitly asking the user first. Implementation changes to existing elements (refactoring, fixing divergent behaviour, renaming) are fine — adding new visible surface area is not.


## html-reporter component tests use the Interaction Object pattern

Component tests in `packages/html-reporter/spec/components/` use Screenplay-native **Interaction Objects** (the equivalent of Page Objects, scoped to a single component). The full pattern is documented in `packages/html-reporter/spec/components/README.md`.

Key points:
- Interaction objects live in `src/*.serenity.ts` and encapsulate locators, Questions, and Tasks for a component
- The `mount` fixture accepts an `interactionObject` class, instantiates it with the mounted component's root element, and returns the typed instance
- Tests call instance methods (`searchInput.placeholder()`) — never static methods on the class
- All assertions use `Ensure.that(...)` within `actor.attemptsTo(...)` — avoid `expect().to*()` style
- `data` and `dataAsProps` mount options are only needed for view-level components listed in the `viewComponents` array

When writing new component tests, read that README first and follow the established `SearchInput.spec.ts` as a reference implementation.


## data-testid on views enables scoped interaction object hierarchies

The `App.ts` component sets `data-testid` on the `<main>` element based on the active route pattern:
- `/` → `data-testid="dashboard"`
- `/tests` → `data-testid="tests"`
- `/consistency` → `data-testid="consistency"`
- `/tests/:id` → `data-testid="tests"` (dynamic segments are stripped)

Widget components (e.g. `SearchInput`) also carry `data-testid` on their root element (`data-testid="search-input"`).

Integration test interaction objects use this hierarchy for scoping:
1. Fixture locates the view root: `PageElement.located(By.css('[data-testid="consistency"]'))`
2. View interaction object receives it as constructor arg
3. View locates child widgets: `PageElement.located(By.css('[data-testid="search-input"]')).of(this.rootElement)`
4. Widget interaction object receives the child element and scopes its own locators within it

This gives deterministic, collision-free selectors without coupling tests to CSS class names.

## Interaction object constructors accept Answerable<PageElement<NET>>

`PageElement.located(...)` returns `MetaQuestionAdapter<PageElement<NET>, PageElement<NET>>`, which is a `Question<Promise<PageElement<NET>>>`. This does NOT satisfy `Question<PageElement<NET>> | PageElement<NET>`.

Always type interaction object constructor parameters as `Answerable<PageElement<NET>>` — this accepts all forms: raw `PageElement`, `Question<PageElement>`, `Question<Promise<PageElement>>`, and `Promise<PageElement>`.

The `MountOptions.interactionObject` type in `fixtures.ts` uses `Answerable<PageElement>` for the same reason.


## Interaction object APIs should describe user-observable behaviour, not implementation

When designing an interaction object's public API:
- **DO** expose Questions that describe what the user sees: `text()`, `outcomeType()`, `outcomes()`
- **DON'T** expose implementation details like `ariaLive()`, `cssClass()`, or raw attribute accessors
- **DO** return cohesive data structures when multiple attributes belong together — e.g. `outcomes()` returns `Array<{type, title}>` instead of separate `outcomeClasses()` + `titles()` arrays that must be correlated by index
- **DO** name methods after what they represent in the domain — `outcomeType()` not `outcomeClass()`

If accessibility behaviour needs testing (e.g. verifying `aria-live="polite"` is present), test it at the component level via the component test — not by exposing it as an interaction object method that leaks into integration tests.

## Component extraction is import-path-stable

The html-reporter's component tests reference components via `importPath: './components/ComponentName'` in the esbuild-based test fixture. When extracting sub-components from a view file, as long as the parent file still exports the same function at the same path, all existing tests continue to pass without modification. The extracted children are internal implementation details that don't need their own import paths in existing tests.

## Decompose components by visual section, not just by complexity metric

When a Preact component renders distinct visual sections (a row, a table, a doc string block, report data entries), each section is a natural sub-component — extract it even if the parent's cyclomatic complexity is only "slightly" above threshold.

Don't stop at extracting utility functions (e.g., parsing logic) and call it done. The rendering itself should be decomposed along **visual boundaries**: if a user would describe a part of the UI as a distinct thing ("the activity row", "the data table", "the error block"), it should be its own component.

Signs you should extract further:
- The component has inline conditionals rendering 10+ lines of markup each
- Distinct sections have their own state or event handlers (expand/collapse, click-to-copy)
- You can name the section as a noun ("row", "panel", "card", "table")


## CSS text-transform affects element.text() in interaction objects

The `.context-label` and `.kpi-label` CSS classes apply `text-transform: uppercase`. The `.req-detail-title` class applies `text-transform: capitalize`. When interaction objects read text via `element.text()` or `Text.of(element)`, they get the **rendered** (transformed) text, not the source text.

When using `.where(Text.of(...), equals(label))` to filter elements by label, the comparison value must match the **rendered** case. This applies to any CSS-styled text — always check the computed style when text matching fails unexpectedly.

## Use ContextItem meta-question pattern for structured element data

When a component renders repeated items with consistent internal structure (label + value pairs, name + price, etc.), model them as a **MetaQuestion class** with static meta-question methods:

```typescript
class ContextItem {
    static label = () => Text.of(PageElement.located(By.css('.context-label')));
    static value = () => Text.of(PageElement.located(By.css('.context-value')));

    static of = (rootElement: PageElement) =>
        Question.fromObject({
            label: ContextItem.label().of(rootElement),
            value: ContextItem.value().of(rootElement),
        }).describedAs('context item');
}
```

Then use PEQL to filter and map:
```typescript
this.contextItems()
    .where(ContextItem.label(), equals('NODE.JS'))
    .eachMappedTo(ContextItem)
    .first()
    .value
```

This is declarative, composable, and avoids brittle positional indexing (`.nth(0)`, `.nth(1)`).

## ListItemNotFoundError and isPresent() — known limitation

When `.first()` is called on an empty filtered list, it throws `ListItemNotFoundError`. The `isPresent()` expectation was updated to catch this during evaluation, but the error can also be thrown during **description resolution** (when `Ensure` builds the step name). This means `Ensure.that(question, not(isPresent()))` does not yet work when the question chain includes `.first()` on a potentially empty list.

Workaround: skip the `not(isPresent())` assertion for now. Tracked in `.kiro/specs/list-item-not-found-error-handling.md`.


## Work in small chunks with short feedback loops
## Component tests: when to keep raw Playwright vs convert to IO

**Convert to IO** when the test exercises user-observable behaviour:
- Text content, counts, presence/absence
- Navigation (clicking navigates somewhere)
- Filtering/search (user action changes visible results)
- Lightbox/modal interactions (open, close, navigate)

**Keep as raw Playwright** when the test verifies implementation contracts:
- ARIA attributes (role, tabindex values, aria-pressed)
- CSS heights, colours, background-color, widths
- CSS class names that encode state (unless mapped to a meaningful concept like `sentiment()`)
- Visually-hidden element structure
- Keyboard focus mechanics (tabindex roving pattern)
- Theme/dark mode CSS custom property values
- ANSI → HTML colour rendering

When keeping tests raw, add an explanatory comment before the describe block explaining
why these tests don't use interaction objects.


Always prefer:
- **Small batches** over large bulk changes — one domain area at a time, not all 12 placeholders at once
- **Short feedback loops** — verify after each chunk, not at the end of a phase
- **Continuous improvement** — each chunk informs the next; adapt approach based on what you learn

This applies to delegation too: send the tdd-developer one focused task (e.g., "dashboard consistency card"), review the result, then send the next. Don't queue up all work upfront.

## Two failed attempts means stop and ask

When an operation doesn't produce the expected result:
1. First attempt fails → try one alternative diagnostic
2. Second attempt also doesn't explain it → **stop and ask the user**

Do NOT:
- Try a third, fourth, fifth approach hoping something sticks
- Increase urgency and start shotgunning random diagnostics
- Assume you understand the system when evidence contradicts your mental model

DO:
- State clearly what you expected, what happened, and what you don't understand
- Ask a specific question that would unblock you
- Accept that silence (not asking) wastes more time than one clarifying question

This applies to build systems, test infrastructure, deployment pipelines, and any process you haven't personally verified end-to-end.


## `isPresent()` vs `isVisible()` for conditional interactions

When using `Check.whether()` to conditionally interact with an element that may be hidden via CSS (e.g., a hamburger menu button that's `display:none` on desktop), use `isVisible()` from `@serenity-js/web` — NOT `isPresent()` from `@serenity-js/assertions`.

- `isPresent()` checks DOM existence — the element is in the DOM at all viewports, just hidden via CSS on larger ones
- `isVisible()` checks computed visibility — correctly identifies whether the user can see and interact with it

```typescript
// ✓ Correct — only clicks if the user can actually see it
Check.whether(hamburgerMenu, isVisible())
    .andIfSo(Click.on(hamburgerMenu))

// ✗ Wrong — clicks a hidden element, breaking the flow
Check.whether(hamburgerMenu, isPresent())
    .andIfSo(Click.on(hamburgerMenu))
```

## Always use `npm run compile` when building a package

Each package produces both CJS (`lib/`) and ESM (`esm/`) output. Running `npx tsc --build tsconfig.build.json` only builds one of them. Other packages that depend on it (via `workspace:*` links) may resolve to either output depending on their `moduleResolution` setting (e.g., `Node16` uses the `exports` field which distinguishes `import` vs `require` conditions).

Always use `npm run compile` in the package directory — this runs both `tsconfig-cjs.build.json` and `tsconfig-esm.build.json` builds. Failing to build both will cause type errors in downstream packages that happen to resolve via the stale output.


## Component rewrites can silently drop functionality

When delegating a component rewrite to a sub-agent, existing functionality (like repo URL links in TestRunRow) can be silently lost if:
1. The rewrite prompt doesn't explicitly list ALL existing behaviours to preserve
2. No component test covers the specific behaviour (e.g., "branch links to repo URL")

**Prevention:** Before rewriting a component, enumerate its observable behaviours (not just its structure) and verify each has a test. If a behaviour isn't tested, add the test FIRST, then rewrite.

**Detection:** After a rewrite, check for unused imports/variables — these often indicate dropped functionality (e.g., `repoUrl` computed but never used in the template).


## CI re-runs cause duplicate data when gh-pages history overlaps with fresh artifacts

When a GitHub Actions workflow is re-run, the "HTML Report: aggregate" job downloads BOTH:
1. Historical data from gh-pages (which includes the previously-merged current build)
2. Fresh module artifacts from the current run

The `mergeAdditively` function in `DataSnapshotAggregator` must handle overlapping scenes (same `sceneIdentity`) within the same attempt group:
- **Different outcome** → record as retry attempt (earlier source had a failure that's now fixed)
- **Same outcome** → keep the later version and skip the duplicate (not a genuine retry)

Never blindly concatenate `[...base.scenes, ...addition.scenes]` — always check for identity collisions.

## GitHub Actions artifact uploads reject colons in paths

ISO timestamps (`2026-07-10T08:16:29.795Z`) contain colons which are invalid in:
- Windows filesystems (NTFS)
- GitHub Actions artifact uploads

Always sanitise timestamps used as directory names: `.replaceAll(':', '-')` → `2026-07-10T08-16-29.795Z`. Keep the original ISO format for data fields (`startedAt`, `finishedAt`) — only sanitise when used as filesystem paths.

## Two-phase db.json write detects crashed CI runs

The `TestRunArchiver` uses a two-phase write to detect process crashes:

1. **On `TestRunStarts`:** write a placeholder `db.json` with `startedAt`, empty `scenes[]`, `systemContext` — but no `finishedAt` and no `testRunner`
2. **On `TestRunFinishes`:** overwrite with the full `db.json` including `finishedAt`

If the CI runner crashes between steps 1 and 2, the placeholder persists on disk. During aggregation, `db.json` files without `finishedAt` are classified as incomplete modules and surfaced with ⚠️ indicators in the report.

Key design decisions:
- `finishedAt` absence is the **sole signal** for incomplete runs — no separate `status` field needed
- A `db.json` without `finishedAt` is valid, not a schema error — `validateRunData` accepts it
- The placeholder includes `systemContext` (detected synchronously) so the report can show environment info even for crashed runs
- `RunData.testRunner` is also optional — it's populated later by `TestRunnerDetected`, which may never fire if the crash is early

## `detectTestRunId()` and `detectModuleId()` only appropriate for auto-detected CI environments

When a user explicitly sets `testRunId` in the config, `detectModuleId()` should NOT fire. The module ID auto-detection creates subdirectories (`{testRunId}/{moduleId}-{attempt}/`) which breaks tools that expect `db.json` directly under `test-runs/{testRunId}/`.

Rule: only call `detectModuleId()` when `testRunId` came from environment auto-detection (not from explicit config).

## `bundle-template.mjs` output path must match the import's resolved location

The `ReportTemplateWriter` imports `./template.js` relative to its own file (`src/cli/ReportTemplateWriter.ts`). When the file moves to a subdirectory, the bundle script must write to the matching compiled path (`lib/cli/template.js`, `esm/cli/template.js`), not the old root-level path.

If the report renders blank (no KPI cards), check that `esm/cli/template.js` contains the real bundled HTML, not the development stub.

## Integration tests that spawn child processes must control CI env var leakage

Tests that verify directory-per-run behaviour (unique timestamps) will fail in CI because `GITHUB_RUN_NUMBER` causes all runs within the same job to share a single directory. Strip CI detection env vars (`GITHUB_RUN_NUMBER`, `GITHUB_RUN_ATTEMPT`, `CI_PIPELINE_IID`, `BUILD_NUMBER`, `CIRCLE_BUILD_NUM`) from the child process environment when the test needs isolated per-invocation directories.

## WebdriverIO 8 chromedriver version must match the installed Chrome

Pinning `chromedriver` in npm `devDependencies` while installing `chrome@stable` via `@puppeteer/browsers` causes version drift. When Chrome updates on the runner, the pinned chromedriver can't create sessions and WebdriverIO exits before Mocha starts — no `TestRunStarts` fires, no `db.json` is produced.

Fix: use `computeExecutablePath` from `@puppeteer/browsers` to resolve both Chrome and chromedriver from the shared `./browsers/` directory (installed at `postinstall`). Pass via `goog:chromeOptions.binary` and `chromedriverCustomPath`. Remove the npm `chromedriver` dependency.

## Deploy to gh-pages with `clean: true` to enforce pruning

The `maxHistory` pruning in the aggregator only removes old runs from the local output directory. With `clean: false` on the deploy action, pruned directories persist on gh-pages forever and get re-downloaded on every subsequent run. Use `clean: true` to make gh-pages match the local output exactly.

## README filename lookups must be case-insensitive

`buildCapabilities.ts` uses `FileSystem.exists()` and `readFileSync()` to load README files from spec directories. On macOS (case-insensitive HFS+/APFS), `Path.from('readme.md')` resolves to `README.md` transparently. On Linux CI (case-sensitive ext4), it does not — the file simply isn't found.

Symptoms: capabilities tree nodes lose their `displayName` (falls back to raw directory name like `e2e` instead of `End-to-End Flows`) and `readme` content is empty (no `.readme-content` rendered, causing `ListItemNotFoundError` in tests that click README links).

Fix: use `readdirSync` + case-insensitive regex (`/^readme\.md$/i`) to find the actual filename before reading it. Never hardcode a specific casing for README files.

General rule: any `FileSystem.exists(path)` call where the path component comes from a convention (not user input) should account for case variation if the code must work on both macOS and Linux.

## Virtual scroll containers make `position: sticky` ineffective on parent elements

The html-reporter's scenario list uses a `.scroll-container` with `overflow-y: auto` for virtual scrolling. This means the document/main element does NOT scroll — only the internal container does. Any `position: sticky` on elements *outside* the scroll container (like a controls-row above the list) will never activate because the scroll context is internal.

In practice this is fine: the controls already stay visible permanently because only the list content scrolls. Don't add sticky CSS to elements above a virtual scroll list — it's dead code.

## Regenerating a served html-report requires `html-reporter aggregate`, not just `npm run compile`

The `html-reporter serve --dir <path>` command serves a pre-generated `index.html`. Running `npm run compile` rebuilds the template.js bundle, but the served report still uses the old embedded template until you re-run:

```bash
node packages/html-reporter/bin/html-reporter.mjs aggregate \
  --input "reports/serenity/test-runs/*" \
  --output reports/serenity \
  --title "Project Name"
```

Always regenerate the report after template changes to verify them visually in the browser.

## Theme toggle belongs in sidebar, not in per-page headers

A theme preference is a set-and-forget setting (persisted in localStorage, auto-detected from `prefers-color-scheme`). Placing it in every page's topbar wastes 38px of horizontal space on every view — which on mobile with longer titles causes the h1 to wrap (adding 33px of height).

The sidebar footer is the correct location: accessible from every page via one click (hamburger → bottom), consistent with VS Code/Linear/Notion patterns, and costs zero content-area real estate.

## The `.controls-row` pattern: flex-wrap with `flex-basis: 100%` for responsive break

To make a row of controls sit inline on desktop but wrap on mobile without media queries for each child:

```css
.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}

.controls-row .search-input-wrap {
  flex: 1 1 220px;   /* grows, shrinks, wraps when < 220px available */
  min-width: 160px;
}

@media (max-width: 767px) {
  .controls-row .search-input-wrap {
    flex-basis: 100%; /* forces wrap to own line on mobile */
  }
}
```

The filter bar (which follows in DOM order) naturally flows to the same line on desktop (enough space) or the next line on mobile (search took 100%). No explicit grid areas or breakpoint-specific layouts needed.

## Stale http-server processes cause phantom test failures

The integration test config at `integration/html-reporter/playwright.config.ts` uses `reuseExistingServer: false`, which means Playwright always starts a fresh server pointing at the correct `examples/reports/serenity` directory. If a stale `http-server` process is running on port 8080 (e.g., from a manual `html-reporter serve` session), Playwright's server start will fail.

Symptoms: Tests fail to start with "port already in use" errors.

Fix: Always kill stale servers before running integration tests:
```bash
pkill -f 'http-server.*8080'; pkill -f 'http-server.*8090'; sleep 2
```

General rule: if integration tests fail to start, check for port conflicts before investigating other causes.

## Moving elements outside a `data-testid` container breaks interaction objects

When restructuring a component (e.g., moving `.sort-group` outside `.filter-bar` to fix scroll behaviour), any element that moves outside a `data-testid` boundary becomes invisible to interaction objects and tests that locate it via that testid.

Before restructuring: check which `data-testid` attributes exist on the component's DOM, and which tests/interaction objects use them as scoping ancestors. If you move a child element to become a sibling, the `data-testid` must move to a wrapper that still encompasses both.

Pattern: when extracting an element from a container for layout reasons, create a new wrapper div and move the `data-testid` up to the wrapper. The inner elements keep their semantic attributes (`role`, `aria-label`) but the test hook lives on the outermost structural boundary.

## Integration tests require `npm test`, not `npx playwright test` directly

The integration test suite at `integration/html-reporter/` has a `pretest` script that generates the test data (runs stub specs, produces `db.json`, aggregates the report). Running `npx playwright test` directly skips this step, which means:

- Tests run against stale or missing report data
- Failures look like assertion mismatches (wrong counts, missing scenarios) rather than "file not found"
- The developer incorrectly concludes the tests are broken rather than recognising they skipped data generation

**Always use `npm test`** in `integration/html-reporter/`. This runs the full pipeline:
1. `example:clean` — removes `examples/reports/`
2. `example:test` — runs stub specs (some intentionally fail) to produce `test-runs/42/db.json`
3. `example:add-history` — creates synthetic historical run + re-aggregates report
4. `test` — runs 126 Playwright tests across 3 viewports against the generated report

The `example:test` step exits with code 1 (intentional failures in stub specs). This is normal — `failsafe` handles it. Don't treat it as a build failure.

## `npm run compile` is the only correct build command for packages

Each package produces BOTH CommonJS (`lib/`) and ESM (`esm/`) output via two separate tsconfig files. Common mistakes:

- `npx tsc` — only builds one output format
- `npx tsc --build tsconfig.build.json` — only builds one output format
- `npx tsc --build tsconfig-cjs.build.json` — misses the ESM build

**Always use `npm run compile`** in the package directory. This runs both tsconfig builds and (for html-reporter) the template bundle step.

Downstream packages resolve via `workspace:*` links and may use EITHER output depending on their `moduleResolution` setting. A stale ESM build causes type errors in packages that resolve via the `exports` field's `import` condition.

For the html-reporter specifically, `npm run compile` also runs `bundle-template.mjs` which produces the self-contained `template.js` bundle. Skipping this means integration tests run against a stale template — CSS/layout changes won't be reflected.

## Kill stale servers BEFORE running integration tests, every time

The integration test config at `integration/html-reporter/playwright.config.ts` uses `reuseExistingServer: false`, which means Playwright always starts a fresh server. However, if the port is already occupied (e.g., by a manual `html-reporter serve` session), the server start will fail and tests won't run.

If you see "port 8080 already in use" errors, kill the stale process:
```bash
pkill -f 'http-server.*8080'; pkill -f 'http-server.*8090'; sleep 2
```

## Inline styles bypass CSS media query overrides

If a component uses an inline `style="max-height:calc(100vh - 320px)"` on an element, no CSS class-based media query can override it — inline styles have higher specificity than any selector. The TimelineView had this problem: its scroll container used an inline max-height, so the mobile `.scroll-container` override never applied.

Fix: always use CSS classes for properties that need responsive overrides. Move `max-height`, `overflow`, etc. to a class (`.scroll-container`) and apply responsive adjustments via media queries on that class.

## CSS source-order within a single file can silently break media query overrides

If a base rule (e.g., `.scroll-container { max-height: calc(100vh - 380px) }`) appears AFTER a `@media (max-width: 768px)` block that also targets `.scroll-container`, the base rule wins on mobile because both have the same specificity and the later one takes precedence regardless of media query.

This is a classic CSS cascade bug that's hard to spot because the developer assumes "media query = conditional" when in fact it's "media query = additional condition, same specificity, source order still matters."

Rule: base/default rules must appear BEFORE their responsive overrides in the file. When adding utility classes or late-in-file rules, check whether they conflict with earlier media query overrides.

## Regenerating a served html-report requires `html-reporter aggregate`, not just `npm run compile`

The `html-reporter serve --dir <path>` command serves a pre-generated `index.html`. Running `npm run compile` rebuilds the template.js bundle, but the served report still uses the old embedded template until you re-run:

```bash
npx failsafe example:clean example:test example:add-history
```

(in `integration/html-reporter/`) or equivalent aggregation step. Always regenerate the report after template changes to verify them visually in the browser.

## Virtual scroll container height must account for ALL elements above it

When calculating `max-height: calc(100vh - Xpx)` for a virtual scroll container, `X` must account for everything above it in the viewport:
- Topbar (title + date)
- Main content padding
- Run selector (conditional — only when multiple runs exist)
- Search input + gap
- Filter bar + gap
- Card padding + card title/divider

On mobile with reduced padding, these add up to ~220px. On desktop with full padding + more spacing, ~380px. Getting this wrong by even 40px causes either the card to overflow the viewport or leaves a visible gap.

When debugging "too much/too little bottom space" on mobile:
1. Don't add padding to the scroll container — it's a virtual scroll, absolutely-positioned items ignore padding
2. Don't adjust the outer `.main-content` padding asymmetrically — that creates uneven margins
3. **Measure the actual content above** (topbar + controls + card padding + group header) and set the offset to match

When the content above varies (e.g., Run Selector present or not), the fixed offset is always a compromise. Prefer a value that works for the common case and accept a small gap in the edge case.

## Don't add a separate status indicator when an existing control already communicates the state

The `HistoricalBanner` was a full-width bar that said "Viewing results from: Run #X" with a "show latest" link. The `RunSelector` dropdown directly below it showed the same run in its selected option. This duplicated information, cost 50–70px of vertical space, and on mobile the CSS had to hide the RunSelector to avoid redundancy — which also removed the ability to switch runs.

Rule: before introducing a banner/alert/status bar, check whether an existing interactive element (dropdown, tab, breadcrumb) already communicates the same state. If it does, enhance that element's visual treatment instead of adding a new component.

Pattern for "you're looking at a non-default state":
1. Give the existing control a **visual state variant** (accent border/background) to create ambient awareness
2. Add a **small escape affordance** (link/button) inline next to the control to return to the default state
3. Never render two elements that answer the same user question ("which run am I viewing?")

This applies broadly: don't add a "You are filtering by X" banner above a filter bar that already shows the active filter. Don't add a "Branch: feature/foo" badge above a branch selector dropdown.

## Interaction object locators must use prefix/substring matching when component state appends to aria-labels

When a component conditionally appends to its `aria-label` based on state (e.g., `"Select test run"` → `"Select test run (historical)"`), interaction objects that locate the component via `[aria-label="Select test run"]` will break in the alternate state.

Use prefix matching: `[aria-label^="Select test run"]` instead of exact matching. This applies to any attribute-based locator where the component has state-dependent suffixes.

The RunSelector historical state change exposed this: `ScenariosView.serenity.ts` had `[aria-label="Select test run"]` which only matched the non-historical state. Updated to `[aria-label^="Select test run"]` to match both states.

General rule: when modifying a component to add state-dependent attributes, grep for all interaction objects that locate it and update their selectors to remain stable across states.


## Heterogeneous registries need a generic builder function, not loose types

When a collection holds items with different type parameters (e.g., route definitions where each route has different view props), the naive approach is to widen the member type to `Record<string, unknown>` or `any`. This erases the type safety between producers and consumers.

Pattern: use a `defineX<P>(config)` builder function that infers the generic, verifies internal consistency, then returns the type-erased collection member:

```typescript
function defineRoute<P>(config: RouteConfig<P>): RouteDefinition {
    return config as unknown as RouteDefinition;
}
```

The generic proves consistency at definition time; the cast is safe because it happens in exactly one controlled location. Callers never see `any` or need to cast.

Applied to: `app/router/routes.ts` where each route ties a view component to its data function.

## `Record<string, unknown>` as a return type is a code smell

If a function constructs a specific structure (chart options, props object, API response), type the return precisely. `Record<string, unknown>` means "I know the shape but I'm not telling TypeScript" — it forces every consumer to cast.

Common trigger: starting with a loose type during prototyping and never tightening it. The fix is mechanical — just declare the return type to match the object literal being returned.

## Function parameter types should match actual field access, not the source interface

When a function accesses `obj.tags` but is typed to accept `FullScenarioInterface`, every caller must provide a full scenario even if they only have `{ tags }`. Type parameters based on *what the function reads*, not *where the data typically comes from*:

```typescript
// Over-constrained: demands 8 fields, reads 1
function getBrowserTag(scenario: ReportScenario): string | null

// Right: demands only what it accesses
function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null
```

This avoids casts at call sites and makes the function composable with partial data (e.g., in tests or when constructing objects incrementally).


## Always use `npm test` for final verification, never bare test runner commands

When verifying that changes work, always run the package's `npm test` (or `npm run test`) command — never `npx playwright test`, `npx mocha`, or any direct test runner invocation.

`npm test` runs the full pipeline: pretest hooks (data generation, compilation) → test execution → coverage. Direct runner commands skip pretest steps and can pass against stale compiled output.

This applies even when you "just compiled" — the pipeline exists to catch what you assume is fine. The urge to skip a step is the signal that the step is needed.

Correct:
```bash
cd packages/html-reporter && npm test
cd integration/html-reporter && npm test
```

Wrong:
```bash
npx playwright test spec/app/tags/
npx mocha --config ../../.mocharc.yml 'spec/cli/*.spec.ts'
```

The only exception: running a single spec file during the Red→Green TDD cycle (before final verification). Final verification always uses `npm test`.
