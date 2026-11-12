---
name: serenity-js-writing-interactions-and-abilities
description: "Writing Screenplay Pattern interactions and abilities with Serenity/JS: interactions with Interaction.where, abilities that wrap a client of the system under test, retrieving them with Ability.as, abilities that initialise and discard their resources, and interchangeable implementations. Use when adding an interaction, or when the system under test has an interface that no Serenity/JS integration covers."
---

# Writing Screenplay interactions and abilities

An interaction is one thing an actor does with the system under test: dial a number, click a button, send a
request. An ability is what enables it. It wraps the client of one of the system's interfaces, such as a browser, an
HTTP client or a phone, and gives the actor's interactions and questions access to it.

Tests rarely use either directly. They use tasks, which compose interactions into goals in the business domain;
the serenity-js-writing-tasks skill covers those.

## Check whether you need a new ability

The Serenity/JS integrations give actors abilities for the most common interfaces: `BrowseTheWeb` in
`@serenity-js/web`, with `@serenity-js/playwright` or `@serenity-js/webdriverio`, `CallAnApi` in
`@serenity-js/rest`, and `TakeNotes` in `@serenity-js/core`, for data the actor remembers. Write your interactions
on top of those.

Write an ability only for an interface no integration covers, such as a phone line, a message queue or a database.

## Wrap the client in an ability

Extend `Ability`, take the client in a static `using` method, and give the ability methods named after what the
interface does:

```typescript
import { Ability, actorCalled } from '@serenity-js/core'

// the client your project uses to reach the system under test
interface Phone {
    dial(phoneNumber: string): Promise<void>
    press(key: string): Promise<void>
    connectedNumber(): Promise<string>
}
declare const phone: Phone

export class MakePhoneCalls extends Ability {
    static using(phone: Phone): MakePhoneCalls {
        return new MakePhoneCalls(phone)
    }

    constructor(private readonly phone: Phone) {
        super()
    }

    dial(phoneNumber: string): Promise<void> {
        return this.phone.dial(phoneNumber)
    }

    press(key: string): Promise<void> {
        return this.phone.press(key)
    }

    connectedNumber(): Promise<string> {
        return this.phone.connectedNumber()
    }
}

actorCalled('Alice').whoCan(MakePhoneCalls.using(phone))
```

- **Name it after what it enables**, as in "Alice can make phone calls": `MakePhoneCalls`, `BrowseTheWeb`,
  `CallAnApi`.
- **Keep the state the interactions share** in the ability: the client, its configuration, or the last response
  it received.
- **Keep the constructor public.** `MakePhoneCalls.as(actor)` doesn't compile for an ability with a `protected` or
  `private` constructor.
- **An actor has one ability of each type.** Give an actor the abilities its role needs, in `whoCan`, or for every
  actor at once in a `Cast`.

## Retrieve it with `as`

Interactions and questions retrieve the actor's ability with the static `as` method:

```typescript
import { Ability, Answerable, Interaction, the } from '@serenity-js/core'

// the ability above
declare class MakePhoneCalls extends Ability {
    dial(phoneNumber: string): Promise<void>
}

export const Dial = (phoneNumber: Answerable<string>) =>
    Interaction.where(the`#actor dials ${ phoneNumber }`, async actor => {
        const number = await actor.answer(phoneNumber)
        await MakePhoneCalls.as(actor).dial(number)
    })
```

When the actor doesn't have the ability, `as` throws a `ConfigurationError` that lists the abilities they do have,
and ends with "They can't, however, MakePhoneCalls yet. Did you give them the ability to do so?"

## Write an interaction with `Interaction.where`

`Interaction.where` takes the description to report and a function that performs the interaction:

```typescript
import { Ability, Answerable, Interaction, the } from '@serenity-js/core'

declare class MakePhoneCalls extends Ability {
    press(key: string): Promise<void>
}

export const Press = (key: Answerable<string>) =>
    Interaction.where(the`#actor presses ${ key }`, async actor => {
        await MakePhoneCalls.as(actor).press(await actor.answer(key))
    })
```

- **One interaction, one action.** `Dial` and `Press`, not `DialAndChooseAnOption`. Several actions that achieve
  a goal together are a task.
- **Name it after the action, in the vocabulary of the interface**: `Dial`, `Click`, `Send`, `Navigate`.
- **Accept `Answerable` parameters, and answer them here.** An interaction is where a value meets the client, so
  it's the place to call `actor.answer()`: a test can then pass a static value or a question about the system.
- **Describe it with the `the` tag**, so that the report shows what the actor did: "Alice presses "2"".
- **Use a class only for a fluent API**, like `Send.a(request)` in `@serenity-js/rest`. A function that returns
  `Interaction.where` covers everything else.

## Initialise and discard the resources the ability uses

An ability that opens a connection, or starts a process, implements `Initialisable`, `Discardable`, or both:

```typescript
import { Ability, Discardable, Initialisable } from '@serenity-js/core'

interface PhoneLine {
    connect(): Promise<void>
    disconnect(): Promise<void>
    isConnected(): boolean
    dial(phoneNumber: string): Promise<void>
}

export class MakePhoneCalls extends Ability implements Initialisable, Discardable {
    static using(line: PhoneLine): MakePhoneCalls {
        return new MakePhoneCalls(line)
    }

    constructor(private readonly line: PhoneLine) {
        super()
    }

    async initialise(): Promise<void> {
        await this.line.connect()
    }

    isInitialised(): boolean {
        return this.line.isConnected()
    }

    async discard(): Promise<void> {
        await this.line.disconnect()
    }

    dial(phoneNumber: string): Promise<void> {
        return this.line.dial(phoneNumber)
    }
}
```

- **The actor calls `initialise()` in `attemptsTo`**, whenever `isInitialised()` returns `false`, so the
  resource is ready before the first interaction. If it fails, the scenario is reported as compromised:
  "Alice couldn't initialise the ability to MakePhoneCalls".
- **The actor calls `discard()` when it's dismissed**: when the scenario finishes, or, for an actor that was
  created outside any scenario, when the test run finishes.

## Make implementations interchangeable

An actor stores each ability by its most general type: the first class in its hierarchy that extends `Ability`.
So an abstract ability can define what interactions use, and subclasses can implement it with different clients:

```typescript
import { Ability } from '@serenity-js/core'

export abstract class MakePhoneCalls extends Ability {
    abstract dial(phoneNumber: string): Promise<void>
}

export class MakePhoneCallsOverSip extends MakePhoneCalls {
    async dial(phoneNumber: string): Promise<void> {
        // dial the number with a SIP client
    }
}
```

`MakePhoneCalls.as(actor)` then returns whichever implementation the actor was given, and the interactions and
tests work with either. That's how `BrowseTheWeb` works with both `BrowseTheWebWithPlaywright` and
`BrowseTheWebWithWebdriverIO`.

## Avoid

- **Using the client in a test**, through a getter on the ability. Tests that use interactions and questions keep
  working when the client changes. Reach for the client only for an API no interaction offers, and accept that
  the test now depends on it
- **Interactions that perform other activities.** Composing activities is what tasks are for
- **Retrieving information in an interaction.** Information is what questions are for; the
  serenity-js-writing-questions skill covers those
