# Migrating from @serenity-js/serenity-bdd

This guide covers two paths for adopting `@serenity-js/html-reporter`:
replacing `@serenity-js/serenity-bdd` entirely, or running both reporters side by side.

## Key Differences

| | Serenity BDD Reporter | HTML Reporter |
|---|---|---|
| **Java required** | Yes (JRE 11+) | No |
| **Report generation** | Separate `serenity-bdd run` step after tests | Automatic at end of test run |
| **Output format** | Multi-page HTML site (requires a web server) | Single self-contained HTML file |
| **Works from `file://`** | No | Yes |
| **npm-failsafe needed** | Yes (report step must run even when tests fail) | No |
| **Screenshot handling** | Requires `ArtifactArchiver` crew member | Built-in (handles artifacts internally) |
| **Execution history** | Per-run only | Cross-run trends and consistency analysis |
| **Extra packages** | `rimraf`, `npm-failsafe` | None |

## Path 1: Running Both Reporters Together (Recommended First Step)

Both reporters can coexist in the same `crew` array. They write to different directories
and don't conflict. Try this approach first to compare reports before fully migrating.

### Playwright Test

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        ['line'],
        ['@serenity-js/playwright-test', {
            crew: [
                // New HTML Reporter — generates report automatically
                ['@serenity-js/html-reporter', {
                    outputDirectory: './reports/serenity',
                    title: 'My Project',
                }],

                // Existing Serenity BDD Reporter — keep until you're ready to remove
                '@serenity-js/serenity-bdd',
                ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
            ],
        }],
    ],
});
```

### WebdriverIO

```typescript
// wdio.conf.ts
export const config = {
    framework: '@serenity-js/webdriverio',
    serenity: {
        crew: [
            // New HTML Reporter
            ['@serenity-js/html-reporter', {
                outputDirectory: './reports/serenity',
                title: 'My Project',
            }],

            // Existing Serenity BDD Reporter
            '@serenity-js/serenity-bdd',
            ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
        ],
    },
};
```

### Cucumber, Mocha, or Jasmine (standalone)

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        // New HTML Reporter
        ['@serenity-js/html-reporter', {
            outputDirectory: './reports/serenity',
            title: 'My Project',
        }],

        // Existing Serenity BDD Reporter
        '@serenity-js/serenity-bdd',
        ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
    ],
});
```

With both reporters active, you can compare reports after each test run and migrate
when you're comfortable with the html-reporter output.

## Path 2: Replacing Serenity BDD Reporter Entirely

Once you're ready to fully switch, follow these steps.

### Step 1: Install the HTML Reporter

```sh
npm install --save-dev @serenity-js/html-reporter
```

### Step 2: Remove Serenity BDD packages

```sh
npm uninstall @serenity-js/serenity-bdd rimraf npm-failsafe
```

> **Note:** Keep `rimraf` if you use it elsewhere. Only remove `npm-failsafe` if the
> `serenity-bdd run` step was its only purpose.

### Step 3: Update crew configuration

Remove `@serenity-js/serenity-bdd` and `@serenity-js/core:ArtifactArchiver` from the crew
array. Replace with `@serenity-js/html-reporter`.

**Keep `Photographer`** if you want screenshots — it captures the images that the
html-reporter embeds in the report.

#### Playwright Test — before

```typescript
// playwright.config.ts
export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        ['line'],
        ['@serenity-js/playwright-test', {
            crew: [
                '@serenity-js/serenity-bdd',
                ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
            ],
        }],
    ],
    use: {
        crew: [
            ['@serenity-js/web:Photographer', { strategy: 'TakePhotosOfInteractions' }],
        ],
    },
});
```

#### Playwright Test — after

```typescript
// playwright.config.ts
export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    reporter: [
        ['line'],
        ['@serenity-js/playwright-test', {
            crew: [
                ['@serenity-js/html-reporter', {
                    outputDirectory: './reports/serenity',
                    title: 'My Project',
                }],
            ],
        }],
    ],
    use: {
        crew: [
            // Keep Photographer — it captures screenshots for the report
            ['@serenity-js/web:Photographer', { strategy: 'TakePhotosOfInteractions' }],
        ],
    },
});
```

#### WebdriverIO — before

```typescript
// wdio.conf.ts
export const config = {
    framework: '@serenity-js/webdriverio',
    serenity: {
        crew: [
            '@serenity-js/serenity-bdd',
            ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
        ],
    },
};
```

#### WebdriverIO — after

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

#### Cucumber, Mocha, or Jasmine — before

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        '@serenity-js/serenity-bdd',
        ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
    ],
});
```

#### Cucumber, Mocha, or Jasmine — after

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

### Step 4: Simplify package.json scripts

The html-reporter generates the report automatically when the test run finishes.
There is no separate generation step.

#### Before

```json
{
  "scripts": {
    "clean": "rimraf target",
    "test": "failsafe clean test:execute test:report",
    "test:execute": "npx playwright test",
    "test:report": "serenity-bdd run --features='./tests' --source='./target/site/serenity' --destination='./target/site/serenity'"
  }
}
```

#### After

```json
{
  "scripts": {
    "test": "npx playwright test"
  }
}
```

That's it. No `clean` step, no `failsafe` wrapper, no `test:report` step.
The report appears in your configured `outputDirectory` as soon as the tests complete.

### Step 5: Update .gitignore

Replace the old output directory with the new one:

```diff
- target/site/serenity
+ reports/serenity
```

Or keep both if you used a custom directory name.

### Step 6: View the report

Open the generated `index.html` directly in your browser, or use the built-in server:

```sh
npx @serenity-js/html-reporter serve --dir ./reports/serenity --open
```

## What About Screenshots?

The `Photographer` Crew Member (from `@serenity-js/web`) still captures screenshots.
What changes is how they're stored:

| Setup | Who captures? | Who stores? |
|---|---|---|
| Serenity BDD | `Photographer` | `ArtifactArchiver` (separate crew member) |
| HTML Reporter | `Photographer` | `HtmlReporter` (built-in) |

Remove `ArtifactArchiver` when switching to the html-reporter — it handles artifact
storage internally. Keep `Photographer` in the test-level `crew` if you want screenshots.

## Configuration Options

The html-reporter accepts these options:

| Option              | Type     | Default                 | Description                                                    |
|---------------------|----------|-------------------------|----------------------------------------------------------------|
| `outputDirectory`   | `string` | `./reports/serenity-js` | Where the report is generated                                  |
| `title`             | `string` | —                       | Report title shown in the header                               |
| `specDirectory`     | `string` | —                       | Root of your specs, used to build the capabilities hierarchy   |
| `maxHistory`        | `number` | —                       | Maximum test runs to retain (older runs are pruned)            |
| `consistencyWindow` | `number` | `5`                     | Number of recent runs used for consistency and flakiness analysis |
| `projectName`       | `string` | —                       | Project name shown in the report (defaults to `package.json` name) |
| `testRunId`         | `string` | Auto-detected from CI   | Identifier for the test run directory                          |
| `moduleId`          | `string` | —                       | Identifier for parallel CI job shards                          |

## FAQ

### Do I still need Java?

No. The html-reporter is pure Node.js — no JRE, no JAR downloads, no `serenity-bdd update`.

### Can I keep using `specDirectory` for the capabilities hierarchy?

Yes. The html-reporter accepts `specDirectory` and uses it to build the same capabilities
tree structure. The option works the same way.

### What about the `serenity-bdd run` CLI command?

It's no longer needed. The html-reporter generates the report automatically when
`TestRunFinishes` fires (i.e., at the end of your test suite). If you need to aggregate
results from multiple parallel CI jobs, use:

```sh
npx @serenity-js/html-reporter aggregate \
  --input "modules/*/reports/serenity/test-runs/**" \
  --output ./reports/serenity \
  --title "My Project"
```

### Does the report work on GitHub Pages / S3 / static hosting?

Yes. The report is a single self-contained HTML file. Deploy the `outputDirectory` contents
to any static host. The reporter preserves execution history across runs when the output
directory is persisted between builds.

### What if my CI pipeline uses `npm-failsafe`?

With Serenity BDD, `npm-failsafe` ensured the `serenity-bdd run` report generation step
always executed — even when tests failed. Since the html-reporter generates the report
as part of the test run itself, this is no longer necessary. Remove `npm-failsafe` from
your scripts (unless you use it for other purposes).
