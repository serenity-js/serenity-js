# Retrofitting

In the most basic scenario, Serenity/JS can act as an integration layer between the Protractor 
test runner and either of the Cucumber or Mocha test frameworks.

Using Serenity/JS as a drop-in replacement of 
the [`cucumber-protractor-framework`](https://github.com/mattfritz/protractor-cucumber-framework/)
or the `mocha framework adapter` that [ships with Protractor](https://github.com/angular/protractor/tree/master/lib/frameworks)
enables you to:
- Run your tests in parallel and still get the aggregated test reports.
- Enhance your test reports with screenshots of your app's UI without any additional plugins.
- Fix some common problems related to Cucumber/WebDriver 
ControlFlow synchronisation and inaccurate reporting with just a single config change.
- Try the [Screenplay Pattern](../../design/screenplay-pattern.md) 
in some part of your project while keeping your other tests working as they used to.
This way you minimise the risk of disrupting the work of your team while improving your tool set.

To use Serenity/JS as an integration layer between Protractor {{ book.package.peerDependencies.protractor }} and Cucumber or Mocha, 
execute the below terminal command in your project directory to install the `serenity-js` module and save it as a `devDependency`
in your `package.json` file:

``` bash
$> npm install serenity-js --save-dev
```

With the `serenity-js` module installed, you can update your 
[Protractor configuration file](./configuration.md)
to include:

```javascript
exports.config = {
    framework: 'custom',
    frameworkPath: require.resolve('serenity-js'), 
    // ...
}
```

Serenity/JS detects whether to use Cucumber or Mocha based on the presence 
of [`cucumberOpts`](cucumber.md) 
or [`mochaOpts`](mocha.md), respectively.
If you prefer, you can tell Serenity/JS which test framework you'd like to use explicitly too:

```javascript
exports.config = {
    framework: 'custom',
    frameworkPath: require.resolve('serenity-js'),
    
    serenity: {
        dialect: 'cucumber'     // or 'mocha'
    }
    // ...
}
```

That's it! You can execute your tests the same way you used to.

Now you can learn more about the [configuration options](./configuration.md) supported by 
[`serenity-mocha`](mocha.md) and 
[`serenity-cucumber`](cucumber.md) adapters and
running the tests using their respective test frameworks, or [configure the reporting](reporting.md) to convert
the intermediary JSON reports produced by `serenity-js` to HTML.
 
{% include "../_partials/feedback.md" %}