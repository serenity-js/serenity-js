# Component Testing with Playwright Test and Serenity/JS

This module demonstrates how Serenity/JS integrates with Playwright Test's component testing mode to test individual UI components in isolation.

## Why component testing?

- Test components in isolation without running the full application
- Faster feedback loop than end-to-end tests
- Verify component behaviour, accessibility, and visual rendering
- Complements end-to-end tests by covering component-level edge cases

## Why Serenity/JS?

Serenity/JS provides:

- **Screenplay Pattern** – interact with mounted components using the same Tasks, Interactions, and Questions used in full-page tests
- **Rich reporting** – activity trees show component interactions with the same detail as end-to-end tests
- **Consistent API** – `@serenity-js/web` interactions work identically in component and full-page testing modes

## Features demonstrated

- Mounting components within Playwright Test's component testing harness
- Serenity/JS fixtures and actor integration in component test mode
- Web interactions (Click, Enter, assertions) against isolated components
