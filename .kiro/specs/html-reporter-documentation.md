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

## Remaining (priority order for announcement)

### Must-have before announcement
- [ ] Update GitHub root README.md Quick Start section to show HTML Reporter config
- [ ] Update project templates to use @serenity-js/html-reporter and link to live HTML reports
- [ ] Publish blog post (verify version number matches actual release)

### Should-have (same week)
- [ ] Add FAQ topics to handbook article (see section below)
- [ ] Update homepage 'Report what really matters' section to mention HTML Reporter
- [ ] Add @serenity-js/html-reporter to API docs generation pipeline

### Can follow after (week 2+)
- [ ] Update architecture page package diagram to include @serenity-js/html-reporter
- [ ] Add troubleshooting section: 'Java issues → Try the HTML Reporter'

## FAQ topics to cover in handbook article

- [ ] **What if the report/data.js gets too large?** — Reduce `maxHistory` (fewer retained runs), configure `Photographer` to capture only on failure (`TakePhotosOfFailures`), disable video recording, or consider external artifact storage for very large suites.
- [ ] **Can I use Git LFS for report data?** — No. GitHub/GitLab Pages can't resolve LFS pointers — they'd serve the pointer file instead of the actual content. Git LFS is incompatible with any Pages-based deployment.
- [ ] **What about test-run artifacts (screenshots/videos) growing over time?** — `maxHistory` prunes old runs. Within retained runs, the main levers are: screenshot-on-failure only, disable video, and `clean: true` on deploy (single-commit gh-pages branch). For very large suites, a future enhancement could support external artifact URLs (S3/GCS) instead of co-locating binaries.
- [ ] **What if I hit my GitHub Pages quota?** — Pages has a 1GB soft limit. Reduce `maxHistory`, reduce screenshots, or deploy to external static hosting (S3, Azure Blob, Netlify, Cloudflare Pages) instead.
- [ ] **Can I run the report locally without a server?** — Yes, open `index.html` directly. Works from `file://` URLs.
- [ ] **What happens if a CI job crashes mid-run?** — Incomplete runs are detected via the two-phase db.json write and shown with ⚠️ indicators. No data from other modules is lost.
- [ ] **What if I already have GitHub/GitLab Pages from another reporter?** — Delete the old deployment and reconfigure. Link to GitHub Pages deletion docs and GitLab Pages removal docs.
