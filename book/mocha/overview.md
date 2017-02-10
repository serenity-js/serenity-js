# Working with Mocha
 
[Mocha](mochajs.org) is a popular JavaScript test framework, most often used for unit and integration
testing. 
However, Mocha's lightweight syntax and excellent support for executing asynchronous test scenarios,
combined with the power of Serenity/JS, make it a good choice for writing functional acceptance tests
that can either drive the development of new systems or quickly provide a safety net around the legacy ones.

The most basic test scenario is just this:

```typescript
describe('a feature', () => {
    it('has some behaviour')
});
```

So how can we use it in practice? Let's find out!

## Prerequisites

Please make sure that you have the [required tools installed](./prerequisites.md) 
and [dependencies added](./installation.md) to your project.
That Protractor is configured to [use the `'mocha'` dialect](./configuration.md#mocha) 
and you have a [`tsconfig.json` file in place](./configuration.md#typescript).

## Directory Structure

The typical directory structure of a Serenity/JS and Mocha project often looks like in the listing below.

:bulb: **PRO TIP**: In the below example, both the application code (`src`) 
and the test code (`spec`) live in the same repository.
Having both the production and the test code base in the same place is beneficial as it encourages both developers
and testers to keep the test scenarios up to date with the application features.

```
├── features                  <- Acceptante tests
│   └── ...
├── spec                      <- Test sources
│   ├── screenplay              <- Screenplay-related code: Tasks, Actors, etc.
│   │   └── ...
│   └── ...                     <- Unit tests, integration tests, etc.
├── src                       <- Application sources
│   └── ...
├── target                    <- Test execution artifacts
│   └── site
│       └── serenity              <- Serenity BDD JSON and HTML reports 
├── package.json              <- Node.js project file
├── protractor.conf.js        <- Protractor configuration
└── tsconfig.json             <- TypeScript configuration
```

Mocha test scenarios are typically stored under a directory called `spec` (as in _executable specifications_), 
next to the `src`, where the application sources live.

However, since Mocha can be used for both unit and functional acceptance testing, you might want to separate the
two concerns and place the acceptance tests under `features`, 
to mimic the [already familiar to you](../cucumber/automation.md#directory-structure) Cucumber structure
and avoid accidentally executing one type of tests when in fact you meant the other.

Alternatively, if you like to keep all the executable specifications in one place, you could also
introduce an additional level of nesting under `spec`, such as `spec/features`, but it's entirely up to you.
To keep it simple and consistent, let's assume that the acceptance tests for either Mocha or Cucumber should 
be placed under `features`.

## Example

To demonstrate how Mocha and Serenity/JS can be used together, we'll use the same example you know from when 
we [talked about Cucumber](../cucumber/overview.md#example) earlier on.
This way you'll see the same test scenario in a context of two different test dialects.

The example draws inspiration from "BDD in Action" by John Ferguson Smart, author of Serenity BDD.

<ul class="books">
<li><a class="image" href="https://www.amazon.co.uk/BDD-Action-Behavior-driven-development-lifecycle/dp/161729165X/ref=as_li_ss_il?ie=UTF8&qid=1486260747&sr=8-1&keywords=BDD+in+action&linkCode=li2&tag=janmolakcom-21&linkId=3c3a42bc27eefe55fec30572d6f8ec23" target="_blank"><img border="0" src="http://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=161729165X&Format=_SL160_&ID=AsinImage&MarketPlace=GB&ServiceVersion=20070822&WS=1&tag=janmolakcom-21" ></a><img src="https://ir-uk.amazon-adsystem.com/e/ir?t=janmolakcom-21&l=li2&o=2&a=161729165X" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /></li>
</ul>

As you might recall, the feature definition that our imaginary team has arrived at looked like this:

```gherkin
Feature: Earning Frequent Flyer points on domestic flights                                  (1)

  In order to encourage travellers to book with Flying High Airlines more frequently        (2)
  As the Flying High sales manager                                                          (3)
  I want travellers to earn Frequent Flyer points when they fly with us on domestic flights (4)

  Scenario: Earning standard points from an Economy flight                                  (5)
  
    Given the flying distance between London and Paris is 344 km                            (6)
      And I am a standard Frequent Flyer member
     When I fly from London to Paris                                                        (7)
     Then I should earn 172 points                                                          (8)
     
  Scenario: Earning extra points in Business class

    Given the flying distance between London and Paris is 344 km
      And I am a standard Frequent Flyer member
     When I fly from London to Paris in Business class
     Then I should earn 344 points      
     
  # and so on
```

Even though it looks simple on the surface, this short feature file captures quite a lot of information:
1. the **name of the feature** 
2. the **business goal** of the feature
3. who the main **stakeholder** is
4. the **actors** whose behaviour the Flying High Airlines want to influence
5. the **title** of the scenario
6. any **preconditions** that need to be satisfied 
7. **action under test**
8. **expected outcome**

So how do we capture _all of it_ in _this_?

```typescript
describe('a feature', () => {
    it('has some behaviour')
});
```

As Cucumber places its focus on collaborative requirements discovery and Mocha on test automation, the vocabulary
and expressiveness of those two tools differ quite significantly.

Nevertheless, with a little help from Serenity/JS we can still make our tests 
[capture quite a lot of the domain knowledge](./automation.md).

{% include "../feedback.md" %}
