# Implementation Plan: @serenity-js/cli Module (Phase 1)

## Overview

This implementation plan follows an Acceptance Test-Driven Development (ATDD) approach for Phase 1 of the `@serenity-js/cli` module. The plan establishes the foundational CLI architecture including package scaffolding, CLI API schema, dynamic command routing, and the `check-installation` and `check-updates` commands.

The ATDD cycle:
1. Write a failing high-level acceptance test (integration test)
2. Make it pass by implementing the feature using TDD for lower-level components
3. TDD cycle for each component: Write failing unit test → Implement → Refactor
4. Refactor the overall implementation while keeping all tests green

## Tasks

- [x] 1. Set up package scaffolding and integration test infrastructure
  - [x] 1.1 Create `packages/cli/` package structure
    - Create `package.json` with dependencies (yargs, zod, axios, @serenity-js/core)
    - Create `tsconfig.json`, `tsconfig-esm.build.json`, `tsconfig-cjs.build.json`
    - Create `src/index.ts` with placeholder exports
    - Create `spec/expect.ts` with Chai configuration
    - _Requirements: 3.9, 17.1_
  
  - [x] 1.2 Create `integration/cli/` test infrastructure
    - Create `package.json` with test dependencies
    - Create `tsconfig.json`
    - Create `spec/` directory structure
    - Create test fixtures: `fixtures/project-with-all-modules/`, `fixtures/project-with-no-modules/`
    - _Requirements: 17.1, 17.6_

- [x] 2. Implement CLI API Schema (Zod + JSON Schema)
  - [x] 2.1 Write unit tests for CliApiSchema validation
    - Test valid cli-api.json parsing
    - Test validation errors for missing required fields
    - Test enum parameter validation (must have values array)
    - Test array parameter validation (must have items definition)
    - _Requirements: 3.1.1-3.1.15_
  
  - [x] 2.2 Implement CliApiSchema Zod schema
    - Create `src/cli/schema/CliApiSchema.ts` with Zod schema
    - Export types: `CliApi`, `Command`, `Parameter`
    - _Requirements: 3.1.1-3.1.15_
  
  - [x] 2.3 Create JSON Schema file
    - Create `src/cli/schema/cli-api.schema.json`
    - _Requirements: 3.1.14_
  
  - [x] 2.4 Create cli-api.json for @serenity-js/cli
    - Define `check-installation` and `check-updates` commands
    - Place at `packages/cli/cli-api.json`
    - _Requirements: 3.9, 3.10_

- [x] 3. Checkpoint - Verify schema implementation
  - Ensure all unit tests pass, ask the user if questions arise.

- [x] 4. Implement check-installation command (ATDD)
  - [x] 4.1 Write failing integration test for check-installation
    - Test: `sjs cli check-installation` returns valid JSON with installation report
    - Test: Command detects installed @serenity-js/* modules
    - Test: Command reports Node.js version and supported status
    - _Requirements: 13.1, 13.2, 13.7, 17.2, 17.5_
  
  - [x] 4.2 TDD: Implement NodeVersion question
    - Write unit test: returns current Node.js version
    - Write unit test: `isNodeVersionSupported` returns true for ^20, ^22, ^24
    - Write unit test: `isNodeVersionSupported` returns false for unsupported versions
    - Implement `src/cli/screenplay/questions/NodeVersion.ts`
    - _Requirements: 13.1_
    - **Validates: Design Invariant 1 (Node.js Version Validation)**
  
  - [ ]* 4.3 Write property test for Node.js version validation
    - **Property 1: Node.js Version Validation**
    - For any version string matching `v{major}.{minor}.{patch}`, `isNodeVersionSupported` returns true iff major is 20, 22, or 24
    - **Validates: Requirements 13.1, Design Invariant 1**
  
  - [x] 4.4 TDD: Implement UseNodeModules ability
    - Write unit test: `listSerenityPackages` returns only @serenity-js/* packages
    - Write unit test: `readPackageJson` returns parsed package.json
    - Write unit test: `moduleExists` returns correct boolean
    - Implement `src/cli/screenplay/abilities/UseNodeModules.ts`
    - _Requirements: 13.2_
  
  - [x] 4.5 TDD: Implement InstalledSerenityModules question
    - Write unit test: returns list of installed @serenity-js/* packages with versions
    - Write unit test: returns empty array when no modules found
    - Implement `src/cli/screenplay/questions/InstalledSerenityModules.ts`
    - _Requirements: 13.2_
    - **Validates: Design Invariant 2 (Module Discovery Filtering)**
  
  - [ ]* 4.6 Write property test for module discovery filtering
    - **Property 2: Module Discovery Filtering**
    - For any set of packages in node_modules, `InstalledSerenityModules` returns exactly those matching `@serenity-js/*`
    - **Validates: Requirements 13.2, Design Invariant 2**
  
  - [x] 4.7 TDD: Implement FetchRemoteResources ability
    - Write unit test: `fetch` returns parsed JSON from URL
    - Write unit test: `fetch` throws NetworkError on failure
    - Implement `src/cli/screenplay/abilities/FetchRemoteResources.ts`
    - _Requirements: 13.3_
  
  - [x] 4.8 TDD: Implement ModuleManagerConfig question
    - Write unit test: fetches and returns module-manager.json
    - Write unit test: handles network errors gracefully
    - Implement `src/cli/screenplay/questions/ModuleManagerConfig.ts`
    - _Requirements: 13.3_
  
  - [x] 4.9 TDD: Implement compatibility checking logic
    - Write unit test: returns `compatible` when versions satisfy required ranges
    - Write unit test: returns `incompatible` with issues when versions don't match
    - Write unit test: checks Playwright compatibility per matrix
    - Write unit test: checks WebdriverIO compatibility per matrix
    - Implement compatibility checking in CheckInstallation task
    - _Requirements: 13.4, 13.5, 13.6_
    - **Validates: Design Invariant 3 (Compatibility Matrix Validation)**
  
  - [ ]* 4.10 Write property test for compatibility matrix validation
    - **Property 3: Compatibility Matrix Validation**
    - For any installed version and required range, compatibility check returns `compatible` iff semver.satisfies(installed, required)
    - **Validates: Requirements 13.4, 13.5, Design Invariant 3**
  
  - [x] 4.11 TDD: Implement InstallationReport model
    - Write unit test: model contains nodeVersion, modules, compatibility
    - Implement `src/cli/model/InstallationReport.ts`
    - _Requirements: 13.7_
    - **Validates: Design Invariant 4 (Installation Report Completeness)**
  
  - [x] 4.12 TDD: Implement CheckInstallation task
    - Write unit test: task returns complete InstallationReport
    - Write unit test: task handles missing modules gracefully
    - Implement `src/cli/screenplay/tasks/CheckInstallation.ts`
    - _Requirements: 13.1-13.7_

- [x] 5. Checkpoint - Verify check-installation implementation
  - Ensure all unit tests pass
  - Ensure integration test for check-installation passes
  - Ask the user if questions arise.

- [x] 6. Implement check-updates command (ATDD)
  - [x] 6.1 Write failing integration test for check-updates
    - Test: `sjs cli check-updates` returns valid JSON with update report
    - Test: Command compares installed versions with latest
    - Test: Command includes update command for detected package manager
    - _Requirements: 14.1-14.5, 17.3, 17.5_
  
  - [x] 6.2 TDD: Implement PackageManagerType question
    - Write unit test: detects npm from package-lock.json
    - Write unit test: detects yarn from yarn.lock
    - Write unit test: detects pnpm from pnpm-lock.yaml
    - Implement `src/cli/screenplay/questions/PackageManagerType.ts`
    - _Requirements: 14.4_
  
  - [x] 6.3 TDD: Implement version comparison logic
    - Write unit test: identifies outdated when latest > installed (semver)
    - Write unit test: identifies up-to-date when versions match
    - Implement version comparison in CheckUpdates task
    - _Requirements: 14.2_
    - **Validates: Design Invariant 5 (Version Comparison Correctness)**
  
  - [ ]* 6.4 Write property test for version comparison
    - **Property 5: Version Comparison Correctness**
    - For any two semver versions, `isOutdated(installed, latest)` returns true iff semver.gt(latest, installed)
    - **Validates: Requirements 14.2, Design Invariant 5**
  
  - [x] 6.5 TDD: Implement UpdateReport model
    - Write unit test: model contains upToDate, updates, updateCommand
    - Write unit test: upToDate is true when updates array is empty
    - Implement `src/cli/model/UpdateReport.ts`
    - _Requirements: 14.3, 14.5_
    - **Validates: Design Invariant 6 (Update Report Completeness)**
  
  - [x] 6.6 TDD: Implement update command generation
    - Write unit test: generates correct npm update command
    - Write unit test: generates correct yarn upgrade command
    - Write unit test: generates correct pnpm update command
    - Implement command generation in CheckUpdates task
    - _Requirements: 14.4_
    - **Validates: Design Invariant 7 (Package Manager Command Generation)**
  
  - [ ]* 6.7 Write property test for update command generation
    - **Property 7: Package Manager Command Generation**
    - For any package manager type and list of modules, generated command uses correct syntax and includes all modules
    - **Validates: Requirements 14.4, Design Invariant 7**
  
  - [x] 6.8 TDD: Implement CheckUpdates task
    - Write unit test: task returns complete UpdateReport
    - Write unit test: task handles network errors gracefully
    - Implement `src/cli/screenplay/tasks/CheckUpdates.ts`
    - _Requirements: 14.1-14.7_

- [x] 7. Checkpoint - Verify check-updates implementation
  - Ensure all unit tests pass
  - Ensure integration test for check-updates passes
  - Ask the user if questions arise.

- [-] 8. Implement dynamic command routing
  - [ ] 8.1 TDD: Implement TaskRegistry
    - Write unit test: registers and retrieves task factories
    - Write unit test: throws error for unknown task
    - Write unit test: registers built-in CLI tasks
    - Implement `src/cli/TaskRegistry.ts`
    - _Requirements: 3.3, 3.4_
  
  - [ ] 8.2 TDD: Implement CommandRouter
    - Write unit test: discovers cli-api.json from @serenity-js/cli
    - Write unit test: validates cli-api.json against schema
    - Write unit test: registers commands dynamically from cli-api.json
    - Write unit test: builds correct yargs command signature
    - Write unit test: maps parameter types correctly
    - Implement `src/cli/CommandRouter.ts`
    - _Requirements: 2.2, 2.3, 3.3-3.8_
  
  - [x] 8.3 TDD: Implement JSON output formatting
    - Write unit test: outputs valid JSON to stdout
    - Write unit test: formats success response correctly
    - Write unit test: formats error response correctly
    - Write unit test: supports --pretty flag
    - Implement `src/cli/io/JsonOutput.ts`
    - _Requirements: 9.1-9.4_
    - **Validates: Design Invariant 8 (JSON Output Validity)**
  
  - [ ]* 8.4 Write property test for JSON output validity
    - **Property 8: JSON Output Validity**
    - For any CliResponse object, `JsonOutput.format(response)` produces valid JSON that can be parsed without errors
    - **Validates: Requirements 17.5, Design Invariant 8**
  
  - [x] 8.5 TDD: Implement CLI bootstrap
    - Write unit test: parses command line arguments
    - Write unit test: routes to correct command handler
    - Write unit test: outputs JSON response
    - Implement `src/cli/bootstrap.ts`
    - _Requirements: 3.3, 9.1_
  
  - [ ] 8.6 Create CLI entry point
    - Create `bin/sjs` executable script
    - Wire up bootstrap to yargs
    - _Requirements: 3.3_

- [ ] 9. Checkpoint - Verify command routing
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ask the user if questions arise.

- [ ] 10. Implement error handling
  - [ ] 10.1 TDD: Implement custom error types
    - Write unit test: NetworkError extends RuntimeError
    - Write unit test: ModuleDiscoveryError extends RuntimeError
    - Write unit test: CompatibilityError extends RuntimeError
    - Implement `src/cli/errors/` error classes
    - _Requirements: 12.1_
  
  - [ ] 10.2 TDD: Implement error formatting
    - Write unit test: formats error with code, message, suggestion
    - Write unit test: includes stack trace when available
    - Implement `src/cli/io/formatError.ts`
    - _Requirements: 12.1, 12.3, 12.4_
  
  - [ ] 10.3 Add integration test for error scenarios
    - Test: Returns structured error when module-manager.json unreachable
    - Test: Returns structured error when no modules found
    - _Requirements: 14.7, 17.3_

- [ ] 11. Final integration testing and documentation
  - [ ] 11.1 Add integration test fixture for incompatible versions
    - Create `fixtures/project-with-incompatible-versions/`
    - Test: check-installation detects incompatibilities
    - _Requirements: 13.6, 17.2_
  
  - [ ] 11.2 Verify all integration tests pass
    - Run `make INTEGRATION_SCOPE=cli integration-test`
    - _Requirements: 17.7_
  
  - [ ] 11.3 Create README.md for packages/cli
    - Document CLI usage and commands
    - Document cli-api.json schema
    - _Requirements: 3.1.14_

- [ ] 12. Final checkpoint - Phase 1 complete
  - Ensure all tests pass
  - Ensure code compiles without errors
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The ATDD approach ensures integration tests drive the implementation
- All CLI output must be valid JSON (Design Invariant 8)
