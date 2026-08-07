# Cucumber 7

This module demonstrates how Serenity/JS integrates with Cucumber.js to create executable specifications that are easy to read, maintain, and extend.

## Why Cucumber.js?

- Business-readable scenarios written in Gherkin (`Given`, `When`, `Then`)
- Encourages collaboration between developers, testers, and stakeholders
- Keeps acceptance criteria close to the implementation
- Supports reusable step definitions for consistent behaviour

## Why Serenity/JS?

Serenity/JS complements Cucumber.js by providing:

- **Screenplay Pattern** – promotes reusable, maintainable test code by modelling interactions as tasks performed by actors
- **Rich reporting** – generates detailed reports that make it easier to understand test outcomes and diagnose failures
- **Improved test maintainability** – separates business intent from implementation details, reducing duplication
- **Built-in waiting and synchronisation** – helps create reliable end-to-end tests that are less prone to timing issues
- **Framework flexibility** – integrates with tools such as Playwright, WebdriverIO, REST APIs, and more

## Features demonstrated

- Passing, failing, pending, and skipped scenarios
- Scenario outlines with example tables
- Data tables and doc strings as step arguments
- Before/After hooks and named hooks
- Cucumber Rules for grouping scenarios
- Custom tags for filtering and reporting
- Retrying failed scenarios
- Screenplay Pattern integration with Cucumber step definitions
- Timeout handling
- Requirement hierarchy derived from feature file structure
