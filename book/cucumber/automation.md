# Automating Cucumber Scenarios 

So that a [Cucumber scenario](./overview.md) can be [executed](./execution.md), 
the Given/When/Then steps expressed in plain language need to be somehow associated 
with the test automation code. 

Step Definition Libraries are the glue that brings those two together. 

## Location, location, location

Even though Cucumber doesn't particularly mind where the step definition libraries are located, 
many IDEs do.

So that you can benefit from the support of the tools you have, 
it's best to follow the convention and place the step definition libraries
under the `features/step_definitions` directory:

```
├── features
│   ├── capability_1
│   ├── capability_2
│   └── step_definitions        <- Step Definition Libraries
│       ├── traveller.steps.ts    <- one of the libraries
│       └── ...
└── ...
```

As you can see, the `step_definitions` directory is located at the same level as 
[directories describing the capabilities](./overview.md#directory-structure).

## Step Definition Library

A Step Definition Library is a file that provides the details on how a given scenario step should be executed.

The naming of the step definition library file is entirely up to you. It's also common to have more than one step library
in one project, as they can be sliced by a user role: `editor.steps.ts`, `reader.steps.ts`, `publisher.steps.ts`, 
by component: `basket.steps.ts`, `checkout.steps.ts` and so on.

Here, we're calling our library `traveller.steps.ts` to signify that it will contain step definitions related 
to a "traveller" role.

The typical structure of a step definition library looks like this:

```typescript
export = function travellerSteps() {                                            // (1)
    
    this.Given(/^.*the flying distance between (.*) and (.*) is (.*) km$/,      // (2)
        function(origin: string, destination: string, distance: number) {       // (3)
            return this.stage.theActorCalled(name).attemptsTo(                  // (4)
                // ... perform tasks related to test data setup
            );
        }
    );

    this.When(/^I fly from (.*) to (.*)$/, function(origin: string, destination: string) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            // ... perform tasks related to booking a flight
        );
    });
    
    // ...
}
```

There are several important details here, so let's walk through them step by step:
1. `export = function travellerSteps()` exports a default function, making Cucumber execute the `travellerSteps`
in the context of "Cucumber Hooks", so a call to `this.Given` is in fact a call to `cucumberHooks.Given` 
(OK, it's a [bit more sophisticated](https://github.com/cucumber/cucumber-js/blob/89b17cb33c3a7eda6cd58a405384661b8f2e2f11/src/support_code_library/builder.js#L50)
than that, see the [Support Code](#support-code) section below) 
2. `this.Given(regularExpression, stepDefinition)` registers a `stepDefinition` that will be executed whenever
the Cucumber parser finds a step matching the `regularExpression`
3. `function(origin: string, destination: string, distance: number) { ... }` defines the actual automation code
that will be executed for a given step. **Please note** that if the steps rely
on the [Cucumber context](#all-the-worlds-a-stage), it's important to define the step using
the `function` keyword rather than the shorter, fat arrow notation (`(argument) => {}`). This ensures
that `this` in `(4)` represents the context.
4. `return this.stage.theActorCalled(name).attemptsTo(...)` invokes one of the actors to perform the tasks associated
with a given step and returns a `Promise` when the actor is done with their work 
(see the [Screenplay Pattern](../../design/screenplay-pattern.md)).

You might have noticed several things:
- Serenity/JS encourages you to use Cucumber's `Promise` interface: `actor.attemptsTo(/*...*/)` returns 
a `Promise`, which is then passed on to Cucumber so that it knows that when the `Promise` is resolved, it can execute the
next step. The `Promise` interface is much more 
powerful and cleaner than the more traditional `callback` interface.
- The `Given` step calls `this.stage.theActorCalled(name)` and the `When` step calls `this.stage.theActorInTheSpotlight()`.
This is because `theActorCalled(name)` [initialises an actor](../design/stage.md#instantiating-the-actors) called by `name` 
and puts them in the "spotlight" (a.k.a. remembers which actor you've initialised last). 
`theActorInTheSpotlight()` simply [retrieves that actor](../design/stage.md#working-with-the-actors) from memory. 

One last thing is that we haven't defined `this.stage` anywhere, yet we're using it? Let's find out how this works!

## "All the world's a stage"

Cucumber's "context" is called "the World", and it's where the state of the [`Stage`](../design/stage.md) is stored, 
and where the `this.stage` property is initialised.

"The World" is traditionally defined in the `world.ts` file and stored under `features/support`:

```
├── features
│   ├── capability_1
│   ├── capability_2
│   ├── step_definitions        
│   └── support
│       └── world.ts        <- "The World"
└── ...
```

In order to initialise "The World" create a file with a default exported function, same as with a step library:

```typescript
import { serenity } from 'serenity-js';

import { protractor } from 'protractor';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

export = function() {

    // You can configure the default step timeout here too:
    this.setDefaultTimeout(60 * 1000);

    this.World = function() {
        // Any properties assigned to `this` will be available to step definitions:
        this.stage = serenity.callToStageFor(new Travellers());
    };
};

class Travellers implements Cast {
    actor(name: string): Actor {
        return Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
```

You might have noticed that the `Stage` is initialised using a custom `Cast` of `Actors`.

Since Serenity/JS doesn't know what you'd like your actors to do, nor what abilities they should have,
it expects you to provide a simple [factory](http://amzn.to/2kiQZ6v) 
it can invoke with the name of an actor coming from your test, expecting
an instantiated `Actor` back.  

[Learn more about the `Stage`](../design/stage.md).

## Support code

If you're curious how Cucumber loads all this support code, 
remember the chapter on [configuration](configuration.md#cucumber),
where we have configured Cucumber to load any TypeScript and JavaScript files it can find under the `features` directory:

```javascript
    cucumberOpts: {
        require:    [           // loads step definitions:
            'features/**/*.ts', // - defined using TypeScript    
            'features/**/*.js'  // - defined using JavaScript
        ], 
        format:     'pretty',               // enable console output
        compiler:   'ts:ts-node/register'   // interpret step definitions as TypeScript
    }
```

When Cucumber loads a file it checks if the file defines a default function:

 ```typescript
export = function () { 
    //... 
}
```

If the function exists, Cucumber executes it providing itself as `this`. 

That's why we can register the step definitions and the `World` constructor.

You can now give the actor some [Tasks](../design/screenplay-pattern.md#task) to perform
or find out how to [execute Cucumber scenarios](./execution.md).

{% include "../_partials/feedback.md" %}