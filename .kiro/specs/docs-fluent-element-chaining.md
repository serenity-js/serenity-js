# Documentation: Fluent Element Chaining and Interaction Objects

## Status: Planning

## Goal

Update the Serenity/JS handbook to reflect the new `.element()` / `.elements()` APIs
and the interaction objects pattern. The docs should lead with the new fluent pattern
while keeping `.of()` documented as the mechanism for question composition.

## Pages to Update

### 1. PEQL Guide (`page-element-query-language.md`)

**Rename section:** "Composing page elements using meta-questions" → "Locating child elements"

**Lead with the new pattern:**
```typescript
const basket = PageElement.located(By.css('#basket'));
const items = basket.elements(By.css('.item'));
const firstItem = items.first().element(By.css('.name'));
```

**Reposition `.of()` as question composition** — explain it's for `Text.of()`,
`Attribute.called().of()`, and `eachMappedTo()`, not the primary way to scope elements.

**Add "Deep chaining" subsection** after the renamed section — demonstrate
`.elements().where().first().elements()`.

**Update examples in:**
- Filtering page elements — use `.elements()` instead of `PageElements.located().of()`
- Finding a sibling element — show both fluent and `.of()` approaches
- Mapping page elements — update element definitions
- Custom meta-questions — use `.element()` inside the meta-question body

### 2. Page Objects Page (`page-objects-pattern.mdx`)

**Rewrite as a 3-level progression:**

1. **Helper functions** — plain functions wrapping `PageElement.located()` with `.element()`/`.elements()`
2. **Lean Page Objects** — static classes (update existing examples to use new APIs)
3. **Interaction objects** — components with Questions and Tasks, using `this.rootElement.element()`/`.elements()`

**Use TodoMVC domain** for the interaction objects examples.

**End with a "when to use which" table.**

### 3. Template Updates (follow-up, separate PRs)

- `serenity-js-playwright-test-template` — update to use `.element()` pattern
- `serenity-js-playwright-ct-react-template` — update Dropdown interaction object
- `serenity-js-playwright-ct-web-components-template` — same
- `serenity-js-jasmine-webdriverio-template` — update TodoListItem
- `serenity-js-mocha-webdriverio-template` — same
- `examples/playwright-test-todomvc` — update InteractionObject and IOs

## Key Framing Decisions

1. **`.of()` is not deprecated.** It's the mechanism for question composition.
   `.element()`/`.elements()` is the recommended way to locate child elements.

2. **Lead with new, explain old.** New readers learn `.element()`/`.elements()` first.

3. **Interaction objects are a pattern, not a framework requirement.**
   Document the pattern; don't imply it requires a specific base class.
   `PageElement.createAdapter()` is the framework feature that enables it.

4. **Don't create a separate interaction objects page yet.**
   Incorporate into the Page Objects page as the third level.

## Order of Work

1. Rewrite the Page Objects page (smaller, self-contained)
2. Update the PEQL composition section
3. Update remaining PEQL examples
4. Template updates (separate PRs)

## What Remains

- [ ] Page Objects page rewrite
- [ ] PEQL "Locating child elements" section
- [ ] PEQL "Deep chaining" new subsection
- [ ] PEQL filtering examples update
- [ ] PEQL mapping examples update
- [ ] PEQL custom meta-questions update
- [ ] Template updates (separate PRs)
