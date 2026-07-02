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

In `packages/playwright-test/src/api/test-api.ts`, the `configureScenarioInternal` fixture calls `serenity.configure({ crew: [...] })` for each test. Because `configure()` appends crew to the `StageManager.subscribers` array (via `stage.assign()`), crew members accumulate across tests running in the same worker. This causes duplicate screenshots (N Photographers = N screenshots per interaction).

The fix: `configure()` returns the instantiated crew array. The fixture stores it and calls `serenity.unassign(...sceneCrew)` in the `finally` block after `persist()`. This ensures each test starts with a clean crew.