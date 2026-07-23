# WebdriverIO Mocha

This module demonstrates how Serenity/JS integrates with WebdriverIO v9+ using Mocha as the test runner.

## Why this combination?

- **WebdriverIO** provides reliable, cross-browser automation via WebDriver and DevTools protocols
- **Mocha** offers a flexible, widely-adopted test runner with a clean `describe`/`it` syntax
- **Serenity/JS** adds the Screenplay Pattern, structured reporting, and portable test abstractions

## Features demonstrated

- Passing and failing scenario reporting through WebdriverIO's Mocha integration
- Retrying failed scenarios with correct per-attempt reporting
- AfterTest hook integration for capturing test metadata
- Filtering tests using Mocha's `grep` pattern
- Serenity/JS domain events emitted correctly for each Mocha lifecycle event
