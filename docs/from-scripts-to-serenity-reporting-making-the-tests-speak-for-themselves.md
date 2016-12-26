# From Scripts to Serenity: Making the tests speak for themselves

In the [last tutorial](from-scripts-to-serenity-getting-started-writing-what-you-would-like-to-read.md)
we looked at the basics of writing acceptance tests that are focused, readable and free of
[accidental complexity](https://en.wikipedia.org/wiki/No_Silver_Bullet).
Those characteristics make even the most sophisticated test suites easy to understand, maintain and extend.
We've also introduced the concepts behind the [Screenplay Pattern](screenplay-pattern.md),
an innovative new way of designing automated test systems.

In this article, we'll look at ways of making the results of the tests visible and accessible
to everyone on the team. Including the guys sponsoring our projects.

## Recording the interactions

:bulb: **PRO TIP:** If you like learning by doing, you can continue to work on the code we wrote as part of
the [last tutorial](from-scripts-to-serenity-getting-started-writing-what-you-would-like-to-read.md)
or grab a fresh copy
from the [`1-first-scenario-implemented`](https://github.com/jan-molak/serenity-js-getting-started/tree/1-first-scenario-implemented)
branch.

```
$> git clone https://github.com/jan-molak/serenity-js-getting-started
$> cd serenity-js-getting-started
$> git checkout 1-first-scenario-implemented
```

To help Serenity/JS produce those narrative,
illustrated reports that anyone on the team can read and understand we first need to tell the library
a bit more about the life cycle of the scenarios we execute.

To do this, let's register the Serenity/JS Notifier in the `features/cucumber.hooks.ts`:

```typescript
// features/cucumber.hooks.ts

import { protractor } from 'protractor';
import * as serenity from 'serenity-js/lib/serenity-cucumber';

export = function () {

    this.registerListener(serenity.scenarioLifeCycleNotifier());

    serenity.synchronise(this, protractor.browser.driver.controlFlow());
};
```

With the Notifier in place, we now need something to receive the notifications and produce the report.
That's the role of the `SerenityProtractorPlugin`, which we can register in the Protractor configuration file:

``` javascript
// protractor.conf.js

exports.config = {

    // ...

    plugins: [{
        path: 'node_modules/serenity-js/lib/serenity-protractor/plugin'
    }],

    // ...
};
```

When you run the tests again:

```
$> npm test
```

you'll notice that a new directory was created, with a JSON file in it:

```
$> ls target/site/serenity

704ff39d93ac1503afb0ba8a5ad03c71.json
```

Serenity/JS produces one JSON file per each test scenario executed.
Those JSON files are then analysed and aggregated by Serenity BDD in a separate step
to produce a HTML report. We'll look into the details of this process next.

## From JSON to HTML

The HTML report is much more than just a sum of its parts.
The aggregate contains of course the detailed results of each test scenario,
but it can also contain information about the capabilities and features of your system that the tests have covered
and more importantly - the capabilities and features that the tests have not covered yet.

Since the HTML report presents a much richer perspective on the test results,
its generation is more demanding computationally.
For this reason, it happens separately from the test execution phase.
However, there are other practical advantages on top the positive performance implications of this design:

1. Since the JSON reports produced by Serenity/JS are compatible with the ones produced
by [Serenity BDD for Java](http://serenity-bdd.info/), you can have Serenity/JS and Serenity BDD produce the intermediate
JSON reports independently and then aggregate them together to have a single report covering several projects
1. Because Serenity/JS produces a JSON file per test scenario, you can shard the execution of tests to multiple
servers, collect the intermediate reports and aggregate them at a later stage
of a [Continuous Delivery pipeline](https://en.wikipedia.org/wiki/Continuous_delivery)

### Managing dependencies

The component responsible for analysing and aggregating the intermediate reports is Serenity BDD itself,
which is a Java library and therefore requires a [Java Runtime Environment](https://java.com/en/download/) 7 or newer.

To verify that you have Java 7 or newer installed, run:

```
$> java -version

java version "1.8.0_25"
Java(TM) SE Runtime Environment (build 1.8.0_25-b17)
Java HotSpot(TM) 64-Bit Server VM (build 25.25-b02, mixed mode)
```

To make invoking a Java program from Node.js easier,
we'll need a new dependency - [`serenity-cli`](https://www.npmjs.com/package/serenity-cli):

```
$> npm install serenity-cli --save-dev
```

:bulb: **PRO TIP:** Even though `serenity-cli` is a command line program, we're installing it in the scope
of the current project rather than globally.
This way we can make the dependency on the package explicit and its version under control,
which wouldn't be possible with a [globally installed module](https://docs.npmjs.com/cli/install).

### Scripting the installation

`serenity-cli` delegates all the analysis and aggregation work to the Serenity BDD `jar`,
which means that it needs to download it first.
The downloading of the `jar` is a one time process as the `jar` gets cached in the `node_modules` directory.
This behaviour is similar to how Protractor
[manages the WebDriver `jar`](https://github.com/angular/webdriver-manager)
as well as other browser-specific driver binaries, such as [`chromedriver`](https://sites.google.com/a/chromium.org/chromedriver/).

To make sure that the `jar` is downloaded when needed, add `"pretest": "serenity update"` to the `scripts`
section of the `package.json`:

``` json
// package.json

// ...

  "scripts": {
    "pretest": "serenity update",

    //...
  },

// ...
```

The `pretest` is an [NPM script](https://docs.npmjs.com/misc/scripts), which will be invoked before the `npm test`
command is executed.

When you call `npm test` with the new script in place, you should see the output similar to the following:

```
$> npm test

info: Looks like you need the latest Serenity BDD CLI jar. Let me download it for you...
info: Downloaded to /Users/jan/serenity-js-getting-started/node_modules/serenity-cli/.cache/serenity-cli-0.0.1-rc.3-all.jar
```

### Scripting the reporting

With the Serenity BDD CLI `jar` in place, we can now use it to produce the aggregated report. To do this, let's add
another NPM script - `"report": "serenity run"`:

``` json
// package.json

// ...

  "scripts": {
    "pretest": "serenity update",
    "report":  "serenity run",

    //...
  },

// ...
```

We can now execute both scripts in a sequence to see the HTML report we've been waiting for:

```
$> npm test
```

```
$> npm run report
```

:bulb: **PRO TIP**: As opposed to `test` and `pretest`, `report` is not a [standard NPM script](https://docs.npmjs.com/misc/scripts).
You can invoke any custom scripts using the `npm run <script name>` syntax, which is what we just did.

The result of executing the `npm run report` is a static HTML page, generated under `target/site/serenity`.
Inside that directory you'll notice the `index.html` file, which opened in a web browser should present a report similar
to the one below:

![Serenity BDD Scenario Report with Interactions only](images/first_report.png)

### Starting fresh each time

In order to avoid having reports from previous test executions lying around, we need to make sure that
the `target` directory is empty before executing the suite.

To create the script that does it for us, install the [`rimraf` module](https://www.npmjs.com/package/rimraf):

```
$> npm install rimraf --save-dev
```

and define a `clean` script:

``` json
// package.json

// ...

  "scripts": {
    "clean":   "rimraf target",
    "pretest": "serenity update",
    "report":  "serenity run",

    //...
  },

// ...
```

Running `npm run clean` removes the `target` directory.

### Scripting the flow

Right now we can:
* execute the test suite and produce the intermediary JSON reports - `npm test`
* analyse the individual reports and produce an aggregated HTML report - `npm run report`
* remove the `target` directory, storing both JSON and HTML files before each test suite run - `npm run clean`

It would be much easier if instead of calling three separate commands we could just call one.
Thankfully, the [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) can help us with that:

```
$> npm install npm-failsafe --save-dev
```

:bulb: **PRO TIP**: We're using the `npm-failsafe` module instead of the more traditional `&&` and `||` operators.
Chaining the scripts using `script-1 && script-2` syntax won't execute `script-2` should `script-1`
fail - so we won't get the test report when a test fails, which is exactly when we need it the most.
Using `script-1 || script-2` executes both scripts even if the first one fails,
but returns an [exit code of success](http://tldp.org/LDP/abs/html/exit-status.html) even when the tests fail,
which confuses [Continuous Integration](https://en.wikipedia.org/wiki/Continuous_integration) servers.

With `npm-failsafe` installed we can modify our `scripts` a bit:

``` json
// package.json

// ...

  "scripts": {
    "clean":   "rimraf target",
    "pretest": "serenity update",
    "report":  "serenity run",
    "test":    "failsafe clean protractor report",

    //...
  },

// ...
```

Now running `npm test` will:
* download the Serenity BDD CLI `jar` and cache it if it's needed
* clean the `target` directory
* execute the tests
* generate the HTML report

## Narrative reports

Opening the HTML report and navigating to the details of our test scenario should present a view similar to the one below:

![First Serenity BDD Report](images/scenario_report_interactions.png)

As you can see, each Cucumber step is presented together with all the interactions that have contributed to making it happen.
That's very useful, but the Interactions are pretty low-level and all speak using the vocabulary
of the solution domain ("clicking buttons" and "entering values into fields") rather than the business domain
("adding items to the list", "paying with a default credit card" and so on). Let's improve that now.

Head back to the `Start` Task we have created as part of our last tutorial and add a `@step` annotation,
giving the Task a more descriptive name:

```typescript
// src/screenplay/tasks/start.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Open, step } from 'serenity-js/lib/screenplay-protractor';     // imports the @step

import { AddATodoItem } from './add_a_todo_item';

export class Start implements Task {

    static withATodoListContaining(items: string[]) {
        return new Start(items);
    }

    @step('{0} starts with a Todo List containing #items')      // Gives the Task a more descriptive name
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Open.browserOn('/examples/angularjs/'),
            ...this.addAll(this.items)
        );
    }

    constructor(private items: string[]) {
    }

    private addAll(items: string[]): Task[] {
        return items.map(item => AddATodoItem.called(item));
    }
}
```

:bulb: **PRO TIP**: `@step` annotation can process tokens and those can be defined as:
* `{0}`, where `0` means the 0-th argument the `performAs` method was invoked with - the `actor` in our case
* `#member`, where `member` means any private or public field or method of the Task object - here it's the `items` field

Now, repeat the process with the `AddATodoItem` task:

``` typescript
// src/screenplay/tasks/add_a_todo_item.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Enter, step } from 'serenity-js/lib/screenplay-protractor';    // imports the @step

import { protractor } from 'protractor';

import { TodoList } from '../ui/todo_list';

export class AddATodoItem implements Task {

    static called(itemName: string) {
        return new AddATodoItem(itemName);
    }

    @step('{0} adds a Todo Item called #itemName')              // Gives the Task a more descriptive name
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Enter.theValue(this.itemName)
                .into(TodoList.What_Needs_To_Be_Done)
                .thenHit(protractor.Key.ENTER)
        );
    }

    constructor(private itemName: string) {
    }
}
```

And run the test suite again to see that the scenario report now also mentions all the business-level tasks:
```
$> npm test
```

![Serenity BDD Scenario Report with Business Tasks](images/scenario_report_tasks.png)

## An image is worth a thousand words

In the beginning I promised that the reports will not only be narrative but also illustrated.

The design of the Serenity/JS library uses a [system metaphor](http://www.extremeprogramming.org/rules/metaphor.html)
of a stage performance (the name of the [Screenplay Pattern](screenplay-pattern) is a prime example of that).
This means that in order to add pictures to the reports we need to invite a Photographer to join the Stage Crew.

To do this, change the configuration of the Serenity Protractor Plugin to assign the Stage Crew:

``` javascript
// protractor.conf.js

var crew = require('serenity-js/lib/stage_crew');

// ...

exports.config = {

// ...

    plugins: [{
        path: 'node_modules/serenity-js/lib/serenity-protractor/plugin',
        crew: [
            crew.jsonReporter(),
            crew.photographer()
        ]
    }],

// ...
};
```

A Photographer will take a photo of whichever Actor is in the Spotlight, as soon as the Actor performs an activity
of interest to the Photographer.

In order to have the Actor in a Spotlight though, we need to have the Stage first,
so let's make the following changes to the `todo_user.steps.ts`:

``` typescript
# features/step_definitions/todo_user.steps.ts

import { Serenity } from 'serenity-js';
import { Actor, BrowseTheWeb } from 'serenity-js/lib/screenplay-protractor';
import { protractor } from 'protractor';

import { Start } from '../../src/screenplay/tasks/start';
import { AddATodoItem } from '../../src/screenplay/tasks/add_a_todo_item';
import { TodoListItems } from '../../src/screenplay/questions/todo_list_items';

import { listOf } from '../../src/text';
import { expect } from '../../src/expect';

export = function todoUserSteps() {

    let stage = Serenity.callToStageFor({
        actor: (name) => Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser))
    });

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string) => {
        return stage.theActorCalled(name).attemptsTo(
            Start.withATodoListContaining(listOf(items))
        );
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, (itemName: string) => {
        return stage.theActorInTheSpotlight().attemptsTo(
            AddATodoItem.called(itemName)
        )
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items: string) => {
        return expect(stage.theActorInTheSpotlight().toSee(TodoListItems.Displayed))
            .eventually.deep.equal(listOf(items))
    });
};
```

As you can see above, instead of instantiating the `Actor` directly, we delegate this job to the `Stage` class:
* `stage.theActorCalled(name)` creates a new `Actor` via the
`(name) => Actor.named(name)...` function and remembers it
as the "Actor in the Spotlight"
* `stage.theActorInTheSpotlight()` retrieves the last active `Actor`

We'll look in detail into how the Stage works in the future tutorials when we talk about multi-actor testing.

For now, since we have both the Stage and the Stage Crew assigned to it, we can again run the tests:

```
$> npm test
```

This time however you should be able to see a screenshot accompanying each Interaction and Task:

![Serenity BDD Scenario Report with Screenshots](images/scenario_report_screenshots.png)

## Summary

By organising the code of our automated acceptance testing system
to follow the [Screenplay Pattern](screenplay-pattern.md)
and adding `@step` annotations to the business-level tasks, we managed to generate meaningful, narrative and illustrated
reports that can form part of the [living documentation](https://en.wikipedia.org/wiki/Specification_by_example)
of our application and help facilitate better communication between the members of the project team.

## Next

Next tutorial coming soon!

---

### Your feedback matters!

Do you find Serenity/JS useful? Give it a star! &#9733;

Found a typo or a broken link? Raise [an issue](https://github.com/jan-molak/serenity-js/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

If you're interested in a commercial license, training, support or bringing your team up to speed with modern software
development practices - [please get in touch](https://janmolak.com/about-the-author-e45e048661c#.kxqp57qn9).

[![Analytics](https://ga-beacon.appspot.com/UA-85788349-2/serenity-js/docs/from-scripts-to-serenity-reporting-making-the-tests-speak-for-themselves.md?pixel)](https://github.com/igrigorik/ga-beacon)