# Serenity/JS HTML Reporter — Integration Tests

These tests serve as **living documentation** of the [Serenity/JS HTML Reporter](https://serenity-js.org/handbook/reporting/) capabilities. Each test demonstrates a user-facing feature of the report, written using the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

## Report Capabilities

| Capability | Description |
|-----------|-------------|
| [Dashboard](./dashboard/) | At-a-glance confidence scores, pass rates, quality trends, and health indicators |
| [Test Scenarios](./scenarios/) | Search, filter, and navigate test scenarios with full execution detail |
| [Capabilities](./capabilities/) | Map tests to business features with confidence scoring per area |
| [Consistency](./consistency/) | Identify flaky, degraded, and recovered tests across runs |
| [Errors](./errors/) | Group and investigate failures by error type and pattern |
| [Timeline](./timeline/) | Analyse execution timing and identify performance bottlenecks |
| [Tags](./tags/) | View test results aggregated by feature, browser, or custom tags |
| [Test Runs](./test-runs/) | Track quality trends across historical test runs |
| [System Context](./system-context/) | Inspect the test environment and CI/CD configuration |
| [Navigation](./navigation/) | Deep linking, theme switching, and URL state management |

## Running the Tests

```bash
# Generate report data from example specs
npm run example

# Run the integration tests against the generated report
npx playwright test
```

## Test Architecture

Tests use [Serenity/JS interaction objects](https://serenity-js.org/handbook/design/screenplay-pattern/) — the Screenplay Pattern equivalent of Page Objects — to describe user behaviour declaratively:

```typescript
await actor.attemptsTo(
    scenariosView.open(),
    scenariosView.selectFilter('Failed'),
    scenariosView.find('expired card'),

    Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
);
```

Interaction objects encapsulate all DOM selectors and navigation logic. Tests read as specifications of what users can see and do.

## Report Data

The tests run against a real HTML report generated from [example specs](./examples/specs/). The example suite includes passing, failing, retried, and pending scenarios to exercise all report capabilities.
