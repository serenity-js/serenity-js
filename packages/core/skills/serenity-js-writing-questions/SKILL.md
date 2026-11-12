---
name: serenity-js-writing-questions
description: "Writing Screenplay Pattern questions with Serenity/JS: retrieving information with Question.about, using the actor's abilities, transforming answers through QuestionAdapter, composing questions, questions about part of something with .of(), and custom expectations with Expectation.define. Use when a test or a task needs information about the system under test."
---

# Writing Screenplay questions

A question is how an actor finds out about the system under test: the number a phone is connected to, the text of
an element, the status of the last response. Tests use questions in assertions and waits, and pass them to
interactions and tasks, which answer them at the moment they need the value.

Asking a question never changes the system. Changes are what interactions are for.

## Write a question with `Question.about`

`Question.about` takes a description and a function that finds out the answer, usually with one of the actor's
abilities:

```typescript
import { Ability, Question } from '@serenity-js/core'

// an ability your project already has; the serenity-js-writing-interactions-and-abilities skill covers those
declare class MakePhoneCalls extends Ability {
    connectedNumber(): Promise<string>
}

export const ConnectedNumber = () =>
    Question.about('the connected number', actor =>
        MakePhoneCalls.as(actor).connectedNumber()
    )
```

- **Name it after the information**, as a noun: `ConnectedNumber`, `Text`, `LastResponse`.
- **Write it as a function** that returns `Question.about`, so each use gets a fresh question.
- **Describe it for the report.** The description appears wherever the question is used, as in
  "Alice ensures that the connected number does equal "(555) 123-4567"".

## Transform answers instead of writing new questions

`Question.about` returns a `QuestionAdapter`. It's a question, and it gives you the fields and methods of its
answer as questions too, each of which accepts questions as parameters:

```typescript
import { Question, QuestionAdapter } from '@serenity-js/core'

interface Call {
    phoneNumber: string
    durationInSeconds: number
}

declare const CallHistory: () => QuestionAdapter<Call[]>

const numberOfCalls = () =>
    CallHistory().length
        .describedAs('the number of calls')

const areaCode = (phoneNumber: QuestionAdapter<string>) =>
    phoneNumber
        .slice(1, 4)
        .as(Number)
        .describedAs('the area code')

const longestCall = () =>
    Question.about('the longest call', async actor => {
        const calls = await actor.answer(CallHistory())
        return Math.max(...calls.map(call => call.durationInSeconds))
    })
```

- **Use the adapter's fields and methods** for what the answer's type already offers: `length`, `slice`, `trim`,
  `replace`, `toLowerCase`.
- **Use `.as()` to map an answer**, with a function, or with a constructor such as `Number`.
- **Use `.describedAs()`** to give the result a description that says what it means.
- **Answer other questions inside `Question.about`** for anything the adapter doesn't cover, as `longestCall`
  does.

## Ask about part of something with `.of()`

A question that's about part of something takes a third argument: a function that, given the whole, returns the
question about the part. The result is a meta-question, which `.of()` scopes to the whole:

```typescript
import { Ability, Answerable, Question } from '@serenity-js/core'

declare class MakePhoneCalls extends Ability {
    voicemails(line?: string): Promise<string[]>
}

export const Voicemails = () =>
    Question.about('voicemails',
        actor => MakePhoneCalls.as(actor).voicemails(),
        (line: Answerable<string>) =>
            Question.about('voicemails', async actor =>
                MakePhoneCalls.as(actor).voicemails(await actor.answer(line))
            ),
    )

Voicemails().of('the work line')    // described as: voicemails of "the work line"
```

That's how `Text.of(element)` works in `@serenity-js/web`, and how one element is located inside another.

## Define an expectation for a comparison that's missing

Assertions, waits and checks compare a question's answer against an expectation, usually one from
`@serenity-js/assertions`, such as `equals` or `includes`. Define your own with `Expectation.define` when the
comparison is part of your domain:

```typescript
import { Expectation } from '@serenity-js/core'

export const isAPremiumRateNumber = Expectation.define(
    'isAPremiumRateNumber',         // the function's name, used in assertion errors
    'be a premium rate number',     // the relationship, used in the report
    (actual: string) => actual.startsWith('0900'),
)
```

`Ensure.that(ConnectedNumber(), isAPremiumRateNumber())` in a test, or
`Wait.until(ConnectedNumber(), isAPremiumRateNumber())` in a task, then describe the comparison in the report.

## Avoid

- **Side effects in a question**, such as dialling a number to find out whether the line is free. A question can
  be answered any number of times, including by a wait that polls it
- **Calling `actor.answer()` in a test** to compare the answer yourself. `Ensure.that` and `Wait.until` report
  what was compared, and `Wait.until` keeps asking until the answer meets the expectation
- **A new question for what the adapter already offers**, like a `NumberOfCalls` question that counts the call
  history, when `CallHistory().length` does
- **Descriptions that repeat the code.** "the area code" says what a test checks better than
  "the connected number.slice(1, 4).as(Number)"
