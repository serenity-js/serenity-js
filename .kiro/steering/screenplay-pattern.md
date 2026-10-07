# Implementing Screenplay Pattern Components

The Screenplay Pattern is the architectural foundation of Serenity/JS. Every component expresses a clear responsibility
aligned with SOLID principles and domain-driven thinking.

## Core Concepts

| Component       | Responsibility                                | SOLID Principle           |
|-----------------|-----------------------------------------------|---------------------------|
| **Actor**       | Orchestrates activities and answers questions | Single entry point        |
| **Ability**     | Wraps infrastructure (dependency inversion)   | D — Dependency Inversion  |
| **Interaction** | Single atomic action                          | S — Single Responsibility |
| **Task**        | Composes activities into business workflows   | O — Open/Closed           |
| **Question**    | Retrieves information without side effects    | Command/Query Separation  |

## Abilities

Abilities encapsulate the **infrastructure layer** — they are how actors interact with system interfaces. They follow
the Dependency Inversion Principle: tests depend on the abstraction (`BrowseTheWeb`), never the concretion (
`BrowseTheWebWithPlaywright`).

### Structure

```typescript
import { Ability } from '@serenity-js/core';

export class MakePhoneCalls extends Ability {

    static using(phoneService: PhoneService): MakePhoneCalls {
        return new MakePhoneCalls(phoneService);
    }

    static as(actor: UsesAbilities): MakePhoneCalls {
        return actor.abilityTo(MakePhoneCalls);
    }

    constructor(private readonly phoneService: PhoneService) {
        super();
    }

    dial(number: string): Promise<Call> {
        return this.phoneService.dial(number);
    }
}
```

### Lifecycle Hooks

Abilities may implement `Initialisable` and/or `Discardable` for resource management:

```typescript
import { Ability, Discardable, Initialisable } from '@serenity-js/core';

export class UseDatabase extends Ability implements Initialisable, Discardable {
    private connection: Connection;

    async initialise(): Promise<void> {
        this.connection = await Database.connect(this.config);
    }

    isInitialised(): boolean {
        return !! this.connection;
    }

    async discard(): Promise<void> {
        await this.connection?.close();
    }
}
```

### Design Rules

- One ability per external system interface
- Factory method `static using(...)` for construction
- Accessor `static as(actor)` for retrieval
- Wrap infrastructure; expose domain-meaningful methods
- Never expose raw driver/client references to tests

## Interactions

Interactions are **single, atomic actions** at the solution domain level. They follow the Single Responsibility
Principle — one interaction, one action.

### Preferred: Factory Function

```typescript
import { Answerable, Interaction, the } from '@serenity-js/core';

export const Dial = (phoneNumber: Answerable<string>) =>
    Interaction.where(the`#actor dials ${ phoneNumber }`, async actor => {
        const number = await actor.answer(phoneNumber);
        await MakePhoneCalls.as(actor).dial(number);
    });
```

### Class-Based: Builder Pattern

Use a class when the interaction has a fluent builder API:

```typescript
export class Send extends Interaction {

    static a(request: Answerable<HTTPRequest>): Send {
        return new Send(request);
    }

    constructor(private readonly request: Answerable<HTTPRequest>) {
        super(the`#actor sends ${ request }`);
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const request = await actor.answer(this.request);
        await CallAnApi.as(actor).send(request);
    }
}
```

### Design Rules

- Named using solution-domain vocabulary: `Click`, `Enter`, `Send`, `Navigate`
- Does exactly one thing — if it does two, split it into two
- Accepts `Answerable<T>` parameters for runtime resolution
- Uses `the` tagged template for the description (`#actor` gets replaced with actor name)

## Tasks

Tasks compose activities into **business-meaningful workflows**. They are how you express domain language in your test
suite.

### Preferred: Function Returning Task

```typescript
import { Task, the } from '@serenity-js/core';

export const PlaceOrder = (product: Answerable<Product>) =>
    Task.where(the`#actor places an order for ${ product }`,
        AddToCart(product),
        ProceedToCheckout(),
        ConfirmPayment(),
    );
```

### Pending Tasks (Specification Placeholders)

Tasks with no activities are reported as "pending" — useful for outside-in BDD:

```typescript
export const ReviewOrder = () =>
    Task.where(the`#actor reviews the order`);
// No activities = pending in reports
```

### Design Rules

- Named using problem-domain vocabulary: `Authenticate`, `PlaceOrder`, `SubmitClaim`
- Compose existing interactions and tasks — never duplicate interaction logic
- Each task should represent a single business capability
- Prefer functions returning Tasks over Task subclasses

## Questions

Questions retrieve information without side effects. They implement Command/Query Separation — asking a question never
changes the system state.

### Basic Question

```typescript
import { Question, QuestionAdapter } from '@serenity-js/core';

export const CurrentUrl = (): QuestionAdapter<string> =>
    Question.about('current page URL', async actor => {
        const page = await BrowseTheWeb.as(actor).currentPage();
        return page.url();
    });
```

### Parameterised Question

```typescript
export const TextOf = (element: Answerable<PageElement>): QuestionAdapter<string> =>
    Question.about(the`text of ${ element }`, async actor => {
        const el = await actor.answer(element);
        return el.text();
    });
```

### Meta-Questions (Composable Questions)

Meta-questions compose with other answerables using `.of()` — the same pattern that makes PEQL work:

```typescript
export const Attribute = {
    of: (element: Answerable<PageElement>) => ({
        called: (name: Answerable<string>): QuestionAdapter<string> =>
            Question.about(
                the`${ name } attribute of ${ element }`,
                async actor => {
                    const el = await actor.answer(element);
                    const attrName = await actor.answer(name);
                    return el.attribute(attrName);
                }
            ),
    }),
};

// Usage: Attribute.of(button).called('aria-label')
```

### Question Mapping (QuestionAdapter)

`QuestionAdapter<T>` proxies methods of `T`, enabling transformation chains:

```typescript
const itemCount = Text.of(CartBadge)
    .as(Number);                    // QuestionAdapter<number>

const isCartEmpty = Text.of(CartBadge)
    .as(Number)
    .as(count => count === 0);      // QuestionAdapter<boolean>

const price = Text.of(priceElement)
    .trim()
    .replace('£', '')
    .as(Number);                    // QuestionAdapter<number>
```

### Design Rules

- Named as nouns or noun phrases: `Text`, `Value`, `CurrentUrl`, `Attribute`
- Never cause side effects
- Return `QuestionAdapter<T>` for maximum composability
- Support `.describedAs()` for clear reporting

## The Answerable Pattern

All parameters that might be resolved at runtime accept `Answerable<T>`:

```typescript
import { Answerable } from '@serenity-js/core';

export const Enter = {
    theValue: (value: Answerable<string>) => ({
        into: (field: Answerable<PageElement>) =>
            Interaction.where(the`#actor enters ${ value } into ${ field }`,
                async actor => {
                    const text = await actor.answer(value);
                    const element = await actor.answer(field);
                    await element.enterValue(text);
                }
            ),
    }),
};

// Accepts static values and questions alike
await actor.attemptsTo(
    Enter.theValue('hello').into(inputField),
    Enter.theValue(Text.of(sourceField)).into(targetField),
);
```

This enables late binding — the value is resolved when the actor performs the activity, not when the activity is
constructed.

## Description Templates

Use `the` tagged template literals for human-readable activity descriptions:

```typescript
import { the } from '@serenity-js/core';

the`#actor clicks on ${ button }`
// → "Tester clicks on submit button"

the`#actor places an order for ${ product }`
// → "Alice places an order for Sauce Labs Backpack"
```

The `#actor` placeholder is replaced with the actor's name at runtime. Interpolated values use their `.toString()` or
description.

## Composition Patterns Summary

```
Task (business-level)
  └── composes Interactions and other Tasks
        └── Interactions use Abilities (infrastructure)
              └── Abilities wrap drivers/clients/services

Questions (read)
  └── use Abilities to retrieve state
        └── compose via .of() (meta-questions)
              └── transform via .as() (mapping)
```

The test code only sees Tasks and Questions — the business language. Infrastructure details are hidden behind Abilities
and Interactions.

## Implementation Gotchas

### `instanceof` checks must survive the dual-package hazard

`@serenity-js/*` packages ship CJS and ESM builds, and both can be loaded in the same process. A class
created by one copy fails a plain `instanceof` check against the other copy's class — which is how
interactions ended up reported as tasks in #3535. Classes checked with `instanceof` across package boundaries
implement `Symbol.hasInstance` with a `Symbol.for` type brand, as `Activity`, `Ability`, `Outcome` and
`RuntimeError` do. See `web-testing.md` → "Dual-package hazard" for how to test it.

### Async operations registered by the Stage must not wait for themselves

`StageManager.waitForAsyncOperationsToComplete()` resolves immediately when nothing is in progress.
Work that the `Stage` starts without awaiting it, like dismissing actors on `SceneFinishes`, must register
its async operations (`ActorStageExitAttempted`) **before** its first `await`, so that `waitForNextCue()`
sees them. If that work then waits for other operations to complete, it must exclude its own,
using `waitForAsyncOperationsToComplete({ except: [...] })` — otherwise it waits for itself until the cue timeout.
Keep the work-in-progress registry as the single record of pending work: a separately tracked promise
bypasses the cue timeout and hangs `waitForNextCue()` when the work never completes.

### Adding `metaQuestionBody` to `Question.about()` changes the proxy inspect output

When you pass a third argument (metaQuestionBody) to `Question.about()`, the underlying statement becomes a `MetaQuestionStatement` instead of a `QuestionStatement`. This changes `util.inspect` output of the proxy from `Proxy<QuestionStatement>` to `Proxy<MetaQuestionStatement>`. Any integration test that asserts on error messages containing the inspect representation will fail. Search for `Proxy<QuestionStatement>` in `integration/web-specs/spec/expectations/` when making such changes.

### QuestionAdapter proxy `apply` trap must unwrap Screenplay return types

When a proxy-forwarded method call returns a `Question` or `Task` (e.g., an Interaction Object method returning `QuestionAdapter<string>` or `Task`), the `apply` trap must unwrap it — resolve Questions via `actor.answer()` and perform Activities via `performAs()`. Without this, the proxy double-wraps the result in another `QuestionAdapter`, causing `Ensure.that()` to receive a proxy object instead of the resolved value.

This was not needed before `.as(Constructor)` because proxy forwarding only targeted primitives (`string`, `number`, `Array`) whose methods return plain values.

### `AnswerQuestions.answer()` does not recursively unwrap Promise<Question>

When `actor.answer()` receives a Promise, it returns the Promise as-is — it does not check whether the resolved value is itself a Question. This means double-wrapped `QuestionAdapter<QuestionAdapter<T>>` won't resolve correctly through `actor.answer()` alone. The unwrapping must happen at the source (the proxy `apply` trap), not in the resolution pipeline.

### `Question` is not PromiseLike — `Awaited` does not unwrap `QuestionAdapter`

`Question<T>` extends `Describable`, not `PromiseLike`. Therefore `Awaited<QuestionAdapter<string>>` does NOT collapse to `string` — it stays as `QuestionAdapter<string>`. The `UnwrapQuestionResult` conditional type was needed in `QuestionAdapterFieldDecorator` to prevent `QuestionAdapter<QuestionAdapter<T>>` at the type level.

### Detecting ES6 classes: use `mapping.prototype`, not error message matching

ES6 classes throw `TypeError: Class constructor X cannot be invoked without 'new'` when called as a function. Matching the error message string is fragile across V8 versions. Instead, check `mapping.prototype` — arrow functions don't have one, so a `TypeError` from a function with a `prototype` strongly indicates a class.

The function-first order matters: `Number(42)` returns a primitive, but `new Number(42)` returns a wrapper object. Call as function first, fall back to `new`.
