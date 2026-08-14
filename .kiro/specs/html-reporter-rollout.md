# HTML Reporter Rollout Plan

Spec for migrating all Serenity/JS project templates from `@serenity-js/serenity-bdd` (Java-based) to `@serenity-js/html-reporter`, and updating the website documentation.

## Current State

- **All 12 templates** use `@serenity-js/serenity-bdd` + `ArtifactArchiver` + `npm-failsafe` + `rimraf`
- **None** use `@serenity-js/html-reporter`
- All templates run `serenity-bdd run` as a post-test step (requires Java JRE in the CI container)
- All CI workflows use `ghcr.io/serenity-js/playwright:v1.58.1-noble` container (includes Java)
- All templates output reports to `target/site/serenity/`
- The **website** already has comprehensive html-reporter docs (`handbook/reporting/html-reporter.mdx`)
- The **getting-started** pages (Playwright, WebdriverIO, Cucumber) already reference `@serenity-js/html-reporter`
- The **project templates page**, **test-runner handbook pages**, and **tutorial** still show serenity-bdd only

## Template Inventory (ranked by GitHub stars, ascending)

| # | Template | Stars | Test Runner | Config File |
|---|----------|:-----:|-------------|-------------|
| 1 | `serenity-js-mocha-protractor-template` | 0 | Mocha + Protractor | `protractor.conf.js` |
| 2 | `serenity-js-jasmine-webdriverio-template` | 2 | Jasmine + WebdriverIO | `wdio.conf.ts` |
| 3 | `serenity-js-mocha-template` | 2 | Mocha (API-only) | `.mocharc.yml` + `spec/support/serenity.config.ts` |
| 4 | `serenity-js-jasmine-protractor-template` | 3 | Jasmine + Protractor | `protractor.conf.js` |
| 5 | `serenity-js-playwright-ct-react-template` | 3 | Playwright CT (React) | `playwright-ct.config.ts` |
| 6 | `serenity-js-playwright-ct-web-components-template` | 3 | Playwright CT (Web Comp.) | `playwright.config.ts` |
| 7 | `serenity-js-cucumber-protractor-template` | 8 | Cucumber + Protractor | `protractor.conf.js` |
| 8 | `serenity-js-cucumber-template` | 9 | Cucumber (API-only) | `cucumber.js` + `features/support/serenity.config.ts` |
| 9 | `serenity-js-mocha-webdriverio-template` | 12 | Mocha + WebdriverIO | `wdio.conf.ts` |
| 10 | `serenity-js-cucumber-webdriverio-template` | 22 | Cucumber + WebdriverIO | `wdio.conf.ts` |
| 11 | `serenity-js-playwright-test-template` | 24 | Playwright Test | `playwright.config.ts` |
| 12 | `serenity-js-cucumber-playwright-template` | 32 | Cucumber + Playwright | `cucumber.js` + `features/support/serenity.config.ts` |

---

## Phased Rollout

### Phase 1 — Canary (templates #1–#6, ≤ 3 stars each)

Update the 6 least-popular templates. These serve as canaries to validate the migration pattern with minimal user impact.

**Templates:**
- `serenity-js-mocha-protractor-template`
- `serenity-js-jasmine-webdriverio-template`
- `serenity-js-mocha-template`
- `serenity-js-jasmine-protractor-template`
- `serenity-js-playwright-ct-react-template`
- `serenity-js-playwright-ct-web-components-template`

### Phase 2 — Mid-tier (templates #7–#9, 8–12 stars)

**Templates:**
- `serenity-js-cucumber-protractor-template`
- `serenity-js-cucumber-template`
- `serenity-js-mocha-webdriverio-template`

### Phase 3 — Website Documentation Update

Update the website so that docs are consistent before the most-used templates switch. See [Website Changes](#website-changes) below.

**Status: Mostly complete.** The following have been done:
- ✅ GitHub Actions guide written (single-module, multi-module, trend history, Docker)
- ✅ GitLab CI guide rewritten (HTML Reporter primary, multi-module, JUnit, Serenity BDD alternative)
- ✅ Jenkins CI guide written (Docker agent, HTML Publisher, CSP, parallel stages, trend history)
- ✅ Docker page updated (-noble → -resolute suffix)
- ✅ html-reporter.mdx updated (config table, install, --input, consistencyWindow note)
- ✅ Package READMEs updated (playwright-test, playwright, webdriverio-8, protractor, webdriverio, console-reporter, serenity-bdd)

**Remaining Phase 3 work:**
- [ ] Update `getting-started/project-templates.mdx` (replace Serenity BDD feature bullet with HTML Reports)
- [ ] Update test-runner handbook pages (playwright-test, webdriverio, cucumber, mocha, jasmine) reporting sections
- [ ] Update tutorial (`your-first-web-scenario.mdx`) to show html-reporter setup + re-record GIFs
- [ ] Add `@serenity-js/html-reporter` to site package.json for TypeDoc API doc generation
- [ ] Update WebdriverIO project setup wizard to install @serenity-js/html-reporter by default

### Phase 4 — High-traffic (templates #10–#12, 22–32 stars)

**Templates:**
- `serenity-js-cucumber-webdriverio-template`
- `serenity-js-playwright-test-template`
- `serenity-js-cucumber-playwright-template`

---

## Per-Template Change Specification

### 1. package.json — dependencies

```diff
- "@serenity-js/serenity-bdd": "^3.x.x",
- "npm-failsafe": "^1.x.x",
- "rimraf": "^6.x.x",
+ "@serenity-js/html-reporter": "^3.x.x",
```

Keep `rimraf` only if used elsewhere (unlikely). Keep `npm-failsafe` only if the test script still needs it for non-reporting reasons (unlikely).

### 2. package.json — scripts

**Before (all templates follow this pattern):**
```json
{
  "clean": "rimraf target",
  "test": "failsafe clean test:execute [...] test:report",
  "test:execute": "<test-runner-command>",
  "test:report": "serenity-bdd run --features <specDir>",
  "start": "npx http-server -p 8080 target/site/serenity"
}
```

The `[...]` in the `failsafe` line is a literal `[...]` placeholder — it's npm-failsafe's syntax for "continue even if the previous step fails".

**After:**
```json
{
  "test": "<test-runner-command>",
  "test:report": "npx @serenity-js/html-reporter serve --dir ./reports/serenity --open"
}
```

- `test` now runs the test runner directly — no failsafe wrapper, no clean step, no separate report step
- `test:report` serves the already-generated report and opens it in the browser (mimics `npx playwright test --reporter=html` behaviour where `npx playwright show-report` opens the report afterwards)
- Remove `clean` script (no `target/` directory to manage)
- Remove `start` script (replaced by `test:report`)

### 3. Crew configuration

The exact file varies by template (see inventory table).

**Before:**
```typescript
crew: [
    '@serenity-js/console-reporter',
    '@serenity-js/serenity-bdd',
    // or: ['@serenity-js/serenity-bdd', { specDirectory: './features' }],
    ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
]
```

**After:**
```typescript
crew: [
    '@serenity-js/console-reporter',
    ['@serenity-js/html-reporter', {
        outputDirectory: './reports/serenity',
        specDirectory: './features', // or './spec', './tests', './src' depending on template
    }],
]
```

- Remove `ArtifactArchiver` — `HtmlReporter` handles artifact storage internally
- Remove `@serenity-js/serenity-bdd`
- Keep `Photographer` (in templates that have it in `use.crew` for Playwright Test, or in the main crew for WebdriverIO/Protractor)
- Keep `@serenity-js/console-reporter`

### 4. .gitignore

```diff
- target/
+ reports/
```

### 5. GitHub Actions workflow

**Before (all templates):**
```yaml
jobs:
  test:
    container:
      image: ghcr.io/serenity-js/playwright:v1.58.1-noble
    steps:
      - name: Run tests
        run: npm test
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: serenity-report
          path: target/site/serenity
          retention-days: 30
      - name: GitHub Pages
        if: always() && github.ref == 'refs/heads/main'
        uses: JamesIves/github-pages-deploy-action@v4.8.0
        with:
          branch: gh-pages
          folder: target/site/serenity
          clean: true
```

**After:**
```yaml
jobs:
  test:
    container:
      image: ghcr.io/serenity-js/playwright:v1.58.1-noble
    steps:
      - name: Run tests
        run: npm test
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: serenity-report
          path: reports/serenity
          retention-days: 30
      - name: GitHub Pages
        if: always() && github.ref == 'refs/heads/main'
        uses: JamesIves/github-pages-deploy-action@v4.8.0
        with:
          branch: gh-pages
          folder: reports/serenity
          clean: true
```

**Key changes:**
- `path`/`folder` changes from `target/site/serenity` to `reports/serenity`
- No Java is needed so the container image could be lighter, but `ghcr.io/serenity-js/playwright` works fine regardless — don't change it to avoid unrelated breakage
- No separate `test:report` step needed since the report is generated inline during `npm test`

**For the `playwright-test-template` specifically** (which also uploads Playwright's own HTML report):
```yaml
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 30
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: serenity-report
          path: reports/serenity
          retention-days: 30
      - name: GitHub Pages
        if: always() && github.ref == 'refs/heads/main'
        uses: JamesIves/github-pages-deploy-action@v4.8.0
        with:
          branch: gh-pages
          folder: reports/serenity
          clean: true
```

### 6. README

Update each template's README:

- **Remove** Java/JRE from prerequisites section
- **Replace** "Serenity BDD Reports" with "Serenity/JS HTML Reports"
- **Update** "Generate the report" / "View the report" instructions:
  ```
  npm run test:report
  ```
  This serves the report on localhost and opens it in the browser.
- **Update** any gh-pages URLs to reflect new directory structure
- **Update** screenshots if the README includes report screenshots

---

## Website Changes (Phase 3)

### Pages to update

| Page | Change | Status |
|------|--------|--------|
| `getting-started/project-templates.mdx` | Replace "Serenity BDD reports" feature bullet with "HTML Reports" for all templates. Update "View Reports" links if they point to gh-pages report URLs. | ❌ |
| `handbook/test-runners/playwright-test/reporting.mdx` | Rewrite to show `@serenity-js/html-reporter` as the recommended option. Move Serenity BDD to a "Legacy: Serenity BDD Reporter" section. | ❌ |
| `handbook/test-runners/webdriverio.mdx` | Update reporting config examples to use HTML Reporter as default. | ❌ |
| `handbook/test-runners/cucumber.mdx` | Same. | ❌ |
| `handbook/test-runners/mocha.mdx` | Same. | ❌ |
| `handbook/test-runners/jasmine.mdx` | Same. | ❌ |
| `handbook/tutorials/your-first-web-scenario.mdx` | Replace serenity-bdd setup with html-reporter (simpler setup, no Java, no failsafe). **Re-record GIF** — see [Tutorial GIF Re-recording](#tutorial-gif-re-recording) below. | ❌ |
| `handbook/integration/github-actions.mdx` | **Write the full guide** — single-module, multi-module, Docker image, GitHub Pages. | ✅ |
| `handbook/integration/gitlab-ci.mdx` | **Rewrite** — HTML Reporter as primary, multi-module, JUnit, Serenity BDD as alternative. | ✅ |
| `handbook/integration/jenkins-ci.mdx` | **Write the full guide** — Docker agent, HTML Publisher, CSP, parallel stages, trend history. | ✅ |
| `handbook/integration/docker.mdx` | Update image suffix from -noble to -resolute. | ✅ |
| `handbook/reporting/html-reporter.mdx` | Fix outputDirectory, add config options, --input explanation, @serenity-js/web install, consistencyWindow note. | ✅ |
| Site `package.json` | Add `@serenity-js/html-reporter` to the dependency list for TypeDoc API doc generation. | ❌ |

### GitHub Actions Guide Spec

✅ **Completed.** The page at `handbook/integration/github-actions.mdx` has been written as a complete guide covering:

1. **Prerequisites** — Node.js, the `ghcr.io/serenity-js/playwright` Docker image (recommended for CI), project configured with Serenity/JS
2. **Single-module workflow** — full working `.github/workflows/test.yml` example with Docker container, report upload, and GitHub Pages deployment with trend history
3. **Multi-module (parallel) workflow** — admin-ui/customer-ui example using matrix strategy, `TestRunArchiver`, artifact upload, aggregation job, and GitHub Pages deploy
4. **Controlling report history** — `maxHistory` option documentation
5. **Using Serenity BDD Reporter** — brief callout noting Docker image includes Java, linking to Serenity BDD docs and migration guide
6. **Learn more** — links to HTML Reporter handbook, Docker images, Project Templates, GitHub Pages docs

### Tutorial GIF Re-recording

The "Your First Web Scenario" tutorial (`handbook/tutorials/your-first-web-scenario.mdx`) includes a "Test reporting" section (line ~676) with GIFs showing the Serenity BDD report. These need replacing:

**GIFs to re-record** (in `static/images/web-testing/your-first-web-scenario/`):

| Current GIF | Shows | Replace with |
|-------------|-------|--------------|
| `vs-code-test-reporting-npm-test.gif` | Running `npm test` (includes `failsafe` + `serenity-bdd run`) | Running `npm test` with html-reporter (simpler output, no Java step) |
| `vs-code-test-reporting-serenity-bdd.gif` | Browsing the Serenity BDD report (multi-page HTML site) | Browsing the Serenity/JS HTML Report (single-page dashboard, scenarios, activity tree) |

**Keep as-is:**
| GIF | Reason |
|-----|--------|
| `vs-code-test-reporting-playwright-test.gif` | Shows Playwright's own report — unchanged |
| All other tutorial GIFs (running tests, adding scenarios, debugging) | Not reporting-related |

**Text changes in the tutorial** (lines ~676–770):
- Replace "Serenity BDD reports" heading/references with "Serenity/JS HTML Reports"
- Update the config snippet to show `@serenity-js/html-reporter` instead of `SerenityBDDReporter` + `ArtifactArchiver`
- Remove mention of `serenity-bdd run` as a separate step
- Update port references (Serenity BDD served on a port vs html-reporter's `npm run test:report`)
- Keep the Photographer explanation (it still applies)
- Update the caption on the report GIF

**Recording guidelines:**
- Use the same VS Code / GitHub Codespaces environment as existing GIFs for visual consistency
- Show the dashboard view first (confidence score, KPI cards), then click into a failing scenario to show the activity tree + error block
- Keep GIF duration similar to existing ones (~10–15 seconds)
- Use the `serenity-js-playwright-test-template` (after it's migrated in Phase 4) as the source project

### CI migration step in html-reporter.mdx

The existing migration guide at `handbook/reporting/html-reporter.mdx` covers:
- ✅ Running both reporters side by side
- ✅ Replacing dependencies
- ✅ Updating crew config
- ✅ Simplifying package.json scripts
- ✅ Screenshot handling
- ❌ **GitHub Actions workflow migration** — not documented

**Add to the migration section** ("Replacing Serenity BDD entirely" → after Step 5):

```markdown
### Step 6: Update CI workflow (if applicable)

If your CI pipeline has a separate report generation step or uses Java for `serenity-bdd run`, simplify it:

**Before:**
```yaml
- name: Set up JDK
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'

- name: Run tests
  run: npm test   # includes: clean → test:execute → test:report (serenity-bdd run)

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: serenity-report
    path: target/site/serenity
```

**After:**
```yaml
- name: Run tests
  run: npm test   # report generated automatically

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: serenity-report
    path: reports/serenity
```

Changes:
- Remove the Java setup step (no longer needed)
- Update the artifact path from `target/site/serenity` to your configured `outputDirectory` (default: `reports/serenity`)
- No separate report generation step — the report is produced inline during `npm test`

If you deploy to GitHub Pages, update the deploy folder path to match:
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    publish_dir: ./reports/serenity
```

For the full CI integration guide, see [GitHub Actions](/handbook/integration/github-actions/).
```

### Docker image note

All documentation and template workflows now reference `ghcr.io/serenity-js/playwright:v<version>-resolute`. Java remains in the image for backward compatibility with Serenity BDD users — no action needed in this rollout other than not adding Java setup steps.

---

## Pre-merge: Clean up main.yaml deploy condition

**File:** `.github/workflows/main.yaml` (line 418–426)

When merging the `features/html-reporter` branch to `main`, simplify the GitHub Pages deploy condition:

```diff
       - name: Deploy to GitHub Pages
-        # TODO: Remove features/html-reporter conditions after the PR is merged to main.
-        #       Keep only: github.ref == 'refs/heads/main'
-        if: |
-          always() && (
-            github.ref == 'refs/heads/main' ||
-            github.ref == 'refs/heads/features/html-reporter' ||
-            github.head_ref == 'main' ||
-            github.head_ref == 'features/html-reporter'
-          )
+        if: always() && github.ref == 'refs/heads/main'
         uses: JamesIves/github-pages-deploy-action@v4.8.0
```

This removes the temporary `features/html-reporter` branch allowance that was added during development.

---

## Verification Checklist (per template)

After applying changes, verify:

- [ ] `npm install` succeeds (no missing deps, no peer dep warnings)
- [ ] `npm test` generates a report in `reports/serenity/`
- [ ] `reports/serenity/index.html` opens in a browser and displays test results
- [ ] `npm run test:report` starts a server and opens the report in the browser
- [ ] GitHub Actions workflow passes on the main branch
- [ ] GitHub Pages deployment publishes the new report (if enabled)
- [ ] README accurately describes the prerequisites and commands
- [ ] No references to `serenity-bdd`, `target/site`, `ArtifactArchiver`, `npm-failsafe`, or Java remain

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Users on cloned old templates see inconsistent docs | Keep serenity-bdd docs intact (marked as "alternative"); migration guide exists. |
| Protractor templates may have quirks | They're Phase 1 — discovered early with minimal impact. |
| Breaking existing CI pipelines of users who forked | Changes only affect the template repos themselves; forks won't auto-update. |
| `ghcr.io/serenity-js/playwright` image no longer needed for Java | Image still works fine without using Java; don't change it in this rollout. |
| `test:report` serve command blocks the terminal | Expected behaviour (matches `npx playwright show-report`). Ctrl+C to stop. |

---

## Key User-Facing Improvements

The multi-step reporting flow collapses from:

```
rimraf target → failsafe test:execute [...] test:report → serenity-bdd run → http-server
```

To:

```
npm test                  # report generated automatically
npm run test:report       # serve and open in browser
```

- No Java required
- No `npm-failsafe` dance
- No separate clean/generate steps
- Report viewable with `npm run test:report` (just like `npx playwright show-report`)
