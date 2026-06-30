# Serenity/JS Project Overview

Serenity/JS is a TypeScript-native acceptance and regression testing framework built on the Screenplay Pattern. It gives
test suites the architecture they need to scale — composable, maintainable, and expressive.

## Design Philosophy

### Screenplay Pattern as Architecture

The Screenplay Pattern is not merely a design pattern — it is the architectural backbone of Serenity/JS. Every design
decision flows from it:

- **Actors** represent people and external systems interacting with the system under test
- **Abilities** encapsulate the technical means to interact with system interfaces (dependency inversion)
- **Interactions** are single, focused actions (Single Responsibility Principle)
- **Tasks** compose interactions into business-meaningful workflows (Composite pattern)
- **Questions** retrieve information without side effects (Query/Command separation)

```
Actor
  ├── has Abilities (e.g., BrowseTheWeb, CallAnApi, TakeNotes)
  ├── performs Activities
  │     ├── Tasks (business-level, composed of other activities)
  │     └── Interactions (solution-level, single actions)
  └── answers Questions (retrieve state from the system)
```

### Domain-Driven Design

Serenity/JS applies DDD within its own codebase:

- **Ubiquitous Language** — the Screenplay Pattern vocabulary (Actor, Ability, Task, Interaction, Question, Stage, Cast)
  is used consistently across code, docs, tests, and conversations
- **Value Objects** — all model types (`Name`, `Description`, `CorrelationId`, `Timestamp`, `Duration`, `Path`,
  `Version`) are immutable, validated at construction via `tiny-types`, and never accept `null`/`undefined`
- **Domain Events** — the entire reporting system is event-driven; adapters emit `DomainEvent` instances (`SceneStarts`,
  `InteractionFinished`, `ArtifactGenerated`) that flow through the `StageManager`
- **Aggregates** — `Stage` owns actor lifecycle and event distribution; `Actor` owns its abilities
- **Bounded Contexts** — each `@serenity-js/*` package represents a bounded context with explicit public API boundaries

### Composition Over Inheritance

- Tasks compose Activities (not extend them)
- PageElements compose via `.of()` (meta-questions, not deep class hierarchies)
- Expectations compose via `and()`, `or()`, `not()` (algebraic composition)
- Abilities are composed onto Actors via `.whoCan()` (delegation, not inheritance)
- The only meaningful inheritance: abstract classes that define contracts (`BrowseTheWeb` →
  `BrowseTheWebWithPlaywright`)

### SOLID in Practice

| Principle                     | How Serenity/JS applies it                                                                            |
|-------------------------------|-------------------------------------------------------------------------------------------------------|
| **S** — Single Responsibility | Each Interaction does one thing. Each Question retrieves one thing.                                   |
| **O** — Open/Closed           | New behaviours are added by composing new Tasks from existing Interactions, not modifying them.       |
| **L** — Liskov Substitution   | Any `BrowseTheWeb` implementation (Playwright, WebdriverIO) is substitutable without test changes.    |
| **I** — Interface Segregation | Actors compose fine-grained capabilities (`AnswersQuestions`, `UsesAbilities`, `PerformsActivities`). |
| **D** — Dependency Inversion  | Tests depend on abstractions (`@serenity-js/web`), not concretions (`@serenity-js/playwright`).       |

## Monorepo Structure

pnpm + Lerna + Nx monorepo:

- `packages/` — Core modules published to npm as `@serenity-js/*`
- `integration/` — Integration tests for test runner and browser combinations
- `examples/` — Example projects demonstrating usage

### Core Packages

| Package                         | Bounded Context                                                      |
|---------------------------------|----------------------------------------------------------------------|
| `@serenity-js/core`             | Screenplay Pattern foundation: Actor, Stage, Domain Events, time, IO |
| `@serenity-js/web`              | Abstract web testing: PageElement, PEQL, BrowseTheWeb contract       |
| `@serenity-js/assertions`       | Expectation algebra: `Ensure`, `equals`, `includes`, `contain`       |
| `@serenity-js/rest`             | HTTP API interactions: `CallAnApi`, `Send`, `LastResponse`           |
| `@serenity-js/playwright`       | Playwright ability implementation                                    |
| `@serenity-js/playwright-test`  | Playwright Test runner adapter                                       |
| `@serenity-js/webdriverio`      | WebdriverIO v9+ ability implementation                               |
| `@serenity-js/webdriverio-8`    | WebdriverIO v8 ability implementation (legacy)                       |
| `@serenity-js/protractor`       | Protractor ability implementation (legacy)                           |
| `@serenity-js/cucumber`         | Cucumber.js test runner adapter                                      |
| `@serenity-js/mocha`            | Mocha test runner adapter                                            |
| `@serenity-js/jasmine`          | Jasmine test runner adapter                                          |
| `@serenity-js/serenity-bdd`     | Serenity BDD reporting integration                                   |
| `@serenity-js/console-reporter` | Console output reporter                                              |
| `@serenity-js/local-server`     | Local HTTP server ability for testing                                |

### Package Boundaries

Each package has a single `src/index.ts` that defines its public API. Internal code is marked `@package`. Cross-package
dependencies follow the dependency rule: abstractions never depend on concretions.

```
@serenity-js/core           ← foundation, no Serenity/JS dependencies
@serenity-js/web            ← depends on core only
@serenity-js/assertions     ← depends on core only
@serenity-js/playwright     ← depends on core + web
@serenity-js/playwright-test ← depends on core + web + playwright
```

## Technology Stack

- **Language**: TypeScript (ES2023 target, CommonJS modules)
- **Package Manager**: pnpm (v10.26.0+)
- **Monorepo Orchestration**: Lerna + Nx
- **Unit Testing**: Mocha + Chai + Sinon
- **Parameterised Tests**: mocha-testdata
- **Coverage**: c8
- **Linting**: ESLint with TypeScript, Unicorn, simple-import-sort, and Mocha plugins
- **Value Objects**: tiny-types
- **Node.js**: ^20 || ^22 || ^24

## Build Commands

```bash
make install                                    # Install deps + browsers
make compile                                    # Compile all packages
make COMPILE_SCOPE=libs compile                 # Compile library packages only
make test                                       # Unit tests with coverage
make test-no-coverage                           # Unit tests without coverage
make INTEGRATION_SCOPE=playwright-test integration-test  # Specific integration suite
make lint                                       # ESLint
make clean                                      # Remove build artifacts
make cc                                         # Clear Nx cache
```

## Package Layout

```
packages/<name>/
├── src/                # Source code
│   └── index.ts        # Public API (barrel exports)
├── spec/               # Unit tests (*.spec.ts)
├── lib/                # Compiled output (gitignored)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── CHANGELOG.md
└── README.md
```

## Versioning

All packages share the same version (currently 3.x). Semantic versioning is driven by conventional commits. Automated
releases via Lerna on the `main` branch.
