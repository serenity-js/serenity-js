const
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { ArtifactArchiver } = require('@serenity-js/core'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            new SerenityBDDReporter(),
            ConsoleReporter.forDarkTerminals(),
            // new StreamReporter(),
        ]
    },

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/setup.ts',
        ],
        requireModule: ['ts-node/register'],
    },
};
