---
status: done
completed: 2026-07-15
---

# Phase 6: Quality Hotspot Remediation

## Goal

Address the quality issues that would confuse or block community contributors. Focus on:
- Bugs that will crash at runtime
- Duplicated logic that leads to divergence
- God-methods that are too complex to safely modify
- Unclear data flow that makes debugging hard

## Entry Criteria

- Phases 1–5 are complete
- `npx playwright test --project=unit` passes (238 tests)
- `npx tsc --project template/tsconfig.json --noEmit` passes

---

## Priority 1: Crash-Risk Bug Fix

### 1.1 CapabilitiesView — Hooks After Early Return

**File:** `template/components/CapabilitiesView.ts` lines 80–96

**Bug:** `useState` and `useEffect` hooks are called AFTER a conditional early return (`if (!capabilities) return ...`). This violates Preact/React's rules of hooks — hooks must be called unconditionally in the same order on every render. If `capabilities` transitions from `undefined` to a value (unlikely in a static report, but still a correctness violation), the component will crash.

**Fix:** Move all hooks before the early return. Use the hook state even when `capabilities` is absent:

```typescript
export function CapabilitiesView({ capabilities, onNavigate, route }: CapabilitiesViewProps) {
    const hashNav = useHashHistory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSort, setActiveSort] = useState('name');
    const [focusedPath, setFocusedPath] = useState('');

    useEffect(() => { /* route parsing */ }, [route]);

    if (!capabilities) {
        return html`<div class="empty-state">...</div>`;
    }

    // ... rest of component using hook values
}
```

**Severity:** Critical (runtime crash risk)

---

## Priority 2: Duplicated Logic Extraction

### 2.1 Outcome Filter Matching (3 views)

**Files:** `ScenariosView.ts`, `TimelineView.ts`, `ErrorsView.ts`

**Problem:** The `filterMatch` record and `keys.flatMap(k => filterMatch[k] || [])` pattern is copy-pasted across three views.

**Fix:** Extract to `utils/selectors.ts`:

```typescript
const OUTCOME_FILTER_MAP: Record<string, string[]> = {
    passed: ['SUCCESS'],
    failed: ['FAILURE', 'ERROR', 'COMPROMISED'],
    skipped: ['SKIPPED', 'PENDING'],
};

export function matchesOutcomeFilter(outcome: string, filterKey: string): boolean {
    if (!filterKey || filterKey === 'all') return true;
    const allowed = filterKey.split(',').flatMap(k => OUTCOME_FILTER_MAP[k] || []);
    return allowed.length === 0 || allowed.includes(outcome);
}
```

### 2.2 Run Index Resolution (3 views)

**Files:** `ScenariosView.ts`, `ScenarioDetailView.ts`, `ErrorsView.ts`

**Problem:** All three parse a `run` parameter from URL query, try `findIndex` by timestamp, fall back to `parseInt`.

**Fix:** Extract to `utils/selectors.ts`:

```typescript
export function resolveRunIndex(runParam: string | null, history: ReportHistoryEntry[]): number | null {
    if (!runParam) return null;
    const byTimestamp = history.findIndex(r => r.timestamp === runParam);
    if (byTimestamp >= 0) return byTimestamp;
    const parsed = parseInt(runParam, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < history.length) return parsed;
    return null;
}
```

### 2.3 CapabilityTree Collapse Logic (duplicated within file)

**File:** `capabilities/CapabilityTree.ts`

**Problem:** The single-child collapse (GitHub-style path collapsing) is implemented twice: once in `getVisiblePaths()` and once in the `TreeNode` rendering. Both walk through single-directory children accumulating labels with the same rules.

**Fix:** Extract a `collapsePath(node)` utility that returns `{ collapsedLabel: string, effectiveNode: ReportCapabilityNode }`. Both call sites use this single function.

### 2.4 `sceneIdentity()` Used Inconsistently

**File:** `DataSnapshotAggregator.ts`

**Problem:** The `sceneIdentity()` method exists but `enrichScenarios()` re-implements the same logic inline (`scene.source.path + ':' + scene.source.line` with name fallback). Also `computeDegradedRecovered()` uses yet another inline variant.

**Fix:** Call `this.sceneIdentity(scene)` everywhere instead of re-implementing the pattern.

### 2.5 Duplicated Error Handling in Load Methods

**File:** `DataSnapshotAggregator.ts`

**Problem:** Both `loadRuns()` and `loadExternalRuns()` have identical try/catch blocks for `InvalidRunDataError | IncompatibleSchemaError | SyntaxError`.

**Fix:** Extract a `safeParseRunData(content: string, path: string): RunData | null` helper that returns null on failure (with console.warn). Both callers filter out nulls.

---

## Priority 3: God-Method Decomposition

### 3.1 `DataSnapshotAggregator.loadExternalRuns()` — 80 lines, 7 responsibilities

**File:** `src/DataSnapshotAggregator.ts`

**Decompose into:**

1. `loadAllRunData(paths: string[]): RunData[]` — read, parse, validate, skip failures
2. `groupByRunId(runs: RunData[]): Map<string, RunData[]>` — group by testRunId
3. `mergeRunGroup(runs: RunData[]): RunData` — sub-group by attempt, additive merge within, retry merge across
4. `persistMergedRuns(mergedRuns: Map<string, RunData>): void` — write to output

The current method becomes an orchestrator:
```typescript
private loadExternalRuns(paths: string[]): RunData[] {
    const validRuns = this.loadAllRunData(paths);
    const groups = this.groupByRunId(validRuns);
    const merged = new Map([...groups].map(([id, runs]) => [id, this.mergeRunGroup(runs)]));
    this.persistMergedRuns(merged);
    return [...merged.values()].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}
```

### 3.2 `DataSnapshotAggregator.enrichScenarios()` — 70 lines

**Decompose into:**

1. `buildExecutionHistory(scene, allRuns): ReportExecutionHistoryEntry[]`
2. `enrichSingleScenario(scene, executionHistory): ReportScenario`

The main method becomes a clean map:
```typescript
private enrichScenarios(latestRun: RunData, allRuns: RunData[]): ReportScenario[] {
    return latestRun.scenes.map(scene => {
        const history = this.buildExecutionHistory(scene, allRuns);
        return this.enrichSingleScenario(scene, history);
    });
}
```

### 3.3 `SceneDataCollector.collect()` — 60 lines, 8 responsibilities

**Decompose into:**

1. `drainEventQueues(queues): Map<string, DomainEvent[]>` — group events by sceneId
2. `buildSceneRecords(groupedEvents, artifactPaths, sceneArtifactPaths): SceneRecord[]`
3. `groupRetries(records): SceneRecord[]` — handle retry sequence grouping
4. `assembleRunData(scenes, timestamp, testRunnerName, ...): RunData`

### 3.4 `ScenarioDetailView` — extract scenario resolution

**File:** `template/components/ScenarioDetailView.ts` lines 24–93

**Problem:** 70 lines of scenario lookup, run resolution, attempt state, and activity selection before any rendering.

**Fix:** Extract a `useScenarioDetail(scenarioId, scenarios, history)` hook that returns:
```typescript
interface ScenarioDetailState {
    scenario: ReportScenario | null;
    runIndex: number | null;
    activeAttempt: number;
    currentActivities: ReportActivity[];
    currentError: ReportError | null;
    historicalEntry: ReportExecutionHistoryEntry | null;
}
```

The component becomes:
```typescript
export function ScenarioDetailView({ scenarios, history, specDirectory, scenarioId, onNavigate }) {
    const state = useScenarioDetail(scenarioId, scenarios, history);
    if (!state.scenario) return html`<div>Scenario not found</div>`;
    // ... rendering only
}
```

---

## Priority 4: Data Mutation and Defensive Checks

### 4.1 ScenarioDetailView Mutates Props

**File:** `template/components/ScenarioDetailView.ts` lines 90–93

**Problem:**
```typescript
if (!scenario.tags) scenario.tags = [];
if (!scenario.cast) scenario.cast = [];
if (!scenario.activities) scenario.activities = [];
if (!scenario.executionHistory) scenario.executionHistory = [];
```

This mutates the object from `DATA.scenarios` — a shared reference.

**Fix:** Destructure with defaults:
```typescript
const { tags = [], cast = [], activities = [], executionHistory = [], ...rest } = scenario;
```

Or assign to local variables — never write back to the prop object.

### 4.2 DashboardView Confidence Computation Duplicated with Different Weights

**Files:** `DashboardView.ts` line 49, `capabilities/CapabilityTree.ts` line 28

**Problem:** Two different confidence formulas:
- Dashboard: `completeness * 0.3 + passRate * 0.35 + consistency * 0.35`
- CapabilityTree: `passRate * 0.40 + completeness * 0.25 + consistency * 0.35`

These should either be the same formula (if they compute the same concept) or have different names (if they measure different things). Currently a contributor would assume they're the same and "fix" one to match the other.

**Fix:** Extract to `utils/selectors.ts` with named functions:
```typescript
/** Confidence score for a report run (weighted toward stability) */
export function runConfidence(passRate: number, completeness: number, consistency: number): number {
    return Math.round(completeness * 0.3 + passRate * 0.35 + consistency * 0.35);
}

/** Confidence score for a capability node (weighted toward pass rate) */
export function capabilityConfidence(passRate: number, completeness: number, consistency: number): number {
    return Math.round(passRate * 0.40 + completeness * 0.25 + consistency * 0.35);
}
```

Document WHY the weights differ (run confidence emphasises stability across history; capability confidence emphasises current pass rate since it's about "can we ship this feature?").

### 4.3 DashboardView Inline Completeness IIFE

**File:** `DashboardView.ts` lines 42–51

**Problem:** A recursive tree walk inside an IIFE inside a ternary:
```typescript
const completenessScore = latestScore ? latestScore.completeness : (() => {
    // 10 lines of tree traversal
})();
```

**Fix:** Extract to `utils/selectors.ts`:
```typescript
export function computeCompletenessFromTree(capabilities: ReportCapabilityNode | undefined): number { ... }
```

---

## Priority 5: Template Inline Logic Cleanup

### 5.1 DashboardView Consistency Items IIFE

**File:** `DashboardView.ts` lines 100–115

**Problem:** Complex array operations inside an IIFE inside the template literal.

**Fix:** Compute before the `return html`:
```typescript
const consistencyItems = useMemo(() => {
    return [
        ...newFailures.map(t => ({ ...t, kind: 'degraded' as const })),
        ...newPasses.map(t => ({ ...t, kind: 'recovered' as const })),
        ...inconsistentTests
            .filter(t => !newFailures.some(f => f.source.path === t.source.path) && ...)
            .map(t => ({ ...t, kind: 'inconsistent' as const })),
    ].slice(0, 5);
}, [newFailures, newPasses, inconsistentTests]);
```

### 5.2 ScenarioDetailView Nested Ternaries for Activities/Error

**File:** `ScenarioDetailView.ts` lines 82–100

**Problem:** 4 levels of nested ternaries to determine which activities/error to show.

**Fix:** Compute a `resolvedView` object before the template:
```typescript
const resolvedView = useMemo(() => {
    if (historicalEntry) {
        return { activities: historicalEntry.activities || [], error: historicalEntry.error };
    }
    if (hasRetries && activeAttempt < activeAttempts.length) {
        return { activities: activeAttempts[activeAttempt].activities, error: activeAttempts[activeAttempt].error };
    }
    return { activities: scenario.activities, error: scenario.error };
}, [historicalEntry, hasRetries, activeAttempt, activeAttempts, scenario]);
```

---

## Implementation Order

Process by priority (each group is independently shippable):

1. **P1: Hooks bug fix** — immediate, one-line move (5 minutes)
2. **P2: Duplicated logic** — extract to selectors/utils, update call sites (2.1–2.5)
3. **P3: God-method decomposition** — start with `loadExternalRuns()`, then `enrichScenarios()`, then `SceneDataCollector.collect()`
4. **P4: Mutations and formula clarity** — prop defaults, confidence extraction
5. **P5: Template inline logic** — extract IIFEs to `useMemo` computations

Each priority can be a separate commit. P1 should be immediate. P2–P3 can be done in any order. P4–P5 are cosmetic improvements.

---

## Verification

After each priority group:

```bash
cd packages/html-reporter
npx tsc --project template/tsconfig.json --noEmit
npx tsc --project tsconfig-cjs.build.json --noEmit
node scripts/bundle-template.mjs
npx playwright test --project=unit
```

### Additional Checks

After P2 (duplication extraction):
```bash
# No inline filterMatch in views
grep -rn "filterMatch" packages/html-reporter/template/components/
# Should only appear in utils/selectors.ts

# No inline findIndex...timestamp in views
grep -rn "findIndex.*timestamp" packages/html-reporter/template/components/
# Should only appear in utils/selectors.ts
```

After P3 (decomposition):
```bash
# loadExternalRuns under 20 lines
wc -l # (manual check of the method)

# enrichScenarios under 10 lines
```

After P4 (mutations):
```bash
# No prop mutation in ScenarioDetailView
grep -n "scenario\.\w* =" packages/html-reporter/template/components/ScenarioDetailView.ts
# Should return nothing
```

---

## What NOT to Change

- Public API of `TestRunArchiver`, `HtmlReporter`, `HtmlReportGenerator`
- The `RunData` or `ReportData` schemas
- Visual rendering behaviour
- Route table structure (Phase 5)
- `GroupedVirtualList` interface (Phase 5)
- Test assertions (only test setup may change if method signatures change)

---

## Notes for Contributors

After this phase, a new contributor should be able to:

- **Find where a feature lives:** Route table → view → helper functions in utils/selectors
- **Understand a method:** Each method does one thing, is under 30 lines, and has a clear name
- **Safely modify aggregation:** `loadExternalRuns` is now 5 lines calling clearly-named steps
- **Add a new filter type:** Add to `OUTCOME_FILTER_MAP` in one place
- **Fix a scoring formula:** `utils/selectors.ts` — named functions with documented intent
- **Trust prop immutability:** Components never mutate their inputs
