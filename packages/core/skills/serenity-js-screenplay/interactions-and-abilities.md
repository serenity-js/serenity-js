# Writing Screenplay interactions and abilities

An interaction is one thing an actor does with the system under test: dial a number, click a button, send a
request. An ability is what enables it. It wraps the client of one of the system's interfaces, such as a browser, an
HTTP client or a phone, and gives the actor's interactions and questions access to it.

Tests rarely use either directly. They use tasks, which compose interactions into goals in the business domain;
[tasks.md](tasks.md) covers those.

## Check whether you need a new ability

The Serenity/JS integrations give actors abilities for the most common interfaces: `BrowseTheWeb` in
`@serenity-js/web`, with `@serenity-js/playwright` or `@serenity-js/webdriverio`, `CallAnApi` in
`@serenity-js/rest`, and `TakeNotes` in `@serenity-js/core`, for data the actor remembers. Write your interactions
on top of those.

Write an ability only for an interface no integration covers, such as a phone line, a message queue or a database.

**Use the system under test through the interfaces it offers**, as its users and the systems around it do: its web
pages, its HTTP API, its phone lines, the files it reads and writes. Test code doesn't change the system to suit
itself: it doesn't import the system's modules, expose their internals, or add client code to the system. The client
is the test's own, and the ability wraps it:

```typescript
import { Ability, actorCalled } from '@serenity-js/core'

// your project's actor names, as SKILL.md describes them
declare enum Role { Cardholder = 'Alice, the cardholder' }

// a client of the interface the system offers its callers, its phone lines, at the address the test environment gives
interface PhoneLine {
    dial(phoneNumber: string): Promise<void>
}
declare function connectTo(address: string): PhoneLine

export class MakePhoneCalls extends Ability {
    static at(address: string): MakePhoneCalls {
        return new MakePhoneCalls(connectTo(address))
    }

    constructor(private readonly line: PhoneLine) {
        super()
    }

    dial(phoneNumber: string): Promise<void> {
        return this.line.dial(phoneNumber)
    }
}

actorCalled(Role.Cardholder).whoCan(MakePhoneCalls.at(process.env.EXCHANGE_ADDRESS ?? 'sip:exchange.test'))
```

When the system has no interface for what a test needs, that's a question for its developers, not a change for the
test to make.

## Wrap the client in an ability

Extend `Ability`, take the client in a static `using` method, and give the ability methods named after what the
interface does:

```typescript
import { Ability, actorCalled } from '@serenity-js/core'

// your project's actor names, as SKILL.md describes them
declare enum Role { Cardholder = 'Alice, the cardholder' }

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

actorCalled(Role.Cardholder).whoCan(MakePhoneCalls.using(phone))
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
        const pressed = await actor.answer(key)
        await MakePhoneCalls.as(actor).press(pressed)
    })
```

- **One interaction, one action, through one ability.** `Dial` and `Press`, not `DialAndChooseAnOption`. Several
  actions that achieve a goal together are a task.
- **Use the interactions the Serenity/JS modules provide** before writing your own, such as `Click` from
  `@serenity-js/web` or `Send` from `@serenity-js/rest`.
- **Name it after the action, in the vocabulary of the interface**: `Dial`, `Click`, `Send`, `Navigate`.
- **Accept `Answerable` parameters, and answer them here.** An interaction is where a value meets the client, so
  it's the place to call `actor.answer()`: a test can then pass a static value or a question about the system.
  Answer each parameter into a constant of its own, `const number = await actor.answer(phoneNumber)`, with
  `async` and `await` rather than a chain of `then` calls, so that each step reads in the order it happens.
- **Describe it with the `the` tag**, so that the report shows what the actor did: "Alice, the cardholder presses "2"".
- **Use a class only for a fluent API**, like `Send.a(request)` in `@serenity-js/rest`. A function that returns
  `Interaction.where` covers everything else.

An interaction may take two closely related steps, even through more than one ability, when they're one action
from the actor's point of view. Saving a file means checking that its directory is writable, then writing it:

```typescript
import { Ability, Answerable, Interaction, the } from '@serenity-js/core'

declare class UseFileSystem extends Ability {
    isWritable(directory: string): Promise<boolean>
    writeFile(directory: string, name: string, contents: string): Promise<void>
}

export const SaveAFile = (directory: Answerable<string>, name: Answerable<string>, contents: Answerable<string>) =>
    Interaction.where(the`#actor saves ${ name } in ${ directory }`, async actor => {
        const path = await actor.answer(directory)
        const fileName = await actor.answer(name)
        const text = await actor.answer(contents)
        const fileSystem = UseFileSystem.as(actor)

        if (! await fileSystem.isWritable(path)) {
            throw new Error(`${ path } isn't writable`)
        }

        await fileSystem.writeFile(path, fileName, text)
    })
```

If the steps make sense apart, so that a test might take one without the other, they're two interactions, composed
in a task.

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
  "Alice, the cardholder couldn't initialise the ability to MakePhoneCalls".
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
- **Changing the system under test to suit the test**, by importing its modules, exposing its internals, or adding
  client code to it. Reach it through its interfaces, with a client of the test's own
- **Interactions that perform other activities.** Composing activities is what tasks are for
- **Retrieving information in an interaction.** Information is what questions are for;
  [questions.md](questions.md) covers those
