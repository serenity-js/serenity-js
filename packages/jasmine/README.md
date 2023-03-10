# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://matrix.to/#/#serenity-js:gitter.im)

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/main/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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
