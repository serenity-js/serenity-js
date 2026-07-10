# ListItemNotFoundError handling in expectations

## Problem

When using `Ensure.that(question, not(isPresent()))` where the `question` resolves through
a `.first()` call on an empty filtered list, `ListItemNotFoundError` is thrown during
the **description resolution phase** of `Ensure`, before `isPresent()` gets a chance to
evaluate.

## Reproduction

```typescript
const view = new SystemContextView(rootElement);

// When CI section is absent, there are no context items labelled "PROVIDER".
// contextItemCalled('PROVIDER') uses .where(...).eachMappedTo(...).first()
// which throws ListItemNotFoundError when the filtered list is empty.

await actor.attemptsTo(
    Ensure.that(view.ciProvider(), not(isPresent())),
    // ❌ Throws ListItemNotFoundError during Ensure.describedBy()
);
```

## Stack trace

```
ListItemNotFoundError: Can't retrieve the first item from a list with 0 items: [ ]
    at MetaQuestionStatement.body (packages/core/src/screenplay/questions/List.ts:235)
    at MetaQuestionStatement.answeredBy (packages/core/src/screenplay/Question.ts:631)
    at Ensure.describedBy (packages/core/src/screenplay/questions/Describable.ts:25)
    at PerformActivitiesAsPlaywrightSteps.perform
```

## Analysis

The error propagation path:

1. `Ensure` calls `describedBy(actor)` to generate the step name for reporting
2. `describedBy` resolves the description template, which references the actual question
3. Resolving the question evaluates the full chain including `.first()`
4. `.first()` throws `ListItemNotFoundError` because the filtered list is empty
5. The error escapes before `isPresent()` can evaluate

## Partial fix applied

`packages/assertions/src/expectations/isPresent.ts` was updated to catch
`ListItemNotFoundError` and return `ExpectationNotMet`. This handles the case
where the error occurs **during expectation evaluation**, but does NOT handle
the error occurring **during description resolution**.

## Desired behaviour

```typescript
// Should pass — ciProvider element is not present when CI is null
await actor.attemptsTo(
    Ensure.that(view.ciProvider(), not(isPresent())),
);
```

## Options to investigate

1. **Make `Ensure.describedBy` tolerant of resolution errors** — catch errors during
   description and use a fallback description string
2. **Make `.first()` return an "absent" Optional** instead of throwing — the Optional
   would report `isPresent() === false`
3. **Make description resolution lazy** — don't resolve the actual question during
   description, use its static `.toString()` instead
4. **Introduce `.firstOrAbsent()`** — a variant of `.first()` that returns an element
   implementing `Optional` with `isPresent() === false` when the list is empty

## Status

⬜ Not started — needs design decision on which approach to take.
