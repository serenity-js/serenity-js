# Playwright Web

This module demonstrates Serenity/JS web testing capabilities using Playwright as the browser automation tool. It exercises the full Page Element Query Language (PEQL) and web interaction APIs.

## Why Playwright for web testing?

- Fast, reliable browser automation with intelligent auto-waiting
- Cross-browser support (Chromium, Firefox, WebKit) from a single API
- Network interception and mocking capabilities
- Native support for iframes, shadow DOM, and modern web features

## Why Serenity/JS?

Serenity/JS provides a portable web testing abstraction layer on top of Playwright:

- **Page Element Query Language (PEQL)** – composable, readable element locators using `.of()`, `.where()`, and `.eachMappedTo()`
- **Dependency inversion** – tests depend on `@serenity-js/web` abstractions, not Playwright-specific APIs, making them portable across browsers and tools
- **Screenplay Pattern** – models web interactions as reusable Tasks and Interactions performed by Actors with the ability to `BrowseTheWeb`
- **Rich reporting** – activity trees show every click, navigation, and assertion with timing and screenshots

## Features demonstrated

- **Interactions**: Click, Double-click, Right-click, Enter, Clear, Hover, Scroll, Press, Select, Navigate, Wait, TakeScreenshot, ExecuteScript (sync, async, from URL)
- **Questions**: Text, Value, Attribute, CssClasses, ComputedStyle, LastScriptExecution
- **Expectations**: isVisible, isEnabled, isClickable, isPresent, isSelected, isActive
- **Page models**: Page (title, URL, navigation, script execution), Cookie, ModalDialog (alert, confirm, prompt)
- **Element location**: By.css, By.deepCss, By.id, By.tagName, By.xpath — with single elements and collections
- **Element composition**: PageElement.of() (meta-questions), PageElements.where() (filtering), .eachMappedTo() (mapping)
- **Photographer**: Automatic screenshot strategies (on interaction, on failure, before and after)
- **BrowseTheWeb ability**: Managing browser pages and contexts via the Screenplay Pattern
