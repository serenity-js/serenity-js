const
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { configure, StreamReporter } = require('@serenity-js/core');

configure({
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
    ]
});
