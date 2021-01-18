const
    path = require('path'),
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { ArtifactArchiver } = require('@serenity-js/core'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

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

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
                // '--headless',
            ],
        },
    },
};
