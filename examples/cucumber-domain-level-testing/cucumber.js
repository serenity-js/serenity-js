module.exports = {
    default: [
        "--require-module 'ts-node/register'",
        "--format '@serenity-js/cucumber'",
        "--require './features/step_definitions/*.steps.ts'",
        "--require './features/support/setup.ts'",
    ].join(' '),
};
