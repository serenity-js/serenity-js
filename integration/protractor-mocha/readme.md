# Protractor Mocha

This module demonstrates how Serenity/JS integrates with the legacy Protractor framework using Mocha as the test runner.

## Why this module?

Protractor has been deprecated, but Serenity/JS continues to support it to help teams migrate to Playwright or WebdriverIO at their own pace. The Screenplay Pattern abstractions remain portable across all supported tools.

## Features demonstrated

- Passing and failing scenario reporting through Protractor's Mocha integration
- Retrying failed scenarios with correct per-attempt reporting
- Restarting browser between tests for test isolation
- Screenplay Pattern integration within Protractor/Mocha tests
- Filtering tests using Mocha's `grep` pattern
