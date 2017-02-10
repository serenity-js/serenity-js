# Executing Mocha Scenarios

Mocha scenarios are executed using the Protractor command line interface,
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
     "e2e-scenario": "protractor ./protractor.conf.js --mochaOpts.grep"
   },
   "// other properties": "..."
 }
 ```

Then issue the following terminal command:

```
$> npm run e2e-scenario "Name or partial name of the scenario you want to execute"
```

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