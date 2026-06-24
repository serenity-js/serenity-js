# Implementation Plan: Electron Integration for @serenity-js/playwright

## Overview

This implementation plan extends `@serenity-js/playwright` to support testing Electron applications using Playwright's Electron APIs. The implementation follows a strict TDD approach with two main phases:

1. **Phase 1**: Externally-managed `PlaywrightBrowsingSessionWithElectron` - for Playwright Test scenarios where the app is managed per-worker
2. **Phase 2**: Self-launching `SelfLaunchingPlaywrightBrowsingSessionWithElectron` - for Mocha/Jasmine scenarios where Serenity/JS manages the app lifecycle

Both implementations will pass the same shared test suite to ensure consistent behavior.

## Tasks

- [x] 1. Create Example Electron Application for Integration Testing
  - [x] 1.1 Set up the example Electron app project structure
    - Create `integration/electron-app/` directory
    - Create `package.json` with name `@integration/electron-app` and `private: true`
    - Create `tsconfig.json` following monorepo conventions (ES2023 target, CommonJS modules)
    - Add Electron as a dev dependency
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 1.2 Implement the main process entry point
    - Create `src/main.ts` with BrowserWindow creation
    - Configure the window to load `index.html`
    - Set up IPC handlers if needed for testing
    - _Requirements: 1.3, 1.6_

  - [x] 1.3 Create the renderer HTML and scripts
    - Create `index.html` with testable interactive elements
    - Include a button that can be clicked
    - Include an input field for text entry
    - Include a link/button that opens a second window
    - Include display elements showing interaction results
    - _Requirements: 1.4, 1.5_

  - [x] 1.4 Add build scripts and verify the app launches
    - Add `build` script to compile TypeScript
    - Add `start` script to launch the app
    - Verify the app can be launched via `electron.launch()` API
    - _Requirements: 1.6_

- [x] 2. Checkpoint - Verify Example Electron App
  - Ensure the example Electron app compiles and launches correctly
  - Verify interactive elements are present and functional
  - Ask the user if questions arise

- [x] 3. Define ElectronLaunchOptions Type
  - [x] 3.1 Create the ElectronLaunchOptions type definition
    - Create `packages/playwright/src/screenplay/models/ElectronLaunchOptions.ts`
    - Re-export Playwright's electron launch options type
    - Add comprehensive JSDoc documentation for common options (executablePath, args, cwd, env, timeout)
    - Include usage examples in the documentation
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.2 Export ElectronLaunchOptions from the package
    - Add export to `packages/playwright/src/screenplay/models/index.ts`
    - Add export to `packages/playwright/src/index.ts`
    - _Requirements: 8.3, 8.4_

- [x] 4. Implement PlaywrightBrowsingSessionWithElectron (Phase 1: Externally-Managed)
  - [x] 4.1 Write failing unit tests for PlaywrightBrowsingSessionWithElectron
    - Create `packages/playwright/spec/screenplay/models/PlaywrightBrowsingSessionWithElectron.spec.ts`
    - Test constructor accepts ElectronApplication and stores it
    - Test `createBrowserContext()` calls `electronApp.context()`
    - Test `registerCurrentPage()` handles zero windows (waits for first)
    - Test `registerCurrentPage()` handles existing windows
    - Test `closeAllPages()` closes windows but not the app
    - Test `browserCapabilities()` returns Electron-specific info
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8, 2.9, 2.10_

  - [ ]* 4.2 Write property test for window registration consistency
    - **Property 1: Window Registration Consistency**
    - For any Electron app with N windows, `allPages()` returns exactly N PlaywrightPage instances
    - **Validates: Requirements 2.5, 2.6, 6.1**

  - [x] 4.3 Implement PlaywrightBrowsingSessionWithElectron class
    - Create `packages/playwright/src/screenplay/models/PlaywrightBrowsingSessionWithElectron.ts`
    - Extend `PlaywrightBrowsingSession`
    - Implement constructor accepting ElectronApplication
    - Implement `createBrowserContext()` using `electronApp.context()`
    - Implement `registerCurrentPage()` with window handling logic
    - Implement `browserCapabilities()` returning Electron info
    - Implement `closeAllPages()` that closes windows but not the app
    - Add JSDoc documentation with usage examples
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8, 2.9, 2.10_

  - [x] 4.4 Implement window event handlers for automatic registration/deregistration
    - Set up handler for `window` event to register new windows
    - Set up handler for page `close` event to deregister windows
    - _Requirements: 2.6, 2.7_

  - [ ]* 4.5 Write property test for window deregistration on close
    - **Property 2: Window Deregistration on Close**
    - When a window is closed, it is automatically removed from page tracking
    - **Validates: Requirements 2.7, 6.3**

  - [ ]* 4.6 Write property test for closeAllPages preserving application
    - **Property 3: closeAllPages Preserves Application**
    - Calling `closeAllPages()` closes all windows but leaves ElectronApplication running
    - **Validates: Requirements 2.9, 3.5, 4.7**

  - [x] 4.7 Export PlaywrightBrowsingSessionWithElectron from the package
    - Add export to `packages/playwright/src/screenplay/models/index.ts`
    - Add export to `packages/playwright/src/index.ts`
    - _Requirements: 8.1, 8.4_

- [x] 5. Extend BrowseTheWebWithPlaywright with usingElectronApp
  - [x] 5.1 Write failing unit tests for usingElectronApp static method
    - Test `usingElectronApp()` creates externally-managed session
    - Test it accepts optional ExtraBrowserContextOptions
    - Test `discard()` closes pages but not the app
    - _Requirements: 4.1, 4.3, 4.5, 4.7_

  - [x] 5.2 Implement usingElectronApp static method
    - Add `usingElectronApp(electronApp, extraOptions?)` to BrowseTheWebWithPlaywright
    - Create PlaywrightBrowsingSessionWithElectron instance
    - Add JSDoc documentation with usage examples
    - _Requirements: 4.1, 4.3, 4.5_

- [x] 6. Checkpoint - Verify Phase 1 Implementation
  - Ensure all unit tests pass for externally-managed session
  - Run `make test` in packages/playwright
  - Ask the user if questions arise

- [x] 7. Implement SelfLaunchingPlaywrightBrowsingSessionWithElectron (Phase 2)
  - [x] 7.1 Write failing unit tests for SelfLaunchingPlaywrightBrowsingSessionWithElectron
    - Create `packages/playwright/spec/screenplay/models/SelfLaunchingPlaywrightBrowsingSessionWithElectron.spec.ts`
    - Test constructor accepts ElectronLaunchOptions
    - Test `initialise()` launches the Electron app
    - Test `isInitialised()` returns correct state
    - Test methods delegate to wrapped session after initialisation
    - Test `closeElectronApp()` closes the app and resets state
    - Test `closeAllPages()` closes windows but not the app
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property test for initialisation idempotence
    - **Property 5: Self-Launching Initialisation Idempotence**
    - Calling `initialise()` K times results in exactly one Electron app being launched
    - **Validates: Requirements 3.2, 3.3**

  - [x] 7.3 Implement SelfLaunchingPlaywrightBrowsingSessionWithElectron class
    - Create `packages/playwright/src/screenplay/models/SelfLaunchingPlaywrightBrowsingSessionWithElectron.ts`
    - Extend `PlaywrightBrowsingSession`
    - Implement `Initialisable` interface
    - Implement constructor accepting ElectronLaunchOptions
    - Implement `initialise()` to launch Electron app and create delegate
    - Implement `isInitialised()` to check state
    - Implement delegation methods (currentPage, allPages, browserCapabilities, etc.)
    - Implement `closeAllPages()` that closes windows but not the app
    - Implement `closeElectronApp()` to close the app
    - Add JSDoc documentation with usage examples
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.4 Write property test for cleanup completeness
    - **Property 6: Self-Launching Cleanup Completeness**
    - Calling `closeElectronApp()` closes the app and `isInitialised()` returns false
    - **Validates: Requirements 3.6, 4.8**

  - [x] 7.5 Export SelfLaunchingPlaywrightBrowsingSessionWithElectron from the package
    - Add export to `packages/playwright/src/screenplay/models/index.ts`
    - Add export to `packages/playwright/src/index.ts`
    - _Requirements: 8.1, 8.4_

- [x] 8. Extend BrowseTheWebWithPlaywright with launchingElectronApp
  - [x] 8.1 Write failing unit tests for launchingElectronApp static method
    - Test `launchingElectronApp()` creates self-launching session
    - Test it accepts optional ExtraBrowserContextOptions
    - Test `discard()` closes the Electron app
    - _Requirements: 4.2, 4.4, 4.5, 4.8_

  - [x] 8.2 Implement launchingElectronApp static method
    - Add `launchingElectronApp(launchOptions, extraOptions?)` to BrowseTheWebWithPlaywright
    - Create SelfLaunchingPlaywrightBrowsingSessionWithElectron instance
    - Add JSDoc documentation with usage examples
    - _Requirements: 4.2, 4.4, 4.5_

  - [x] 8.3 Update discard() method to handle self-launching sessions
    - Check if session is SelfLaunchingPlaywrightBrowsingSessionWithElectron
    - Call `closeElectronApp()` for self-launching sessions
    - _Requirements: 4.8_

- [x] 9. Checkpoint - Verify Phase 2 Implementation
  - Ensure all unit tests pass for self-launching session
  - Run `make test` in packages/playwright
  - Ask the user if questions arise

- [-] 10. Create Shared Integration Test Suite
  - [-] 10.1 Create the shared test suite file
    - Create `integration/playwright-web/src/electron/shared-electron-tests.ts`
    - Define `describeElectronBehavior` function accepting session factory
    - Include tests for clicking on elements
    - Include tests for entering text
    - Include tests for reading text content
    - Include tests for window switching
    - Include tests for window lifecycle tracking
    - _Requirements: 7.1, 7.3, 7.4, 7.7, 7.8_

  - [ ]* 10.2 Write property test for browser capabilities identification
    - **Property 7: Browser Capabilities Electron Identification**
    - `browserCapabilities()` returns object where `browserName` equals 'electron'
    - **Validates: Requirements 2.8**

  - [ ]* 10.3 Write property test for standard interactions compatibility
    - **Property 8: Standard Interactions Compatibility**
    - Standard Serenity/JS web interactions work with Electron windows
    - **Validates: Requirements 4.6, 7.3**

  - [ ]* 10.4 Write property test for closePagesOtherThan
    - **Property 4: closePagesOtherThan Preserves Selected**
    - Calling `closePagesOtherThan(P)` results in only page P remaining
    - **Validates: Requirements 6.4**

- [ ] 11. Implement Integration Tests for Externally-Managed Session
  - [-] 11.1 Create the externally-managed integration test file
    - Create `integration/playwright-web/src/electron/externally-managed.spec.ts`
    - Import and use `describeElectronBehavior` with externally-managed session factory
    - Set up Electron app launch in beforeAll/beforeEach
    - Clean up Electron app in afterAll/afterEach
    - _Requirements: 7.1, 7.2, 7.7_

  - [-] 11.2 Add Electron dependency to playwright-web integration module
    - Update `integration/playwright-web/package.json` to include Electron
    - Add dependency on `@integration/electron-app`
    - _Requirements: 7.6_

- [ ] 12. Implement Integration Tests for Self-Launching Session
  - [-] 12.1 Create the self-launching integration test file
    - Create `integration/playwright-web/src/electron/self-launching.spec.ts`
    - Import and use `describeElectronBehavior` with self-launching session factory
    - Verify identical behavior to externally-managed session
    - _Requirements: 3.7, 7.1, 7.7, 7.8_

- [ ] 13. Update Integration Test Configuration
  - [ ] 13.1 Update mocharc.yml to include Electron tests
    - Add `./src/electron/**/*.spec.ts` to spec patterns
    - Ensure Electron tests run as part of the integration test suite
    - _Requirements: 7.6_

  - [ ] 13.2 Verify integration tests can be run via make command
    - Test with `make INTEGRATION_SCOPE=playwright-web integration-test`
    - _Requirements: 7.6_

- [ ] 14. Final Checkpoint - Verify Complete Implementation
  - Ensure all unit tests pass: `make test`
  - Ensure all integration tests pass: `make INTEGRATION_SCOPE=playwright-web integration-test`
  - Verify both implementations pass the shared test suite
  - Verify Electron app can be closed cleanly after tests
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The shared test suite pattern ensures both implementations behave identically
- Integration tests require the example Electron app to be built first
