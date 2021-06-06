const
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { ArtifactArchiver } = require('@serenity-js/core'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'spec/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            new SerenityBDDReporter(),
            ConsoleReporter.withDefaultColourSupport(),
        ]
    },

    jasmineNodeOpts: {
        requires: [
            'ts-node/register',
        ],
        helpers: [
            'spec/config/*.ts'
        ]
    },
};
