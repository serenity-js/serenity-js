# WebdriverIO Jasmine

This module demonstrates how Serenity/JS integrates with WebdriverIO v9+ using Jasmine as the test runner.

## Why this combination?

- **WebdriverIO** provides reliable, cross-browser automation via WebDriver and DevTools protocols
- **Jasmine** offers a batteries-included BDD framework with built-in assertions and spies
- **Serenity/JS** adds the Screenplay Pattern, structured reporting, and portable test abstractions

## Features demonstrated

- Passing and failing scenario reporting through WebdriverIO's Jasmine integration
- AfterTest hook integration for capturing test metadata
- Filtering tests using Jasmine's `grep` pattern
- Serenity/JS domain events emitted correctly for each Jasmine lifecycle event
