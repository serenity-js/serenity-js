# Mocha

This module demonstrates how Serenity/JS integrates with the Mocha test runner to provide structured reporting and the Screenplay Pattern for test automation.

## Why Mocha?

- Flexible, minimal test framework with a clean `describe`/`it` syntax
- Extensive ecosystem of plugins and reporters
- Supports BDD, TDD, and QUnit interfaces
- Mature retry and timeout mechanisms

## Why Serenity/JS?

Serenity/JS complements Mocha by providing:

- **Screenplay Pattern** – promotes reusable, maintainable test code by modelling interactions as tasks performed by actors
- **Rich reporting** – generates detailed reports with activity breakdowns, screenshots, and diagnostics beyond what Mocha's built-in reporters offer
- **Domain event model** – translates Mocha's test lifecycle into a structured event stream for flexible reporting
- **Framework flexibility** – same test logic works across Mocha, Jasmine, Cucumber, and Playwright Test

## Features demonstrated

- Passing, failing, pending, and skipped scenarios
- Test suites with nested `describe` blocks
- Tests without `describe` blocks (flat structure)
- Custom tag reporting via Serenity/JS annotations
- Requirement hierarchy derived from spec file structure
- Retrying failed scenarios
- Screenplay Pattern integration within Mocha tests
