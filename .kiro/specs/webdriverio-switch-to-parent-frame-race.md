# WebdriverIO: `switchToParentFrame()` race condition in BiDi sessions

## Status: IN REVIEW — upstream PR open, Serenity/JS workaround merged in #3545

| Where | What | State |
|---|---|---|
| [webdriverio/webdriverio#15948](https://github.com/webdriverio/webdriverio/pull/15948) | Upstream fix, against the `v9` branch | Open, review feedback addressed in `3f8e32af0` |
| `jan-molak/webdriverio`, branch `repro/switch-to-parent-frame-race` | Fork branch backing the PR | Pushed |
| serenity-js/serenity-js#3545, commit `d6a237947a` | Workaround in `@serenity-js/webdriverio` | On `perf/core-avoid-fixed-cue-delay` |

## Problem

In WebdriverIO 9 BiDi sessions, `await browser.switchToParentFrame()` can resolve before WebdriverIO knows which
browsing context is current. Commands issued straight afterwards then run in the frame the browser has just left.

`ContextManager` (`packages/webdriverio/src/session/context.ts`) works out the parent frame in a `"command"` event
listener, which the command doesn't await:

```ts
if (event.command === 'switchToParentFrame') {
    return this.#browser.browsingContextGetTree({}).then(({ contexts }) => {
        const parentContext = this.findParentContext(this.#currentContext!, contexts)
        // ...
        this.setCurrentContext(parentContext.context)
    })
}
```

When two `switchToParentFrame()` calls follow each other, the second one starts from the stale context.
Both step up from the same frame, so the browser ends up one level too deep. Retrying assertions,
e.g. `expect($('h1')).toHaveText(...)`, hide it. Single-shot commands, e.g. `browser.execute(...)`, don't.

### How Serenity/JS hit it

Removing the 10ms polling delay after each activity (`perf(core)`, #3545) made the WebdriverIO nested-iframe tests
in `integration/web-specs/spec/screenplay/models/PageElement.spec.ts` fail intermittently: after switching back out of
a nested iframe, `Page.current().title()` still returned the middle frame's title.

### Reproduction

- Plain WebdriverIO 9.31.7, outside Serenity/JS: 11 of 20 runs read the wrong frame (`no such element`), 0 of 20 with
  a 20ms `browser.pause()` after each `switchToParentFrame()` call
- E2E test in the fork: `e2e/wdio/headless/test.e2e.ts` →
  "switches to the top-level browsing context when leaving nested frames in quick succession".
  Before the fix: fails 5 of 5 with `Received: "IFrame A"`. Passes with a 50ms pause after each call

```sh
cd e2e && npx wdio run ./wdio/wdio.conf.ts --spec ./wdio/headless/test.e2e.ts --mochaOpts.grep "quick succession"
```

The same listener code is in WebdriverIO v10.0.0. Not verified on v10, which changes how BiDi sessions handle `switchFrame`.

WebdriverIO 8 is not affected: it has no BiDi context tracking (`integration/webdriverio-8-web` passes without the workaround).

## Upstream fix (fork, `repro/switch-to-parent-frame-race`)

| Commit | Change |
|---|---|
| `b6af22749` | `test(webdriverio)`: the e2e reproduction above (fails on its own) |
| `c421d7e1e` | `fix(webdriverio)`: chain context updates and await them in `getCurrentContext()` |
| `3f8e32af0` | `fix(webdriverio)`: avoid deadlock when command hooks read the context (review feedback) |

### Design

1. **Chain the updates.** Each `switchToParentFrame` update is appended to `#pendingContextUpdate`, so consecutive
   calls step up one frame at a time
2. **Await pending updates.** `getCurrentContext()` awaits `#pendingContextUpdate` before returning, so every command
   that reads the context sees the frame `switchToParentFrame()` moved to
3. **Log failures.** If retrieving the tree fails, a warning is logged and the current context is kept
   (previously an unhandled rejection)
4. **Bypass command hooks.** The update retrieves the tree via `browser._bidiHandler.browsingContextGetTree()`,
   not the `browsingContextGetTree` command. Commands run `beforeCommand`/`afterCommand` hooks; a hook that ran a
   command reading the current context (e.g. `browser.execute()`) waited for the update, which waited for the hook —
   a deadlock that no request timeout breaks. Falls back to the command when there's no BiDi handler.
   Side effect: user hooks no longer observe this internal lookup

The parent-frame lookup itself is unchanged, extracted into `#switchToParentContext()`.

### Verification so far

- `npx vitest run packages/webdriverio`: 1382 passed, 1 skipped
- `tests/session/context.test.ts`: 4 new tests, all of which failed before the fix:
  - waits for a pending parent-frame lookup before returning the current context
  - applies consecutive switches in order
  - keeps the current context and logs a warning if the tree can't be retrieved
  - doesn't deadlock when a `beforeCommand` hook of the (real `wrapCommand`-wrapped) lookup reads the current context
- E2E reproduction: 5 of 5 passes with the fix
- Deadlock, end to end: a temporary config with `beforeCommand` calling `browser.execute()` on `browsingContextGetTree`
  failed against `c421d7e1e` and passed 2 of 2 against `3f8e32af0` (config deleted, not committed)
- ESLint and `tsc` clean on the changed files

### Known unrelated e2e failures (local machine)

- "should take a screenshot of the iframe": expects ≤ 190px wide, gets 934px; fails with and without the fix
- "should reset the frame when the page is reloaded": exceeds the 60s test timeout when
  `the-internet.herokuapp.com` is slow (~30s per page load for its static assets, measured with the Resource Timing API)

## Serenity/JS workaround (`@serenity-js/webdriverio`)

`WebdriverIORootLocator` tracks the frames it entered. In BiDi sessions, `switchToParentFrame()` switches to the
top-level context (`switchFrame(null)`) and re-enters the frames above the current one with `switchFrame(frame)`,
which updates the context before it resolves. Falls back to `browser.switchToParentFrame()` for WebDriver Classic,
or when the locator didn't enter the current frame itself. `switchToMainFrame()` and `switchToFrame(null)` clear the list.

- Unit tests: `packages/webdriverio/spec/screenplay/models/locators/WebdriverIORootLocator.spec.ts`
- Integration: `integration/webdriverio-web` (`PageElement.spec.ts` passed 5 of 5; previously failed 2 of 3)
- Not applied to `@serenity-js/webdriverio-8` (not affected, see above)

## Next steps

1. **Follow the upstream review** on #15948: respond to further feedback, re-run the unit tests and the e2e reproduction
   (`pnpm run compile` first — tests consume `packages/*/build`)
2. **Decide on v10.** Port the fix to `main` (WebdriverIO v10) in a separate PR, adjusting the e2e test if v10's
   BiDi `switchFrame` behaviour differs. The PR description offers this
3. **Commit history.** If maintainers want green commits, squash `b6af22749` (failing reproduction) into the fix
4. **Remove the Serenity/JS workaround** once a WebdriverIO release with the fix is the minimum supported version.
   Revert `WebdriverIORootLocator.switchToParentFrame()` to `browser.switchToParentFrame()`, keep its unit tests
   for the Classic path, and update the `web-testing.md` gotcha

## Fork setup notes

- Node 24, pnpm 10.34.5 (pinned on the `v9` branch; `main` pins pnpm 11)
- `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` (non-TTY install aborts otherwise), then `pnpm run setup`
- Switching the fork back to `main` needs a fresh install
- `upstream` remote: `https://github.com/webdriverio/webdriverio.git`
