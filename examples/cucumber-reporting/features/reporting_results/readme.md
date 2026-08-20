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

## HTML Report

Serenity/JS generates a self-contained HTML report with a dashboard showing pass rates, trends, and consistency analysis:

![Serenity/JS HTML Reporter dashboard](https://serenity-js.org/images/reporting/html-reporter-dashboard.png)

When a scenario fails, Serenity/JS automatically captures a screenshot and embeds it in the scenario detail view.

## Links

- [Serenity/JS Reporting Handbook](https://serenity-js.org/handbook/reporting/)
- [HTML Reporter Guide](https://serenity-js.org/handbook/reporting/html-reporter/)
- [HTML Reporter API Reference](https://serenity-js.org/api/html-reporter/)
- [GitHub Issues: Reporting](https://github.com/serenity-js/serenity-js/labels/reporting)
