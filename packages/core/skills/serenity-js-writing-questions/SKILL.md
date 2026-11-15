---
name: serenity-js-writing-questions
description: "Writing Screenplay Pattern questions with Serenity/JS: retrieving information with Question.about, using the actor's abilities, naming and grouping questions, transforming answers through QuestionAdapter, composing questions, questions about part of something with .of(), custom expectations with Expectation.define, and debugging a scenario with Log.the and StreamReporter. Use when a test or a task needs information about the system under test."
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

- **Name it after the information, as a noun**: `ConnectedNumber`, `Text`, `LastResponse`. Name a question with
  a yes-or-no answer `isX()`, as in `isConnected()`. Leave "the" out of the name, `ConnectedNumber`, not
  `TheConnectedNumber`. The description keeps it: "the connected number".
- **Write it as a function** that returns `Question.about`, so each use gets a fresh question.
- **Describe it for the report.** The description appears wherever the question is used, as in
  "Alice, the cardholder ensures that the connected number does equal "(555) 123-4567"".

Group the questions about the same thing under one object, together with the tasks about it, so that a test reads
`Line.connectedNumber()` and `Line.isConnected()`:

```typescript
import { Ability, Question } from '@serenity-js/core'

declare class MakePhoneCalls extends Ability {
    connectedNumber(): Promise<string>
    isConnected(): Promise<boolean>
}

export const Line = {
    connectedNumber: () =>
        Question.about('the connected number', actor =>
            MakePhoneCalls.as(actor).connectedNumber()
        ),

    isConnected: () =>
        Question.about('whether the line is connected', actor =>
            MakePhoneCalls.as(actor).isConnected()
        ),
}
```

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
  does: into a constant, with `await`, rather than in a chain of `then` calls.

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
            Question.about('voicemails', async actor => {
                const phoneLine = await actor.answer(line)
                return MakePhoneCalls.as(actor).voicemails(phoneLine)
            }),
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

## Debug a scenario with `Log.the` and `StreamReporter`

To find out what a question answers while a scenario runs, have the actor log it with `Log.the`, where you need
the value:

```typescript
import { actorCalled, Log, QuestionAdapter } from '@serenity-js/core'

// your project's actor names, as the serenity-js-writing-tasks skill describes them
declare enum Role { Cardholder = 'Alice, the cardholder' }

declare const ConnectedNumber: () => QuestionAdapter<string>

await actorCalled(Role.Cardholder).attemptsTo(
    Log.the(ConnectedNumber()),
)
```

Use `Log.the`, not `console.log`, so that the value reaches every reporter, next to the activity it belongs to.

Then run the scenario with a `StreamReporter` in the crew, which writes every event of the run to a file, one JSON
object per line:

```typescript
import { configure, StreamReporter } from '@serenity-js/core'
import * as fs from 'fs'

configure({
    crew: [
        new StreamReporter(fs.createWriteStream('target/events.ndjson')),
    ],
})
```

In a test runner's configuration, the same crew member is
`[ '@serenity-js/core:StreamReporter', { outputFile: 'target/events.ndjson' } ]`. Where the crew is configured
depends on the test runner; the skill of your runner's Serenity/JS package says where. Create the directory first:
`StreamReporter` doesn't, and without it writes nothing, and says nothing about it.

Each line has the event's `type` and the `event` itself. Three kinds tell you what happened. These are from a
scenario that sends a request, logs the response's body and checks it, with the paths and the stack trace
shortened:

```json
{"type":"InteractionFinished","event":{"activityId":"ije3ta43nf9ccrjd6lz0kwyc","details":{"name":"Alice, the analyst sends a GET request to '/v4'","location":{"column":18,"line":11,"path":"spec/log_demo.spec.ts"}},"outcome":{"code":64},"sceneId":"bjzm19csteojlk9biivtmlev","timestamp":"2026-11-15T22:52:17.604Z"}}
{"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"tl2nenv72s9dkl223cdk0ji8","artifact":{"type":"LogEntry","base64EncodedValue":"eyJkYXRhIjoiNCJ9"},"name":"the body of the last response","sceneId":"bjzm19csteojlk9biivtmlev","timestamp":"2026-11-15T22:52:17.605Z"}}
{"type":"InteractionFinished","event":{"activityId":"o3nkqj7iajlvlaabe4cott79","details":{"name":"Alice, the analyst ensures that the body of the last response does equal 5","location":{"column":20,"line":13,"path":"spec/log_demo.spec.ts"}},"outcome":{"code":4,"error":"{\"message\":\"Expected the body of the last response to equal 5\\n\\nExpectation: equals(5)\\n\\nExpected number: 5\\nReceived number: 4…\",\"name\":\"AssertionError\",\"stack\":\"AssertionError: …\"}"},"sceneId":"bjzm19csteojlk9biivtmlev","timestamp":"2026-11-15T22:52:17.605Z"}}
```

- **`InteractionFinished`**, and `TaskFinished` for a task, says how each activity ended. `outcome.code` 64 is
  success, 4 a failed assertion, 2 an error, and 1 a compromised scenario; a failure's `outcome.error` holds the
  error, serialised, with its message and stack.
- **`ActivityRelatedArtifactGenerated` with an artifact of type `LogEntry`** is what `Log.the` produced. Its `name`
  is the description of what was logged, and its `base64EncodedValue` decodes to the value, here `{"data":"4"}`.
- **`activityId`** ties an artifact to the activity that produced it, and **`sceneId`** both to the scenario.

Debugging like this is temporary. Before you finish, remove the `StreamReporter` and the `Log.the` calls you added,
so that the project's configuration is as it was.

## Avoid

- **Side effects in a question**, such as dialling a number to find out whether the line is free. A question can
  be answered any number of times, including by a wait that polls it
- **Calling `actor.answer()` in a test** to compare the answer yourself. `Ensure.that` and `Wait.until` report
  what was compared, and `Wait.until` keeps asking until the answer meets the expectation
- **A new question for what the adapter already offers**, like a `NumberOfCalls` question that counts the call
  history, when `CallHistory().length` does
- **Descriptions that repeat the code.** "the area code" says what a test checks better than
  "the connected number.slice(1, 4).as(Number)"
