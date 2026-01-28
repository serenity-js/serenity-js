# Implementing Screenplay Pattern Components

This guide covers how to implement new Screenplay Pattern components in Serenity/JS.

## Creating a Custom Ability

Abilities enable actors to interact with system interfaces.

```typescript
import { Ability } from '@serenity-js/core';

export class MakePhoneCalls extends Ability {
    
    // Factory method for fluent API
    static using(phoneService: PhoneService): MakePhoneCalls {
        return new MakePhoneCalls(phoneService);
    }

    // Retrieve ability from actor
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

### Initialisable Abilities

For abilities requiring async setup:

```typescript
import { Ability, Initialisable } from '@serenity-js/core';

export class UseDatabase extends Ability implements Initialisable {
    private connection: Connection;

    async initialise(): Promise<void> {
        this.connection = await Database.connect(this.config);
    }

    isInitialised(): boolean {
        return !!this.connection;
    }
}
```

### Discardable Abilities

For abilities requiring cleanup:

```typescript
import { Ability, Discardable } from '@serenity-js/core';

export class UseDatabase extends Ability implements Discardable {
    async discard(): Promise<void> {
        await this.connection?.close();
    }
}
```

## Creating a Custom Interaction

Interactions are single, low-level activities.

```typescript
import { Answerable, Interaction, the } from '@serenity-js/core';

// Using factory function (preferred)
export const Dial = (phoneNumber: Answerable<string>) =>
    Interaction.where(the`#actor dials ${ phoneNumber }`, async actor => {
        const number = await actor.answer(phoneNumber);
        await MakePhoneCalls.as(actor).dial(number);
    });

// Usage
await actor.attemptsTo(
    Dial('555-1234'),
);
```

### Class-based Interaction

For complex interactions with builder pattern:

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

## Creating a Custom Task

Tasks compose multiple activities with business meaning.

```typescript
import { Answerable, Task, the } from '@serenity-js/core';

// Function returning Task (preferred)
export const PlaceOrder = (product: Answerable<Product>) =>
    Task.where(the`#actor places an order for ${ product }`,
        AddToCart(product),
        ProceedToCheckout(),
        ConfirmPayment(),
    );

// Usage
await actor.attemptsTo(
    PlaceOrder(selectedProduct),
);
```

### Pending Tasks

Mark unimplemented tasks:

```typescript
export const ReviewOrder = () =>
    Task.where(the`#actor reviews the order`);
    // No activities = marked as pending in reports
```

## Creating a Custom Question

Questions retrieve information from the system.

```typescript
import { Question, QuestionAdapter } from '@serenity-js/core';

// Simple question
export const CurrentUrl = (): QuestionAdapter<string> =>
    Question.about('current page URL', async actor => {
        const page = await BrowseTheWeb.as(actor).currentPage();
        return page.url();
    });

// Question with parameter
export const TextOf = (element: Answerable<PageElement>): QuestionAdapter<string> =>
    Question.about(the`text of ${ element }`, async actor => {
        const el = await actor.answer(element);
        return el.text();
    });
```

### MetaQuestions

Questions that can be composed with other answerables:

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

// Usage
await actor.answer(Attribute.of(button).called('aria-label'));
```

### Question Mapping

Transform question results:

```typescript
const itemCount = Text.of(CartBadge)
    .as(Number);  // QuestionAdapter<number>

const isCartEmpty = Text.of(CartBadge)
    .as(Number)
    .as(count => count === 0);  // QuestionAdapter<boolean>
```

## Answerable Pattern

Accept both static values and questions as parameters:

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

// Accepts both static and dynamic values
await actor.attemptsTo(
    Enter.theValue('hello').into(inputField),
    Enter.theValue(Text.of(sourceField)).into(targetField),
);
```

## Description Templates

Use tagged template literals for readable descriptions of questions and activities:

```typescript
import { the } from '@serenity-js/core';

// the`` - includes #actor placeholder
the`#actor clicks on ${ button }`
// → "Tester clicks on Submit button"
```
