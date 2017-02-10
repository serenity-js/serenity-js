# Working with Cucumber 

Cucumber is a popular [collaboration tool](https://cucumber.io/blog/2014/03/03/the-worlds-most-misunderstood-collaboration-tool) 
used by many teams practicing 
[Behaviour-Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development)
to capture requirements in a form of concrete examples and executable specifications.

This guide focuses on just a small subset of features provided by Cucumber, 
and is limited to writing step definition libraries and executing test scenarios.

To learn more about Cucumber and Behaviour-Driven Development, please consider reading the below books,
or joining the [Serenity/Dojo](http://serenity.io).

"BDD in Action" by John Ferguson Smart, author of Serenity BDD, covers many of the reporting 
capabilities of the [Serenity BDD](http://serenity-bdd.info/#/documentation) library,
which is the reporting engine also used by Serenity/JS:

<ul class="books">
<li><a class="image" href="https://www.amazon.co.uk/Cucumber-Book-Behaviour-Driven-Development-Programmers/dp/1934356808/ref=as_li_ss_il?ie=UTF8&qid=1486260348&sr=8-1&keywords=cucumber+book&linkCode=li2&tag=janmolakcom-21&linkId=e98c5adba105c5329f8c6f54eb1b6856" target="_blank"><img border="0" src="http://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1934356808&Format=_SL160_&ID=AsinImage&MarketPlace=GB&ServiceVersion=20070822&WS=1&tag=janmolakcom-21" ></a><img src="https://ir-uk.amazon-adsystem.com/e/ir?t=janmolakcom-21&l=li2&o=2&a=1934356808" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /></li>
<li><a class="image" href="https://www.amazon.co.uk/BDD-Action-Behavior-driven-development-lifecycle/dp/161729165X/ref=as_li_ss_il?ie=UTF8&qid=1486260747&sr=8-1&keywords=BDD+in+action&linkCode=li2&tag=janmolakcom-21&linkId=3c3a42bc27eefe55fec30572d6f8ec23" target="_blank"><img border="0" src="http://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=161729165X&Format=_SL160_&ID=AsinImage&MarketPlace=GB&ServiceVersion=20070822&WS=1&tag=janmolakcom-21" ></a><img src="https://ir-uk.amazon-adsystem.com/e/ir?t=janmolakcom-21&l=li2&o=2&a=161729165X" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /></li>
</ul>

## Prerequisites

Please make sure that you have the [required tools installed](./prerequisites.md) 
and [dependencies added](./installation.md) to your project.
That Protractor is configured to [use the `'cucumber'` dialect](./configuration.md#cucumber) 
and you have a [`tsconfig.json` file in place](./configuration.md#typescript).

## Directory Structure

The typical directory structure of a Serenity/JS and Cucumber project looks like this:

```
├── features                  <- Feature specifications
│   ├── capability_1            <- Features delivering "Capability 1"
│   │   └── feature_A.feature     <- Scenarios related to some "Feature A"
│   ├── capability_2
│   │   ├── feature_B.feature
│   │   └── feature_C.feature
│   ├── step_definitions        <- Step Definition Libraries
│   │   └── ...
│   └── support                 <- Cucumber context
│       └── ...
├── src                       <- Application sources
│   └── ...
├── spec                      <- Test sources
│   ├── screenplay              <- Screenplay-related code: Tasks, Actors, etc.
│   │   └── ...
│   └── ...                     <- Unit tests, integration tests, etc.
├── target                    <- Test execution artifacts
│   └── site
│       └── serenity              <- Serenity BDD JSON and HTML reports 
├── package.json              <- Node.js project file
├── protractor.conf.js        <- Protractor configuration
└── tsconfig.json             <- TypeScript configuration
```

To better understand the purpose of each directory in the above listing, and how it relates 
to the [reporting capabilities](../overview/reporting.md) of Serenity/JS, let's consider the following example 
involving a fictional company - the Flying High Airlines (more on this example in 
["BDD in Action"](http://amzn.to/2kCmGbW)).

:bulb: **PRO TIP**: In the above example listing, both the application code (`src`) and the test code (`spec`) live in 
the same repository.
Having both the production and the test code base in the same place is beneficial as it encourages both developers
and testers to keep the test scenarios up to date with the application features.

### Example

Flying High Airlines would like to encourage traveller loyalty through some sort of a reward system. 
A Frequent Flyer Programme could enable the travellers to earn points whenever they book with the airline.
The points earned this way could be then spent on flight upgrades.

Let's look at how some of the _example scenarios_ illustrating the _features_ delivering this _capability_ 
could be formulated.

> _**Capabilities**_ don’t imply any particular implementation. 
For example, “the ability to book a flight” could be provided online, over the phone, or at counter at the airport.

In our example, the capability we want to enable is to let the travellers earn the Frequent Flyer points.
The name of the capability becomes the name of the directory under `features`:

```
├── features
│   ├── earning_frequent_flyer_points  
│   │   └── ...
│   ├── spending_frequent_flyer_points
│   │   └── ...
│   └── ...
└── ...
```

:bulb: **PRO TIP**: You might have noticed that the above directory structure differs from 
a [box-standard Cucumber implementation](https://github.com/cucumber/cucumber-js/tree/master/features)
as it allows you to group features by the capabilities they deliver.

This has several advantages:
- improved discoverability and understandability
- improved reporting - understanding what features deliver what capabilities enables you to better assess the [health 
and release readiness](./reporting.md) of your system.
 

> _**Features**_ are pieces of deliverable software functionality, 
such as an “Online Frequent Flyer account summary.” Features deliver the capabilities.

One of the features delivering the above capability could be for travellers to earn 
Frequent Flyer Points when they book domestic flights.

The description of a feature is stored in a `.feature` file, such as this one:

```gherkin
Feature: Earning Frequent Flyer points on domestic flights

  In order to encourage travellers to book with Flying High Airlines more frequently
  As the Flying High sales manager
  I want travellers to earn Frequent Flyer points when they fly with us on domestic flights
```

The `.feature` file is then stored under the directory describing the capability the feature delivers:
  
```
├── features
│   └── earning_frequent_flyer_points  
│       ├── earning_points_on_domestic_flights.feature
│       └── ...
└── ...
```
  
> _**Example Scenarios**_  illustrate how a feature works, 
such as “Account summary should display a list of recently earned points.”

Example scenarios are expressed using 
the [Given/When/Then syntax](https://github.com/cucumber/cucumber/wiki/Given-When-Then),
and stored together with the description of the feature in the `.feature` file:

```gherkin
Feature: Earning Frequent Flyer points on domestic flights

  In order to encourage travellers to book with Flying High Airlines more frequently
  As the Flying High sales manager
  I want travellers to earn Frequent Flyer points when they fly with us on domestic flights

  Scenario: Earning standard points from an Economy flight        # example scenario 1
  
    Given the flying distance between London and Paris is 344 km  # scenario steps
      And I am a standard Frequent Flyer member
     When I fly from London to Paris
     Then I should earn 172 points
  
  Scenario: Earning extra points in Business class                # example scenario 2

    Given the flying distance between London and Paris is 344 km
      And I am a standard Frequent Flyer member
     When I fly from London to Paris in Business class
     Then I should earn 344 points 

  # ... other scenarios illustrating the feature
```

If you were to [run the above scenarios](./execution.md) now, you'd notice that instead of executing the
automated tests, Cucumber tells you that the step definitions have not been implemented yet.
It'll however helpfully propose a starting point for the implementation:

```
1) Scenario: Earning standard points from an Economy flight - features/earning_frequent_flyer_points/earning_points_on_domestic_flights.feature:7
   Step: Given the flying distance between London and Paris is 344 km - features/earning_frequent_flyer_points/earning_points_on_domestic_flights.feature:8
   Message:
     Undefined. Implement with the following snippet:

       this.Given(/^the flying distance between London and Paris is (\d+) km$/, function (arg1) {
         // Write code here that turns the phrase above into concrete actions
         return 'pending';
       });
```

The [Serenity BDD report](../overview/reporting.md) will also mark those missing steps as "pending implementation":
 
![Pending steps](images/pending-steps.png)

Another thing that you'll find is that since we only have two scenarios illustrating the feature that delivers
the capability, both the capability and the feature are marked as "pending implementation":

![Pending capabilities](images/pending-capabilities.png)

Let's see how to [automate a Cucumber scenario now](./automation.md).

{% include "../_partials/feedback.md" %}