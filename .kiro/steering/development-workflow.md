# Serenity/JS Development Workflow

## Behaviour-Driven Development

Serenity/JS development follows BDD principles: start with desired behaviour, express it as an executable specification, then implement the minimum to satisfy it.

### Think in Examples First

Before writing code, articulate the desired behaviour as concrete examples:

- What should happen when an actor performs this activity?
- What should happen when the input is invalid?
- What domain event should be emitted?
- How should this compose with existing Screenplay abstractions?

If the behaviour is unclear, ask for clarification rather than guessing.

### Required Sequence for Every Change

1. **Express the behaviour as a test** — write a spec in `packages/<module>/spec/` that describes what the system should do, not how it does it. Run it and confirm it fails.
2. **Implement the minimum** — make the test pass with the simplest correct implementation.
3. **Refactor** — improve the design while tests remain green.
4. **Verify** — run the full test suite for the package (`pnpm test`).

Never write implementation code without a corresponding failing test.

### What Justifies a Production Code Change

- A **new feature** requires a test that fails without it
- A **bug fix** requires a test that reproduces the bug (fails before, passes after)
- A **refactor** requires existing tests to remain green, or new tests verifying preserved behaviour at the changed boundary
- A **wiring change** (new dependency, constructor parameter) requires an integration test proving the wiring works

## Test-Driven Development Cycle

```
Red → Green → Refactor
 │       │        │
 │       │        └─ Clean up, extract, compose — tests stay green
 │       └─ Minimal implementation to satisfy the spec
 └─ Failing test expressing desired behaviour
```

### Unit Test Workflow

```bash
# 1. Write the failing test
cd packages/core
npx mocha --config ../../.mocharc.yml 'spec/screenplay/NewFeature.spec.ts'

# 2. Implement until it passes
pnpm test

# 3. Refactor, re-run
pnpm test
```

### Integration Test Workflow

Integration tests run against compiled output. Always recompile first:

```bash
# Clean stale artifacts, compile, then test
make clean
make COMPILE_SCOPE=libs compile
make INTEGRATION_SCOPE=playwright-test integration-test
```

Integration tests are required when:
- Adding or modifying test runner adapter behaviour
- Changing web interaction behaviour
- Modifying browser automation integration
- Adding reporter functionality

## Engineering Principles

### Fix Root Causes, Not Symptoms

When a problem is identified, trace it to its origin:

1. **Diagnose** — find where the invalid state is produced
2. **Identify options** — list architecturally distinct solutions
3. **Recommend** — prefer the option that eliminates the problem at source
4. **Confirm** — if expensive, explain trade-offs and ask before proceeding

Defensive guards are appropriate at public API boundaries. They are not a substitute for fixing the code that produces invalid input.

### Prefer Proper Solutions Over Hacks

- Understand the tool's intended API before implementing
- If the straightforward approach fails, investigate why before reaching for workarounds
- Never apply regex hacks, monkey-patches, or string manipulation on structured output
- Use the module's dedicated build commands — never partial builds or made-up compile commands

Anti-patterns to avoid:
- Regex-replacing content inside generated output
- Adding guards/flags to work around architectural issues
- Using sed/awk on structured files — write a TypeScript script instead
- Post-processing tool output when the tool can produce it correctly

### Preserve Existing Design

When making changes:
- Read surrounding code before writing new code
- Match existing patterns, naming, and abstractions
- Don't introduce new dependencies without justification
- Don't refactor code unrelated to the current task
- Keep diffs minimal and focused

### Incremental Changes Over Big Rewrites

- Make one logical change per commit
- Each commit should leave the codebase in a working state
- Prefer a series of small, reviewable changes over a single large one

## Verification Standards

### Before Presenting Results as Complete

1. **All tests pass** — unit tests for the changed package (`pnpm test`), plus integration tests if applicable
2. **New code has tests** — every new function, class, or behaviour change has a corresponding spec
3. **ESLint passes** — `npx eslint <changed-files>` reports no errors
4. **Build succeeds** — `make COMPILE_SCOPE=libs compile` completes without errors

### Honesty About Verification

- If you can verify something (read a file, run a command), do it
- If you cannot (visual rendering, file:// URLs), say so explicitly and offer an alternative
- Never fabricate observations or claim to have seen something you inferred

## Clarification Policy

If requirements are unclear, ask before writing tests. One clear question is better than a wrong assumption.

Examples of when to ask:
- "Should this throw an error or return a default when the element is not found?"
- "What domain event should this emit?"
- "Should this compose with existing Tasks or be a standalone Interaction?"

## Pre-Commit Checklist

- [ ] Every new feature has a failing test written first
- [ ] Tests describe behaviour, not implementation details
- [ ] Edge cases are covered with explicit examples
- [ ] All unit tests pass (`pnpm test` in the package)
- [ ] Integration tests pass if applicable (`make INTEGRATION_SCOPE=<module> integration-test`)
- [ ] ESLint passes on all modified files (`npx eslint <files>`)
- [ ] No implementation code exists without corresponding tests
