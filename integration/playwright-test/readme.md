# Playwright Test

This module demonstrates how Serenity/JS integrates with Playwright Test to provide structured reporting, the Screenplay Pattern, and multi-actor test scenarios.

## Why Playwright Test?

- Fast, reliable browser automation with auto-waiting
- Built-in test isolation via browser contexts
- Parallel test execution out of the box
- Native support for multiple browsers (Chromium, Firefox, WebKit)
- Fixtures system for dependency injection

## Why Serenity/JS?

Serenity/JS complements Playwright Test by providing:

- **Screenplay Pattern** – promotes reusable, maintainable test code by modelling interactions as tasks performed by actors
- **Multi-actor scenarios** – built-in support for tests involving multiple users interacting with the system simultaneously
- **Rich reporting** – generates detailed reports with activity trees, screenshots at each step, and full diagnostics
- **Portable test logic** – same Screenplay tasks and questions work across Playwright, WebdriverIO, and REST APIs
- **Blended testing** – combine UI and API interactions within a single scenario for faster, more reliable tests

## Features demonstrated

- Serenity/JS fixtures (`actor`, `actorCalled`) within Playwright Test
- Cast configuration for provisioning actors with abilities
- Custom tag reporting via Serenity/JS annotations
- Before/After hooks and their reporting
- Retrying failed scenarios with per-attempt activity trees
- Passing, failing, skipped, and repeated test outcomes
- Screenplay Pattern integration with Playwright's native `page` object
- Automatic screenshot capture (Photographer strategies)
- Requirement hierarchy derived from spec file structure
- Integration with Playwright's native reporters alongside Serenity/JS
- Playwright step reporter integration
- Electron application testing
