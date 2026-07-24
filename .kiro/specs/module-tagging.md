# Module Tagging for Test Scenarios

## Problem

When a CI build runs multiple test modules (e.g., `playwright-test`, `webdriverio-8-devtools`, `cucumber-12`), the
aggregated HTML report shows all scenarios together. Users cannot easily answer "which tests belong to which module?"
or filter the scenario list to show only one module's tests.

The `modules` array on `ReportHistoryEntry` (from the incomplete run detection feature) tells you *aggregate* module
status, but doesn't attribute individual test scenarios to their originating module.

## Solution

Automatically tag every test scenario with `@module:<moduleId>` during archiving. This flows through the existing
tag infrastructure — no new plumbing needed. Users can then:

- Filter by `@module:webdriverio-8-devtools` in the Scenarios view search
- See per-module scenario counts in the Tags view
- Cross-reference module health with individual test outcomes

## Implementation

### TestRunArchiver — emit module tag

When `moduleId` is known (either from config or auto-detected), the `SceneDataCollector` should attach a
`{ type: 'module', name: moduleId }` tag to every scene record it produces.

```typescript
// In SceneDataCollector.collect(), after building scenes:
if (moduleId) {
    for (const scene of scenes) {
        scene.tags.push({ type: 'module', name: moduleId });
    }
}
```

Alternatively, emit `SceneTagged` events from the adapter level — but since the module ID is only known at the
archiver/reporter level (not the test runner adapter), post-processing in `SceneDataCollector` is cleaner.

### Data model

No schema changes needed. The `module` tag type is just a new value for `TagRecord.type`, which is already a free-form
string. The existing tag search (`@module:webdriverio-8-devtools`) will work immediately via the `matchesTagToken`
function's typed tag matching (`@type:value` syntax).

### Tag search support

Already works — `@module:playwright-test` would match tags with `type === 'module'` and `name.includes('playwright-test')`.
The shorthand `@module` would match *any* tag with type `module` (listing all module-tagged scenarios).

### Tags view

The Tags view already groups by tag type. A new "module" group would appear automatically, showing each module with
its pass rate. No UI changes needed.

### RunSelector filtering

When viewing a specific historical run, the tag filter still applies. Users can combine `@module:x` with outcome
filters to see "failed tests in the webdriverio module for run #42".

## Configuration

### Automatic (default)

When `detectModuleId()` returns a value (CI environment with auto-detection), the tag is applied automatically.
No user configuration needed.

### Explicit

Users can set `moduleId` in their reporter config:
```typescript
crew: [
    ['@serenity-js/html-reporter', { moduleId: 'my-module' }],
]
```

### Opt-out

When neither auto-detection nor explicit config provides a `moduleId`, no tag is applied. Single-module projects
(the common case for local development) don't get a redundant tag.

## Testing

- Unit test: verify `SceneDataCollector.collect()` adds module tag when moduleId is provided
- Unit test: verify no module tag when moduleId is undefined
- Integration test: verify `@module:` appears in Tags view for multi-module aggregation

## Backwards Compatibility

Purely additive — existing reports gain the tag on next run. No breaking changes.
The tag is a regular `TagRecord` processed by existing infrastructure.
