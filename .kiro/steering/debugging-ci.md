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

Browsers are installed separately from npm dependencies via `make setup` or `pnpm setup`. This is a one-off step — re-run it only when Playwright or Chrome versions are updated:

```bash
make setup                     # all browsers
pnpm setup:playwright          # Playwright browsers + OS deps
pnpm setup:protractor          # Chrome 129 + ChromeDriver (for Protractor tests)
pnpm setup:webdriverio         # Chrome stable + ChromeDriver (for WebdriverIO tests)
```

### Dual CJS/ESM Builds

Each package produces both CJS (`lib/`) and ESM (`esm/`) output. Running `npx tsc --build tsconfig.build.json` only builds one format. Always use `npm run compile` — this runs both `tsconfig-cjs.build.json` and `tsconfig-esm.build.json`.

For the html-reporter, `npm run compile` also runs `bundle-template.mjs` which produces the self-contained `template.js` bundle.

### Cross-Package Compilation Order

When changing a package's public API, downstream packages resolve types from compiled output. Compile dependencies before dependents:

```bash
cd packages/core && npm run compile
cd packages/html-reporter && npm run compile
```

If you see type errors referencing methods you just added, the dependency hasn't been recompiled.

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
