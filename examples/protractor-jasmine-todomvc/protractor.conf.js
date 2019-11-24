const
    path = require('path'),
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { ArtifactArchiver } = require('@serenity-js/core'),
    { Photographer, TakePhotosOfInteractions } = require('@serenity-js/protractor'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    // seleniumAddress: 'http://localhost:9515',

    allScriptsTimeout: 11000,

    specs: [ 'spec/**/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            Photographer.whoWill(TakePhotosOfInteractions),
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

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=800,600',
                // '--headless',
            ],
        },
    },
};
