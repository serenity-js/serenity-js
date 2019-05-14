# Serenity/JS

Serenity/JS is a node.js library designed to make acceptance and regression testing of modern web applications
faster, more collaborative and easier to scale.

Find out more at [serenity-js.org](http://serenity-js.org)!

## Serenity/JS Jasmine

The `@serenity-js/jasmine` module contains a [Jasmine reporter](https://jasmine.github.io/api/edge/Reporter.html)
that can be registered with the [Jasmine test runner](https://jasmine.github.io/)
to enable integration between Jasmine and Serenity/JS.

### Command line usage

```
jasmine --reporter=@serenity-js/jasmine
```

### Programmatic usage

```typescript
import serenityReporterForJasmine = require('@serenity-js/jasmine');

jasmine.getEnv().addReporter(serenityReporterForJasmine);
```
