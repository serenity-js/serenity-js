module.exports = {
    default: "--publish-quiet --require-module 'ts-node/register' --format '@serenity-js/cucumber' --require './features/step_definitions/domain-level.steps.ts' --require './features/support/setup.ts'"
};
