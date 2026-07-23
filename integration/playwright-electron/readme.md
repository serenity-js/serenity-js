# Playwright Electron

This module demonstrates how Serenity/JS integrates with Playwright's Electron support to test desktop applications built with Electron.

## Why Electron testing?

- Verify desktop application behaviour using the same web testing patterns
- Test both the renderer process (UI) and main process interactions
- No need for separate desktop automation tools

## Why Serenity/JS?

Serenity/JS provides:

- **Screenplay Pattern** – the same reusable Tasks and Interactions that work for web testing also work for Electron apps
- **Portable abstractions** – tests written against `@serenity-js/web` work identically whether the target is a browser or an Electron app
- **Rich reporting** – activity trees, screenshots, and diagnostics for Electron test scenarios

## Features demonstrated

- Self-launching Electron applications (Serenity/JS manages the app lifecycle)
- Externally-managed Electron applications (connecting to an already-running app)
- Web interactions (Click, Enter, Navigate) within Electron renderer windows
- Screenplay Pattern integration with Playwright's Electron API
