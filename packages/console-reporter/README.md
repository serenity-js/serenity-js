# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Console Reporter

The `@serenity-js/console-reporter` enables your test Serenity/JS test suite to report progress to the terminal.

### Installation

```
npm install --save-dev @serenity-js/core @serenity-js/console-reporter
```

#### Windows

If you're on Windows, consider using [Windows Terminal](https://github.com/microsoft/terminal) instead of `cmd.exe` to benefit from the colour output.

### Configuration

#### Programmatic configuration

```typescript
import { serenity } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';

serenity.setTheStage(
    new ConsoleReporter(),
);
```

#### Protractor

```javascript
// protractor.conf.js

const { ConsoleReporter } = require('@serenity-js/console-reporter'),

exports.config = {

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            new ConsoleReporter(),
        ]
    },

    // ...
}
```
