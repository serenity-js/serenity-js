# Maintaining the Agent Guidance

The agent guidance captures what the code doesn't make obvious: conventions, architecture decisions, commands and the
mistakes that cost someone time. It's written for AI agents and contributors alike, and it works with any agent that
reads `AGENTS.md` and Agent Skills.

## Where guidance lives

| Location | Loaded | Holds |
|---|---|---|
| `AGENTS.md` | In every session | The index: structure, commands, workflow and the rules that always apply. At most 150 lines |
| `CLAUDE.md` | In every Claude Code session | A pointer to `AGENTS.md`, nothing else |
| `docs/agents/*.md` | When `AGENTS.md` sends an agent there | Detailed conventions that apply across packages |
| `.agents/contributing-skills/<name>/` | When the skill's `description` matches the task | What a contributor needs to change one area of the code |
| `packages/<package>/skills/<name>/` | Shipped with the package; linked here too | What users of the package need to know |

`AGENTS.md` lists every document and skill, and says when to read it. When you add, rename or remove one, update
that list in the same pull request.

Every fact lives in one place. If two documents need it, one of them links to the other.

## How skills reach your agent

Agents only discover skills in their own skill directories. `make install` runs `bin/link-skills.ts`, which links
every skill in `.agents/contributing-skills/` and `packages/*/skills/` into `.agents/skills/`, `.claude/skills/` and
`.kiro/skills/`. Those directories are generated and gitignored, so each skill has one source.

Run `pnpm link-skills` after adding, renaming or removing a skill. It adds the missing links and removes the
ones whose source is gone. On Windows, the links are directory junctions, which need no extra permissions.

## Writing a skill

- **The directory name is the skill's `name`.** Contributor skills start with `serenity-js-contributing-`, and
  framework skills with `serenity-js-`.
- **The `description` decides when the skill loads.** Say what the skill covers, then when to use it:
  "Use when changing packages/web, …". Name the task, not just the package.
- **`SKILL.md` stays focused.** Move detail an agent only sometimes needs into `references/*.md`, and tell the
  reader in `SKILL.md` when to read each one.
- **Links are relative**, and `pnpm lint` checks that every one of them resolves.

## Capturing what you learn

When something non-obvious costs you time, record it where the next person will be when it matters. A lesson in
a shared file either loads in every session or, more often, isn't there when it's needed. A lesson in the skill for
its area loads exactly when an agent works on that area.

1. **Add it to the Gotchas of the area it concerns**, in the same pull request as the change that taught it.
   The HTML reporter's are in its skill's [references/gotchas.md](../../.agents/contributing-skills/serenity-js-contributing-html-reporter/references/gotchas.md); elsewhere, use an "Implementation Gotchas"
   section of the skill or document.
2. **If no skill covers the area, that's the signal to create one.** There's no general inbox.
3. **Write the rule in the heading, then why.** "`isPresent()` and `isVisible()` aren't interchangeable",
   followed by what went wrong and what to do instead. Keep it to a few sentences.
4. **Retire lessons the code has made obsolete.** When a lint rule, a type or a test prevents the mistake,
   delete the lesson. When it turns into a convention that applies widely, move it into the relevant document.

## When to update the guidance

- A convention was unclear and led to a wrong implementation
- A pattern should be followed consistently from now on
- Commands, paths or tooling changed
- An example is out of date and led someone astray
- A package was added, renamed or removed

Propose the change with its reason ("this led to X because Y"), and check that the examples still match the code.

## What belongs here

Project-specific conventions, architecture decisions and their rationale, commands with their common variations,
and patterns to follow consistently.

Not generic TypeScript knowledge, nor what `README.md` or `CONTRIBUTING.md` already say: link to them instead.
Step-by-step tutorials belong in the Serenity/JS Handbook on serenity-js.org.

## Good guidance is

- **Opinionated:** it says what to do, not every possible option
- **Concise:** reference material, not essays
- **Accurate:** its examples match the code
- **Durable:** it changes when conventions change, not with every commit
