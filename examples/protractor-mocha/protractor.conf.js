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
        runner: 'mocha',
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            new SerenityBDDReporter(),
            ConsoleReporter.forDarkTerminals(),
        ]
    },

    // Retrying failed scenarios also works in combination with restarting the browser:
    // restartBrowserBetweenTests: true,

    mochaOpts: {
        require: [
            'ts-node/register',
        ],
        retries: 2
    },
};
