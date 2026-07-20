# HTML Reporter — Outstanding Work

Single source of truth for remaining html-reporter tasks.
Last verified: 2026-07-20 against commit `115a2ea406`.

---

## Phase 9: Package Layout Restructuring

**Goal:** Separate the three bounded contexts (`cli`, `app`, `serenity`) into distinct
top-level directories so the package layout reflects its architecture.

**What's done:**
- `template/` → `app/` rename ✅

**What remains:**

| # | Task | Notes |
|---|------|-------|
| 9.1 | Move `src/cli/` → top-level `cli/` | Node.js reporter, archiver, aggregator, CLI commands |
| 9.2 | Move `src/serenity/` → top-level `serenity/` | Interaction objects for testing the report |
| 9.3 | Remove `src/` directory | Only `src/index.ts` and `src/serenity.ts` barrel files remain — fold into new layout |
| 9.4 | Update `tsconfig-cjs.build.json` and `tsconfig-esm.build.json` | `rootDir`/`include` must cover `cli/` + `serenity/` |
| 9.5 | Update `package.json` `exports` field | Ensure `lib/` and `esm/` output paths remain stable |
| 9.6 | Update `scripts/bundle-template.mjs` | Template bundler reads from `app/` (already done) but output paths reference `cli/` |
| 9.7 | Update esbuild fixture in `spec/app/fixtures.ts` | `importPath` references may change |
| 9.8 | Update all relative imports across `serenity/` files | Currently `../../src/cli/ReportData` → needs new path |

**Risk:** High churn. Every interaction object file imports from `src/cli/ReportData.ts`.
The rename will touch 30+ files. Should be done in a single commit with no functional changes.

**Effort:** ~1 hour (mechanical refactor + verify all builds and tests pass)

---

## Phase 10: Component Test IO Conversion

**Status: ✅ DONE**

All user-behaviour tests are converted to interaction object pattern. Remaining raw
Playwright usages (RunSelector: 17, TagSearch: 12, ScenarioRowMobile: 8, etc.) are
intentional implementation contract tests for CSS classes, ARIA attributes, viewport
behaviour, and colour rendering — all documented with explanatory comments.

---

## Phase 11: AI Analysability

**Goal:** Make the report easier for AI agents and automation tools to triage failures
by reducing parsing effort from "N failures" to "M distinct root causes."

**What's done:**
- C2 partially: `relativeSourcePath()` strips prefixes in scenario rows using `specDirectory`

**What remains:**

### Workstream A: Scenario Row Enrichment (requires UI approval)

| # | Task | Description |
|---|------|-------------|
| A1 | Structured expected/received | Render assertion error `expected`/`actual` as distinct elements instead of raw message |
| A2 | Failing activity indicator | Show deepest failed activity name in scenario row |
| A3 | "Failing since" badge | Show which run first introduced the failure |
| A4 | Failure cluster indicator | Show "1 of 6 with this error" when multiple scenarios share same fingerprint |

### Workstream B: Error Grouping (requires UI approval)

| # | Task | Description |
|---|------|-------------|
| B1 | "Group by error" toggle | Collapse scenarios sharing same error fingerprint into grouped rows |

### Workstream C: Machine-Readable Summary

| # | Task | Description | Needs approval? |
|---|------|-------------|-----------------|
| C1 | `<script id="report-summary">` | Structured JSON failure summary in generated HTML | No (invisible) |
| C2 | Relative paths in error blocks | Strip absolute paths from stack traces; keep for copy | No (fixes existing) |

### Workstream D: Interaction Objects

| # | Task | Description | Blocked by |
|---|------|-------------|-----------|
| D1 | ScenarioRow enrichment IO | `failingStep()`, `failingSince()`, `clusterSize()`, `expected()`, `received()` | A1–A4 |
| D2 | Error grouping IO | `groupByError()`, `errorGroups()`, `errorGroupCalled(msg).scenarios()` | B1 |

**Effort:** ~8 hours total (C1+C2: 2h, A1–A4: 3h, B1: 2h, D1+D2: 1h alongside)

---

## Other Outstanding (non-phase)

### ListItemNotFoundError handling

**Spec:** `.kiro/specs/list-item-not-found-error-handling.md`
**Package:** `@serenity-js/core` + `@serenity-js/assertions` (NOT html-reporter)
**Status:** ⬜ Not started — needs design decision
**Summary:** `.first()` on empty list throws during description resolution, before
`isPresent()` can evaluate. Four design options listed in spec. Workaround in place
(avoid the pattern in interaction objects).

---

## Priority Order

| Priority | Item | Effort | Risk | Rationale |
|----------|------|--------|------|-----------|
| 1 | Phase 9 (layout) | 1h | Medium (churn) | Unblocks clean package boundaries for release |
| 2 | Phase 11 C1+C2 | 2h | Low | Machine-readable summary, no visible UI |
| 3 | Phase 11 A1–A4 + B1 | 5h | Medium | New UI — needs approval |
| 4 | ListItemNotFoundError | 2h | Low | Core package fix, workaround exists |
