# Todo List App

This test suite verifies the [TodoMVC](https://todo-app.serenity-js.org) application using Playwright Test with Serenity/JS. It demonstrates how the Screenplay Pattern structures real-world web tests — from simple interactions to multi-step workflows with retry handling.

## Capabilities

- **Recording items** — adding new todos and verifying they appear in the list
- **Completing items** — toggling completion status and filtering by state
- **Editing** — modifying existing todo text inline
- **Bulk operations** — marking all items complete, clearing completed items
- **Persistence** — verifying todos survive page reload via local storage
- **Routing** — filtering views (All, Active, Completed) via URL hash
- **Retries and flaky tests** — demonstrating how Serenity/JS reports retried and intermittently failing scenarios
