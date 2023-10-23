function profile(name, options) {
    return {
        [name]: {
            requireModule: [ 'ts-node/register' ],
            format: [ `message:target/${ name }.events.ndjson` ],
            ...options
        }
    }
}

module.exports = {
    default: "--require-module 'ts-node/register' --format '@serenity-js/cucumber'",
    ...profile('pending-steps', {
        paths: [`./features/pending-steps.feature`],
        require: [ `./features/step_definitions/pending.steps.ts` ],
    }),
    ...profile('ambiguous-steps', {
        paths: [`./features/ambiguous-steps.feature`],
        require: [ `./features/step_definitions/ambiguous.steps.ts` ],
    }),
    ...profile('undefined-steps', {
        paths: [`./features/undefined-steps.feature`],
    }),
    ...profile('outlines', {
        paths: [`./features/outlines.feature`],
        require: [ `./features/step_definitions/outlines.steps.ts` ],
    }),
    ...profile('hooks', {
        paths: [`./features/hooks.feature`],
        require: [ `./features/step_definitions/hooks.steps.ts` ],
    }),
    ...profile('error-steps', {
        paths: [`./features/error-steps.feature`],
        require: [ `./features/step_definitions/error.steps.ts` ],
    }),
};
