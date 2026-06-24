# Requirements Document

## Introduction

This document specifies the requirements for extending `@serenity-js/playwright` to support testing Electron applications using Playwright's Electron APIs. The integration enables Serenity/JS actors to interact with Electron apps using the same Screenplay Pattern interactions (Click, Enter, etc.) that work with web browsers, while also providing Electron-specific capabilities like accessing multiple application windows and evaluating code in the main Electron process.

## Glossary

- **Electron_Application**: A Playwright `ElectronApplication` instance representing a launched Electron app, providing access to windows, browser context, and the main process
- **Electron_Window**: A Playwright `Page` instance representing a window in an Electron application
- **Electron_Launch_Options**: Configuration options passed to `electron.launch()` including executable path, command-line arguments, environment variables, and browser context options
- **Browsing_Session**: A Serenity/JS abstraction representing the pages/windows open in the current browsing context
- **BrowseTheWebWithPlaywright**: The Serenity/JS ability that enables actors to interact with web front-ends using Playwright
- **Main_Process**: The Electron main process that controls the application lifecycle and creates browser windows
- **Example_Electron_App**: A minimal Electron application created for integration testing purposes

## Requirements

### Requirement 1: Create Example Electron Application for Integration Testing

**User Story:** As a Serenity/JS maintainer, I want an example Electron application under `integration/electron-app`, so that I can run integration tests against a real Electron app.

#### Acceptance Criteria

1. THE Example_Electron_App SHALL be located at `integration/electron-app/`
2. THE Example_Electron_App SHALL have a `package.json` with name `@integration/electron-app` and `private: true`
3. THE Example_Electron_App SHALL include a main process entry point (`main.js` or `main.ts`)
4. THE Example_Electron_App SHALL create at least one browser window with testable HTML content
5. THE Example_Electron_App SHALL include interactive elements (buttons, inputs, links) for testing Serenity/JS interactions
6. THE Example_Electron_App SHALL support being launched via Playwright's `electron.launch()` API
7. THE Example_Electron_App SHALL follow the existing monorepo conventions for integration modules

### Requirement 2: Implement PlaywrightBrowsingSessionWithElectron (Externally-Managed)

**User Story:** As a test automation engineer using Playwright Test, I want a `PlaywrightBrowsingSession` implementation that accepts an already-launched Electron app, so that I can share one Electron instance per test worker.

#### Acceptance Criteria

1. THE PlaywrightBrowsingSessionWithElectron SHALL extend `PlaywrightBrowsingSession`
2. THE PlaywrightBrowsingSessionWithElectron SHALL accept an `ElectronApplication` instance in its constructor
3. WHEN the Browsing_Session is created, THE PlaywrightBrowsingSessionWithElectron SHALL use `electronApp.context()` to obtain the browser context
4. WHEN `registerCurrentPage()` is called and no windows exist, THE PlaywrightBrowsingSessionWithElectron SHALL wait for the first window using `electronApp.firstWindow()`
5. WHEN `registerCurrentPage()` is called and windows exist, THE PlaywrightBrowsingSessionWithElectron SHALL use `electronApp.windows()` to get available windows
6. THE PlaywrightBrowsingSessionWithElectron SHALL register new windows automatically when the Electron_Application emits a `window` event
7. THE PlaywrightBrowsingSessionWithElectron SHALL deregister windows automatically when they are closed
8. WHEN `browserCapabilities()` is called, THE PlaywrightBrowsingSessionWithElectron SHALL return capabilities identifying the Electron runtime
9. WHEN `closeAllPages()` is called, THE PlaywrightBrowsingSessionWithElectron SHALL close all windows but NOT close the Electron_Application itself
10. THE PlaywrightBrowsingSessionWithElectron SHALL NOT manage the lifecycle of the Electron_Application (launching or closing)

### Requirement 3: Implement Self-Launching PlaywrightBrowsingSessionWithElectron

**User Story:** As a test automation engineer using Mocha or Jasmine, I want a `PlaywrightBrowsingSession` implementation that launches and manages the Electron app lifecycle, so that I can run Electron tests without external setup.

#### Acceptance Criteria

1. THE self-launching implementation SHALL accept `ElectronLaunchOptions` in its constructor
2. WHEN the Browsing_Session is initialised, THE implementation SHALL launch the Electron_Application using `electron.launch(options)`
3. THE self-launching implementation SHALL implement the `Initialisable` interface to handle async app launching
4. THE self-launching implementation SHALL reuse all window management logic from the externally-managed implementation
5. WHEN `closeAllPages()` is called, THE self-launching implementation SHALL close all windows but NOT close the Electron_Application
6. WHEN the ability is discarded, THE self-launching implementation SHALL close the Electron_Application it launched
7. THE self-launching implementation SHALL pass the same integration tests as the externally-managed implementation

### Requirement 4: Extend BrowseTheWebWithPlaywright with Electron Support

**User Story:** As a test automation engineer, I want static methods on `BrowseTheWebWithPlaywright` to configure actors for Electron testing, so that I can reuse existing web interactions.

#### Acceptance Criteria

1. THE BrowseTheWebWithPlaywright SHALL have a static method `usingElectronApp(electronApp, extraOptions?)` that accepts an already-launched `ElectronApplication` instance
2. THE BrowseTheWebWithPlaywright SHALL have a static method `launchingElectronApp(launchOptions, extraOptions?)` that accepts `ElectronLaunchOptions` to launch and manage the app
3. WHEN `usingElectronApp()` is called, THE BrowseTheWebWithPlaywright SHALL create the externally-managed `PlaywrightBrowsingSessionWithElectron`
4. WHEN `launchingElectronApp()` is called, THE BrowseTheWebWithPlaywright SHALL create the self-launching `PlaywrightBrowsingSessionWithElectron`
5. BOTH methods SHALL accept optional `ExtraBrowserContextOptions` for configuring timeouts and navigation behavior
6. WHEN an actor uses either method, THE actor SHALL be able to perform standard web interactions (Click, Enter, Navigate, etc.)
7. WHEN `discard()` is called on an ability created via `usingElectronApp()`, THE ability SHALL close all pages but NOT close the Electron_Application
8. WHEN `discard()` is called on an ability created via `launchingElectronApp()`, THE ability SHALL close the Electron_Application it launched

### Requirement 5: Define ElectronLaunchOptions Interface

**User Story:** As a test automation engineer, I want a well-documented `ElectronLaunchOptions` interface, so that I understand what options are available when launching Electron apps.

#### Acceptance Criteria

1. THE ElectronLaunchOptions interface SHALL re-export or extend Playwright's electron launch options type
2. THE ElectronLaunchOptions interface SHALL include JSDoc documentation for commonly used options:
   - `executablePath`: Path to the Electron executable
   - `args`: Command-line arguments (typically includes the main script path)
   - `cwd`: Current working directory for the application
   - `env`: Environment variables for the Electron process
   - `timeout`: Maximum time to wait for the application to start
3. THE ElectronLaunchOptions interface SHALL be exported from `@serenity-js/playwright`

### Requirement 6: Support Window Switching in Electron Apps

**User Story:** As a test automation engineer, I want to switch between multiple Electron windows, so that I can test multi-window Electron applications.

#### Acceptance Criteria

1. WHEN an Electron_Application opens multiple windows, THE PlaywrightBrowsingSessionWithElectron SHALL track all windows via `allPages()`
2. WHEN `changeCurrentPageTo(page)` is called, THE PlaywrightBrowsingSessionWithElectron SHALL update the current window reference
3. WHEN a window is closed externally, THE PlaywrightBrowsingSessionWithElectron SHALL automatically deregister it
4. THE PlaywrightBrowsingSessionWithElectron SHALL support the `closePagesOtherThan(page)` method to close all windows except the specified one

### Requirement 7: Add Integration Tests for Electron Support

**User Story:** As a Serenity/JS maintainer, I want integration tests for the Electron integration, so that I can verify the feature works correctly.

#### Acceptance Criteria

1. THE integration tests SHALL be located in `integration/playwright-web/` alongside existing Playwright web tests
2. THE integration tests SHALL verify that actors can launch and interact with the Example_Electron_App
3. THE integration tests SHALL verify that standard Serenity/JS web interactions (Click, Enter, Text.of, etc.) work with Electron windows
4. THE integration tests SHALL verify that window switching works correctly
5. THE integration tests SHALL verify that the Electron_Application can be closed cleanly after tests
6. THE integration tests SHALL be executable via `make INTEGRATION_SCOPE=playwright-web integration-test`
7. THE integration tests SHALL include a shared test suite that runs against BOTH the externally-managed and self-launching implementations
8. THE shared test suite SHALL verify identical behavior for both implementations

### Requirement 8: Export Electron-Related Types from Package

**User Story:** As a test automation engineer, I want all Electron-related types exported from `@serenity-js/playwright`, so that I can import them easily.

#### Acceptance Criteria

1. THE `@serenity-js/playwright` package SHALL export `PlaywrightBrowsingSessionWithElectron`
2. THE `@serenity-js/playwright` package SHALL export `ElectronLaunchOptions` (or re-export from Playwright)
3. THE exports SHALL be documented with JSDoc including usage examples
4. THE exports SHALL follow the existing barrel export pattern in `src/index.ts`
