# HTML Reporter Documentation Rollout

Tracking document for all documentation work required to launch `@serenity-js/html-reporter` as a first-class reporting option across the Serenity/JS ecosystem — website, README files, templates, and API docs.

## Completed

- [x] Handbook article at /handbook/reporting/html-reporter/ (html-reporter.mdx)
- [x] Package README.md (packages/html-reporter/README.md)
- [x] Migration guide integrated into handbook article (from MIGRATING_FROM_SERENITY_BDD.md)
- [x] Announcement banner updated in docusaurus.config.ts
- [x] Reporting index page updated with HTML Reporter first in list
- [x] Reporting index screenshot replaced with HTML Reporter dashboard
- [x] Blog post drafted (src/blog/2026-08-06-html-reporter/)
- [x] Getting-started guides updated (Playwright, WebdriverIO, Cucumber)
- [x] 'Why Serenity/JS' comparison table updated
- [x] Getting-started screenshots replaced with HTML Reporter dashboard (all 3 guides)
- [x] /getting-started/ (Why Serenity/JS) Level 1 config example uses HTML Reporter
- [x] /handbook/ landing page "Insightful reporting" section highlights HTML Reporter
- [x] Requirements hierarchy section added to handbook article
- [x] README links to handbook page for advanced concepts
- [x] README configuration table — accurate defaults (specDirectory, projectName, moduleId auto-detected)
- [x] README — Report Output Structure section added
- [x] README — CI config override example added
- [x] README — CI integration link corrected to /handbook/integration/
- [x] README — serve command --host note added

## Remaining (priority order for announcement)

### Must-have before announcement
- [x] Update GitHub root README.md Quick Start section to show HTML Reporter config
- [x] README — fix outputDirectory examples to match default (./reports/serenity-js)
- [x] README — add @serenity-js/web to installation instructions
- [x] README — expand ci config fields (all 8 fields documented)
- [x] README — add --input pattern resolution explanation to CLI section
- [x] README — add dashboard screenshot
- [x] README — add CI provider links (GitHub Actions, GitLab CI, Jenkins)
- [x] README — add migration section from @serenity-js/serenity-bdd
- [x] Update html-reporter.mdx handbook guide — outputDirectory consistency, @serenity-js/web install, config table (testRunId/moduleId/ci), --input explanation, consistencyWindow note, serve default --dir
- [x] Write GitHub Actions CI guide (handbook/integration/github-actions.mdx) — single-module, multi-module, trend history, Docker image
- [x] Rewrite GitLab CI guide (handbook/integration/gitlab-ci.mdx) — HTML Reporter as primary, multi-module, JUnit, Serenity BDD as alternative
- [x] Write Jenkins CI guide (handbook/integration/jenkins-ci.mdx) — Docker agent, HTML Publisher, CSP, parallel stages, trend history
- [x] Update Docker image suffix from -noble to -resolute across all CI guides and Docker page
- [x] Update package READMEs to recommend html-reporter (playwright-test, playwright, webdriverio-8, protractor, webdriverio, console-reporter)
- [x] Add migration note to @serenity-js/serenity-bdd README
- [x] Publish dashboard screenshot to main branch (static/images/reporting/html-reporter-dashboard.png)
- [x] Publish handbook article to main (handbook/reporting/html-reporter/) with all screenshots
- [x] Add @serenity-js/html-reporter to API docs generation pipeline (docusaurus.config.ts TypeDoc entry)
- [x] Update Reporting overview page (/handbook/reporting/) — HTML Reporter listed first
- [x] Update API index page (/api/) — add @serenity-js/html-reporter under "Reporting" (PackageJsonParser.ts)
- [x] Split handbook config into runner-specific sections (Playwright, WebdriverIO, Cucumber, Mocha, Jasmine)
- [x] Add "Viewing the report" section to handbook (serve, open from file://, .gitignore)
- [x] Use npm2yarn for uninstall command in migration guide
- [x] Add HTML Reporter tip to troubleshooting page (Java issues section)
- [x] Add @serenity-js/html-reporter to troubleshooting version mismatch update command
- [x] Rename CLI options to kebab-case (--spec-dir, --max-history, --consistency-window)
- [x] Fix JSDoc examples (outputDirectory, runner-specific specDirectory, Learn more links)
- [x] Replace @package with @internal in API docs
- [ ] Publish CI guides to main (GitHub Actions, GitLab CI, Jenkins) — step 3 of release sequence
- [x] Publish getting-started updates — step 4 of release sequence (merged to main, live on serenity-js.org)
    - [x] Restructured "Why Serenity/JS" page around Why/What/How/Adoption (Golden Circle)
    - [x] Updated Playwright, WebdriverIO, Cucumber, Electron guides to use html-reporter
    - [x] Fixed stale output paths (reports/serenity-js)
    - [x] Added back-links to "Why Serenity/JS" from all runner guides
    - [x] Removed Java prerequisites from all guides
    - [x] Simplified package.json scripts (no failsafe/rimraf/serenity-bdd run)
    - [x] Updated FAQ "Do I need Java?" answers
    - [x] Added "Go further" transition to reference projects sections
    - [x] Added AI-amplifies-the-problem bullet to Level 0
- [ ] Announcement banner (will be released with blog post)
- [ ] Update project templates to use @serenity-js/html-reporter and link to live HTML reports
- [ ] Publish blog post (verify version number matches actual release)

### Should-have (same week as announcement)
- [ ] Add FAQ topics to handbook article (see section below)
- [ ] Update homepage 'Report what really matters' section to mention HTML Reporter
- [ ] Update WebdriverIO project setup wizard to install @serenity-js/html-reporter by default

### Can follow after (week 2+)
- [x] Update test-runner handbook pages (reporting sections) to show html-reporter as default (PR #193)
- [ ] Update tutorial (your-first-web-scenario) — replace serenity-bdd setup, re-record GIFs
- [ ] Update project templates page (getting-started/project-templates.mdx) — feature bullets and report links
- [ ] Update architecture page package diagram to include @serenity-js/html-reporter
- [ ] Update screenshot in `examples/cucumber-reporting/features/reporting_results/readme.md` to reflect the new HTML Reporter UI

## FAQ topics to cover in handbook article

- [ ] **What if the report/data.js gets too large?** — Reduce `maxHistory` (fewer retained runs), configure `Photographer` to capture only on failure (`TakePhotosOfFailures`), disable video recording, or consider external artifact storage for very large suites.
- [ ] **Can I use Git LFS for report data?** — No. GitHub/GitLab Pages can't resolve LFS pointers — they'd serve the pointer file instead of the actual content. Git LFS is incompatible with any Pages-based deployment.
- [ ] **What about test-run artifacts (screenshots/videos) growing over time?** — `maxHistory` prunes old runs. Within retained runs, the main levers are: screenshot-on-failure only, disable video, and `clean: true` on deploy (single-commit gh-pages branch). For very large suites, a future enhancement could support external artifact URLs (S3/GCS) instead of co-locating binaries.
- [ ] **What if I hit my GitHub Pages quota?** — Pages has a 1GB soft limit. Reduce `maxHistory`, reduce screenshots, or deploy to external static hosting (S3, Azure Blob, Netlify, Cloudflare Pages) instead.
- [ ] **Can I run the report locally without a server?** — Yes, open `index.html` directly. Works from `file://` URLs.
- [ ] **What happens if a CI job crashes mid-run?** — Incomplete runs are detected via the two-phase db.json write and shown with ⚠️ indicators. No data from other modules is lost.
- [ ] **What if I already have GitHub/GitLab Pages from another reporter?** — Delete the old deployment and reconfigure. Link to GitHub Pages deletion docs and GitLab Pages removal docs.
