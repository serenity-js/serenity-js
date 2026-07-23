---
inclusion: fileMatch
fileMatchPattern: "**/html-reporter/**"
---

# HTML Reporter UX Principles

## Purpose

The Serenity/JS HTML report is not merely a test report — it is **evidence explaining whether the system behaves as
expected**. Every design decision should reduce uncertainty, minimise cognitive effort, accelerate diagnosis, preserve
context, and increase confidence in the software delivery process.

## Target Personas

The report serves four distinct personas with different questions, time pressures, and technical vocabularies. Design
decisions must consider all four — never optimise for one at the expense of another.

| Persona | Primary question | Time budget | Depth |
|---------|-----------------|-------------|-------|
| **Product Owner** | Can we ship this? | 30–60 seconds | Headlines, capabilities, trends |
| **Developer** | Why did this fail and where? | 60–90 seconds | Stack traces, screenshots, HTTP, activity trees |
| **QA Engineer / SDET** | Is this test reliable? | 2–5 minutes | Execution history, consistency, retry patterns |
| **Engineering Manager** | Is quality improving? | 30 seconds | Dashboard KPIs, trends, confidence scores |

### Design implication

Every view should answer its persona's question **above the fold**. Detail is available on demand (progressive
disclosure), never forced.

## North Star Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **Time-to-confidence** | How quickly can a user decide whether to ship? | < 30 seconds from Dashboard |
| **Time-to-diagnosis** | How quickly can a Developer identify root cause? | < 90 seconds from notification to evidence |
| **Time-to-target** | How quickly can a user reach a specific scenario? | < 5 seconds with global search; < 15 seconds via browse |

Measure proposed features against these metrics. If a feature doesn't improve at least one, question its priority.

## Interaction Architecture

### Two-Layer Navigation Model

The report uses a strict two-layer model for finding information:

```
┌─────────────────────────────────────────┐
│  Global Search (Cmd+K overlay)          │  ← Navigation layer
│  Searches everything, navigates to it   │     Stateless, ephemeral
└───────────────┬─────────────────────────┘
                │ selects result → navigates
                ▼
┌─────────────────────────────────────────┐
│  View (Scenarios / Errors / etc.)       │  ← Content layer
│  Local search + filter chips + sort     │     Owns its own state
└─────────────────────────────────────────┘
```

**Rules:**

- Global search is a **navigation tool** — it changes location, it does not filter the current view
- Local filters are **refinement tools** — they narrow what's shown within the current view
- Global search may **seed** a local filter on navigation (e.g., pre-fill the search input) but does not own it
- Views never share filter state — each view is an independent bounded context
- After the navigation handoff, global search is gone and local filters are in full control

### View Independence

Each view owns its own:
- Search semantics (what fields are searched, how results rank)
- Filter model (which chips, what logic)
- Sort options
- URL state serialisation (query parameters within the hash)

No view should depend on another view's filter model. This keeps each view independently testable and prevents coupling
that makes the codebase brittle.

### Deep Linking

Every meaningful view state must be expressible as a URL. Users share URLs to communicate specific evidence.

**Rules:**
- Filter state, search terms, sort order, selected items → serialised in hash parameters
- Navigating to a deep link must restore the full view state
- Browser back/forward must work correctly through hash history
- Share/copy affordances should be discoverable (not hidden behind right-click)

## Information Hierarchy

### What Appears First (Above the Fold)

| View | Above the fold | Below the fold |
|------|---------------|----------------|
| Dashboard | Confidence score, KPI cards, trend sparklines | Consistency list, slowest tests |
| Test Scenarios | Filter bar, first ~10 scenario rows | Remaining rows (virtual scroll) |
| Scenario Detail | Outcome icon, name, error block, failing screenshot | Full activity tree, photo strip, video |
| Capabilities | Tree panel with health indicators | Detail panel, README content |
| Errors | Summary cards (counts by category), first errors | Remaining errors (virtual scroll) |

### Progressive Disclosure Rules

1. **Level 0 (glance):** Outcome + name + duration. Visible in lists without interaction.
2. **Level 1 (click):** Navigate to detail view. Shows error, top-level activities, evidence summary.
3. **Level 2 (expand):** Expand activity tree nodes, open REST panels, view lightbox.
4. **Level 3 (investigate):** Compare retries, browse execution history, cross-reference screenshots with activities.

Never force Level 2/3 information on users seeking Level 0/1 answers.

## Evidence Presentation

### Error Blocks

- Error type + message always visible first (no expansion needed)
- Stack trace below, scrollable, with ANSI colour rendering
- Source location with copy affordance
- Error location links to the failing activity in the tree (bidirectional)

### Activity Trees

- Auto-expand to the first failing node on page load
- Failed branches visually distinct from passing branches (colour + icon)
- "Show only failed path" toggle collapses passing branches
- Duration shown on every node (identifies slow steps without separate analysis)
- REST query panels expand inline (no page navigation)
- Copy location affordance on nodes with source information

### Screenshots

- Photo strip shows thumbnails in execution order with wall-clock timestamps
- Clicking opens lightbox with keyboard navigation (Escape, ←, →)
- Screenshots correlate with activity tree nodes (bidirectional linking)
- Lightbox shows caption (activity name) + timing offset from scenario start

### Execution History

- Dot strip showing pass/fail pattern across runs, grouped by date
- Active run highlighted; clicking a run navigates to that historical execution
- Summary stats (X of Y passing, N% consistent) visible without interaction

## Accessibility Requirements

These are **non-negotiable baseline requirements**, not aspirational goals.

### Keyboard

- Every interactive element reachable via Tab
- Tree navigation via Arrow keys, Home, End, Enter, Space
- Lightbox: Escape to close, Arrow keys to navigate
- Modal overlays (future global search): Escape to dismiss, focus trap
- Skip-to-content link present and functional

### Screen Readers

- ARIA labels on all icon-only buttons
- `aria-current="page"` on active navigation item
- `aria-live="polite"` on dynamic result counts
- `aria-pressed` on toggle buttons (filter chips)
- `role="tree"` / `role="treeitem"` on capability tree
- Meaningful alt text on screenshots (activity name)

### Visual

- Forced-colours (Windows High Contrast) support via `@media (forced-colors: active)`
- `prefers-reduced-motion: reduce` disables animations
- Colour is never the sole indicator — icons/text accompany all colour-coded outcomes
- Minimum contrast ratios per WCAG 2.2 AA
- Focus indicators visible in both light and dark themes

## Performance Constraints

The report is a single self-contained HTML file that must work from `file://` URLs.

### Rules

- **No external network requests at runtime** — all data embedded in `data.js`
- **Virtual scrolling** for any list that could exceed 50 items
- **Lazy loading** for images (screenshots use `loading="lazy"`)
- **Bundle size awareness** — every dependency adds to the single-file payload
- **No framework beyond Preact + htm** — avoid adding runtime dependencies
- **Chart.js is the charting library** — do not introduce alternatives

### Thresholds

- Report should render interactive within 1 second for datasets up to 1000 scenarios
- Virtual scrolling must maintain 60fps scroll on mid-range hardware
- Total HTML file size target: < 1MB for the template (excluding data.js)

## Design System

### Theming

- Light and dark themes via CSS custom properties on `[data-theme]`
- System preference detection via `prefers-color-scheme`
- User preference persisted in `localStorage`
- All colours referenced via custom properties — never hardcoded values in components

### Outcome Colours (Semantic)

| Outcome | Variable | Meaning |
|---------|----------|---------|
| Passed | `--color-passed` | Test succeeded |
| Failed | `--color-failed` | Assertion failure |
| Error | `--color-error` | Runtime error (not assertion) |
| Pending | `--color-pending` | Not yet implemented |
| Skipped | `--color-skipped` | Deliberately skipped |
| Compromised | `--color-compromised` | Infrastructure failure |

### Component Patterns

- **Cards** (`.card`) — primary content containers with shadow and radius
- **KPI cards** (`.kpi-card`) — clickable metric displays that navigate on click
- **Filter chips** (`.filter-chip`) — toggle buttons with count badges
- **Scenario rows** — clickable list items with outcome icon, name, meta, duration
- **Activity nodes** — tree items with expand/collapse, outcome icon, name, duration

When adding new components, match existing patterns. Do not introduce new interaction paradigms without justification.

## Testing the Report

### Component Tests

Component tests use Playwright (not a browser extension or JSDOM). They:
- Render components in an actual browser via esbuild fixture
- Assert on visible text, ARIA state, interaction behaviour
- Do NOT test visual appearance (no screenshot comparison)
- Use `data-testid` sparingly — prefer accessible selectors (role, label, text)

### What to Test

- Navigation: clicking a link changes the view and URL
- Filtering: activating a chip reduces visible results
- Deep linking: loading a URL with params shows correct state
- Keyboard: arrow keys navigate trees, Escape closes overlays
- Evidence: error blocks render ANSI colours, screenshots open lightbox
- Accessibility: ARIA attributes present and correct

### What NOT to Test in Component Tests

- Exact pixel positions or sizes
- Animation timing
- Chart.js canvas rendering
- Bundle size (tested separately in build)
