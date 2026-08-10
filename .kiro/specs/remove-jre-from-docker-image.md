# Remove JRE and Microsoft Edge from Serenity/JS Docker Image

**Status: Parked** — execute after the html-reporter rollout is complete and templates no longer depend on Java.

## Context

The `ghcr.io/serenity-js/playwright` Docker image currently includes:
- **OpenJDK 21 JRE** (`default-jre`) — solely to support `serenity-bdd run` (Java-based report generator)
- **Microsoft Edge** (`microsoft-edge-stable`) — rarely used; Playwright's own Chromium engine covers the same rendering, and users who need Edge specifically can add it back

Once all project templates migrate to `@serenity-js/html-reporter`, no Serenity/JS workflow requires Java. Edge is already optional for most users since Playwright ships its own browser engines.

## Size Impact

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
     curl -sL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
     echo "deb [signed-by=/etc/apt/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
     apt-get -y update && \
 ### Install Node.js
-    apt-get install -y default-jre google-chrome-stable microsoft-edge-stable nodejs rsync sudo && \
+    apt-get install -y google-chrome-stable nodejs rsync sudo && \
 ### Feature-parity with node.js base images.
     apt-get install -y --no-install-recommends git openssh-client && \
 ### Clean up
     apt-get clean && \
     rm -rf /var/lib/apt/lists/*;
```

**Key decisions:**
- GPG keys and repo source lists for both Microsoft Edge and (implicitly) Java remain in place
- Users can `sudo apt-get update && sudo apt-get install -y microsoft-edge-stable` or `default-jre-headless` without any key setup
- Google Chrome remains — it's the primary "real browser" for WebdriverIO users running against Chrome DevTools Protocol

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

#### Microsoft Edge

```yaml
steps:
  - name: Install Microsoft Edge
    run: |
      sudo apt-get update -qq
      sudo apt-get install -y microsoft-edge-stable
```

Or in a custom Dockerfile:

```dockerfile
FROM ghcr.io/serenity-js/playwright:v1.58.1-noble
RUN sudo apt-get update -qq && \
    sudo apt-get install -y --no-install-recommends microsoft-edge-stable && \
    sudo rm -rf /var/lib/apt/lists/*
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

Or in a custom Dockerfile:

```dockerfile
FROM ghcr.io/serenity-js/playwright:v1.58.1-noble
RUN sudo apt-get update -qq && \
    sudo apt-get install -y --no-install-recommends default-jre-headless && \
    sudo rm -rf /var/lib/apt/lists/*
```
```

## Prerequisites (before executing)

- [ ] All project templates migrated to `@serenity-js/html-reporter` (see `html-reporter-rollout.md`)
- [ ] Website documentation updated (Phase 3 of rollout plan)
- [ ] At least one minor release shipped with html-reporter so users have had time to migrate
- [ ] Confirm no integration test in the monorepo requires Edge specifically (currently all use Chrome or Playwright engines)

## Verification

- [ ] Image builds successfully without `default-jre` and `microsoft-edge-stable`
- [ ] `java` command is not available inside the container
- [ ] `microsoft-edge` command is not available inside the container
- [ ] `sudo apt-get update && sudo apt-get install -y default-jre-headless` works (GPG key pre-configured)
- [ ] `sudo apt-get update && sudo apt-get install -y microsoft-edge-stable` works (GPG key pre-configured)
- [ ] All project template CI workflows still pass
- [ ] Image size reduced by ~215 MB compressed (from ~1,445 MB to ~1,230 MB)
- [ ] README documents how to add both packages back
