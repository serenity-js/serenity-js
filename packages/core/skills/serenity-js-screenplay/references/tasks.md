# Writing Screenplay tasks

A task is something an actor does to achieve a goal in the business domain: call the bank, report a lost card,
place an order. It's made of other activities, either interactions with the system or other tasks, and it's how a
test speaks the language of the domain rather than of the user interface.

## Write a task as a function that returns `Task.where`

Name the function after the goal, and list the activities that achieve it:

```typescript
import { Activity, Answerable, Task, the } from '@serenity-js/core'

// the interactions from SKILL.md
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const Press: (key: Answerable<string>) => Activity

export const CallBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
    )

export const ReportALostCard = () =>
    Task.where(the`#actor reports a lost card`,
        CallBank(),
        Press('2'),
    )
```

An actor performs it like any other activity:

```typescript
import { actorCalled, Task } from '@serenity-js/core'

// the actors' names, from SKILL.md
declare enum Role { Cardholder = 'Alice, the cardholder' }

// the task above
declare const ReportALostCard: () => Task

await actorCalled(Role.Cardholder).attemptsTo(
    ReportALostCard(),
)
```

- **Name it after the goal, not the steps.** `ReportALostCard`, `PlaceOrder`, `SubmitClaim`, not
  `DialAndPressTwo`. Leave "the" out of the name, `CallBank`, not `CallTheBank`. The description keeps it, so
  that it reads as a sentence: "Alice, the cardholder calls the bank".
- **One task, one goal.** If the description needs an "and", it's probably two tasks.
- **Compose, don't repeat.** A task is built from existing interactions and tasks. If two tasks share steps,
  extract those steps into a task of their own and use it in both, as `CallBank` is.
- **Prefer functions to classes.** Don't extend `Task`: `Task.where` gives you the reporting, the description and the
  composition for free.

## Describe it with `the`

The description appears in the test report, so it should read as a sentence about what the actor does.
`#actor` becomes the actor's name, and every interpolated value is described in the report as the actor sees it:

```typescript
import { Activity, actorCalled, Answerable, Task, the } from '@serenity-js/core'

// the actors' names, from SKILL.md
declare enum Role { Cardholder = 'Alice, the cardholder' }

declare const Dial: (phoneNumber: Answerable<string>) => Activity

const CallBank = (phoneNumber: Answerable<string>) =>
    Task.where(the`#actor calls the bank on ${ phoneNumber }`,
        Dial(phoneNumber),
    )

await actorCalled(Role.Cardholder).attemptsTo(
    CallBank('0800 123 456'),     // reported as: Alice, the cardholder calls the bank on "0800 123 456"
)
```

Use the `the` tag rather than a plain template string. It formats each value for the report, quoting strings, for
example, and describes questions in the context of the actor performing the task, so the description is correct
even when a parameter is only known at that point.

## Accept `Answerable` parameters

Type every parameter of a task, an interaction or a question as `Answerable<T>` rather than `T`. A caller can then
pass a question about the system, such as a value the actor noted earlier, or a page element located with PEQL, as
easily as a static value, and combine it with other questions:

```typescript
import { Activity, Answerable, Masked, notes, Task, the } from '@serenity-js/core'

declare const Press: (key: Answerable<string>) => Activity

const EnterCardNumber = (cardNumber: Answerable<string>) =>
    Task.where(the`#actor enters card number ${ cardNumber }`,
        Press(cardNumber),
        Press('#'),
    )

export const EnterCardNumberOnRecord = () =>
    EnterCardNumber(Masked.valueOf(notes<{ cardNumber: string }>().get('cardNumber')))
    // reported as: Alice, the cardholder enters card number [a masked value]
```

Answer each parameter where its value is used, in the interaction or the question that needs it, into a constant of
its own: `const number = await actor.answer(phoneNumber)`, as `Dial` does in "Where tasks fit". A task built with
`Task.where` doesn't use the values itself, so it passes its parameters on to the activities that do, and they
answer them when the actor performs them. Wrap a value the report shouldn't show in `Masked.valueOf`.

**Never put an `Answerable` in an array or an object literal you pass on as data**, as in `{ to: phoneNumber, text }`.
`actor.answer()` answers a question or a promise only at the top level, so the activity gets the question itself,
not its answer. Wrap the data in `Question.fromObject`, which answers every property, arrays of them included, or in
`Question.fromArray` for a list, or answer each parameter into a constant inside a `Question.about` that builds the
data:

```typescript
import { Ability, Answerable, Interaction, Question, Task, the } from '@serenity-js/core'

interface TextMessage {
    to: string
    text: string
}

// an ability that sends messages and starts conference calls, and interactions that answer the data they're given
declare class UsePhoneNetwork extends Ability {
    send(message: TextMessage): Promise<void>
    conference(phoneNumbers: string[]): Promise<void>
}

const Send = (message: Answerable<TextMessage>) =>
    Interaction.where(the`#actor sends ${ message }`, async actor => {
        const answered = await actor.answer(message)
        await UsePhoneNetwork.as(actor).send(answered)
    })

const StartConferenceCall = (phoneNumbers: Answerable<string[]>) =>
    Interaction.where(the`#actor starts a conference call with ${ phoneNumbers }`, async actor => {
        const numbers = await actor.answer(phoneNumbers)
        await UsePhoneNetwork.as(actor).conference(numbers)
    })

// Question.fromObject answers the text, wherever it comes from
export const TextBank = (text: Answerable<string>) =>
    Task.where(the`#actor texts the bank ${ text }`,
        Send(Question.fromObject<TextMessage>({ to: '0800 123 456', text })),
    )

// Question.fromArray answers each item of a list
export const CallBothBranches = (branch: Answerable<string>, otherBranch: Answerable<string>) =>
    Task.where(the`#actor calls ${ branch } and ${ otherBranch } together`,
        StartConferenceCall(Question.fromArray([ branch, otherBranch ])),
    )

// a Question.about answers each parameter into a constant of its own, and builds the data from them
export const MessageTo = (phoneNumber: Answerable<string>, text: Answerable<string>) =>
    Question.about<TextMessage>('the message', async actor => {
        const to = await actor.answer(phoneNumber)
        const answered = await actor.answer(text)
        return { to, text: answered }
    })
```

The rule covers the constructors of interaction objects too, such as `Helpline` in "Grow the structure as the project
needs it". They're often created from another question, as in `new Helpline(Customer.preferredNumber())`, or from a
page element, as the handbook's `TodoList` is, with an `Answerable<PageElement>`. Their methods answer the
constructor's parameters where they use them, as `Helpline`'s `isConnected` does.

## Repeat activities with `List.of(…).forEach`

To perform the same activities for each item of a list, give the list to `List.of`, and perform them in its
`forEach`, which gives you the actor and the current item:

```typescript
import { Activity, Answerable, List, Task, the } from '@serenity-js/core'

// the task above
declare const EnterCardNumber: (cardNumber: Answerable<string>) => Activity

export const ReportLostCards = (cardNumbers: Answerable<string[]>) =>
    Task.where(the`#actor reports lost cards ${ cardNumbers }`,
        List.of(cardNumbers).forEach(({ actor, item }) =>
            actor.attemptsTo(
                EnterCardNumber(item),
            )
        ),
    )
```

`forEach` answers the list when the actor performs the task, and performs the activities for one item after
another. Never loop with `Array.forEach` and an `async` callback: it doesn't wait for the callback's promises, so
the activities overlap, the task finishes before they do, and a failure in one of them is an unhandled rejection
rather than the scenario's failure.

## Leave a task pending until you can implement it

A task with no activities is reported as pending. It lets you write the scenario first, in the language of the
domain, and implement the steps later:

```typescript
import { actorCalled, Task, the } from '@serenity-js/core'

// the actors' names, from SKILL.md
declare enum Role { Cardholder = 'Alice, the cardholder' }

const DisputeACharge = () =>
    Task.where(the`#actor disputes a charge`)

await actorCalled(Role.Cardholder).attemptsTo(
    DisputeACharge(),
)
```

Pending tasks are visible in the report, so they double as a list of what's left to implement.

## Make a task wait for its own outcome

**A task waits for the outcome it causes, so that its callers don't have to.** A task that changes what the user
sees is only done once the change has happened. Put the wait inside the task, with `Wait.until`, or with
`Ensure.eventually` when the wait is also the task's check, so that a test can check the outcome straight
afterwards, without knowing how long the task takes:

```typescript
import { Activity, Answerable, Duration, Expectation, QuestionAdapter, Task, the, Wait } from '@serenity-js/core'

// the interaction and the question from SKILL.md, and an expectation from @serenity-js/assertions
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>
declare const equals: (expected: Answerable<string>) => Expectation<string>

export const CallBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
        Wait.upTo(Duration.ofSeconds(5)).until(ConnectedNumber(), equals('0800 123 456')),
    )
```

`Ensure.eventually`, from `@serenity-js/assertions`, keeps asking until the answer meets the expectation, like
`Wait.until`, and fails the task, with what it last saw, when the outcome doesn't arrive in time:

```typescript
import { Activity, Answerable, Expectation, QuestionAdapter, Task, the } from '@serenity-js/core'

declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>
declare const Ensure: { eventually: <T>(actual: Answerable<T>, expectation: Expectation<T>) => Activity }
declare const equals: (expected: Answerable<string>) => Expectation<string>

export const CallBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
        Ensure.eventually(ConnectedNumber(), equals('0800 123 456')),
    )
```

A scenario that waits for what a task caused, with a `Wait.until` or an `Ensure.eventually` after the task, makes
every caller of the task repeat the wait. Move the wait into the task.

Wait for an outcome that only this task produces: here, a connection to the number it dialled. A condition that
may already hold before the task starts, such as "a call is in progress", lets the wait finish straight away,
before the change has happened. Serenity/JS doesn't pause between activities, so a check straight after a task
that doesn't wait relies on timing.

The exception is a task that navigates to another page or view. It can't know when the destination is ready, so the
test waits for the destination instead.

Wait with `Wait.until`, never with `setTimeout` or a pause of a fixed length, such as `Wait.for`. A fixed pause
makes the scenario slow when the system is fast, and fail when it's slow. `Wait.until` asks its question every
500 milliseconds, for up to the `interactionTimeout` of the Serenity/JS configuration, which is 5 seconds by default.
Change either for one wait, with `Wait.upTo(…)` and `.pollingEvery(…)`:

```typescript
import { Activity, Answerable, Duration, Expectation, QuestionAdapter, Task, the, Wait } from '@serenity-js/core'

declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>
declare const equals: (expected: Answerable<string>) => Expectation<string>

export const CallHelpline = () =>
    Task.where(the`#actor calls the helpline`,
        Dial('0800 999 999'),
        Wait.upTo(Duration.ofSeconds(30))
            .until(ConnectedNumber(), equals('0800 999 999'))
            .pollingEvery(Duration.ofSeconds(1)),
    )
```

## Make a task check that it did what it should

A task may check its own work. A check inside a task is a valid design: it fails the task where the problem is,
rather than in a later step that only sees its effects.

When several fields of a response would be checked wherever a request is made, such as its status, its content type
and the absence of errors, don't repeat the checks. Define a custom expectation over the typed response with
`Expectation.define`, and use it in the task that makes the request:

```typescript
import { Activity, Answerable, Expectation, QuestionAdapter, Task, the } from '@serenity-js/core'

// what the phone line reports about the last call
interface CallRecord {
    connectedNumber: string
    error: string | null
}

// the interaction from SKILL.md, a question about the last call, and Ensure from @serenity-js/assertions
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const LastCall: () => QuestionAdapter<CallRecord>
declare const Ensure: { that: <T>(actual: Answerable<T>, expectation: Expectation<T>) => Activity }

// the checks every call would repeat, as one expectation
export const wentThrough = Expectation.define(
    'wentThrough',          // the function's name, used in assertion errors
    'go through',           // the relationship, used in the report
    (call: CallRecord) => call.error === null && call.connectedNumber !== '',
)

export const CallBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
        Ensure.that(LastCall(), wentThrough()),
    )
```

Keep the two levels of checks apart:

- **The scenario checks the outcome of the workflow, at the business level**: the card is blocked, not the status of
  the request that blocked it.
- **Transport checks belong in the task that makes the request**, or in a custom expectation: the status, the
  content type, the absence of errors.
- **Don't mix the two in one task or expectation.** A task that takes the expected value, such as "calls the bank
  and expects to reach the lost cards department", hides the scenario's check inside one of its steps.

```typescript
import { Activity, actorCalled, Answerable, Expectation, QuestionAdapter } from '@serenity-js/core'

// the actors' names from SKILL.md, a task that checks its calls went through, a question about the card,
// and Ensure and equals from @serenity-js/assertions
declare enum Role { Cardholder = 'Alice, the cardholder' }
declare const ReportALostCard: () => Activity
declare const CardStatus: () => QuestionAdapter<string>
declare const Ensure: { that: <T>(actual: Answerable<T>, expectation: Expectation<T>) => Activity }
declare const equals: (expected: Answerable<string>) => Expectation<string>

await actorCalled(Role.Cardholder).attemptsTo(
    ReportALostCard(),
    Ensure.that(CardStatus(), equals('blocked')),
)
```

## Grow the structure as the project needs it

Where tasks and questions live, and how they're grouped, follows from how much of the system the tests cover:

- **Follow the project's conventions**, even where you'd have started differently: its file layout, its naming
  style, and where it configures its actors.
- **Don't introduce a second way of doing what the project already does.** Two styles side by side make the code
  harder to read than either would on its own. Either follow the project's convention and suggest the new one in
  your report, or apply the new one consistently, across the project, and say so in your report. If the project
  names its actors with plain strings, such as `'Apisitt'`, either keep calling `actorCalled('Apisitt')`, or extract
  a shared `Role` enum, in `src/Role.ts` for example, and use it in every spec. Never a `Role` enum in one spec next
  to plain names in the others.
- **Don't copy its poor abstractions.** A task named after its mechanics, or one that mixes business steps with
  key presses, isn't a convention to follow. Write yours from the domain, and improve the ones your change touches:

```typescript
import { Activity, Answerable, Task, the } from '@serenity-js/core'

// the tasks above, and an interaction from SKILL.md
declare const CallBank: () => Activity
declare const Press: (key: Answerable<string>) => Activity

// what the project has: a task named after the keys it presses
export const DialAndPressTwo = () =>
    Task.where(the`#actor dials and presses 2`,
        CallBank(),
        Press('2'),
    )

// what your change needs: named from the domain, rather than DialAndPressThree
export const ReportAStolenCard = () =>
    Task.where(the`#actor reports a stolen card`,
        CallBank(),
        Press('3'),
    )
```

- **With nothing to follow, start with the simplest structure that fits**: tasks and questions as standalone
  functions, as in this skill.
- **An activity or a question may start in the spec that needs it**, while no other spec uses it, or as a first
  pass while you refactor one spec. Once it works, or another spec needs it, move it to `src/`, next to the code
  it's related to, and import it from there:

```typescript
import { Activity, actorCalled, Answerable, Task, the } from '@serenity-js/core'

// the actors' names and the interactions from SKILL.md, and Mocha's it
declare enum Role { Cardholder = 'Alice, the cardholder' }
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const Press: (key: Answerable<string>) => Activity
declare const it: (title: string, scenario: () => Promise<void>) => void

// in spec/lost_cards.spec.ts, while no other spec reports a lost card; once spec/stolen_cards.spec.ts needs it too,
// it moves to src/cards/ReportALostCard.ts, and both specs import it
const ReportALostCard = () =>
    Task.where(the`#actor reports a lost card`,
        Dial('0800 123 456'),
        Press('2'),
    )

it('blocks a card reported lost', () =>
    actorCalled(Role.Cardholder).attemptsTo(
        ReportALostCard(),
    ))
```

- **Until anything is reused, standalone questions are fine.** Group questions under one object when different
  tasks or specs need different parts of the same thing, as [questions.md](questions.md) does with
  `Line.connectedNumber()` and `Line.isConnected()`. When several places would repeat the same combined check, define
  a custom expectation instead, as `wentThrough` does in "Make a task check that it did what it should".
- **Use an interaction object once something has state and behaviour that more than one scenario uses**: a class
  whose fields hold the state, and whose methods return the tasks and questions about it. Any object that groups
  tasks and questions is an interaction object, so name it like one: a noun for the object, `Helpline`, verbs for
  its tasks, `call()` and `chooseOption()`, and nouns for its questions, `connectedNumber()`, or `isX()` for a
  yes-or-no answer:

```typescript
import { Activity, actorCalled, Answerable, Question, QuestionAdapter, Task, the } from '@serenity-js/core'

// the actors' names, from SKILL.md
declare enum Role { Cardholder = 'Alice, the cardholder' }

// the interactions and the question from SKILL.md
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const Press: (key: Answerable<string>) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>

export class Helpline {
    constructor(private readonly phoneNumber: Answerable<string>) {
    }

    call = () =>
        Task.where(the`#actor calls the helpline on ${ this.phoneNumber }`,
            Dial(this.phoneNumber),
        )

    chooseOption = (option: Answerable<string>) =>
        Task.where(the`#actor chooses option ${ option }`,
            Press(option),
        )

    connectedNumber = () =>
        ConnectedNumber()
            .describedAs('the number the helpline connected to')

    isConnected = () =>
        Question.about('whether the helpline is connected', async actor => {
            const connectedNumber = await actor.answer(ConnectedNumber())
            const helplineNumber = await actor.answer(this.phoneNumber)
            return connectedNumber === helplineNumber
        })
}

const bank = new Helpline('0800 123 456')

await actorCalled(Role.Cardholder).attemptsTo(
    bank.call(),
    bank.chooseOption('2'),
)
```

Restructure, and improve abstractions, only in the code your change touches, unless you're applying a new convention
across the project, as above. When the rest of the project would be easier to work with in another structure, or
with better abstractions, suggest it in your report, rather than changing code the change doesn't need.

## Refactor what's there

Tests that grew without the Screenplay Pattern, or with too little of it, show the same signs. Look for these, and
refactor each to what replaces it:

- **A scenario that's a long list of built-in interactions** becomes tasks named for the business steps they
  achieve.
- **A task that's a long list of low-level interactions** becomes smaller tasks, each at one level of abstraction,
  composed into the larger one.
- **Tasks named after their mechanics**, such as `PostThenGet`, get names from the domain, such as
  `SubmitCalculation`.
- **The same request built, or the same value read, in several places** becomes a function that builds or reads
  it, or a group of them under one object, as [questions.md](questions.md) does with `Line`.
- **A scenario that waits for what an earlier step caused** gets the wait moved into the task that caused it.
- **`setTimeout`, `console.log`, or `Array.forEach` with an `async` callback** become `Wait.until`, `Log.the`, and
  `List.of(…).forEach`.

Here's a task that has most of these signs:

```typescript
import { Activity, Answerable, Interaction, Task, the } from '@serenity-js/core'

// the interactions from SKILL.md
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const Press: (key: Answerable<string>) => Activity

export const DialThenPressKeys = (cardNumber: Answerable<string>) =>
    Task.where(the`#actor dials and presses keys`,
        Dial('0800 123 456'),
        Interaction.where(the`#actor waits`, () => new Promise<void>(resolve => setTimeout(resolve, 2000))),
        Press('2'),
        Press(cardNumber),
        Press('#'),
    )
```

And here it is refactored: named from the domain, made of tasks at one level of abstraction, and waiting for the
bank to answer rather than for two seconds:

```typescript
import { Activity, Answerable, Expectation, QuestionAdapter, Task, the, Wait } from '@serenity-js/core'

// the interactions and the question from SKILL.md, and an expectation from @serenity-js/assertions
declare const Dial: (phoneNumber: Answerable<string>) => Activity
declare const Press: (key: Answerable<string>) => Activity
declare const ConnectedNumber: () => QuestionAdapter<string>
declare const equals: (expected: Answerable<string>) => Expectation<string>

const CallBank = () =>
    Task.where(the`#actor calls the bank`,
        Dial('0800 123 456'),
        Wait.until(ConnectedNumber(), equals('0800 123 456')),
    )

const ChooseToReportALostCard = () =>
    Task.where(the`#actor chooses to report a lost card`,
        Press('2'),
    )

const EnterCardNumber = (cardNumber: Answerable<string>) =>
    Task.where(the`#actor enters card number ${ cardNumber }`,
        Press(cardNumber),
        Press('#'),
    )

export const ReportALostCard = (cardNumber: Answerable<string>) =>
    Task.where(the`#actor reports a lost card`,
        CallBank(),
        ChooseToReportALostCard(),
        EnterCardNumber(cardNumber),
    )
```

Refactor in small steps, with the scenarios to tell you when a step went wrong:

- **Run the scenarios first, and see them pass.** A refactoring that starts from a failing scenario can't tell you
  whether it broke anything.
- **Change one thing at a time**, and run the scenarios again after each step.
- **Keep what the scenarios verify the same.** Activity descriptions appear in the reports, so treat a changed
  description as a deliberate rename, as "dials and presses keys" becoming "reports a lost card" is.
- **Apply a new convention everywhere, or not at all.** Refactoring one spec to a shared `Role` enum, while the
  others still name their actors with plain strings, leaves the project with two ways of doing one thing. Either
  move every spec to the new convention, and say so in your report, or keep the project's, and suggest the new one.
- **When you were asked for something else, refactor only what your change touches**, and suggest the rest in your
  report.

## Avoid

- **Extending `Task`** with a class and a `performAs` method, when `Task.where` composes the same activities
- **Logic in a task's body**, such as `if` statements that depend on the system's state. Use `Check.whether(…).andIfSo(…)`
  from `@serenity-js/core`, which reports the decision too
- **Repeating the steps of an existing task** in another one, instead of reusing it
- **Descriptions without `#actor`**, which read as instructions rather than as what happened
- **Waiting in the scenario for an outcome a task caused.** The task waits for it, so its callers don't have to
