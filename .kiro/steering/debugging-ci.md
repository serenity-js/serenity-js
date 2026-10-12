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

Nx keeps its task cache in a per-user directory outside the repo (`~/.nx/<workspace-id>/cache`).
`make cc` only clears it when the root `nx` dev dependency matches the version Lerna runs, so keep them aligned.

### Compiled output missing after a cached build

If `lib/` or `esm/` is missing although the log says `[existing outputs match the cache, left as is]` or `[local cache]`,
the cache hit restored nothing. Nx only restores the `outputs` declared in `nx.json`, and they must be relative to the project:
`{projectRoot}/lib`, never `{projectRoot}/packages/<name>/lib`. Packages whose `clean` script deletes `lib`/`esm`
(e.g. html-reporter) are the first to break.

Check the outputs in `nx.json`, then rebuild without the cache:

```bash
NX_SKIP_NX_CACHE=true make compile
```

### Type errors between two copies of a dependency

An error like `Type 'Page' from playwright-core@1.64.0 is not assignable to type 'Page' from playwright-core@1.63.0`
means two versions of the same package are installed. It usually comes from an upgrade that changed some of
the related packages but not all of them. For Playwright, `playwright`, `@playwright/test` and `playwright-core`
must be on the same version. Check with `grep -n "^  playwright-core@" pnpm-lock.yaml`.

### Lockfile changes

Read every lockfile diff line by line; a passing install doesn't make it correct.

- `pnpm install` and `pnpm install --fix-lockfile` can quietly re-resolve unrelated transitive dependencies,
  sometimes to *older* versions. Revert those hunks and confirm with `pnpm install --frozen-lockfile`.
- `ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY` after a merge means the merge kept references to entries that one side
  removed. Run `pnpm install --fix-lockfile`, then review the diff as above.
- Leave full lockfile rebuilds to Renovate's lock file maintenance, so that they arrive as a reviewable PR.

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
6. **publish** — `lerna version`, then `lerna publish from-package` with retries (main branch only)

### Recovering a failed npm publish

Don't re-run the publish job: `lerna version` has already pushed the release commit and tag, so a re-run fails with `EBEHIND`.

1. Check what's actually missing using the registry, not npmjs.com, which can disagree with it:
   `npm view @serenity-js/<package>@<version> version --prefer-online`
2. Wait before acting. Large packages (e.g. `@serenity-js/serenity-bdd`, ~60 MB) have taken about an hour to appear
   after a successful publish. The package's provenance attestation names the CI run that published it.
3. Run the **Main** workflow manually (`workflow_dispatch`) with the release tag, e.g. `v3.49.0`.
   It publishes only the versions missing from the registry, using the same trusted-publisher identity as a release,
   and keeps the `latest` dist-tag on the newest release.

Sigstore `TLOG_CREATE_ENTRY_ERROR (409)` errors during provenance signing are transient; the publish step retries them.

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

## Serenity/JS Project Templates — CI Gotchas

### Template migrations must update ALL touchpoints in one PR

A template migration (e.g., switching reporter) touches many files. Missing any one requires a follow-up PR. The full checklist:
- `package.json` (deps + scripts)
- Config file (crew configuration)
- `.gitignore`
- `.github/workflows/*.yml`
- `.devcontainer/devcontainer.json`
- `README.md` (prerequisites, report paths, scripts docs, troubleshooting, documentation links)

Review the README last — it's the most commonly missed because it's prose, not code.

### `@wdio/xvfb` auto-detection breaks IPC in Docker containers

WebdriverIO 9.30+ bundles `@wdio/xvfb` into `@wdio/local-runner` and auto-activates it when it detects `--headless` Chrome *and* `xvfb-run` is available in PATH. In Docker containers (like the `ghcr.io/serenity-js/playwright` image), `xvfb-run` is present but wrapping the worker process with it breaks Node's IPC channel (`EINVAL` on `process.send()`). Fix: set `autoXvfb: false` in `wdio.conf.ts`.

### Sparse checkouts persist between `actions/checkout` steps

`actions/checkout` leaves sparse checkout enabled in the workspace, so a later full checkout in the same job
contains only the sparse paths. Never use a sparse checkout before another checkout in the same job.

### Renovate lock file drift on major version bumps

Renovate can update `package.json` without regenerating `package-lock.json` correctly, especially for major version bumps that introduce new transitive dependencies (e.g. Cucumber 13 adding `@cucumber/pretty-formatter` and `@cucumber/query`). CI then fails with `npm ci` complaining about missing packages in the lock file. Fix: add `:lockFileMaintenance` to the Renovate `extends` array — this periodically regenerates the lock file and catches drift before it breaks CI.

### Never place two callouts immediately adjacent to each other

Two consecutive `:::tip` / `:::note` / `:::warning` blocks create visual clutter and neither gets read. Move one to a more relevant location, combine them into one callout, or separate them with prose.
