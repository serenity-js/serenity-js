# Serenity/JS Project Overview

Serenity/JS is an innovative acceptance and regression testing framework implementing the Screenplay Pattern. This
document provides essential context for working with the codebase.

## Architecture

### Monorepo Structure

This is a pnpm + Lerna + Nx monorepo with three main directories:

- `packages/` - Core Serenity/JS modules published to npm as `@serenity-js/*`
- `integration/` - Integration tests for different test runner combinations
- `examples/` - Example projects demonstrating Serenity/JS usage

### Core Packages

| Package                         | Purpose                                                                    |
|---------------------------------|----------------------------------------------------------------------------|
| `@serenity-js/core`             | Screenplay Pattern foundation: Actor, Task, Interaction, Question, Ability |
| `@serenity-js/web`              | Web testing abstractions: PageElement, BrowseTheWeb, Click, Enter          |
| `@serenity-js/assertions`       | Assertion library with Ensure and expectation functions                    |
| `@serenity-js/rest`             | REST API testing with CallAnApi ability                                    |
| `@serenity-js/playwright`       | Playwright integration                                                     |
| `@serenity-js/playwright-test`  | Playwright Test runner adapter                                             |
| `@serenity-js/webdriverio`      | WebdriverIO v9+ integration                                                |
| `@serenity-js/webdriverio-8`    | WebdriverIO v8 integration (legacy)                                        |
| `@serenity-js/protractor`       | Protractor integration (legacy)                                            |
| `@serenity-js/cucumber`         | Cucumber.js adapter                                                        |
| `@serenity-js/mocha`            | Mocha adapter                                                              |
| `@serenity-js/jasmine`          | Jasmine adapter                                                            |
| `@serenity-js/serenity-bdd`     | Serenity BDD reporting integration                                         |
| `@serenity-js/console-reporter` | Console output reporter                                                    |
| `@serenity-js/local-server`     | Local HTTP server for testing                                              |

### The Screenplay Pattern

The core abstraction follows this hierarchy:

```
Actor
  ├── has Abilities (e.g., BrowseTheWeb, CallAnApi)
  ├── performs Activities
  │     ├── Tasks (high-level, composed of other activities)
  │     └── Interactions (low-level, single actions)
  └── answers Questions (retrieve information from the system)
```

Key classes in `@serenity-js/core`:

- `Actor` - Represents a user or system interacting with the SUT
- `Ability` - Enables actors to interact with interfaces (abstract base)
- `Task` - Composed sequence of activities with business meaning
- `Interaction` - Single low-level action
- `Question` - Retrieves information, can be composed and mapped

## Technology Stack

- **Language**: TypeScript (ES2023 target)
- **Package Manager**: pnpm (v10.26.0+)
- **Monorepo Tools**: Lerna + Nx for task orchestration
- **Test Framework**: Mocha with Chai assertions
- **Coverage**: c8
- **Linting**: ESLint with TypeScript, Unicorn, and Mocha plugins
- **Node.js**: ^20 || ^22 || ^24

## Build Commands

```bash
# Install dependencies
make install

# Compile all packages
make compile

# Compile only library packages (faster)
make COMPILE_SCOPE=libs compile

# Run unit tests
make test

# Run integration tests
make INTEGRATION_SCOPE=playwright-test integration-test

# Lint code
make lint

# Clean build artifacts
make clean

# Clear Nx cache
make cc
```

## Package Structure

Each package follows this structure:

```
packages/<name>/
├── src/           # Source code
│   └── index.ts   # Public API exports
├── spec/          # Unit tests (*.spec.ts)
├── lib/           # Compiled output (gitignored)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── CHANGELOG.md
└── README.md
```

## Versioning

- All packages share the same version (currently 3.x)
- Semantic versioning with conventional commits
- Automated releases via Lerna on main branch
