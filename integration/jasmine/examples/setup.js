const
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { serenity, DebugReporter } = require('@serenity-js/core');

serenity.setTheStage(
    new ChildProcessReporter(),
    new DebugReporter(),
);
