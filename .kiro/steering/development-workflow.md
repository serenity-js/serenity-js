
## Honesty About Verification

**Never pretend to have verified something you haven't actually verified.**

If the user asks you to look at a report, inspect a file, check a URL, or review output:
- If you CAN do it (e.g. read a file, run a command, check data), DO it.
- If you CANNOT do it (e.g. file:// URLs in browser, visual inspection of rendered HTML), say so explicitly and offer an alternative (e.g. serve via http-server, inspect the data.js content programmatically, take a screenshot).
- NEVER fabricate observations or claim to have seen something you inferred from other data.

This applies especially to:
- Reviewing generated reports or HTML output
- Inspecting visual rendering
- Confirming UI behaviour

When you cannot directly verify, state clearly: "I cannot access this directly because [reason]. Here's what I can check instead: [alternative]."

## Verification Before Presenting Results

**Every change must be verified before being presented as complete.**

Before saying "done" or committing:
1. **Run ALL tests** — both unit tests (`pnpm test` in the package) AND integration tests (`npm test` in `integration/html-reporter`). Not just the subset you think is relevant.
2. **Write tests for new code** — every new function, utility, or behaviour change MUST have a corresponding test. No exceptions.
3. **Visually verify UI changes** — when modifying the report template, serve it and screenshot with Playwright to confirm the change renders correctly. Check multiple views, not just one.
4. **Verify the full pipeline** — when changing how data flows (db.json schema, aggregation, template rendering), run the entire chain: compile → run integration module → aggregate → serve → screenshot.
5. **Don't commit broken code** — if tests fail, fix them before committing. A "WIP" commit with known failures is acceptable only as a last resort with explicit acknowledgement.

If you cannot verify something, say so explicitly rather than assuming it works.

## Prefer Proper Solutions Over Hacks

**Always research how to use tools and libraries correctly before implementing a solution.**

- When facing a problem, first understand the tool's intended API and patterns.
- If the straightforward approach doesn't work, investigate why — don't immediately reach for workarounds.
- Never apply string escaping hacks, regex workarounds, or monkey-patches without first asking: "Is there a proper way to do this with the tool's API?"
- If a hack seems necessary, explain the constraint and ask for confirmation before proceeding.
- Prefer solutions that use the tool as designed (e.g. let esbuild produce output directly rather than post-processing its output with fragile string replacements).

Examples of anti-patterns to avoid:
- Regex-replacing content inside generated output
- Adding guards/flags to work around architectural issues instead of fixing the root cause
- Copying files around instead of reading them in place
- Using symlinks as a "performance optimisation" that creates complexity
- Using sed/awk to modify structured files (JSON, TypeScript, YAML) — write a Node.js script instead
- Partial builds or made-up compile commands — always use the module's dedicated `npm run compile` command to produce a complete, consistent build

# Serenity/JS Development Workflow

## Mandatory Testing Rule

**When making ANY production code changes, you MUST ensure that you create new or update existing tests.**

This is non-negotiable. Every change to source code under `packages/*/src/` must be accompanied by corresponding test changes under `packages/*/spec/` (or `integration/`) that verify the new or modified behaviour. No exceptions.

### Required Sequence for Every Change

1. **Write or update the test first** — Before touching any file under `src/`, write a test under `spec/` that describes the expected behaviour. Run it and confirm it fails (or would fail without your upcoming change).
2. **Make the production code change** — Write the minimal implementation to make the test pass.
3. **Run the tests** — Confirm all tests pass before considering the change complete.
4. **Never skip steps** — If you find yourself editing `src/` without having first edited `spec/`, stop and write the test. If you refactor production code, update or add tests that prove the refactoring preserves behaviour.

### What "justifies" a production code change

- A **new feature** requires a new test that fails without the feature.
- A **bug fix** requires a test that reproduces the bug (fails before, passes after).
- A **refactor** requires either existing tests that still pass, or new tests that verify the preserved behaviour at the new interface boundary.
- A **change in wiring** (e.g., passing a new dependency to a constructor) requires an integration-level test proving the wiring works end-to-end.

## Test-Driven Development (TDD)

All features in Serenity/JS follow a strict test-driven development approach:

1. **Write a failing test first** - The test documents the intent and expected behavior
2. **Write the minimal implementation** - Make the test pass
3. **Refactor** - Clean up while keeping tests green

Never write implementation code without a corresponding test that fails first.

## Unit Test Workflow (packages/*)

For changes to any module under `packages/`:

### Step 1: Write the Failing Test

Create or update a test in `packages/<module>/spec/` that describes the expected behavior:

```typescript
// packages/core/spec/screenplay/NewFeature.spec.ts
import { describe, it } from 'mocha';
import { expect } from '../expect';

describe('NewFeature', () => {

    it('should behave in a specific way', () => {
        // Arrange
        const subject = new NewFeature();

        // Act
        const result = subject.doSomething();

        // Assert
        expect(result).to.equal(expectedValue);
    });

    it('should handle edge case', () => {
        // Test documents the edge case behavior
    });
});
```

### Step 2: Run the Test (Verify it Fails)

```bash
cd packages/core
npx mocha --config ../../.mocharc.yml 'spec/screenplay/NewFeature.spec.ts'
```

The test should fail with a clear error indicating what's missing.

### Step 3: Write the Implementation

Add the minimal code in `packages/<module>/src/` to make the test pass.

### Step 4: Run the Test (Verify it Passes)

```bash
cd packages/core
pnpm test
```

### Step 5: Refactor

Clean up the implementation while ensuring all tests remain green.

## Integration Test Workflow (integration/*)

For features requiring integration testing (test runner adapters, browser interactions, etc.):

**Important:** Integration tests run against the compiled output in `packages/*/lib/`. You must clean and recompile after making changes to any package:

```bash
# Clean build artifacts and recompile all library packages before running integration tests
make clean
make COMPILE_SCOPE=libs compile

# Then run integration tests
make INTEGRATION_SCOPE=playwright-test integration-test
```

If integration tests don't reflect your latest changes, or if compilation fails with stale errors after fixing source files, run `make clean` first to remove old build artifacts, then recompile.

### Step 1: Write the High-Level Integration Test

Create a test scenario in the appropriate `integration/<module>/` directory:

```typescript
// integration/playwright-test/spec/new-feature.spec.ts
import { describe, it } from 'mocha';
import { expect } from '@integration/testing-tools';

describe('NewFeature integration', () => {

    it('works end-to-end with Playwright', async () => {
        // Integration test that exercises the full stack
    });
});
```

### Step 2: Run the Integration Test (Verify it Fails)

```bash
# Always recompile first
make COMPILE_SCOPE=libs compile

# Then run the integration test
make INTEGRATION_SCOPE=playwright-test integration-test
```

### Step 3: Follow TDD for Unit Tests

Before implementing, write unit tests in the relevant `packages/*/spec/` directory.

### Step 4: Implement and Iterate

Write implementation code, running both unit and integration tests until all pass.

Remember the compile-test cycle for integration tests:

```bash
# After each implementation change:
make clean
make COMPILE_SCOPE=libs compile
make INTEGRATION_SCOPE=<module> integration-test
```

## When to Write Integration Tests

Integration tests are required when:

- Adding or modifying test runner adapter behavior (cucumber, mocha, jasmine, playwright-test)
- Changing web interaction behavior (click, enter, scroll, etc.)
- Modifying how Serenity/JS integrates with browser automation tools
- Adding new reporter functionality

## Clarification Policy

**Never make assumptions about requirements.**

If the requirements are unclear:
- Ask for clarification before writing tests
- Document any assumptions in the test description
- Prefer asking one clear question over guessing

Examples of when to ask:
- "Should this throw an error or return undefined when the element is not found?"
- "What should happen if the timeout is exceeded?"
- "Should this work with both single elements and collections?"

## TDD Checklist

Before submitting changes:

- [ ] Every new feature has a failing test written first
- [ ] Tests clearly document the expected behavior
- [ ] Edge cases are covered with explicit tests
- [ ] All unit tests pass (`make test`)
- [ ] Integration tests pass if applicable (`make integration-test`)
- [ ] ESLint passes on all modified files with no errors (`npx eslint <files>`)
- [ ] No implementation code exists without corresponding tests

## Pre-Commit Linting Rule

**Before committing ANY changes, you MUST run ESLint on all modified files and fix any errors.**

Run ESLint on the changed files:

```bash
npx eslint path/to/changed/file1.ts path/to/changed/file2.ts
```

- Fix all errors before committing. Do not commit code with lint errors.
- Warnings should be reviewed and fixed where possible.
- Use `npx eslint --fix` only for auto-fixable issues (formatting, import ordering). Review the result before committing.
