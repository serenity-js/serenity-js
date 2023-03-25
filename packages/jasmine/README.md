# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Jasmine

[`@serenity-js/jasmine`](https://serenity-js.org/modules/jasmine) contains a [Jasmine reporter](https://jasmine.github.io/api/edge/Reporter.html)
you register with [Jasmine test runner](https://jasmine.github.io/)
to enable integration between Jasmine and Serenity/JS.

### Installation

To install this module, run the following command in your computer terminal:
```console
npm install --save-dev @serenity-js/{core,jasmine}
```

Learn more about [integrating Serenity/JS with Jasmine](https://serenity-js.org/handbook/integration/serenityjs-and-jasmine.html)

### Command line usage

```
jasmine --reporter=@serenity-js/jasmine
```

### Programmatic usage

```typescript
import serenityReporterForJasmine = require('@serenity-js/jasmine');

jasmine.getEnv().addReporter(serenityReporterForJasmine);
```
