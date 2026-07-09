# Phase 9: Package Layout Restructuring

## Goal

Reorganise `packages/html-reporter/` from the generic `src/` + `spec/` layout into a
domain-oriented top-level structure that reflects the three distinct bounded contexts
within the package.

## Target Layout

```
packages/html-reporter/
├── cli/                ← Node.js reporter, archiver, CLI aggregation (current src/)
├── app/                ← Preact single-page app (current template/)
├── serenity/           ← Interaction objects (current src/serenity/)
├── spec/
│   ├── cli/            ← Unit tests for reporter/archiver (current spec/ minus components/)
│   └── components/     ← Component tests (already exists)
├── lib/                ← CJS compiled output
├── esm/                ← ESM compiled output
├── package.json
└── tsconfig*.json
```

## Rationale

The html-reporter contains three conceptually distinct codebases sharing one npm package:

1. **cli** — Node.js code that collects domain events, writes `db.json`/`data.js`, aggregates
   test runs, and generates the final HTML report. Runs at build time.
2. **app** — A Preact SPA bundled into a self-contained HTML template. Runs in the browser
   at `file://` URLs. Has no Node.js dependencies.
3. **serenity** — Screenplay Pattern interaction objects for testing the report. Published as
   `@serenity-js/html-reporter/serenity`. Used by component tests and integration tests.

The current `src/` directory conflates (1) and (3). The rename from `template/` to `app/`
better communicates that it's a standalone application, not just HTML templates.

## Migration Steps

1. Rename `template/` → `app/`
2. Rename `src/` → `cli/` (move interaction objects out first)
3. Move `src/serenity/` → top-level `serenity/`
4. Move `spec/` unit tests to `spec/cli/` (keep `spec/components/` as-is)
5. Update `tsconfig-cjs.build.json` and `tsconfig-esm.build.json`:
   - `rootDir` and `include` to cover `cli/` + `serenity/`
   - Ensure output paths in `lib/` and `esm/` remain stable for the `exports` field
6. Update `package.json` `exports` field if output paths change
7. Update `scripts/bundle-template.mjs` to read from `app/` instead of `template/`
8. Update esbuild fixture in `spec/components/fixtures.ts` (TEMPLATE_DIR)
9. Update all relative imports in spec files
10. Verify: compile, component tests, integration tests, lint

## Risks

- **Convention break** — every other package uses `src/` → `lib/`. This makes html-reporter
  structurally unique. Acceptable given its unique nature (it contains a full SPA).
- **TypeScript rootDir** — with multiple source roots, the compiled output structure will
  change. May need `rootDir: "."` or composite project references.
- **CI blast radius** — build scripts, coverage config (`.c8rc.json`), and any hardcoded
  paths in CI need updating.

## Status

⬜ Not started — follow-up to Phase 8 component extraction.
