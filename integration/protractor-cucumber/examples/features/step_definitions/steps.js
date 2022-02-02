const
    { configure, StreamReporter } = require('@serenity-js/core'),
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { Given } = require('@cucumber/cucumber');

configure({
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
    ],
})

Given('a passing step', () => {

});

Given('a failing step', () => {
    throw new Error('step failed');
});
