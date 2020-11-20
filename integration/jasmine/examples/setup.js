const
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { configure, Duration, StreamReporter } = require('@serenity-js/core');

configure({
    cueTimeout: Duration.ofMilliseconds(500),
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
    ]
});
