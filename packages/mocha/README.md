# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Mocha

The `@serenity-js/mocha` module contains a reporter that can be registered with the [Mocha test runner](https://mochajs.org/) to enable integration between Mocha and Serenity/JS.

### Usage

Run Mocha with the `@serenity-js/mocha` reporter: 

```
mocha --reporter=@serenity-js/mocha
```

or add `@serenity-js/mocha` reporter in Mocha [configuration file](https://mochajs.org/#configuring-mocha-nodejs):

```yaml
# .mocharc.yml
reporter: '@serenity-js/mocha'

# ...other config
```

