# Serenity/JS Commit Conventions

## Format

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Enforced by `commitlint` via Husky. Invalid commits are rejected.

## Types

| Type       | Triggers Release | Description                           |
|------------|:----------------:|---------------------------------------|
| `feat`     |      minor       | New feature for Serenity/JS users     |
| `fix`      |      patch       | Bug fix                               |
| `perf`     |      patch       | Performance improvement               |
| `docs`     |        —         | Documentation only                    |
| `style`    |        —         | Formatting, no functional change      |
| `refactor` |        —         | Code improvement, no behaviour change |
| `test`     |        —         | Adding or improving tests             |
| `ci`       |        —         | CI/CD pipeline changes                |
| `chore`    |        —         | Dependency updates, tooling           |
| `revert`   |        —         | Reverting a previous commit           |

Breaking changes (`feat!` or `BREAKING CHANGE` footer) trigger a major version bump.

## ⚠️ CRITICAL: BREAKING CHANGE Usage

**NEVER use `BREAKING CHANGE` in a commit footer unless explicitly approved by the maintainer.**

The presence of the text `BREAKING CHANGE` anywhere in the commit message footer will trigger an automatic **major version bump** (e.g., 3.x → 4.0.0) across all packages in the monorepo. This has significant implications:

- Major releases require coordination with the community
- They signal to users that migration work may be needed
- They affect the release timeline and planning
- Accidental major bumps cause confusion and erode trust

### Rules

1. **Do NOT add `BREAKING CHANGE:` to commit footers**, even with text like "None" or "all changes are backwards compatible"
2. **Do NOT use `feat!` or `fix!`** without explicit approval
3. If you believe a change might be breaking, **stop and ask the maintainer before committing**
4. All breaking changes require explicit user approval — never assume

### What Constitutes a Breaking Change

Breaking changes **require user code modifications**:
- Removing a public API (class, method, property, type export)
- Changing method signatures (parameters, return types)
- Changing default behavior that tests rely on
- Renaming exports or packages
- Changing minimum supported Node.js version
- Changing minimum supported dependency versions (Playwright, WebdriverIO, Cucumber)

### What Is NOT a Breaking Change

These are **safe to commit without `BREAKING CHANGE`**:
- Adding new optional parameters with defaults
- Adding new methods, properties, classes, or modules
- Bug fixes that restore documented behavior
- Performance improvements
- Internal refactoring that doesn't affect the public API
- Deprecating APIs (as long as they still work)
- Documentation improvements

### When in Doubt

If you're uncertain whether a change is breaking:
1. **Stop** — do not commit yet
2. **Ask** — explain the change and request guidance
3. **Wait** — proceed only after receiving explicit approval

The cost of asking is low. The cost of an accidental major bump is high.

## Scopes

Scope is **required**. Valid scopes are derived from `.cz-allowed-scopes.js`:

**Packages** (auto-detected from `packages/*/`):

```
assertions, console-reporter, core, cucumber, jasmine, local-server,
mocha, playwright, playwright-test, protractor, rest, serenity-bdd,
web, webdriverio, webdriverio-8
```

**Other**:

```
examples       # Example projects
deps           # Runtime dependency changes
deps-dev       # Dev dependency changes
github         # GitHub Actions/config
gitpod         # Gitpod configuration
lerna          # Lerna configuration
renovate       # Renovate bot config
qlty           # Qlty.sh configuration
eslint         # ESLint configuration
release        # Reserved for automated releases
```

## Examples

```bash
feat(web): add shadow DOM piercing selectors

fix(playwright): resolve element visibility check in iframes

Related tickets: #1234

feat(core)!: rename Ability.as() to Ability.of()

BREAKING CHANGE: Ability.as(actor) is now Ability.of(actor)

chore(deps): update playwright to 1.40.0

ci(github): add Node 22 to test matrix
```

## Interactive Commit

```bash
pnpm commit
```

Launches `cz-customizable` with guided prompts.

## Release Process

Automated on `main` via Lerna:

1. Analyses commits since last release
2. Determines version bump from commit types
3. Updates all package versions (lockstep)
4. Generates CHANGELOG.md entries
5. Publishes to npm with provenance
6. Creates GitHub release
