const
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { serenity, StreamReporter } = require('@serenity-js/core');

serenity.configure({
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
    ]
});
