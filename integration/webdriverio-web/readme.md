# Web Testing with WebdriverIO

This module demonstrates Serenity/JS web testing capabilities using WebdriverIO v9+ as the browser automation tool.

## Why WebdriverIO?

- Standards-based browser automation via WebDriver and Chrome DevTools protocols
- Supports mobile testing through Appium integration
- Rich plugin ecosystem and community
- Cross-browser testing with Selenium Grid and cloud providers

## Why Serenity/JS?

Serenity/JS provides a portable web testing abstraction layer on top of WebdriverIO:

- **Page Element Query Language (PEQL)** – composable, readable element locators using `.of()`, `.where()`, and `.eachMappedTo()`
- **Dependency inversion** – tests depend on `@serenity-js/web` abstractions, not WebdriverIO-specific APIs, making them portable across tools
- **Screenplay Pattern** – models web interactions as reusable Tasks and Interactions performed by Actors with the ability to `BrowseTheWeb`
- **Rich reporting** – activity trees show every interaction with timing and screenshots

## Features demonstrated

- PageElement interactions via the `@serenity-js/web` abstraction layer
- WebDriver and DevTools protocol support
- BrowseTheWebWithWebdriverIO ability implementation
- Same web specs as Playwright (portable across browser tools)
