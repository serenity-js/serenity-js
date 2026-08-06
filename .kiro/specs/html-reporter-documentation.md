# HTML Reporter — Documentation Spec

Tracks missing documentation tasks for `@serenity-js/html-reporter` that must be completed before or shortly after the package is published.

## Tasks

- [ ] **API docs 404** — The README links to `https://serenity-js.org/api/html-reporter/` which returns 404 until TypeDoc runs against the merged code. Update the TypeDoc configuration in the website repo to include `@serenity-js/html-reporter` as a documented package, ensuring the API reference is generated and deployed alongside other packages.

- [ ] **Handbook reporting section** — Add a new section for the HTML Reporter to the reporting handbook at `https://serenity-js.org/handbook/reporting/`. Model it after the existing Serenity BDD Reporter section: explain what it produces (self-contained HTML file), how it differs from Serenity BDD reports, when to choose it, and link to the configuration reference.

- [ ] **Getting Started templates** — Update the project templates at `https://serenity-js.org/getting-started/project-templates/` to offer `@serenity-js/html-reporter` as the default reporter option. Update `playwright.config.ts` diffs in the quick-start guides to show the html-reporter crew member configuration instead of (or alongside) `@serenity-js/serenity-bdd`.

- [ ] **Configuration reference** — Document all `HtmlReporterConfig` options with examples in the handbook. Currently configuration is only described in the package README. The handbook page should include an options table (name, type, default, description), a minimal working configuration, and common patterns (custom output directory, history retention, multi-module CI setup).

- [ ] **CI/CD examples** — Provide provider-specific examples for persisting test run history and deploying the report to static hosting:
  - **GitHub Actions** — upload/download artifacts for history, deploy to GitHub Pages via `actions/deploy-pages`
  - **GitLab CI** — use `artifacts:paths` with `dependencies` for history, deploy via GitLab Pages job
  - **CircleCI** — use workspaces or caches for history, deploy via `gh-pages` orb or S3 sync
