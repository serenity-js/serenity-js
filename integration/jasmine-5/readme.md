# Jasmine 5

This module demonstrates how Serenity/JS integrates with the Jasmine test framework to provide structured reporting and the Screenplay Pattern for test automation.

## Why Jasmine?

- Batteries-included BDD framework with built-in assertions and spies
- Clean `describe`/`it` syntax familiar to JavaScript developers
- No external dependencies required for core testing
- Supports both CommonJS and ESM modules

## Why Serenity/JS?

Serenity/JS complements Jasmine by providing:

- **Screenplay Pattern** – promotes reusable, maintainable test code by modelling interactions as tasks performed by actors
- **Rich reporting** – generates detailed reports with activity breakdowns, screenshots, and diagnostics beyond what Jasmine's built-in reporters offer
- **Domain event model** – translates Jasmine's reporter API events into a structured event stream for flexible reporting
- **Framework flexibility** – same test logic works across Jasmine, Mocha, Cucumber, and Playwright Test

## Features demonstrated

- Passing, failing, and pending scenarios
- Custom reporter integration alongside Serenity/JS
- Source file location detection for linking tests to code
- Custom tag reporting via Serenity/JS annotations
- Requirement hierarchy derived from spec file structure
- Tests without `describe` blocks (flat structure)
- Screenplay Pattern integration within Jasmine specs
