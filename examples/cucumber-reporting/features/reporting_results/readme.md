# Reporting Results

This feature area verifies how Serenity/JS reports different test outcomes: passing, failing, pending, and errored scenarios.

## Outcome Types

| Outcome | Icon | Meaning |
|---------|------|---------|
| Passed | ✅ | All steps completed successfully |
| Failed | ❌ | An assertion failed |
| Errored | 💥 | An unexpected exception occurred |
| Pending | ⏸️ | Scenario not yet implemented |
| Skipped | ⏭️ | Scenario was skipped by the runner |
| Compromised | ⚠️ | Test environment was not in expected state |

## Report Flow

```
Scenario Execution
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Domain     │────▶│  Aggregator  │────▶│  HTML Report │
│  Events     │     │  (data.js)   │     │  (index.html)│
└─────────────┘     └──────────────┘     └─────────────┘
```

## Screenshot Capture

When a scenario fails, Serenity/JS automatically captures a screenshot:

![Example failure screenshot](https://serenity-js.org/images/handbook/reporting/serenity-bdd-reporter.png)

## Links

- [Serenity/JS Reporting Handbook](https://serenity-js.org/handbook/reporting/)
- [Configuring the HTML Reporter](https://serenity-js.org/api/html-reporter/)
- [GitHub Issues: Reporting](https://github.com/serenity-js/serenity-js/labels/reporting)
