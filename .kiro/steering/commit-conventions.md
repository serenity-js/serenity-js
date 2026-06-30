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
