<!-- ### 1.2.1 (2017-02-26) -->

#### Bug Fixes
- **serenity-protractor:** Custom configuration correctly overrides the defaults ([031a8ddc](https://github.com/jan-molak/serenity-js/commit/031a8ddc))

## 1.2.0 (2017-02-19)

#### Bug Fixes
- **core:** More meaningful reporting on TakeNotes and CompareNotes ([9aeefc57](https://github.com/jan-molak/serenity-js/commit/9aeefc57))

#### Features
- **serenity-protractor:** Interactions: Execute.asyncScript(), Execute.script() and Evaluate.script() ([0a4b08e2](https://github.com/jan-molak/serenity-js/commit/0a4b08e2))

## 1.1.0 (2017-02-11)

#### Features
- **serenity-protractor:** Support for Protractor 5.1.x ([a6d9eab3](https://github.com/jan-molak/serenity-js/commit/a6d9eab3))

## 1.0.0 (2017-02-10)

#### Bug Fixes
- **core:**
  - JSONReporter superseded by SerenityBDDReporter ([0b93ff0d](https://github.com/jan-molak/serenity-js/commit/0b93ff0d))
  - JSONObject interface definition should not reference the static `JSON` class ([ed4fabb6](https://github.com/jan-molak/serenity-js/commit/ed4fabb6))
- **deps:** Pegged Protractor to 5.0.x until backwards compatibility issues intrduced in 5.1 ([8c799972](https://github.com/jan-molak/serenity-js/commit/8c799972))
- **interactions:** `See` is no longer reported by default, as that polluted the report and triggere ([3b7efb81](https://github.com/jan-molak/serenity-js/commit/3b7efb81))
- **serenity-cucumber:** The `tags` parameter in `cucumberOpts` is now correctly typed as a list of strin ([abdeddad](https://github.com/jan-molak/serenity-js/commit/abdeddad))
- **serenity-mocha:** Pending scenarios with no steps are correctly marked as pending instead of passi ([a593a84d](https://github.com/jan-molak/serenity-js/commit/a593a84d))

#### Features
- **integration:** Stand-ins enable taking screenshots when there are no Actors on the Stage. ([786b3373](https://github.com/jan-molak/serenity-js/commit/786b3373))
- **screenplay:** The actor can now `TakeNotes` to assert on their contents later. ([ab368276](https://github.com/jan-molak/serenity-js/commit/ab368276), closes [#24](https://github.com/jan-molak/serenity-js/issues/24))
- **serenity:** SerenityProtractorFramework takes care of executing cucumber and mocha tests. ([6cf0197a](https://github.com/jan-molak/serenity-js/commit/6cf0197a))
- **serenity-mocha:**
  - A compiler can be registered as a configuration parameter ([02a0c6eb](https://github.com/jan-molak/serenity-js/commit/02a0c6eb))
  - Tests that timed out or failed with an exception are recognised as "Compromised" ([532fb86e](https://github.com/jan-molak/serenity-js/commit/532fb86e))
- **serenity-protractor:**
  - Serenity can auto-detect the appropriate test dialect ([c50a4bf7](https://github.com/jan-molak/serenity-js/commit/c50a4bf7))
  - SerenityProtractorFramework advises how to install a missing test runner. ([b6caf893](https://github.com/jan-molak/serenity-js/commit/b6caf893))

#### Breaking Changes
- JSONReporter is now superseded by a cleaner and more focused implementation -

SerenityBDDReporter, which better handles gathering results from tests executed in parallel.

 ([0b93ff0d](https://github.com/jan-molak/serenity-js/commit/0b93ff0d))
- SerenityProtractorPlugin is now removed in favour of the much more flexible SerenityProtractorFramework.

You can use the SerenityProtractorFramework instead of the `mocha` or the `protractor-cucumber-framework` modules
as it provides capabilities equivalent to those modules, and also enables an easy integration with Serenity/JS
as well as synchronisation with the WebDriver ControlFlow so that the test reports will show accurate timing.

To enable the framework, add the following configuration to your `protractor.conf.js` file:

``` javascript
exports.config = {
    framework: 'custom',

    frameworkPath: require.resolve('serenity-js'),
    serenity: {
        dialect: 'cucumber'     // or 'mocha'
    },

    specs: [ 'features/**/*.feature' ],

    cucumberOpts: {             // or 'mochaOpts'
    },
```

Both `cucumberOpts` and `mochaOpts` don't need to change as SerenityProtractorFramework can act as a drop-in replacement.

Please see the [`todomvc-protractor-cucumber`](examples/todomvc-protractor-cucumber) and [`todomvc-protractor-mocha`](examples/todomvc-protractor-mocha) example project for details.

BREAKING CHANGE: The `serenity` object should be used instead of the `Serenity` singleton to initialise
the stage and the actors.

Instead of:

``` typescript
import { Serenity } from 'serenity-js';

const stage = Serenity.callToStageFor(cast);
```

use:

``` typescript
import { serenity } from 'serenity-js';

const stage = serenity.callToStageFor(cast);
```

Tutorials and more documentation to follow shortly!

 ([6cf0197a](https://github.com/jan-molak/serenity-js/commit/6cf0197a))

### 0.10.5 (2017-01-26)

#### Bug Fixes
- **npm:** Cucumber-related types are exported using the ES5 syntax now ([dca8be0a](https://github.com/jan-molak/serenity-js/commit/dca8be0a))


### 0.10.4 (2017-01-26)

#### Bug Fixes
- **npm:** Serenity/JS compiles to ES5 instead of ES6 to fix issues with the module loader ([5a4c1d4d](https://github.com/jan-molak/serenity-js/commit/5a4c1d4d))
- **serenity-cucumber:** Cucumber generator steps are correctly recognised and synced ([4475c2cc](https://github.com/jan-molak/serenity-js/commit/4475c2cc))


### 0.10.3 (2017-01-22)

#### Bug Fixes
- **deps:** Updated shrinkwrap to include `co`, required by serenity-cucumber ([fefd26b3](https://github.com/jan-molak/serenity-js/commit/fefd26b3))


### 0.10.2 (2017-01-22)

#### Bug Fixes
- **serenity-cucumber:** Cucumber data table and docstring steps are correctly reported ([053955df](https://github.com/jan-molak/serenity-js/commit/053955df), closes [#14](https://github.com/jan-molak/serenity-js/issues/14))

---

### Examples:

#### Data Tables

[Cucumber Data Tables](https://cucumber.io/docs/reference) are handy for passing a list of values to a step definition:

``` gherkin
  Scenario: Serenity/JS reports DataTable steps

    Given the following accounts:
      | name | email                  | twitter   |
      | Jan  | jan.molak@serenity.io  | @JanMolak |
      | John | john.smart@serenity.io | @wakaleo  |
```

and that's what they'll look like in your Serenity Report:

<img width="1029" alt="screen shot 2017-01-22 at 03 04 38" src="https://cloud.githubusercontent.com/assets/1089173/22179590/4d28b7d2-e050-11e6-99a3-ec86d7556fb8.png">

#### Doc Strings

[Doc Strings](https://cucumber.io/docs/reference) are handy for passing a larger piece of text to a step definition.

``` gherkin
  Scenario: Serenity/JS reports DocString steps

    Given an example.ts file with the following contents:
      """
      export const noop = (_) => _;
      export const sum  = (a, b) => a + b;
      """
```

Doc Strings are now reported too:

<img width="1029" alt="screen shot 2017-01-22 at 03 07 30" src="https://cloud.githubusercontent.com/assets/1089173/22179593/56c9d1a4-e050-11e6-8ecc-a7d6fb4ad361.png">


### 0.10.1 (2017-01-20)

#### Bug Fixes
- **ci:**
  - The release notes should be published correctly now ([8f0b4cfb](https://github.com/jan-molak/serenity-js/commit/8f0b4cfb))
  - Travis should be able to correctly test PRs ([9829726e](https://github.com/jan-molak/serenity-js/commit/9829726e), closes [#17](https://github.com/jan-molak/serenity-js/issues/17))
- **coverage:** Fix coverage reporting to include files not required from specs ([f40a8dc4](https://github.com/jan-molak/serenity-js/commit/f40a8dc4))
- **cucumber:** Add support for generators as step definitions ([30fd6528](https://github.com/jan-molak/serenity-js/commit/30fd6528), closes [#9](https://github.com/jan-molak/serenity-js/issues/9))
- **reporting:** JSON report is generated even if we couldn't capture a screenshot ([f230239e](https://github.com/jan-molak/serenity-js/commit/f230239e))

#### Features
- **mocha:** Support for running test scenarios with Mocha ([168713c7](https://github.com/jan-molak/serenity-js/commit/168713c7))
- **reporting:** AssertionError translated to a Test Failure, not a Test Error ([f3b30660](https://github.com/jan-molak/serenity-js/commit/f3b30660))
- **screenplay:** `See` - a screenplay-style way of executing assertions ([ade82e5a](https://github.com/jan-molak/serenity-js/commit/ade82e5a))
- **serenity-cucumber:** Support for generator steps ([f3fc2766](https://github.com/jan-molak/serenity-js/commit/f3fc2766), closes [#13](https://github.com/jan-molak/serenity-js/issues/13), [#15](https://github.com/jan-molak/serenity-js/issues/15))

### 0.8.1 (2016-12-30)

#### Bug Fixes
- **interactions:** Is.stale() renamed to Is.absent() to better reflect the purpose of the matcher ([8a42a822](https://github.com/jan-molak/serenity-js/commit/8a42a822))

## 0.8.0 (2016-12-29)

#### Bug Fixes
- **interactions:** Enter.theValue(v: string | number) ([c04c5e68](https://github.com/jan-molak/serenity-js/commit/c04c5e68))

#### Features
- **interactions:**
  - Active Wait - Screenplay-style equivalent of Protractor's `ExpectedConditions` ([3db8c8ec](https://github.com/jan-molak/serenity-js/commit/3db8c8ec), closes [#7](https://github.com/jan-molak/serenity-js/issues/7))
  - Clear.theValueOf(t: Target) clears an input field ([09712cd2](https://github.com/jan-molak/serenity-js/commit/09712cd2))
  - Passive Wait - Screenplay-style equivalent of Protractor's `browser.sleep()` ([efb1f0cb](https://github.com/jan-molak/serenity-js/commit/efb1f0cb))

#### Examples

There are two ways you can wait for things to happen in your test scenarios:

##### PassiveWait

To make your test wait using a `PassiveWait` (an equivalent of `browser.sleep()` in Protractor):

``` typescript
actor.attemptsTo(
  Wait.for(Duration.ofMillis(500)),        // we *assume* that the button will show up during 500ms
  Click.on(InboxNavigation.Compose_Button)
)
```

Please bear in mind that by using a `PassiveWait` in your test scenario, you're making an **assumption** that whatever the condition you're waiting for is, it will be met within the specified timeout. If this assumption turns out to be incorrect (because of the network being slow for instance), your test might result in [false negatives](https://en.wikipedia.org/wiki/False_positives_and_false_negatives). Please try to use `ActiveWait` instead as it's less prone to assumption-related issues ;-)

Why did I introduce `PassiveWait` then? Because it's useful with things such as CSS3 animations.

##### ActiveWait

To make your test wait using an `ActiveWait` (so actively polling the app until the condition is met):

``` typescript
actor.attemptsTo(
  Wait.until(InboxNavigation.Compose_Button, Is.clickable()),
  Click.on(InboxNavigation.Compose_Button)
)
```

To specify the maximum timeout:

``` typescript
actor.attemptsTo(
  Wait.upTo(Duration.seconds(10)).until(InboxNavigation.Compose_Button, Is.clickable()),
  Click.on(InboxNavigation.Compose_Button)
)
```

You might also want to check out the [`Is` class](https://github.com/jan-molak/serenity-js/blob/master/src/serenity-protractor/screenplay/interactions/wait.ts#L39) to see what conditions are already defined and find inspiration to write some of your own.

Hope you find the new features useful!
Jan

Many thanks to @npryce for suggesting to introduce the `Duration` class ✋ 

### 0.7.1 (2016-12-24)

#### Bug Fixes
- **spec:** Tests under ./spec and executed via ts-node; corrected the typings ([242db610](https://github.com/jan-molak/serenity-js/commit/242db610))


## 0.7.0 (2016-12-21)

#### Bug Fixes
- **typescript:** Corrected how a JS dependency is imported into TS code ([87c2d80d](https://github.com/jan-molak/serenity-js/commit/87c2d80d))

#### Features
- **interactions:** Multi-value Select interaction and question ([81fdb453](https://github.com/jan-molak/serenity-js/commit/81fdb453))


### 0.6.4 (2016-12-06)

#### Bug Fixes
- **dependencies:** Updated the shrinkwrap so that the new deps are included ([31fbd22d](https://github.com/jan-molak/serenity-js/commit/31fbd22d))


### 0.6.3 (2016-12-06)

#### Bug Fixes
- **cucumber:** Support callback style step definitions () ([4278968b](https://github.com/jan-molak/serenity-js/commit/4278968b), closes [#8](https://github.com/jan-molak/serenity-js/issues/8))


### 0.6.2 (2016-11-11)

#### Bug Fixes
- **protractor:** References to 'protractor/globals' changed to 'protractor' ([58b11253](https://github.com/jan-molak/serenity-js/commit/58b11253))


### 0.6.1 (2016-11-09)

#### Bug Fixes
- **protractor:** Moved protractor to peerDependencies ([ffd290bc](https://github.com/jan-molak/serenity-js/commit/ffd290bc), closes [#2](https://github.com/jan-molak/serenity-js/issues/2))


## 0.6.0 (2016-10-03)

#### Features
- **protractor:** Configurable Photographer ([558192da](https://github.com/jan-molak/serenity-js/commit/558192da))


## 0.5.0 (2016-09-23)

#### Features
- **screenplay:** WebElement Question ([3c5c3b0f](https://github.com/jan-molak/serenity-js/commit/3c5c3b0f))


### 0.4.1 (2016-09-19)

#### Bug Fixes
- **deps:** selenium-webdriver ships with serenity/js ([c310adfc](https://github.com/jan-molak/serenity-js/commit/c310adfc))


## 0.4.0 (2016-09-18)

#### Features
- **protractor:** You can `Select` a value and check the `SelectedValue` ([274cabca](https://github.com/jan-molak/serenity-js/commit/274cabca))


## 0.3.0 (2016-09-12)

#### Bug Fixes
- **Target:** `Target.of` works for Targets defined using the `by.id` locator ([e462f7a4](https://github.com/jan-molak/serenity-js/commit/e462f7a4))
- **reporting:** Every interaction shows up in the report ([961cdf19](https://github.com/jan-molak/serenity-js/commit/961cdf19))

#### Features
- **interactions:** BrowseTheWeb exposes `actions()` api, DoubleClick demonstrates it ([cf2d157a](https://github.com/jan-molak/serenity-js/commit/cf2d157a))


## 0.2.0 (2016-09-10)

#### Features
- **screenplay:** New Questions and Interactions ([abf86116](https://github.com/jan-molak/serenity-js/commit/abf86116))


## 0.1.0 (2016-09-08)

#### Features
- **npm:** First version of Serenity/JS is now available on NPM ([d6efac7c](https://github.com/jan-molak/serenity-js/commit/d6efac7c))
