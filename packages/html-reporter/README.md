# @serenity-js/html-reporter

A self-contained static HTML reporter for [Serenity/JS](https://serenity-js.org) that produces rich, interactive test
reports with trend analysis, confidence scoring, and living documentation — with zero external dependencies.

## Features

- **Self-contained** — all JavaScript, CSS, and libraries are inlined; works on `file://`, GitHub Pages, GitLab Pages,
  S3, or any static hosting
- **Air-gapped environments** — no CDN links, no fetch calls, no external network requests
- **Trend analysis** — historical test run data is preserved between runs, showing execution history and consistency
- **Confidence scoring** — capabilities are scored based on pass rate, completeness, and stability
- **Living documentation** — renders README files alongside test results in the capabilities view
- **Activity trees** — shows every Task, Interaction, and assertion with timing, screenshots, and HTTP exchanges
- **Dark and light mode** — detects OS preference, with manual toggle

Learn more about [Serenity/JS reporting](https://serenity-js.org/handbook/reporting/).

## Installation

```bash
npm install --save-dev @serenity-js/core @serenity-js/html-reporter
```

## Usage

### As a StageCrewMember (recommended)

Configure the reporter in your test runner configuration. The reporter collects events during the test run, writes
`db.json` and artifacts to the output directory, and generates the HTML report.

#### Playwright Test

```typescript
import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        [ '@serenity-js/playwright-test', {
            crew: [
                [ '@serenity-js/html-reporter', {
                    outputDirectory: './reports/serenity',
                    specDirectory: './spec',
                    title: 'My Project',
                } ],
            ],
        } ],
    ],
});
```

Learn more about [using Playwright Test with Serenity/JS](https://serenity-js.org/handbook/test-runners/playwright-test/).

#### WebdriverIO

```typescript
// wdio.conf.ts
export const config = {
    framework: '@serenity-js/webdriverio',
    serenity: {
        crew: [
            [ '@serenity-js/html-reporter', {
                outputDirectory: './reports/serenity',
                specDirectory: './spec',
                title: 'My Project',
            } ],
        ],
    },
};
```

Learn more about [using WebdriverIO with Serenity/JS](https://serenity-js.org/handbook/test-runners/webdriverio/).

#### Cucumber.js, Mocha, or Jasmine

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        [ '@serenity-js/html-reporter', {
            outputDirectory: './reports/serenity',
            specDirectory: './features',
            title: 'My Project',
        } ],
    ],
});
```

Learn more about using Serenity/JS with [Cucumber.js](https://serenity-js.org/handbook/test-runners/cucumber/), [Mocha](https://serenity-js.org/handbook/test-runners/mocha/), or [Jasmine](https://serenity-js.org/handbook/test-runners/jasmine/).

### Configuration options

| Option              | Type     | Default                 | Description                                                                                     |
|---------------------|----------|-------------------------|-------------------------------------------------------------------------------------------------|
| `outputDirectory`   | `string` | `./reports/serenity-js` | Directory for the generated report                                                              |
| `specDirectory`     | `string` | —                       | Root directory for deriving the capabilities hierarchy                                          |
| `title`             | `string` | —                       | Custom title displayed in the report header                                                     |
| `maxHistory`        | `number` | —                       | Maximum test runs to retain (older runs are pruned)                                             |
| `consistencyWindow` | `number` | `5`                     | Number of recent runs considered for consistency analysis                                       |
| `testRunId`         | `string` | auto-detected from CI   | Identifier for the test run. Auto-detected from `GITHUB_RUN_NUMBER`, `CI_PIPELINE_IID`, etc.   |
| `moduleId`          | `string` | auto-detected from cwd  | Identifier for the parallel CI job. Auto-detected from the working directory name when on CI    |
| `projectName`       | `string` | from `package.json`     | Custom project name displayed in the report                                                     |

### Output structure

The directory layout depends on whether the reporter runs locally or on CI with parallel jobs.

**Local runs** (no CI environment detected):

```
reports/serenity/
├── index.html
├── data.js
└── test-runs/
    └── 2024-06-15T14:30:00.000Z/
        ├── db.json
        ├── screenshot-*.png
        └── video-*.webm
```

**CI with parallel jobs** (testRunId + moduleId detected):

```
reports/serenity/
├── index.html
├── data.js
└── test-runs/
    └── 42/                          # buildId (from GITHUB_RUN_NUMBER etc.)
        ├── db.json                  # merged data from all modules
        ├── playwright-web-1/        # {moduleId}-{attempt} — screenshots from this job
        │   ├── screenshot-*.png
        │   └── video-*.webm
        ├── webdriverio-web-1/
        │   └── screenshot-*.png
        └── protractor-web-1/
            └── screenshot-*.png
```

On CI, `testRunId` is the build number (shared across all parallel jobs in the same pipeline run) and `moduleId` is
derived from the working directory basename (e.g. `playwright-web` when running from `integration/playwright-web/`).
This ensures each parallel job writes artifacts to its own subdirectory without collisions.

When a CI job is retried, the attempt number increments (e.g. `playwright-web-2`), and the aggregator merges both
attempts — recording the retry history on affected scenarios.

## CLI

The `@serenity-js/html-reporter` package includes a CLI for aggregating test run data and serving reports locally.

```bash
npx @serenity-js/html-reporter <command> [options]
```

### `aggregate` — Generate a report from test run data

Aggregate `db.json` files from one or more sources into a single HTML report with trend analysis:

```bash
npx @serenity-js/html-reporter aggregate \
  --input "modules/*/reports/serenity/test-runs/**" \
  --output ./reports/serenity \
  --title "My Project" \
  --specRoot ./spec \
  --maxHistory 20
```

| Option                | Description                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `--input`             | Glob pattern(s) for directories containing `db.json` files (comma-separated) |
| `--output`            | Output directory for the generated report (default: `./reports/serenity-js`) |
| `--title`             | Report title                                                                 |
| `--specRoot`          | Root directory for the capabilities hierarchy                                |
| `--maxHistory`        | Maximum number of test runs to keep                                          |
| `--consistencyWindow` | Number of recent runs used to identify flaky tests (default: `5`)            |

### `serve` — Serve the report locally

Start a local HTTP server to view the generated report in your browser:

```bash
npx @serenity-js/html-reporter serve \
  --dir ./reports/serenity \
  --port 8080 \
  --open
```

| Option   | Description                                           |
|----------|-------------------------------------------------------|
| `--dir`  | Directory containing the report (default: `./reports/serenity-js`) |
| `--port` | Port to listen on (default: `8080`)                   |
| `--host` | Host to bind to (default: `localhost`)                |
| `--open` | Open the report in the default browser               |

### Typical local workflow

```bash
# Run tests (produces test-run data)
npm test

# Generate report
npx @serenity-js/html-reporter aggregate \
  --input "reports/serenity/test-runs/*" \
  --output ./reports/serenity

# View in browser
npx @serenity-js/html-reporter serve --dir ./reports/serenity --open
```

### How aggregation works

1. The CLI finds all `db.json` files matching the input patterns
2. Files are grouped by `testRunId` (or `startedAt` timestamp as fallback for local runs)
3. Within each group, files with the same `attempt` number are merged **additively** (scenes concatenated, outcomes
   summed) — this handles multiple parallel jobs contributing to the same build
4. Across different attempt numbers, files are merged as **retries** — earlier attempts are recorded in the scenario's
   `attempts[]` array, with the latest attempt's result as the final outcome
5. The merged result is written to `test-runs/{buildId}/db.json` in the output directory
6. Artifacts (screenshots, videos) are copied into `test-runs/{buildId}/{moduleId}-{attempt}/`
7. Historical runs beyond `--maxHistory` are pruned (entire build directories removed)

## Preserving history across CI runs

The report supports trend analysis by preserving `test-runs/*/db.json` files between runs. In CI, you need to restore
the previous report output before running the aggregator so that historical data is included.

### GitHub Actions

```yaml
jobs:
  html-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Restore historical test runs from GitHub Pages
      - uses: actions/checkout@v4
        with:
          ref: gh-pages
          path: target/html-report
        continue-on-error: true  # First run won't have gh-pages yet

      # Download current run's test data (from parallel test jobs)
      - uses: actions/download-artifact@v4
        with:
          pattern: 'html-report-data-*'
          path: target/html-report-data

      # Aggregate: include both historical and current run data
      - run: |
          npx @serenity-js/html-reporter aggregate \
            --input "target/html-report-data/**/test-runs/**,target/html-report/test-runs/*" \
            --output ./target/html-report \
            --title "My Project" \
            --maxHistory 20

      # Deploy to GitHub Pages
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: target/html-report
          clean: false  # Preserve test-runs/ from previous deployments
```

Each parallel test job should upload its test-run data as an artifact:

```yaml
  - name: Upload html-report data
    if: always()
    uses: actions/upload-artifact@v4
    with:
      name: 'html-report-data-${{ matrix.module }}-attempt-${{ github.run_attempt }}'
      path: reports/serenity/test-runs/
      retention-days: 3
      if-no-files-found: ignore
```

### GitLab CI

```yaml
stages:
  - test
  - report

test:
  stage: test
  script:
    - npm test
  artifacts:
    paths:
      - reports/serenity/test-runs/
    expire_in: 1 day

html-report:
  stage: report
  script:
    # Restore previous report from GitLab Pages
    - |
      if git fetch origin gl-pages 2>/dev/null; then
        git worktree add /tmp/pages gl-pages
        cp -r /tmp/pages/test-runs reports/serenity/ 2>/dev/null || true
      fi
    # Aggregate all results
    - npx @serenity-js/html-reporter aggregate
      --input "reports/serenity/test-runs/**"
      --output public
      --title "My Project"
      --maxHistory 20
  artifacts:
    paths:
      - public
  pages:
  # GitLab automatically deploys the 'public' artifact to Pages
```

### Jenkins

```groovy
pipeline {
    stages {
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Report') {
            steps {
                // Historical runs persist on the Jenkins workspace
                sh '''
                    npx @serenity-js/html-reporter aggregate \
                        --input "reports/serenity/test-runs/**" \
                        --output reports/serenity \
                        --title "My Project" \
                        --maxHistory 20
                '''
            }
            post {
                always {
                    publishHTML(target: [
                        reportDir: 'reports/serenity',
                        reportFiles: 'index.html',
                        reportName: 'Serenity/JS Report'
                    ])
                }
            }
        }
    }
}
```

On Jenkins, the workspace is typically preserved between builds, so historical `test-runs/` directories accumulate
naturally. Use `--maxHistory` to prevent unbounded growth.

### Any CI provider

The pattern is the same regardless of the CI tool:

1. **Persist the output directory** between runs (via deployment branch, artifact storage, shared volume, or S3)
2. **Restore** the previous output before running the aggregator
3. **Include both** the new test data and the restored historical data as `--input`
4. **Deploy** the output directory to your hosting

The aggregator deduplicates by `testRunId` — if the same `db.json` appears in both sources, it's merged (not doubled).

## How it works

1. During the test run, the reporter collects domain events and writes artifacts (screenshots, videos) immediately
2. At test run completion, it writes `db.json` with the full test execution data:
   - **Locally:** to `test-runs/{ISO-timestamp}/`
   - **On CI:** to `test-runs/{buildId}/{moduleId}-{attempt}/`
3. It aggregates all `test-runs/*/db.json` files into `data.js` — computing trend data, consistency analysis, and
   confidence scores
4. It writes `index.html` with all JavaScript and CSS inlined

The `data.js` file is the single data source for the report template. It's assigned to `window.__SERENITY_REPORT_DATA__`
and loaded via a `<script>` tag, enabling `file://` protocol support.

## TestRunArchiver: archive-only mode

For CI pipelines where report generation is deferred to a separate aggregation step, use `TestRunArchiver` instead of
the full `HtmlReporter`. It writes `db.json` and artifacts without generating the HTML report:

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        [ '@serenity-js/html-reporter:TestRunArchiver', {
            outputDirectory: './reports/serenity',
        } ],
    ],
});
```

This is the recommended approach for parallel CI jobs — each job archives its data, then a final aggregation step
combines everything into the report.

## License

[Apache-2.0](https://github.com/serenity-js/serenity-js/blob/main/LICENSE.md)

---

_Part of [Serenity/JS](https://serenity-js.org). Copyright © 2016– [Jan Molak](https://janmolak.com) and the Serenity
Team._
