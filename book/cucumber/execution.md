# Executing Cucumber Scenarios

Cucumber scenarios are executed using the Protractor command line interface,
and since it's [installed as a local module](../overview/installation.md),
we need to define an [npm script](https://docs.npmjs.com/misc/scripts) to access it.

## Executing the entire test suite

To execute your entire test suite, configure an npm script called, for example, `e2e` in your `package.json`:

 ```json
 {
   "scripts": {
     "e2e": "protractor ./protractor.conf.js"
   },
   "// other properties": "..."
 } 
 ```

Then issue the following terminal command:

```
$> npm run e2e
```

## Executing a specific scenario

To execute a specific scenario, configure an npm script called, for example, 
`e2e-scenario` in your `package.json`:


 ```json
 {
   "scripts": {
     "e2e-scenario": "protractor ./protractor.conf.js --cucumberOpts.name"
   },
   "// other properties": "..."
 }
 ```

Then issue the following terminal command:

```
$> npm run e2e-scenario "Name of the scenario you want to execute"
```

{% include "../known-issues/protractor-5.0.0-cucumberOpts-disableChecks.html" %}

## Executing a group of scenarios using tags

Often you'll have a number of scenarios defined across several different `.feature` files that you'd like to execute together.

To facilitate this, the scenarios can be tagged: 

```gherkin
Feature: Using tags
 
  @smoketest @fast 
  Scenario: first example
 
  @smoketest @slow
  Scenario: second example
 
  @smoketest @fast @performance
  Scenario: third example
 
  @performance @fast
  Scenario: fourth example
```

If you only wanted to execute the "fast smoketest" scenarios, but not the "performance" ones you could do this
by either re-configuring Protractor, or using the command line interface.

### Configure Protractor

The [cucumber configuration](../overview/configuration.md#cucumber) object can have an optional parameter called `tags`,
where you can define what tags you're interested in (and which ones you're not, by negating them with `~`): 

```javascript
    cucumberOpts: {
        require:    [ 'features/**/*.ts' ],  
        format:     'pretty',               
        compiler:   'ts:ts-node/register',  
        tags:       [ '@smoketest', '@fast', '~@performance']
    }
```

### Use the command line

To execute scenarios tagged with one specific tag using the command line, add the below script to your project configuration:

```json
{
  "scripts": {
    "e2e-tag": "protractor ./protractor.conf.js --cucumberOpts.tags"
  },
  "// other properties": "..."
}
```

Then issue the following terminal command to include a single tag:

```
$> npm run e2e-tag @smoketest
```

Or, to specify multiple tags, add the below script to the `package.json`:

```json
{
  "scripts": {
    "e2e": "protractor ./protractor.conf.js"
  },
  "// other properties": "..."
}
```

and run: 

```
npm run e2e -- --cucumberOpts.tags=@smoketest --cucumberOpts.tags=@fast --cucumberOpts.tags=~@performance
```

Tags can also be [logically joined](https://github.com/cucumber/cucumber/wiki/Tags) to cater for some of the more
sophisticated scenarios.

{% include "../known-issues/protractor-5.0.0-cucumberOpts-disableChecks.html" %}

## Result

If the `SerenityBDDReporter` is one of the registered 
[Stage Crew Members](../overview/configuration.md#stage-crew-members) (which it is by default), 
issuing the above commands should result in `json` and `png` files being
generated under `target/site/serenity`:

```
├── features                  <- Feature specifications
├── src                       <- Application soures
├── spec                      <- Test sources
├── target                    <- Test execution artifacts
│   └── site
│       └── serenity              <- Serenity BDD JSON and HTML reports 
├── package.json              <- Node.js project file
├── protractor.conf.js        <- Protractor configuration
└── tsconfig.json             <- TypeScript configuration
```

Please check the chapter on [reporting](../overview/reporting.md) 
to learn how to convert those intermediary reports into HTML.


{% include "../feedback.md" %}