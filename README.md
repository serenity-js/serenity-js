<div align="center">

# Serenity/JS

A TypeScript-native test automation framework that gives your Playwright Test, WebdriverIO, or Cucumber test suite the architecture it needs to scale.

[![NPM Version](https://img.shields.io/npm/v/@serenity-js/core?style=flat-square)](https://www.npmjs.com/package/@serenity-js/core)
[![Downloads](https://img.shields.io/npm/dm/@serenity-js/core?style=flat-square)](https://www.npmjs.com/package/@serenity-js/core)
[![Build Status](https://img.shields.io/github/actions/workflow/status/serenity-js/serenity-js/main.yaml?branch=main&style=flat-square)](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![GitHub Stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat-square)](https://github.com/serenity-js/serenity-js/stargazers)

[Website](https://serenity-js.org?ref=github-serenity-js-readme) · [Getting Started](https://serenity-js.org/getting-started/?ref=github-serenity-js-readme) · [Handbook](https://serenity-js.org/handbook/?ref=github-serenity-js-readme) · [API Docs](https://serenity-js.org/api/?ref=github-serenity-js-readme) · [Community](https://serenity-js.org/community/?ref=github-serenity-js-readme)

</div>

---

## What a Serenity/JS test looks like

```typescript
import { describe, it } from '@serenity-js/playwright-test'
import { Ensure, equals } from '@serenity-js/assertions'
import { Navigate } from '@serenity-js/web'

describe('Swag Labs', () => {

    it('should let a standard user complete checkout', async ({ actor }) => {
        await actor.attemptsTo(
            Navigate.to('https://www.saucedemo.com/'),
            Authenticate.withCredentials('standard_user', 'secret_sauce'),
            Inventory.productCalled('Sauce Labs Backpack').addToCart(),
            Checkout.completeWith({
                firstName: 'Alice',
                lastName: 'Smith',
                postalCode: '90210',
            }),
            Ensure.that(
                Checkout.confirmationHeading(), 
                equals('Thank you for your order!')
            ),
        )
    })
})
```

Tests read like specifications. Each Task (`Authenticate`, `Inventory`, `Checkout`) is reusable across scenarios, test runners, and integration tools. [See the full implementation →](https://serenity-js.org/getting-started/playwright/?ref=github-serenity-js-readme#complete-example)

---

## Why Serenity/JS?

| Challenge | How Serenity/JS helps |
|---------|----------------------|
| **Duplicated selectors and test logic** | The [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/?ref=github-serenity-js-readme) gives you composable, reusable Tasks that separate *what* from *how* |
| **Hard to tell what a test did** | [Structured reports](https://serenity-js.org/handbook/reporting/?ref=github-serenity-js-readme) show every action, with timing and screenshots |
| **Multi-user workflows are hard to implement** | [Multi-actor support](https://serenity-js.org/handbook/test-runners/playwright-test/multi-actor-scenarios/?ref=github-serenity-js-readme) is built in |
| **Stakeholders can't read test reports** | [Serenity BDD reports](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/?ref=github-serenity-js-readme) generate living documentation for technical and business audiences |
| **Logic duplicated across API and UI tests** | Screenplay Tasks [work across interfaces](https://serenity-js.org/handbook/web-testing/blended-testing/?ref=github-serenity-js-readme) |
| **Slow UI-only test suites** | [Blended testing](https://serenity-js.org/handbook/web-testing/blended-testing/?ref=github-serenity-js-readme) — use APIs for setup, UI only where it matters |
| **Locked into one tool** | Screenplay Tasks are portable — switch [integration tools](https://serenity-js.org/handbook/architecture/?ref=github-serenity-js-readme) and [test runners](https://serenity-js.org/handbook/test-runners/?ref=github-serenity-js-readme) without rewriting |


[→ See the same scenario at three levels of Serenity/JS adoption](https://serenity-js.org/getting-started/?ref=github-serenity-js-readme)

---

## Works with

Serenity/JS works **on top of** your existing tools — you don't replace anything, you add structure and reporting. Supported test runners and integration tools include:

- [Playwright Test](https://serenity-js.org/getting-started/playwright/?ref=github-serenity-js-readme)
- [WebdriverIO](https://serenity-js.org/getting-started/webdriverio/?ref=github-serenity-js-readme)
- [Cucumber](https://serenity-js.org/getting-started/cucumber/?ref=github-serenity-js-readme)
- [Mocha](https://serenity-js.org/handbook/test-runners/mocha/?ref=github-serenity-js-readme)
- [Jasmine](https://serenity-js.org/handbook/test-runners/jasmine/?ref=github-serenity-js-readme)

---

## Quick Start

Add Serenity/JS to an existing **Playwright Test** project:

**1. Install Serenity/JS modules and reporting tools:**

```bash
npm install --save-dev @serenity-js/core @serenity-js/console-reporter @serenity-js/playwright @serenity-js/playwright-test @serenity-js/rest @serenity-js/web @serenity-js/serenity-bdd rimraf npm-failsafe
```

**2. Update `playwright.config.ts` to register the [Serenity/JS reporter](https://serenity-js.org/handbook/test-runners/playwright-test/configuration/?ref=github-serenity-js-readme):**

```diff
- import { defineConfig, devices } from '@playwright/test';
+ import { defineConfig, devices } from '@playwright/test';
+ import { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

- export default defineConfig({
+ export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './tests',
    // ... keep your existing settings ...
-   reporter: 'html',
+   reporter: [
+       [ 'line' ],
+       [ '@serenity-js/playwright-test', {
+           crew: [
+               '@serenity-js/console-reporter',
+               [ '@serenity-js/serenity-bdd', { specDirectory: './tests' } ],
+               [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: './reports/serenity' } ],
+           ]
+       }]
+   ],
```

**3. Add scripts to `package.json` to generate [Serenity BDD reports and living documentation](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/?ref=github-serenity-js-readme):**

```diff
 {
   "scripts": {
+    "clean": "rimraf target",
+    "test": "failsafe clean test:execute [...] test:report",
+    "test:execute": "npx playwright test",
+    "test:report": "serenity-bdd run --features='./tests' --source='./reports/serenity' --destination='./reports/serenity'"
   }
 }
```

> `[...]` is a [npm-failsafe wildcard](https://github.com/jan-molak/npm-failsafe#using-wildcards) — it passes any CLI arguments to `test:execute`. For example, `npm test -- --grep "checkout"` runs only matching tests while still generating the report.

**4. Change one import in your test files to use [Serenity/JS fixtures](https://serenity-js.org/handbook/test-runners/playwright-test/writing-tests/?ref=github-serenity-js-readme):**

```typescript
// Before
import { test, expect } from '@playwright/test'

// After
import { describe, it } from '@serenity-js/playwright-test'
```

That's it. Your existing tests gain structured reporting immediately. Adopt the Screenplay Pattern gradually for new tests.

[→ Full getting-started tutorial](https://serenity-js.org/getting-started/playwright/?ref=github-serenity-js-readme)

---

## Learn more

- **[Why Serenity/JS?](https://serenity-js.org/getting-started/?ref=github-serenity-js-readme)** — architecture comparison at three levels of Serenity/JS adoption
- **[15-minute tutorial](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/?ref=github-serenity-js-readme)** — build your first Screenplay test in the browser
- **[Project Templates](https://serenity-js.org/getting-started/project-templates/?ref=github-serenity-js-readme)** — pre-configured starters for Playwright, WebdriverIO, Cucumber
- **[API Documentation](https://serenity-js.org/api/?ref=github-serenity-js-readme)** — reference for all `@serenity-js/*` modules
- **[Reporting](https://serenity-js.org/handbook/reporting/?ref=github-serenity-js-readme)** — console, HTML, Serenity BDD living documentation
- **[Releases & Compatibility](https://serenity-js.org/releases/?ref=github-serenity-js-readme)** — latest versions, changelog, and Node/Playwright/WebdriverIO compatibility matrix

---

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [GitHub Discussions](https://github.com/orgs/serenity-js/discussions) — Q&A and feature proposals
- [LinkedIn](https://www.linkedin.com/company/serenity-js)
- [YouTube](https://www.youtube.com/@serenity-js)
- [Blog](https://serenity-js.org/blog/?ref=github-serenity-js-readme)

If Serenity/JS is helping your team, please ⭐️ **[star this repo](https://github.com/serenity-js/serenity-js/stargazers)** to help others discover it!

---

## Support

- **[GitHub Sponsors](https://github.com/sponsors/serenity-js)** — fund ongoing development
- **[Commercial support](https://www.linkedin.com/in/janmolak/)** — training, consulting, and implementation help — contact Jan Molak

---

## Contributing

Serenity/JS is an Apache-2.0 licensed open-source project. We welcome contributions of all kinds — code, documentation, bug reports, and community support.

- [Contributing guide](https://github.com/serenity-js/serenity-js/blob/main/CONTRIBUTING.md)
- [Good first issues](https://github.com/serenity-js/serenity-js/issues?q=state%3Aopen%20label%3Agood-first-issue)
- [Code of conduct](https://github.com/serenity-js/serenity-js/blob/main/CODE_OF_CONDUCT.md)

---

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fserenity-js%2Fserenity-js.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fserenity-js%2Fserenity-js?ref=badge_shield&issueType=license)

Serenity/JS source code is licensed under [Apache-2.0](https://github.com/serenity-js/serenity-js/blob/main/LICENSE.md). The Handbook and documentation are licensed under [CC BY-NC-SA 4.0](https://serenity-js.org/legal/license/?ref=github-serenity-js-readme).

---

_Copyright © 2016– [Jan Molak](https://janmolak.com) and the Serenity Team_
