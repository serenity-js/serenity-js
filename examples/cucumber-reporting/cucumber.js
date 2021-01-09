module.exports = {
    default: "--publish-quiet --require-module 'ts-node/register' --format '@serenity-js/cucumber' --require './features/step_definitions/*.steps.ts' --require './features/support/configure_serenity.ts'"
};
