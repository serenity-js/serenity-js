# The Stage

The Stage is the central place where the action of a test scenario takes place, and where the actors perform
their activities.

The stage can be instantiated using the `serenity.callToStageFor(cast: Cast)` method, 
which requires you to provide an object representing the custom cast of actors, appropriate for your domain:
 
```typescript
import { serenity } from 'serenity-js';

let stage = serenity.callToStageFor(/* custom cast */);
```

Where the custom `Cast` instantiates the actors based on their name:
 
[import:'cast', lang-typescript](../../packages/serenity-js/src/serenity/stage/stage.ts)

## Instantiating the actors

In many cases, the system under test exposes only one interface with which the test scenarios will interact - 
the web interface, for example.

If there's no need for variability amongst the actors, it's often enough to define the custom `Cast` inline:

```typescript
import { serenity } from 'serenity-js';
import { protractor } from 'protractor';
import { Actor, BrowseTheWeb } from 'serenity-js/lib/screenplay-protractor'

let stage = serenity.callToStageFor({
    actor: name => Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser)),
});
```

However, many more heterogeneous systems expose additional interfaces - REST APIs, messaging queues, batch processing
servers that require a file to be uploaded via FTP and so on.

In those scenarios, it's more convenient to have a designated class responsible for instantiating the actors, such
as this one:


```typescript
import { Cast } from 'serenity-js/lib/serenity/stage'
import { Actor, BrowseTheWeb } from 'serenity-js/lib/screenplay-protractor'

import { protractor } from 'protractor';

// some custom, project-specific abilities
import { Authenticate, InteractWithTheAPI } from './abilities'

export class Bloggers implements Cast {
    actor(name: string): Actor {
        switch(name) {
            case 'Maria':
                return Actor.named(name).whoCan(
                    InteractWithTheAPI.using('some-authentication-token')
                );
            case 'Wendy': 
            case 'William':
            default:
                return Actor.named(name).whoCan(
                    BrowseTheWeb.using(protractor.browser),
                    Authenticate.using(name, 'P@ssw0rd1'),
                );
        }
    }
}
```

And then:

```typescript
import { serenity } from 'serenity-js';

// project-specific actors
import { Bloggers } from './bloggers';

let stage = serenity.callToStageFor(new Bloggers());
```

## Working with the actors

Once the `Stage` is set up, you can retrieve an actor by their name:

```typescript
let wendy = stage.theActorCalled('Wendy');
```

In a typical [Mocha](../mocha/readme.md) test, you'd see:

```typescript
import { serenity } from 'serenity-js';

describe('Wendy can edit an article that', () => {
    
    const stage = serenity.callToStageFor(new Bloggers());
    
    it('is pending correction', () => stage.theActorCalled('Wendy').attemptsTo(
        /* tasks related to editing an article */
    ));    
})
```

> Calling an actor to the stage puts them in the spotlight.

When you instantiate an actor using `stage.theActorCalled(name)` the `Stage` will remember the last actor you worked with. 
This way you can work with them again without having to use local variables and state.

This feature is particularly useful when working with [Cucumber](../cucumber/readme.md) as it helps 
to keep the step definition libraries and "The World" clean, as we can instantiate
the actor in the first step of the scenario, and then simply reuse it in subsequent steps:

```typescript
this.Given(/^.*that (.*) started working with the Admin Panel$/, function(name: string) {
    return this.stage.theActorCalled(name).attemptsTo(              // instantiate
    );        
});

this.When(/^s?he picks the first article that's pending correction$/, function() {
    return this.stage.theActorInTheSpotlight().attemptsTo(          // retrieve
    );
});

this.Then(/^s?he should be able to edit it$/, function() {
    return this.stage.theActorInTheSpotlight().attemptsTo(          // retrieve again
    );
});
```

{% include "../feedback.md" %}