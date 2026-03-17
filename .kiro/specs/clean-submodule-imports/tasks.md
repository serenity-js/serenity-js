# Implementation Plan: Clean Submodule Imports Migration

## Overview

Migrate all `@serenity-js/*/lib/<submodule>` import paths to clean `@serenity-js/*/<submodule>` paths across integration tests, examples, and package source/spec files. The migration proceeds in dependency order: foundational testing tools first, then integration specs, examples, and finally cross-package imports in `packages/`. Each group is followed by a compilation checkpoint.

## Status Update

**UNBLOCKED**: The migration can proceed using TypeScript `paths` mapping in `tsconfig.build.json`.

**Solution**: Added `paths` mappings to `tsconfig.build.json` that map clean import paths (e.g., `@serenity-js/core/events`) to the compiled `.d.ts` files (e.g., `packages/core/lib/events/index.d.ts`). This allows:
1. TypeScript to resolve types correctly during CJS compilation (using `moduleResolution: "Node"`)
2. The clean import paths to be preserved in the output
3. Node.js to resolve the clean paths at runtime via the `exports` field in package.json

**Current Configuration**:
- ESM builds: `module: "Node20"`, `moduleResolution: "Node16"` ✓ (supports clean imports natively)
- CJS builds: `module: "CommonJS"`, `moduleResolution: "Node"` + `paths` mapping ✓ (supports clean imports via paths)
- Base config: `module: "Node20"`, `moduleResolution: "Node16"` (for IDE/type checking)

**Completed Work**:
- Task 1: ✓ Completed - testing-tools source files migrated to clean imports
- Task 2: ✓ Verified - compilation works with paths mapping
- Added `paths` mappings to `tsconfig.build.json` for all submodule imports

## Tasks

- [x] 1. Migrate integration/testing-tools source files
  - [x] 1.1 Update all import paths in `integration/testing-tools/src/`
    - Migrated to clean imports: `@serenity-js/core/events`, `@serenity-js/core/model`, `@serenity-js/core/stage`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 11.1, 11.2, 11.3_

- [x] 2. Checkpoint — Verify testing-tools compilation
  - Compile `integration/testing-tools` and ensure both `lib/` and `esm/` outputs are produced without errors. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.5, 1.6, 10.3_

- [x] 3. Migrate integration test specs
  - [x] 3.1 Update imports in `integration/cucumber-specs/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model`, `core/lib/io` imports with clean paths in `src/index.ts` and all `spec/*.spec.ts` files
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Update imports in `integration/jasmine/` and `integration/jasmine-5/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model`, `core/lib/model/index.js`, `core/lib/io` imports with clean paths in all spec files
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.3 Update imports in `integration/mocha/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model` imports with clean paths in all spec files
    - _Requirements: 4.1, 4.2_

  - [x] 3.4 Update imports in `integration/playwright-test/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model`, `core/lib/io` imports with clean paths in all `spec/*.spec.ts` and `spec/outcomes/*.spec.ts` files
    - Replace `@serenity-js/playwright-test/lib/events` → `@serenity-js/playwright-test/events`
    - Replace legacy import in `examples/screenplay/native-page.spec.ts`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.5 Update imports in `integration/webdriverio-*/` and `integration/webdriverio-8-*/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model` imports with clean paths in all spec files across jasmine, mocha, and cucumber variants
    - _Requirements: 6.1, 6.2_

  - [x] 3.6 Update imports in `integration/protractor-jasmine/`, `integration/protractor-mocha/`, and `integration/protractor-cucumber/`
    - Replace legacy `@serenity-js/core/lib/events`, `core/lib/model`, `core/lib/io` imports with clean paths in all spec files
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. Checkpoint — Verify integration test specs compilation
  - Compile all integration test modules and ensure no errors. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.4, 3.4, 4.3, 5.5, 6.3, 7.4, 10.1_

- [-] 5. Migrate example projects
  - [x] 5.1 Update imports in `examples/cucumber-domain-level-testing/`
    - Replace `@serenity-js/core/lib/model` → `@serenity-js/core/model` in `features/support/screenplay/interactions/EnterOperand.ts` and `UseOperator.ts`
    - _Requirements: 8.1, 8.3_

- [x] 6. Checkpoint — Verify examples compilation
  - Compile `examples/cucumber-domain-level-testing` and ensure no errors. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 8.2, 10.2_

- [x] 7. Migrate packages/rest source and spec files
  - [x] 7.1 Update imports in `packages/rest/src/`
    - Replace `@serenity-js/core/lib/model/index.js` → `@serenity-js/core/model` in `screenplay/interactions/Send.ts` (both type-only and named imports)
    - Replace `@serenity-js/core/lib/io/index.js` → `@serenity-js/core/io` in `screenplay/models/HTTPRequest.ts`
    - _Requirements: 12.1, 12.2_

  - [x] 7.2 Update imports in `packages/rest/spec/`
    - Replace `@serenity-js/core/lib/events/index.js` → `@serenity-js/core/events`, `core/lib/io/index.js` → `core/io`, `core/lib/model/index.js` → `core/model` in `screenplay/interactions/Send.spec.ts`
    - _Requirements: 12.3, 12.4, 12.5_

- [x] 8. Checkpoint — Verify packages/rest compilation and tests
  - Compile `packages/rest` and run `cd packages/rest && pnpm test`. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 12.6, 12.7, 10.4_

- [x] 9. Migrate packages/serenity-bdd source and spec files
  - [x] 9.1 Update imports in `packages/serenity-bdd/src/cli/`
    - Replace `@serenity-js/core/lib/io` → `@serenity-js/core/io` in `commands/run.ts`, `commands/update.ts`, `model/GAV.ts`, `stage/RunCommandActors.ts`, `stage/UpdateCommandActors.ts`, `screenplay/abilities/UseFileSystem.ts`, `screenplay/interactions/Spawn.ts`, `screenplay/interactions/StreamResponse.ts`, `screenplay/interactions/CreateDirectory.ts`, `screenplay/interactions/RenameFile.ts`, `screenplay/questions/JavaExecutable.ts`, `screenplay/questions/Checksum.ts`, `screenplay/questions/FileExists.ts`, `screenplay/tasks/VerifyChecksum.ts`, `screenplay/tasks/InvokeSerenityBDD.ts`, `screenplay/tasks/DownloadArtifact.ts`
    - Replace `@serenity-js/core/lib/model` → `@serenity-js/core/model` in `model/Notification.ts`, `model/Complaint.ts`, `model/DownloadProgressReport.ts`
    - Replace `@serenity-js/core/lib/events` → `@serenity-js/core/events` in `stage/NotificationReporter.ts`, `stage/ProgressReporter.ts`
    - Preserve both type-only and named import styles
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 9.2 Update imports in `packages/serenity-bdd/src/stage/crew/serenity-bdd-reporter/`
    - Replace `@serenity-js/core/lib/events` → `@serenity-js/core/events`, `core/lib/io` → `core/io`, `core/lib/model` → `core/model` in `SerenityBDDReporter.ts` and all files under `processors/`
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 9.3 Update imports in `packages/serenity-bdd/spec/`
    - Replace `@serenity-js/core/lib/events` → `@serenity-js/core/events`, `core/lib/io` → `core/io`, `core/lib/model` → `core/model`, `core/lib/stage` → `core/stage` in `index.spec.ts`, `cli/model/GAV.spec.ts`, `stage/crew/samples.ts`, `stage/crew/serenity-bdd-reporter/create.ts`, `stage/crew/serenity-bdd-reporter/SerenityBDDReporter.spec.ts`, all `SerenityBDDReporter/*.spec.ts`, all `snapshots/*.spec.ts`, and `processors/mappers/errorReportFrom.spec.ts`
    - _Requirements: 13.4, 13.5, 13.6, 13.7_

- [x] 10. Checkpoint — Verify packages/serenity-bdd compilation and tests
  - Compile `packages/serenity-bdd` and run `cd packages/serenity-bdd && pnpm test`. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 13.8, 13.9, 10.4_

- [x] 11. Migrate packages/protractor source and spec files
  - [x] 11.1 Update static imports in `packages/protractor/src/`
    - Replace `@serenity-js/core/lib/adapter` → `@serenity-js/core/adapter` in `adapter/runner/TestRunnerDetector.ts`, `adapter/runner/TestRunnerLoader.ts`
    - Replace `@serenity-js/core/lib/events` → `@serenity-js/core/events` in `adapter/reporter/ProtractorReporter.ts`, `adapter/browser-detector/BrowserDetector.ts`
    - Replace `@serenity-js/core/lib/io` → `@serenity-js/core/io` in `adapter/run.ts`, `adapter/runner/TestRunnerLoader.ts`
    - Replace `@serenity-js/core/lib/model` → `@serenity-js/core/model` in `adapter/reporter/ProtractorReporter.ts`, `adapter/browser-detector/BrowserDetector.ts`, `screenplay/models/ProtractorBrowsingSession.ts`, `screenplay/models/ProtractorPage.ts`
    - Replace `@serenity-js/core/lib/stage` → `@serenity-js/core/stage` in `adapter/reporter/ProtractorReporter.ts`, `adapter/browser-detector/BrowserDetector.ts`
    - Replace `@serenity-js/web/lib/scripts` → `@serenity-js/web/scripts` in `screenplay/models/ProtractorPage.ts`, `screenplay/models/ProtractorPageElement.ts` (namespace imports)
    - Replace `@serenity-js/cucumber/lib/adapter` → `@serenity-js/cucumber/adapter` in `adapter/runner/TestRunnerLoader.ts`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 15.2, 15.5_

  - [x] 11.2 Update dynamic require strings in `packages/protractor/src/`
    - Replace `this.moduleLoader.require('@serenity-js/mocha/lib/adapter')` → `this.moduleLoader.require('@serenity-js/mocha/adapter')` in `adapter/runner/TestRunnerLoader.ts`
    - Replace `this.moduleLoader.require('@serenity-js/cucumber/lib/adapter')` → `this.moduleLoader.require('@serenity-js/cucumber/adapter')` in `adapter/runner/TestRunnerLoader.ts`
    - _Requirements: 14.8, 14.9, 15.4, 15.6_

  - [x] 11.3 Update imports in `packages/protractor/spec/`
    - Replace `@serenity-js/core/lib/adapter` → `@serenity-js/core/adapter`, `core/lib/events` → `core/events`, `core/lib/io` → `core/io`, `core/lib/model` → `core/model`, `core/lib/stage` → `core/stage` in `adapter/ProtractorFrameworkAdapter.spec.ts`
    - Replace `@serenity-js/core/lib/io` → `@serenity-js/core/io`, `@serenity-js/cucumber/lib/adapter` → `@serenity-js/cucumber/adapter`, `@serenity-js/cucumber/lib/adapter/output` → `@serenity-js/cucumber/adapter` in `adapter/runner/TestRunnerLoader.spec.ts`
    - Replace `@serenity-js/cucumber/lib/adapter` → `@serenity-js/cucumber/adapter` in `adapter/runner/TestRunnerDetector.spec.ts`
    - Replace legacy imports in `adapter/reporter/ProtractorReporter.spec.ts`
    - _Requirements: 14.10, 14.11, 14.12, 14.13, 14.14, 14.15, 15.1, 15.3_

  - [x] 11.4 Update dynamic require string arguments in `packages/protractor/spec/`
    - Replace `moduleLoader.require.withArgs('@serenity-js/mocha/lib/adapter')` → `moduleLoader.require.withArgs('@serenity-js/mocha/adapter')` in `adapter/runner/TestRunnerLoader.spec.ts`
    - Replace `moduleLoader.require.withArgs('@serenity-js/cucumber/lib/adapter')` → `moduleLoader.require.withArgs('@serenity-js/cucumber/adapter')` in `adapter/runner/TestRunnerLoader.spec.ts`
    - _Requirements: 14.16, 15.6_

- [x] 12. Checkpoint — Verify packages/protractor compilation and tests
  - Compile `packages/protractor` and run `cd packages/protractor && pnpm test`. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 14.17, 14.18, 10.4_

- [x] 13. Final verification — grep for remaining legacy imports
  - Run `grep -r "@serenity-js/[^/]*/lib/" integration/ examples/ packages/*/src/ packages/*/spec/ --include="*.ts" -l` excluding `node_modules/`, `lib/`, and `esm/` directories
  - Confirm zero results — no legacy `@serenity-js/*/lib/` import paths remain in any source or spec file
  - _Requirements: 11.4, 11.5, 11.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- This migration is purely mechanical — only import path strings change, no logic or API changes
- Namespace imports (`import * as events`) must be preserved as-is, only the path changes
- Dynamic `require()` string arguments in protractor must be updated alongside static imports
