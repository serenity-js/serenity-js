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

- [ ] **FAQ section** — Add a Frequently Asked Questions section to the handbook reporting/html-reporter page covering common adoption scenarios and troubleshooting:
  - *What if I already have GitHub/GitLab Pages published using a different reporter?* — Delete the old deployment and reconfigure. Link to [GitHub Pages deletion docs](https://docs.github.com/en/pages/getting-started-with-github-pages/deleting-a-github-pages-site) and [GitLab Pages removal](https://docs.gitlab.com/ee/user/project/pages/#how-to-remove-pages).
  - *What if the report takes too much space and I hit my Pages quota?* — Reduce `maxHistory` to retain fewer runs, reduce screenshot frequency (configure `Photographer` to capture only on failure), disable video recording, or publish to external storage (S3, Azure Blob, etc.) instead of Pages.
  - *Can I publish to S3/Azure/external hosting instead of Pages?* — Yes, the report is a static directory. Use `aws s3 sync`, `azcopy`, or any static file upload tool after aggregation.
  - *How do I reduce the report file size?* — The main contributors are screenshots and execution history. Reduce screenshots (Photographer on failure only), reduce `maxHistory`, or use `specDirectory` to limit which specs appear in the capabilities view.
  - *Can I run the report locally without a server?* — Yes, open `index.html` directly in a browser. The report works from `file://` URLs with no server required.
  - *What happens if a CI job crashes mid-run?* — The reporter detects incomplete runs and marks them with ⚠️ indicators. No data is lost from other modules that completed successfully.
