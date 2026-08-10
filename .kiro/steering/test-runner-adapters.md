---
inclusion: fileMatch
fileMatchPattern: "**/cucumber/**,**/mocha/**,**/jasmine/**,**/playwright-test/**"
---

# Test Runner Adapters in Serenity/JS

## Architecture: The Adapter Pattern

Test runner adapters are the boundary between Serenity/JS and external test frameworks. They translate
framework-specific test lifecycle events into the Serenity/JS domain event model. This decoupling lets the reporting and
Screenplay layers remain unchanged regardless of which test runner is in use.

```
Test Runner (native lifecycle events)
    ↓
Adapter (translates to domain events)
    ↓
Stage / StageManager (domain event bus)
    ↓
StageCrewMembers (reporters, archivers)
```

### Design Principle

Adapters are **anti-corruption layers** in DDD terms. They prevent the vocabulary and assumptions of an external
framework from leaking into the domain model. The adapter's only job is to:

1. Listen to the test runner's native events
2. Map them to `DomainEvent` instances
3. Emit events via `stage.announce()`

No business logic belongs in an adapter.

## Domain Event Model

The domain event model represents the test lifecycle as a series of immutable, timestamped facts:

### Test Lifecycle

```
TestRunStarts         → TestRunFinishes    → TestRunFinished
SceneStarts           → SceneFinishes      → SceneFinished
InteractionStarts     → InteractionFinished
TaskStarts            → TaskFinished
```

### Metadata Events

```typescript
SceneTagged                 // Test categories, features, issues
SceneDescriptionDetected    // Scenario description
FeatureNarrativeDetected    // Feature-file narrative
BusinessRuleDetected        // Business rule association
SceneParametersDetected     // Data-driven scenario parameters
RetryableSceneDetected      // Retry capability
```

### Artifact Events

```typescript
ArtifactGenerated           // Screenshots, logs, HTTP exchanges
ArtifactArchived            // Artefact saved to disk
```

Each event carries a `sceneId` (CorrelationId) to correlate activities with their owning scenario.

## Adapter Implementations

### Cucumber (`packages/cucumber/`)

Translates Cucumber.js formatter output into domain events. Supports Cucumber v1 through v13 using feature detection (no
version-specific code branches).

Key components:

- `CucumberCLIAdapter` — CLI entry point
- `SerenityFormatterOutput` — Cucumber formatter producing domain events
- `notifier/` — Event mapping logic

#### Scenario Outline Event Grouping

The Cucumber adapter calls `serenity.assignNewSceneId()` for every example row in a Scenario Outline. All rows share the same `ScenarioDetails` (name + source location), so `DomainEventQueues` merges them into one queue. But `SceneDataCollector.groupEventsBySceneId()` splits them back into separate groups.

Implication for retry detection: `resolveRetries()` sees N records from one queue. Check `areScenarioOutlineExamples()` before assuming retries. The signal is: records have `scenarioOutline` data AND no `RetryableSceneDetected` events for their sceneIds.

### Mocha (`packages/mocha/`)

Implements a Mocha reporter that emits domain events:

- `SerenityReporterForMocha` — hooks into Mocha's event system (`suite`, `test`, `pass`, `fail`, `pending`)

#### Error Serialisation Pitfall

Mocha's base reporter sets `error.multiple = [error]` — a circular self-reference. Any serialisation code traversing all own properties of an Error will stack overflow. Safe serialisation must explicitly pick fields (`name`, `message`, `stack`, `cause`) rather than iterating `Object.getOwnPropertyNames(error)`.

### Jasmine (`packages/jasmine/`)

- `SerenityReporterForJasmine` — hooks into Jasmine's reporter API
- Produces both CommonJS and ESM builds (dual `tsconfig-cjs.build.json` / `tsconfig-esm.build.json`)

### Playwright Test (`packages/playwright-test/`)

Uses Playwright's fixture system and reporter API:

- `SerenityFixtures` — provides `actor` fixture to tests
- `SerenityReporterForPlaywrightTest` — translates Playwright reporter events to domain events

```typescript
import { describe, it } from '@serenity-js/playwright-test';

describe('Feature', () => {
    it('scenario', async ({ actor }) => {
        await actor.attemptsTo(
            Navigate.to('https://example.org'),
        );
    });
});
```

#### Retry Event Framing

When Playwright Test retries a scenario, the adapter emits `SceneSequenceDetected` + `SceneParametersDetected` framing (the same framing used for Cucumber Scenario Outlines). The events share a single `sceneId` and arrive in one queue. Distinguish retries from outlines by checking for `RetryableSceneDetected` in the event stream.

If you're processing `DomainEventQueues` and see `SceneSequenceDetected`, always check whether `RetryableSceneDetected` is also present before assuming it's a Scenario Outline.

#### Crew Lifecycle in Fixtures

The `configureScenarioInternal` fixture calls `serenity.configure({ crew: [...] })` for each test. Because `configure()` appends crew to the `StageManager.subscribers` array, crew members accumulate across tests in the same worker (causing duplicate screenshots).

The fix: `configure()` returns the instantiated crew array. The fixture stores it and calls `serenity.unassign(...sceneCrew)` in the `finally` block after `persist()`.

## Domain Event Queue Semantics

`DomainEventQueues.queueIdFor()` groups events by matching `ScenarioDetails` (name + location), not just by `sceneId`. Events from different sceneIds can end up in the same queue if they share the same scenario identity. This is intentional — it enables retry grouping — but means a single queue may contain multiple `SceneStarts`/`SceneFinished` pairs.

## Creating a New Adapter

### Requirements

An adapter must emit these domain events in the correct order:

1. `TestRunStarts` — once, at the start
2. For each test scenario:
    - `SceneStarts` (with `ScenarioDetails`)
    - `SceneTagged` for any metadata (categories, features, issues)
    - Activity events as the Screenplay Pattern executes
    - `SceneFinishes` (signals the scenario is wrapping up)
    - `SceneFinished` (with execution `Outcome`)
3. `TestRunFinishes` / `TestRunFinished` — once, at the end

### Execution Outcomes

Map test results to the domain model:

| Test Runner Result | Serenity/JS Outcome                 |
|--------------------|-------------------------------------|
| Pass               | `ExecutionSuccessful`               |
| Fail (assertion)   | `ExecutionFailedWithAssertionError` |
| Fail (other)       | `ExecutionFailedWithError`          |
| Skip               | `ExecutionSkipped`                  |
| Pending/Todo       | `ImplementationPending`             |

### Integration Tests

Each adapter has integration tests in `integration/<runner>/` that verify the correct domain events are emitted for
various test lifecycle scenarios.

```bash
make INTEGRATION_SCOPE=playwright-test integration-test
make INTEGRATION_SCOPE=mocha integration-test
make INTEGRATION_SCOPE=cucumber-12 integration-test
```

### Checklist

- [ ] Emits `TestRunStarts` / `TestRunFinished` correctly
- [ ] Emits `SceneStarts` / `SceneFinished` per scenario
- [ ] Maps all outcome types (pass, fail, skip, pending)
- [ ] Handles retries if the runner supports them
- [ ] Emits `SceneTagged` for relevant metadata
- [ ] Does not contain business logic — only event translation
