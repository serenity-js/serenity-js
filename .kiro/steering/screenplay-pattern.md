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
