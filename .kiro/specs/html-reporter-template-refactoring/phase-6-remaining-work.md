# Phase 6 — Remaining Work

## Context

Phase 6 (quality hotspot remediation) is approximately 50% complete. The template-side improvements and the critical hooks bug have been addressed. What remains is:

1. Decomposition of god-methods in the backend (`DataSnapshotAggregator`, `SceneDataCollector`)
2. Three small duplication fixes
3. One unused function wiring

Read the full spec at `.kiro/specs/html-reporter-template-refactoring/phase-6-quality-hotspots.md` for the complete context and rationale.

---

## Remaining Items

### Item 1: Decompose `DataSnapshotAggregator.loadExternalRuns()` (P3.1)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts` (currently 87 lines, 7 responsibilities)

This method currently: loads files, validates, groups by testRunId, sub-groups by attempt, merges additively, merges retries, copies artifacts, and writes results back.

**Break into:**

```typescript
private loadExternalRuns(paths: string[]): RunData[] {
    const validRuns = this.loadAndValidateRuns(paths);
    const groups = this.groupByTestRunId(validRuns);
    const merged = this.mergeRunGroups(groups);
    this.persistMergedRuns(merged);
    return [...merged.values()].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

// Load each db.json, validate, skip failures with console.warn, copy artifacts
private loadAndValidateRuns(paths: string[]): Array<{ run: RunData; directoryName: string }> { ... }

// Group runs by testRunId (or startedAt as fallback)
private groupByTestRunId(runs: Array<{ run: RunData; directoryName: string }>): Map<string, RunData[]> { ... }

// Within each group: additive merge same-attempt, retry merge across attempts
private mergeRunGroups(groups: Map<string, RunData[]>): Map<string, RunData> { ... }

// Write merged db.json to output for self-healing
private persistMergedRuns(merged: Map<string, RunData>): void { ... }
```

Each extracted method should be under 25 lines. The artifact copying logic (currently embedded in the loop) should move into `loadAndValidateRuns`.

### Item 2: Decompose `DataSnapshotAggregator.enrichScenarios()` (P3.2)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts` (currently 85 lines)

**Break into:**

```typescript
private enrichScenarios(latestRun: RunData, allRuns: RunData[]): ReportScenario[] {
    return latestRun.scenes.map(scene => {
        const executionHistory = this.buildExecutionHistory(scene, allRuns);
        return this.enrichSingleScenario(scene, executionHistory);
    });
}

// Find this scene in each historical run and build the history array
private buildExecutionHistory(scene: SceneRecord, allRuns: RunData[]): ReportExecutionHistoryEntry[] { ... }

// Map a single scene + its history into the ReportScenario shape
private enrichSingleScenario(scene: SceneRecord, executionHistory: ReportExecutionHistoryEntry[]): ReportScenario { ... }
```

Inside `enrichSingleScenario`, the markdown parsing (`marked.parse` calls for narrative/description) and the scenario outline / attempts mapping are distinct responsibilities but can stay in one method since they're just field transformations — the key improvement is separating the execution history lookup from the field enrichment.

### Item 3: Decompose `SceneDataCollector.collect()` (P3.3)

**File:** `packages/html-reporter/src/SceneDataCollector.ts` (currently ~60 lines, 8 responsibilities)

This method: drains event queues, groups events by sceneId, builds scene records, groups retries, attaches videos, computes timestamps, summarises outcomes, and collects tags.

**Break into:**

```typescript
collect(queues, timestamp, testRunnerName, testRunnerVersion, artifactPaths, systemContext, sceneArtifactPaths): RunData {
    const groupedEvents = this.drainAndGroupEvents(queues);
    const sceneRecords = this.buildAllSceneRecords(groupedEvents, artifactPaths, sceneArtifactPaths);
    const scenes = this.resolveRetries(sceneRecords);
    return this.assembleRunData(scenes, timestamp, testRunnerName, testRunnerVersion, systemContext);
}
```

Each extracted method handles one step of the pipeline.

### Item 4: Extract `useScenarioDetail` hook (P3.4)

**File:** `packages/html-reporter/template/components/ScenarioDetailView.ts` lines 24–125

The first 100 lines of the component are pure data resolution (scenario lookup, run index, attempt state, activity selection). Extract into a custom hook:

**New file:** `packages/html-reporter/template/hooks/useScenarioDetail.ts`

```typescript
interface ScenarioDetailState {
    scenario: ReportScenario | null;
    runIndex: number | null;
    activeAttempt: number;
    setActiveAttempt: (n: number) => void;
    currentActivities: ReportActivity[];
    currentError: ReportError | null;
    currentVideo: string | undefined;
    historicalEntry: ReportExecutionHistoryEntry | null;
    errorLocation: { path: string; line: number; column: number } | null;
}

export function useScenarioDetail(scenarioId: string, scenarios: ReportScenario[], history: ReportHistoryEntry[]): ScenarioDetailState { ... }
```

Move all the lookup/resolution logic into this hook. The component then becomes:

```typescript
export function ScenarioDetailView({ scenarios, history, specDirectory, scenarioId, onNavigate }) {
    const detail = useScenarioDetail(scenarioId, scenarios, history);
    if (!detail.scenario) return html`<div>Scenario not found</div>`;
    // Pure rendering from here
}
```

Also extract the `findLoc` IIFE (recursive error location finder) into a named function in the hook or in `utils/selectors.ts`.

### Item 5: Deduplicate CapabilityTree collapse logic (P2.3)

**File:** `packages/html-reporter/template/components/capabilities/CapabilityTree.ts`

Lines ~102–117 and ~181–198 contain identical while-loops that walk single-directory children.

**Extract:**

```typescript
interface CollapsedNode {
    displayNode: ReportCapabilityNode;
    collapsedPath: string;
    collapsedLabel: string;
}

function collapseNode(node: ReportCapabilityNode, segmentPath: string): CollapsedNode {
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!node.readme && !nodeHasFiles(node)) {
        while (displayNode.children) {
            const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
            const files = displayNode.children.filter(c => c.type === 'file');
            if (directories.length === 1 && files.length === 0) {
                const only = directories[0];
                if (only.readme) break;
                collapsedPath = collapsedPath ? collapsedPath + '/' + only.name : only.name;
                collapsedLabel += '/' + (only.displayName || only.name);
                displayNode = only;
            } else {
                break;
            }
        }
    }
    return { displayNode, collapsedPath, collapsedLabel };
}
```

Both call sites (`getVisiblePaths` and `TreeNode`) call this function instead of implementing the loop inline.

### Item 6: Use `sceneIdentity()` consistently (P2.4)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts`

Two methods still use inline `scene.source.path + ':' + scene.source.line` instead of calling `this.sceneIdentity(scene)`:

1. `enrichScenarios()` around line 387 — the `key` variable and the `matchKey` in the inner find
2. `buildCapabilities()` around line 594 — the `scenarioKey` and the match find

Replace all inline identity logic with calls to `this.sceneIdentity(scene)`.

### Item 7: Extract duplicated error handling (P2.5)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts` lines 106 and 135

Both `loadRuns()` and `loadExternalRuns()` have identical try/catch:

```typescript
} catch (error) {
    if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
        console.warn(`[html-reporter] Skipping ${path}: ${(error as Error).message}`);
        continue;
    }
    throw error;
}
```

**Extract:**

```typescript
private safeParseRunData(content: string, path: string): RunData | null {
    try {
        const raw = JSON.parse(content);
        return validateRunData(raw, path);
    } catch (error) {
        if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
            console.warn(`[html-reporter] Skipping ${path}: ${(error as Error).message}`);
            return null;
        }
        throw error;
    }
}
```

Both callers use: `const run = this.safeParseRunData(content, path); if (!run) continue;`

### Item 8: Wire `capabilityConfidence()` into CapabilityTree (P4.2)

**File:** `packages/html-reporter/template/components/capabilities/CapabilityTree.ts` line 27

Currently:
```typescript
const confidence = Math.round(passRate * 0.40 + completeness * 0.25 + consistency * 0.35);
```

Replace with:
```typescript
import { capabilityConfidence } from '../../utils';
// ...
const confidence = capabilityConfidence(passRate, completeness, consistency);
```

This ensures the formula lives in one place and changes to the weighting are reflected everywhere.

---

## Implementation Order

1. **Item 7** (extract `safeParseRunData`) — smallest, enables Item 1
2. **Item 6** (use `sceneIdentity()` consistently) — trivial find-and-replace
3. **Item 1** (decompose `loadExternalRuns`) — uses `safeParseRunData` from step 1
4. **Item 2** (decompose `enrichScenarios`) — uses `sceneIdentity` from step 2
5. **Item 3** (decompose `SceneDataCollector.collect()`)
6. **Item 5** (deduplicate collapse logic) — independent
7. **Item 8** (wire `capabilityConfidence`) — independent, one line
8. **Item 4** (extract `useScenarioDetail` hook) — largest, do last

Verify after each item:
```bash
cd packages/html-reporter
npx tsc --project tsconfig-cjs.build.json --noEmit
npx tsc --project template/tsconfig.json --noEmit
node scripts/bundle-template.mjs
npx playwright test --project=unit
```

---

## What NOT to Change

- Method signatures (public API) — only internal decomposition
- The `RunData` or `ReportData` schemas
- Test assertions — only test setup may change if method extraction changes internal call flow
- The route table, GroupedVirtualList, or any Phase 5 abstractions
- Visual rendering behaviour

---

## Verification After All Items Complete

```bash
# No god methods (>40 lines) in DataSnapshotAggregator
awk '/private (loadExternalRuns|enrichScenarios|loadAndValidateRuns|groupByTestRunId|mergeRunGroups|persistMergedRuns|buildExecutionHistory|enrichSingleScenario)/{c=0} /^    private /{if(c>40) print FILENAME":"NR" method too long ("c" lines)"; c=0} {c++}' packages/html-reporter/src/DataSnapshotAggregator.ts

# No inline scene identity logic
grep -n "source.path.*+.*source.line" packages/html-reporter/src/DataSnapshotAggregator.ts
# Should return only the sceneIdentity() method definition itself

# No duplicated error handling
grep -c "InvalidRunDataError.*IncompatibleSchemaError.*SyntaxError" packages/html-reporter/src/DataSnapshotAggregator.ts
# Should return 1 (only in safeParseRunData)

# No duplicated collapse logic
grep -c "while.*displayNode.children" packages/html-reporter/template/components/capabilities/CapabilityTree.ts
# Should return 1 (only in collapseNode function)

# capabilityConfidence used
grep "capabilityConfidence" packages/html-reporter/template/components/capabilities/CapabilityTree.ts
# Should return the import and usage

# useScenarioDetail hook exists
test -f packages/html-reporter/template/hooks/useScenarioDetail.ts && echo "exists"

# All tests pass
npx playwright test --project=unit
```
