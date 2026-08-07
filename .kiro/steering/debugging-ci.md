# Debugging and CI

## Running Tests Locally

### Unit Tests

```bash
make test                  # All packages, with coverage
make test-no-coverage      # Faster, no coverage

cd packages/core && pnpm test   # Single package
```

### Individual Test Files

```bash
cd packages/core
npx mocha --config ../../.mocharc.yml 'spec/screenplay/Actor.spec.ts'
npx mocha --config ../../.mocharc.yml 'spec/**/*.spec.ts' --grep "Actor"
```

### Integration Tests

```bash
make INTEGRATION_SCOPE=playwright-test integration-test
make INTEGRATION_SCOPE=cucumber-12 integration-test
make INTEGRATION_SCOPE=all integration-test        # slow — runs everything
```

Integration tests run against compiled output. Always recompile first:

```bash
make clean
make COMPILE_SCOPE=libs compile
make INTEGRATION_SCOPE=playwright-test integration-test
```

## Common Build Issues

### Stale Nx Cache

If builds behave unexpectedly after switching branches or making structural changes:

```bash
make cc    # clears Nx cache
```

### Missing Module Errors

Packages must compile in dependency order. Nx handles this, but if you see resolution errors:

```bash
make COMPILE_SCOPE=libs compile    # compiles all library packages in order
```

### Type Checking Without Emitting

```bash
cd packages/core
npx tsc --noEmit
```

### Browser Installation

Browsers install automatically during `make install`. To reinstall manually:

```bash
pnpm postinstall:playwright    # Playwright browsers
pnpm postinstall:protractor    # Chrome v129 for Protractor
pnpm postinstall:webdriverio   # Chrome stable for WebdriverIO
```

## CI Pipeline

GitHub Actions workflow order:

1. **lint** — ESLint
2. **compile** — TypeScript compilation
3. **test** — Unit tests (parallel across Node versions and OS)
4. **integration** — Integration tests (parallel by module)
5. **coverage** — Aggregate coverage
6. **publish** — npm publish (main branch only)

### Investigating CI Failures

1. Identify the failing job name
2. Expand the failed step
3. Download artefacts (failed integration tests upload Serenity BDD reports)

### Reproducing CI Failures Locally

```bash
# Lint
make lint
pnpm lint:fix              # auto-fix formatting and imports

# Compilation
make clean compile

# Unit tests
cd packages/<name> && pnpm test

# Integration
make clean
make COMPILE_SCOPE=libs compile
make INTEGRATION_SCOPE=<module> integration-test
```

## Debugging Screenplay Issues

### Missing Ability

```typescript
// Error: "Alice can't BrowseTheWeb yet. Did you give them the ability to do so?"
// Fix: ensure the actor has the required ability
actor.whoCan(BrowseTheWebWithPlaywright.using(browser));
```

### Domain Events Not Flowing

Verify `stage.announce()` is being called in tests:

```typescript
expect(stage.announce).to.have.been.calledWith(
    sinon.match.instanceOf(InteractionStarts)
);
```

### Integration Test Not Reflecting Changes

Integration tests run against `lib/` (compiled output), not `src/`. Always:

```bash
make clean
make COMPILE_SCOPE=libs compile
```

## Performance

### Slow Compilation

```bash
NX_PROFILE=true pnpm compile:libs
```

### Slow Tests

```bash
npx mocha --config ../../.mocharc.yml 'spec/**/*.spec.ts' --reporter spec --slow 50
```

## Artefacts

- `packages/*/target/coverage/` — c8 coverage reports
- `integration/*/target/site/serenity/` — Serenity BDD reports
- `lerna-debug.log` — Lerna operation logs
