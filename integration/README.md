# Serenity/JS

Serenity/JS is a TypeScript-native test automation framework that gives your test suite the architecture it needs to scale. This report shows the project's own integration tests — running across Playwright, WebdriverIO, Cucumber, Mocha, and Jasmine — verifying that Serenity/JS works correctly with each test runner and browser it supports. Explore the Capabilities tree to see how the framework tests itself.

## What these tests cover

The integration tests exercise real user-facing behaviour across all supported test runners and browsers. They verify that test runner adapters emit correct domain events, web interactions work consistently across browser engines, and the HTML report renders evidence — screenshots, HTTP exchanges, activity trees — accurately.

Because these tests run against the framework's own public APIs, they serve as living documentation of how Serenity/JS behaves in practice.

## @showcase scenarios

Scenarios tagged **@showcase** are curated demonstrations of the HTML Reporter's key workflows. Filter by `@showcase` in the Test Scenarios view to find them.

They're grouped around four themes:

- **Finding and diagnosing failures** — error blocks, stack traces, screenshots at the point of failure
- **Tracking stability** — retry detection, flaky test identification, execution history
- **Understanding quality** — pass rates, outcome distribution, capability health
- **Navigating and sharing** — deep links, filtering, search, cross-referencing evidence
