# Steering Documentation Maintenance

## Purpose

These steering docs encode Serenity/JS engineering conventions that are not obvious from the code alone. They serve as long-term guidance for AI assistants and contributors alike, ensuring architectural consistency regardless of who is making changes.

## Document Map

| File | Purpose | Inclusion |
|------|---------|-----------|
| `project-overview.md` | Architecture, DDD philosophy, packages, tech stack | Always |
| `coding-standards.md` | Value objects, Good Citizen rule, style, backwards compatibility | Always |
| `development-workflow.md` | BDD/TDD process, engineering principles, verification, agent working style | Always |
| `testing-patterns.md` | Executable specifications, unit test frameworks, Screenplay testing | Always |
| `screenplay-pattern.md` | Implementing Abilities, Interactions, Tasks, Questions; core implementation gotchas | Always |
| `debugging-ci.md` | Running tests, CI pipeline, troubleshooting, project template CI gotchas | Always |
| `commit-conventions.md` | Conventional commits, scopes, release process | Always |
| `documentation-standards.md` | Writing and publishing docs on serenity-js.org | Always |
| `writing-voice.md` | Jan Molak's writing voice for user-facing text: docs, blog posts, READMEs, JSDoc | Always |
| `steering-maintenance.md` | This file — meta-guidance | Always |
| `idiomatic-screenplay-tests.md` | Writing tests and interaction objects: PEQL idioms, task outcomes, anti-patterns | Conditional: `*.spec.ts`, `*.serenity.ts` files |
| `web-testing.md` | PEQL, dependency inversion, browser packages, what retries, web/WebdriverIO gotchas | Conditional: web/playwright/webdriverio/protractor files |
| `test-runner-adapters.md` | Adapter pattern, domain events, creating adapters | Conditional: cucumber/mocha/jasmine/playwright-test files |
| `html-reporter-architecture.md` | HTML reporter architecture, data flow, component patterns | Conditional: html-reporter files |
| `html-reporter-ux.md` | UX principles, personas, navigation model, evidence presentation, accessibility | Conditional: html-reporter files |
| `lessons-learned.md` | HTML reporter gotchas and temporary rules not yet graduated into a main doc | Conditional: html-reporter files |

Gotchas live next to the conventions they relate to, in an "Implementation Gotchas" section of the doc that loads
for that code, so that they're in context when they matter: core in `screenplay-pattern.md`, web and browser
packages in `web-testing.md`, agent-specific gotchas in `development-workflow.md`. `lessons-learned.md` only
loads for html-reporter files, so don't add gotchas for other packages there.

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
