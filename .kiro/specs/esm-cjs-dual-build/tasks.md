# Implementation Plan: ESM/CJS Dual Build Migration

## Overview

This plan migrates all 12 Serenity/JS packages to produce dual ESM and CommonJS builds, following the established pattern in `@serenity-js/webdriverio`, `@serenity-js/webdriverio-8`, and `@serenity-js/jasmine`. Migration proceeds in 5 waves based on dependency order.

## Tasks

- [x] 1. Wave 1: Migrate @serenity-js/core (Foundation)
  - [x] 1.1 Create tsconfig-esm.build.json for core package
    - Configure `module: "Node16"`, `moduleResolution: "Node16"`, `outDir: "esm"`
    - Extend `../../tsconfig.build.json`
    - _Requirements: 6.1, 6.2_
  
  - [x] 1.2 Create tsconfig-cjs.build.json for core package
    - Configure `module: "CommonJS"`, `moduleResolution: "Node"`, `outDir: "lib"`
    - Extend `../../tsconfig.build.json`
    - _Requirements: 6.3, 6.4_
  
  - [x] 1.3 Update tsconfig.json for IDE support
    - Configure `module: "Node16"`, `moduleResolution: "Node16"`, `esModuleInterop: true`
    - _Requirements: 6.5_
  
  - [x] 1.4 Update package.json with dual-build configuration
    - Add `"type": "module"` and `"module": "./esm/index.js"`
    - Add conditional exports for main entry point with `types`, `import`, `require` conditions
    - Add submodule exports: `adapter`, `config`, `errors`, `events`, `io`, `model`, `screenplay`, `stage`
    - Add wildcard exports `"./lib/*"` and `"./esm/*"` for backwards compatibility
    - Add `"./package.json": "./package.json"`
    - Preserve existing `main` and `types` fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 11.2_
  
  - [x] 1.5 Update build scripts in package.json
    - Add `compile:clean`, `compile:esm`, `compile:cjs`, `compile:cjs-package` scripts
    - Update `compile` script to orchestrate all steps in order
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 1.6 Verify core package build
    - Run `pnpm compile` and verify `esm/index.js`, `lib/index.js`, `lib/package.json` exist
    - Run `pnpm test` to verify unit tests pass
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Checkpoint - Wave 1 Complete
  - Ensure core package compiles and all tests pass, ask the user if questions arise.

- [ ] 3. Wave 2: Migrate core-dependent packages
  - [ ] 3.1 Migrate @serenity-js/assertions
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 3.2 Migrate @serenity-js/rest
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 3.3 Migrate @serenity-js/cucumber
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config
    - Add submodule export for `adapter`
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.4_
  
  - [ ] 3.4 Migrate @serenity-js/mocha
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config
    - Add submodule export for `adapter`
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.4_
  
  - [ ] 3.5 Migrate @serenity-js/console-reporter
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 3.6 Migrate @serenity-js/local-server
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 3.7 Verify Wave 2 packages build
    - Run `make COMPILE_SCOPE=libs compile` to compile all packages
    - Run `make test` to verify all unit tests pass
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 4. Checkpoint - Wave 2 Complete
  - Ensure all Wave 2 packages compile and tests pass, ask the user if questions arise.

- [ ] 5. Wave 3: Migrate web and serenity-bdd packages
  - [ ] 5.1 Migrate @serenity-js/web
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config
    - Add submodule export for `scripts`
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.3_
  
  - [ ] 5.2 Migrate @serenity-js/serenity-bdd
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Ensure bin script continues to work
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 5.3 Verify Wave 3 packages build
    - Run `make COMPILE_SCOPE=libs compile` to compile all packages
    - Run `make test` to verify all unit tests pass
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 6. Checkpoint - Wave 3 Complete
  - Ensure all Wave 3 packages compile and tests pass, ask the user if questions arise.

- [ ] 7. Wave 4: Migrate browser adapter packages
  - [ ] 7.1 Migrate @serenity-js/playwright
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.5_
  
  - [ ] 7.2 Migrate @serenity-js/protractor
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config
    - Add submodule export for `adapter`
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 11.4_
  
  - [ ] 7.3 Verify Wave 4 packages build
    - Run `make COMPILE_SCOPE=libs compile` to compile all packages
    - Run `make test` to verify all unit tests pass
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 8. Checkpoint - Wave 4 Complete
  - Ensure all Wave 4 packages compile and tests pass, ask the user if questions arise.

- [ ] 9. Wave 5: Migrate playwright-test package
  - [ ] 9.1 Migrate @serenity-js/playwright-test
    - Create `tsconfig-esm.build.json` and `tsconfig-cjs.build.json`
    - Update `tsconfig.json` for IDE support
    - Update `package.json` with dual-build config (no submodules)
    - Update build scripts
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 5.1-5.4, 6.1-6.5, 7.1-7.6, 8.7, 11.5_
  
  - [ ] 9.2 Verify Wave 5 package build
    - Run `make COMPILE_SCOPE=libs compile` to compile all packages
    - Run `make test` to verify all unit tests pass
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 10. Final Verification
  - [ ] 10.1 Run full compilation
    - Run `make clean` followed by `make COMPILE_SCOPE=libs compile`
    - Verify all 12 packages produce both `esm/` and `lib/` directories
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 10.2 Run all unit tests
    - Run `make test` to verify all unit tests pass
    - _Requirements: 9.4_
  
  - [ ] 10.3 Run integration tests
    - Run `make INTEGRATION_SCOPE=playwright-test integration-test`
    - Run `make INTEGRATION_SCOPE=cucumber-all integration-test`
    - _Requirements: 9.5_

- [ ] 11. Final Checkpoint
  - Ensure all tests pass and migration is complete, ask the user if questions arise.

## Notes

- Reference implementations: `packages/webdriverio`, `packages/webdriverio-8`, `packages/jasmine`
- Each package's submodule exports are determined by directories containing `index.ts` in `src/`
- The `lib/package.json` with `{ "type": "commonjs" }` is critical for CJS resolution in `type: module` packages
- Wildcard exports (`./lib/*`, `./esm/*`) preserve backwards compatibility for existing deep imports
