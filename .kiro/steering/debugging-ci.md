# Debugging and CI Troubleshooting

## Running Tests

### Unit Tests

```bash
# All unit tests with coverage
make test

# Unit tests without coverage (faster)
make test-no-coverage

# Specific package
cd packages/core
pnpm test
```

### Integration Tests

```bash
# Specific integration module
make INTEGRATION_SCOPE=playwright-test integration-test

# All Cucumber versions
make INTEGRATION_SCOPE=cucumber-all integration-test

# All integration tests (slow)
make INTEGRATION_SCOPE=all integration-test
```

### Running Individual Test Files

```bash
cd packages/core

# Run a single test file
npx mocha --config ../../.mocharc.yml 'spec/screenplay/Actor.spec.ts'

# Run tests matching a pattern
npx mocha --config ../../.mocharc.yml 'spec/**/*.spec.ts' --grep "Actor"

# Verbose output
npx mocha --config ../../.mocharc.yml 'spec/**/*.spec.ts' --reporter spec
```

## Common Build Issues

### Nx Cache Issues

If builds behave unexpectedly, clear the Nx cache:

```bash
make cc
# or
pnpm cc
```

### Compilation Order

Packages must compile in dependency order. Nx handles this automatically, but if you see missing module errors:

```bash
# Compile all libs (respects dependency graph)
make COMPILE_SCOPE=libs compile

# Or compile everything
make compile
```

### TypeScript Errors

Check for type errors without emitting:

```bash
npx tsc --noEmit
```

For a specific package:

```bash
cd packages/core
npx tsc --noEmit
```

## CI Pipeline Structure

The GitHub Actions workflow runs in this order:

1. **lint** - ESLint checks
2. **compile** - TypeScript compilation
3. **test-*** - Unit tests (parallel across Node versions and OS)
4. **test-integration-*** - Integration tests (parallel by module)
5. **coverage** - Aggregate coverage report
6. **artifacts-publish** - NPM publish (main branch only)

### CI Failure Investigation

When CI fails, check:

1. **Which job failed?** - Look at the job name in the workflow
2. **What step failed?** - Expand the failed job to see the step
3. **Download artifacts** - Failed integration tests upload reports

### Common CI Failures

**Lint failures:**
```bash
# Run locally
make lint

# Auto-fix what's possible
pnpm lint:fix
```

**Compilation failures:**
```bash
# Clean and recompile
make clean compile
```

**Test failures:**
```bash
# Run specific package tests
cd packages/core
pnpm test

# Run specific integration test
make INTEGRATION_SCOPE=playwright-test integration-test
```

## Debugging Tests

### Integration Tests

Integration tests spawn actual test runners. Debug by:

1. Check the integration test's `src/` for the test scenarios
2. Run the underlying test runner directly
3. Check `target/` for generated reports

Example for Playwright integration:

```bash
cd integration/playwright-test
# Look at src/ for test scenarios
# Check target/site/serenity for reports after test run
```

### Browser Tests

Browsers are installed automatically during `make install` or `pnpm install` via postinstall scripts. If you need to reinstall them manually:

```bash
# Reinstall all browsers
pnpm postinstall

# Or individually:
pnpm postinstall:playwright    # Playwright browsers
pnpm postinstall:protractor    # Chrome v129 for Protractor
pnpm postinstall:webdriverio   # Chrome stable for WebdriverIO
```

## Debugging Screenplay Pattern Issues

### Activity Not Executing

Check that the actor has required abilities:

```typescript
// Debug: log actor's abilities
console.log(actor.toString());
// → Actor(name=Alice, abilities=[PerformActivities, AnswerQuestions, BrowseTheWeb])
```

### Question Returns Undefined

Verify the question is being answered:

```typescript
const result = await actor.answer(myQuestion);
console.log('Result:', result, typeof result);
```

### Events Not Emitting

Check Stage is properly configured:

```typescript
// In tests, verify stage.announce is called
expect(stage.announce).to.have.been.calledWith(
    sinon.match.instanceOf(InteractionStarts)
);
```

## Performance Profiling

### Slow Compilation

Use Nx's profiling:

```bash
NX_PROFILE=true pnpm compile:libs
```

### Slow Tests

Run with timing:

```bash
npx mocha --config ../../.mocharc.yml 'spec/**/*.spec.ts' --reporter spec --slow 50
```

## Log Files

CI failures may produce log files:

- `lerna-debug.log` - Lerna operation logs
- `target/` directories - Test outputs and reports
- `integration/*/target/site/serenity/` - Serenity BDD reports
