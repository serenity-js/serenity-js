# @serenity-js/html-reporter

A self-contained static HTML reporter for [Serenity/JS](https://serenity-js.org) that produces rich, interactive test reports with trend analysis, confidence scoring, and living documentation — with zero external dependencies.

## Features

- **Self-contained** — all JavaScript, CSS, and libraries are inlined; works on `file://`, GitHub Pages, GitLab Pages, S3, or any static hosting
- **Air-gapped environments** — no CDN links, no fetch calls, no external network requests
- **Trend analysis** — historical test run data is preserved between runs, showing execution history and consistency
- **Confidence scoring** — capabilities are scored based on pass rate, completeness, and stability
- **Living documentation** — renders README files alongside test results in the capabilities view
- **Activity trees** — shows every Task, Interaction, and assertion with timing, screenshots, and HTTP exchanges
- **Dark and light mode** — detects OS preference, with manual toggle

## Installation

```bash
npm install --save-dev @serenity-js/html-reporter
```

## Usage

### As a StageCrewMember (recommended)

Configure the reporter in your test runner configuration. The reporter collects events during the test run, writes `db.json` and artifacts to the output directory, and generates the HTML report.

#### Playwright Test

```typescript
import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        ['@serenity-js/playwright-test', {
            crew: [
                ['@serenity-js/html-reporter', {
                    outputDirectory: './reports/serenity',
                    specDirectory: './spec',
                    title: 'My Project',
                }],
            ],
        }],
    ],
});
```

#### WebdriverIO

```typescript
// wdio.conf.ts
export const config = {
    framework: '@serenity-js/webdriverio',
    serenity: {
        crew: [
            ['@serenity-js/html-reporter', {
                outputDirectory: './reports/serenity',
                specDirectory: './spec',
                title: 'My Project',
            }],
        ],
    },
};
```

#### Cucumber.js, Mocha, or Jasmine

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        ['@serenity-js/html-reporter', {
            outputDirectory: './reports/serenity',
            specDirectory: './features',
            title: 'My Project',
        }],
    ],
});
```

### Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputDirectory` | `string` | `./reports/serenity-js` | Directory for the generated report |
| `specDirectory` | `string` | — | Root directory for deriving the capabilities hierarchy |
| `title` | `string` | — | Custom title displayed in the report header |
| `maxHistory` | `number` | — | Maximum test runs to retain (older runs are pruned) |
| `consistencyWindow` | `number` | `5` | Number of recent runs considered for consistency analysis |

### Output structure

```
reports/serenity/
├── index.html              # Report (regenerated each run)
├── data.js                 # Aggregated data snapshot (regenerated each run)
└── test-runs/
    ├── 2024-06-14T10:00:00.000Z/
    │   ├── db.json         # Run data for this test run
    │   ├── screenshot-*.png
    │   └── video-*.webm
    └── 2024-06-15T14:30:00.000Z/
        ├── db.json
        └── screenshot-*.png
```

## CLI: Aggregating reports from multiple sources

For CI pipelines that run tests in parallel jobs, use the CLI to aggregate results from multiple sources into a single report:

```bash
npx @serenity-js/html-reporter \
  --input "modules/*/reports/serenity/test-runs/*" \
  --output ./reports/serenity \
  --title "My Project" \
  --specRoot ./spec \
  --maxHistory 20
```

| Option | Description |
|--------|-------------|
| `--input` | Glob pattern(s) for directories containing `db.json` files (comma-separated) |
| `--output` | Output directory for the generated report |
| `--title` | Report title |
| `--specRoot` | Root directory for the capabilities hierarchy |
| `--maxHistory` | Maximum number of test runs to keep |

## Preserving history across CI runs

The report supports trend analysis by preserving `test-runs/*/db.json` files between runs. In CI, you need to restore the previous report output before running the aggregator so that historical data is included.

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
          merge-multiple: true

      # Aggregate: include both historical and current run data
      - run: |
          npx @serenity-js/html-reporter \
            --input "target/html-report-data/**/test-runs/*,target/html-report/test-runs/*" \
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
    - npx @serenity-js/html-reporter
        --input "reports/serenity/test-runs/*"
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
                    npx @serenity-js/html-reporter \
                        --input "reports/serenity/test-runs/*" \
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

On Jenkins, the workspace is typically preserved between builds, so historical `test-runs/` directories accumulate naturally. Use `--maxHistory` to prevent unbounded growth.

### Any CI provider

The pattern is the same regardless of the CI tool:

1. **Persist the output directory** between runs (via deployment branch, artifact storage, shared volume, or S3)
2. **Restore** the previous output before running the aggregator
3. **Include both** the new test data and the restored historical data as `--input`
4. **Deploy** the output directory to your hosting

The aggregator deduplicates by test run timestamp — if the same `db.json` appears in both sources, it's merged (not doubled).

## How it works

1. During the test run, `HtmlReporter` (a `StageCrewMember`) collects domain events and writes artifacts (screenshots, videos) immediately to `test-runs/<timestamp>/`
2. At test run completion, it writes `db.json` with the full test execution data
3. It aggregates all `test-runs/*/db.json` files into `data.js` — computing trend data, consistency analysis, and confidence scores
4. It writes `index.html` with all JavaScript and CSS inlined

The `data.js` file is the single data source for the report template. It's assigned to `window.__SERENITY_REPORT_DATA__` and loaded via a `<script>` tag, enabling `file://` protocol support.

## License

[Apache-2.0](https://github.com/serenity-js/serenity-js/blob/main/LICENSE.md)

---

_Part of [Serenity/JS](https://serenity-js.org). Copyright © 2016– [Jan Molak](https://janmolak.com) and the Serenity Team._
