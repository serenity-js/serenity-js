const
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { serenity, StreamReporter } = require('@serenity-js/core');

serenity.setTheStage(
    new ChildProcessReporter(),
    new StreamReporter(),
);
