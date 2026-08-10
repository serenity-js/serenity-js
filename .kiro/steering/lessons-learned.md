# Lessons Learned

Project-specific patterns discovered during development that aren't obvious from the code alone.

---

## Git & CI Discipline

### Always check if a commit was pushed before amending

Before running `git commit --amend`, verify the commit hasn't been pushed:

```bash
git log --oneline origin/<branch>..HEAD
```

If the output is empty, the commit is already on the remote — do NOT amend. Create a new commit instead. Amending a pushed commit rewrites history and requires a force push, which is destructive and risks breaking CI or other collaborators' branches.

Rule: only amend **unpushed** commits. When in doubt, create a new fixup commit.

### Always use package.json scripts for final verification

During development, it's fine to use bare commands for speed (`npx tsc --noEmit`, `npx mocha 'spec/one.spec.ts'`, `npx playwright test spec/app/one.spec.ts`). But before committing or reporting work as complete, always use the package.json script equivalents:

| During TDD (fast feedback) | Final verification (before commit) |
|---|---|
| `npx tsc --noEmit` | `npm run compile` |
| `npx mocha 'spec/one.spec.ts'` | `npm test` |
| `npx playwright test spec/app/tags/` | `npm test` |

**Why:** Package.json scripts run the full pipeline — pretest hooks (data generation, compilation), all test suites (not just one), and post-test steps (coverage, bundling). Bare commands skip these and can pass against stale output, missing test suites, or incomplete builds.

This applies even when you "just compiled" — the pipeline exists to catch what you assume is fine. The urge to skip a step is the signal that the step is needed.

Correct:
```bash
cd packages/html-reporter && npm run compile
cd packages/html-reporter && npm test
cd integration/html-reporter && npm test
```

Wrong (for final verification):
```bash
npx tsc --build tsconfig.build.json
npx playwright test spec/app/tags/
npx mocha --config ../../.mocharc.yml 'spec/cli/*.spec.ts'
```

### Lint ALL staged files before every commit — no exceptions

Before every `git commit`, lint every staged `.ts`, `.js`, and `.mjs` file — not just files from one package:

```bash
git diff --cached --name-only --diff-filter=d | grep -E '\.(ts|js|mjs)$' | xargs npx eslint
```

Do NOT hand-pick files to lint. Do NOT report "lint clean" unless you ran the command above and it exited 0. If you only linted a subset, say so explicitly.

This catches cross-package issues (e.g., a file in `integration/` that uses a variable name violating `unicorn/name-replacements`) that per-package linting misses.

### Always use `npm run compile` when building a package

Each package produces both CJS (`lib/`) and ESM (`esm/`) output. Running `npx tsc --build tsconfig.build.json` only builds one of them. Other packages that depend on it (via `workspace:*` links) may resolve to either output depending on their `moduleResolution` setting (e.g., `Node16` uses the `exports` field which distinguishes `import` vs `require` conditions).

Always use `npm run compile` in the package directory — this runs both `tsconfig-cjs.build.json` and `tsconfig-esm.build.json` builds. Failing to build both will cause type errors in downstream packages that happen to resolve via the stale output.

For the html-reporter specifically, `npm run compile` also runs `bundle-template.mjs` which produces the self-contained `template.js` bundle. Skipping this means integration tests run against a stale template — CSS/layout changes won't be reflected.

### `npm run compile` must include @serenity-js/core when changing its public API

When adding methods to `RequirementsHierarchy` in `@serenity-js/core`, downstream packages (like html-reporter) resolve types from core's compiled output (`lib/`). If you only compile the downstream package, TypeScript can't see the new methods.

Always compile the dependency first:
```bash
cd packages/core && npm run compile
cd packages/html-reporter && npm run compile
```

---

## Working Style

### Work in small chunks with short feedback loops

Always prefer:
- **Small batches** over large bulk changes — one domain area at a time, not all 12 placeholders at once
- **Short feedback loops** — verify after each chunk, not at the end of a phase
- **Continuous improvement** — each chunk informs the next; adapt approach based on what you learn

This applies to delegation too: send the tdd-developer one focused task (e.g., "dashboard consistency card"), review the result, then send the next. Don't queue up all work upfront.

### Two failed attempts means stop and ask

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

### Component rewrites can silently drop functionality

When delegating a component rewrite to a sub-agent, existing functionality (like repo URL links in TestRunRow) can be silently lost if:
1. The rewrite prompt doesn't explicitly list ALL existing behaviours to preserve
2. No component test covers the specific behaviour (e.g., "branch links to repo URL")

**Prevention:** Before rewriting a component, enumerate its observable behaviours (not just its structure) and verify each has a test. If a behaviour isn't tested, add the test FIRST, then rewrite.

**Detection:** After a rewrite, check for unused imports/variables — these often indicate dropped functionality (e.g., `repoUrl` computed but never used in the template).

### Kiro hooks do not fire automatically from the write tool

`.kiro/hooks/` defines `PostFileSave` hooks (e.g. `lint-on-save`) that run when a file is saved in the IDE. The `write` tool does **not** trigger these hooks. To respect them:

1. At the start of any task, read `.kiro/hooks/` to discover what hooks exist and what commands they run.
2. After every batch of file writes, run the hook commands manually — e.g. `npx eslint <changed-files>` for `lint-on-save`.
3. Treat hook commands as mandatory verification steps, not optional extras, before presenting work as complete.

---

## Domain Events & Adapters

### Playwright Test retries emit SceneSequenceDetected

When Playwright Test retries a scenario, the adapter emits `SceneSequenceDetected` + `SceneParametersDetected` framing (the same framing used for Cucumber Scenario Outlines). The events share a single `sceneId` and arrive in one queue. Distinguish retries from outlines by checking for `RetryableSceneDetected` in the event stream.

If you're processing `DomainEventQueues` and see `SceneSequenceDetected`, always check whether `RetryableSceneDetected` is also present before assuming it's a Scenario Outline.

### Cucumber Scenario Outlines produce one sceneId per example row

The Cucumber adapter calls `serenity.assignNewSceneId()` for every example row in a Scenario Outline. All rows share the same `ScenarioDetails` (name + source location of the outline declaration), so `DomainEventQueues` merges them into **one queue**. But `SceneDataCollector.groupEventsBySceneId()` then splits them back into separate groups — one `SceneRecordBuilder` per example.

The critical downstream implication: `resolveRetries()` sees N records from one queue with no project tag differentiation. Without the `RetryableSceneDetected` check, it treats them as N retry attempts of the same test — marking a 42-example outline as "retried 41 times" and flagging it flaky.

Rule: when `resolveRetries()` encounters multiple records in a project group, check `areScenarioOutlineExamples()` before assuming retries. The signal is: records have `scenarioOutline` data AND no `RetryableSceneDetected` events for their sceneIds.

### DomainEventQueues merges events by ScenarioDetails, not just sceneId

`DomainEventQueues.queueIdFor()` groups non-`SceneStarts` events by matching `ScenarioDetails` (name + location), not just by `sceneId`. This means events from different sceneIds can end up in the same queue if they share the same scenario identity. This is intentional — it enables retry grouping — but it means a single queue may contain multiple `SceneStarts`/`SceneFinished` pairs.

### Test-scoped crew members must be unassigned after each test

In `packages/playwright-test/src/api/index.ts`, the `configureScenarioInternal` fixture calls `serenity.configure({ crew: [...] })` for each test. Because `configure()` appends crew to the `StageManager.subscribers` array (via `stage.assign()`), crew members accumulate across tests running in the same worker. This causes duplicate screenshots (N Photographers = N screenshots per interaction).

The fix: `configure()` returns the instantiated crew array. The fixture stores it and calls `serenity.unassign(...sceneCrew)` in the `finally` block after `persist()`. This ensures each test starts with a clean crew.

### Mocha sets `error.multiple = [error]` — a circular self-reference

Mocha's base reporter (`lib/reporters/base.js:395`) appends the error to its own `multiple` array property when a test and its hooks both fail: `test.err.multiple = (test.err.multiple || []).concat(err)`. Since `test.err` IS `err`, this creates `error.multiple = [error]` — a direct circular reference on every failing test.

Any serialisation code that traverses all own properties of an Error (like `TinyType.prototype.toJSON`) will stack overflow. Safe serialisation must explicitly pick fields (`name`, `message`, `stack`, `cause`) rather than iterating `Object.getOwnPropertyNames(error)`.

---

## HTML Reporter — Data & Aggregation

### The html-reporter has two distinct execution modes

1. **Crew member mode** (`TestRunArchiver` + `HtmlReportGenerator`) — runs during a test, writes artifacts directly to `test-runs/`, reads from the same output directory for aggregation. No `sourceFileSystem` needed.

2. **CLI aggregate mode** — reads `db.json` files from arbitrary external paths, needs a `sourceFileSystem` rooted at their common ancestor to copy artifacts into the output directory. Always pass `sourceFileSystem` in this mode.

### Two-phase db.json write detects crashed CI runs

The `TestRunArchiver` uses a two-phase write to detect process crashes:

1. **On `TestRunStarts`:** write a placeholder `db.json` with `startedAt`, empty `scenes[]`, `systemContext` — but no `finishedAt` and no `testRunner`
2. **On `TestRunFinishes`:** overwrite with the full `db.json` including `finishedAt`

If the CI runner crashes between steps 1 and 2, the placeholder persists on disk. During aggregation, `db.json` files without `finishedAt` are classified as incomplete modules and surfaced with ⚠️ indicators in the report.

Key design decisions:
- `finishedAt` absence is the **sole signal** for incomplete runs — no separate `status` field needed
- A `db.json` without `finishedAt` is valid, not a schema error — `validateRunData` accepts it
- The placeholder includes `systemContext` (detected synchronously) so the report can show environment info even for crashed runs
- `RunData.testRunner` is also optional — it's populated later by `TestRunnerDetected`, which may never fire if the crash is early

### `detectTestRunId()` and `detectModuleId()` only appropriate for auto-detected CI environments

When a user explicitly sets `testRunId` in the config, `detectModuleId()` should NOT fire. The module ID auto-detection creates subdirectories (`{testRunId}/{moduleId}-{attempt}/`) which breaks tools that expect `db.json` directly under `test-runs/{testRunId}/`.

Rule: only call `detectModuleId()` when `testRunId` came from environment auto-detection (not from explicit config).

### `detectModuleId()` and `systemContext.projectName` are not the same as explicit `moduleId`

When multiple CI jobs share the same `package.json` (e.g., `webdriverio-8-web` running with different protocols), `systemContext.projectName` returns the same value for both. The explicit `moduleId` (from config or directory name) is the authoritative identifier.

Rule: store `moduleId` in `db.json` and prefer it over `systemContext.projectName` when deriving module identity during aggregation.

### CI re-runs cause duplicate data when gh-pages history overlaps with fresh artifacts

When a GitHub Actions workflow is re-run, the "HTML Report: aggregate" job downloads BOTH:
1. Historical data from gh-pages (which includes the previously-merged current build)
2. Fresh module artifacts from the current run

The `mergeAdditively` function in `DataSnapshotAggregator` must handle overlapping scenes (same `sceneIdentity`) within the same attempt group:
- **Different outcome** → record as retry attempt (earlier source had a failure that's now fixed)
- **Same outcome** → keep the later version and skip the duplicate (not a genuine retry)

Never blindly concatenate `[...base.scenes, ...addition.scenes]` — always check for identity collisions.

### Path depth distinguishes stale pre-merged data from fresh module-level data

When the html-reporter aggregates `db.json` files from multiple sources (fresh CI artifacts + historical gh-pages data), the same `testRunId` can appear in both:
- **Run-level (pre-merged):** `test-runs/8334/db.json` — aggregated output from a previous CI run, containing stale data
- **Module-level (individual):** `test-runs/8334/cucumber-1/db.json` — fresh artifact from a specific CI job

**Rule:** When module-level files exist for a `testRunId`, exclude run-level files from the merge — they contain stale pre-merged data that would mask missing/crashed modules.

### WebdriverIO parallel workers write to conflicting db.json paths

WebdriverIO distributes spec files across parallel workers, each running in its own process with its own `TestRunArchiver`. Without coordination, all workers write to the same `db.json` path — the last worker to finish overwrites all others.

**Fix:** Detect `WDIO_WORKER_ID` environment variable and create worker-specific filenames (`db-{workerId}.json`). Aggregation globs must find both `db.json` and `db-*.json`.

### Deploy to gh-pages with `clean: true` to enforce pruning

The `maxHistory` pruning in the aggregator only removes old runs from the local output directory. With `clean: false` on the deploy action, pruned directories persist on gh-pages forever and get re-downloaded on every subsequent run. Use `clean: true` to make gh-pages match the local output exactly.

### Zod schema is the single source of truth for RunData validation

Define a `RunDataSchema` in Zod that mirrors the `RunData` interface. Key patterns:
- Check `schemaVersion` compatibility *before* Zod parsing (semantic vs structural errors)
- Use `z.unknown()` for trusted inner structures like `scenes[]`
- Zod's `path.join('.')` + `message` produces paths like `outcomes.passed` that match existing test expectations

### GitHub Actions artifact uploads reject colons in paths

Always sanitise timestamps used as directory names: `.replaceAll(':', '-')` → `2026-07-10T08-16-29.795Z`. Keep the original ISO format for data fields — only sanitise for filesystem paths.

### Integration tests that spawn child processes must control CI env var leakage

Strip CI detection env vars (`GITHUB_RUN_NUMBER`, `GITHUB_RUN_ATTEMPT`, `CI_PIPELINE_IID`, `BUILD_NUMBER`, `CIRCLE_BUILD_NUM`) from the child process environment when the test needs isolated per-invocation directories.

### WebdriverIO 8 chromedriver version must match the installed Chrome

Pinning `chromedriver` in npm `devDependencies` while installing `chrome@stable` via `@puppeteer/browsers` causes version drift. Fix: use `computeExecutablePath` from `@puppeteer/browsers` to resolve both from a shared `./browsers/` directory.

---

## HTML Reporter — Client-Side (App)

### Source line numbers are not always available

Not all test runner adapters emit source line numbers (e.g. Protractor/Mocha). When building identifiers from `source.path + ':' + source.line`, always handle the case where `line` is `undefined`. Use the scenario name as a disambiguation fallback.

### Client-side scenario lookups must use tagDiscriminator, not just source location

The server-side aggregator uses `sceneIdentityWithTags()` which includes browser/project/platform tags when matching scenarios. Any client-side code that looks up a scenario by source location must do the same — otherwise it will match the **first** variant (e.g. desktop) when it should match a specific variant (e.g. mobile).

Rule: whenever you `scenarios.find()` using `source.path + ':' + source.line`, also compare `tagDiscriminator(ref.tags) === tagDiscriminator(scenario.tags)` when the ref has tags.

### ANSI escape sequences are Playwright Test-specific

Only Playwright Test embeds ANSI SGR colour codes in error messages. Cucumber, Mocha, Jasmine, and WebdriverIO produce plain text errors.

Implications:
- **List views**: use `stripAnsi()` for plain text
- **Detail views**: use `ansiToHtml()` with `white-space: pre-wrap`
- Never assume error messages will have ANSI codes

### Report terminology: "flaky" vs "inconsistent"

- **Flaky** — fails on an earlier attempt but passes on retry *within a single test run*
- **Inconsistent** — *final outcome* differs across test runs
- **Degraded** — was passing, now failing
- **Recovered** — was failing, now passes *cleanly* without retry

"Recovered" requires a clean pass — if it passes only via retry, it's "flaky" not "recovered."

### Consistency view icon must use the same outcomeClass/outcomeIcon as scenario detail

No component should independently map outcomes to icons — always go through `outcomeClass`/`outcomeIcon`. A separate `kindIcon()` function will diverge from the canonical mapping.

### `history` prop shadows `window.history` in html-reporter components

Inside a component that receives a `history: ReportHistoryEntry[]` prop, bare `history.replaceState(...)` resolves to the **prop** (an array), not `window.history`. Always use `window.history.replaceState(...)` explicitly.

### `utils/index.ts` barrel is side-effect-free — keep it that way

Before adding a new export to `utils/index.ts`, verify the module has no top-level throws, no `window` access at import time, and no mutable state initialization.

### Discriminated union URL builder centralises encoding and validates parameters at compile time

A single `link()` function with discriminated union types ensures all encoding happens in one place and invalid parameter combinations are caught at compile time. All components delegate to `link()` — never construct URLs inline.

### Artifact types and their rendering

| Artifact | Persisted to disk? | Inlined in data.js? | Rendered as |
|----------|:-:|:-:|---|
| `Photo` (screenshot) | Yes (.png) | No (path reference) | Thumbnail + lightbox |
| `HTTPRequestResponse` | No | Yes (`restQuery`) | Collapsible REST panel |
| `LogEntry` / `TextData` | No | Yes (`reportData[]`) | Pre-formatted text block |
| `JSONData` (generic) | No | Yes (`reportData[]`) | Pre-formatted JSON block |
| Video (.webm) | Yes | No (path reference) | Inline video player |

### Tree collapse rules in CapabilitiesView

- **Don't start collapsing** if the node has a `readme` or files
- **Stop collapsing into** a child that has a `readme`
- **DO collapse through** children that only have files but no readme

### Chart.js legend sizing with usePointStyle

`usePointStyle: true` renders legend items using each dataset's `pointRadius` — tiny for bar datasets. Use `boxWidth`/`boxHeight` instead.

### PhotoStrip collectPhotos traversal order

Each activity's own `artifacts` array is processed **before** recursing into `children`. Parent screenshots appear before children's.

### Don't add a separate status indicator when an existing control already communicates the state

Before introducing a banner/alert/status bar, check whether an existing interactive element (dropdown, tab, breadcrumb) already communicates the same state. If it does, enhance that element's visual treatment instead of adding a new component.

---

## HTML Reporter — CSS & Layout

### Inline styles bypass CSS media query overrides

If a component uses an inline `style=` attribute, no CSS class-based media query can override it. Always use CSS classes for properties that need responsive overrides.

### CSS source-order within a single file can silently break media query overrides

Base rules must appear BEFORE responsive overrides in the file. Same specificity + later source position = later wins, regardless of media query.

### Virtual scroll containers make `position: sticky` ineffective on parent elements

The `.scroll-container` with `overflow-y: auto` creates its own scroll context. `position: sticky` on elements *outside* it will never activate. Don't add sticky CSS above virtual scroll lists.

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

## HTML Reporter — Testing

### html-reporter has TWO test suites — verify both

1. **Mocha unit tests** (`spec/cli/`, `spec/navigation/`) — run via `npx mocha`
2. **Playwright component tests** (`spec/app/`) — run via `npx playwright test`

Running `npx mocha 'spec/**/*.spec.ts'` does NOT exercise the Playwright component tests. Any change to `app/` or `src/serenity/` requires running BOTH test suites before committing. Use `npm test` which runs them all.

### Component tests use the Interaction Object pattern

Key points:
- Interaction objects live in `src/*.serenity.ts` and encapsulate locators, Questions, and Tasks
- The `mount` fixture accepts an `interactionObject` class and returns the typed instance
- All assertions use `Ensure.that(...)` within `actor.attemptsTo(...)`
- `data` and `dataAsProps` mount options are only needed for view-level components

### Component tests: when to keep raw Playwright vs convert to IO

**Convert to IO** when testing user-observable behaviour (text, counts, navigation, filtering).

**Keep as raw Playwright** when testing implementation contracts (ARIA attributes, CSS values, class names, keyboard focus, theme rendering). Add an explanatory comment explaining why.

### Component extraction is import-path-stable

When extracting sub-components from a view file, as long as the parent file still exports the same function at the same path, all existing tests continue to pass. Extracted children are internal details.

### `data-testid` on views enables scoped interaction object hierarchies

Fixture → view root by `data-testid` → child widgets by `data-testid` → widget scopes its own locators within.

### Interaction object constructors accept `Answerable<PageElement<NET>>`

Always type interaction object constructor parameters as `Answerable<PageElement<NET>>` — this accepts all forms: raw `PageElement`, `Question<PageElement>`, `Question<Promise<PageElement>>`, and `Promise<PageElement>`.

### Interaction object APIs should describe user-observable behaviour, not implementation

- **DO** expose: `text()`, `outcomeType()`, `outcomes()`
- **DON'T** expose: `ariaLive()`, `cssClass()`, raw attribute accessors
- **DO** return cohesive data structures (not parallel arrays correlated by index)

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

### Stale http-server processes cause phantom test failures

If integration tests fail to start, check for port conflicts. Kill stale servers:
```bash
pkill -f 'http-server.*8080'; pkill -f 'http-server.*8090'; sleep 2
```

### Regenerating a served html-report requires re-aggregation, not just compile

`npm run compile` rebuilds the template.js bundle, but the served report uses the old embedded template until you re-run aggregation (e.g., `npx failsafe example:clean example:test example:add-history` in `integration/html-reporter/`).

### Moving elements outside a `data-testid` container breaks interaction objects

Before restructuring: check which `data-testid` attributes exist and which tests use them as scoping ancestors. If you move a child element outside, the `data-testid` must move to a wrapper encompassing both.

---

## HTML Reporter — Preact Components

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

## HTML Reporter — CLI & Build

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

## General Architecture

### Tell, don't ask: move behaviour into the object that owns the data

If you find yourself passing an object's internal dependency to another function so that function can do work the object could do itself — move that work into the object.

### Heterogeneous registries need a generic builder function, not loose types

Use a `defineX<P>(config)` builder function that infers the generic, verifies internal consistency, then returns the type-erased collection member. The generic proves consistency at definition time.

### `Record<string, unknown>` as a return type is a code smell

If a function constructs a specific structure, type the return precisely.

### Function parameter types should match actual field access, not the source interface

Type parameters based on *what the function reads*, not *where the data typically comes from*.

---

## Stabilisation Policy

### html-reporter is in UI stabilisation — no new UI elements without approval

Do not introduce new UI elements (filter chips, views, buttons, panels, sections) without explicitly asking the user first. Implementation changes to existing elements are fine — adding new visible surface area is not.

---

## Documentation

### Documentation messaging: lead with differentiators, not features

Lead with what's *different*, not what's *possible*. Use the product name in headings, not the npm package name.

### data.js makes the report a multi-file deployment, not a single shareable file

Say "deploy the directory to any static host" or "open `index.html` directly". The `file://` claim is about zero-server operation, not single-file portability.

---

## Agent Design

### Agent definition design: system prompt vs prompt template separation

- **System prompt** — identity, knowledge, constraints (every invocation)
- **Prompt template** — task-specific workflow (single invocation)

Don't duplicate content between them. `resources` in the agent definition provide deep context without bloating the prompt.
