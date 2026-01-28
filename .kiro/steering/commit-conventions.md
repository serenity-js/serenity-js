# Serenity/JS Commit Conventions

## Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables
automated changelog generation and semantic versioning.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                           |
|------------|-------------------------------------------------------|
| `feat`     | New feature available to developers using Serenity/JS |
| `fix`      | Bug fix, typically addressing a GitHub issue          |
| `docs`     | Documentation changes (website, examples, API docs)   |
| `style`    | Code formatting, no functional changes                |
| `refactor` | Code improvements without behavior changes            |
| `perf`     | Performance improvements                              |
| `test`     | Adding or improving tests                             |
| `revert`   | Reverting a previous commit                           |
| `ci`       | CI/CD pipeline changes                                |
| `chore`    | Other changes (dependency updates, etc.)              |

### Scopes

Scope is **required** and must be one of:

**Serenity/JS Packages:**

```
assertions, console-reporter, core, cucumber, jasmine, local-server,
mocha, playwright, playwright-test, protractor, rest, serenity-bdd,
web, webdriverio, webdriverio-8
```

**Other Scopes:**

```
examples          # Example projects
deps              # Runtime dependency changes
deps-dev          # Dev dependency changes
github            # GitHub Actions/config
gitpod            # Gitpod configuration
lerna             # Lerna configuration
renovate          # Renovate bot config
qlty              # Qlty.sh configuration
eslint            # ESLint configuration
release           # Reserved for automated releases
```

### Examples

```bash
# New feature
feat(web): add support for shadow DOM piercing selectors

# Bug fix with issue reference
fix(playwright): resolve element visibility check in iframes

Related tickets: #1234

# Documentation update
docs(core): improve Actor class JSDoc examples

# Breaking change
feat(core)!: rename Ability.as() to Ability.of()

BREAKING CHANGE: Ability.as(actor) is now Ability.of(actor)

# Dependency update
chore(deps): update playwright to 1.40.0

# CI change
ci(github): add Node 22 to test matrix
```

## Interactive Commit Tool

Use the interactive commit helper:

```bash
pnpm commit
# or
npm run commit
```

This launches `cz-customizable` which guides you through creating a properly formatted commit message.

## Commit Validation

Commits are validated by `commitlint` via Husky pre-commit hooks. Invalid commits will be rejected with guidance on the
correct format.

### Common Validation Errors

```bash
# Missing scope
✖ scope may not be empty

# Invalid scope
✖ scope must be one of [assertions, core, ...]

# Subject too long (max 100 chars)
✖ subject must not be longer than 100 characters

# Wrong type case
✖ type must be lower-case
```

## Pull Request Workflow

1. Create a feature branch from `main`
2. Make changes with conventional commits
3. Push and open a PR against `main`
4. CI runs lint, compile, unit tests, and integration tests
5. All checks must pass before merge
6. Merge commit is recommended since it preserves history

## Release Process

Releases are automated on the `main` branch:

1. Lerna analyzes commits since last release
2. Determines version bump (major/minor/patch) from commit types
3. Updates all package versions
4. Generates CHANGELOG.md entries
5. Creates GitHub release with notes
6. Publishes to npm with provenance

### Version Bump Rules

- `feat` → minor version bump
- `fix`, `perf` → patch version bump
- `feat!` or `BREAKING CHANGE` → major version bump
- `docs`, `style`, `refactor`, `test`, `ci`, `chore` → no release
