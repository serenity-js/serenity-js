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
make clean
make COMPILE_SCOPE=libs compile
make INTEGRATION_SCOPE=playwright-test integration-test
```

See `debugging-ci.md` for full command variations, troubleshooting, and CI reproduction steps.

Integration tests are required when:
- Adding or modifying test runner adapter behaviour
- Changing web interaction behaviour
- Modifying browser automation integration
- Adding reporter functionality

## Engineering Principles

### No Guessing — Understand Before You Implement

**You may only write code when you have full clarity on both the goal and the approach.**

- If you don't understand how an API works, **read the source code**. Don't infer from type signatures alone.
- If you haven't used a pattern before, **find an existing usage** in the codebase and study it before attempting your own.
- If multiple approaches exist and you're unsure which is correct, **stop and ask**.
- If requirements are ambiguous, **stop and ask**. One clarifying question saves hours of rework.
- If your first attempt fails, **diagnose the root cause** before trying a second approach. Two failed attempts means you don't understand the problem yet.

**Never:**
- Assume an API works a certain way without reading its implementation or finding a working example
- Hack around type errors or runtime failures with casts, try/catch wrappers, or fallback logic
- Make multiple speculative attempts hoping one will stick
- Present code that you haven't verified actually works

**Always:**
- Read the relevant source before using an unfamiliar API
- Find at least one working example of the pattern in the codebase
- Run the code and confirm it works before moving on
- Ask when uncertain — silence is not a substitute for understanding

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

### Spike and Stabilise

When a multi-file change accumulates workarounds (fixture hacks, conditional locators, "undo" edits), you're **spiking** — gathering knowledge about the problem, not producing a shippable solution. This is valuable, but recognise it for what it is.

**The pattern (Dan North's "Spike and Stabilise"):**
1. **Spike** — explore the problem space. Incremental patches reveal structural requirements you didn't anticipate. This is a knowledge-gathering exercise, not production code.
2. **Recognise** — when you start adding workarounds for issues you introduced moments ago, the spike has served its purpose. You now understand the constraints.
3. **Stash** — `git stash` the spike. The knowledge is in your head (or context), not in the code.
4. **Stabilise** — reimplement from scratch using proper engineering (TDD, single-root components from the start, correct locators from the start). The second attempt is faster because the architecture is understood.

**Signals you're in a spike, not a clean implementation:**
- Test fixture needed a wrapper hack to accommodate component structure
- More than 2 files needed "undo" edits to fix earlier assumptions
- The diff is hard to explain as a single coherent change
- You're adding `as any` casts or conditional logic to work around your own recent changes

**Agent behaviour:** When you notice these signals, propose to the user: "This has become a spike — I've learned what the design needs to be. Shall I stash and reimplement cleanly with TDD?" Do not continue patching.

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

This applies to delegation too: send a sub-agent one focused task (e.g., "dashboard consistency card"), review the result, then send the next. Don't queue up all work upfront — short feedback loops catch misunderstandings early.

## Verification Standards

### Always use package.json scripts for final verification

During development, it's fine to use bare commands for speed (`npx tsc --noEmit`, `npx mocha 'spec/one.spec.ts'`, `npx playwright test spec/app/one.spec.ts`). But before committing or reporting work as complete, always use the package.json script equivalents:

| During TDD (fast feedback) | Final verification (before commit) |
|---|---|
| `npx tsc --noEmit` | `npm run compile` |
| `npx mocha 'spec/one.spec.ts'` | `npm test` |
| `npx playwright test spec/app/tags/` | `npm test` |

**Why:** Package.json scripts run the full pipeline — pretest hooks (data generation, compilation), all test suites (not just one), and post-test steps (coverage, bundling). Bare commands skip these and can pass against stale output, missing test suites, or incomplete builds.

This applies even when you "just compiled" — the pipeline exists to catch what you assume is fine. The urge to skip a step is the signal that the step is needed.

### Before Presenting Results as Complete

1. **All tests pass** — unit tests for the changed package (`pnpm test`), plus integration tests if applicable
2. **New code has tests** — every new function, class, or behaviour change has a corresponding spec
3. **ESLint passes** — `npx eslint <changed-files>` reports no errors
4. **Build succeeds** — `make COMPILE_SCOPE=libs compile` completes without errors

See the Pre-Commit Checklist below for the full list.

### Honesty About Verification

- If you can verify something (read a file, run a command), do it
- If you cannot (visual rendering, file:// URLs), say so explicitly and offer an alternative
- Never fabricate observations or claim to have seen something you inferred
- **Never project certainty when you have doubts.** If you are unsure whether something will work — especially irreversible operations like publishing, deploying, or deleting — say "I'm not certain" upfront. Phrasing like "that's fine" or "this should work" when you're guessing can lead to costly mistakes. State what you know, what you're inferring, and what you cannot verify.

## Clarification Policy

If requirements are unclear, ask before writing tests. One clear question is better than a wrong assumption.

**Stop and ask when:**
- You don't know which API or pattern to use
- Multiple approaches seem viable and you can't determine which is correct
- A previous attempt failed and you're not certain why
- The user has shown a pattern and you're not sure you fully understand it
- You're about to add workarounds (casts, try/catch, fallback logic) to make something compile

**Do not proceed by:**
- Trying variations until something compiles
- Adding type assertions to silence errors you don't understand
- Wrapping code in try/catch to handle failures you haven't diagnosed
- Assuming an API works like a similar API you've seen elsewhere

Examples of good clarifying questions:
- "Should this throw an error or return a default when the element is not found?"
- "What domain event should this emit?"
- "Should this compose with existing Tasks or be a standalone Interaction?"
- "I'm not sure how `eachMappedTo` works with a MetaQuestion — can you point me at a working example?"

## Pre-Commit Checklist

- [ ] Every new feature has a failing test written first
- [ ] Tests describe behaviour, not implementation details
- [ ] Edge cases are covered with explicit examples
- [ ] All unit tests pass (`pnpm test` in the package)
- [ ] Integration tests pass if applicable (`make INTEGRATION_SCOPE=<module> integration-test`)
- [ ] ESLint passes on all modified files (`npx eslint <files>`)
- [ ] No implementation code exists without corresponding tests
