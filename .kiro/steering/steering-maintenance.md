# Steering Documentation Maintenance

This guide covers how to maintain and improve the steering documentation itself.

## When to Update Steering Docs

Recommend updating steering docs when:

- **Learning new patterns** - Discovered an undocumented convention or best practice while working on the codebase
- **Correcting misunderstandings** - A steering doc led to incorrect assumptions that needed fixing
- **Filling gaps** - Encountered a situation where guidance would have been helpful but didn't exist
- **Outdated information** - Build commands, file locations, or processes have changed
- **Clarifying ambiguity** - A doc was unclear and caused confusion

## How to Propose Updates

1. **Ask first** - Before making changes, describe what you learned and suggest the update
2. **Be specific** - Quote the section that needs updating and propose the new content
3. **Explain why** - What situation revealed the need for this update?

Example:
> "While working on the Cucumber adapter, I learned that integration tests also require Java for the Serenity BDD reporter. Should I add this to `debugging-ci.md` under the Development Environment section?"

## What Belongs in Steering Docs

**Include:**
- Project-specific conventions not obvious from the code
- Build and test commands with common variations
- Architecture decisions and rationale
- Workflow guidance (TDD process, PR workflow)
- Troubleshooting common issues
- Policies (backwards compatibility, deprecation)

**Exclude:**
- Generic TypeScript/JavaScript knowledge
- Information already in README.md or CONTRIBUTING.md (link instead)
- Temporary workarounds (use code comments)
- Highly volatile information that changes frequently

## Steering Doc Organization

| File | Purpose |
|------|---------|
| `project-overview.md` | Architecture, packages, tech stack |
| `coding-standards.md` | Code style, TypeScript config, backwards compatibility |
| `testing-patterns.md` | How to write tests |
| `debugging-ci.md` | How to run tests, troubleshoot CI |
| `development-workflow.md` | TDD process, when to ask for clarification |
| `commit-conventions.md` | Commit messages, release process |
| `screenplay-pattern.md` | Implementing Screenplay components |
| `web-testing.md` | Web/PEQL patterns (conditional) |
| `test-runner-adapters.md` | Adapter architecture (conditional) |
| `steering-maintenance.md` | This file - meta-guidance |

## Conditional Steering Docs

Some docs use front-matter to activate only when relevant files are open:

```yaml
---
inclusion: fileMatch
fileMatchPattern: "**/web/**,**/playwright/**"
---
```

Use conditional inclusion for module-specific guidance that would add noise in other contexts.

## Keeping Docs Current

When making significant codebase changes:

1. Check if any steering doc references the changed area
2. Update examples if APIs changed
3. Update file paths if structure changed
4. Remove guidance for deleted features
