# Requirement Confidence Score

## Overview

Each requirement (file node) in the requirements hierarchy gets a composite **confidence score** (0–100) derived from three sub-scores, visualised similarly to how npms.io presents package quality.

## Sub-scores

### Completeness (replaces "Coverage")

Measures whether the requirement is fully implemented — no pending or skipped scenarios.

```
completeness = 1 - (pending + skipped) / total
```

- All scenarios passing or failing (but implemented): 100%
- 3/5 implemented, 2 pending: 60%
- No scenarios at all: 0%

### Pass Rate

Measures whether the implemented scenarios are passing.

```
passRate = passed / total
```

- All passing: 100%
- 4/5 passing: 80%
- No scenarios: 0%

### Stability

Measures whether the scenarios produce consistent results across runs (inverse of flakiness).

```
stability = 1 - (outcome flips / (appearances - 1))
```

Derived from `executionHistory` — count how many times the outcome changed between consecutive runs, averaged across all scenarios in the requirement.

- Same outcome every run: 100%
- Flips every other run: 0%
- Only one run of history: 100% (benefit of the doubt)

## Composite Score

```
confidence = (completeness × 0.3) + (passRate × 0.35) + (stability × 0.35)
```

Weights reflect that a fully passing but flaky test is less trustworthy than a consistently passing one.

## Data Changes

Add to `ReportRequirementNode`:

```typescript
score?: {
    confidence: number;   // 0–100 composite
    completeness: number; // 0–100
    passRate: number;     // 0–100
    stability: number;    // 0–100
}
```

Computed in `DataSnapshotAggregator.buildRequirements()` for file nodes. Directory nodes aggregate by averaging child file scores (weighted by scenario count).

## UI Rendering

- Detail panel: show score breakdown as a segmented bar (like npms.io) or three mini progress bars
- Tree nodes: optional score badge or colour intensity indicating confidence level
- KPI cards: "Low Confidence" filter (score < 70) replaces or augments "Requirement Gaps"

## Implementation Steps

1. Add `score` field to `ReportRequirementNode` interface
2. Compute per-file scores in `DataSnapshotAggregator.buildRequirements()`
3. Aggregate directory scores from children
4. Render in RequirementsView detail panel
5. Add KPI tab filter for low-confidence requirements
6. Add tests for score computation and UI rendering
