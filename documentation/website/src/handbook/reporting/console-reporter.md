---
title: Console Reporter
layout: handbook.hbs
cta: cta-share
---
# Console Reporter

[`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html), available as part of the [`@serenity-js/console-reporter`](/modules/console-reporter) module, writes text-based reports to your computer terminal.

The reporter supports colour schemes for both light and dark terminals.

<figure>
![Report produced by `ConsoleReporter`](/handbook/reporting/images/console-reporter.png)
    <figcaption><span>Example report produced by [`ConsoleReporter`](/modules/console-reporter)</span></figcaption>
</figure>

## Installation

To install the module, run the following command in your computer terminal:

```bash
npm install --save-dev @serenity-js/{core,console-reporter}
```

## Integration

[`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html) listens to [`DomainEvents`](/modules/core/identifiers.html#events) emitted by [`Actors`](/handbook/design/actors.html) and Serenity/JS test runner adapters.

<div class="mermaid">
graph TB
    A(["fas:fa-users Actors"])
    TRA(["fas:fa-plug Serenity/JS test runner adapter"])

    S["Serenity"]
    CR["ConsoleReporter"]
    T["fas:fa-terminal text report"]
    
    TRA -- notifies --> S
    A -- notify --> S

    S -- notifies --> CR
    CR -- prints --> T
    
    subgraph "core"
    S
    end

    subgraph "console-reporter"
    CR
    end

    class A socket
    class TRA socket
    
    click A "/handbook/design/actors.html"
    click S "/modules/core/class/src/Serenity.ts~Serenity.html"
    click CR "/modules/console-reporter"
</div>

## Usage

To use the [`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html), register it as one of the [`StageCrewMembers`](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html):

```typescript
import { configure } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ],
});
```

To learn more about the available configuration options, consult the [`ConsoleReporter` API docs](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html) and its [test suite](/modules/console-reporter/test-file/spec/stage/crew/console-reporter/ConsoleReporter.spec.ts.html).

You might also want to explore the [example projects](https://github.com/serenity-js/serenity-js/tree/master/examples).
