# Design Review — Serenity/JS HTML Report

Date: 2026-06-26  
Branch: `feat/html-reporter`  
Commit: `bbc39bc531`

## Current Status

### Completed (this session)

**KPI Redesign (all views):**
- Dashboard: hero Confidence card with area sparkline + deltas, quality sub-scores, operational cards with dot trends
- Requirements: KPI filter tabs with subtitles, root node visible, subdirectory counts (pass/total)
- Timeline: KPI cards replacing inline stats
- Errors: category KPI cards with subtitles
- All views: consistent uppercase labels, semantic colour (≥90 green, 70–89 default, <70 orange, <50 red)
- Accessibility: tabindex, role, aria-label on interactive cards
- `ReportHistoryScore` interface added to `ReportData.ts`

**Phase 1 Quick Wins (all done):**
- ✅ Tags: force red for 0% with scenarios
- ✅ Test Runs: threshold colours on pass rates
- ✅ Scenarios: strip category prefix when grouped
- ✅ Requirements: "88% (44/50)" counts in subdirectory list
- ✅ Requirements: capitalize detail panel title
- ✅ Requirements: root directory name shown in tree
- ✅ Dashboard: tooltip colour boxes filled (usePointStyle)
- ✅ Lint: all errors resolved, `make lint` clean

### Not Changed (intentionally)
- StabilityView: uses filter chips (different pattern, already consistent)
- TestRunsView: list layout with trend chart (well-structured)
- SystemContextView: context grid with emoji icons (solid)
- ScenariosView: virtualized list (working, but needs Phase 2 enrichment)

---

## Executive Assessment

The report has evolved significantly from a generic template. The KPI redesign established a strong foundation: semantic colour, information hierarchy, delta indicators, and consistent typography. The product is ~60% of the way to competing visually with Linear/Datadog/Vercel.

**What answers quickly today:**
- Dashboard: "Is this build healthy?" → Yes, within 2 seconds via Confidence hero card
- Errors: "What type of failures?" → Category KPIs immediately visible

**What still requires too much parsing:**
- Test Scenarios: "What broke and why?" → Must scan a long flat list with repetitive breadcrumbs
- Requirements: "What's risky?" → Tree shows green bars but no risk signal
- Timeline: "What's the execution story?" → Duration bars are too small to parse at a glance

---

## Per-View Critique

### 1. Dashboard ✅ Strong

**What works:** Hero confidence card with area sparkline. Delta indicators. Asymmetric hierarchy. Degraded/Recovered/Slowest status cards.

**Issues:**
- Trend chart dominates too much vertical space (280px) for 5 data points
- "219 Passed | 40 Failed | Avg 4.2s" summary text restates what KPI cards already show
- Status card headers (DEGRADED/RECOVERED) use semantic colour for labels — creates false alert impression

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Reduce trend chart height to 200px | High | Low |
| Remove redundant summary text from chart header | Medium | Low |
| Make status card headers use `--text-secondary`, keep colour on item icons only | Medium | Low |

---

### 2. Test Scenarios ⚠️ Needs Work

**What works:** Filter chips with counts. Run selector. Category grouping with sticky headers. Clickable rows with source path.

**Critical issues:**

1. **Scenario names are full breadcrumbs** — extremely repetitive under category headers that already show the category. This is the #1 cognitive load issue.

2. **No failure context in the list** — engineers must click each failed scenario to understand what broke.

3. **No instability/history indicator** — no signal whether a failure is new, recurring, or unstable.

4. **Duration values have no visual weight hierarchy** — 85ms and 310ms look equally important.

5. **Row density too low** — 108px per row. At 500+ scenarios this becomes a scrolling problem.

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Strip category prefix from scenario names when grouped by category | High | Low |
| Show inline error message (1 line, truncated) for failed scenarios | High | Medium |
| Add execution history dots (last 5 runs) to each row | High | Medium |
| Add "New failure" / "Unstable" badges for regressions | High | Medium |
| Reduce row height to ~80px (name + meta on 2 lines) | Medium | Low |
| Highlight duration only when >2× average (orange) or >5× (red) | Medium | Low |
| Add "Failed" / "New failures" / "Unstable" / "Slow" quick-filter buttons | High | Medium |

---

### 3. Requirements ⚠️ Needs Work

**What works:** KPI filter tabs. Split layout. Search. Tree with progress bars.

**Issues:**

1. **Progress bars too small and ambiguous** — two stacked bars per row that users can't distinguish without hovering.

2. **Detail panel stat cards use old pattern** — no context about what changed or what's risky.

3. **"features" heading is lowercase** — inconsistent with uppercase system.

4. **Narrative block is too dominant** — occupies prime real estate above stats.

5. **Subdirectory percentages lack context** — "88%" doesn't tell me if that's 8/9 or 88/100.

6. **No failure indication on tree nodes** — can't see which areas have failures without drilling in.

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Replace dual progress bars with single segmented bar (green/red/orange/grey) | High | Medium |
| Move narrative below stats or make collapsible | Medium | Low |
| Add scenario count: "88% (44/50)" in subdirectory list | High | Low |
| Capitalize detail panel title | Low | Low |
| Add failed count badge to tree nodes | High | Medium |
| Detail panel stat cards: add "of N" context | Medium | Low |

---

### 4. Errors ✅ Good

**What works:** Category KPI cards. Grouped error list. Error messages inline. Source paths. Duration.

**Issues:**
- No deduplication — same assertion message appears multiple times without grouping
- No "first seen" / "new in this run" indicator

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Group identical error messages with count: "expected true... (×3)" | High | Medium |
| Add "New" badge for errors not in previous run | High | Medium |

---

### 5. Stability — Good (empty state)

Clean empty state with icon, heading, and actionable guidance. When populated, shows filter chips (Unstable/Degraded/Recovered) with virtualized list.

No changes needed to the design pattern.

---

### 6. Timeline ✅ Good

**What works:** KPI cards (Slowest/Fastest/Average/Total). Filter chips. Duration bars. Clickable rows.

**Issues:**
- Duration bars very small for fast tests — hard to compare
- All passing scenarios get equal visual treatment — failures should stand out more

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Increase minimum duration bar width to 8px | Medium | Low |
| Dim passing test rows (opacity 0.7) to elevate failures | Medium | Low |

---

### 7. Tags ✅ Good

**What works:** Card grid. Progress bars per tag. Grouped by type. Scenario counts.

**Issues:**
- 0% pass rate shows as default text (not red) due to threshold change — but 0% IS critical

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Force red for 0% pass rate when scenarioCount > 0 | High | Low |
| Sort tags by pass rate (worst first) within groups | Medium | Low |

---

### 8. Test Runs ✅ Good

**What works:** Trend chart. Run list with pass rate, duration, branch/commit links, CI links.

**Issues:**
- All pass rates shown in green regardless of value (75% should be orange)
- No delta between runs

**Recommendations:**

| Change | Impact | Effort |
|--------|--------|--------|
| Apply threshold colours to pass rates (75% → orange) | High | Low |
| Add delta indicator: "↑ 2%" or "↓ 4%" next to pass rate | Medium | Low |

---

### 9. System Context ✅ Solid

Clean grid. Uppercase labels. Emoji icons. CI section separated. Commit message shown.

No changes required.

---

## Cross-Page Consistency Issues

| Issue | Where | Fix |
|-------|-------|-----|
| Tags: 0% shows as default text instead of red | TagsView | Special-case `rate === 0 && count > 0` |
| Test Runs: all pass rates green | TestRunsView | Apply threshold logic |
| Scenarios: row height 108px vs Timeline 52px | Inconsistent density | Reduce scenarios to ~80px |
| Requirements detail panel uses old stat card layout | RequirementsView | Align with KPI card pattern |
| Scenario names repeat category when grouped | ScenariosView | Strip prefix |

---

## Semantic Colour Strategy (Established)

| State | Colour | When |
|-------|--------|------|
| Excellent (≥90%) | `--color-passed` (green) | Exceptional performance |
| Good (70–89%) | Default text (no colour) | Normal — don't cry wolf |
| Warning (50–69%) | `--color-pending` (orange) | Needs attention |
| Critical (<50%) | `--color-failed` (red) | Action required |
| Zero with data | `--color-failed` (red) | Always critical |
| Failed count > 0 | `--color-failed` (red) | Always highlighted |
| Delta positive | Green, light weight | Improvement |
| Delta negative | Red, light weight | Regression |
| Neutral metric | Default text | Informational (Duration, Scenarios count) |

---

## Design System Primitives (Established)

| Component | CSS Class | Used In |
|-----------|-----------|---------|
| KPI Card (hero) | `.kpi-card--hero` | Dashboard |
| KPI Card (standard) | `.kpi-card` | All views |
| KPI Card (operational) | `.kpi-card--operational` | Dashboard |
| KPI Card (active/filter) | `.kpi-card--active` | Requirements |
| Delta indicator | `.kpi-delta` | Dashboard, future: Test Runs |
| Area sparkline | `.sparkline-area` | Dashboard hero |
| Dot trend | `.kpi-dots` | Dashboard operational |
| Filter chip bar | `.filter-bar` + `.filter-chip` | Scenarios, Timeline, Stability |
| Progress bar | `.progress-bar-wrap` | Requirements, Tags |
| Status card | `.dashboard-status-card` | Dashboard |
| Context grid | `.context-grid` | System Context |
| Tag card | `.tag-card` | Tags |
| Empty state | `.empty-state` / `.placeholder-view` | Stability, Requirements |

---

## Prioritised Implementation Roadmap

### Phase 1: High Impact / Low Effort ✅ COMPLETE

1. ~~Tags: force red for 0% with scenarios~~ ✅
2. ~~Test Runs: apply threshold colours to pass rates~~ ✅
3. ~~Scenarios: strip category prefix when grouped~~ ✅
4. ~~Requirements: add "N/M" counts to subdirectory list~~ ✅
5. ~~Dashboard: reduce trend chart to 200px~~ → reverted to 280px (Y axis labels need space)
6. ~~Requirements: capitalize detail panel title~~ ✅

### Phase 2: High Impact / Medium Effort — NEXT

7. **Scenarios: inline error message for failed rows** — show `error.message` truncated to 1 line below scenario name for failed/error/compromised outcomes
8. **Scenarios: execution history dots (last 5 runs)** — show outcome dots from `executionHistory` array, same pattern as Dashboard status cards
9. **Scenarios: "New failure" / "Unstable" badges** — cross-reference `newFailures` and `unstableTests` arrays to add status pills
10. **Requirements: segmented outcome bar** — replace dual progress bars with single bar showing green/red/orange/grey segments proportional to outcomes
11. **Errors: group identical error messages** — deduplicate by `error.message`, show "(×3)" count
12. **Errors: "New" badge** — cross-reference `newFailures` to mark first-time errors
13. **Test Runs: delta indicator** — show "↑ 2%" / "↓ 4%" comparing each run to its predecessor

### Phase 3: High Impact / High Effort — PLANNED

14. **Requirements: risk score** (pass rate + flakiness + recency) per node
15. **Scenarios: expandable inline diagnostics** (stack trace preview, screenshots)
16. **Scenarios: smart grouping** (by error type, directory, requirement, severity)
17. **Global search** across all views (scenarios, errors, tags, requirements)
18. **Requirements: historical trend** per requirement node

### Remaining Polish (Low Effort)

- [ ] Timeline: dim passing rows (opacity 0.7) to elevate failures
- [ ] Timeline: minimum duration bar width 8px
- [ ] Tags: sort by pass rate (worst first) within groups
- [ ] Dashboard: remove "219 Passed | 40 Failed | Avg 4.2s" redundant text from trend card header
- [ ] Dashboard: status card headers (DEGRADED/RECOVERED) use `--text-secondary` instead of semantic colour

---

## Recommendations for Next Session

**Start with items 7–9** (Test Scenarios enrichment). These have the highest user impact — they directly answer "what broke and why?" during a failing CI build without requiring clicks into detail views.

Implementation approach:
- Item 7 (inline errors): Add conditional line below `.scenario-name` showing `scenario.error.message` with `text-overflow: ellipsis` for non-SUCCESS outcomes. ~20 lines of template change.
- Item 8 (history dots): Render `scenario.executionHistory.slice(-5)` as coloured dots (same `.history-dot` pattern from Dashboard status cards). ~15 lines.
- Item 9 (badges): Check if scenario source matches any entry in `DATA.newFailures` or `DATA.unstableTests` and render a small pill. ~25 lines.

---

## Technical Notes

- Stack: Preact + htm (tagged template literals) + esbuild IIFE bundle
- No React/Tailwind/shadcn — the actual stack is vanilla Preact with CSS custom properties
- Virtualization via @tanstack/virtual-core
- All state is client-side from `window.__SERENITY_REPORT_DATA__`
- No server, no API — everything is a static HTML file with embedded JS/CSS
- Tests: Playwright component tests (mount via esbuild + inline HTML)
