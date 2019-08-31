# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

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
