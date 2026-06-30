# Steering Documentation Maintenance

## Purpose

These steering docs encode Serenity/JS engineering conventions that are not obvious from the code alone. They serve as long-term guidance for AI assistants and contributors alike, ensuring architectural consistency regardless of who is making changes.

## Document Map

| File | Purpose | Inclusion |
|------|---------|-----------|
| `project-overview.md` | Architecture, DDD philosophy, packages, tech stack | Always |
| `coding-standards.md` | Value objects, Good Citizen rule, style, backwards compatibility | Always |
| `development-workflow.md` | BDD/TDD process, engineering principles | Always |
| `testing-patterns.md` | Executable specifications, test frameworks, Screenplay testing | Always |
| `screenplay-pattern.md` | Implementing Abilities, Interactions, Tasks, Questions | Always |
| `web-testing.md` | PEQL, dependency inversion, browser packages | Conditional: web/playwright/webdriverio files |
| `test-runner-adapters.md` | Adapter pattern, domain events, creating adapters | Conditional: cucumber/mocha/jasmine/playwright-test files |
| `debugging-ci.md` | Running tests, CI pipeline, troubleshooting | Always |
| `commit-conventions.md` | Conventional commits, scopes, release process | Always |
| `steering-maintenance.md` | This file — meta-guidance | Always |

## When to Update

Update steering docs when:

- A convention was unclear and caused an incorrect implementation
- A new pattern was discovered that should be followed consistently
- Build commands, file paths, or tooling changed
- An outdated example led to wrong assumptions
- A new bounded context (package) was added

## How to Update

1. Identify the specific section that needs changing
2. Propose the update with rationale ("this led to X mistake because Y")
3. Keep updates concise — steering docs should be reference material, not tutorials
4. Verify examples still compile and match actual codebase patterns

## What Belongs Here vs Elsewhere

**In steering docs:**
- Project-specific conventions not obvious from code
- Architecture decisions and their rationale
- Build/test commands with common variations
- Patterns that should be followed consistently

**Not in steering docs:**
- Generic TypeScript knowledge
- Information in README.md or CONTRIBUTING.md (link instead)
- Temporary workarounds (use code comments with a TODO)
- Step-by-step tutorials (use the website handbook)

## Conditional Inclusion

Use front-matter to activate docs only when relevant files are open:

```yaml
---
inclusion: fileMatch
fileMatchPattern: "**/web/**,**/playwright/**"
---
```

Use this for module-specific guidance that adds noise in other contexts.

## Quality Criteria

Good steering docs are:
- **Opinionated** — state what to do, not all possible options
- **Concise** — reference format, not prose essays
- **Accurate** — examples match the actual codebase
- **Stable** — don't change with every commit; capture durable conventions
- **Non-duplicative** — each fact lives in one place
