# Requirements Document

## Introduction

This document specifies the requirements for migrating all Serenity/JS packages to produce dual ESM (ECMAScript Modules) and CommonJS builds. The migration enables modern ESM consumers to import packages natively while maintaining full backwards compatibility for existing CommonJS consumers. The approach follows the established pattern already implemented in `@serenity-js/webdriverio`, `@serenity-js/webdriverio-8`, and `@serenity-js/jasmine`.

## Glossary

- **Package**: A Serenity/JS module under `packages/` published to npm as `@serenity-js/*`
- **ESM_Build**: The ECMAScript Modules output compiled to the `esm/` directory using Node16 module resolution
- **CJS_Build**: The CommonJS output compiled to the `lib/` directory
- **Conditional_Exports**: Node.js package.json exports field that resolves to different files based on import style
- **Submodule**: A subdirectory within a package's source that has its own `index.ts` barrel file (e.g., `events`, `io`, `model`)
- **Clean_Import_Path**: A submodule import without `/lib/` or `/esm/` prefix (e.g., `@serenity-js/core/events`)
- **Legacy_Deep_Import**: An existing import path using `/lib/` prefix (e.g., `@serenity-js/core/lib/events`)
- **Migration_Wave**: A group of packages that can be migrated together based on dependency order
- **Build_System**: The compilation toolchain using TypeScript, pnpm, and npm scripts

## Requirements

### Requirement 1: ESM Build Output

**User Story:** As a developer using ESM, I want to import Serenity/JS packages using standard ES module syntax, so that I can use modern JavaScript features and tooling.

#### Acceptance Criteria

1. WHEN a Package is compiled, THE Build_System SHALL produce an ESM_Build in the `esm/` directory
2. WHEN the ESM_Build is produced, THE Build_System SHALL use TypeScript with `module: "Node16"` and `moduleResolution: "Node16"`
3. WHEN the ESM_Build is produced, THE Build_System SHALL generate `.d.ts` type declaration files alongside JavaScript files
4. WHEN an ESM consumer imports from a Package, THE Conditional_Exports SHALL resolve to the `esm/` directory files

### Requirement 2: CommonJS Build Output

**User Story:** As a developer using CommonJS, I want to require Serenity/JS packages using standard CommonJS syntax, so that my existing code continues to work without modification.

#### Acceptance Criteria

1. WHEN a Package is compiled, THE Build_System SHALL produce a CJS_Build in the `lib/` directory
2. WHEN the CJS_Build is produced, THE Build_System SHALL use TypeScript with `module: "CommonJS"` and `moduleResolution: "Node"`
3. WHEN the CJS_Build is produced, THE Build_System SHALL generate `.d.ts` type declaration files alongside JavaScript files
4. WHEN the CJS_Build is produced, THE Build_System SHALL create a `lib/package.json` file containing `{ "type": "commonjs" }`
5. WHEN a CommonJS consumer requires a Package, THE Conditional_Exports SHALL resolve to the `lib/` directory files

### Requirement 3: Package Configuration

**User Story:** As a package maintainer, I want each package to have proper dual-build configuration, so that both ESM and CommonJS consumers are supported correctly.

#### Acceptance Criteria

1. THE Package SHALL have `"type": "module"` in its package.json
2. THE Package SHALL have `"module": "./esm/index.js"` in its package.json for bundler compatibility
3. THE Package SHALL have Conditional_Exports for the main entry point with `types`, `import`, and `require` conditions
4. THE Package SHALL have a fallback path for older Node.js versions that don't support conditional exports
5. THE Package SHALL preserve existing `main` and `types` fields for backwards compatibility

### Requirement 4: Clean Submodule Imports

**User Story:** As a developer, I want to import submodules using clean paths like `@serenity-js/core/events`, so that my imports are concise and automatically resolve to the correct module format.

#### Acceptance Criteria

1. WHEN a Package has Submodules, THE Conditional_Exports SHALL include an entry for each Submodule
2. WHEN an ESM consumer imports from a Clean_Import_Path, THE Conditional_Exports SHALL resolve to the corresponding `esm/` file
3. WHEN a CommonJS consumer requires from a Clean_Import_Path, THE Conditional_Exports SHALL resolve to the corresponding `lib/` file
4. THE Conditional_Exports for each Submodule SHALL include `types`, `import`, and `require` conditions
5. THE Conditional_Exports for each Submodule SHALL include a fallback path for older Node.js versions

### Requirement 5: Backwards Compatible Deep Imports

**User Story:** As a developer with existing code using `/lib/` deep imports, I want my imports to continue working after migration, so that I don't need to update my codebase immediately.

#### Acceptance Criteria

1. THE Package SHALL have `"./lib/*": "./lib/*"` wildcard export for Legacy_Deep_Import compatibility
2. THE Package SHALL have `"./esm/*": "./esm/*"` wildcard export for explicit ESM deep imports
3. WHEN a consumer uses a Legacy_Deep_Import path, THE Conditional_Exports SHALL resolve to the corresponding `lib/` file
4. THE Package SHALL expose `"./package.json": "./package.json"` for package metadata access

### Requirement 6: TypeScript Configuration Files

**User Story:** As a package maintainer, I want separate TypeScript configuration files for ESM and CJS builds, so that each build uses the correct module settings.

#### Acceptance Criteria

1. THE Package SHALL have a `tsconfig-esm.build.json` file that extends the base build configuration
2. THE `tsconfig-esm.build.json` SHALL configure `module: "Node16"`, `moduleResolution: "Node16"`, and `outDir: "esm"`
3. THE Package SHALL have a `tsconfig-cjs.build.json` file that extends the base build configuration
4. THE `tsconfig-cjs.build.json` SHALL configure `module: "CommonJS"`, `moduleResolution: "Node"`, and `outDir: "lib"`
5. THE Package SHALL have a `tsconfig.json` file configured for IDE support with Node16 module resolution

### Requirement 7: Build Scripts

**User Story:** As a package maintainer, I want standardized build scripts for dual compilation, so that the build process is consistent across all packages.

#### Acceptance Criteria

1. THE Package SHALL have a `compile` script that orchestrates the full dual-build process
2. THE Package SHALL have a `compile:clean` script that removes both `lib/` and `esm/` directories
3. THE Package SHALL have a `compile:esm` script that compiles using `tsconfig-esm.build.json`
4. THE Package SHALL have a `compile:cjs` script that compiles using `tsconfig-cjs.build.json`
5. THE Package SHALL have a `compile:cjs-package` script that generates `lib/package.json`
6. WHEN the `compile` script runs, THE Build_System SHALL execute scripts in order: clean, esm, cjs, cjs-package

### Requirement 8: Migration Order

**User Story:** As a project maintainer, I want packages migrated in dependency order, so that each package can be tested against its already-migrated dependencies.

#### Acceptance Criteria

1. THE Migration SHALL proceed in waves based on the dependency graph
2. WHEN migrating a Package, THE Build_System SHALL verify all workspace dependencies are already migrated
3. THE `core` Package SHALL be migrated in Wave 1 as the foundation
4. THE `assertions`, `rest`, `cucumber`, `mocha`, `console-reporter`, and `local-server` Packages SHALL be migrated in Wave 2
5. THE `web` and `serenity-bdd` Packages SHALL be migrated in Wave 3
6. THE `playwright` and `protractor` Packages SHALL be migrated in Wave 4
7. THE `playwright-test` Package SHALL be migrated in Wave 5

### Requirement 9: Build Verification

**User Story:** As a package maintainer, I want to verify that both ESM and CJS builds work correctly, so that consumers can rely on the package regardless of their module system.

#### Acceptance Criteria

1. WHEN a Package is compiled, THE Build_System SHALL verify that `esm/index.js` exists
2. WHEN a Package is compiled, THE Build_System SHALL verify that `lib/index.js` exists
3. WHEN a Package is compiled, THE Build_System SHALL verify that `lib/package.json` exists with `type: "commonjs"`
4. WHEN a Migration_Wave is complete, THE Build_System SHALL run all unit tests to verify functionality
5. WHEN all Migration_Waves are complete, THE Build_System SHALL run integration tests to verify end-to-end functionality

### Requirement 10: Type Declaration Availability

**User Story:** As a TypeScript developer, I want type declarations available for both ESM and CJS imports, so that I get proper type checking regardless of my module system.

#### Acceptance Criteria

1. WHEN the ESM_Build is produced, THE Build_System SHALL generate `.d.ts` files in the `esm/` directory
2. WHEN the CJS_Build is produced, THE Build_System SHALL generate `.d.ts` files in the `lib/` directory
3. THE Conditional_Exports SHALL include `types` condition pointing to the correct `.d.ts` file for each entry point
4. WHEN a TypeScript consumer imports from a Package, THE type declarations SHALL be resolved correctly

### Requirement 11: Submodule Detection

**User Story:** As a package maintainer, I want submodules automatically detected from the source structure, so that I don't need to manually configure exports for each submodule.

#### Acceptance Criteria

1. WHEN configuring Conditional_Exports, THE Build_System SHALL detect Submodules by scanning for directories with `index.ts` files
2. THE `core` Package SHALL expose submodules: `adapter`, `config`, `errors`, `events`, `io`, `model`, `screenplay`, `stage`
3. THE `web` Package SHALL expose the `scripts` submodule
4. THE `cucumber`, `mocha`, `jasmine`, and `protractor` Packages SHALL expose the `adapter` submodule
5. IF a Package has no Submodules, THE Conditional_Exports SHALL only include the main entry point

### Requirement 12: Error Handling

**User Story:** As a package maintainer, I want clear error messages when migration issues occur, so that I can quickly identify and resolve problems.

#### Acceptance Criteria

1. IF a dependency Package is not migrated, THEN THE Build_System SHALL report an import resolution error during ESM compilation
2. IF the `lib/package.json` is missing, THEN THE CJS_Build SHALL fail to resolve in `type: module` packages
3. IF a Submodule `index.ts` is missing, THEN THE Conditional_Exports SHALL not include that submodule path
4. IF TypeScript compilation fails, THEN THE Build_System SHALL report the error and stop the build process
