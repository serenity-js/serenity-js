# HTML Reporter

This module tests the `@serenity-js/html-reporter` — a self-contained static HTML report that replaces the Java-based Serenity BDD CLI.

## Why the HTML Reporter?

- **Zero external dependencies** – the generated report works on `file://` protocol, GitHub Pages, or any static hosting with no backend
- **Air-gapped environments** – all JavaScript, CSS, and libraries are inlined; no CDN or network requests
- **Trend analysis** – historical test run data is preserved between runs, enabling execution history and consistency analysis
- **Living documentation** – the requirements hierarchy renders README files alongside test results

## Features demonstrated

The tests tagged [`@showcase`](https://serenity-js.github.io/serenity-js/?route=/tests&search=%40tag%3Ashowcase) demonstrate the key user journeys through the report:

- Dashboard with confidence score, trend chart, and actionable cards (new failures, consistency, slowest tests)
- Test scenario list with search, outcome filters, sort, and category grouping
- Scenario detail view with activity tree, retry attempts, error blocks, screenshots, and video
- Capabilities view with confidence scoring, outcome bars, and README rendering
- Consistency view identifying unstable, degraded, and recovered tests
- Error analysis view grouping failures by type and impact
- Timeline view showing parallel execution as a Gantt chart
- Tags view with pass rate per tag
- Test runs view with historical run list and CI job links
- System context view (Node.js, OS, browser, CI metadata)
- Dark and light theme with OS preference detection
- Virtual scrolling for large datasets (5000+ scenarios)
- HTTP request/response visualisation in the activity tree
- Data artifact rendering (LogEntry, TextData, JSONData)
