# Static SVG Confidence Badge Generator

## Problem Statement

Teams using Serenity/JS want to display their project's confidence score in README files, dashboards, and CI status pages — the same way they embed coverage badges from Codecov or qlty.sh. Currently, while `summary.json` exposes the confidence score programmatically, there is no embeddable visual artifact produced alongside the report.

A static SVG badge, generated at report aggregation time and written to the output directory, would let teams embed confidence status using a simple image URL (served from GitHub Pages, S3, or any static host).

## Design Goals

1. **Zero-config default** — the badge is always generated alongside `summary.json`; no configuration needed
2. **Opt-out via config** — a boolean flag to disable badge generation if unwanted
3. **Self-contained SVG** — no external fonts, no network requests, works in any renderer (GitHub markdown, Slack, etc.)
4. **Recognisable brand** — includes a simplified Serenity/JS circle mark (the refresh-arrow + yellow dot)
5. **Colour-coded confidence** — green/yellow/orange/red thresholds communicate health at a glance
6. **Follows badge conventions** — 20px height, shields.io-style two-part layout (logo+label | value)

## Output

```
<outputDirectory>/
├── index.html
├── data.js
├── summary.json
├── badge.svg          ← NEW: embeddable confidence badge
└── test-runs/
```

### Embedding Examples

```markdown
![Confidence](https://your-org.github.io/your-project/reports/serenity-js/badge.svg)
```

```html
<img src="./reports/serenity-js/badge.svg" alt="Serenity/JS Confidence: 87%">
```

---

## Option A: BadgeSvgWriter Alongside SummaryJsonWriter (Recommended)

### Summary

A new `BadgeSvgWriter` class generates `badge.svg` from the computed `SummaryScores`. It is called from `ReportAggregator.buildSnapshot()` immediately after `SummaryJsonWriter.write()`, following the same pattern. The SVG is constructed via string template — no runtime dependencies.

### SVG Structure

```
┌─────────────────────────────────────────────────────┐
│  [⟳ logo]  Confidence  │  87%                       │
│   (dark bg, 14px)       │  (coloured bg)            │
└─────────────────────────────────────────────────────┘
     left section              right section
```

**Dimensions:** Variable width (approximately 160×20px), matching shields.io conventions.

**Layout:**
- Left section: dark background (`#555`) containing the Serenity/JS mark (scaled to ~10×10px) + "confidence" label in white
- Right section: score-coloured background + percentage text in white
- Border radius: 3px (via clipPath rect with `rx="3"`)
- Font: Verdana, Geneva, DejaVu Sans, sans-serif — 11px (same as shields.io for maximum compatibility)

**Serenity/JS mark (simplified for badge scale):**

At 10×10px, the full `SerenityJsMark` SVG paths (viewBox 0 0 244 244) would be rendered as a `<g>` element scaled to fit. The mark contains:
- White circular refresh-arrow path
- Yellow (`rgb(253,211,10)`) dot

Both paths are inlined directly in the badge SVG (no external references).

### Colour Thresholds

| Confidence Score | Colour | Hex | Meaning |
|---|---|---|---|
| ≥ 90 | Bright green | `#4c1` | High confidence — ship it |
| ≥ 75 | Green | `#97ca00` | Good confidence |
| ≥ 60 | Yellow-green | `#a4a61d` | Moderate — investigate |
| ≥ 40 | Orange | `#fe7d37` | Low — action needed |
| < 40 | Red | `#e05d44` | Critical — do not ship |

These align with shields.io conventions, giving users an intuitive colour mapping.

### Class Design

```typescript
// src/cli/aggregation/BadgeSvgWriter.ts

import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { SummaryScores } from '../reporting/ReportSummaryJson.js';

/**
 * Generates a static SVG badge displaying the confidence score,
 * suitable for embedding in README files and dashboards.
 *
 * @internal
 */
export class BadgeSvgWriter {
    constructor(private readonly fileSystem: FileSystem) {
    }

    write(scores: SummaryScores): void {
        const svg = this.render(scores.confidence);
        this.fileSystem.storeSync(
            Path.from('badge.svg'),
            svg,
            'utf8',
        );
    }

    private render(confidence: number): string {
        const displayValue = `${ Math.round(confidence) }%`;
        const colour = this.colourForScore(confidence);
        // ... returns complete SVG string
    }

    private colourForScore(score: number): string {
        if (score >= 90) return '#4c1';
        if (score >= 75) return '#97ca00';
        if (score >= 60) return '#a4a61d';
        if (score >= 40) return '#fe7d37';
        return '#e05d44';
    }
}
```

### Integration Point

In `ReportAggregator.buildSnapshot()`, after the existing `SummaryJsonWriter` call:

```typescript
// Existing:
new SummaryJsonWriter(this.fileSystem).write(snapshot, specDirectoryPath);

// New:
if (this.config.badge !== false) {
    const scores = new SummaryJsonWriter(this.fileSystem).computeScoresFrom(snapshot, specDirectoryPath);
    new BadgeSvgWriter(this.fileSystem).write(scores);
}
```

**Alternative (simpler):** Since `SummaryJsonWriter` already computes the scores internally, we can either:
1. Extract `computeScores` to a shared utility function (avoids coupling badge to summary), or
2. Have `BadgeSvgWriter` read back `summary.json` and extract the score (wasteful I/O), or
3. Compute scores directly inside `BadgeSvgWriter` from `ReportData` (duplication).

**Recommendation:** Extract a `computeSummaryScores(data: ReportData): SummaryScores` function to a shared module (e.g., `src/cli/analysis/computeSummaryScores.ts`). Both `SummaryJsonWriter` and `BadgeSvgWriter` call it. This avoids duplication and keeps both writers decoupled from each other.

### Configuration

Add to `HtmlReporterConfig`:

```typescript
export interface HtmlReporterConfig {
    // ... existing fields ...

    /**
     * Whether to generate a `badge.svg` file in the output directory
     * showing the confidence score. The badge is suitable for embedding
     * in README files and CI dashboards.
     *
     * @default true
     */
    badge?: boolean;
}
```

Default `true` means zero-config — users get the badge without asking for it. Setting `badge: false` suppresses generation.

### SVG Template

The SVG is a string template (no external dependencies). Approximate structure:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="162" height="20" role="img"
     aria-label="Serenity/JS Confidence: 87%">
  <title>Serenity/JS Confidence: 87%</title>

  <!-- Rounded rect clip -->
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="162" height="20" rx="3" fill="#fff"/></clipPath>

  <g clip-path="url(#r)">
    <!-- Left section: logo + label -->
    <rect width="108" height="20" fill="#555"/>
    <!-- Right section: score -->
    <rect x="108" width="54" height="20" fill="#4c1"/>
    <!-- Gradient overlay -->
    <rect width="162" height="20" fill="url(#s)"/>
  </g>

  <!-- Serenity/JS mark (scaled to 10x10, positioned at x=5, y=5) -->
  <g transform="translate(5,5) scale(0.041)">
    <!-- Yellow dot -->
    <g transform="matrix(0,-0.887622,-0.887622,0,121.732,93.8568)">
      <path d="M-31.404,-31.404C-48.749..." fill="rgb(253,211,10)"/>
    </g>
    <!-- White refresh arrow -->
    <g transform="matrix(0.887622,0,0,0.887622,218.751,168.337)">
      <path d="M0,-105.012L-67.217,..." fill="white"/>
    </g>
  </g>

  <!-- Text: "confidence" label -->
  <g fill="#fff" text-anchor="middle"
     font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110"
     text-rendering="geometricPrecision">
    <!-- Shadow -->
    <text x="595" y="150" fill="#010101" fill-opacity=".3"
          transform="scale(.1)">confidence</text>
    <!-- Foreground -->
    <text x="595" y="140" transform="scale(.1)">confidence</text>
    <!-- Score value -->
    <text x="1350" y="150" fill="#010101" fill-opacity=".3"
          transform="scale(.1)">87%</text>
    <text x="1350" y="140" transform="scale(.1)">87%</text>
  </g>
</svg>
```

The `role="img"` and `aria-label` attributes ensure accessibility in contexts that support ARIA on embedded SVGs.

### Width Calculation

Badge width is dynamic based on the score text length:
- Label section: fixed width (logo 18px + "confidence" text ~72px + padding = ~108px)
- Value section: varies by digit count ("8%" → narrower, "100%" → wider)
- Use character-width lookup (Verdana at 11px: digit ≈ 7px, "%" ≈ 9px) to compute exact width

This matches shields.io's approach — the total width adapts to content.

---

## Option B: External Badge Generation From summary.json

### Summary

Instead of generating the badge inside the reporter, provide a standalone utility (or script) that reads `summary.json` and produces `badge.svg`. Users invoke it as a post-processing step.

### Trade-offs vs Option A

| Aspect | Option A (built-in) | Option B (external) |
|---|---|---|
| **Zero-config** | ✓ Automatic | ✗ Requires extra step |
| **Consistency** | ✓ Always in sync with report | Risk of stale badge if step skipped |
| **CI integration** | ✓ No extra pipeline step | Requires additional `npx` command |
| **Flexibility** | Limited to our SVG format | Users could customise templates |
| **Maintenance** | We own the SVG template | Template is a separate concern |
| **Bundle size** | Negligible (string template) | N/A (separate tool) |

### Why Option A is Recommended

The badge is tiny to generate (string template, no dependencies), always derives from the same data that `SummaryJsonWriter` uses, and requires zero user effort. Adding a separate step introduces a coordination problem (stale badge if user forgets to run it) and adds friction for the most common use case: "show confidence in my README."

---

## Backwards Compatibility

- **Additive only** — new output file, new optional config field with `true` default
- **No existing behaviour changes** — `summary.json`, `data.js`, `index.html` unchanged
- **Config backwards-compatible** — existing configs without `badge` field get the badge automatically (opt-out, not opt-in)
- **No new dependencies** — pure string template generation

## Test Plan

### Unit Tests (`spec/cli/aggregation/BadgeSvgWriter.spec.ts`)

1. **generates badge.svg with correct score text** — verify output contains the rounded confidence value as text
2. **uses bright green for scores ≥ 90** — score 95 → colour `#4c1` in SVG
3. **uses green for scores ≥ 75** — score 82 → colour `#97ca00`
4. **uses yellow-green for scores ≥ 60** — score 65 → colour `#a4a61d`
5. **uses orange for scores ≥ 40** — score 45 → colour `#fe7d37`
6. **uses red for scores < 40** — score 20 → colour `#e05d44`
7. **rounds the confidence score to nearest integer** — score 87.4 → "87%"
8. **includes accessible title and aria-label** — SVG contains `<title>` and `role="img"`
9. **includes the Serenity/JS mark paths** — SVG contains the yellow dot and refresh arrow paths
10. **produces valid SVG** — output starts with `<svg xmlns=` and ends with `</svg>`

### Integration Tests

1. **badge.svg is produced alongside summary.json** — after full aggregation, output directory contains `badge.svg`
2. **badge: false suppresses badge generation** — with config `{ badge: false }`, no `badge.svg` in output
3. **badge score matches summary.json confidence** — parse both files, verify the displayed percentage matches `scores.confidence`

### Manual Verification

- Embed the generated `badge.svg` in a GitHub README and verify it renders correctly
- Verify rendering in dark mode (GitHub dark theme) — white text should remain legible
- Verify rendering at 1× and 2× DPI
- Verify the badge renders when loaded from a `file://` URL

## Implementation Sequence

1. Extract `computeSummaryScores()` from `SummaryJsonWriter` into a shared utility
2. Write failing unit tests for `BadgeSvgWriter`
3. Implement `BadgeSvgWriter` with the SVG string template
4. Wire into `ReportAggregator.buildSnapshot()`
5. Add `badge` field to `HtmlReporterConfig`
6. Add integration test verifying badge appears in output
7. Update documentation (reporter handbook page)

## Future Considerations

- **Additional badge variants** — pass rate badge, test count badge (separate files like `badge-passrate.svg`)
- **Custom badge label** — allow users to override "confidence" label text (e.g., "acceptance tests")
- **shields.io endpoint** — serve `summary.json` via a URL that shields.io can consume as a dynamic badge endpoint (for teams that prefer shields.io rendering)
- **Badge in summary.json** — include a `badgeUrl` field in `summary.json` pointing to the relative badge path
