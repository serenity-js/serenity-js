# URL Building Refactor — Architecture Analysis

**Date:** 2026-07-27  
**Status:** Proposed  

## Problem Statement

URL construction is scattered across the html-reporter codebase with multiple patterns for building navigation URLs. This leads to:
- **Duplication:** `encodeURIComponent` called in 10+ files
- **Inconsistency:** Some URLs use template strings, others use URLSearchParams
- **Fragility:** Easy to forget encoding, leading to bugs with special characters
- **Testing burden:** Each component reimplements the same URL logic

## Current Patterns

### Pattern 1: Test Scenarios View (with search/filter)
```typescript
// In 6+ locations:
'/tests?search=' + encodeURIComponent('@browser:chromium')
'/tests?search=' + encodeURIComponent('\"' + filePath + '\"')
'/tests?run=' + encodeURIComponent(runId) + '&search=' + encodeURIComponent('@module:' + moduleId)
```

### Pattern 2: Scenario Detail View
```typescript
// In scenarioUrl():
'/tests/' + encodeURIComponent(id) + '?run=' + timestamp + '&browser=' + browserTag
```

### Pattern 3: Capabilities View
```typescript
// In CapabilityDetail:
'/capabilities?path=' + encodeURIComponent(path)
```

### Pattern 4: Module Navigation (recent addition)
```typescript
// In moduleUrls.ts:
function buildModuleUrl(runId, moduleId) {
    return `/tests?run=${encodeURIComponent(runId)}&search=${encodeURIComponent('@module:' + moduleId)}`;
}
```

## Proposed Solution: Central `link()` Function

### Design Principles

1. **Single Source of Truth** — One function builds all internal navigation URLs
2. **Type Safety** — TypeScript ensures correct parameter usage
3. **Consistent Encoding** — All values automatically encoded
4. **Readable Call Sites** — Self-documenting parameter names
5. **Extensible** — Easy to add new views/parameters without breaking existing code

### API Design

```typescript
/**
 * Builds internal navigation URLs for the HTML report.
 * Automatically handles URL encoding and query parameter construction.
 * 
 * Uses discriminated union types to ensure only valid parameters are accepted for each view.
 *
 * @example
 * // Navigate to test scenarios view
 * link({ view: 'tests' })
 * // → '/tests'
 *
 * @example
 * // Filter scenarios by search
 * link({ view: 'tests', search: '@module:playwright-test' })
 * // → '/tests?search=%40module%3Aplaywright-test'
 *
 * @example
 * // View scenario detail (path is part of tests view options)
 * link({ view: 'tests', path: 'auth.spec.ts:42', run: '8333', browser: 'chromium' })
 * // → '/tests/auth.spec.ts%3A42?run=8333&browser=chromium'
 *
 * @example
 * // Filter by module + outcome
 * link({ view: 'tests', run: '42', search: '@module:playwright-test', filter: 'failed' })
 * // → '/tests?run=42&search=%40module%3Aplaywright-test&filter=failed'
 * 
 * @example
 * // Navigate to capabilities with path
 * link({ view: 'capabilities', path: 'authentication/login' })
 * // → '/capabilities?path=authentication%2Flogin'
 * 
 * @example
 * // TypeScript prevents invalid parameters
 * link({ view: 'dashboard', search: '@tag' })
 * //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Error: 'search' is not valid for 'dashboard'
 */
function link(options: LinkOptions): string;

// Discriminated union — each view has its own valid parameter set
type LinkOptions =
    | DashboardLink
    | TestsLink
    | CapabilitiesLink
    | ErrorsLink
    | ConsistencyLink
    | TimelineLink
    | TagsLink
    | TestRunsLink
    | SystemLink
    | AboutLink;

// Dashboard — no parameters (static view)
interface DashboardLink {
    view: 'dashboard';
}

// Test Scenarios — supports filtering, searching, sorting, run selection
interface TestsLink {
    view: 'tests';
    path?: string;              // For scenario detail: 'file.spec.ts:42' or 'file.spec.ts:scenarioName'
    run?: string | number;      // Test run ID or timestamp
    search?: string;            // Search query (e.g., '@module:playwright-test', '@browser:chromium')
    filter?: OutcomeFilter;     // Outcome filter
    sort?: 'category' | 'name' | 'duration' | 'status';
    // Scenario discriminators (for multi-variant scenarios)
    browser?: string;
    project?: string;
    platform?: string;
}

// Capabilities — path-based navigation
interface CapabilitiesLink {
    view: 'capabilities';
    path?: string;              // Capability tree path (e.g., 'authentication/login')
}

// Errors — supports filtering and run selection
interface ErrorsLink {
    view: 'errors';
    run?: string | number;
    search?: string;
}

// Consistency — no parameters (shows inconsistent tests)
interface ConsistencyLink {
    view: 'consistency';
}

// Timeline — no parameters (chronological view)
interface TimelineLink {
    view: 'timeline';
}

// Tags — no parameters (tag overview)
interface TagsLink {
    view: 'tags';
}

// Test Runs — no parameters (run history)
interface TestRunsLink {
    view: 'test-runs';
}

// System Context — no parameters (environment info)
interface SystemLink {
    view: 'system';
}

// About — no parameters (report metadata)
interface AboutLink {
    view: 'about';
}

type OutcomeFilter = 'all' | 'passed' | 'failed' | 'skipped' | 'pending' | 'compromised' | 'error';
```

### Implementation

**File:** `packages/html-reporter/app/utils/link.ts` (new)

```typescript
// Discriminated union — each view has its own valid parameter set
export type LinkOptions =
    | DashboardLink
    | TestsLink
    | CapabilitiesLink
    | ErrorsLink
    | ConsistencyLink
    | TimelineLink
    | TagsLink
    | TestRunsLink
    | SystemLink
    | AboutLink;

export interface DashboardLink {
    view: 'dashboard';
}

export interface TestsLink {
    view: 'tests';
    path?: string;
    run?: string | number;
    search?: string;
    filter?: OutcomeFilter;
    sort?: 'category' | 'name' | 'duration' | 'status';
    browser?: string;
    project?: string;
    platform?: string;
}

export interface CapabilitiesLink {
    view: 'capabilities';
    path?: string;
}

export interface ErrorsLink {
    view: 'errors';
    run?: string | number;
    search?: string;
}

export interface ConsistencyLink {
    view: 'consistency';
}

export interface TimelineLink {
    view: 'timeline';
}

export interface TagsLink {
    view: 'tags';
}

export interface TestRunsLink {
    view: 'test-runs';
}

export interface SystemLink {
    view: 'system';
}

export interface AboutLink {
    view: 'about';
}

export type OutcomeFilter = 'all' | 'passed' | 'failed' | 'skipped' | 'pending' | 'compromised' | 'error';

/**
 * Builds internal navigation URLs for the HTML report.
 * Automatically handles URL encoding and query parameter construction.
 * 
 * Uses discriminated union types to ensure only valid parameters are accepted for each view.
 */
export function link(options: LinkOptions): string {
    const { view } = options;
    
    // Build base path
    let base = view === 'dashboard' ? '/' : '/' + view;
    
    // Handle path segment for detail views (with proper type narrowing)
    if (options.view === 'tests' && options.path) {
        base += '/' + encodeURIComponent(options.path);
    } else if (options.view === 'capabilities' && options.path) {
        // Capabilities uses query parameter, not path segment
        // (handled below in query params)
    }
    
    // Build query parameters using type-safe access
    const params = new URLSearchParams();
    
    // Tests view parameters
    if (options.view === 'tests') {
        if (options.run !== undefined && options.run !== null) {
            params.set('run', String(options.run));
        }
        if (options.search) {
            params.set('search', options.search);
        }
        if (options.filter && options.filter !== 'all') {
            params.set('filter', options.filter);
        }
        if (options.sort) {
            params.set('sort', options.sort);
        }
        if (options.browser) {
            params.set('browser', options.browser);
        }
        if (options.project) {
            params.set('project', options.project);
        }
        if (options.platform) {
            params.set('platform', options.platform);
        }
    }
    
    // Capabilities view parameters
    if (options.view === 'capabilities' && options.path) {
        params.set('path', options.path);
    }
    
    // Errors view parameters
    if (options.view === 'errors') {
        if (options.run !== undefined && options.run !== null) {
            params.set('run', String(options.run));
        }
        if (options.search) {
            params.set('search', options.search);
        }
    }
    
    const query = params.toString();
    return query ? base + '?' + query : base;
}

/**
 * Convenience function for building test scenario list URLs.
 * More concise than writing `link({ view: 'tests', ... })`.
 */
export function testsLink(options: Omit<TestsLink, 'view'> = {}): string {
    return link({ view: 'tests', ...options });
}

/**
 * Convenience function for building scenario detail URLs.
 * Handles the common pattern of building IDs from source location.
 */
export function scenarioLink(
    source: { path: string; line?: number; name?: string },
    options: Omit<TestsLink, 'view' | 'path'> = {}
): string {
    const id = source.line
        ? source.path + ':' + source.line
        : source.name
            ? source.path + ':' + source.name
            : source.path;
    return link({ view: 'tests', path: id, ...options });
}

/**
 * Convenience function for building capability detail URLs.
 */
export function capabilityLink(path: string): string {
    return link({ view: 'capabilities', path });
}
```

## Interaction Objects Can Reuse link()

**Current Problem:** Interaction objects need to verify navigation behavior, but they can't easily construct the URLs that components generate without duplicating logic.

### Example: TestRunsView Navigation Tests

Currently, tests verify navigation by inspecting the URL that was passed to `onNavigate`:

```typescript
// integration/html-reporter/spec/test-runs/module-table-navigation.spec.ts
it('navigates to all tests for that module when clicking the module name', async ({ actor }) => {
    await actor.attemptsTo(
        view.clickModuleName('playwright-web'),
        ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
        Ensure.that(LastScriptExecution.result<string>(), includes('/tests')),
        Ensure.that(LastScriptExecution.result<string>(), includes('run=42')),
        Ensure.that(LastScriptExecution.result<string>(), includes('@module:playwright-web')),
    );
});
```

**Problem:** If the component's URL construction changes (e.g., switching from inline encoding to using `link()`), the interaction object test would need updating even though the **behavior** (navigation to module tests) hasn't changed.

### Solution: Interaction Objects Use link() Too

```typescript
// packages/html-reporter/src/serenity/test-runs/TestRunsView.serenity.ts
import { link } from '../../app/utils/link.js';

export class TestRunsView<NET> extends InteractionObject<NET> {
    
    // ... existing code ...
    
    /**
     * Expected URL when clicking a module name.
     * Uses the same link() function that components use.
     */
    moduleUrl = (moduleName: string, runId: string): string => 
        link({ view: 'tests', run: runId, search: '@module:' + moduleName });
    
    /**
     * Expected URL when clicking a module's passed count.
     */
    modulePassedUrl = (moduleName: string, runId: string): string =>
        link({ view: 'tests', run: runId, search: '@module:' + moduleName, filter: 'passed' });
    
    /**
     * Expected URL when clicking a module's failed count.
     */
    moduleFailedUrl = (moduleName: string, runId: string): string =>
        link({ view: 'tests', run: runId, search: '@module:' + moduleName, filter: 'failed' });
}
```

**Updated Test:**
```typescript
it('navigates to all tests for that module when clicking the module name', async ({ actor, view }) => {
    await actor.attemptsTo(
        view.clickModuleName('playwright-web'),
        ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
        Ensure.that(
            LastScriptExecution.result<string>(), 
            equals(view.moduleUrl('playwright-web', '42'))
        ),
    );
});

it('navigates to passed tests when clicking the passed count', async ({ actor, view }) => {
    await actor.attemptsTo(
        view.clickModulePassedCount('playwright-web'),
        ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
        Ensure.that(
            LastScriptExecution.result<string>(),
            equals(view.modulePassedUrl('playwright-web', '42'))
        ),
    );
});
```

### Benefits

✅ **Single source of truth** — interaction objects and components use the same URL builder  
✅ **Refactor-safe** — changing URL structure only requires updating `link()`  
✅ **Type-safe** — interaction objects benefit from the same compile-time checks  
✅ **Clear intent** — `view.moduleUrl('foo', '42')` reads better than manual URL inspection  
✅ **Easier testing** — exact string match instead of multiple `includes()` checks

### Additional Interaction Object Helpers

```typescript
// ScenariosView.serenity.ts
import { link, scenarioLink } from '../../app/utils/link.js';

export class ScenariosView<NET> extends InteractionObject<NET> {
    
    /**
     * Expected URL when clicking a scenario row.
     */
    scenarioDetailUrl = (scenario: { path: string; line?: number }, runId?: string): string =>
        scenarioLink(scenario, runId ? { run: runId } : {});
    
    /**
     * Expected URL when applying a search filter.
     */
    searchUrl = (searchTerm: string, runId?: string): string =>
        link({ view: 'tests', search: searchTerm, ...(runId ? { run: runId } : {}) });
    
    /**
     * Expected URL when applying an outcome filter.
     */
    filterUrl = (filter: OutcomeFilter, runId?: string): string =>
        link({ view: 'tests', filter, ...(runId ? { run: runId } : {}) });
}
```

### Migration for Interaction Objects

1. Add `link()` import to interaction object files
2. Add URL helper methods (e.g., `moduleUrl()`, `scenarioDetailUrl()`)
3. Update tests to use `equals(view.moduleUrl(...))` instead of multiple `includes()` checks
4. Remove URL string inspection from test assertions

## Migration Strategy

**Principle:** Migrate incrementally with full test coverage at each step. Never break existing tests during migration.

### Phase 1: Foundation (1-2 hours)

1. **Create `app/utils/link.ts`** with discriminated union types
2. **Write comprehensive unit tests** (`spec/app/utils/link.spec.ts`)
   - All view types
   - All parameter combinations
   - Edge cases (undefined, null, empty strings)
   - URL encoding correctness
3. **Verify tests pass** — `cd packages/html-reporter && npm test`

### Phase 2: Replace moduleUrls.ts (30 min)

1. **Update `moduleUrls.ts` to use `link()`:**
   ```typescript
   // Old implementation
   export function buildModuleUrl(runId: string, moduleId: string): string {
       return `/tests?run=${encodeURIComponent(runId)}&search=${encodeURIComponent('@module:' + moduleId)}`;
   }
   
   // New implementation
   import { link } from './link.js';
   
   export function buildModuleUrl(runId: string, moduleId: string): string {
       return link({ view: 'tests', run: runId, search: '@module:' + moduleId });
   }
   ```
2. **Run unit tests** — existing `moduleUrls.spec.ts` should still pass
3. **Run integration tests** — verify navigation still works

### Phase 3: Component Migration (2-3 hours)

Migrate inline URL construction to `link()` calls, one component at a time:

**Target files:**
- `TrendChartDetails.ts` — module table navigation
- `CapabilityDetail.ts` — file path search
- `TagRow.ts` — tag search
- `ScenarioDetailView.ts` — breadcrumb navigation
- `RunSelector.ts` — run switching

**Per-component checklist:**
- [ ] Replace inline template strings with `link({ view: ..., ... })`
- [ ] Run component tests — should pass unchanged
- [ ] Run integration tests for that view
- [ ] Verify in browser (manual check)

**Example migration:**
```typescript
// Before
<button onClick=${() => onNavigate('/tests?run=' + encodeURIComponent(selectedRun.runId))}>

// After
import { link } from '../../utils/link.js';
<button onClick=${() => onNavigate(link({ view: 'tests', run: selectedRun.runId }))}>
```

### Phase 4: Interaction Object Migration (1-2 hours)

Add URL helper methods to interaction objects so tests can verify navigation using the same URL builder:

**Target files:**
- `TestRunsView.serenity.ts` — add `moduleUrl()`, `modulePassedUrl()`, etc.
- `ScenariosView.serenity.ts` — add `scenarioDetailUrl()`, `searchUrl()`, `filterUrl()`
- `CapabilitiesView.serenity.ts` — add `capabilityDetailUrl()`

**Per-interaction-object checklist:**
- [ ] Add URL helper methods using `link()`
- [ ] Update integration tests to use `equals(view.expectedUrl(...))` instead of `includes()`
- [ ] Run integration tests — should pass with exact string matches
- [ ] Verify behavior hasn't changed

**Example migration:**
```typescript
// Before (test)
Ensure.that(LastScriptExecution.result<string>(), includes('/tests')),
Ensure.that(LastScriptExecution.result<string>(), includes('run=42')),
Ensure.that(LastScriptExecution.result<string>(), includes('@module:playwright-web')),

// After (interaction object)
moduleUrl = (moduleName: string, runId: string): string =>
    link({ view: 'tests', run: runId, search: '@module:' + moduleName });

// After (test)
Ensure.that(
    LastScriptExecution.result<string>(),
    equals(view.moduleUrl('playwright-web', '42'))
),
```

### Phase 5: Deprecate Old Patterns (Future)

Once all components use `link()`:
1. Add ESLint rule to prevent inline URL construction
2. Document `link()` as the standard approach in coding standards
3. Add to code review checklist

### Rollback Plan

If issues arise during migration:
- Each phase is independently committable
- Partial migration is safe (old and new patterns coexist)
- Roll back by reverting commits for affected phases
- `link()` is additive — doesn't break existing code

### Testing Strategy

**Unit tests:**
- `link.spec.ts` — comprehensive coverage of all view types and parameters

**Component tests:**
- Existing component tests verify `onNavigate` is called with correct URL
- No changes needed (components use `link()` internally)

**Integration tests:**
- Existing navigation tests verify full user flows
- Update interaction objects to use `link()` for assertions
- Replace `includes()` checks with exact `equals()` matches

**Manual verification:**
- Smoke test all navigation flows in the browser
- Verify module table, tag navigation, breadcrumbs, filters

## Benefits

### Type Safety (New!)
```typescript
// ✓ Valid — tests view accepts search
link({ view: 'tests', search: '@module:playwright' })

// ✓ Valid — tests view accepts filter
link({ view: 'tests', filter: 'failed' })

// ✗ Compile error — dashboard doesn't accept search
link({ view: 'dashboard', search: '@tag' })
//                         ^^^^^^ Property 'search' does not exist on type 'DashboardLink'

// ✗ Compile error — filter must be a specific outcome
link({ view: 'tests', filter: 'unknown' })
//                            ^^^^^^^^^ Type '"unknown"' is not assignable to type OutcomeFilter

// ✗ Compile error — sort must be a specific value
link({ view: 'tests', sort: 'random' })
//                           ^^^^^^^^ Type '"random"' is not assignable to type '"category" | "name" | "duration" | "status"'

// ✓ Valid — capabilities view accepts path as query param
link({ view: 'capabilities', path: 'auth/login' })

// ✓ Valid — capabilities uses path differently than tests
link({ view: 'tests', path: 'file.spec.ts:42' })  // → /tests/file.spec.ts%3A42
link({ view: 'capabilities', path: 'auth/login' }) // → /capabilities?path=auth%2Flogin
```

### Maintenance
- **Single point of change** — adding a new query parameter only requires updating one interface
- **Consistent encoding** — impossible to forget `encodeURIComponent`
- **Compiler catches errors** — typos in view names and invalid parameters caught at compile time

### Readability
```typescript
// Before:
onNavigate('/tests?run=' + encodeURIComponent(runId) + '&search=' + encodeURIComponent('@module:' + moduleId) + '&filter=failed')

// After:
onNavigate(testsLink({ run: runId, search: '@module:' + moduleId, filter: 'failed' }))
```

### Testing
- Test the `link()` function once with comprehensive coverage
- Component tests no longer need to verify URL encoding
- Type errors caught at compile time, not runtime

### Extensibility
Adding a new query parameter to tests view:
1. Add field to `TestsLink` interface: `showHistory?: boolean`
2. Add conditional to implementation: `if (options.showHistory) params.set('history', 'true')`
3. TypeScript ensures all call sites that want to use it have proper autocomplete
4. Existing call sites continue to work (backward compatible)

## Trade-Offs

### Positive
- **DRY:** Eliminates duplication across 10+ files
- **Type Safety:** Compiler catches URL construction errors
- **Consistency:** All URLs follow the same pattern
- **Testability:** One function to test thoroughly

### Negative
- **Migration Effort:** ~15-20 call sites need updating
- **Breaking Change:** If we change `scenarioUrl()` signature, interaction objects break
- **Learning Curve:** Team must learn the new API

### Mitigations
- Deprecate old functions gradually (both can coexist during migration)
- Update interaction objects in a single commit
- Add JSDoc examples to the new function
- Create a "before/after" guide in the steering docs

## Testing Strategy

### Unit Tests
Test all combinations:
- Each view type
- Path segments (with special characters: spaces, colons, slashes)
- Each query parameter individually
- Multiple query parameters combined
- Edge cases (undefined/null values, empty strings)

### Integration Tests
- Update existing tests that verify URL construction
- Verify browser navigation still works with new URLs
- Test deep linking from external sources

## Recommendation

**Proceed with implementation in the following order:**

1. **Create `link.ts`** with full implementation and tests (1-2 hours)
2. **Migrate `moduleUrls.ts`** — low risk, clear improvement (30 min)
3. **Migrate component inline URLs** — straightforward replacements (1-2 hours)
4. **Deprecate `scenarioUrl()`** — schedule for next major version (mark with JSDoc)
5. **Add steering doc** — document the new pattern for future development

**Total effort:** ~4-6 hours  
**Risk:** Low (new function doesn't break existing code)  
**Value:** High (eliminates ongoing maintenance burden)

## Open Questions

1. **Should we support hash fragments?** (e.g., `#/tests?search=...` vs `/tests?search=...`)
   - Current code uses hash routing
   - `link()` should probably return paths without `#`, let the router add it

2. **Should we have separate functions per view?** (e.g., `dashboardLink()`, `capabilitiesLink()`)
   - Pro: More discoverable in autocomplete
   - Con: More functions to maintain
   - **Recommendation:** Start with `link()` + convenience functions for high-traffic patterns

3. **Should we validate view names at runtime?**
   - Pro: Catches typos in non-TypeScript contexts
   - Con: Extra overhead
   - **Recommendation:** No — TypeScript provides compile-time safety

## Success Criteria

- [ ] Zero inline `encodeURIComponent` calls in component files (except tests)
- [ ] All URL construction goes through `link()` or convenience functions
- [ ] Full test coverage of `link()` function
- [ ] No regressions in existing navigation flows
- [ ] Documentation in steering docs

---

**Next Steps:** Seek approval from project maintainer before implementing.
