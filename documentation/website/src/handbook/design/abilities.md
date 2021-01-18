---
title: Abilities
layout: handbook.hbs
---
# Abilities

An "ability" is one of the five building blocks of the [Screenplay Pattern](/handbook/design/screenplay-pattern.html).
It's what enables
the [actor](/handbook/design/actors.html) to interact with the system under test.

In more technical terms, the [`Ability`](/modules/core/class/src/screenplay/Ability.ts~Ability.html)
is an implementation of [the adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern).
An "ability" is a thin wrapper around a lower-level, interface-specific client such as a web browser driver, a HTTP client, a database client and so on, that you'd call from an [interaction](/handbook/design/interactions.html) or [question](/handbook/design/questions.html) class to access the system under test.

<figure>
![The Screenplay Pattern](/handbook/design/images/the-screenplay-pattern.png)
    <figcaption><span>The Screenplay Pattern</span></figcaption>
</figure>

## Implementing Abilities

Consider the [`BrowseTheWeb`](/modules/protractor/class/src/screenplay/abilities/BrowseTheWeb.ts~BrowseTheWeb.html) ability from the [`@serenity-js/protractor`](/modules/protractor) module:

```typescript
export class BrowseTheWeb implements Ability {

    static using(browser: ProtractorBrowser): BrowseTheWeb {
        return new BrowseTheWeb(browser);
    }

    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    constructor(private readonly browser: ProtractorBrowser) {
    }

    locate(locator: Locator): ElementFinder {
        return this.browser.element(locator);
    }

    // rest omitted for brevity
}
```

In order to enable the actor to `BrowseTheWeb`, we'd give it an instance of said ability, linked with the lower-level client - in this case `protractor.browser`:

```typescript
import { Actor } from '@serenity-js/protractor';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

const actor = Actor.named('Abby').whoCan(BrowseTheWeb.using(protractor.browser));
```

So how would our actor make use of their newly acquired ability? That's what [interactions]((/handbook/design/interactions.html) are for!

Let's take the below, _much simplified_, version of the original [`Click`](/modules/protractor/class/src/screenplay/interactions/Click.ts~Click.html) interaction, where `BrowseTheWeb` is used to locate the element of interest and perform the `.click()`:

```typescript
import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { Locator } from 'protractor';

const Click = {
    onElement: (locator: Locator) =>
        Interaction.where(`#actor clicks on the ${ target }`, actor => {
            return BrowseTheWeb.as(actor).locate(this.locator).click();
        }),
}
```

With the interaction in place, we can tell the actor to perform the click as part of their [interaction flow](/handbook/design/actors.html),
and therefore indirectly invoke their ability to `BrowseTheWeb`:

```typescript
actor.attemptsTo(
    Click.onElement(by.css('button')),
)
```

If you're wondering why you'd want to create a wrapper around the lower-level client you could just call directly from an [interaction]((/handbook/design/interactions.html), think about all the opportunities having a dedicated ability class presents:
- an ability can expose an API simpler than the one provided by the client you're using (i.e. see how [`BrowseTheWeb`](/modules/protractor/class/src/screenplay/abilities/BrowseTheWeb.ts~BrowseTheWeb.html) simplifies the API of the [Protractor](https://www.protractortest.org/#/) `browser`)
- since [actors](/handbook/design/actors.html) are effectively stateless, abilities can be used to store any state (i.e. see how [`TakeNotes`](modules/core/class/src/screenplay/abilities/TakeNotes.ts~TakeNotes.html) can be used to store answers to [questions](/handbook/design/questions.html) asked during the test)
- abilities can map client-specific errors to [more informative ones](/handbook/design/errors.html), that Serenity/JS can also [report on better](/handbook/reporting/) (i.e. see how [`CallAnApi`](/modules/rest/class/src/screenplay/abilities/CallAnApi.ts~CallAnApi.html) maps the [various kinds](/modules/rest/file/src/screenplay/abilities/CallAnApi.ts.html) of [Axios](https://www.npmjs.com/package/axios) errors)

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong> This is a simplified implementation of the `Click` interaction that
    doesn't account for the many quirks of the Protractor API and is intended for demonstration purposes only. Please use the original [`Click`](/modules/protractor/class/src/screenplay/interactions/Click.ts~Click.html) in your tests instead.</p></div>
</div>
