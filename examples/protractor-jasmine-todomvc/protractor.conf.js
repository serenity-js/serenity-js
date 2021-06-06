const
    path = require('path'),
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { ArtifactArchiver } = require('@serenity-js/core'),
    { Photographer, TakePhotosOfFailures } = require('@serenity-js/protractor'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'spec/**/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
            ConsoleReporter.forDarkTerminals(),
        ]
    },

    jasmineNodeOpts: {
        requires: [
            'ts-node/register',
            path.resolve(__dirname, 'node_modules/@serenity-js/jasmine'),
        ],
        helpers: [
            'spec/config/*.ts'
        ]
    },
};
