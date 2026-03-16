module.exports = {
    default: [
        "--require-module 'tsx'",
        "--format '@serenity-js/cucumber'",
        "--require './features/step_definitions/*.steps.ts'",
        "--require './features/support/setup.ts'",
    ].join(' '),
};
