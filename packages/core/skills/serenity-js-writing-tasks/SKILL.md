---
name: serenity-js-writing-tasks
description: "Writing Screenplay Pattern tasks with Serenity/JS: composing activities into business-level tasks with Task.where, describing them with the, passing parameters, pending tasks, and tasks that wait for their own outcome. Use when adding or changing a task, or a test step that does more than one thing."
---

# Writing Screenplay tasks

A task is something an actor does to achieve a goal in the business domain: sign in, place an order, submit a
claim. It's made of other activities, either interactions with the system or other tasks, and it's how a test
speaks the language of the domain rather than of the user interface.

## Write a task as a function that returns `Task.where`

Name the function after the goal, and list the activities that achieve it:

```typescript
import { Activity, Task, the } from '@serenity-js/core'

// activities your project already has, e.g. built from the interactions of a web integration
declare const EnterCredentials: (username: string) => Activity
declare const SubmitTheSignInForm: () => Activity

export const SignIn = (username: string) =>
    Task.where(the`#actor signs in as ${ username }`,
        EnterCredentials(username),
        SubmitTheSignInForm(),
    )
```

An actor performs it like any other activity:

```typescript
import { actorCalled, Task } from '@serenity-js/core'

// the task above
declare const SignIn: (username: string) => Task

await actorCalled('Alice').attemptsTo(
    SignIn('alice@example.org'),
)
```

- **Name it after the goal, not the steps.** `SignIn`, `PlaceOrder`, `SubmitClaim`, not `ClickTheLoginButton`.
- **One task, one goal.** If the description needs an "and", it's probably two tasks.
- **Compose, don't repeat.** A task is built from existing interactions and tasks. If two tasks share steps,
  extract those steps into a task of their own and use it in both.
- **Prefer functions to classes.** Don't extend `Task`: `Task.where` gives you the reporting, the description and the
  composition for free.

## Describe it with `the`

The description appears in the test report, so it should read as a sentence about what the actor does.
`#actor` becomes the actor's name, and every interpolated value is described in the report as the actor sees it:

```typescript
import { Activity, Answerable, Task, the } from '@serenity-js/core'

declare const ChooseQuantity: (quantity: Answerable<number>) => Activity
declare const PutInBasket: (product: Answerable<string>) => Activity

export const AddToBasket = (quantity: Answerable<number>, product: Answerable<string>) =>
    Task.where(the`#actor adds ${ quantity } of ${ product } to the basket`,
        ChooseQuantity(quantity),
        PutInBasket(product),
    )
```

Use the `the` tag rather than a plain template string. It formats each value for the report, quoting strings, for
example, and describes questions in the context of the actor performing the task, so the description is correct
even when a parameter is only known at that point:

```typescript
import { Activity, actorCalled, Task, the } from '@serenity-js/core'

declare const EnterPhoneNumber: (phoneNumber: string) => Activity
declare const PressCall: () => Activity

const Dial = (phoneNumber: string) =>
    Task.where(the`#actor dials ${ phoneNumber }`,
        EnterPhoneNumber(phoneNumber),
        PressCall(),
    )

await actorCalled('Alice').attemptsTo(
    Dial('(555) 123-4567'),     // reported as: Alice dials "(555) 123-4567"
)
```

## Accept `Answerable` parameters

Type the parameters as `Answerable<T>` rather than `T`, so that a task accepts a static value or a question about
the system, for example a value the actor noted earlier:

```typescript
import { Activity, Answerable, notes, Task, the } from '@serenity-js/core'

declare const ChooseOrder: (orderNumber: Answerable<string>) => Activity
declare const ConfirmPayment: () => Activity

const PayFor = (orderNumber: Answerable<string>) =>
    Task.where(the`#actor pays for order ${ orderNumber }`,
        ChooseOrder(orderNumber),
        ConfirmPayment(),
    )

export const PayForTheLastOrder = () =>
    PayFor(notes<{ orderNumber: string }>().get('orderNumber'))
```

Don't call `actor.answer()` to get at a value inside a task. Pass the `Answerable` on to the activities that use it;
they answer it at the right moment.

## Leave a task pending until you can implement it

A task with no activities is reported as pending. It lets you write the scenario first, in the language of the
domain, and implement the steps later:

```typescript
import { actorCalled, Task, the } from '@serenity-js/core'

const ReviewTheOrder = () =>
    Task.where(the`#actor reviews the order`)

await actorCalled('Alice').attemptsTo(
    ReviewTheOrder(),
)
```

Pending tasks are visible in the report, so they double as a list of what's left to implement.

## Make a task wait for its own outcome

A task that changes what the user sees is only done once the change has happened. Put the wait in the task, so that
a test can check the outcome straight afterwards, without knowing how long the task takes:

```typescript
import { Activity, Duration, Expectation, QuestionAdapter, Task, the, Wait } from '@serenity-js/core'

// what your project already has: activities, a question about the system and an expectation
declare const ChooseQuantity: (quantity: number) => Activity
declare const PutInBasket: (product: string) => Activity
declare const quantityInBasketOf: (product: string) => QuestionAdapter<number>
declare const equals: (expected: number) => Expectation<number>

export const AddToBasket = (quantity: number, product: string) =>
    Task.where(the`#actor adds ${ quantity } of ${ product } to the basket`,
        ChooseQuantity(quantity),
        PutInBasket(product),
        Wait.upTo(Duration.ofSeconds(5)).until(quantityInBasketOf(product), equals(quantity)),
    )
```

Wait for an outcome that only this task produces. Here, the task adds a product that isn't in the basket yet, so it
waits for that product's quantity. A condition that may already hold before the task starts, such as "the basket
isn't empty", lets the wait finish straight away, before the change has happened.

The question and the expectation usually come from the web integration and from `@serenity-js/assertions`, for
example an element's text and `equals`. The principle is the same: Serenity/JS
doesn't pause between activities, so a check straight after a task that doesn't wait relies on timing.

The exception is a task that navigates to another page or view. It can't know when the destination is ready, so the
test waits for the destination instead.

## Avoid

- **Extending `Task`** with a class and a `performAs` method, when `Task.where` composes the same activities
- **Logic in a task's body**, such as `if` statements that depend on the system's state. Use `Check.whether(…).andIfSo(…)`
  from `@serenity-js/core`, which reports the decision too
- **Repeating the steps of an existing task** in another one, instead of reusing it
- **Descriptions without `#actor`**, which read as instructions rather than as what happened
