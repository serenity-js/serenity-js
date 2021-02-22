# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

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
