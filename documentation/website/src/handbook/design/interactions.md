---
title: Interactions
layout: handbook.hbs
---
# Interactions

An "interaction" is one of the five building blocks of the [Screenplay Pattern](/handbook/design/screenplay-pattern.html);
a low-level activity, directly exercising the [actor's](/handbook/design/actors.html) [ability](/handbook/design/abilities.html)
 to interact with a specific external interface of the system under test or perform a [side-effect](https://en.wikipedia.org/wiki/Side_effect_&#40;computer_science&#41;). Such external interface could be a website, a mobile app, a web service, but also a file system, a database, or pretty much anything else a Node.js program can integrate with.

<figure>
![The Screenplay Pattern](/handbook/design/images/the-screenplay-pattern.png)
    <figcaption><span>The Screenplay Pattern</span></figcaption>
</figure>

## Implementing Interactions

Serenity/JS modules provide you with [dozens of interactions](/modules) you can use in your automated acceptance tests.
However, if you ever need to implement a custom interaction, there are two ways you can go about it.

For the sake of argument, let's say that we wanted to enable our actor to write arbitrary messages to an output stream,
such as a file or a computer terminal, and that we already have created a custom [ability](/handbook/design/abilities.html)
that took care of the low-level integration:

```typescript
import WriteStream = NodeJS.WriteStream;
import { Ability, UsesAbilities } from '@serenity-js/core';

export class WriteToStream implements Ability {
    static of(stream: WriteStream) {
        return new WriteToStream(stream);
    }

    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(WriteToStream);
    }

    constructor(private readonly stream: WriteStream) {
    }

    printLine(parts: string) {
        this.stream.write(message + '\n');
    }
}
```

With this simple "ability" in place, let's now look into the different ways we could implement an interaction exercising it.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    If you'd like the actor to print messages to your computer terminal,
    consider using the built-in [`Log`](/modules/core/class/src/screenplay/interactions/Log.ts~Log.html) interaction.
    </p></div>
</div>

### An `Interaction.where`...

The [`Interaction.where`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html#static-method-where)
[factory method](https://en.wikipedia.org/wiki/Factory_method_pattern) provides an easy pattern to define a custom interaction:

```typescript
import { Interaction } from '@serenity-js/core';

const GreetTheWorld = () =>
    Interaction.where(`#actor greets the world`, actor =>
        WriteToStream.as(actor).printLine(`Hello World!`)
    );
```

As you can see, there are only three things you need to define an interaction:
- the name of the function that will create the interaction, in this case `GreetTheWorld`,
- the description of the interaction - `#actor greets the world`, which will be used when [reporting](/handbook/reporting/)
the interaction,
- the interaction body - a function which takes an `actor` and uses their ability to `WriteToStream` to perform a call to an external system or perform a side effect, and returns a `void` or a `Promise<void>`.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The `#actor` part of the description will get replaced by the actor
    name when the interaction is reported.
    </p></div>
</div>

An interaction defined using the [`Interaction.where`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html#static-method-where)
factory method can be then given to an actor to perform:

```typescript
import { Actor } from '@serenity-js/core';

const actor = Actor.named('Ernest').whoCan(WriteToStream.of(process.stdout));

actor.attemptsTo(
    GreetTheWorld(),
);
```

### Extending `Interaction`

Another pattern you can follow when designing a custom interaction is extending the base `Interaction` class.

This is useful if the interaction you're designing requires helper methods to convert the data from one format to another,
or you'd like to [implement a builder pattern](/handbook/design/creational-patterns.html) to simplify how the interaction
is configured.

```typescript
import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';

class Greet extends Interaction {
    static all(...names: string[]) {
        return new Greet(names);
    }

    constructor(private readonly names: string[]) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return Promise.resolve(
            WriteToStream.as(actor).printLine(`Hello ${ this.join(this.names) }!`))
        );
    }

    toString(): string {
        return `#actor greets ${ this.join(this.names) }`;
    }

    private join(names: string[]) {
        return `${ names.slice(0, -1).join(', ') } and ${ a.slice(-1) }`;
    }
}
```

Similarly to the factory method approach, the inheritance approach requires you to specify:
- the name of the interaction - as the name of the class, here: `Greet`,
- the body of the interaction - as an implementation of the `performAs` method,
- the description of the interaction - as an implementation of the `toString` method.

However, the inheritance approach allows you to add helper methods, such as `join` in the example above.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    All Serenity/JS interactions **must** extend the base [`Interaction`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html)
    class to allow for the framework to correctly distinguish them from other activities, such as [tasks](/handbook/design/tasks.html).
    </p></div>
</div>

In the above example, the interaction to `Greet` could be given to an actor to perform as follows:

```typescript
import { Actor } from '@serenity-js/core';

const actor = Actor.named('Ernest').whoCan(WriteToStream.of(process.stdout));

actor.attemptsTo(
    Greet.all('Alice', 'Bob', 'Cindy'),
);
```

Performing this interaction will result in the actor printing `Hello Alice, Bob and Cindy!` to the output stream.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    Interactions extending the base `Interaction` class **have to** return a `Promise<void>`.<br />
    Interactions created using `Interaction.where` can return either `Promise<void>` or `void`.
    </p></div>
</div>


## Single Responsibility Principle

Serenity/JS interactions are named using the vocabulary of the [solution domain](https://blog.mattwynne.net/2013/01/17/the-problem-with-solutions/),
so: "Click on a button", "Enter password into a form field" or "Send a request", and are focused on [doing one thing and one thing only](https://en.wikipedia.org/wiki/Single_responsibility_principle).

If you're considering implementing an interaction that performs more than one logical activity (i.e. checks if the button is visible and then clicks on it if is), consider implementing separate interactions for separate responsibilities and composing them together using a [task](handbook/design/tasks.html).
