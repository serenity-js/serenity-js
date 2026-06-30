# Using WebdriverIO 8 with Mocha and Serenity/JS (Legacy)

This module demonstrates how Serenity/JS integrates with the legacy WebdriverIO v8 using Mocha as the test runner.

## Why this module?

WebdriverIO v8 remains in use by teams that haven't yet migrated to v9. Serenity/JS maintains backward compatibility to ensure existing test suites continue to work without modification.

## Features demonstrated

- Passing and failing scenario reporting through WebdriverIO v8's Mocha integration
- Retrying failed scenarios with correct per-attempt reporting
- AfterTest hook integration for capturing test metadata
- Filtering tests using Mocha's `grep` pattern
