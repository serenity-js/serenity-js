# Agentic Workflow Improvements

Observed failure modes and potential structural fixes for how the AI agent operates in this codebase.

## Observed Issues

### 1. git push combined with other commands in a single shell call

**What happened:** Agent combines `git commit && git push` or `command && git push` in one shell invocation, removing the opportunity for user review before push.

**Frequency:** 3 times in one session (2026-08-17).

**Root cause:** Efficiency bias — collapsing predictable sequences into one call to save round-trips.

**Current mitigation:** None structural. Agent is aware of the rule but doesn't reliably follow it.

**Potential fixes (not yet implemented):**
- `deniedCommands` regex blocking `&&.*git push` or `git push` when combined with other commands
- `preToolUse` hook that blocks shell commands containing `git push` alongside other commands
- Split into a hard rule: `git push` must always be the sole command in a shell tool call

---

### 2. git commit --amend on already-pushed commits

**What happened:** Agent amended a pushed commit and force-pushed, rewriting shared history.

**Frequency:** 1 time (2026-08-17).

**Root cause:** Composed `git commit --amend` + `git push --force-with-lease` in one call without checking whether HEAD was pushed.

**Current mitigation:** `require-feature-branch.sh` hook prevents commits on main/master. On feature branches, amend + force-push is safe (only the agent works on these branches).

**Status:** Resolved by the branch protection hook. The remaining risk (pushing before user review) is tracked in issue #1 above.

---

## Potential Improvements (Backlog)

- [ ] Structural enforcement for "git push is always a separate tool call"
- [ ] Pre-push hook that shows the commit log and waits for confirmation
- [ ] Agent self-review step: before pushing, summarise what will be pushed and pause
