---
status: done
completed: 2026-07-12
---

# Phase 7: Address Static Analysis Quality Issues (qlty + CodeFactor)

## Context

PR #3379 has 63 blocking issues flagged by qlty and 35 issues from CodeFactor. These must be resolved to merge the PR cleanly.

### qlty Summary (63 blocking)

| Rule | Description | Count |
|------|-------------|-------|
| `qlty:complexity` | Function with high complexity (count = 25): `mergeAsRetry` | 32 |
| `qlty:return-statements` | Function with many returns (count = 6) | 12 |
| `qlty:file-complexity` | High total complexity (count = 242) | 11 |
| `qlty:nesting` | Deeply nested control flow (level = 5) | 5 |
| `qlty:function-parameters` | Function with many parameters (count = 7): `collect` | 2 |
| `qlty:complex-binary-expression` | Complex binary expression | 1 |

### CodeFactor Issues (35 total)

- **CSS (22):** Duplicate selectors in `styles.css` (`.readme-content` variants, `.capabilities-split`, `.req-detail-outcome-bar`, `.req-detail-confidence-label`)
- **TypeScript (13):** Likely the same complexity/return issues as qlty

---

## Fixes

### Fix 1: Reduce `mergeAsRetry()` Complexity (32 issues)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts`

**Problem:** The function has a cyclomatic complexity of 25 due to many conditional spread operators (`...(field ? { field } : {})`).

**Solution:** Extract the scene-merging logic into a helper:

```typescript
private mergeAsRetry(earlier: RunData, later: RunData): RunData {
    const merged: RunData = { ...later };
    const earlierScenes = new Map(earlier.scenes.map(s => [this.sceneIdentity(s), s]));

    merged.scenes = later.scenes.map(laterScene => {
        const earlierScene = earlierScenes.get(this.sceneIdentity(laterScene));
        return earlierScene
            ? this.mergeSceneWithRetry(earlierScene, laterScene)
            : laterScene;
    });

    // Include non-retried scenes from earlier attempt
    const laterKeys = new Set(later.scenes.map(s => this.sceneIdentity(s)));
    for (const scene of earlier.scenes) {
        if (!laterKeys.has(this.sceneIdentity(scene))) {
            merged.scenes.push(scene);
        }
    }

    merged.outcomes = this.computeOutcomes(merged.scenes);
    if (earlier.startedAt < merged.startedAt) merged.startedAt = earlier.startedAt;
    return merged;
}

private mergeSceneWithRetry(earlier: SceneRecord, later: SceneRecord): SceneRecord {
    const existingAttempts = earlier.attempts || [];
    const allAttempts = [
        ...existingAttempts,
        this.sceneToAttempt(earlier, existingAttempts.length + 1),
        this.sceneToAttempt(later, existingAttempts.length + 2),
    ];
    return {
        ...later,
        attempts: allAttempts,
        retries: allAttempts.length - 1,
    };
}

private sceneToAttempt(scene: SceneRecord, attemptNumber: number): AttemptRecord {
    return {
        attemptNumber,
        outcome: scene.outcome,
        duration: scene.duration,
        activities: scene.activities,
        ...(scene.error ? { error: scene.error } : {}),
    };
}

private computeOutcomes(scenes: SceneRecord[]): OutcomeCounts {
    const outcomes: OutcomeCounts = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
    for (const scene of scenes) {
        const key = this.mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code));
        outcomes[key as keyof OutcomeCounts]++;
    }
    return outcomes;
}
```

**Key insight:** The conditional spreads (`...(field ? { field } : {})`) each add a branch to cyclomatic complexity. By spreading `...later` directly and only overriding `attempts` and `retries`, we eliminate ~10 conditional branches.

### Fix 2: Replace If-Chain Return Functions with Lookup Maps (12 issues)

**File:** `packages/html-reporter/src/SceneDataCollector.ts`

**Current:**
```typescript
function outcomeCodeToLabel(code: number): keyof OutcomeCounts {
    if (code === ExecutionSuccessful.Code) return 'passed';
    if (code === ExecutionFailedWithAssertionError.Code) return 'failed';
    if (code === ExecutionFailedWithError.Code) return 'error';
    if (code === ExecutionCompromised.Code) return 'compromised';
    if (code === ImplementationPending.Code) return 'pending';
    if (code === ExecutionSkipped.Code) return 'skipped';
    return 'error';
}
```

**Fix:** Replace with a lookup map (same pattern already used in `DataSnapshotAggregator`):

```typescript
const OUTCOME_CODE_LABELS: Record<number, keyof OutcomeCounts> = {
    [ExecutionSuccessful.Code]: 'passed',
    [ExecutionFailedWithAssertionError.Code]: 'failed',
    [ExecutionFailedWithError.Code]: 'error',
    [ExecutionCompromised.Code]: 'compromised',
    [ImplementationPending.Code]: 'pending',
    [ExecutionSkipped.Code]: 'skipped',
};

function outcomeCodeToLabel(code: number): keyof OutcomeCounts {
    return OUTCOME_CODE_LABELS[code] || 'error';
}
```

Apply the same pattern to any other multi-return if-chain functions flagged by qlty. The `SceneRecordBuilder.build()` method's multiple returns (for outline/retry/simple) are structural and acceptable — they represent a discriminated union path selection, not an if-chain mapping.

### Fix 3: Reduce File Complexity (11 issues)

**File:** `packages/html-reporter/src/DataSnapshotAggregator.ts` (818 lines, total complexity 242)

This was partially addressed in Phase 6 with method decomposition. The remaining complexity comes from:
- `enrichSingleScenario()` — many conditional spreads for optional fields
- `buildCapabilities()` — tree construction with nested loops
- `buildHistory()` — multi-field object construction

**Solution:** These are already decomposed into single-purpose methods. To further reduce per-file complexity, extract related groups into separate files:

1. **Move capability building to its own module:**
   ```
   src/capabilities/buildCapabilities.ts
   ```
   Contains: `buildCapabilities()`, `computeDirectoryScores()`, `attachReadme()`

2. **Move history building to its own module:**
   ```
   src/history/buildHistory.ts
   ```
   Contains: `buildHistory()`, `computeConsistencyAtRun()`

This reduces `DataSnapshotAggregator.ts` from 818 lines to ~500 lines and distributes the complexity across focused files.

### Fix 4: Reduce Nesting Depth (5 issues)

**Problem:** Control flow nested 5 levels deep.

**Common pattern (in SceneDataCollector and DataSnapshotAggregator):**
```typescript
for (const run of runs) {
    for (const scene of run.scenes) {
        if (condition) {
            for (const tag of scene.tags) {
                if (tag.type === 'x') {  // level 5
                }
            }
        }
    }
}
```

**Fix:** Use early-continue and extract inner loops:

```typescript
for (const run of runs) {
    for (const scene of run.scenes) {
        if (!condition) continue;
        this.processSceneTags(scene);
    }
}

private processSceneTags(scene: SceneRecord): void {
    for (const tag of scene.tags) {
        if (tag.type === 'x') { ... }
    }
}
```

Specific locations to fix:
- `buildCapabilities()` — tree construction with 5-level nesting
- `SceneDataCollector.resolveRetries()` — event processing loops
- `SceneRecordBuilder.processEvent()` — switch with nested conditionals

### Fix 5: Reduce Parameter Count for `collect()` (2 issues)

**File:** `packages/html-reporter/src/SceneDataCollector.ts`

**Current:** 7 parameters
```typescript
collect(queues, testRunStartedAt, testRunnerName, testRunnerVersion, artifactPaths, systemContext, sceneArtifactPaths)
```

**Fix:** Group related parameters into an options object:

```typescript
interface CollectOptions {
    queues: DomainEventQueues;
    testRunStartedAt: string;
    testRunner: { name: string; version: string };
    artifactPaths: Map<string, Path[]>;
    systemContext: SystemContext;
    sceneArtifactPaths?: Map<string, Path[]>;
}

collect(options: CollectOptions): RunData { ... }
```

**Note:** This changes the internal API. Update the call site in `TestRunArchiver.archiveTestRun()` accordingly.

### Fix 6: Simplify Complex Binary Expression (1 issue)

Locate the flagged expression (likely a compound condition in `SceneDataCollector` or `DataSnapshotAggregator`). Extract it to a named boolean:

```typescript
// Before
if (this.isRetrySequence && this.isScenarioOutline && this.parameterSets.length > 0) {

// After
const isRetryMaskedAsOutline = this.isRetrySequence && this.isScenarioOutline && this.parameterSets.length > 0;
if (isRetryMaskedAsOutline) {
```

Named booleans document intent and reduce perceived complexity.

### Fix 7: CSS Duplicate Selectors (22 CodeFactor issues)

**File:** `packages/html-reporter/template/styles.css`

**Problem:** `.readme-content` sub-selectors and capability-related selectors appear in multiple media query blocks or are defined twice.

**Cause:** The CSS has both a base definition and a responsive override for the same selector, or the same selector appears in both the component section and the utility section.

**Fix:** Audit and consolidate:

1. Search for each flagged selector:
   ```bash
   grep -n "\.readme-content p" packages/html-reporter/template/styles.css
   ```

2. If two occurrences are in the same media context → merge them
3. If one is a base rule and one is a `@media` override → that's intentional and correct (add a comment: `/* Override for responsive */`)
4. If genuinely duplicated (same selector, same context, different properties) → merge into one rule block

Specific selectors to consolidate:
- `.capabilities-split` (line 1392 + duplicate)
- `.req-detail-outcome-bar` (line 1979 + duplicate)
- `.req-detail-confidence-label` (line 1924 + duplicate)
- `.readme-content` variants (h1–h6, p, ul, ol, li, code, pre, pre code, blockquote)

---

## Implementation Order

1. **Fix 7** (CSS duplicates) — mechanical, zero risk, clears 22 issues
2. **Fix 2** (lookup maps) — trivial, clears 12 issues
3. **Fix 1** (mergeAsRetry decomposition) — biggest single-issue reducer, clears 32+ complexity points
4. **Fix 6** (named boolean) — one-line fix, clears 1 issue
5. **Fix 4** (nesting reduction) — extract inner loops, clears 5 issues
6. **Fix 5** (parameter object) — API change, update one call site
7. **Fix 3** (file extraction) — largest change, split files

---

## Verification

After each fix:
```bash
cd packages/html-reporter
npx tsc --project tsconfig-cjs.build.json --noEmit
npx tsc --project template/tsconfig.json --noEmit
node scripts/bundle-template.mjs
npx playwright test --project=unit
```

After all fixes, the qlty gate should pass with 0 blocking issues. Verify by pushing the commit and checking the PR status.

### Specific Checks

```bash
# No if-chain return functions for outcome mapping
grep -n "if.*Code.*return" packages/html-reporter/src/SceneDataCollector.ts
# Should return 0 lines (all use lookup maps)

# No deeply nested control flow (grep for 5+ indentation levels with control keywords)
grep -n "^                    .*if\|^                    .*for" packages/html-reporter/src/SceneDataCollector.ts packages/html-reporter/src/DataSnapshotAggregator.ts
# Should return 0 lines

# No duplicate CSS selectors (approximate check)
sort packages/html-reporter/template/styles.css | uniq -d | grep "^\." | head -10
# Should return 0 (no exact duplicate lines starting with '.')

# mergeAsRetry under 20 lines
grep -c "" <(sed -n '/private mergeAsRetry/,/^    private /p' packages/html-reporter/src/DataSnapshotAggregator.ts)
# Should be under 25
```

---

## What NOT to Change

- Test assertions or test structure
- Public API signatures (`TestRunArchiver.fromJSON`, `HtmlReporter.fromJSON`)
- The `RunData` or `ReportData` schema
- Visual rendering
- The route table or component structure (Phases 1–6)

---

## Notes

- The qlty "Function with many returns: constructor" likely refers to `SceneRecordBuilder.build()` which has 3 return paths (outline / retry / simple). This is a discriminated union pattern — it's the correct structure. If qlty still flags it after Fix 2, consider renaming it from `build` to something clearer, or suppress the warning with an inline `// qlty-ignore` comment with explanation.

- The "High total complexity: 242" across 11 files means qlty sums the per-function complexity of an entire file. Fix 3 (file extraction) is the structural fix; Fixes 1, 2, and 4 reduce per-function complexity.

- CodeFactor's CSS duplicate warnings may include intentional responsive overrides. For those, add a `/* stylelint-disable no-duplicate-selectors */` comment above the responsive block, or restructure to use nested `@media` within the selector (if the CSS supports it).
