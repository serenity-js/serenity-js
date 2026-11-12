---
name: serenity-js-writing-tasks
description: "Writing Screenplay Pattern tasks with Serenity/JS: composing activities into business-level tasks with Task.where, describing them with the, passing parameters, pending tasks, and tasks that wait for their own outcome. Use when adding or changing a task, or a test step that does more than one thing."
---

# Writing Screenplay tasks

A task is something an actor does to achieve a goal in the business domain: call the bank, report a lost card,
place an order. It's made of other activities, either interactions with the system or other tasks, and it's how a
test speaks the language of the domain rather than of the user interface.

## Where tasks fit

In the Screenplay Pattern, an actor uses **abilities** to perform **interactions** and to answer **questions**,
and **tasks** compose interactions and other tasks into goals:

```typescript
import { Ability, actorCalled, Answerable, Interaction, Question, Task, the } from '@serenity-js/core'

// an ability wraps the client of one of the system's interfaces, here a phone
interface Phone {
    dial(phoneNumber: string): Promise<void>
    press(key: string): Promise<void>
    connectedNumber(): Promise<string>
}
declare const phone: Phone

class MakePhoneCalls extends Ability {
    static using(phone: Phone): MakePhoneCalls {
        return new MakePhoneCalls(phone)
    }

    constructor(private readonly phone: Phone) {
        super()
    }

    dial(phoneNumber: string): Promise<void> { return this.phone.dial(phoneNumber) }
    press(key: string): Promise<void> { return this.phone.press(key) }
    connectedNumber(): Promise<string> { return this.phone.connectedNumber() }
}

// interactions do one thing with the system, using the ability
const Dial = (phoneNumber: Answerable<string>) =>
    Interaction.where(the`#actor dials ${ phoneNumber }`, async actor => {
        await MakePhoneCalls.as(actor).dial(await actor.answer(phoneNumber))
    })

const Press = (key: Answerable<string>) =>
    Interaction.where(the`#actor presses ${ key }`, async actor => {
        await MakePhoneCalls.as(actor).press(await actor.answer(key))
    })

// questions find out about the system, using the ability
const ConnectedNumber = () =>
    Question.about('the connected number', actor => MakePhoneCalls.as(actor).connectedNumber())

// tasks compose interactions and other tasks into a goal of the business domain
const ReportALostCard = () =>
    Task.where(the`#actor reports a lost card`,
        Dial('0800 123 456'),
        Press('2'),
    )

await actorCalled('Alice')
    .whoCan(MakePhoneCalls.using(phone))
    .attemptsTo(
        ReportALostCard(),
    )
```

Most projects get their abilities, and many interactions and questions, from the Serenity/JS integrations, such as
`BrowseTheWeb` and `Click` from `@serenity-js/web`. The serenity-js-writing-interactions-and-abilities skill covers
writing your own, and the serenity-js-writing-questions skill covers questions. The rest of this skill uses the
interactions and the question above.

## Write a task as a function that returns `Task.where`

Name the function after the goal, and list the activities that achieve it:

```typescript
import { Activity, Task, the } from '@serenity-js/core'

// the interactions from "Where tasks fit"
declare const Dial: (phoneNumber: string) => Activity
declare const Press: (key: string) => Activity

export const CallTheBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
    )

export const ReportALostCard = () =>
    Task.where(the`#actor reports a lost card`,
        CallTheBank(),
        Press('2'),
    )
```

An actor performs it like any other activity:

```typescript
import { actorCalled, Task } from '@serenity-js/core'

// the task above
declare const ReportALostCard: () => Task

await actorCalled('Alice').attemptsTo(
    ReportALostCard(),
)
```

- **Name it after the goal, not the steps.** `ReportALostCard`, `PlaceOrder`, `SubmitClaim`, not
  `DialAndPressTwo`.
- **One task, one goal.** If the description needs an "and", it's probably two tasks.
- **Compose, don't repeat.** A task is built from existing interactions and tasks. If two tasks share steps,
  extract those steps into a task of their own and use it in both, as `CallTheBank` is.
- **Prefer functions to classes.** Don't extend `Task`: `Task.where` gives you the reporting, the description and the
  composition for free.

## Describe it with `the`

The description appears in the test report, so it should read as a sentence about what the actor does.
`#actor` becomes the actor's name, and every interpolated value is described in the report as the actor sees it:

```typescript
import { Activity, actorCalled, Answerable, Task, the } from '@serenity-js/core'

declare const Dial: (phoneNumber: Answerable<string>) => Activity

const CallTheBank = (phoneNumber: Answerable<string>) =>
    Task.where(the`#actor calls the bank on ${ phoneNumber }`,
        Dial(phoneNumber),
    )

await actorCalled('Alice').attemptsTo(
    CallTheBank('0800 123 456'),     // reported as: Alice calls the bank on "0800 123 456"
)
```

Use the `the` tag rather than a plain template string. It formats each value for the report, quoting strings, for
example, and describes questions in the context of the actor performing the task, so the description is correct
even when a parameter is only known at that point.

## Accept `Answerable` parameters

Type the parameters as `Answerable<T>` rather than `T`, so that a task accepts a static value or a question about
the system, for example a value the actor noted earlier:

```typescript
import { Activity, Answerable, Masked, notes, Task, the } from '@serenity-js/core'

declare const Press: (key: Answerable<string>) => Activity

const EnterTheCardNumber = (cardNumber: Answerable<string>) =>
    Task.where(the`#actor enters card number ${ cardNumber }`,
        Press(cardNumber),
        Press('#'),
    )

export const EnterTheCardNumberOnRecord = () =>
    EnterTheCardNumber(Masked.valueOf(notes<{ cardNumber: string }>().get('cardNumber')))
    // reported as: Alice enters card number [a masked value]
```

Don't call `actor.answer()` to get at a value inside a task. Pass the `Answerable` on to the activities that use it;
they answer it at the right moment. Wrap a value the report shouldn't show in `Masked.valueOf`.

## Leave a task pending until you can implement it

A task with no activities is reported as pending. It lets you write the scenario first, in the language of the
domain, and implement the steps later:

```typescript
import { actorCalled, Task, the } from '@serenity-js/core'

const DisputeACharge = () =>
    Task.where(the`#actor disputes a charge`)

await actorCalled('Alice').attemptsTo(
    DisputeACharge(),
)
```

Pending tasks are visible in the report, so they double as a list of what's left to implement.

## Make a task wait for its own outcome

A task that changes what the user sees is only done once the change has happened. Put the wait in the task, so that
a test can check the outcome straight afterwards, without knowing how long the task takes:

```typescript
import { Activity, Duration, Expectation, QuestionAdapter, Task, the, Wait } from '@serenity-js/core'

// the interaction and the question from "Where tasks fit", and an expectation from @serenity-js/assertions
declare const Dial: (phoneNumber: string) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>
declare const equals: (expected: string) => Expectation<string>

export const CallTheBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
        Wait.upTo(Duration.ofSeconds(5)).until(ConnectedNumber(), equals('0800 123 456')),
    )
```

Wait for an outcome that only this task produces: here, a connection to the number it dialled. A condition that
may already hold before the task starts, such as "a call is in progress", lets the wait finish straight away,
before the change has happened. Serenity/JS doesn't pause between activities, so a check straight after a task
that doesn't wait relies on timing.

The exception is a task that navigates to another page or view. It can't know when the destination is ready, so the
test waits for the destination instead.

## Avoid

- **Extending `Task`** with a class and a `performAs` method, when `Task.where` composes the same activities
- **Logic in a task's body**, such as `if` statements that depend on the system's state. Use `Check.whether(…).andIfSo(…)`
  from `@serenity-js/core`, which reports the decision too
- **Repeating the steps of an existing task** in another one, instead of reusing it
- **Descriptions without `#actor`**, which read as instructions rather than as what happened
