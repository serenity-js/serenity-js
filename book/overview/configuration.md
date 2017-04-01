# Configuration

Serenity/JS can be configured using the Protractor 
[configuration file](https://github.com/angular/protractor/blob/master/lib/config.ts) - `protractor.conf.js`,
which then becomes the first argument of the Protractor command line test runner you invoke to execute the tests:

```bash
protractor ./protractor.conf.js
```

Configuration of the `ts-node` module and the TypeScript compiler is [explained below](#TypeScript).

## Serenity/JS Protractor Framework

To make Protractor aware of Serenity/JS, make sure that the `protractor.conf.js` file defines the `framework` and 
the `frameworkPath` as per the below:

```javascript
exports.config = {
    // Framework definition - tells Protractor to use Serenity/JS
    framework: 'custom',
    frameworkPath: require.resolve('serenity-js')
}
```

## Cucumber 

To use Serenity/JS with Cucumber, two more parameters need to be added to the configuration:
- `specs` - which tells Cucumber where your `.feature` files are located,
- `cucumberOpts` - which defines [Cucumber-specific configuration](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md),
such as where the step definitions are, or what compiler to use.

When Serenity/JS sees the `cucumberOpts` parameter, it also makes an informed guess that it is the Cucumber 
dialect that you want to be using in your test scenarios (although you can [configure that explicitly](#serenityjs---dialect) too):

```javascript
exports.config = {
    
    // Framework definition - tells Protractor to use Serenity/JS
    // ... (see above)
    
    specs: [ 'features/**/*.feature' ],
    
    cucumberOpts: {
        require:    [ 'features/**/*.ts' ], // loads step definitions
        format:     'pretty',               // enable console output
        compiler:   'ts:ts-node/register'   // interpret step definitions as TypeScript
    }
}
```

Please note that even though the configuration above tells Cucumber to use a TypeScript transpiler to interpret 
the step definitions (`compiler: 'ts:ts-node/register'`), it still allows for steps defined in JavaScript to be included
also (see [mixed mode](#mixed-mode)):

```javascript
    cucumberOpts: {
        require:    [           // loads step definitions:
            'features/**/*.ts', // - defined using TypeScript    
            'features/**/*.js'  // - defined using JavaScript
         ], 
        format:     'pretty',               // enable console output
        compiler:   'ts:ts-node/register'   // interpret step definitions as TypeScript
    }
```

Learn more about [writing and executing test scenarios with Cucumber](./cucumber.md).

## Mocha

As with Cucumber, to use Mocha specify the below two parameters:
- `specs` - which tells Mocha where to find your spec files,
- `mochaOpts` - which defines [Mocha-specific configuration](https://mochajs.org/#mochaopts),
and same as the `mocha.opts` file, it tells Mocha how to display 
the progress of the execution of your tests execution in the terminal 
and what syntax you want to use in your tests. See [Mocha documentation](https://mochajs.org/) for more details.

When Serenity/JS sees the `mochaOpts` parameter, it also makes an informed guess that it is the Mocha 
dialect that you want to be using in your test scenarios 
(which can be [configured explicitly](#serenityjs---dialect) too):

```javascript
exports.config = {
    
    // Framework definition - tells Protractor to use Serenity/JS
    // ... (see above)
    
    specs: [ 'spec/**/*.spec.ts' ],
    
    mochaOpts: {
        ui:       'bdd',                  // use the describe/it syntax (default: 'bdd').
        compiler: 'ts:ts-node/register'   // interpret step definitions as TypeScript
    }
}
```

:bulb: **PRO TIP**: Mocha's programmatic API does not accept the `compiler` option, and because of that the above configuration 
would not work with Protractor's [built-in Mocha adapter](https://github.com/angular/protractor/tree/master/lib/frameworks). 
Serenity/JS interprets the `compiler` configuration and loads the required module using syntax consistent with Cucumber's
and Mocha's command line interface.

As with Cucumber, note that even though the configuration above tells Mocha to use a TypeScript transpiler to interpret 
the spec files (`compiler: 'ts:ts-node/register'`), it works perfectly fine with specs defined in JavaScript too
(see [mixed mode](#mixed-mode)):


```javascript
exports.config = {
    
    // Framework definition - tells Protractor to use Serenity/JS
    // ... (see above)
    
    specs: [                    // load specs defined in:
        'spec/**/*.spec.ts',    // - TypeScript
        'spec/**/*.spec.js'     // - JavaScript
     ],
    
    mochaOpts: {
        ui:       'bdd',
        compiler: 'ts:ts-node/register'   // interpret step definitions as TypeScript
    }
}
```

Learn more about [writing and executing test scenarios using Cucumber](./cucumber.md).

## Serenity/JS - dialect

Serenity/JS detects whether you want to use Cucumber or Mocha based on the presence of `cucumberOpts` or `mochaOpts`,
respectively.

You can skip the automatic detection and define which dialect to use by specifying the `dialect` option 
in the `serenity` section of your configuration:

```javascript
exports.config = {
    
    serenity: {
        dialect: 'cucumber',  // or 'mocha'
    }
    // ...
}
```

## Stage Crew Members

The [Stage Crew Members](https://github.com/jan-molak/serenity-js/blob/master/packages/serenity-js/src/stage_crew.ts) listen on
and act upon the [domain events](https://github.com/jan-molak/serenity-js/blob/master/packages/serenity-js/src/serenity/domain/events.ts)
emitted during the test scenario execution.

Your default stage crew consists of:
- the `Photographer`, who takes a screenshot of the UI when an actor performs a task
- the `SerenityBDDReporter`, who produces Serenity BDD-compatible JSON reports

```javascript
// Optional, imports Serenity/JS Stage Crew Members
const crew = require('serenity-js/lib/stage_crew');

exports.config = {
    
    // Framework definition - tells Protractor to use Serenity/JS
    // ... (see above)
    
    serenity: {
        crew:    [
            crew.serenityBDDReporter(),
            crew.photographer()
        ],
        
        dialect: 'cucumber',  // or 'mocha'
    },
    
    // Test framework-specific configuration... (see above)
    
    // Other protractor-specific configuration... (see below)
}
```

Stage Crew configured via the `serenity.crew` property overrides the defaults, so for example if you wanted to disable
screenshots altogether, you can let the `Photographer` go and only leave the `SerenityBDDReporter`:

```javascript
serenity: {
    crew:    [
        crew.serenityBDDReporter(),
    ]
}
```

If you wanted to see what tasks are being performed, but were not interested in producing the report, you could hire 
the `ConsoleReporter` instead of the default Crew   :

```javascript
serenity: {
    crew:    [
        crew.consoleReporter(),
    ]
}
```

:bulb: **PRO TIP**: You can define your own Stage Crew Members to produce custom reports or integrate 
with your infrastructure.

## Timeouts

To ensure that [the contract with Protractor](https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#future-requirements)
is respected, Serenity/JS needs to wait for any Protractor plugins to process the results of a finished scenario
before the next scenario can be executed. The same synchronisation needs to occur if Serenity/JS is configured 
to capture screenshots, as those too might take some time to be stored to disk, 
especially when the web browser is hosted on a remote grid.
 
To handle those situations, a test scenario will wait for a signal to start - a [stage cue](https://en.wikipedia.org/wiki/Cue_%28theatrical%29#Types),
up to the maximum of `serenity.stageCueTimeout` milliseconds: 

```javascript
serenity: {
   stageCueTimeout: 30 * 1000   // up to 30 seconds by default
}
```

To learn how to configure other timeouts, consult the below sections of relevant manuals:
- [Protractor Timeouts](https://github.com/angular/protractor/blob/master/docs/timeouts.md)
- [Cucumber Timeouts](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/timeouts.md)
- [Mocha Timeouts](https://mochajs.org/#timeouts)

## Protractor

The rest of the configuration can be defined as per 
the [Protractor documentation](https://github.com/angular/protractor/blob/master/lib/config.ts).

## Mixed mode

Thanks to the fact that TypeScript is a _super-set_ of JavaScript, valid JavaScript code is, in fact, valid TypeScript, 
just without the benefit of type definitions.

What this means is that Cucumber can use step definitions and Mocha can execute specs where some of them are implemented 
in TypeScript and some in JavaScript, yet they can still co-exist in the same codebase without a problem.

This fact is incredibly useful when introducing Serenity/JS and TypeScript to an existing JavaScript codebase,
because it allows for gradual and safe adoption of Serenity/JS, rather tha a big-bang re-write.

# TypeScript

The [`ts-node` module](./installation.md#typescript-execution-environment-and-repl-for-nodejs), 
the one responsible for interpreting the TypeScript sources in-memory, 
uses the [same configuration](https://www.typescriptlang.org/docs/handbook/compiler-options.html) file
as the regular TypeScript compiler.

The easiest thing to do to make sure that the TypeScript code you write is transpiled correctly 
is to place a `tsconfig.json` file with the below contents 
in the root directory of your Node.js project, the same place where the `protractor.conf.js` file lives:

[include](../../examples/todomvc-protractor-cucumber/tsconfig.json)

{% include "../feedback.md" %} 