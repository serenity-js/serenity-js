# Serenity/JS

Serenity/JS is a TypeScript acceptance and regression testing framework built on the Screenplay Pattern.
This is its monorepo: the `@serenity-js/*` packages, their integration tests and example projects.
These instructions are for agents and contributors changing the framework. How to contribute in general is in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Repository structure

| Directory | Holds |
|---|---|
| `packages/<name>/` | The `@serenity-js/<name>` packages: `src/` (public API in `src/index.ts`), `spec/` (unit tests) |
| `integration/` | Integration tests for each test runner and browser integration; `web-specs/` holds the shared web specs |
| `examples/` | Example projects |
| `docs/agents/` | Detailed guidance for agents, linked below |
| `.agents/contributing-skills/` | Contributor skills, linked into your agent's skill directory by `pnpm install` |
| `bin/` | Repository tools |

It's a pnpm workspace orchestrated by Lerna and Nx. Packages depend on abstractions, never on concretions:
`core` depends on no other Serenity/JS package, `web` and `assertions` depend on `core` only, and the browser
integrations depend on `core` and `web`. All packages share one version, released from `main`.

## Commands

```bash
make install                                     # Install dependencies; pnpm install then links the agent skills
make setup                                       # Install browsers (once, and after Playwright or Chrome updates)
make COMPILE_SCOPE=libs compile                  # Compile the library packages
make test                                        # Unit tests of every package, with coverage
pnpm test                                        # In packages/<name>: that package's unit tests
make INTEGRATION_SCOPE=<module> integration-test # One integration suite, e.g. playwright-web, cucumber-1
make lint                                        # ESLint, including the links in the agent guidance
make cc                                          # Clear the Nx cache when the build behaves strangely
```

`INTEGRATION_SCOPE` takes any `integration-test:<module>` script in `package.json`. During development, run single
spec files with `npx mocha 'spec/one.spec.ts'` in the package; before you commit, always use the scripts above.

## Workflow

1. **Start from behaviour.** Write a failing spec in `packages/<name>/spec/` that describes what the system should
   do, and run it to see it fail. A bug fix starts with a spec that reproduces the bug.
2. **Implement the minimum** that makes it pass, then refactor while it stays green.
3. **Verify** with the package's `pnpm test`, `make COMPILE_SCOPE=libs compile`, `npx eslint <changed files>` and
   the integration suites your change can affect.
4. **Commit** with Conventional Commits and a scope from `.cz-allowed-scopes.js`.

When the requirements are unclear, ask before writing tests. Don't try variations until something compiles, and
don't silence errors you don't understand with casts or try/catch.

## Rules that always apply

- **Never write production code without a failing test that needs it.** Tests describe behaviour, not implementation.
- **Test failures are yours.** `main` is always green, so don't dismiss a failure as pre-existing. Trace it to its cause.
- **Don't report work as done without verifying it.** If you can't verify something, say so.
- **Keep public APIs backwards compatible.** Add, don't remove: deprecate instead, and give new parameters defaults. Never add `BREAKING CHANGE` or `!` to a
  commit without the maintainers' approval: it triggers a major release of every package.
- **Use the right commit type.** `feat` and `fix` release the packages. Changes only to `spec/`, `integration/`,
  `examples/`, `docs/agents/` or `.agents/` are `test` or `docs`. Skills in `packages/<package>/skills/` are part
  of the package's public API: a new skill is `feat(<package>)`, a change to one is `fix(<package>)`.
- **Follow the Screenplay Pattern** in the framework's own code and tests: Actors use Abilities to perform
  Interactions and Tasks, and answer Questions. Compose; don't inherit, except from abstract contracts.
- **Model with value objects.** Domain types are immutable `tiny-types`, validated when they're created, and never
  `null` or `undefined`.
- **Changing a public API means updating the documentation that describes it,** including the skills a package ships.
- **Record what you learn.** When something non-obvious costs you time, add it to the gotchas of the skill or
  document for that area, in the same pull request. See [Capturing what you learn](docs/agents/maintaining-agent-guidance.md#capturing-what-you-learn).

## Guidance to read before you start

Read the documents that match your task. They're not loaded automatically.

| Read | When you're |
|---|---|
| [docs/agents/project-overview.md](docs/agents/project-overview.md) | New to the codebase: design philosophy, packages and their boundaries, tech stack |
| [docs/agents/development-workflow.md](docs/agents/development-workflow.md) | Making any change: BDD and TDD cycle, engineering principles, verification, pre-commit checklist |
| [docs/agents/coding-standards.md](docs/agents/coding-standards.md) | Writing production code: value objects, style, errors, JSDoc, exports, backwards compatibility, types |
| [docs/agents/testing-patterns.md](docs/agents/testing-patterns.md) | Writing unit or integration tests: structure, parameterised tests, Sinon, testing Screenplay components |
| [docs/agents/commit-conventions.md](docs/agents/commit-conventions.md) | Committing: types, scopes, breaking changes, the release process |
| [docs/agents/screenplay-pattern.md](docs/agents/screenplay-pattern.md) | Implementing Abilities, Interactions, Tasks or Questions |
| [docs/agents/idiomatic-screenplay-tests.md](docs/agents/idiomatic-screenplay-tests.md) | Writing tests with Serenity/JS, or interaction objects: PEQL idioms and anti-patterns |
| [docs/agents/web-testing.md](docs/agents/web-testing.md) | Working with `@serenity-js/web`: PEQL, web interactions, questions and expectations, what retries |
| [docs/agents/maintaining-agent-guidance.md](docs/agents/maintaining-agent-guidance.md) | Changing this file, `docs/agents/` or a skill |

## Contributor skills

After `pnpm install`, your agent loads these when your task matches their description. Without a skill-aware
agent, read them in `.agents/contributing-skills/<name>/SKILL.md`.

| Skill | Covers |
|---|---|
| `serenity-js-contributing-core-internals` | Gotchas in `@serenity-js/core`: the dual-package hazard, the Stage's async operations, Question proxies |
| `serenity-js-contributing-web-internals` | Adding web capabilities to `@serenity-js/web` and the browser integrations, and their gotchas |
| `serenity-js-contributing-test-runner-adapters` | The Cucumber, Mocha, Jasmine and Playwright Test adapters |
| `serenity-js-contributing-html-reporter` | `@serenity-js/html-reporter`: architecture, UX principles and gotchas |
| `serenity-js-contributing-debugging-ci` | Failing builds, tests and CI jobs, here and in the project templates |
| `serenity-js-contributing-documentation` | Writing and publishing documentation on serenity-js.org |

Packages also ship skills for their users, in `packages/<package>/skills/`, such as `serenity-js-writing-tasks` in
`@serenity-js/core`. They're linked the same way, and they describe how the package's API is meant to be used, so
read them before changing that API.
