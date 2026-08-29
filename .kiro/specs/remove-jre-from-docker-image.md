# Remove JRE and Microsoft Edge from Serenity/JS Docker Image

**Status: Ready** — all prerequisites met (html-reporter rollout complete, templates migrated, v3.45.9 shipped).

## Context

The `ghcr.io/serenity-js/playwright` Docker image currently includes:
- **OpenJDK 21 JRE** (`default-jre`) — solely to support `serenity-bdd run` (Java-based report generator)
- **Microsoft Edge** (`microsoft-edge-stable`) — rarely used; Playwright's own Chromium engine covers the same rendering, and users who need Edge specifically can add it back

Once all project templates migrate to `@serenity-js/html-reporter`, no Serenity/JS workflow requires Java. Edge is already optional for most users since Playwright ships its own browser engines.

## Design Principle

**Keep repository configuration (GPG keys + sources lists), remove packages.**

Users who need Chrome, Edge, or JRE can install them with a single `apt-get install` — no key import ceremony needed. The image ships with everything pre-configured; it just doesn't pre-install the large packages.

| Package | Compressed (download) | Installed (disk) |
|---------|---:|---:|
| `default-jre` (OpenJDK 21) | ~45 MB | ~200 MB |
| `microsoft-edge-stable` | ~170 MB | ~400 MB |
| **Combined savings** | **~215 MB** | **~600 MB** |

Current image total: **1,445 MB** compressed → after removal: **~1,230 MB** (~15% smaller).

## Design Principle: Keep GPG keys, remove packages

Keep the APT repository GPG keys and source list entries so users can install the packages with a single `apt-get install` command — no key import ceremony needed. Only remove the packages themselves.

## Change

**File:** `serenity-js-docker/Dockerfile`

```diff
 RUN \
     apt-get -y update && \
     apt-get -y upgrade && \
 ### Install certificate tools
     apt-get install -y ca-certificates curl gpg libnss3-tools p11-kit && \
     update-ca-certificates && \
 ### Update sources
     mkdir -p /etc/apt/keyrings && \
     curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
     echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
+### Microsoft Edge repo (key only — install microsoft-edge-stable if needed)
     curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg && \
     echo "deb [signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge.list && \
+### Google Chrome repo (key only — install google-chrome-stable if needed)
     curl -sL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
     echo "deb [signed-by=/etc/apt/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
     apt-get -y update && \
 ### Install Node.js
-    apt-get install -y default-jre google-chrome-stable microsoft-edge-stable nodejs rsync sudo && \
+    apt-get install -y nodejs rsync sudo && \
 ### Feature-parity with node.js base images.
     apt-get install -y --no-install-recommends git openssh-client && \
 ### Clean up
     apt-get clean && \
     rm -rf /var/lib/apt/lists/*;
```

**What's kept (repo configuration only — zero package bytes):**
- GPG keys for Microsoft Edge, Google Chrome, and Node.js
- APT source list entries for all three
- Java APT packages are available from the Ubuntu repos (no extra key needed)

**What's removed (packages):**
- `default-jre` (OpenJDK 21)
- `microsoft-edge-stable`
- `google-chrome-stable`

Users who need any of these can install them with `apt-get install` — the repos are pre-configured.

**Also update:**
- Image `LABEL` description: remove "JRE" — change to `"Serenity/JS runtime environment: Ubuntu, Node.js, Playwright browsers, Google Chrome"`
- `README.md`: remove "OpenJDK Java Runtime Environment" and "Microsoft Edge (Stable)" from "What's Included / Browsers"
- `README.md`: add "Optional packages" section (see below)

## README: "Optional packages" section

Add after the "What's Included" section:

```markdown
### Optional packages

The following packages are **not installed by default** but their APT repositories are pre-configured.
Install them with a single command — no GPG key setup needed:

#### Google Chrome

Required for WebdriverIO tests that use the Chrome DevTools Protocol against a real Chrome browser
(as opposed to Playwright's bundled Chromium).

```yaml
steps:
  - name: Install Google Chrome
    run: |
      sudo apt-get update -qq
      sudo apt-get install -y google-chrome-stable
```

#### Microsoft Edge

```yaml
steps:
  - name: Install Microsoft Edge
    run: |
      sudo apt-get update -qq
      sudo apt-get install -y microsoft-edge-stable
```

#### Java (JRE)

Required only if your project uses [`@serenity-js/serenity-bdd`](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/) (the Java-based reporter).
We recommend migrating to [`@serenity-js/html-reporter`](https://serenity-js.org/handbook/reporting/html-reporter/) which requires no Java.

```yaml
steps:
  - name: Install JRE
    run: |
      sudo apt-get update -qq
      sudo apt-get install -y --no-install-recommends default-jre-headless
```

All three can also be installed in a custom Dockerfile:

```dockerfile
FROM ghcr.io/serenity-js/playwright:v1.62.1-resolute
RUN sudo apt-get update -qq && \
    sudo apt-get install -y --no-install-recommends \
      google-chrome-stable \
      microsoft-edge-stable \
      default-jre-headless && \
    sudo rm -rf /var/lib/apt/lists/*
```
```

## Prerequisites (before executing)

- ✅ All project templates migrated to `@serenity-js/html-reporter` (see `html-reporter-rollout.md`)
- ✅ Website documentation updated (Phase 3 of rollout plan)
- ✅ At least one minor release shipped with html-reporter so users have had time to migrate
- [ ] Confirm no integration test in the monorepo requires Edge or Chrome specifically (currently all use Playwright engines)

## Verification

- [ ] Image builds successfully without `default-jre`, `microsoft-edge-stable`, and `google-chrome-stable`
- [ ] `java` command is not available inside the container
- [ ] `microsoft-edge` command is not available inside the container
- [ ] `google-chrome` command is not available inside the container
- [ ] `sudo apt-get update && sudo apt-get install -y google-chrome-stable` works (GPG key pre-configured)
- [ ] `sudo apt-get update && sudo apt-get install -y microsoft-edge-stable` works (GPG key pre-configured)
- [ ] `sudo apt-get update && sudo apt-get install -y default-jre-headless` works (Ubuntu repos)
- [ ] All project template CI workflows still pass (they use Playwright browsers, not system Chrome)
- [ ] Image size reduced significantly (target: ~600 MB smaller)
- [ ] README documents how to add all three packages back
- [ ] Website Docker documentation page updated
