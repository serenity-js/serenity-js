---
inclusion: fileMatch
fileMatchPattern: "**/cucumber/**,**/mocha/**,**/jasmine/**,**/playwright-test/**"
---

# Test Runner Adapters in Serenity/JS

## Adapter Architecture

Test runner adapters translate between Serenity/JS and specific test frameworks:

```
Test Runner (Cucumber/Mocha/Jasmine/Playwright Test)
    ↓
Serenity/JS Adapter (@serenity-js/cucumber, etc.)
    ↓
Serenity/JS Core (Stage, StageManager, Domain Events)
    ↓
Reporters (SerenityBDDReporter, ConsoleReporter)
```

## Domain Events

Adapters emit domain events to communicate test lifecycle:

```typescript
// Test lifecycle events
TestRunStarts
SceneStarts
SceneFinishes
SceneFinished
TestRunFinishes
TestRunFinished

// Activity events
InteractionStarts
InteractionFinished
TaskStarts
TaskFinished

// Metadata events
SceneTagged
SceneDescriptionDetected
FeatureNarrativeDetected
```

## Cucumber Adapter

Located in `packages/cucumber/src/`:

### Key Components

- `CucumberCLIAdapter` - CLI integration
- `SerenityFormatterOutput` - Cucumber formatter
- `notifier/` - Event translation

### Cucumber Version Support

The adapter supports Cucumber v1 through v12. Version-specific code uses feature detection:

```typescript
// Check Cucumber version capabilities
if (typeof cucumber.defineParameterType === 'function') {
    // Cucumber 2+ feature
}
```

### Integration Tests

Each Cucumber version has dedicated integration tests:

```
integration/cucumber-1/   → Cucumber 1.x
integration/cucumber-12/  → Cucumber 12.x
```

## Mocha Adapter

Located in `packages/mocha/src/`:

### Key Components

- `SerenityReporterForMocha` - Mocha reporter class
- Hooks into Mocha's event system

### Registration

```typescript
// mocharc.yml
reporter: '@serenity-js/mocha'
```

## Jasmine Adapter

Located in `packages/jasmine/src/`:

### Key Components

- `SerenityReporterForJasmine` - Jasmine reporter
- Supports both CJS and ESM

### Dual Module Support

Jasmine package produces both CommonJS and ESM:

```
packages/jasmine/
├── lib/          # CommonJS output
├── esm/          # ESM output
├── tsconfig-cjs.build.json
└── tsconfig-esm.build.json
```

## Playwright Test Adapter

Located in `packages/playwright-test/src/`:

### Key Components

- `SerenityFixtures` - Playwright Test fixtures
- `SerenityReporterForPlaywrightTest` - Reporter

### Fixture-based Integration

```typescript
import { test } from '@serenity-js/playwright-test';

test('example', async ({ actor }) => {
    await actor.attemptsTo(
        Navigate.to('https://example.org'),
    );
});
```

## Creating a New Adapter

1. Create package in `packages/<runner-name>/`
2. Implement reporter/adapter that:
   - Listens to test runner events
   - Translates to Serenity/JS domain events
   - Emits events via `stage.announce()`
3. Add integration tests in `integration/<runner-name>/`
4. Update CI workflow in `.github/workflows/main.yaml`

### Adapter Checklist

- [ ] Emit `TestRunStarts` at test run beginning
- [ ] Emit `SceneStarts`/`SceneFinished` for each test
- [ ] Emit `SceneTagged` for test metadata
- [ ] Handle test outcomes (pass/fail/skip/pending)
- [ ] Support retries if the runner supports them
- [ ] Emit `TestRunFinished` at test run end
