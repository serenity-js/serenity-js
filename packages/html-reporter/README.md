# Serenity/JS HTML Reporter

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fhtml-reporter.svg)](https://badge.fury.io/js/%40serenity-js%2Fhtml-reporter)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/html-reporter/badge.svg)](https://snyk.io/test/npm/@serenity-js/html-reporter)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/html-reporter`](https://serenity-js.org/api/html-reporter/) produces a self-contained, interactive HTML report from your [Serenity/JS](https://serenity-js.org) test results — complete with screenshots, activity trees, execution history, and trend analysis.

[📊 See the Serenity/JS test suite report →](https://serenity-js.github.io/serenity-js/)

## Features

- **Single HTML file** — all JavaScript, CSS, and data inlined; works from `file://`, GitHub Pages, S3, or any static host
- **No external dependencies at runtime** — works in air-gapped environments, no CDN links, no network requests
- **Execution history and trends** — preserves data across runs, showing how tests behave over time
- **Activity trees with evidence** — every Task, Interaction, and assertion shown with timing, screenshots, and HTTP exchanges
- **Consistency analysis** — identifies flaky, degraded, and recovered tests automatically
- **Error clustering** — groups failures by root cause so you can see which tests share the same underlying problem
- **Living documentation** — renders README files alongside test results in the capabilities view
- **Dark and light themes** — detects OS preference, with manual toggle

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/html-reporter
```

## Quick Start

Add the reporter to your Serenity/JS crew configuration.

### Playwright Test

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        ['@serenity-js/playwright-test', {
            crew: [
                ['@serenity-js/html-reporter', {
                    outputDirectory: './reports/serenity',
                    title: 'My Project',
                }],
            ],
        }],
    ],
});
```

Learn more about using [Serenity/JS with Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/).

### WebdriverIO

```typescript
// wdio.conf.ts
export const config = {
    framework: '@serenity-js/webdriverio',
    serenity: {
        crew: [
            ['@serenity-js/html-reporter', {
                outputDirectory: './reports/serenity',
                title: 'My Project',
            }],
        ],
    },
};
```

Learn more about using [Serenity/JS with WebdriverIO](https://serenity-js.org/handbook/test-runners/webdriverio/).

### Cucumber, Mocha, or Jasmine

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        ['@serenity-js/html-reporter', {
            outputDirectory: './reports/serenity',
            title: 'My Project',
        }],
    ],
});
```

Learn more about using Serenity/JS with [Cucumber](https://serenity-js.org/handbook/test-runners/cucumber/), [Mocha](https://serenity-js.org/handbook/test-runners/mocha/), or [Jasmine](https://serenity-js.org/handbook/test-runners/jasmine/).

### View the report

After your tests complete, open the report directly or serve it locally:

```sh
npx @serenity-js/html-reporter serve --dir ./reports/serenity --open
```

## Configuration Options

| Option              | Type     | Default                 | Description                                                   |
|---------------------|----------|-------------------------|---------------------------------------------------------------|
| `outputDirectory`   | `string` | `./reports/serenity-js` | Where the report is generated                                 |
| `title`             | `string` | —                       | Report title shown in the header                              |
| `specDirectory`     | `string` | —                       | Root of your specs, used to build the capabilities hierarchy  |
| `maxHistory`        | `number` | —                       | Maximum test runs to retain (older runs are pruned)           |
| `consistencyWindow` | `number` | `5`                     | Number of recent runs used to detect flaky tests              |

> **Note:** `consistencyWindow` is effectively capped at `maxHistory`. If you set `consistencyWindow: 10` but `maxHistory: 5`, the reporter uses the 5 available runs for detecting consistency issues.

## CLI

The package includes a CLI for aggregating results from multiple parallel jobs and serving reports locally.

```sh
# Aggregate results from parallel CI jobs into a single report
npx @serenity-js/html-reporter aggregate \
  --input "modules/*/reports/serenity/test-runs/**" \
  --output ./reports/serenity \
  --title "My Project"

# Serve the report locally
npx @serenity-js/html-reporter serve --dir ./reports/serenity --open
```

## CI Integration

The reporter preserves execution history across runs when you persist its output directory between builds. This enables trend analysis and consistency scoring.

The pattern works with any CI provider:
1. **Restore** the previous report output before running tests
2. **Run** your test suite (the reporter writes to the output directory)
3. **Deploy** the output to static hosting (GitHub Pages, GitLab Pages, S3, etc.)

See the [Serenity/JS CI/CD integration guide](https://serenity-js.org/handbook/reporting/) for provider-specific examples.

## Documentation

- [API Reference](https://serenity-js.org/api/html-reporter/)
- [Reporting Guide](https://serenity-js.org/handbook/reporting/)
- [Serenity/JS Project Templates](https://serenity-js.org/getting-started/project-templates/)
- [Tutorial: First Web Scenario](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/)

## Contributing

Contributions of all kinds are welcome! Get started with the [Contributing Guide](https://serenity-js.org/community/contributing/).

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [Discussions Forum](https://github.com/orgs/serenity-js/discussions)
    - Visit the [💡How to... ?](https://github.com/orgs/serenity-js/discussions/categories/how-to) section for answers to common questions

If you enjoy using Serenity/JS, make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

## License

The Serenity/JS code base is licensed under the [Apache-2.0](https://opensource.org/license/apache-2-0) license,
while its documentation and the [Serenity/JS Handbook](https://serenity-js.org/handbook/) are licensed under the [Creative Commons BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the [Serenity/JS License](https://serenity-js.org/legal/license/).

## Support

Support ongoing development through [GitHub Sponsors](https://github.com/sponsors/serenity-js). Sponsors gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks)
and priority help in the [Discussions Forum](https://github.com/orgs/serenity-js/discussions).

For corporate sponsorship or commercial support, please contact [Jan Molak](https://www.linkedin.com/in/janmolak/).

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
