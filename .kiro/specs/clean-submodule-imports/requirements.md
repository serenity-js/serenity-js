# Requirements Document

## Introduction

This document specifies the requirements for migrating all integration tests, example projects, and package source/spec files in the Serenity/JS monorepo from legacy `/lib/` deep import paths to clean submodule import paths. The ESM/CJS dual build migration (see `.kiro/specs/esm-cjs-dual-build/`) added conditional exports with clean submodule paths to all package.json files (e.g., `@serenity-js/core/events` instead of `@serenity-js/core/lib/events`). Currently, no integration tests, example projects, or cross-package imports use these clean paths. This migration updates all consumer code to use the clean paths, validating the conditional exports configuration and preparing for the eventual removal of wildcard `./lib/*` fallback exports.

## Glossary

- **Clean_Import_Path**: A submodule import path without `/lib/` or `/esm/` prefix (e.g., `@serenity-js/core/events`, `@serenity-js/playwright-test/events`)
- **Legacy_Deep_Import**: An existing import path using `/lib/` prefix (e.g., `@serenity-js/core/lib/events`, `@serenity-js/core/lib/events/index.js`)
- **Integration_Test**: A test under the `integration/` directory that exercises Serenity/JS against real test runners
- **Testing_Tools**: The shared test utilities package at `integration/testing-tools/` providing `PickEvent`, `EventRecorder`, `StdOutReporter`, `spawner`, and related helpers
- **Example_Project**: A project under the `examples/` directory demonstrating Serenity/JS usage
- **Package_Source**: Source code under `packages/*/src/` that imports from other `@serenity-js/*` packages using legacy `/lib/` paths instead of clean submodule paths
- **Package_Spec**: Unit test code under `packages/*/spec/` that imports from other `@serenity-js/*` packages using legacy `/lib/` paths
- **Submodule**: A subdirectory within a package's source that has its own `index.ts` barrel file and a corresponding conditional export entry
- **Wildcard_Export**: The `"./lib/*": "./lib/*"` entry in package.json exports that allows arbitrary deep imports into the `lib/` directory
- **Namespace_Import**: An import of the form `import * as events from '...'` that imports all exports as a single namespace object

## Requirements

### Requirement 1: Migrate Testing Tools Source Files

**User Story:** As a maintainer, I want the shared testing tools to use clean submodule import paths, so that the foundational test utilities validate the conditional exports and serve as a reference for other integration modules.

#### Acceptance Criteria

1. WHEN a Testing_Tools source file imports from `@serenity-js/core/lib/events`, `@serenity-js/core/lib/events/index.js`, or `@serenity-js/core/lib/events/index`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Testing_Tools source file imports from `@serenity-js/core/lib/model`, `@serenity-js/core/lib/model/index.js`, or `@serenity-js/core/lib/model/index`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Testing_Tools source file imports from `@serenity-js/core/lib/stage`, `@serenity-js/core/lib/stage/index.js`, or `@serenity-js/core/lib/stage/index`, THE Migration SHALL replace the import path with `@serenity-js/core/stage`
4. WHEN a Testing_Tools source file imports from `@serenity-js/core/lib/io`, `@serenity-js/core/lib/io/index.js`, or `@serenity-js/core/lib/io/index`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
5. WHEN the Testing_Tools package is compiled after migration, THE Build_System SHALL produce both `lib/` and `esm/` outputs without errors
6. WHEN the Testing_Tools unit tests are run after migration, THE Testing_Tools SHALL pass all tests

### Requirement 2: Migrate Cucumber Integration Tests

**User Story:** As a maintainer, I want the Cucumber integration test specs to use clean submodule import paths, so that the Cucumber adapter is validated against the clean exports.

#### Acceptance Criteria

1. WHEN a Cucumber integration test file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Cucumber integration test file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Cucumber integration test file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN the Cucumber integration tests are run after migration, THE Integration_Tests SHALL pass for all supported Cucumber versions

### Requirement 3: Migrate Jasmine Integration Tests

**User Story:** As a maintainer, I want the Jasmine integration test specs to use clean submodule import paths, so that the Jasmine adapter is validated against the clean exports.

#### Acceptance Criteria

1. WHEN a Jasmine integration test file (under `integration/jasmine/` or `integration/jasmine-5/`) imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Jasmine integration test file imports from `@serenity-js/core/lib/model` or `@serenity-js/core/lib/model/index.js`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Jasmine integration test file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN the Jasmine integration tests are run after migration, THE Integration_Tests SHALL pass for all Jasmine integration modules

### Requirement 4: Migrate Mocha Integration Tests

**User Story:** As a maintainer, I want the Mocha integration test specs to use clean submodule import paths, so that the Mocha adapter is validated against the clean exports.

#### Acceptance Criteria

1. WHEN a Mocha integration test file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Mocha integration test file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Mocha integration test file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN the Mocha integration tests are run after migration, THE Integration_Tests SHALL pass

### Requirement 5: Migrate Playwright Test Integration Tests

**User Story:** As a maintainer, I want the Playwright Test integration test specs to use clean submodule import paths, so that the Playwright Test adapter is validated against the clean exports.

#### Acceptance Criteria

1. WHEN a Playwright Test integration test file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Playwright Test integration test file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Playwright Test integration test file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN a Playwright Test integration test file imports from `@serenity-js/playwright-test/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/playwright-test/events`
5. WHEN the Playwright Test integration tests are run after migration, THE Integration_Tests SHALL pass

### Requirement 6: Migrate WebdriverIO Integration Tests

**User Story:** As a maintainer, I want the WebdriverIO integration test specs to use clean submodule import paths, so that the WebdriverIO adapter is validated against the clean exports.

#### Acceptance Criteria

1. WHEN a WebdriverIO integration test file (under `integration/webdriverio-*/` or `integration/webdriverio-8-*/`) imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a WebdriverIO integration test file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN the WebdriverIO integration tests are run after migration, THE Integration_Tests SHALL pass for all WebdriverIO integration modules

### Requirement 7: Migrate Protractor Integration Tests

**User Story:** As a maintainer, I want the Protractor integration test specs to use clean submodule import paths, so that the Protractor adapter tests are consistent with the rest of the codebase.

#### Acceptance Criteria

1. WHEN a Protractor integration test file (under `integration/protractor-jasmine/`, `integration/protractor-mocha/`, or `integration/protractor-cucumber/`) imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a Protractor integration test file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a Protractor integration test file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN the Protractor integration tests are run after migration, THE Integration_Tests SHALL pass for all Protractor integration modules

### Requirement 8: Migrate Example Projects

**User Story:** As a maintainer, I want the example projects to use clean submodule import paths, so that they demonstrate the recommended import style to Serenity/JS users.

#### Acceptance Criteria

1. WHEN an Example_Project source file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
2. WHEN the Example_Project is compiled after migration, THE Build_System SHALL produce output without errors
3. THE `examples/cucumber-domain-level-testing` project SHALL use Clean_Import_Paths in all source files

### Requirement 16: Migrate Web Specs Integration Tests

**User Story:** As a maintainer, I want the web-specs integration test files to use clean submodule import paths, so that the web testing components are validated against the clean exports.

#### Acceptance Criteria

1. WHEN a `integration/web-specs/spec/` file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a `integration/web-specs/spec/` file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
3. WHEN a `integration/web-specs/spec/` file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN a `integration/web-specs/spec/` file imports from `@serenity-js/core/lib/stage`, THE Migration SHALL replace the import path with `@serenity-js/core/stage`
5. WHEN the web-specs integration tests are run after migration, THE Integration_Tests SHALL pass

### Requirement 17: Migrate Legacy Cucumber Integration Tests (cucumber-1, cucumber-2)

**User Story:** As a maintainer, I want the legacy Cucumber integration test registration files to use clean module paths in their `--require` arguments, so that all Cucumber versions are consistent.

#### Acceptance Criteria

1. WHEN a `integration/cucumber-1/src/` or `integration/cucumber-2/src/` file contains a `--require` argument with `node_modules/@serenity-js/cucumber/lib/index.js`, THE Migration SHALL replace the path with `@serenity-js/cucumber`
2. WHEN the cucumber-1 and cucumber-2 integration tests are run after migration, THE Integration_Tests SHALL pass

### Requirement 9: Preserve Namespace Import Pattern

**User Story:** As a maintainer, I want namespace imports (`import * as events from '...'`) to continue working with clean submodule paths, so that code relying on dynamic event class lookup by name keeps functioning.

#### Acceptance Criteria

1. WHEN a source file uses a Namespace_Import from a Legacy_Deep_Import path (e.g., `import * as events from '@serenity-js/core/lib/events/index.js'`), THE Migration SHALL replace the path with the corresponding Clean_Import_Path (e.g., `@serenity-js/core/events`)
2. WHEN a Namespace_Import is used with a Clean_Import_Path, THE imported namespace object SHALL contain the same exported members as the Legacy_Deep_Import path
3. WHEN code accesses namespace members dynamically (e.g., `events[eventTypeName].fromJSON(data)`), THE dynamic access SHALL resolve correctly after migration

### Requirement 10: Compilation Verification

**User Story:** As a maintainer, I want to verify that all migrated code compiles successfully, so that the clean import paths resolve correctly in both ESM and CJS contexts.

#### Acceptance Criteria

1. WHEN all migrations are complete, THE Build_System SHALL compile all integration test modules without errors
2. WHEN all migrations are complete, THE Build_System SHALL compile all example projects without errors
3. WHEN all migrations are complete, THE Build_System SHALL compile the Testing_Tools package without errors producing both `lib/` and `esm/` outputs
4. WHEN all migrations are complete, THE Build_System SHALL compile the migrated packages (`rest`, `serenity-bdd`, `protractor`) without errors

### Requirement 11: Import Path Consistency

**User Story:** As a maintainer, I want all legacy `/lib/` submodule import path variants to be handled uniformly, so that no legacy import forms remain after migration.

#### Acceptance Criteria

1. THE Migration SHALL handle imports with no file extension (e.g., `@serenity-js/core/lib/events`)
2. THE Migration SHALL handle imports with `/index.js` suffix (e.g., `@serenity-js/core/lib/events/index.js`)
3. THE Migration SHALL handle imports with `/index` suffix (e.g., `@serenity-js/core/lib/events/index`)
4. WHEN the migration is complete, THE codebase SHALL contain zero Legacy_Deep_Import paths in `integration/` source files (excluding compiled `lib/` and `esm/` output directories)
5. WHEN the migration is complete, THE codebase SHALL contain zero Legacy_Deep_Import paths in `examples/` source files
6. WHEN the migration is complete, THE codebase SHALL contain zero Legacy_Deep_Import paths in `packages/*/src/` and `packages/*/spec/` files (excluding compiled `lib/` and `esm/` output directories)

### Requirement 12: Migrate packages/rest Source and Spec Files

**User Story:** As a maintainer, I want the `@serenity-js/rest` package source and spec files to use clean submodule import paths, so that cross-package imports are consistent and validate the conditional exports.

#### Acceptance Criteria

1. WHEN a `packages/rest/src/` file imports from `@serenity-js/core/lib/model`, `@serenity-js/core/lib/model/index.js`, or `@serenity-js/core/lib/model/index`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
2. WHEN a `packages/rest/src/` file imports from `@serenity-js/core/lib/io`, `@serenity-js/core/lib/io/index.js`, or `@serenity-js/core/lib/io/index`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
3. WHEN a `packages/rest/spec/` file imports from `@serenity-js/core/lib/events`, `@serenity-js/core/lib/events/index.js`, or `@serenity-js/core/lib/events/index`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
4. WHEN a `packages/rest/spec/` file imports from `@serenity-js/core/lib/model`, `@serenity-js/core/lib/model/index.js`, or `@serenity-js/core/lib/model/index`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
5. WHEN a `packages/rest/spec/` file imports from `@serenity-js/core/lib/io`, `@serenity-js/core/lib/io/index.js`, or `@serenity-js/core/lib/io/index`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
6. WHEN the `packages/rest` package is compiled after migration, THE Build_System SHALL produce output without errors
7. WHEN the `packages/rest` unit tests are run after migration, THE tests SHALL pass

### Requirement 13: Migrate packages/serenity-bdd Source and Spec Files

**User Story:** As a maintainer, I want the `@serenity-js/serenity-bdd` package source and spec files to use clean submodule import paths, so that the ~30+ files with legacy imports are modernised and validate the conditional exports.

#### Acceptance Criteria

1. WHEN a `packages/serenity-bdd/src/` file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
2. WHEN a `packages/serenity-bdd/src/` file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
3. WHEN a `packages/serenity-bdd/src/` file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
4. WHEN a `packages/serenity-bdd/spec/` file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
5. WHEN a `packages/serenity-bdd/spec/` file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
6. WHEN a `packages/serenity-bdd/spec/` file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
7. WHEN a `packages/serenity-bdd/spec/` file imports from `@serenity-js/core/lib/stage`, THE Migration SHALL replace the import path with `@serenity-js/core/stage`
8. WHEN the `packages/serenity-bdd` package is compiled after migration, THE Build_System SHALL produce output without errors
9. WHEN the `packages/serenity-bdd` unit tests are run after migration, THE tests SHALL pass

### Requirement 14: Migrate packages/protractor Source and Spec Files

**User Story:** As a maintainer, I want the `@serenity-js/protractor` package source and spec files to use clean submodule import paths, so that the legacy Protractor adapter is consistent with the rest of the codebase.

#### Acceptance Criteria

1. WHEN a `packages/protractor/src/` file imports from `@serenity-js/core/lib/adapter`, THE Migration SHALL replace the import path with `@serenity-js/core/adapter`
2. WHEN a `packages/protractor/src/` file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
3. WHEN a `packages/protractor/src/` file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
4. WHEN a `packages/protractor/src/` file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
5. WHEN a `packages/protractor/src/` file imports from `@serenity-js/core/lib/stage`, THE Migration SHALL replace the import path with `@serenity-js/core/stage`
6. WHEN a `packages/protractor/src/` file imports from `@serenity-js/web/lib/scripts`, THE Migration SHALL replace the import path with `@serenity-js/web/scripts`
7. WHEN a `packages/protractor/src/` file imports from `@serenity-js/cucumber/lib/adapter`, THE Migration SHALL replace the import path with `@serenity-js/cucumber/adapter`
8. WHEN a `packages/protractor/src/` file uses `this.moduleLoader.require('@serenity-js/mocha/lib/adapter')`, THE Migration SHALL replace the string with `@serenity-js/mocha/adapter`
9. WHEN a `packages/protractor/src/` file uses `this.moduleLoader.require('@serenity-js/cucumber/lib/adapter')`, THE Migration SHALL replace the string with `@serenity-js/cucumber/adapter`
10. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/core/lib/adapter`, THE Migration SHALL replace the import path with `@serenity-js/core/adapter`
11. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/core/lib/events`, THE Migration SHALL replace the import path with `@serenity-js/core/events`
12. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/core/lib/io`, THE Migration SHALL replace the import path with `@serenity-js/core/io`
13. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/core/lib/model`, THE Migration SHALL replace the import path with `@serenity-js/core/model`
14. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/cucumber/lib/adapter`, THE Migration SHALL replace the import path with `@serenity-js/cucumber/adapter`
15. WHEN a `packages/protractor/spec/` file imports from `@serenity-js/cucumber/lib/adapter/output`, THE Migration SHALL replace the import path with `@serenity-js/cucumber/adapter` (since the adapter barrel re-exports all output types)
16. WHEN a `packages/protractor/spec/` file uses `moduleLoader.require.withArgs('@serenity-js/mocha/lib/adapter')` or `moduleLoader.require.withArgs('@serenity-js/cucumber/lib/adapter')`, THE Migration SHALL replace the string arguments with the corresponding clean paths
17. WHEN the `packages/protractor` package is compiled after migration, THE Build_System SHALL produce output without errors
18. WHEN the `packages/protractor` unit tests are run after migration, THE tests SHALL pass

### Requirement 15: Extended Import Path Consistency

**User Story:** As a maintainer, I want all additional legacy `/lib/` import path patterns discovered in packages/ to be handled uniformly, so that the migration covers the full set of submodule paths.

#### Acceptance Criteria

1. THE Migration SHALL handle `@serenity-js/core/lib/adapter` → `@serenity-js/core/adapter`
2. THE Migration SHALL handle `@serenity-js/cucumber/lib/adapter` → `@serenity-js/cucumber/adapter`
3. THE Migration SHALL handle `@serenity-js/cucumber/lib/adapter/output` → `@serenity-js/cucumber/adapter` (output types are re-exported from the adapter barrel)
4. THE Migration SHALL handle `@serenity-js/mocha/lib/adapter` → `@serenity-js/mocha/adapter`
5. THE Migration SHALL handle `@serenity-js/web/lib/scripts` → `@serenity-js/web/scripts`
6. THE Migration SHALL handle dynamic `require()` string arguments containing legacy paths (e.g., `moduleLoader.require('@serenity-js/mocha/lib/adapter')`) in addition to static import statements
