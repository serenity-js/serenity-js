# Lessons Learned

Project-specific patterns discovered during development that aren't obvious from the code alone.

## Playwright Test retries emit SceneSequenceDetected

When Playwright Test retries a scenario, the adapter emits `SceneSequenceDetected` + `SceneParametersDetected` framing (the same framing used for Cucumber Scenario Outlines). The events share a single `sceneId` and arrive in one queue. Distinguish retries from outlines by checking for `RetryableSceneDetected` in the event stream.

If you're processing `DomainEventQueues` and see `SceneSequenceDetected`, always check whether `RetryableSceneDetected` is also present before assuming it's a Scenario Outline.

## DomainEventQueues merges events by ScenarioDetails, not just sceneId

`DomainEventQueues.queueIdFor()` groups non-`SceneStarts` events by matching `ScenarioDetails` (name + location), not just by `sceneId`. This means events from different sceneIds can end up in the same queue if they share the same scenario identity. This is intentional — it enables retry grouping — but it means a single queue may contain multiple `SceneStarts`/`SceneFinished` pairs.

## Source line numbers are not always available

Not all test runner adapters emit source line numbers (e.g. Protractor/Mocha). When building identifiers from `source.path + ':' + source.line`, always handle the case where `line` is `undefined`. Use the scenario name as a disambiguation fallback.

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

## ANSI escape sequences in error messages

Test runners like Playwright embed ANSI SGR colour codes in error messages (e.g., `\u001b[32m` for green "Expected" values, `\u001b[31m` for red "Received" values). The `ansiToHtml` utility in `template/utils/` converts these to `<span class="ansi-{colour}">` elements. Error rendering uses `dangerouslySetInnerHTML` to output the converted HTML.

When adding new error display locations, remember to use `ansiToHtml()` — raw interpolation (`${error.message}`) will show escape characters to the user.

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

The `.context-label` and `.kpi-label` CSS classes apply `text-transform: uppercase`. When interaction objects read text via `element.text()` or `Text.of(element)`, they get the **rendered** (uppercase) text, not the source text.

When using `.where(Text.of(...), equals(label))` to filter elements by label, the comparison value must be UPPERCASE to match. This applies to any CSS-styled text — always check the computed style when text matching fails unexpectedly.

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
