---
name: serenity-js-contributing-web-internals
description: "Adding web capabilities to @serenity-js/web and the browser integrations, their integration tests, and known gotchas. Use when changing packages/web, playwright, webdriverio or protractor, or the web integration tests."
---

# Changing @serenity-js/web and the browser integrations

How PEQL, web interactions and questions are used is in [docs/agents/web-testing.md](../../../docs/agents/web-testing.md).
Classes checked with `instanceof` across packages need a type brand; see the dual-package hazard in the
`serenity-js-contributing-core-internals` skill.

## Adding Browser-Specific Features

When implementing a new web capability:

1. **Does the abstraction belong in `@serenity-js/web`?** — if the capability applies across all browsers, define the abstract interface there
2. **Implement in each browser package** — provide concrete implementations that satisfy the contract
3. **Browser-specific only?** — if a capability is unique to one browser (e.g., Playwright-specific tracing), keep it in that browser's package

```typescript
// 1. Abstract contract in @serenity-js/web
export abstract class Page {
    abstract newMethod(): Promise<Result>;
}

// 2. Concrete implementation in @serenity-js/playwright
export class PlaywrightPage extends Page {
    async newMethod(): Promise<Result> {
        return this.page.playwrightSpecificMethod();
    }
}
```

## Integration Tests

```bash
make INTEGRATION_SCOPE=playwright-web integration-test
make INTEGRATION_SCOPE=webdriverio-web integration-test
```

Shared web specifications live in `integration/web-specs/`. Browser-specific tests live in `integration/<browser>-web/`.

## Implementation Gotchas

### `PageElement.createAdapter()` wraps any `Answerable<PageElement>` with proper child element access

When an Interaction Object receives an `Answerable<PageElement>` (which could be a resolved `PageElement` or a deferred `QuestionAdapter<PageElement>`), use `PageElement.createAdapter()` to wrap it. This provides `.element()` and `.elements()` methods for scoped child lookups regardless of whether the root is resolved or deferred. Never use `as any` casts to access `.element()` on an `Answerable<PageElement>`.

### WebdriverIO 9 BiDi: `switchToParentFrame()` resolves before the frame changes

In BiDi sessions, WebdriverIO updates its current browsing context in an un-awaited `"command"` event listener,
so commands issued straight after `browser.switchToParentFrame()` can run in the frame the browser has just left.
`WebdriverIORootLocator` works around it by tracking the frames it entered and re-entering the frames above
the current one with `browser.switchFrame()`, which updates the context before it resolves.
Don't replace this with a plain `switchToParentFrame()` call until the upstream fix is released
(reproduction and fix: `jan-molak/webdriverio`, branch `repro/switch-to-parent-frame-race`).
