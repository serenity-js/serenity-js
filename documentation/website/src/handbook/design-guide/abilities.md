---
title: Abilities
layout: handbook.hbs
---
# Abilities

In [the Screenplay Pattern](/handbook/design-guide/screenplay-pattern.html), the "ability" is what enables
the [actor](/handbook/design-guide/actors.html) to interact with the system under test.

In more technical terms, the "ability" is an implementation of [the adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern).
An "ability" is a thin wrapper around a lower-level, interface-specific client such as a web browser driver, a HTTP client, a database client and so on, that you'd call from an [interaction](/handbook/design-guide/interactions.html) or [question](/handbook/design-guide/questions.html) class to access the system under test.

![The Screenplay Pattern](/handbook/design-guide/images/the-screenplay-pattern.png)

Consider this, _much simplified_, implementation of the original [`Click`](/modules/protractor/class/src/screenplay/interactions/Click.ts~Click.html) interaction, using the [`BrowseTheWeb`](/modules/protractor/class/src/screenplay/abilities/BrowseTheWeb.ts~BrowseTheWeb.html) ability under the hood:

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

In order to enable the actor to use the above interaction, we'd give it an ability to `BrowseTheWeb`, linked with the lower-level client - in this case `protractor.browser`:

```typescript
import { Actor } from '@serenity-js/protractor';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

const actor = Actor.named('Abby').whoCan(BrowseTheWeb.using(protractor.browser));
```

Finally, we tell the actor to perform the interaction in their [interaction flow](/handbook/design-guide/actors.html):

```typescript
actor.attemptsTo(
    Click.onElement(by.css('button')),
)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong> This is a simplified implementation of the `Click` interaction that
    doesn't account for the many quirks of the Protractor API. Please use the original [`Click`](/modules/protractor/class/src/screenplay/interactions/Click.ts~Click.html) in your tests instead.</p></div>
</div>

If you're wondering why you'd want to create a wrapper around the lower-level client you could _just call_ directly from an [interaction]((/handbook/design-guide/interactions.html), think about all the other opportunities having a dedicated ability class presents:
- an ability can expose an API simpler than the one provided by the client you're using (i.e. see how [`BrowseTheWeb`](/modules/protractor/class/src/screenplay/abilities/BrowseTheWeb.ts~BrowseTheWeb.html) simplifies the API of the [Protractor](https://www.protractortest.org/#/) `browser`)
- since [actors](/handbook/design-guide/actors.html) are effectively stateless, abilities can be used to store any state (i.e. see how [`TakeNotes`](modules/core/class/src/screenplay/abilities/TakeNotes.ts~TakeNotes.html) can be used to store answers to [questions](/handbook/design-guide/questions.html) asked during the test)
- abilities can map client-specific errors to [more informative ones](/handbook/design-guide/errors.html), that Serenity/JS can also [report on better](/handbook/integration-guide/reporting.html) (i.e. see how [`CallAnApi`](/modules/rest/class/src/screenplay/abilities/CallAnApi.ts~CallAnApi.html) maps the [various kinds](/modules/rest/file/src/screenplay/abilities/CallAnApi.ts.html) of [Axios](https://www.npmjs.com/package/axios) errors)
